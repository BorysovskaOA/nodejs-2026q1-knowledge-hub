import { Injectable } from '@nestjs/common';
import { GenerateDto } from './models/generate.dto';
import { GenerateEntity } from './models/generate.entity';
import { GeminiService } from 'src/gemini/gemini.service';

import { AiMonitoringService } from './monitoring/ai.monitoring.service';

@Injectable()
export class AiService {
  constructor(
    private geminiService: GeminiService,
    private aiMonitorService: AiMonitoringService,
  ) {}

  async generate(data: GenerateDto) {
    const { response, tokensUsed } = await this.geminiService.ask(data.prompt);

    this.aiMonitorService.trackTokensUsedForContentGeneration(
      'ai/generate',
      tokensUsed,
    );

    return new GenerateEntity({ content: response });
  }
}
