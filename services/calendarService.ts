import { PrismaClient } from '@prisma/client';
import { CalendarItem } from '../models/CalendarItem';

const prisma = new PrismaClient();

export const addCalendar = async (username: string, schedule: CalendarItem[]): Promise<void> => {
  try {
    const user = await prisma.player.findUnique({
      where: { username },
      include: { calendars: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.calendars && user.calendars.length > 0) {
      throw new Error('Calendar already exists. Use updateCalendar instead.');
    }

    for (const item of schedule) {
      await prisma.calendar.create({
        data: {
          day: item.day,
          startTime: item.startTime,
          endTime: item.endTime,
          userId: user.id,
        },
      });
    }
  } catch (err) {
    console.error('Errore durante l\'aggiunta del calendario:', err);
    throw err;
  }
};

export const updateCalendar = async (username: string, schedule: CalendarItem[]): Promise<void> => {
  try {
    const user = await prisma.player.findUnique({
      where: { username },
      include: { calendars: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Elimina tutti i calendari esistenti associati all'utente
    await prisma.calendar.deleteMany({
      where: { userId: user.id },
    });

    // Aggiungi il nuovo calendario
    for (const item of schedule) {
      await prisma.calendar.create({
        data: {
          day: item.day,
          startTime: item.startTime,
          endTime: item.endTime,
          userId: user.id,
        },
      });
    }
  } catch (err) {
    console.error('Errore durante l\'aggiornamento del calendario:', err);
    throw err;
  }
};