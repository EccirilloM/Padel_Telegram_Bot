import { Telegraf, Context } from 'telegraf';
import { isTextMessage } from '../utils/messageUtils';
import { parseCalendar } from '../utils/calendarUtils'; // Sposta la funzione parse in utils
import { updateCalendar } from '../services/calendarService';
import { getPlayerByUsername } from '../services/playerService'; // Importa la funzione per ottenere l'utente

const updateCalendarCommand = (bot: Telegraf) => {
  bot.command('updatecalendar', async (ctx: Context) => {
    const message = ctx.message;
    const senderUsername = ctx.from?.username; // Usa senderUsername

    if (!message || !isTextMessage(message)) {
      ctx.reply('Errore: Non hai fornito il calendario o non è stato possibile identificare il tuo username.');
      return;
    }

    const args = message.text.replace('/updatecalendar', '').trim().split(' ');
    let targetUsername: string | undefined;
    let calendarText: string;

    // Controllo per username e calendario
    if (args.length > 1 && args[0].startsWith('@')) {
      targetUsername = args[0].substring(1); // Rimuove '@'
      calendarText = args.slice(1).join(' ');
    } else {
      targetUsername = senderUsername;
      calendarText = args.join(' ');
    }

    if (!targetUsername) {
      ctx.reply('Errore: Non è stato possibile identificare il tuo username.');
      return;
    }

    if (!calendarText) {
      ctx.reply('Per favore incolla il tuo orario delle lezioni dopo il comando /updatecalendar.');
      return;
    }

    try {
      // Verifica che l'utente esista
      const user = await getPlayerByUsername(targetUsername);
      if (!user) {
        ctx.reply(`Errore: L'utente con username ${targetUsername} non è stato trovato. Registrati prima di aggiornare un calendario.`);
        return;
      }

      const schedule = parseCalendar(calendarText);
      await updateCalendar(targetUsername, schedule);  // Usa il service

      ctx.reply(`Calendario aggiornato con successo per l'utente ${targetUsername}.`);
    } catch (err) {
      console.error("Errore durante l'aggiornamento del calendario:", err);
      ctx.reply('Errore durante l\'aggiornamento del calendario.');
    }
  });
};

export default updateCalendarCommand;
