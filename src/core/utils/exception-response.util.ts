import { STATUS_CODES } from 'http';
import { ApiResponseOptions } from '@nestjs/swagger';

export function ExceptionResponse(status: number): ApiResponseOptions {
  return {
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: status },
        message: { type: 'string', example: STATUS_CODES[status] || 'Error' },
      },
    },
    description: STATUS_CODES[status],
  };
}
