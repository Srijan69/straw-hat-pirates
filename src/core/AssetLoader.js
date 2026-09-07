import * as THREE from 'three';

export class AssetLoader {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.progressBar = document.querySelector('.loader-progress-bar');
    this.progressText = document.querySelector('.loader-percentage');
    this.statusText = document.querySelector('.loader-status');
    this.loadingScreen = document.getElementById('loading-screen');

    this.loadingManager = new THREE.LoadingManager(
      () => this.handleComplete(),
      (url, itemsLoaded, itemsTotal) => this.handleProgress(itemsLoaded, itemsTotal)
    );

    // Initial simulated boot sequence for cinematic entrance
    this.simulateBootSequence();
  }

  simulateBootSequence() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 6;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        this.updateUI(progress, 'CHARTING GRAND LINE ROUTE...');
        setTimeout(() => {
          this.handleComplete();
        }, 500);
      } else {
        const statuses = [
          'INITIALIZING LOG POSE MATRIX...',
          'CALIBRATING GERSTNER WAVE PHYSICS...',
          'RIGGING THOUSAND SUNNY FLAGSHIP...',
          'SUMMONING STRAW HAT PIRATES...',
          'ALIGNING CELESTIAL CONSTELLATIONS...'
        ];
        const status = statuses[Math.min(Math.floor(progress / 22), statuses.length - 1)];
        this.updateUI(progress, status);
      }
    }, 60);
  }

  handleProgress(itemsLoaded, itemsTotal) {
    const progress = Math.round((itemsLoaded / itemsTotal) * 100);
    this.updateUI(progress, `LOADING ASSETS (${itemsLoaded}/${itemsTotal})...`);
  }

  updateUI(progress, status) {
    if (this.progressBar) this.progressBar.style.width = `${progress}%`;
    if (this.progressText) this.progressText.textContent = `${progress}%`;
    if (this.statusText) this.statusText.textContent = status;
  }

  handleComplete() {
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('loaded');
      setTimeout(() => {
        if (this.onComplete) this.onComplete();
      }, 800);
    } else if (this.onComplete) {
      this.onComplete();
    }
  }
}
