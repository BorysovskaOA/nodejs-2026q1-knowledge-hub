import { Prisma } from '@prisma/client';

export const formatUniqueConstraintError = (
  err: Prisma.PrismaClientKnownRequestError,
) => {
  const field = (err.meta as any)?.driverAdapterError?.cause?.constraint
    ?.fields?.[0];

  return { [field]: [`${field} already exist`] };
};
