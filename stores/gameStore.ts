/**
 * Store de Zustand para el estado del juego con persistencia
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameState, GamePhase } from '@/core/game/types';
import { GameEngine } from '@/core/game/engine';
import { getAudioEngine } from '@/core/audio/audioEngine';

interface GameStore extends GameState {
  // Actions
  initGame: () => void;
  rollDayDie: () => void;
  drawCard: () => void;
  performTowerCheck: () => void;
  finishDrawPhase: () => void;
  endDay: (journalText: string) => void;
  setJournal: (text: string) => void;
  addHistoryEntry: (cardCode: string, eventText: string) => void;
  addToHistory: (text: string) => void;
  log: (message: string) => void;
  setCurrentLog: (message: string) => void;
  currentLog: string;
  gameOver: { active: boolean; reason?: string; win?: boolean } | null;
  setGameOver: (reason: string, win: boolean) => void;
  resetGameOver: () => void;
  resetGame: () => void;
  isRollingDice: boolean;
  setIsRollingDice: (rolling: boolean) => void;
  diceType: 'day' | 'tower' | 'beacon' | null;
  setDiceType: (type: 'day' | 'tower' | 'beacon' | null) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      ...GameEngine.createInitialState(),
      currentLog: "Bienvenido al sistema de registro de emergencias. Inicia el día para evaluar la situación.",
      gameOver: null,
      isRollingDice: false,
      diceType: null,

      // Actions
      initGame: () => {
        const initialState = GameEngine.createInitialState();
        set({
          ...initialState,
          currentLog: ">> SISTEMA INICIADO. NUEVA SESIÓN DE SUPERVIVENCIA.",
          gameOver: null,
          isRollingDice: false,
          diceType: null,
        });
        getAudioEngine().playSfx('click');
      },

      rollDayDie: () => {
        const state = get();
        
        // Deshabilitar botón durante la animación
        set({ isRollingDice: true, diceType: 'day' });
        
        // Simular animación del dado (600ms)
        setTimeout(() => {
          const currentState = get();
          
          // Primero lanzar el dado del día
          const result = GameEngine.rollDayDie(currentState);
          set({ ...result.newState, lastDiceRoll: result.roll });
          get().addToHistory(`DADO DE DÍA: [${result.roll}]`);
          get().log(`>> INICIO DÍA ${currentState.day}. ACTIVIDAD: [${result.roll}]. ROBAR ${result.roll} CARTAS.`);
          getAudioEngine().playSfx('dice');
          
          // Si la baliza está activa y no es el día 1, verificar si ganas (dado de baliza)
          if (currentState.beacon.active && currentState.day > 1) {
            // Esperar un momento antes de lanzar el dado de baliza
            setTimeout(() => {
              const stateForBeacon = get();
              set({ isRollingDice: true, diceType: 'beacon' });
              
              setTimeout(() => {
                const finalState = get();
                const beaconResult = GameEngine.checkBeacon(finalState);
                
                // Asegurar que lastDiceRoll se establece correctamente
                const newStateWithRoll = { ...beaconResult.newState, lastDiceRoll: beaconResult.roll };
                
                if (beaconResult.gameOver) {
                  set({ ...newStateWithRoll });
                  get().addToHistory(`DADO DE BALIZA: [${beaconResult.roll}]`);
                  get().log(`>> SEÑAL DE BALIZA: DADO [${beaconResult.roll}]`);
                  get().log(">> ¡RESCATE DETECTADO! LA NAVE SE ACERCA.");
                  getAudioEngine().playSfx('alert');
                  
                  // Activar game over inmediatamente para deshabilitar el botón
                  get().setGameOver(beaconResult.reason || "ERROR", true);
                  
                  // Mantener el dado visible un poco más antes de ocultarlo
                  setTimeout(() => {
                    set({ isRollingDice: false, diceType: null });
                  }, 2000);
                  return;
                }
                
                set({ ...newStateWithRoll, isRollingDice: false, diceType: null });
                const threshold = finalState.antenna ? 5 : 6;
                get().addToHistory(`DADO DE BALIZA: [${beaconResult.roll}] (NECESITAS ${threshold}+ PARA RESCATE)`);
                get().log(`>> SEÑAL DE BALIZA: DADO [${beaconResult.roll}] (NECESITAS ${threshold}+ PARA RESCATE)`);
                getAudioEngine().playSfx('dice');
              }, 600);
            }, 800);
          } else {
            set({ isRollingDice: false, diceType: null });
          }
        }, 600);
      },

      drawCard: () => {
        const state = get();
        const result = GameEngine.drawCard(state);

        // IMPORTANTE: Actualizar el estado y registrar el log ANTES de verificar game over
        // Esto asegura que la carta, el contador de reyes y el log se actualicen correctamente
        // incluso cuando la carta causa un game over
        let beaconVictory = false;
        let beaconVictoryReason = "";
        
        if (result.card) {
          let newState = GameEngine.addHistoryEntry(result.newState, result.card.code, result.card.event);
          
          // El As de Corazones (AH) activa la baliza, así que no debe reducir el contador
          const isBeaconActivationCard = result.card.code === 'AH';
          
          // Construir el mensaje completo de la carta
          let cardMessage = `>> CARTA: ${result.card.value}${result.card.data.symbol} (${result.card.data.type})\n>> ${result.card.event}`;
          
          // Si la baliza está activa Y la carta NO es el As de Corazones, reducir el contador
          if (newState.beacon.active && newState.beacon.tokens > 0 && !isBeaconActivationCard) {
            // Si la antena está reparada, reduce 2 contadores. Si no, reduce 1
            const reduction = newState.antenna ? 2 : 1;
            const newTokens = Math.max(0, newState.beacon.tokens - reduction);
            
            newState.beacon = {
              ...newState.beacon,
              tokens: newTokens
            };
            
            // Añadir el mensaje de la baliza al mensaje de la carta (en una nueva línea)
            cardMessage += `\n>> BALIZA: -${reduction} contador${reduction > 1 ? 'es' : ''}. ${newTokens} restantes.`;
            
            // VERIFICAR VICTORIA: Si el contador llega a 0 o menos, ganar inmediatamente
            if (newTokens <= 0) {
              beaconVictory = true;
              beaconVictoryReason = "NAVE DE RESCATE ACOPLADA CON ÉXITO.";
            }
          } else if (isBeaconActivationCard) {
            // Si es el As de Corazones, añadir que la baliza se activó
            cardMessage += `\n>> BALIZA ACTIVADA: ${newState.beacon.tokens} contadores iniciales.`;
          }
          
          // Actualizar estado PRIMERO (esto incluye el contador de reyes actualizado)
          set({ ...newState });
          
          // Registrar el log
          get().log(cardMessage);
          
          // Si hay game over por baliza, añadir el mensaje al log
          if (beaconVictory) {
            get().log(`>> ${beaconVictoryReason}`);
          }
          
          // Si hay game over por otra razón (ej: 4 reyes), añadir el mensaje al log
          if (result.gameOver && result.reason && !beaconVictory) {
            get().log(`>> ${result.reason}`);
          }
          
          getAudioEngine().playSfx('card');
        }
        
        // Activar game over DESPUÉS de actualizar el estado y el log
        // Priorizar victoria por baliza sobre otras condiciones de game over
        if (beaconVictory) {
          get().setGameOver(beaconVictoryReason, true);
        } else if (result.gameOver) {
          get().setGameOver(result.reason || "ERROR", false);
        }
      },

      performTowerCheck: () => {
        const state = get();
        
        if (state.skipTower) {
          set({ skipTower: false });
          get().log(">> USAS EL OBJETO ENCONTRADO PARA EVITAR EL RIESGO.");
          const newPhase = state.cardsDrawn >= state.cardsToDraw ? GamePhase.DRAW_CONTINUE : GamePhase.DRAW;
          set({ phase: newPhase });
          return;
        }

        // Deshabilitar botón durante la animación
        set({ isRollingDice: true, diceType: 'tower' });

        // Simular animación del dado (600ms)
        setTimeout(() => {
          const currentState = get();
          
          // Guardar la tensión antes de la prueba para validación y log
          const tensionBeforeCheck = Number(currentState.tension);
          
          // Validación previa: asegurar que la tensión es válida
          if (isNaN(tensionBeforeCheck) || tensionBeforeCheck < 1) {
            set({ isRollingDice: false, diceType: null });
            get().log(">> ERROR EN SISTEMA. REINTENTANDO...");
            return;
          }
          
          const result = GameEngine.performTowerCheck(currentState);
          
          // ACTUALIZAR lastDiceRoll INMEDIATAMENTE para que se muestre el valor correcto
          // Esto debe hacerse ANTES de cualquier otra lógica, incluso antes de validar
          // Esto asegura que el valor mostrado en la UI sea el mismo que se usa en la lógica
          set({ lastDiceRoll: result.roll });
          
          // Validar que el resultado sea lógicamente correcto
          const rollNum = Number(result.roll);
          
          // VALIDACIÓN CRÍTICA: Si roll > tension, NO puede ser game over
          // Esta validación se ejecuta SIEMPRE, antes de procesar cualquier resultado
          if (rollNum > tensionBeforeCheck) {
            // Forzar que no sea game over y continuar normalmente
            const correctedState = {
              ...result.newState,
              tension: tensionBeforeCheck + 1,
              phase: currentState.cardsDrawn >= currentState.cardsToDraw ? GamePhase.DRAW_CONTINUE : GamePhase.DRAW,
            };
            set({ ...correctedState, isRollingDice: false, diceType: null });
            get().addToHistory(`DADO DE PRUEBA DE TORRE: [${rollNum}] vs TENSIÓN [${tensionBeforeCheck}] - SOBREVIVISTE`);
            get().log(`>> PRUEBA DE TORRE: DADO [${rollNum}] vs TENSIÓN [${tensionBeforeCheck}]`);
            get().log(">> LA ESTRUCTURA AGUANTA... LA TENSIÓN AUMENTA.");
            return;
          }
          
          // Solo si roll <= tension, puede ser game over
          // Actualizar estado con el resultado del dado INMEDIATAMENTE para que se muestre el valor correcto
          // Asegurar que lastDiceRoll está establecido correctamente
          set({ ...result.newState, lastDiceRoll: result.roll });
          
          if (result.gameOver) {
            get().addToHistory(`DADO DE PRUEBA DE TORRE: [${result.roll}] vs TENSIÓN [${tensionBeforeCheck}] - FALLO CRÍTICO`);
            get().log(`>> PRUEBA DE TORRE: DADO [${result.roll}] vs TENSIÓN [${tensionBeforeCheck}]`);
            get().log(">> FALLO CRÍTICO. LA ESTRUCTURA COLAPSÓ.");
            getAudioEngine().playSfx('alert');
            
            // Activar game over inmediatamente para deshabilitar el botón
            get().setGameOver(result.reason || "ERROR", false);
            
            // Mantener el dado visible un poco más antes de ocultarlo
            setTimeout(() => {
              set({ isRollingDice: false, diceType: null });
            }, 2000);
            return;
          }

          set({ isRollingDice: false, diceType: null });
          get().addToHistory(`DADO DE PRUEBA DE TORRE: [${result.roll}] vs TENSIÓN [${tensionBeforeCheck}] - SOBREVIVISTE`);
          get().log(`>> PRUEBA DE TORRE: DADO [${result.roll}] vs TENSIÓN [${tensionBeforeCheck}]`);
          get().log(">> LA ESTRUCTURA AGUANTA... LA TENSIÓN AUMENTA.");
        }, 600);
      },

      finishDrawPhase: () => {
        set({ phase: GamePhase.JOURNAL });
        get().log(">> OPERACIONES COMPLETADAS. REGISTRA EN EL DIARIO.");
      },

      endDay: (journalText: string) => {
        const state = get();
        const newState = GameEngine.endDay(state, journalText);
        set({ ...newState });
        get().log(`>> DÍA ${state.day} FINALIZADO. GUARDANDO DATOS...`);
        getAudioEngine().playSfx('endDay');
      },

      setJournal: (text: string) => {
        set({ journal: text });
      },

      addHistoryEntry: (cardCode: string, eventText: string) => {
        const state = get();
        const newState = GameEngine.addHistoryEntry(state, cardCode as any, eventText);
        set({ history: newState.history });
      },

      log: (message: string) => {
        set({ currentLog: message });
      },
      
      addToHistory: (text: string) => {
        const state = get();
        const entry = {
          day: state.day,
          card: 'DADO',
          text: text,
        };
        const newState = {
          ...state,
          history: [...state.history, entry],
        };
        set({ history: newState.history });
      },

      setCurrentLog: (message: string) => {
        set({ currentLog: message });
      },

      setGameOver: (reason: string, win: boolean) => {
        set({ gameOver: { active: true, reason, win } });
      },

      resetGameOver: () => {
        set({ gameOver: null });
      },

      setIsRollingDice: (rolling: boolean) => {
        set({ isRollingDice: rolling });
      },

      setDiceType: (type: 'day' | 'tower' | 'beacon' | null) => {
        set({ diceType: type });
      },

      resetGame: () => {
        const initialState = GameEngine.createInitialState();
        set({
          ...initialState,
          currentLog: "Bienvenido al sistema de registro de emergencias. Inicia el día para evaluar la situación.",
          gameOver: null,
          isRollingDice: false,
          diceType: null,
        });
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('wretched_save');
          } catch {
            // ignore
          }
        }
      },
    }),
    {
      name: 'wretched_save',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        day: state.day,
        tension: state.tension,
        deck: state.deck,
        kings: state.kings,
        cardsToDraw: state.cardsToDraw,
        cardsDrawn: state.cardsDrawn,
        phase: state.phase,
        beacon: state.beacon,
        antenna: state.antenna,
        skipTower: state.skipTower,
        journal: state.journal,
        history: state.history,
      }),
    }
  )
);

