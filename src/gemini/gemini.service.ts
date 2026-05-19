import {
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

@Injectable()
export class GeminiService {
  private genAi = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string,
  });
  private readonly logger = new Logger('GEMINI');
  constructor() {}

  async ask(question: string, config: GenerateContentConfig = {}) {
    this.logger.debug({ question, config }, 'Question');

    return this.askGemini(question, config);
  }

  private async askGemini(
    question: string,
    config: GenerateContentConfig = {},
  ) {
    let response: GenerateContentResponse;
    try {
      response = await this.genAi.models.generateContent({
        model: `models/${process.env.GEMINI_MODEL as string}`,
        contents: question,
        config,
      });

      return this.getFormattedResponse(response, config);
    } catch (err: any) {
      let parsedError: Record<string, any>;
      try {
        parsedError = JSON.parse(err.message).error;
      } catch (error) {
        throw new ServiceUnavailableError(
          'Network error while generating content',
          {
            service: GeminiService.name,
            error: error,
          },
        );
      }

      if (isUnsupportedJsonFormat(parsedError)) {
        return await this.retryWithOutputFormat(question, config);
      }

      if (isInvalidApiKey(parsedError) || isApiKeyPermissionDenied(parsedError))
        throw new InternalServerError(
          'Failed to generate content, authentication errors',
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
          'Content generation service is unavailable at the moment',
          {
            service: GeminiService.name,
            geminiError: parsedError,
          },
        );

      throw new InternalServerError('Failed to generate content', {
        service: GeminiService.name,
        geminiError: parsedError,
      });
    }
  }

  private async retryWithOutputFormat(
    question: string,
    config: GenerateContentConfig = {},
  ) {
    const exclude = ['responseMimeType', 'responseSchema'];
    const restConfig = Object.fromEntries(
      Object.entries(config).filter(([key]) => !exclude.includes(key)),
    );

    const newConfig =
      Object.keys(restConfig).length === 0 ? undefined : restConfig;

    this.logger.debug({ question, config }, 'Question reformated');
    const { response, tokensUsed } = await this.askGemini(
      `${question}\n${getOutputFormatFromJsonSchema(config?.responseSchema)}`,
      newConfig,
    );

    const formattedResponse = getJsonBySchemaFromOutput(
      response,
      config.responseSchema,
    );
    return { response: formattedResponse, tokensUsed };
  }

  private getFormattedResponse = (
    response: GenerateContentResponse,
    config: GenerateContentConfig,
  ) => {
    this.logger.debug({ response: response.text }, 'Question response');
    const tokensUsed = response.usageMetadata?.totalTokenCount;

    if (!response.text)
      throw new InternalServerError('Error while generating with AI', {
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
  };
}
