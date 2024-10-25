import { Telegraf, Context } from 'telegraf';
import { isTextMessage } from '../utils/messageUtils';
import { getPlayerSlotsForDay, getAllPlayersSlotsForDay, findCommonAvailabilityMultiple } from '../services/playerService';

const showPlayersOnCommand = (bot: Telegraf) => {
  bot.command('showplayerson', async (ctx: Context) => {
    const message = ctx.message;
    const username = ctx.from?.username;

    if (!message || !isTextMessage(message)) {
      ctx.reply('Errore: Il messaggio non contiene testo.');
      return;
    }

    if (!username) {
      ctx.reply('Errore: Non è stato possibile identificare il tuo username.');
      return;
    }

    const day = message.text.replace('/showplayerson', '').trim();
    const normalizedDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();

    if (!day) {
      ctx.reply('Per favore, specifica un giorno.');
      return;
    }

    try {
      // Recupera le tue disponibilità
      const userSlots = await getPlayerSlotsForDay(username, normalizedDay);

      if (!userSlots || userSlots.length === 0) {
        ctx.reply('Non hai orari disponibili per questo giorno.');
        return;
      }

      // Recupera le disponibilità degli altri giocatori
      const playersWithSlots = await getAllPlayersSlotsForDay(normalizedDay);

      // Trova la disponibilità comune con ciascun giocatore
      const commonAvailability = findCommonAvailabilityMultiple(userSlots, playersWithSlots);

      if (commonAvailability.length === 0) {
        ctx.reply(`Nessun giocatore disponibile per il giorno ${day}.`);
        return;
      }

      let response = `Ciao ${username}, i giocatori che possono giocare con te sono:\n`;

      // Filtro per escludere l'utente che ha mandato il comando
      const filteredAvailability = commonAvailability.filter(({ player }) => player.username !== username);

      if (filteredAvailability.length === 0) {
        ctx.reply(`Nessun giocatore disponibile per il giorno ${day}.`);
        return;
      }

      filteredAvailability.forEach(({ player, commonSlots }) => {
        const level = player.level.toString().replace('.', '\\.'); // Escapa il punto nel livello
        const slotMessages = commonSlots
          .map(slot => `dalle *${slot.startTime}* alle *${slot.endTime}*`)
          .join(', ');

        // Escapa il trattino e il livello
        response += `\n**${player.username}** \\- Livello: **${level}**\n${slotMessages}\n`;
      });

      ctx.reply(response, { parse_mode: 'MarkdownV2' });

    } catch (err) {
      console.error('Errore durante il calcolo delle disponibilità:', err);
      ctx.reply('Errore durante la ricerca delle disponibilità.');
    }
  });
};

export default showPlayersOnCommand;