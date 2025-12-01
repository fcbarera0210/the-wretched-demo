/**
 * Motor principal del juego - Lógica de negocio
 */

import { GameState, GamePhase, GameHistoryEntry, BeaconState, CardCode } from './types';
import { createDeck, parseCard, requiresTowerCheck, rollD6, CARD_DATA } from './cards';

export class GameEngine {
  /**
   * Crea un estado inicial del juego
   */
  static createInitialState(): GameState {
    return {
      day: 1,
      tension: 1,
      deck: createDeck(),
      kings: 0,
      cardsToDraw: 0,
      cardsDrawn: 0,
      phase: GamePhase.START,
      beacon: { active: false, tokens: 0 },
      antenna: false,
      skipTower: false,
      journal: "DÍA 1: Sistemas iniciados. Nave de Salvamento Nostromo-7...\n",
      history: [],
      currentCard: null,
      lastDiceRoll: null,
    };
  }

  /**
   * Lanza el dado del día y determina cuántas cartas se deben robar
   */
  static rollDayDie(state: GameState): { roll: number; newState: GameState } {
    const roll = rollD6();
    const newState = {
      ...state,
      cardsToDraw: roll,
      cardsDrawn: 0,
      phase: GamePhase.DRAW,
      lastDiceRoll: roll,
    };
    return { roll, newState };
  }

  /**
   * Roba una carta del mazo
   */
  static drawCard(state: GameState): { card: ReturnType<typeof parseCard> | null; newState: GameState; gameOver: boolean; reason?: string } {
    if (state.deck.length === 0) {
      return {
        card: null,
        newState: state,
        gameOver: true,
        reason: "SIN RECURSOS. EL SOPORTE VITAL SE APAGÓ."
      };
    }

    // Robar la última carta del mazo
    const cardCode = state.deck[state.deck.length - 1];
    const newDeck = state.deck.slice(0, -1);
    
    const card = parseCard(cardCode);
    const cardsDrawn = state.cardsDrawn + 1;

    let newState: GameState = {
      ...state,
      deck: newDeck,
      cardsDrawn,
      currentCard: card,
    };

    // Procesar mecánicas de la carta
    const mechanicsResult = this.processCardMechanics(newState, card.value, card.suit);
    newState = mechanicsResult.newState;

    // Verificar condiciones de derrota
    if (mechanicsResult.gameOver) {
      return {
        card,
        newState,
        gameOver: true,
        reason: mechanicsResult.reason
      };
    }

    // Determinar siguiente fase
    if (requiresTowerCheck(card.event)) {
      newState.phase = GamePhase.TOWER_CHECK;
    } else {
      newState.phase = cardsDrawn >= newState.cardsToDraw ? GamePhase.DRAW_CONTINUE : GamePhase.DRAW;
    }

    return {
      card,
      newState,
      gameOver: false
    };
  }

  /**
   * Procesa las mecánicas especiales de una carta
   */
  static processCardMechanics(
    state: GameState,
    value: string,
    suit: string
  ): { newState: GameState; gameOver: boolean; reason?: string } {
    let newState = { ...state };

    // Reyes (Kings) - La Criatura
    if (value === 'K') {
      newState.kings++;
      if (newState.kings >= 4) {
        return {
          newState,
          gameOver: true,
          reason: "LA CRIATURA HA ROTO EL ÚLTIMO SELLO."
        };
      }
    }

    // As de Corazones - Baliza
    if (value === 'A' && suit === 'H' && !newState.beacon.active) {
      newState.beacon = { active: true, tokens: 10 };
    }

    // As de Diamantes - Antena
    if (value === 'A' && suit === 'D') {
      newState.antenna = true;
    }

    // As de Tréboles - Skip Tower
    if (value === 'A' && suit === 'C') {
      newState.skipTower = true;
    }

    return { newState, gameOver: false };
  }

