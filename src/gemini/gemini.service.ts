import {
  GenerateContentConfig,
  GenerateContentResponse,
  GoogleGenAI,
} from '@google/genai';
import { Injectable } from '@nestjs/common';
import { InternalServerError } from 'src/core/exceptions/app-errors';
import {
  getJsonBySchemaFromOutput,
  getOutputFormatFromJsonSchema,
} from './utils/non-supported-json-formatting.util';
import { isUnsupportedJsonFormat } from './utils/gemini-errors.uril';

const MAX_RETRIES = 2;

@Injectable()
export class GeminiService {
  private genAi = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string,
  });
  constructor() {}

  async ask(question: string, config?: GenerateContentConfig) {
    try {
      return await this.askGemini(MAX_RETRIES, question, config);
    } catch (err) {
      throw new InternalServerError(
        { service: GeminiService.name, error: err },
        'Error while generating with AI',
      );
    }
  }

  private async askGemini(
    retrieAllowed: number,
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
      const { error: parsedError } = JSON.parse(err.message);

      if (retrieAllowed <= 1) {
        throw err;
      }
      if (isUnsupportedJsonFormat(parsedError)) {
        return await this.retryWithOutputFormat(
          retrieAllowed - 1,
          question,
          config,
        );
      }

      throw err;
    }
  }

  private async retryWithOutputFormat(
    retriesAllowed: number,
    question: string,
    config: GenerateContentConfig = {},
  ) {
    const exclude = ['responseMimeType', 'responseSchema'];
    const restConfig = Object.fromEntries(
      Object.entries(config).filter(([key]) => !exclude.includes(key)),
    );

    const newConfig =
      Object.keys(restConfig).length === 0 ? undefined : restConfig;

    const response = await this.askGemini(
      retriesAllowed,
      `${question}\n${getOutputFormatFromJsonSchema(config?.responseSchema)}`,
      newConfig,
    );

    return getJsonBySchemaFromOutput(response, config.responseSchema);
  }

  private getFormattedResponse = (
    response: GenerateContentResponse,
    config: GenerateContentConfig,
  ) => {
    if (!response.text)
      throw new InternalServerError(
        {
          service: GeminiService.name,
          error: 'Empty response text',
          response,
        },
        'Error while generating with AI',
      );

    if (config.responseSchema) {
      try {
        return JSON.parse(response.text);
      } catch {
        throw new InternalServerError(
          { service: GeminiService.name, text: response.text },
          "Couldn't parse response from AI",
        );
      }
    }

    return response.text;
  };
}
