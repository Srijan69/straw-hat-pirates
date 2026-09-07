import * as THREE from 'three';
import { randomRange } from '../utils/math.js';

export class Particles {
  constructor(experience) {
    this.experience = experience;
    this.scene = experience.scene;

    this.count = 450;
    this.time = 0;

    this.init();
  }

  init() {
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.count * 3);
    this.scales = new Float32Array(this.count);
    this.speeds = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      // Clustered around the ship and surrounding ocean
      this.positions[i * 3] = randomRange(-20, 20);
      this.positions[i * 3 + 1] = randomRange(0.2, 10);
      this.positions[i * 3 + 2] = randomRange(-20, 20);

      this.scales[i] = randomRange(0.4, 1.8);
      this.speeds[i] = randomRange(0.3, 1.2);
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('aScale', new THREE.BufferAttribute(this.scales, 1));

    // Custom glowing particle shader
    this.material = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        attribute float aScale;
        varying float vAlpha;

        void main() {
          vec3 p = position;
          // Float upwards and drift in wind
          p.y += sin(uTime * 0.8 + p.x * 0.5) * 0.4;
          p.x += sin(uTime * 0.5 + p.z * 0.3) * 0.3;

          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = aScale * (120.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;

          vAlpha = smoothstep(12.0, 3.0, p.y);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;

        void main() {
          // Circular particle with soft glowing falloff
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;

          float glow = pow(1.0 - (dist * 2.0), 1.8);
          gl_FragColor = vec4(uColor, glow * vAlpha * 0.75);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#f59e0b') } // Warm amber firefly glow
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }

  update(delta) {
    this.time += delta;
    this.material.uniforms.uTime.value = this.time;

    // Slowly rise and loop back down
    const pos = this.geometry.attributes.position.array;
    for (let i = 0; i < this.count; i++) {
      pos[i * 3 + 1] += delta * this.speeds[i];
      if (pos[i * 3 + 1] > 11) {
        pos[i * 3 + 1] = 0.2;
        pos[i * 3] = randomRange(-22, 22);
        pos[i * 3 + 2] = randomRange(-22, 22);
      }
    }
    this.geometry.attributes.position.needsUpdate = true;
  }
}
