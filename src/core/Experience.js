import * as THREE from 'three';
import { Camera } from './Camera.js';
import { Renderer } from './Renderer.js';
import { Ocean } from '../world/Ocean.js';
import { Ship } from '../world/Ship.js';
import { Environment } from '../world/Environment.js';
import { Particles } from '../world/Particles.js';

let instance = null;

export class Experience {
  constructor(canvas) {
    if (instance) {
      return instance;
    }
    instance = this;

    this.canvas = canvas || document.getElementById('webgl-canvas');
    if (!this.canvas) {
      console.error('Canvas #webgl-canvas not found!');
      return;
    }

    // Viewport sizes
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Time tracking
    this.clock = new THREE.Clock();
    this.previousTime = 0;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new Camera(this);

    // 3. Renderer
    this.renderer = new Renderer(this);

    // 4. World container
    this.world = {};
    this.initWorld();

    // 5. Events
    this.initEvents();

    // 6. Start Loop
    this.tick = this.tick.bind(this);
    this.tick();
  }

  initWorld() {
    this.world.ocean = new Ocean(this);
    this.world.ship = new Ship(this);
    this.world.environment = new Environment(this);
    this.world.particles = new Particles(this);
  }

  initEvents() {
    window.addEventListener('resize', () => {
      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight;

      this.camera.resize();
      this.renderer.resize();
    });
  }

  tick() {
    const elapsedTime = this.clock.getElapsedTime();
    const delta = elapsedTime - this.previousTime;
    this.previousTime = elapsedTime;

    // Update World Objects
    if (this.world.ocean) this.world.ocean.update(delta);
    if (this.world.ship) this.world.ship.update(delta);
    if (this.world.environment) this.world.environment.update(delta);
    if (this.world.particles) this.world.particles.update(delta);

    // Update Camera
    this.camera.update();

    // Render Scene
    this.renderer.update();

    requestAnimationFrame(this.tick);
  }
}
