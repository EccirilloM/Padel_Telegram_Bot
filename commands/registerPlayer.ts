import { Telegraf, Context } from 'telegraf';
import { registerPlayer } from '../services/playerService';
import { isTextMessage } from '../utils/messageUtils';

const registerPlayerCommand = (bot: Telegraf) => {
  bot.command('register', async (ctx: Context, next) => {
    try {
      const message = ctx.message;
      const senderUsername = ctx.from?.username;

      if (!message || !isTextMessage(message)) {
        ctx.reply('Per favore, fornisci i dati nel formato: /register <username> <livello> o /register <livello> per registrarti.');
        return;
      }

      const args = message.text.split(' ');

      let username: string | undefined;
      let level: number | undefined;

      if (args.length === 3) {
        username = args[1].startsWith('@') ? args[1].substring(1) : args[1]; // Rimuove '@' se presente
        level = parseFloat(args[2]);
      } else if (args.length === 2) {
        username = senderUsername;
        level = parseFloat(args[1]);
      } else {
        ctx.reply('Formato non valido. Usa: /register <username> <livello> o /register <livello> per registrarti.');
        return;
      }

      if (!username || isNaN(level!)) {
        ctx.reply('Formato non valido. Assicurati di fornire un livello numerico.');
        return;
      }

      const player = await registerPlayer(username, level);

      if (player) {
        ctx.reply(`Registrazione completata! Username: ${player.username}, Livello: ${player.level}`);
      } else {
        ctx.reply('Errore durante la registrazione.');
      }

      await next();
    } catch (err) {
      ctx.reply(`Errore durante la registrazione: ${err.message}`);
    }
  });
};

export default registerPlayerCommand;
