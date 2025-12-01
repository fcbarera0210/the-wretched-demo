'use client';

import { useGameStore } from '@/stores/gameStore';

export default function StatsPanel() {
  const {
    day,
    tension,
    deck,
    kings,
    beacon,
    antenna,
  } = useGameStore();

  return (
    <div className="panel">
      <div className="stat-group">
        <span className="stat-label">DÍA DE MISIÓN</span>
        <span className="stat-value">{day}</span>
      </div>

      <div className="stat-group">
        <span className="stat-label">INTEGRIDAD ESTRUCTURAL (TORRE)</span>
        <span className="stat-value" id="towerStatus">
          {tension <= 3 ? 'ESTABLE' : tension <= 5 ? 'INESTABLE' : 'CRÍTICO'}
        </span>
      </div>

      <div className="stat-group">
        <span className="stat-label">NIVEL DE TENSIÓN</span>
        <span className="stat-value alert">{tension}</span>
        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--dim-color)' }}>
          FALLO SI DADO &lt;= TENSIÓN
        </span>
      </div>

      <div className="stat-group">
        <span className="stat-label">SUMINISTROS (CARTAS)</span>
        <span className="stat-value">{deck.length}</span>
      </div>

      <div className="stat-group">
        <span className="stat-label" style={{ color: 'var(--alert-color)' }}>
          INTRUSOS (REYES)
        </span>
        <span className="stat-value" style={{ color: 'var(--alert-color)' }}>
          {kings} / 4
        </span>
      </div>

      <div className={`system-status ${beacon.active ? 'active' : ''}`}>
        <strong>BALIZA DE SOCORRO (AS ♥)</strong>
        <br />
        <span style={{ color: beacon.active ? '#33ff33' : 'var(--dim-color)' }}>
          {beacon.active ? 'ONLINE' : 'OFFLINE'}
        </span>
        <br />
        {beacon.active && (
          <span style={{ fontSize: '0.8rem' }}>RESTANTE: {beacon.tokens}</span>
        )}
      </div>

      <div className={`system-status ${antenna ? 'active' : ''}`}>
        <strong>ANTENA LARGO ALCANCE (AS ♦)</strong>
        <br />
        <span style={{ color: antenna ? '#33ff33' : 'var(--dim-color)' }}>
          {antenna ? 'ONLINE' : 'DAÑADA'}
        </span>
      </div>
    </div>
  );
}

