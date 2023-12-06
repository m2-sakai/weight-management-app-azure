'use server';

import { auth, signIn, signOut } from '@/auth';
import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { UserSession } from '@/app/types/UserSession';
import prisma from '@/app/lib/prisma';

const CreateUser = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  height: z.string(),
  goal: z.string(),
});

export const getSession = async (): Promise<UserSession> => {
  const session = await auth();
  let userSession: UserSession = {
    expired: '',
    userName: '',
    email: '',
  };

  if (session && session.user) {
    userSession.expired = session.expires;
    if (session.user.name) userSession.userName = session.user.name;
    if (session.user.email) userSession.email = session.user.email;

    return userSession;
  } else {
    await signOut();
  }
  return userSession;
};

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', Object.fromEntries(formData));
  } catch (error) {
    if ((error as Error).message.includes('CredentialsSignin')) {
      return 'CredentialSignin';
    }
    throw error;
  }
}

export async function createAccount(prevState: string | undefined, formData: FormData) {
  const validatedFields = CreateUser.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    height: formData.get('height'),
    goal: formData.get('goal'),
  });

  if (!validatedFields.success) {
    console.error(validatedFields.error);
    return 'FailedSignIn';
  }

  const id = uuidv4();
  const { name, email, password, height, goal } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const heightNum = Number(height);
  const goalNum = Number(goal);
  try {
    await prisma.user.create({
      data: {
        id: id,
        name: name,
        email: email,
        height: heightNum,
        password: hashedPassword,
        goal: goalNum,
      },
    });
  } catch (error) {
    return 'FailedSignIn';
  }

  redirect('/top');
}
