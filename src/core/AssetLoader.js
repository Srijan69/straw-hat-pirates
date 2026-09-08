import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

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

    // Setup GLTFLoader with Draco decompression support
    this.setupLoaders();

    // Initial simulated boot sequence for cinematic entrance
    this.simulateBootSequence();
  }

  setupLoaders() {
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  loadModel(url, onSuccess, onError) {
    this.gltfLoader.load(
      url,
      (gltf) => {
        if (onSuccess) onSuccess(gltf);
      },
      undefined,
      (error) => {
        console.warn(`[AssetLoader] Model ${url} not found or could not be loaded:`, error);
        if (onError) onError(error);
      }
    );
  }

  simulateBootSequence() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 7;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        this.updateUI(progress, 'SETTING SAIL ACROSS THE GRAND LINE...');
        setTimeout(() => {
          this.handleComplete();
        }, 500);
      } else {
        const statuses = [
          'INITIALIZING LOG POSE COMPASS...',
          'CALIBRATING GERSTNER WAVE HYDRODYNAMICS...',
          'RIGGING THOUSAND SUNNY FLAGSHIP & SAILS...',
          'ARMING GAON CANNON & SOLDIER DOCK SYSTEM...',
          'CHARTING NEW WORLD CELESTIAL VOYAGE...'
        ];
        const status = statuses[Math.min(Math.floor(progress / 22), statuses.length - 1)];
        this.updateUI(progress, status);
      }
    }, 55);
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
      }, 700);
    } else if (this.onComplete) {
      this.onComplete();
    }
  }
}
