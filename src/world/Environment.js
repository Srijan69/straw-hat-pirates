import * as THREE from 'three';
import { randomRange } from '../utils/math.js';

export class Environment {
  constructor(experience) {
    this.experience = experience;
    this.scene = experience.scene;
    this.time = 0;

    this.setFog();
    this.setLights();
    this.setSun();
    this.setVolumetricSunRays();
    this.setGrandLineIslands();
  }

  setFog() {
    // Soft tropical daylight sea mist
    this.scene.fog = new THREE.FogExp2('#e0f2fe', 0.0075);
  }

  setLights() {
    // 1. Ambient Sky Dome Light (Diffuses rich tropical azure sky light)
    this.ambientLight = new THREE.AmbientLight('#bae6fd', 1.35);
    this.scene.add(this.ambientLight);

    // 2. Primary Solar Key Light (Warm radiant Grand Line sun)
    this.sunLight = new THREE.DirectionalLight('#fff7ed', 3.2);
    this.sunLight.position.set(25, 55, -25);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 140;
    this.sunLight.shadow.camera.left = -30;
    this.sunLight.shadow.camera.right = 30;
    this.sunLight.shadow.camera.top = 30;
    this.sunLight.shadow.camera.bottom = -30;
    this.sunLight.shadow.bias = -0.0003;
    this.sunLight.shadow.normalBias = 0.02;
    this.scene.add(this.sunLight);

    // 3. Azure Sea Bounce Light
    this.seaBounceLight = new THREE.DirectionalLight('#38bdf8', 0.85);
    this.seaBounceLight.position.set(-20, 10, -35);
    this.scene.add(this.seaBounceLight);

    // 4. Warm Teak & Brass Ship Key Fill
    this.shipFillLight = new THREE.DirectionalLight('#fffbeb', 2.2);
    this.shipFillLight.position.set(2, 14, 20);
    this.scene.add(this.shipFillLight);
  }

  setSun() {
    const sunGroup = new THREE.Group();
    sunGroup.position.set(34, 52, -58);

    // Radiant Sun Core
    const sunGeo = new THREE.SphereGeometry(5.2, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xfffbeb
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sunMesh);

    // Inner Radiant Sunburst Corona
    const halo1Geo = new THREE.PlaneGeometry(28, 28);
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
          alpha = pow(alpha, 2.0);
          gl_FragColor = vec4(vec3(1.0, 0.92, 0.7), alpha * 0.55);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const halo1Mesh = new THREE.Mesh(halo1Geo, halo1Mat);
    halo1Mesh.lookAt(0, 4.5, 14);
    sunGroup.add(halo1Mesh);

    // Broad Atmospheric Sunlight Glow
    const halo2Geo = new THREE.PlaneGeometry(60, 60);
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
          alpha = pow(alpha, 3.2);
          gl_FragColor = vec4(vec3(0.98, 0.85, 0.5), alpha * 0.28);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const halo2Mesh = new THREE.Mesh(halo2Geo, halo2Mat);
    halo2Mesh.lookAt(0, 4.5, 14);
    sunGroup.add(halo2Mesh);

    this.scene.add(sunGroup);
    this.sunGroup = sunGroup;
  }

  setVolumetricSunRays() {
    // Golden Sunlight Shafts streaming down from the sun
    const rayGroup = new THREE.Group();
    const rayGeo = new THREE.CylinderGeometry(3.0, 26.0, 80.0, 24, 1, true);
    rayGeo.translate(0, -40.0, 0);

    this.sunRayMat = new THREE.ShaderMaterial({
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
          float vertFade = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.4, vUv.y);
          float radialGlow = pow(max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 1.5);
          float beamPulsate = 0.88 + 0.12 * sin(uTime * 0.6 + vUv.y * 5.0);
          float alpha = vertFade * (0.05 + radialGlow * 0.09) * beamPulsate;
          vec3 rayColor = vec3(1.0, 0.95, 0.82); // Golden sun rays
          gl_FragColor = vec4(rayColor, alpha);
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

    const rayMesh = new THREE.Mesh(rayGeo, this.sunRayMat);
    rayMesh.position.set(34, 52, -58);
    rayMesh.lookAt(-5, 0, 5);
    rayMesh.rotateX(Math.PI / 2);
    rayGroup.add(rayMesh);

    this.scene.add(rayGroup);
  }

  setGrandLineIslands() {
    // Distant tropical sea cliffs & Grand Line spires
    const islandGroup = new THREE.Group();

    const islandMat = new THREE.ShaderMaterial({
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
          // Lush tropical mountain rock (green canopy & slate volcanic stone)
          vec3 rockColor = mix(vec3(0.12, 0.28, 0.22), vec3(0.24, 0.32, 0.38), smoothstep(0.0, 25.0, vWorldPosition.y));

          // Soft sunlight rim
          float rim = pow(1.0 - max(dot(normalize(-vWorldPosition), vNormal), 0.0), 2.5);
          rockColor += vec3(0.3, 0.25, 0.15) * rim;

          // Atmospheric sea mist at water line
          float mist = smoothstep(10.0, 0.0, vWorldPosition.y) * 0.55;
          rockColor = mix(rockColor, uFogColor, mist);

          // Distance fog
          float dist = length(vWorldPosition);
          float fogFactor = 1.0 - exp(-dist * dist * 0.00005);
          vec3 finalColor = mix(rockColor, uFogColor, clamp(fogFactor, 0.0, 1.0));

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      uniforms: {
        uFogColor: { value: new THREE.Color('#e0f2fe') }
      }
    });

    const positions = [
      { x: -55, z: -55, scaleY: 36, radius: 7 },
      { x: -75, z: -38, scaleY: 26, radius: 6 },
      { x: 55, z: -70, scaleY: 42, radius: 9 },
      { x: 80, z: -48, scaleY: 30, radius: 7 }
    ];

    positions.forEach((pos) => {
      const geo = new THREE.ConeGeometry(pos.radius, pos.scaleY, 7);
      const mesh = new THREE.Mesh(geo, islandMat);
      mesh.position.set(pos.x, pos.scaleY * 0.45, pos.z);
      mesh.rotation.y = Math.random() * Math.PI;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      islandGroup.add(mesh);
    });

    this.scene.add(islandGroup);
  }

  update(delta) {
    this.time += delta;
    if (this.sunRayMat?.uniforms) {
      this.sunRayMat.uniforms.uTime.value = this.time;
    }
  }
}
