import { Telegraf, Context } from 'telegraf';

const helpMessage = `
Benvenuto nel Padel Bot!

Questo bot ti aiuta a gestire le disponibilità per le partite di padel. Ecco i comandi disponibili:

/register @username <livello> - Registra un nuovo giocatore con un livello specifico.

/update @username <nuovo livello> - Aggiorna il livello del giocatore specificato.

/addcalendar @username <calendario testuale polimi> - Aggiungi un calendario di lezioni per un giocatore (puoi usare @ per specificare un altro giocatore, altrimenti l'username sarà quello di colui che invia il messaggio).

/updatecalendar @username <calendario testuale polimi> - Aggiorna un calendario di lezioni per un giocatore (puoi usare @ per specificare un altro giocatore, altrimenti l'username sarà quello di colui che invia il messaggio).

/showplayerson <giorno> - Mostra i giocatori disponibili per il giorno specificato.

/showplayeron @username <giorno> - Mostra gli orari disponibili per un giocatore specifico nel giorno indicato.

/help - Mostra questo messaggio di aiuto.
`;

const helpCommand = (bot: Telegraf) => {
  bot.command('help', (ctx: Context) => {
    ctx.reply(helpMessage);
  });
};

export default helpCommand;
