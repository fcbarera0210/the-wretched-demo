'use client';

import { useGameStore } from '@/stores/gameStore';
import { getAudioEngine } from '@/core/audio/audioEngine';
import { useState, useEffect } from 'react';

interface StartModalProps {
  onStart: () => void;
}

export default function StartModal({ onStart }: StartModalProps) {
  const { initGame } = useGameStore();
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('wretched_save');
    setHasSave(!!saved);
  }, []);

  const handleNewGame = () => {
    initGame();
    const audio = getAudioEngine();
    audio.init();
    onStart();
  };

  const handleLoadGame = () => {
    const audio = getAudioEngine();
    audio.init();
    onStart();
  };

  return (
    <div className="modal">
      <div className="modal-content" style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>THE WRETCHED</h1>
        <p style={{ color: 'var(--dim-color)' }}>// SISTEMA DE REGISTRO DE VUELO //</p>
        <hr style={{ border: 0, borderTop: '1px dashed var(--dim-color)', margin: '20px 0' }} />
        <p>
          ERES EL ÚLTIMO SOBREVIVIENTE.
          <br />
          LA NAVE SE DESMORONA.
          <br />
          ALGO ESTÁ A BORDO CONTIGO.
        </p>
        <br />
        <p style={{ fontSize: '0.9rem', color: '#888' }}>
          (Se recomienda activar sonido para atmósfera)
        </p>
        <br />
        <button className="main-btn" onClick={handleNewGame} style={{ width: '100%', marginBottom: '10px' }}>
          INICIAR NUEVA SESIÓN
        </button>
        {hasSave && (
          <button
            className="header-btn"
            onClick={handleLoadGame}
            style={{ width: '100%', padding: '15px' }}
          >
            CONTINUAR REGISTRO PREVIO
          </button>
        )}
      </div>
    </div>
  );
}

