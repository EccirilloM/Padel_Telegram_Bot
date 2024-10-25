import { CalendarItem } from './CalendarItem';

export interface Player {
  id: number;
  username: string;
  level: number;
  calendars: CalendarItem[]; // Relazione con i calendari
}
