import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'ValidationResponse' })
export class ValidationResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  message: {
    field: string;
    errors: string[];
  };

  @ApiProperty({ example: 'Bad Request' })
  error: string;
}
