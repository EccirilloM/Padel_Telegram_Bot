import { Telegraf, Context } from 'telegraf';
import { isTextMessage } from '../utils/messageUtils';
import { parseCalendar } from '../utils/calendarUtils';
import { addCalendar } from '../services/calendarService';
import { getPlayerByUsername } from '../services/playerService';

const addCalendarCommand = (bot: Telegraf) => {
  bot.command('addcalendar', async (ctx: Context) => {
    const message = ctx.message;
    const senderUsername = ctx.from?.username;

    if (!message || !isTextMessage(message)) {
      ctx.reply('Errore: Il messaggio non contiene testo.');
      return;
    }

    const args = message.text.replace('/addcalendar', '').trim().split(' ');
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
      ctx.reply('Per favore incolla il tuo orario delle lezioni dopo il comando /addcalendar.');
      return;
    }

    try {
      // Verifica che l'utente esista
      const user = await getPlayerByUsername(targetUsername);
      if (!user) {
        ctx.reply(`Errore: L'utente con username ${targetUsername} non è stato trovato. Registrati prima di aggiungere un calendario.`);
        return;
      }

      const schedule = parseCalendar(calendarText);
      await addCalendar(targetUsername, schedule);

      ctx.reply(`Calendario salvato con successo per l'utente ${targetUsername}.`);
    } catch (err: any) {
      console.error("Errore durante il salvataggio del calendario:", err);
      ctx.reply("Errore durante il salvataggio del calendario.");
    }
  });
};

export default addCalendarCommand;
