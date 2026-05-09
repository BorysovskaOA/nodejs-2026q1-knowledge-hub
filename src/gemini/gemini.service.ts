import {
  ContentListUnion,
  EmbedContentConfig,
  EmbedContentResponse,
  GenerateContentConfig,
  GenerateContentResponse,
  GoogleGenAI,
} from '@google/genai';
import { Injectable, Logger } from '@nestjs/common';
import {
  InternalServerError,
  ServiceUnavailableError,
} from 'src/core/exceptions/app-errors';
import {
  getJsonBySchemaFromOutput,
  getOutputFormatFromJsonSchema,
} from './utils/non-supported-json-formatting.util';
import {
  isApiKeyPermissionDenied,
  isInvalidApiKey,
  isTimeoutExceed,
  isTooManyRequestsToGemini,
  isUnavailable,
  isUnsupportedJsonFormat,
} from './utils/gemini-errors.uril';

class AIGenerationError extends Error {
  public readonly parsedError: Record<string, any>;

  constructor(parsedError: Record<string, any>) {
    super('AIGenerationError');

    this.parsedError = parsedError;
    Error.captureStackTrace(this, this.constructor);
  }
}

interface AiContentGenerationResponse<T = any> {
  response: T;
  tokensUsed: number | undefined;
}

@Injectable()
export class GeminiService {
  private embeddingOutputDimensionality = 768;
  private generateContentSupportJson = true;
  private genAi = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string,
  });
  private readonly logger: Logger;
  constructor() {
    this.logger = new Logger('GEMINI');
  }

  getEmbeddingsModelVectorSize() {
    return this.embeddingOutputDimensionality;
  }

  formatTextPart(text: string, role: 'user' | 'model' = 'user') {
    return {
      role: role,
      parts: [{ text: text }],
    };
  }

  async ask(
    question: string,
    config: GenerateContentConfig = {},
  ): Promise<AiContentGenerationResponse> {
    this.logger.debug({ question, config }, 'AI Question');

    if (this.generateContentSupportJson) {
      return this.askStringQuestion(question, config);
    }

    return this.askWithOutputFormat(question, config);
  }

  async askWithHistory(
    contents: ContentListUnion,
    config: GenerateContentConfig = {},
  ): Promise<AiContentGenerationResponse> {
    this.logger.debug({ contents, config }, 'AI Question');

    try {
      const response =
        await this.callWithErrorHandling<GenerateContentResponse>(
          this.askGenerativeModel(contents, config),
        );

      return this.getFormattedResponse(response, config);
    } catch (err) {
      if (!(err instanceof AIGenerationError)) throw err;

      throw new InternalServerError('Failed to generate content', {
        service: GeminiService.name,
        geminiError: err.parsedError,
      });
    }
  }

  async getEmbedding(text: string, config: EmbedContentConfig = {}) {
    const embeddingContents = { parts: [{ text }] };

    this.logger.debug({ embeddingContents, config }, 'AI embeddings');
    try {
      const response = await this.callWithErrorHandling<EmbedContentResponse>(
        this.askEmbeddingsModel(embeddingContents, config),
      );

      const { embeddings } = response;

      if (!embeddings || embeddings[0].values === undefined) {
        throw new InternalServerError('Error while creating embedding', {
          service: GeminiService.name,
          error: 'Empty embeddings',
          response,
        });
      }

      return embeddings[0].values;
    } catch (err) {
      if (!(err instanceof AIGenerationError)) throw err;

      throw new InternalServerError('Failed to create embedding', {
        service: GeminiService.name,
        geminiError: err.parsedError,
      });
    }
  }

  async getBatchEmbeddings(texts: string[], config: EmbedContentConfig = {}) {
    const embeddingsContents = texts.map((t) => ({ parts: [{ text: t }] }));

    this.logger.debug({ embeddingsContents, config }, 'AI embeddings');
    try {
      const response = await this.callWithErrorHandling<EmbedContentResponse>(
        this.askEmbeddingsModel(embeddingsContents, config),
      );

      const { embeddings } = response;

      if (!embeddings || embeddings.some((e) => e.values === undefined)) {
        throw new InternalServerError('Error while creating embeddings', {
          service: GeminiService.name,
          error: 'Empty embeddings',
          response,
        });
      }

      return embeddings.map((e) => e.values as number[]);
    } catch (err) {
      if (!(err instanceof AIGenerationError)) throw err;

      throw new InternalServerError('Failed to create embeddings', {
        service: GeminiService.name,
        geminiError: err.parsedError,
      });
    }
  }

  private async askGenerativeModel(
    contents: ContentListUnion,
    config: GenerateContentConfig = {},
  ) {
    return this.genAi.models.generateContent({
      model: `models/${process.env.GEMINI_MODEL as string}`,
      contents,
      config,
    });
  }

  private async askEmbeddingsModel(
    contents: ContentListUnion,
    config: EmbedContentConfig = {},
  ) {
    return this.genAi.models.embedContent({
      model: `models/${process.env.GEMINI_MODEL_EMBEDDING as string}`,
      contents: contents,
      config: {
        outputDimensionality: this.embeddingOutputDimensionality,
        ...config,
      },
    });
  }

  private async askStringQuestion(
    question: string,
    config: GenerateContentConfig = {},
  ): Promise<AiContentGenerationResponse> {
    try {
      const response =
        await this.callWithErrorHandling<GenerateContentResponse>(
          this.askGenerativeModel(question, config),
        );

      return this.getFormattedResponse(response, config);
    } catch (err) {
      if (!(err instanceof AIGenerationError)) throw err;

      if (isUnsupportedJsonFormat(err.parsedError)) {
        return await this.askWithOutputFormat(question, config);
      }

      throw new InternalServerError('Failed to generate content', {
        service: GeminiService.name,
        geminiError: err.parsedError,
      });
    }
  }

  private async askWithOutputFormat(
    question: string,
    config: GenerateContentConfig = {},
  ): Promise<AiContentGenerationResponse> {
    const exclude = ['responseMimeType', 'responseSchema'];
    const restConfig = Object.fromEntries(
      Object.entries(config).filter(([key]) => !exclude.includes(key)),
    );

    const newConfig =
      Object.keys(restConfig).length === 0 ? undefined : restConfig;

    this.logger.debug({ question, config }, 'AI Reformat');
    const { response, tokensUsed } = await this.askStringQuestion(
      `${question}\n${getOutputFormatFromJsonSchema(config?.responseSchema)}`,
      newConfig,
    );

    const formattedResponse = getJsonBySchemaFromOutput(
      response,
      config.responseSchema,
    );
    return { response: formattedResponse, tokensUsed };
  }

  private getFormattedResponse(
    response: GenerateContentResponse,
    config: GenerateContentConfig,
  ): AiContentGenerationResponse {
    this.logger.debug({ response: response.text }, 'AI Result');
    const tokensUsed = response.usageMetadata?.totalTokenCount;

    if (!response.text)
      throw new InternalServerError('Error while generating contnent with AI', {
        service: GeminiService.name,
        error: 'Empty response text',
        response,
      });

    if (config.responseSchema) {
      try {
        const parsedText = JSON.parse(response.text);
        return { response: parsedText, tokensUsed };
      } catch {
        throw new InternalServerError("Couldn't parse response from AI", {
          service: GeminiService.name,
          text: response.text,
        });
      }
    }

    return { response: response.text, tokensUsed };
  }

  private async callWithErrorHandling<T>(
    askModelPromise: Promise<T>,
  ): Promise<T> {
    try {
      return await askModelPromise;
    } catch (err: any) {
      let parsedError: Record<string, any>;
      try {
        parsedError = JSON.parse(err.message).error;
      } catch (error) {
        throw new ServiceUnavailableError(
          'Network error while processing with AI',
          {
            service: GeminiService.name,
            error: error,
            originalError: err.message,
          },
        );
      }

      if (isInvalidApiKey(parsedError) || isApiKeyPermissionDenied(parsedError))
        throw new InternalServerError(
          'Encontered authentication errors while processing with AI',
          {
            service: GeminiService.name,
            geminiError: parsedError,
          },
        );

      if (
        isTooManyRequestsToGemini(parsedError) ||
        isTimeoutExceed(parsedError) ||
        isUnavailable(parsedError)
      )
        throw new ServiceUnavailableError(
          'AI processing service is unavailable at the moment',
          {
            service: GeminiService.name,
            geminiError: parsedError,
          },
        );

      throw new AIGenerationError(parsedError);
    }
  }
}
