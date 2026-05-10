import { STATUS_CODES } from 'http';
import { ApiResponseOptions } from '@nestjs/swagger';

export function GeneralExceptionResponse(status: number): ApiResponseOptions {
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

export function ExtendedExceptionResponse(status: number): ApiResponseOptions {
  return {
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: status },
        error: { type: 'string', example: STATUS_CODES[status] || 'Error' },
        message: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string' },
              errors: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
      },
    },
    description: STATUS_CODES[status],
  };
}
