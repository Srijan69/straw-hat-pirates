import * as THREE from 'three';
import { randomRange } from '../utils/math.js';

export class Environment {
  constructor(experience) {
    this.experience = experience;
    this.scene = experience.scene;
    this.time = 0;

    this.setFog();
    this.setLights();
    this.setCelestialStarfield();
    this.setMoon();
    this.setVolumetricGodRays();
    this.setGrandLineSpires();
  }

  setFog() {
    // Deep nocturnal sea mist
    this.scene.fog = new THREE.FogExp2('#020610', 0.012);
  }

  setLights() {
    // 1. Deep Nocturnal Indigo Fill
    this.ambientLight = new THREE.AmbientLight('#0a1628', 0.85);
    this.scene.add(this.ambientLight);

    // 2. Directional Celestial Moonlight (Key Light)
    this.moonLight = new THREE.DirectionalLight('#dbeafe', 2.6);
    this.moonLight.position.set(25, 45, -35);
    this.moonLight.castShadow = true;
    this.moonLight.shadow.mapSize.width = 2048;
    this.moonLight.shadow.mapSize.height = 2048;
    this.moonLight.shadow.camera.near = 10;
    this.moonLight.shadow.camera.far = 130;
    this.moonLight.shadow.camera.left = -30;
    this.moonLight.shadow.camera.right = 30;
    this.moonLight.shadow.camera.top = 30;
    this.moonLight.shadow.camera.bottom = -30;
    this.moonLight.shadow.bias = -0.0004;
    this.moonLight.shadow.normalBias = 0.02;
    this.scene.add(this.moonLight);

    // 3. Cinematic Cyan Rim Light (Grazes ship ropes & ocean waves)
    this.rimLight = new THREE.DirectionalLight('#06b6d4', 1.3);
    this.rimLight.position.set(-35, 14, -45);
    this.scene.add(this.rimLight);

    // 4. Warm Front Key Fill for Ship (Illuminates hull wood, brass cannons & Sunny lion face)
    this.shipFillLight = new THREE.DirectionalLight('#ffedd5', 1.5);
    this.shipFillLight.position.set(-10, 8, 16);
    this.scene.add(this.shipFillLight);

    // 5. Subtle Warm Horizon Up-bounce
    this.bounceLight = new THREE.DirectionalLight('#1e3a5f', 0.5);
    this.bounceLight.position.set(0, -10, 20);
    this.scene.add(this.bounceLight);
  }

  setCelestialStarfield() {
    const starCount = 2400;
    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    const colorA = new THREE.Color('#f8fafc');
    const colorB = new THREE.Color('#93c5fd');
    const colorC = new THREE.Color('#fde68a');

    for (let i = 0; i < starCount; i++) {
      const radius = randomRange(85, 240);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(randomRange(0.04, 0.98));

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const r = Math.random();
      const chosen = r < 0.65 ? colorA : r < 0.88 ? colorB : colorC;
      colors[i * 3] = chosen.r;
      colors[i * 3 + 1] = chosen.g;
      colors[i * 3 + 2] = chosen.b;

      sizes[i] = randomRange(0.8, 2.2);
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;

        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (250.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = pow(1.0 - dist * 2.0, 2.0);
          gl_FragColor = vec4(vColor, alpha * 0.95);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.starField = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.starField);
  }

  setMoon() {
    const moonGroup = new THREE.Group();
    moonGroup.position.set(34, 48, -58);

    // High-Detail Moon Mesh with crater procedural shader
    const moonGeo = new THREE.SphereGeometry(4.2, 32, 32);
    const moonMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
            u.y
          );
        }

