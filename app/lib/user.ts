'use server';
import { unstable_noStore as noStore } from 'next/cache';
import { User } from '@/app/types/User';
import prisma from '@/app/lib/prisma';

export const getUser = async (email: string): Promise<User | null> => {
  noStore();
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    return user;
  } catch (error) {
    throw new Error('Database Error: Failed to get user. error: ' + error);
  }
};
