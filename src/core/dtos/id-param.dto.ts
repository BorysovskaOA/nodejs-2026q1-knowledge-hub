import { IsNotEmpty, IsUUID } from 'class-validator';

export class IdParamDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
