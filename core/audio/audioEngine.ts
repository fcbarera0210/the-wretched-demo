/**
 * Sistema de Audio Procedimental usando Web Audio API
 * Genera sonidos sin archivos externos para atmósfera inmersiva
 * Separado en: Audio Ambiental (drone) y Efectos de Sonido (SFX)
 */

export type SfxType = 'click' | 'dice' | 'card' | 'endDay' | 'alert';

export class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private droneOscillators: OscillatorNode[] = [];

  // Estado de audio ambiental
  private ambientEnabled: boolean = true;
  private ambientVolume: number = 0.5;

  // Estado de efectos de sonido
  private sfxEnabled: boolean = true;
  private sfxVolume: number = 0.9;

  /**
   * Asegura que el contexto de audio esté inicializado y activo
   */
  private ensureContext(): boolean {
    if (typeof window === 'undefined') return false;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return false;

    if (!this.audioCtx) {
      try {
        this.audioCtx = new AudioContextClass();
        this.ambientGain = this.audioCtx.createGain();
        this.sfxGain = this.audioCtx.createGain();

        // Conectar ambos a la salida
        this.ambientGain.connect(this.audioCtx.destination);
        this.sfxGain.connect(this.audioCtx.destination);

        // Aplicar estados iniciales
        this.updateAmbientGain();
        this.updateSfxGain();

        // Iniciar drone si está habilitado
        if (this.ambientEnabled) {
          this.startDrone();
        }
      } catch (e) {
        console.error('Error initializing audio:', e);
        return false;
      }
    }

    // Reactivar contexto si está suspendido (requerido por navegadores)
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(console.error);
    }

    return true;
  }

  /**
   * Inicializa el contexto de audio
   */
  init(): boolean {
    return this.ensureContext();
  }

  /**
   * Inicia el drone atmosférico de fondo
   */
  private startDrone(): void {
    if (!this.audioCtx || !this.ambientGain) return;

    // Limpiar osciladores anteriores si existen
    this.cleanupDrone();

    const freqs = [55, 110, 112];
    this.droneOscillators = [];

    freqs.forEach(f => {
      const osc = this.audioCtx!.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = f;

      const filter = this.audioCtx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 200;

      const lfo = this.audioCtx!.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.1 + Math.random() * 0.1;

      const lfoGain = this.audioCtx!.createGain();
      lfoGain.gain.value = 50;

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      const oscGain = this.audioCtx!.createGain();
      oscGain.gain.value = 0.05;

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.ambientGain!);
      osc.start();

      this.droneOscillators.push(osc, lfo);
    });
  }

  /**
   * Limpia solo los osciladores del drone
   */
  private cleanupDrone(): void {
    if (this.droneOscillators.length > 0) {
      this.droneOscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Oscillator ya detenido
        }
      });
      this.droneOscillators = [];
    }
  }

  /**
   * Reproduce un efecto de sonido
   */
  playSfx(type: SfxType): void {
    // Asegurar contexto activo antes de reproducir
    if (!this.ensureContext() || !this.sfxEnabled || !this.audioCtx || !this.sfxGain) return;

    const t = this.audioCtx.currentTime;

    switch (type) {
      case 'click':
        this.playClick(t);
        break;
      case 'dice':
        this.playDice(t);
        break;
      case 'card':
        this.playCard(t);
        break;
      case 'endDay':
        this.playEndDay(t);
        break;
      case 'alert':
        this.playAlert(t);
        break;
    }
  }

  private playClick(t: number): void {
    if (!this.audioCtx || !this.sfxGain) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);

    gain.gain.setValueAtTime(0.1 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  private playDice(t: number): void {
    if (!this.audioCtx || !this.sfxGain) return;

    // Ráfaga de datos
    for (let i = 0; i < 5; i++) {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.value = 200 + Math.random() * 800;

      gain.gain.setValueAtTime(0.05 * this.sfxVolume, t + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.05);
    }
  }

  private playCard(t: number): void {
    if (!this.audioCtx || !this.sfxGain) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.linearRampToValueAtTime(1200, t + 0.2);

    gain.gain.setValueAtTime(0.05 * this.sfxVolume, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  private playEndDay(t: number): void {
    if (!this.audioCtx || !this.sfxGain) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.5);

    gain.gain.setValueAtTime(0.1 * this.sfxVolume, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  private playAlert(t: number): void {
    if (!this.audioCtx || !this.sfxGain) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.3);

    gain.gain.setValueAtTime(0.2 * this.sfxVolume, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  // --- Control de Audio Ambiental ---

  setAmbientEnabled(enabled: boolean): void {
    this.ambientEnabled = enabled;
    if (enabled) {
      this.ensureContext();
      if (this.droneOscillators.length === 0) {
        this.startDrone();
      }
    } else {
      this.cleanupDrone();
    }
    this.updateAmbientGain();
  }

  getAmbientEnabled(): boolean {
    return this.ambientEnabled;
  }

  setAmbientVolume(volume: number): void {
    this.ambientVolume = Math.max(0, Math.min(1, volume));
    this.updateAmbientGain();
  }

  getAmbientVolume(): number {
    return this.ambientVolume;
  }

  private updateAmbientGain(): void {
    if (!this.audioCtx || !this.ambientGain) return;
    const targetVolume = this.ambientEnabled ? this.ambientVolume : 0;
    this.ambientGain.gain.setTargetAtTime(targetVolume, this.audioCtx.currentTime, 0.2);
  }

  // --- Control de Efectos de Sonido ---

  setSfxEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
    this.updateSfxGain();
  }

  getSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateSfxGain();
  }

  getSfxVolume(): number {
    return this.sfxVolume;
  }

  private updateSfxGain(): void {
    if (!this.audioCtx || !this.sfxGain) return;
    const targetVolume = this.sfxEnabled ? this.sfxVolume : 0;
    this.sfxGain.gain.setTargetAtTime(targetVolume, this.audioCtx.currentTime, 0.05);
  }

  /**
   * Verifica si hay algún audio activo (ambiente o SFX)
   */
  hasAnyAudioEnabled(): boolean {
    return this.ambientEnabled || this.sfxEnabled;
  }

  /**
   * Limpia todos los recursos de audio
   */
  cleanup(): void {
    this.cleanupDrone();

    if (this.audioCtx) {
      this.audioCtx.close().catch(console.error);
      this.audioCtx = null;
    }

    this.ambientGain = null;
    this.sfxGain = null;
  }
}

// Instancia singleton
let audioEngineInstance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine();
  }
  return audioEngineInstance;
}
