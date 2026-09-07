import * as THREE from 'three';
import { randomRange } from '../utils/math.js';

export class Particles {
  constructor(experience) {
    this.experience = experience;
    this.scene = experience.scene;
    this.time = 0;

    this.emberCount = 380;
    this.sprayCount = 320;

    this.initEmbers();
    this.initSeaSpray();
  }

  initEmbers() {
    // 1. Warm Firefly / Lantern Embers
    this.emberGeo = new THREE.BufferGeometry();
    this.emberPositions = new Float32Array(this.emberCount * 3);
    this.emberScales = new Float32Array(this.emberCount);
    this.emberSpeeds = new Float32Array(this.emberCount);
    this.emberPhases = new Float32Array(this.emberCount);

    for (let i = 0; i < this.emberCount; i++) {
      this.emberPositions[i * 3] = randomRange(-14, 14);
      this.emberPositions[i * 3 + 1] = randomRange(1.2, 10.5);
      this.emberPositions[i * 3 + 2] = randomRange(-14, 14);

      this.emberScales[i] = randomRange(0.6, 2.2);
      this.emberSpeeds[i] = randomRange(0.3, 0.9);
      this.emberPhases[i] = Math.random() * Math.PI * 2;
    }

    this.emberGeo.setAttribute('position', new THREE.BufferAttribute(this.emberPositions, 3));
    this.emberGeo.setAttribute('aScale', new THREE.BufferAttribute(this.emberScales, 1));
    this.emberGeo.setAttribute('aPhase', new THREE.BufferAttribute(this.emberPhases, 1));

    this.emberMat = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        attribute float aScale;
        attribute float aPhase;
        varying float vAlpha;

        void main() {
          vec3 p = position;

          // Organic 3D drifting motion with curl-like harmonic frequencies
          p.x += sin(uTime * 0.8 + aPhase) * 0.45;
          p.z += cos(uTime * 0.6 + aPhase * 1.5) * 0.45;
          p.y += sin(uTime * 1.2 + aPhase * 0.8) * 0.25;

          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = aScale * (160.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;

          // Fade out near water and high in air
          float vertFade = smoothstep(1.0, 3.0, p.y) * smoothstep(11.0, 7.5, p.y);
          // Subtle pulsation
          float pulse = 0.75 + 0.25 * sin(uTime * 3.0 + aPhase * 4.0);
          vAlpha = vertFade * pulse;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;

          // Soft Gaussian-style radial falloff for luminous organic glow
          float glow = pow(1.0 - (dist * 2.0), 2.2);
          gl_FragColor = vec4(uColor, glow * vAlpha * 0.85);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#f59e0b') } // Golden amber
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.emberPoints = new THREE.Points(this.emberGeo, this.emberMat);
    this.scene.add(this.emberPoints);
  }

  initSeaSpray() {
    // 2. Cyan Nocturnal Ocean Spray Mist Particles (hovering near wave surface)
    this.sprayGeo = new THREE.BufferGeometry();
    this.sprayPositions = new Float32Array(this.sprayCount * 3);
    this.sprayScales = new Float32Array(this.sprayCount);

    for (let i = 0; i < this.sprayCount; i++) {
      this.sprayPositions[i * 3] = randomRange(-22, 22);
      this.sprayPositions[i * 3 + 1] = randomRange(0.1, 2.2);
      this.sprayPositions[i * 3 + 2] = randomRange(-22, 22);

      this.sprayScales[i] = randomRange(1.0, 3.0);
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
          // Wind sweep across ocean surface
          p.x += sin(uTime * 0.4 + p.z * 0.2) * 0.6;
          p.z += cos(uTime * 0.3 + p.x * 0.2) * 0.4;

          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = aScale * (180.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;

          vAlpha = smoothstep(2.5, 0.5, p.y) * 0.45;
        }
      `,
      fragmentShader: `
        varying float vAlpha;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float mist = pow(1.0 - (dist * 2.0), 3.0);
          gl_FragColor = vec4(vec3(0.55, 0.85, 1.0), mist * vAlpha);
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
    this.emberMat.uniforms.uTime.value = this.time;
    this.sprayMat.uniforms.uTime.value = this.time;

    // Slowly rise embers
    const pos = this.emberGeo.attributes.position.array;
    for (let i = 0; i < this.emberCount; i++) {
      pos[i * 3 + 1] += delta * this.emberSpeeds[i];
      if (pos[i * 3 + 1] > 11.0) {
        pos[i * 3 + 1] = 1.2;
        pos[i * 3] = randomRange(-14, 14);
        pos[i * 3 + 2] = randomRange(-14, 14);
      }
    }
    this.emberGeo.attributes.position.needsUpdate = true;
  }
}
