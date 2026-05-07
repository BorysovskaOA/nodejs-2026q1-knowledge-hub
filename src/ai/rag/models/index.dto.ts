import { IsArray, IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'RagIndexBody' })
export class RagIndexDto {
  @IsBoolean()
  @IsOptional()
  onlyPublished: boolean = true;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  articleIds: string[] = [];
}
