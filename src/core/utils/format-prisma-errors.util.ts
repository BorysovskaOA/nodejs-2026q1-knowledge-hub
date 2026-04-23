import { Prisma } from '@prisma/client';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

export const formatUniqueConstraintError = (
  err: Prisma.PrismaClientKnownRequestError,
  statusCode: StatusCodes,
) => {
  const field = (err.meta as any)?.driverAdapterError?.cause?.constraint
    ?.fields?.[0];

  return {
    statusCode,
    error: getReasonPhrase(statusCode),
    message: [
      {
        field: field,
        errors: [`${field} already exist`],
      },
    ],
  };
};
