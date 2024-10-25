import { Telegraf, Context } from 'telegraf';
import { isTextMessage } from '../utils/messageUtils';
import { parseCalendar } from '../utils/calendarUtils'; // Sposta la funzione parse in utils
import { updateCalendar } from '../services/calendarService';

const updateCalendarCommand = (bot: Telegraf) => {
  bot.command('updatecalendar', async (ctx: Context) => {
    const message = ctx.message;
    const username = ctx.from?.username;

    if (!message || !isTextMessage(message)) {
      ctx.reply('Errore: Non hai fornito il calendario o non è stato possibile identificare il tuo username.');
      return;
    }

    const calendarText = message.text.replace('/updateCalendar', '').trim();
    
    if (!calendarText) {
      ctx.reply('Per favore incolla il tuo orario delle lezioni dopo il comando /updatecalendar.');
      return;
    }

    try {
      const schedule = parseCalendar(calendarText);
      await updateCalendar(username!, schedule);  // Usa il service
      ctx.reply('Calendario aggiornato con successo.');
    } catch (err) {
      ctx.reply('Errore durante l\'aggiornamento del calendario.');
    }
  });
};

export default updateCalendarCommand;
