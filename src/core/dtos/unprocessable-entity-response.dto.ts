import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'UnprocessableEntityResponse' })
export class UnprocessableEntityResponseDto {
  @ApiProperty({ example: 422 })
  statusCode: number;

  message: string;

  @ApiProperty({ example: 'Unprocessable Entity' })
  error: string;
}
