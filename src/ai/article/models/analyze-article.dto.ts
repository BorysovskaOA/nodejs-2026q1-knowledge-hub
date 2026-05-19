import { IsEnum, IsOptional } from 'class-validator';
import { ApiSchema } from '@nestjs/swagger';
import { AnalyzeTask } from './constants';

@ApiSchema({ name: 'AnalyzeArticleBody' })
export class AnalyzeArticleDto {
  @IsEnum(AnalyzeTask)
  @IsOptional()
  task: AnalyzeTask = AnalyzeTask.review;
}
