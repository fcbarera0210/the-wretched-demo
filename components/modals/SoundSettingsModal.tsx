'use client';

import { useEffect, useState } from 'react';
import { getAudioEngine } from '@/core/audio/audioEngine';

interface SoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SoundSettingsModal({ isOpen, onClose }: SoundSettingsModalProps) {
  const [ambientEnabled, setAmbientEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [ambientVol, setAmbientVol] = useState(50);
  const [sfxVol, setSfxVol] = useState(90);

  useEffect(() => {
    if (!isOpen) return;
    
    const audio = getAudioEngine();
    audio.init();
    
    // Cargar valores actuales
    setAmbientEnabled(audio.getAmbientEnabled());
    setSfxEnabled(audio.getSfxEnabled());
    setAmbientVol(Math.round(audio.getAmbientVolume() * 100));
    setSfxVol(Math.round(audio.getSfxVolume() * 100));
  }, [isOpen]);

  if (!isOpen) return null;

  const audio = getAudioEngine();

  const handleAmbientToggle = () => {
    const next = !ambientEnabled;
    setAmbientEnabled(next);
    audio.setAmbientEnabled(next);
  };

  const handleSfxToggle = () => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    audio.setSfxEnabled(next);
  };

  const handleAmbientVolChange = (value: number) => {
    setAmbientVol(value);
    audio.setAmbientVolume(value / 100);
  };

  const handleSfxVolChange = (value: number) => {
    setSfxVol(value);
    audio.setSfxVolume(value / 100);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <h2>CONFIGURACIÓN DE AUDIO</h2>

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1.2rem' }}>AUDIO AMBIENTAL</h3>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '15px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={ambientEnabled}
                onChange={handleAmbientToggle}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span>Activar drone ambiental</span>
            </label>
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--dim-color)' }}>Volumen</span>
                <span style={{ fontSize: '0.9rem' }}>{ambientVol}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={ambientVol}
                onChange={(e) => handleAmbientVolChange(Number(e.target.value))}
                disabled={!ambientEnabled}
                style={{
                  width: '100%',
                  height: '8px',
                  cursor: ambientEnabled ? 'pointer' : 'not-allowed',
                  opacity: ambientEnabled ? 1 : 0.5,
                }}
              />
            </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px dashed var(--dim-color)', margin: '20px 0' }} />

          <div>
            <h3 style={{ marginBottom: '15px', fontSize: '1.2rem' }}>EFECTOS DE SONIDO</h3>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '15px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={sfxEnabled}
                onChange={handleSfxToggle}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span>Activar sonidos de acciones</span>
            </label>
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--dim-color)' }}>Volumen</span>
                <span style={{ fontSize: '0.9rem' }}>{sfxVol}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={sfxVol}
                onChange={(e) => handleSfxVolChange(Number(e.target.value))}
                disabled={!sfxEnabled}
                style={{
                  width: '100%',
                  height: '8px',
                  cursor: sfxEnabled ? 'pointer' : 'not-allowed',
                  opacity: sfxEnabled ? 1 : 0.5,
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0, 20, 0, 0.5)', border: '1px solid var(--dim-color)' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--dim-color)', margin: 0 }}>
            <strong>Nota:</strong> Los cambios se aplican inmediatamente. El audio ambiental crea una atmósfera constante, mientras que los efectos de sonido se reproducen durante las acciones del juego.
          </p>
        </div>
      </div>
    </div>
  );
}

