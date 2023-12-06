'use server';
import { unstable_noStore as noStore } from 'next/cache';
import { Weight } from '@/app/types/Weight';
import prisma from '@/app/lib/prisma';
import { getUser } from '@/app/lib/user';

export async function fetchWeightsForCalender(email: string, month: number) {
  noStore();
  try {
    const user = await getUser(email);
    if (user !== null) {
      // カレンダーは前後月も少し表示されるため、3カ月分取得する
      const weight: Weight[] = await prisma.$queryRaw`SELECT * FROM wm_weights WHERE user_id=${
        user.id
      } AND EXTRACT(MONTH FROM date) <= ${month + 1} AND ${month - 1} <= EXTRACT(MONTH FROM date)`;

      return weight;
    } else {
      throw new Error('Database Error: User Not Found');
    }
  } catch (error) {
    throw new Error('Database Error: Failed to fetch Weight list for calender. error: ' + error);
  }
}

export async function fetchWeightsForGraph(email: string, range: number) {
  noStore();
  try {
    const user = await getUser(email);
    if (user !== null) {
      const day = new Date();
      day.setDate(day.getDate() - range);

      const weight: Weight[] =
        await prisma.$queryRaw`SELECT * FROM wm_weights WHERE user_id=${user.id} AND date > ${day}`;

      return weight;
    } else {
      throw new Error('Database Error: User Not Found');
    }
  } catch (error) {
    throw new Error('Database Error: Failed to fetch Weight list for graph. error: ' + error);
  }
}

export async function registerWeight(email: string, weight: number, date: string) {
  noStore();
  try {
    const user = await getUser(email);
    if (user !== null) {
      await prisma.weight.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date: new Date(date),
          },
        },
        update: {
          weight: weight,
        },
        create: {
          userId: user.id,
          weight: weight,
          date: new Date(date),
        },
      });
    } else {
      throw new Error('Database Error: User Not Found');
    }
  } catch (error) {
    throw new Error('Database Error: Failed to Register Weight. error: ' + error);
  }
}
