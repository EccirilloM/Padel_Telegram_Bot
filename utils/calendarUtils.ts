import { CalendarItem } from '../models/CalendarItem';

export function parseCalendar(text: string): CalendarItem[] {
  const lines = text.split('\n');
  const schedule: CalendarItem[] = [];

  lines.forEach((line) => {
    // Estrae il giorno e gli orari di inizio e fine per ogni lezione
    const dayTimeRegex = /(Lunedì|Martedì|Mercoledì|Giovedì|Venerdì|Sabato|Domenica) dalle (\d{2}:\d{2}) alle (\d{2}:\d{2})/;
    const match = line.match(dayTimeRegex);
    
    if (match) {
      const [_, day, startTime, endTime] = match;
      schedule.push({ day, startTime, endTime });
    }
  });

  return schedule;
}
