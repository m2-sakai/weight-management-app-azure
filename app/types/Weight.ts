import { Prisma } from '@prisma/client';

export type Weight = {
  userId: string;
  weight: Prisma.Decimal;
  date: string;
};