        void main() {
          float n = noise(vUv * 12.0) * 0.5 + noise(vUv * 24.0) * 0.25;
          vec3 mareColor = vec3(0.72, 0.78, 0.86);
          vec3 highlandColor = vec3(0.96, 0.98, 1.0);
          vec3 surfaceColor = mix(mareColor, highlandColor, smoothstep(0.3, 0.7, n));

          vec3 normal = normalize(vNormal);
          float limb = pow(clamp(normal.z, 0.0, 1.0), 0.35);

          gl_FragColor = vec4(surfaceColor * limb * 1.35, 1.0);
        }
      `,
      side: THREE.FrontSide
    });

    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.rotation.y = -Math.PI / 4;
    moonGroup.add(moonMesh);

    // Inner Corona Halo
    const halo1Geo = new THREE.PlaneGeometry(24, 24);
    const halo1Mat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        void main() {
          float dist = length(vUv - vec2(0.5));
          float alpha = smoothstep(0.5, 0.0, dist);
          alpha = pow(alpha, 2.5);
          gl_FragColor = vec4(vec3(0.75, 0.88, 1.0), alpha * 0.45);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const halo1Mesh = new THREE.Mesh(halo1Geo, halo1Mat);
    halo1Mesh.lookAt(0, 4.5, 14);
    moonGroup.add(halo1Mesh);

    // Outer Corona Halo
    const halo2Geo = new THREE.PlaneGeometry(48, 48);
    const halo2Mat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        void main() {
          float dist = length(vUv - vec2(0.5));
          float alpha = smoothstep(0.5, 0.0, dist);
          alpha = pow(alpha, 3.8);
          gl_FragColor = vec4(vec3(0.5, 0.75, 0.98), alpha * 0.22);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const halo2Mesh = new THREE.Mesh(halo2Geo, halo2Mat);
    halo2Mesh.lookAt(0, 4.5, 14);
    moonGroup.add(halo2Mesh);

    this.scene.add(moonGroup);
    this.moonGroup = moonGroup;
  }

  setVolumetricGodRays() {
    const rayGroup = new THREE.Group();
    const rayGeo = new THREE.CylinderGeometry(2.5, 24.0, 75.0, 24, 1, true);
    rayGeo.translate(0, -37.5, 0);

    this.godRayMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main() {
          float vertFade = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.45, vUv.y);
          float radialGlow = pow(max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 1.5);
          float beamPulsate = 0.85 + 0.15 * sin(uTime * 0.7 + vUv.y * 6.0);
          float alpha = vertFade * (0.08 + radialGlow * 0.14) * beamPulsate;
          vec3 beamColor = vec3(0.72, 0.88, 1.0);
          gl_FragColor = vec4(beamColor, alpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const rayMesh = new THREE.Mesh(rayGeo, this.godRayMat);
    rayMesh.position.set(34, 48, -58);
    rayMesh.lookAt(-5, 0, 5);
    rayMesh.rotateX(Math.PI / 2);
    rayGroup.add(rayMesh);

    this.scene.add(rayGroup);
    this.rayGroup = rayGroup;
  }

  setGrandLineSpires() {
    const spireGroup = new THREE.Group();

    const spireMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vNormal;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uFogColor;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;

        void main() {
          vec3 rockColor = vec3(0.025, 0.045, 0.08);
          float rim = pow(1.0 - max(dot(normalize(-vWorldPosition), vNormal), 0.0), 3.0);
          rockColor += vec3(0.05, 0.18, 0.3) * rim;

          float mist = smoothstep(12.0, 0.0, vWorldPosition.y) * 0.65;
          rockColor = mix(rockColor, uFogColor, mist);

          float dist = length(vWorldPosition);
          float fogFactor = 1.0 - exp(-dist * dist * 0.00008);
          vec3 finalColor = mix(rockColor, uFogColor, clamp(fogFactor, 0.0, 1.0));

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      uniforms: {
        uFogColor: { value: new THREE.Color('#020610') }
      }
    });

    const spirePositions = [
      { x: -55, z: -55, scaleY: 38, radius: 7 },
      { x: -75, z: -38, scaleY: 26, radius: 6 },
      { x: 55, z: -70, scaleY: 44, radius: 9 },
      { x: 80, z: -48, scaleY: 30, radius: 7 }
    ];

    spirePositions.forEach((pos) => {
      const geo = new THREE.ConeGeometry(pos.radius, pos.scaleY, 7);
      const mesh = new THREE.Mesh(geo, spireMat);
      mesh.position.set(pos.x, pos.scaleY * 0.45, pos.z);
      mesh.rotation.y = Math.random() * Math.PI;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      spireGroup.add(mesh);
    });

    this.scene.add(spireGroup);
  }

  update(delta) {
    this.time += delta;
    if (this.starField) {
      this.starField.rotation.y += delta * 0.004;
    }
    if (this.godRayMat && this.godRayMat.uniforms) {
      this.godRayMat.uniforms.uTime.value = this.time;
    }
  }
}
