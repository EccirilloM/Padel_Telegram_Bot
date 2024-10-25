import { Player } from './Player';
import { Slot } from "./Slot"

export interface PlayerAvailability {
  player: Player;
  commonSlots: Slot[];  // Cambia da { start: string; end: string }[] a Slot[]
}

