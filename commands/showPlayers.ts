import { Telegraf, Context } from 'telegraf';
import { getAllPlayers } from '../services/playerService';

const showPlayersCommand = (bot: Telegraf) => {
  bot.command('showplayers', async (ctx: Context) => {
    try {
      const players = await getAllPlayers();

      if (players.length === 0) {
        ctx.reply('Nessun giocatore registrato al momento.');
        return;
      }

      let response = '*Giocatori registrati:*\n\n';
      players.forEach(player => {
        response += `\\- *${player.username}*: Livello *\`${player.level}\`*\n`;
      });

      ctx.reply(response, { parse_mode: 'MarkdownV2' });
    } catch (err) {
      console.error('Errore durante il recupero dei giocatori:', err);
      ctx.reply('Errore durante la visualizzazione dei giocatori.');
    }
  });
};

export default showPlayersCommand;
