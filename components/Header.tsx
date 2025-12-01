'use client';

import { getAudioEngine } from '@/core/audio/audioEngine';
import { useGameStore } from '@/stores/gameStore';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onLogClick: () => void;
  onHelpClick: () => void;
  onSoundClick: () => void;
}

export default function Header({ onLogClick, onHelpClick, onSoundClick }: HeaderProps) {
  const [hasSound, setHasSound] = useState(false);
  const resetGame = useGameStore((state) => state.resetGame);

  useEffect(() => {
    const audio = getAudioEngine();
    audio.init();
    setHasSound(audio.hasAnyAudioEnabled());

    // Actualizar estado cuando cambie el audio (para reflejar cambios desde el modal)
    const interval = setInterval(() => {
      setHasSound(audio.hasAnyAudioEnabled());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <header>
      <div className="header-top">
        <h1>TERMINAL :: NOSTROMO-7</h1>
      </div>
      <div className="header-controls">
        <button
          className={`header-btn ${hasSound ? 'active-sound' : ''}`}
          onClick={onSoundClick}
        >
          AUDIO
        </button>
        <button className="header-btn" onClick={onLogClick}>
          LOG
        </button>
        <button className="header-btn" onClick={onHelpClick}>
          AYUDA
        </button>
        <button
          className="header-btn"
          onClick={resetGame}
          style={{ color: 'var(--alert-color)', borderColor: 'var(--alert-color)' }}
        >
          REINICIAR
        </button>
      </div>
    </header>
  );
}

