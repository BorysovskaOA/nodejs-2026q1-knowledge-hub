import { Injectable } from '@nestjs/common';
import { GenerateDto } from './models/generate.dto';
import { GenerateEntity } from './models/generate.entity';
import { GeminiService } from 'src/gemini/gemini.service';

import { AiMonitorService } from './ai.monitoring.service';

@Injectable()
export class AiService {
  constructor(
    private geminiService: GeminiService,
    private aiMonitorService: AiMonitorService,
  ) {}

  async generate(data: GenerateDto) {
    const start = Date.now();
    const { response, tokensUsed } = await this.geminiService.ask(data.prompt);

    const latency = Date.now() - start;
    this.aiMonitorService.track('generate', false, latency);
    this.aiMonitorService.trackTokensUsed('generate', tokensUsed);

    return new GenerateEntity({ content: response });
  }

  getStats() {
    return this.aiMonitorService.getStats();
  }
}
