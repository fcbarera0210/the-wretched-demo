/**
 * Tipos base para el motor del juego
 */

export type Suit = 'H' | 'D' | 'C' | 'S';
export type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type CardCode = `${CardValue}${Suit}`;

export interface CardData {
  type: string;
  color: string;
  symbol: string;
}

export interface Card {
  code: CardCode;
  value: CardValue;
  suit: Suit;
  data: CardData;
  event: string;
}

export interface BeaconState {
  active: boolean;
  tokens: number;
}

export interface GameHistoryEntry {
  day: number;
  card: string;
  text: string;
}

export enum GamePhase {
  START = 'start',
  DRAW = 'draw',
  TOWER_CHECK = 'tower_check',
  DRAW_CONTINUE = 'draw_continue',
  JOURNAL = 'journal',
}

export interface GameState {
  day: number;
  tension: number;
  deck: CardCode[];
  kings: number;
  cardsToDraw: number;
  cardsDrawn: number;
  phase: GamePhase;
  beacon: BeaconState;
  antenna: boolean;
  skipTower: boolean;
  journal: string;
  history: GameHistoryEntry[];
  currentCard: Card | null;
  lastDiceRoll: number | null;
}

