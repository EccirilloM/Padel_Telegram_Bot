import { Telegraf } from 'telegraf';
import registerPayerCommand from './registerPlayer';
import updatePlayerCommand from './updatePlayer';
import updateCalendarCommand from "./updateCalendar"
import addCalendarCommand from "./addCalendar"
import  showPlayerOnCommand from "./showPlayerOn"
import showPlayersOnCommand from './showPlayersOn';
import showPlayersCommand from './showPlayers';

export default (bot: Telegraf) => {
  registerPayerCommand(bot);
  updatePlayerCommand(bot);
  updateCalendarCommand(bot);
  addCalendarCommand(bot);
  showPlayerOnCommand(bot);
  showPlayersOnCommand(bot);
  showPlayersCommand(bot);
  // Aggiungi altre registrazioni di comandi qui
};
