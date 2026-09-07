import * as THREE from 'three';
import { randomRange } from '../utils/math.js';

export class Particles {
  constructor(experience) {
    this.experience = experience;
    this.scene = experience.scene;
    this.time = 0;

    this.moteCount = 350;
    this.sprayCount = 300;

    this.initSunMotes();
    this.initSeaSpray();
  }

  initSunMotes() {
    // 1. Golden Sun Motes drifting in the midday breeze
    this.moteGeo = new THREE.BufferGeometry();
    this.motePositions = new Float32Array(this.moteCount * 3);
    this.moteScales = new Float32Array(this.moteCount);
    this.moteSpeeds = new Float32Array(this.moteCount);
    this.motePhases = new Float32Array(this.moteCount);

    for (let i = 0; i < this.moteCount; i++) {
      this.motePositions[i * 3] = randomRange(-16, 16);
      this.motePositions[i * 3 + 1] = randomRange(1.2, 11.0);
      this.motePositions[i * 3 + 2] = randomRange(-16, 16);

      this.moteScales[i] = randomRange(0.6, 2.0);
      this.moteSpeeds[i] = randomRange(0.25, 0.8);
      this.motePhases[i] = Math.random() * Math.PI * 2;
    }

    this.moteGeo.setAttribute('position', new THREE.BufferAttribute(this.motePositions, 3));
    this.moteGeo.setAttribute('aScale', new THREE.BufferAttribute(this.moteScales, 1));
    this.moteGeo.setAttribute('aPhase', new THREE.BufferAttribute(this.motePhases, 1));

    this.moteMat = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        attribute float aScale;
        attribute float aPhase;
        varying float vAlpha;

        void main() {
          vec3 p = position;
          p.x += sin(uTime * 0.7 + aPhase) * 0.4;
          p.z += cos(uTime * 0.5 + aPhase * 1.4) * 0.4;
          p.y += sin(uTime * 1.0 + aPhase * 0.8) * 0.2;

          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = aScale * (150.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;

          float vertFade = smoothstep(1.0, 3.0, p.y) * smoothstep(11.0, 7.5, p.y);
          float pulse = 0.75 + 0.25 * sin(uTime * 2.8 + aPhase * 3.5);
          vAlpha = vertFade * pulse;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float glow = pow(1.0 - (dist * 2.0), 2.0);
          gl_FragColor = vec4(uColor, glow * vAlpha * 0.85);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#d97706') } // Warm golden sunlight motes
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.motePoints = new THREE.Points(this.moteGeo, this.moteMat);
    this.scene.add(this.motePoints);
  }

  initSeaSpray() {
    // 2. Sparkling White Sea Spray Motes
    this.sprayGeo = new THREE.BufferGeometry();
    this.sprayPositions = new Float32Array(this.sprayCount * 3);
    this.sprayScales = new Float32Array(this.sprayCount);

    for (let i = 0; i < this.sprayCount; i++) {
      this.sprayPositions[i * 3] = randomRange(-22, 22);
      this.sprayPositions[i * 3 + 1] = randomRange(0.2, 2.2);
      this.sprayPositions[i * 3 + 2] = randomRange(-22, 22);

      this.sprayScales[i] = randomRange(1.0, 2.8);
    }

    this.sprayGeo.setAttribute('position', new THREE.BufferAttribute(this.sprayPositions, 3));
    this.sprayGeo.setAttribute('aScale', new THREE.BufferAttribute(this.sprayScales, 1));

    this.sprayMat = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        attribute float aScale;
        varying float vAlpha;

        void main() {
          vec3 p = position;
          p.x += sin(uTime * 0.4 + p.z * 0.2) * 0.5;
          p.z += cos(uTime * 0.3 + p.x * 0.2) * 0.35;

          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = aScale * (160.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;

          vAlpha = smoothstep(2.4, 0.4, p.y) * 0.5;
        }
      `,
      fragmentShader: `
        varying float vAlpha;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float mist = pow(1.0 - (dist * 2.0), 2.6);
          gl_FragColor = vec4(vec3(1.0, 1.0, 1.0), mist * vAlpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.sprayPoints = new THREE.Points(this.sprayGeo, this.sprayMat);
    this.scene.add(this.sprayPoints);
  }

  update(delta) {
    this.time += delta;
    this.moteMat.uniforms.uTime.value = this.time;
    this.sprayMat.uniforms.uTime.value = this.time;

    const pos = this.moteGeo.attributes.position.array;
    for (let i = 0; i < this.moteCount; i++) {
      pos[i * 3 + 1] += delta * this.moteSpeeds[i];
      if (pos[i * 3 + 1] > 11.0) {
        pos[i * 3 + 1] = 1.2;
        pos[i * 3] = randomRange(-16, 16);
        pos[i * 3 + 2] = randomRange(-16, 16);
      }
    }
    this.moteGeo.attributes.position.needsUpdate = true;
  }
}
