'use client';

import { useGameStore } from '@/stores/gameStore';

interface GameOverModalProps {
  onViewLog?: () => void;
}

export default function GameOverModal({ onViewLog }: GameOverModalProps) {
  const { gameOver, history, journal } = useGameStore();

  if (!gameOver || !gameOver.active) return null;

  const downloadJournal = () => {
    let content = '=== DIARIO DEL SOBREVIVIENTE - NAVE NOSTROMO-7 ===\n\n';
    content += journal;
    content += '\n\n\n';
    content += '=================================================\n';
    content += 'REGISTRO AUTOMÁTICO DE SISTEMAS (CAJA NEGRA)\n';
    content += '=================================================\n';

    history.forEach((item) => {
      content += `[DÍA ${item.day}] CARTA ${item.card}: ${item.text}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.download = 'LOG_NOSTROMO_COMPLETO.txt';
    a.href = window.URL.createObjectURL(blob);
    a.click();
  };

  const handleReset = () => {
    localStorage.removeItem('wretched_save');
    window.location.reload();
  };

  return (
    <div className="modal">
      <div className="modal-content" style={{ textAlign: 'center' }}>
        <h1
          id="endTitle"
          style={{
            color: gameOver.win ? '#33ff33' : '#ff3333',
            fontSize: '3rem',
          }}
        >
          {gameOver.win ? 'SOBREVIVIENTE' : 'SEÑAL PERDIDA'}
        </h1>
        <p id="endReason" style={{ fontSize: '1.2rem' }}>
          {gameOver.reason}
        </p>
        <hr style={{ border: 0, borderTop: '1px dashed var(--dim-color)', margin: '20px 0' }} />
        <p style={{ fontSize: '0.9rem', color: 'var(--dim-color)' }}>
          EL DIARIO HA SIDO GUARDADO EN MEMORIA LOCAL.
        </p>
        <br />
        <button
          className="header-btn"
          onClick={onViewLog}
          style={{ width: '100%', marginBottom: '10px' }}
        >
          VER LOG DE LA MISIÓN
        </button>
        <button className="main-btn" onClick={downloadJournal} style={{ width: '100%' }}>
          DESCARGAR DIARIO COMPLETO
        </button>
        <br />
        <br />
        <button
          className="header-btn"
          onClick={handleReset}
          style={{
            color: 'var(--alert-color)',
            borderColor: 'var(--alert-color)',
          }}
        >
          BORRAR DATOS Y REINICIAR
        </button>
      </div>
    </div>
  );
}