  /**
   * Realiza una prueba de torre
   * El juego termina si el dado es MENOR O IGUAL a la tensión
   * Ejemplo: Tensión 1, dado 1 → Game Over. Tensión 1, dado 2-6 → Continúa
   */
  static performTowerCheck(state: GameState): { roll: number; newState: GameState; gameOver: boolean; reason?: string } {
    if (state.skipTower) {
      const newState = {
        ...state,
        skipTower: false,
        phase: state.cardsDrawn >= state.cardsToDraw ? GamePhase.DRAW_CONTINUE : GamePhase.DRAW,
      };
      return { roll: 0, newState, gameOver: false };
    }

    const roll = rollD6();
    // Asegurar que roll y tension son números
    const rollNum = Number(roll);
    const tensionNum = Number(state.tension);
    
    // Validación de seguridad: asegurar que los valores son válidos
    if (isNaN(rollNum) || isNaN(tensionNum) || rollNum < 1 || rollNum > 6 || tensionNum < 1) {
      // En caso de error, asumir que sobrevive
      const newState = {
        ...state,
        lastDiceRoll: rollNum,
        tension: tensionNum + 1,
        phase: state.cardsDrawn >= state.cardsToDraw ? GamePhase.DRAW_CONTINUE : GamePhase.DRAW,
      };
      return { roll: rollNum, newState, gameOver: false };
    }
    
    let newState = { ...state, lastDiceRoll: rollNum };

    // Game Over solo si roll <= tension (roll es menor o igual)
    // Ejemplo: tension=1, roll=1 → Game Over. tension=1, roll=2-6 → Continúa
    // IMPORTANTE: roll > tension significa que SOBREVIVES
    if (rollNum <= tensionNum) {
      return {
        roll: rollNum,
        newState,
        gameOver: true,
        reason: "LA NAVE HA COLAPSADO BAJO LA PRESIÓN."
      };
    }

    // Si sobrevive, aumentar la tensión
    newState = {
      ...newState,
      tension: tensionNum + 1,
      phase: state.cardsDrawn >= state.cardsToDraw ? GamePhase.DRAW_CONTINUE : GamePhase.DRAW,
    };

    return { roll: rollNum, newState, gameOver: false };
  }

  /**
   * Verifica la baliza de socorro al final del día
   * Si sale 6 (o 5 con antena reparada), ganas el juego
   */
  static checkBeacon(state: GameState): { roll: number; newState: GameState; gameOver: boolean; reason?: string } {
    if (!state.beacon.active || state.day === 1) {
      return { roll: 0, newState: state, gameOver: false };
    }

    const roll = rollD6();
    let newState = { ...state, lastDiceRoll: roll };

    // Si la antena está reparada, ganas con 5 o 6. Si no, solo con 6
    const winThreshold = state.antenna ? 5 : 6;
    
    if (roll >= winThreshold) {
      return {
        roll,
        newState,
        gameOver: true,
        reason: "NAVE DE RESCATE ACOPLADA CON ÉXITO."
      };
    }

    return { roll, newState, gameOver: false };
  }

  /**
   * Finaliza el día y avanza al siguiente
   */
  static endDay(state: GameState, journalText: string): GameState {
    return {
      ...state,
      day: state.day + 1,
      phase: GamePhase.START,
      journal: journalText,
      currentCard: null,
      lastDiceRoll: null,
    };
  }

  /**
   * Añade una entrada al historial
   */
  static addHistoryEntry(state: GameState, cardCode: CardCode, eventText: string): GameState {
    const value = cardCode.slice(0, -1);
    const suit = cardCode.slice(-1) as keyof typeof CARD_DATA;
    const symbol = CARD_DATA[suit].symbol;
    const formattedCode = `${value}${symbol}`;

    const entry: GameHistoryEntry = {
      day: state.day,
      card: formattedCode,
      text: eventText,
    };

    return {
      ...state,
      history: [...state.history, entry],
    };
  }
}

