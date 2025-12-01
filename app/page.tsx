'use client';

import { useState, useEffect } from 'react';
import Scanlines from '@/components/Scanlines';
import Header from '@/components/Header';
import StatsPanel from '@/components/StatsPanel';
import GameArea from '@/components/GameArea';
import Journal from '@/components/Journal';
import StartModal from '@/components/modals/StartModal';
import GameOverModal from '@/components/modals/GameOverModal';
import HelpModal from '@/components/modals/HelpModal';
import HistoryModal from '@/components/modals/HistoryModal';
import SoundSettingsModal from '@/components/modals/SoundSettingsModal';
import { useGameStore } from '@/stores/gameStore';
import { getAudioEngine } from '@/core/audio/audioEngine';

export default function Home() {
  const [showStartModal, setShowStartModal] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSoundModal, setShowSoundModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const gameOver = useGameStore((state) => state.gameOver);
  const phase = useGameStore((state) => state.phase);

  useEffect(() => {
    // Inicializar audio al montar
    const audio = getAudioEngine();
    audio.init();
    
    // Si hay un guardado y el juego ya está iniciado, ocultar modal de inicio
    const saved = localStorage.getItem('wretched_save');
    if (saved && phase !== undefined) {
      setShowStartModal(false);
    }
  }, [phase]);

  // Mostrar modal de game over con delay de 2 segundos para que el jugador vea el resultado del dado
  useEffect(() => {
    if (gameOver?.active) {
      const timer = setTimeout(() => {
        setShowGameOverModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowGameOverModal(false);
    }
  }, [gameOver?.active]);

  return (
    <>
      <Scanlines />
      {showStartModal && <StartModal onStart={() => setShowStartModal(false)} />}
      {showGameOverModal && (
        <GameOverModal onViewLog={() => {
          setShowHistoryModal(true);
        }} />
      )}
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      <HistoryModal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} />
      <SoundSettingsModal isOpen={showSoundModal} onClose={() => setShowSoundModal(false)} />
      <div className="app-container">
        <Header
          onLogClick={() => setShowHistoryModal(true)}
          onHelpClick={() => setShowHelpModal(true)}
          onSoundClick={() => setShowSoundModal(true)}
        />
        <StatsPanel />
        <GameArea />
        <Journal />
      </div>
    </>
  );
}

