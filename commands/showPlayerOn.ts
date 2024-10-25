import { Telegraf, Context } from 'telegraf';
import { isTextMessage } from '../utils/messageUtils';
import { getPlayerSlotsForDay, findAvailableSlots, findCommonAvailability } from '../services/playerService';

const showPlayerOnCommand = (bot: Telegraf) => {
  bot.command('showplayeron', async (ctx: Context) => {
    const message = ctx.message;
    const username = ctx.from?.username;

    if (!message || !isTextMessage(message)) {
      ctx.reply('Errore: Il messaggio non contiene testo.');
      return;
    }

    const text = message.text.replace('/showplayeron', '').trim();
    const [rawPlayerName, day] = text.split(' ');

    // Rimuove '@' se presente
    const playerName = rawPlayerName?.startsWith('@') ? rawPlayerName.substring(1) : rawPlayerName;

    if (!playerName || !day) {
      ctx.reply('Per favore, specifica sia il nome del player che il giorno.');
      return;
    }

    // Normalizza il giorno
    const normalizedDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();

    try {
      const userSlots = await getPlayerSlotsForDay(username!, normalizedDay) || []; // Ritorna un array vuoto se null
      const playerSlots = await getPlayerSlotsForDay(playerName, normalizedDay) || []; // Ritorna un array vuoto se null

      // Trova gli slot disponibili per entrambi i giocatori
      const userFreeSlots = findAvailableSlots(userSlots);
      const playerFreeSlots = findAvailableSlots(playerSlots);

      // Controlla se ci sono slot disponibili
      if (!userFreeSlots.length || !playerFreeSlots.length) {
        ctx.reply('Errore: Nessun orario di lezione trovato per uno dei due giocatori.');
        return;
      }

      const commonSlots = findCommonAvailability(userFreeSlots, playerFreeSlots);

      if (!commonSlots.length) {
        ctx.reply(`Nessun orario disponibile comune trovato con ${playerName} per ${day}.`);
      } else {
        let response = `**${playerName}**\n`; // Iniziamo la risposta con il nome del giocatore

        const slotMessages = commonSlots
          .map(slot => `dalle *${slot.startTime}* alle *${slot.endTime}*`)
          .join(', ');

        response += `${slotMessages}`;
        ctx.reply(response, { parse_mode: 'MarkdownV2' });
      }
    } catch (err) {
      console.error(err);
      ctx.reply('Errore durante la ricerca degli orari.');
    }
  });
};

export default showPlayerOnCommand;
