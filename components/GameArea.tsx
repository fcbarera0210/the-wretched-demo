'use client';

import { useGameStore } from '@/stores/gameStore';
import { GamePhase } from '@/core/game/types';
import CardDisplay from './CardDisplay';
import { getAudioEngine } from '@/core/audio/audioEngine';
import { useState, useEffect } from 'react';

export default function GameArea() {
  const {
    phase,
    cardsToDraw,
    cardsDrawn,
    currentLog,
    rollDayDie,
    drawCard,
    performTowerCheck,
    finishDrawPhase,
    endDay,
    setJournal,
    journal,
    isRollingDice,
    gameOver,
  } = useGameStore();

  const [saveStatus, setSaveStatus] = useState('GUARDADO AUTOMÁTICO ACTIVO');

  useEffect(() => {
    // Auto-guardar cada vez que cambia el estado
    const timer = setTimeout(() => {
      setSaveStatus('GUARDADO ' + new Date().toLocaleTimeString());
    }, 1000);
    return () => clearTimeout(timer);
  }, [phase, cardsDrawn]);

  const handleMainAction = () => {
    const audio = getAudioEngine();
    audio.playSfx('click');

    switch (phase) {
      case GamePhase.START:
        rollDayDie();
        break;
      case GamePhase.DRAW:
        drawCard();
        break;
      case GamePhase.TOWER_CHECK:
        performTowerCheck();
        break;
      case GamePhase.DRAW_CONTINUE:
        finishDrawPhase();
        break;
      case GamePhase.JOURNAL:
        endDay(journal);
        break;
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case GamePhase.START:
        return 'FASE 1: MANTENIMIENTO E INICIO';
      case GamePhase.DRAW:
        return `FASE 2: OPERACIONES (${cardsDrawn}/${cardsToDraw})`;
      case GamePhase.TOWER_CHECK:
        return '¡ALERTA! PRUEBA DE INTEGRIDAD REQUERIDA';
      case GamePhase.DRAW_CONTINUE:
        return 'FASE 2: OPERACIONES COMPLETAS';
      case GamePhase.JOURNAL:
        return 'FASE 3: REGISTRO Y DESCANSO';
      default:
        return '';
    }
  };

  const getButtonText = () => {
    switch (phase) {
      case GamePhase.START:
        return 'LANZAR DADO DE DÍA';
      case GamePhase.DRAW:
        return 'ROBAR SIGUIENTE CARTA';
      case GamePhase.TOWER_CHECK:
        return 'REALIZAR PRUEBA DE TORRE';
      case GamePhase.DRAW_CONTINUE:
        return 'CONTINUAR A DIARIO >>';
      case GamePhase.JOURNAL:
        return 'FINALIZAR DÍA Y GUARDAR';
      default:
        return '';
    }
  };

  const isDanger = phase === GamePhase.TOWER_CHECK;
  const isGameOver = gameOver?.active === true;

  return (
    <div className="panel game-area">
      <div className="phase-indicator">{getPhaseText()}</div>

      <CardDisplay />

      <div className="event-box">{currentLog}</div>

      <div className="controls">
        <button
          className={`main-btn ${isDanger ? 'danger' : ''}`}
          onClick={handleMainAction}
          disabled={isRollingDice || isGameOver}
        >
          {isGameOver 
            ? 'JUEGO TERMINADO' 
            : isRollingDice 
            ? 'LANZANDO DADO...' 
            : getButtonText()}
        </button>
      </div>

      <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--dim-color)' }}>
        {saveStatus}
      </div>
    </div>
  );
}

