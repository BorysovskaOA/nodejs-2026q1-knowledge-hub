import { Prisma } from '@prisma/client';

const PrismaErrorCode = {
  UniqueConstraint: 'P2002',
} as const;

export const isUniqueConstraint = (err: unknown) => {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === PrismaErrorCode.UniqueConstraint
  );
};
