'use client';

import { useGameStore } from '@/stores/gameStore';

export default function Journal() {
  const { journal, setJournal } = useGameStore();

  return (
    <div className="panel panel-last journal-container">
      <span className="stat-label">DIARIO DE ABORDO</span>
      <textarea
        id="journalInput"
        placeholder="Escribe aquí tus pensamientos... El sistema guarda automáticamente."
        spellCheck={false}
        value={journal}
        onChange={(e) => setJournal(e.target.value)}
      />
    </div>
  );
}

