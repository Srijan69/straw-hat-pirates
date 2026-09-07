import * as THREE from 'three';
import { randomRange } from '../utils/math.js';

export class Environment {
  constructor(experience) {
    this.experience = experience;
    this.scene = experience.scene;

    this.setFog();
    this.setLights();
    this.setCelestialStarfield();
    this.setMoon();
    this.setGrandLineSpires();
  }

  setFog() {
    // Volumetric ocean fog
    this.scene.fog = new THREE.FogExp2('#04070e', 0.011);
  }

  setLights() {
    // 1. Ambient Moonlight / Atmosphere
    this.ambientLight = new THREE.AmbientLight('#1e293b', 0.85);
    this.scene.add(this.ambientLight);

    // 2. Directional Celestial Moonlight
    this.moonLight = new THREE.DirectionalLight('#bae6fd', 1.8);
    this.moonLight.position.set(20, 35, -25);
    this.moonLight.castShadow = true;
    this.moonLight.shadow.mapSize.width = 1024;
    this.moonLight.shadow.mapSize.height = 1024;
    this.moonLight.shadow.camera.near = 5;
    this.moonLight.shadow.camera.far = 120;
    this.moonLight.shadow.camera.left = -25;
    this.moonLight.shadow.camera.right = 25;
    this.moonLight.shadow.camera.top = 25;
    this.moonLight.shadow.camera.bottom = -25;
    this.moonLight.shadow.bias = -0.0005;
    this.scene.add(this.moonLight);

    // 3. Subtle Cyan Rim Light from horizon
    this.rimLight = new THREE.DirectionalLight('#00f0ff', 0.65);
    this.rimLight.position.set(-30, 8, -40);
    this.scene.add(this.rimLight);
  }

  setCelestialStarfield() {
    const starCount = 1800;
    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const colorA = new THREE.Color('#f8fafc');
    const colorB = new THREE.Color('#7dd3fc');
    const colorC = new THREE.Color('#fde68a');

    for (let i = 0; i < starCount; i++) {
      // Hemisphere distribution above water
      const radius = randomRange(90, 220);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(randomRange(0.05, 1.0)); // only above water level

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      // Varied star colors
      const r = Math.random();
      const chosenColor = r < 0.6 ? colorA : r < 0.85 ? colorB : colorC;
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true
    });

    this.starField = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.starField);
  }

  setMoon() {
    const moonGroup = new THREE.Group();
    moonGroup.position.set(32, 45, -55);

    // Moon Orb
    const moonGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({
      color: 0xf1f5f9
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonGroup.add(moonMesh);

    // Glowing Moon Aura / Halo
    const haloGeo = new THREE.PlaneGeometry(16, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.lookAt(0, 4.5, 14);
    moonGroup.add(haloMesh);

    this.scene.add(moonGroup);
  }

  setGrandLineSpires() {
    // Distant dark sea rock spires / Grand Line cliffs emerging from fog
    const spireGroup = new THREE.Group();
    const spireMat = new THREE.MeshStandardMaterial({
      color: 0x050a14,
      roughness: 0.95,
      metalness: 0.05
    });

    const spirePositions = [
      { x: -45, z: -50, scaleY: 28, radius: 6 },
      { x: -65, z: -35, scaleY: 22, radius: 5 },
      { x: 50, z: -60, scaleY: 35, radius: 8 },
      { x: 75, z: -45, scaleY: 25, radius: 6 }
    ];

    spirePositions.forEach((pos) => {
      const geo = new THREE.ConeGeometry(pos.radius, pos.scaleY, 6);
      const mesh = new THREE.Mesh(geo, spireMat);
      mesh.position.set(pos.x, pos.scaleY * 0.4, pos.z);
      mesh.rotation.y = Math.random() * Math.PI;
      spireGroup.add(mesh);
    });

    this.scene.add(spireGroup);
  }

  update(delta) {
    if (this.starField) {
      this.starField.rotation.y += delta * 0.005;
    }
  }
}
