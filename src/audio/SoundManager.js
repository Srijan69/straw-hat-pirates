/**
 * Procedural Web Audio Engine for Ocean Ambience and UI Micro-Interactions
 * Operates without external media files for 100% reliability.
 */
export class SoundManager {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.ambientGain = null;
    this.btn = document.getElementById('audio-toggle');
    
    this.initListeners();
  }

  initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.startOceanAmbience();
    }
  }

  startOceanAmbience() {
    if (!this.ctx) return;

    // Create procedural oceanic wind/wave sound using filtered noise
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to sound like deep ocean waves & wind
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    // LFO to oscillate filter frequency for swelling waves
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime); // ~5.5s wave period
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(220, this.ctx.currentTime);

    lfo.connect(filter.frequency);
    lfo.start();

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain);

    whiteNoise.start();
  }

  initListeners() {
    if (!this.btn) return;

    this.btn.addEventListener('click', () => {
      this.toggleAudio();
    });

    // Sound for interactive UI buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('button, .nav-link, .crew-card, .project-card, .btn')) {
        this.playUiClick();
      }
    });

    // Sound for hover
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('button, .nav-link, .crew-tab-btn, .filter-btn')) {
        this.playUiHover();
      }
    });
  }

  toggleAudio() {
    if (!this.ctx) {
      this.initContext();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) {
      this.ambientGain.gain.setTargetAtTime(0.2, this.ctx.currentTime, 1.2);
      this.btn.classList.add('playing');
      const textEl = this.btn.querySelector('.audio-text');
      if (textEl) textEl.textContent = 'AMB: ON';
    } else {
      this.ambientGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.6);
      this.btn.classList.remove('playing');
      const textEl = this.btn.querySelector('.audio-text');
      if (textEl) textEl.textContent = 'AMB: OFF';
    }
  }

  playUiClick() {
    if (!this.isPlaying || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      // Audio not ready
    }
  }

  playUiHover() {
    if (!this.isPlaying || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      // Audio not ready
    }
  }

  playTransmissionSound() {
    if (!this.ctx) this.initContext();
    try {
      // Den Den Mushi call chime
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);

        gain.gain.setValueAtTime(0.15, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.25);
      });
    } catch (e) {
      // Audio not ready
    }
  }
}
