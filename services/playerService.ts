import { PrismaClient, Prisma } from '@prisma/client';
import { Player } from '../models/Player';
import { Slot } from '../models/Slot';
import {PlayerAvailability } from "../models/PlayerAvailability"
import { PlayerSummary } from '../models/PlayerSummary';

const prisma = new PrismaClient();

// Funzione per ottenere un utente dal DB tramite username
export const getPlayerByUsername = async (username: string): Promise<Player | null> => {
  try {
    const player = await prisma.player.findUnique({
      where: { username },
    });
    return player ? { id: player.id, username: player.username, level: player.level } as Player : null;
  } catch (err) {
    console.error('Errore nel recupero dell\'utente:', err);
    throw err;
  }
};

// Registrazione di un nuovo giocatore
export const registerPlayer = async (username: string, level: number): Promise<Player | null> => {
  try {
    const player = await prisma.player.create({
      data: {
        username,
        level,
      },
    });

    return {
      id: player.id,
      username: player.username,
      level: player.level,
    } as Player;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      // Codice errore P2002: violazione della chiave univoca (username già esistente)
      throw new Error(`L'utente con username ${username} esiste già.`);
    }
    throw err; // Rilancia gli altri errori
  }
};

// Aggiornamento del livello di un giocatore esistente
export const updatePlayerLevel = async (username: string, newLevel: number): Promise<Player | null> => {
  try {
    const player = await prisma.player.update({
      where: { username },
      data: { level: newLevel },
    });

    return {
      id: player.id,
      username: player.username,
      level: player.level,
    } as Player;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      // Codice errore P2025: nessun record trovato per aggiornare
      throw new Error(`L'utente con username ${username} non esiste.`);
    }
    throw err; // Rilancia gli altri errori
  }
};

/// Funzione per convertire un orario (es. "08:15") in minuti
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Funzione per convertire minuti in formato "HH:MM" con zero iniziale
function minutesToTime(minutes: number): string {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mins = String(minutes % 60).padStart(2, '0');
  return `${hours}:${mins}`;
}

// Recupera gli slot di un giocatore per un giorno specifico
export const getPlayerSlotsForDay = async (username: string, day: string): Promise<Slot[] | null> => {
  try {
    const player = await prisma.player.findUnique({
      where: { username },
      include: { calendars: true },
    });

    if (!player) {
      throw new Error(`L'utente con username ${username} non è stato trovato.`);
    }

    // Filtra gli slot in base al giorno
    const slots = player.calendars
      .filter(calendar => calendar.day === day)
      .map(calendar => ({
        startTime: calendar.startTime,
        endTime: calendar.endTime,
      }));

    return slots;
  } catch (err) {
    console.error('Errore nel recupero degli slot:', err);
    throw err;
  }
};

// Recupera gli slot di tutti i giocatori per un giorno specifico
export const getAllPlayersSlotsForDay = async (day: string): Promise<{ player: Player, slots: Slot[] }[]> => {
  try {
    const players = await prisma.player.findMany({
      include: { calendars: true },
    });

    // Filtra gli slot per ciascun giocatore in base al giorno
    const playersWithSlots = players.map(player => ({
      player,
      slots: player.calendars
        .filter(calendar => calendar.day === day)
        .map(calendar => ({
          startTime: calendar.startTime,
          endTime: calendar.endTime,
        }))
    })).filter(playerWithSlots => playerWithSlots.slots.length > 0); // Filtra i giocatori senza slot disponibili

    return playersWithSlots;
  } catch (err) {
    console.error('Errore nel recupero degli slot per tutti i giocatori:', err);
    throw err;
  }
};

// Funzione per trovare le fasce orarie libere, basate sugli orari di lezione
export const findAvailableSlots = (busySlots: Slot[]): Slot[] => {
  const fieldStart = timeToMinutes('07:00');
  const fieldEnd = timeToMinutes('21:30');

  // Ordiniamo gli slot occupati in base all'inizio
  const sortedBusySlots = busySlots
    .map(slot => ({
      start: timeToMinutes(slot.startTime),
      end: timeToMinutes(slot.endTime)
    }))
    .sort((a, b) => a.start - b.start);

  const availableSlots: { start: number, end: number }[] = [];
  let currentStart = fieldStart;

  sortedBusySlots.forEach(slot => {
    if (currentStart < slot.start) {
      // Aggiungi la fascia libera tra currentStart e l'inizio del prossimo slot occupato
      availableSlots.push({ start: currentStart, end: slot.start });
    }
    // Aggiorna currentStart alla fine dell'attuale slot occupato
    currentStart = Math.max(currentStart, slot.end);
  });

  // Considera il periodo dopo l'ultimo slot occupato fino alla fine del campo
  if (currentStart < fieldEnd) {
    availableSlots.push({ start: currentStart, end: fieldEnd });
  }

  // Converte gli slot disponibili in formato "HH:MM" e ritorna come Slot[]
  return availableSlots.map(slot => ({
    startTime: minutesToTime(slot.start),
    endTime: minutesToTime(slot.end),
  }));
};

// Trova le disponibilità comuni tra un giocatore (te) e un gruppo di giocatori
export const findCommonAvailabilityMultiple = (
  userSlots: Slot[],  // Le tue disponibilità
  playersWithSlots: { player: Player, slots: Slot[] }[]  // Disponibilità degli altri giocatori
): PlayerAvailability[] => {

  const userFreeSlots = findAvailableSlots(userSlots); // Trova le tue fasce libere

  const results: PlayerAvailability[] = [];

  playersWithSlots.forEach(({ player, slots: playerBusySlots }) => {
    const playerFreeSlots = findAvailableSlots(playerBusySlots); // Trova le fasce libere del giocatore

    const commonSlots = findCommonAvailability(userFreeSlots, playerFreeSlots); // Trova le sovrapposizioni con te

    if (commonSlots.length > 0) {
      results.push({
        player,
        commonSlots: commonSlots.map(slot => ({
          startTime: slot.startTime,  // Manteniamo le proprietà di Slot
          endTime: slot.endTime
        }))
      });
    }
  });

  return results;
};

// Confronta le disponibilità di due giocatori con sovrapposizione parziale
export const findCommonAvailability = (userFreeSlots: Slot[], playerFreeSlots: Slot[]): Slot[] => {
  const commonSlots: Slot[] = [];

  userFreeSlots.forEach(userSlot => {
    playerFreeSlots.forEach(playerSlot => {
      // Trova l'intervallo comune tra userSlot e playerSlot
      const start = Math.max(timeToMinutes(userSlot.startTime), timeToMinutes(playerSlot.startTime));
      const end = Math.min(timeToMinutes(userSlot.endTime), timeToMinutes(playerSlot.endTime));

      // Verifica se c'è una sovrapposizione parziale
      if (start < end) {
        commonSlots.push({
          startTime: minutesToTime(start),
          endTime: minutesToTime(end)
        });
      }
    });
  });

  return commonSlots;
};

// Ritorna l'elenco di tutti i giocatori con i livelli
export const getAllPlayers = async (): Promise<PlayerSummary[]> => {
  try {
    const players = await prisma.player.findMany({
      select: {
        username: true,
        level: true,
      }
    });
    return players;
  } catch (err) {
    console.error('Errore nel recupero dei giocatori:', err);
    throw err;
  }
};