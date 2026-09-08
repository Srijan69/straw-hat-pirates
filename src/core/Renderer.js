import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class Renderer {
  constructor(experience) {
    this.experience = experience;
    this.canvas = experience.canvas;
    this.sizes = experience.sizes;
    this.scene = experience.scene;
    this.camera = experience.camera;

    this.setInstance();
    this.setPostProcessing();
  }

  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });

    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.instance.setClearColor('#e0f2fe', 1);

    // Advanced Cinematic Tonemapping & Shadow Settings
    this.instance.outputColorSpace = THREE.SRGBColorSpace;
    this.instance.toneMapping = THREE.ACESFilmicToneMapping;
    this.instance.toneMappingExposure = 1.05;

    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  setPostProcessing() {
    this.composer = new EffectComposer(this.instance);
    this.renderPass = new RenderPass(this.scene, this.camera.instance);
    this.composer.addPass(this.renderPass);

    // Subtle, elegant bloom targeted at light sources (lantern cores, sun corona, metallic glints)
    const bloomResolution = new THREE.Vector2(this.sizes.width, this.sizes.height);
    this.bloomPass = new UnrealBloomPass(bloomResolution, 0.24, 0.40, 0.94);
    this.composer.addPass(this.bloomPass);
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (this.composer) {
      this.composer.setSize(this.sizes.width, this.sizes.height);
    }
  }

  update() {
    if (this.composer) {
      this.composer.render();
    } else {
      this.instance.render(this.scene, this.camera.instance);
    }
  }
}
