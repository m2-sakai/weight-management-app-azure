import { Prisma } from '@prisma/client';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  height: Prisma.Decimal;
  goal: Prisma.Decimal;
};
