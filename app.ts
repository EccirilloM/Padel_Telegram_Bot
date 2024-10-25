import { bot } from './bot';

// Rimuovi il webhook prima di usare il polling
bot.telegram.deleteWebhook()
  .then(() => bot.launch())
  .then(() => console.log('Bot avviato con successo'))
  .catch(err => console.error('Errore durante l\'avvio del bot:', err));

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
