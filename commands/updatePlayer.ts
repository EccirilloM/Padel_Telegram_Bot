import { Telegraf, Context } from 'telegraf';
import { updatePlayerLevel } from '../services/playerService';
import { isTextMessage } from '../utils/messageUtils';

const updatePlayerCommand = (bot: Telegraf) => {
  bot.command('update', async (ctx: Context, next) => {
    try {
      const message = ctx.message;
      const senderUsername = ctx.from?.username;

      if (!message || !isTextMessage(message)) {
        ctx.reply('Per favore, fornisci i dati nel formato: /update <username> <nuovo livello> o /update <nuovo livello> per aggiornare il tuo profilo.');
        return;
      }

      const args = message.text.split(' ');

      let username: string | undefined;
      let newLevel: number | undefined;

      if (args.length === 3) {
        username = args[1].startsWith('@') ? args[1].substring(1) : args[1]; // Rimuove '@' se presente
        newLevel = parseFloat(args[2]);
      } else if (args.length === 2) {
        username = senderUsername;
        newLevel = parseFloat(args[1]);
      } else {
        ctx.reply('Formato non valido. Usa: /update <username> <nuovo livello> o /update <nuovo livello> per aggiornare il tuo profilo.');
        return;
      }

      if (!username || isNaN(newLevel!)) {
        ctx.reply('Formato non valido. Assicurati di fornire un livello numerico.');
        return;
      }

      const player = await updatePlayerLevel(username, newLevel!);

      if (player) {
        ctx.reply(`Livello aggiornato con successo! Username: ${player.username}, Nuovo Livello: ${player.level}`);
      } else {
        ctx.reply('Errore durante l\'aggiornamento.');
      }

      await next();
    } catch (err) {
      ctx.reply(`Errore durante l'aggiornamento: ${err.message}`);
    }
  });
};

export default updatePlayerCommand;
