import { IsEnum, IsOptional } from 'class-validator';
import { ApiSchema } from '@nestjs/swagger';
import { SummarizeLength } from './constants';

@ApiSchema({ name: 'SummarizeArticleBody' })
export class SummarizeArticleDto {
  @IsEnum(SummarizeLength)
  @IsOptional()
  maxLength: SummarizeLength = SummarizeLength.medium;
}
