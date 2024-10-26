import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
import allCommands from './commands'; // Importa tutti i comandi

// Carica le variabili d'ambiente dal file .env
dotenv.config();

// Inizializza il bot con il token
export const bot = new Telegraf(process.env.BOT_TOKEN as string);

// Registra tutti i comandi
allCommands(bot);

// Imposta i comandi suggeriti
bot.telegram.setMyCommands([
  { command: 'register', description: '(username livello*) registra un giocatore con il livello' },
  { command: 'update', description: '(username livello*) aggiorna il livello del giocatore' },
  { command: 'addcalendar', description: '(orario polimi testuale) aggiunge calendario' },
  { command: 'updatecalendar', description: '(orario polimi testuale) aggiorna calendario' },
  { command: 'showplayeron', description: '(username giorno) mostra se il giocatore può giocare quel giorno' },
  { command: 'showplayerson', description: '(giorno) mostra tutti i giocatori del giorno' },
  {command: 'showplayers', description: 'Mostra tutti i giocatori registrati'},
  { command: 'help', description: 'Mostra una guida al bot' },
]);


