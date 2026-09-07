import * as THREE from 'three';
import { lerp } from '../utils/math.js';

export class Ship {
  constructor(experience) {
    this.experience = experience;
    this.scene = experience.scene;
    this.ocean = experience.world?.ocean;

    this.group = new THREE.Group();
    this.lanterns = [];
    this.sails = [];
    this.time = 0;

    // Physics parameters
    this.targetY = 0;
    this.targetPitch = 0;
    this.targetRoll = 0;

    this.createMaterials();
    this.buildShipModel();
    this.scene.add(this.group);
  }

  createMaterials() {
    // Teak Wood Hull
    this.hullMat = new THREE.MeshStandardMaterial({
      color: 0x1f140e,
      roughness: 0.7,
      metalness: 0.1
    });

    // Darker Wood Trim & Railings
    this.darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x0f0b08,
      roughness: 0.8,
      metalness: 0.05
    });

    // Gold Trim & Sun Figurehead
    this.goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.35,
      metalness: 0.85,
      emissive: 0xb45309,
      emissiveIntensity: 0.2
    });

    // Straw Hat Red Ribbon Accent
    this.redMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.5,
      metalness: 0.2
    });

    // Billowing Canvas Sails with Wind Flapping Shader
    this.sailMat = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vNormal;

        void main() {
          vUv = uv;
          vNormal = normal;

          vec3 p = position;
          // Billow curve outwards + gentle wind fluttering
          float billow = sin(uv.y * 3.1415) * 0.45;
          float flutter = sin(uTime * 2.5 + uv.y * 4.0 + uv.x * 3.0) * 0.08 * (1.0 - uv.y);
          p.z += billow + flutter;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uSailColor;
        varying vec2 vUv;
        varying vec3 vNormal;

        void main() {
          vec3 col = uSailColor;

          // Simple procedural skull shadow imprint on main sail
          vec2 center = vUv - vec2(0.5, 0.52);
          float d = length(center);
          if (d < 0.24) {
            col = mix(col, vec3(0.12, 0.08, 0.05), 0.85);
          }
          // Straw hat brim on sail emblem
          if (abs(center.y - 0.12) < 0.03 && abs(center.x) < 0.28) {
            col = vec3(0.9, 0.6, 0.1);
          }

          // Shading
          float light = clamp(dot(normalize(vNormal), vec3(0.3, 0.8, 0.5)), 0.35, 1.0);
          gl_FragColor = vec4(col * light, 1.0);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uSailColor: { value: new THREE.Color(0xf1ece4) }
      },
      side: THREE.DoubleSide
    });

    // Glowing Lantern Core Material
    this.lanternGlowMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a
    });
  }

  buildShipModel() {
    // 1. Lower Keel & Hull
    const hullGeo = new THREE.BoxGeometry(2.6, 1.8, 8.5);
    // Taper front and back vertices for a sleek nautical bow and stern
    const pos = hullGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let z = pos.getZ(i);
      let y = pos.getY(i);
      let x = pos.getX(i);

      // Bow taper (z > 0)
      if (z > 0) {
        let factor = 1.0 - (z / 4.25) * 0.65;
        pos.setX(i, x * factor);
        if (y < 0) pos.setY(i, y * 0.8);
      }
      // Stern taper (z < 0)
      if (z < 0) {
        let factor = 1.0 - Math.abs(z / 4.25) * 0.35;
        pos.setX(i, x * factor);
      }
    }
    hullGeo.computeVertexNormals();
    const hullMesh = new THREE.Mesh(hullGeo, this.hullMat);
    hullMesh.position.y = 0.9;
    hullMesh.castShadow = true;
    hullMesh.receiveShadow = true;
    this.group.add(hullMesh);

    // 2. Gold Trim Gunwale Strips
    const trimGeo = new THREE.BoxGeometry(2.7, 0.18, 8.6);
    const trimMesh = new THREE.Mesh(trimGeo, this.goldMat);
    trimMesh.position.y = 1.8;
    this.group.add(trimMesh);

    // 3. Deck Planking
    const deckGeo = new THREE.BoxGeometry(2.4, 0.15, 8.2);
    const deckMesh = new THREE.Mesh(deckGeo, this.darkWoodMat);
    deckMesh.position.y = 1.85;
    this.group.add(deckMesh);

    // 4. Stern Cabin (Captain's Quarters)
    const cabinGeo = new THREE.BoxGeometry(2.3, 1.5, 2.4);
    const cabinMesh = new THREE.Mesh(cabinGeo, this.hullMat);
    cabinMesh.position.set(0, 2.5, -2.7);
    this.group.add(cabinMesh);

    // Cabin Roof & Gold Finials
    const cabinRoofGeo = new THREE.BoxGeometry(2.5, 0.25, 2.6);
    const cabinRoof = new THREE.Mesh(cabinRoofGeo, this.goldMat);
    cabinRoof.position.set(0, 3.3, -2.7);
    this.group.add(cabinRoof);

    // Cabin Glowing Windows
    const windowGeo = new THREE.PlaneGeometry(1.6, 0.7);
    const windowMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide
    });
    const windowMesh = new THREE.Mesh(windowGeo, windowMat);
    windowMesh.position.set(0, 2.6, -3.92);
    windowMesh.rotation.y = Math.PI;
    this.group.add(windowMesh);

    // 5. Lion / Sun Figurehead (Thousand Sunny Inspired)
    const figureheadGroup = new THREE.Group();
    figureheadGroup.position.set(0, 2.1, 4.4);

    // Lion Face Core
    const headGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const headMesh = new THREE.Mesh(headGeo, this.goldMat);
    figureheadGroup.add(headMesh);

    // Lion Mane Petals
    const maneCount = 10;
    for (let i = 0; i < maneCount; i++) {
      const angle = (i / maneCount) * Math.PI * 2;
      const petalGeo = new THREE.ConeGeometry(0.2, 0.7, 8);
      const petalMesh = new THREE.Mesh(petalGeo, this.goldMat);
      petalMesh.position.set(Math.cos(angle) * 0.65, Math.sin(angle) * 0.65, -0.1);
      petalMesh.rotation.z = angle - Math.PI / 2;
      petalMesh.rotation.x = Math.PI / 2;
      figureheadGroup.add(petalMesh);
    }

    // Bowsprit pole
    const bowspritGeo = new THREE.CylinderGeometry(0.08, 0.12, 2.2, 8);
    const bowspritMesh = new THREE.Mesh(bowspritGeo, this.darkWoodMat);
    bowspritMesh.rotation.x = Math.PI / 3;
    bowspritMesh.position.set(0, 0.4, 0.8);
    figureheadGroup.add(bowspritMesh);

    this.group.add(figureheadGroup);

    // 6. Masts
    // Main Mast (Center)
    this.createMast(0, 1.8, 0.2, 7.5, 3.2, 2.4, true);

    // Foremast (Front)
    this.createMast(0, 1.8, 2.4, 6.0, 2.4, 1.8, false);

    // Mizzen Mast (Aft)
    this.createMast(0, 3.3, -2.4, 4.8, 1.8, 1.4, false);

    // 7. Warm Deck Lanterns with Real PointLights
    this.createLantern(0, 2.8, 4.2);   // Bow Lantern
    this.createLantern(-1.2, 2.3, 0);  // Port Lantern
    this.createLantern(1.2, 2.3, 0);   // Starboard Lantern
    this.createLantern(0, 3.8, -3.8);  // Stern Lantern

    // Overall Ship Group Scaling and Initial Placement
    this.group.scale.set(0.9, 0.9, 0.9);
    this.group.position.set(0, 0, 0);
  }

  createMast(x, y, z, height, yardWidth, sailHeight, isMain = false) {
    const mastGroup = new THREE.Group();
    mastGroup.position.set(x, y, z);

    // Vertical Pole
    const mastGeo = new THREE.CylinderGeometry(0.08, 0.14, height, 10);
    const mastMesh = new THREE.Mesh(mastGeo, this.darkWoodMat);
    mastMesh.position.y = height / 2;
    mastMesh.castShadow = true;
    mastGroup.add(mastMesh);

    // Horizontal Yard (Cross-spar)
    const yardGeo = new THREE.CylinderGeometry(0.06, 0.06, yardWidth, 8);
    const yardMesh = new THREE.Mesh(yardGeo, this.darkWoodMat);
    yardMesh.rotation.z = Math.PI / 2;
    yardMesh.position.y = height * 0.78;
    mastGroup.add(yardMesh);

    // Crow's Nest
    const nestGeo = new THREE.CylinderGeometry(0.4, 0.35, 0.45, 12, 1, true);
    const nestMesh = new THREE.Mesh(nestGeo, this.hullMat);
    nestMesh.position.y = height * 0.85;
    mastGroup.add(nestMesh);

    // Pirate Flag on Mast Top
    const flagGeo = new THREE.PlaneGeometry(0.8, 0.45);
    const flagMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0c,
      side: THREE.DoubleSide
    });
    const flagMesh = new THREE.Mesh(flagGeo, flagMat);
    flagMesh.position.set(0.4, height + 0.15, 0);
    mastGroup.add(flagMesh);

    // Billowing Sail Mesh
    const sailGeo = new THREE.PlaneGeometry(yardWidth * 0.92, sailHeight, 20, 20);
    const sailMesh = new THREE.Mesh(sailGeo, isMain ? this.sailMat : this.sailMat.clone());
    sailMesh.position.set(0, height * 0.55, 0.15);
    sailMesh.castShadow = true;
    mastGroup.add(sailMesh);

    this.sails.push(sailMesh);
    this.group.add(mastGroup);
  }

  createLantern(x, y, z) {
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(x, y, z);

    // Lantern Frame
    const frameGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.35, 6);
    const frameMesh = new THREE.Mesh(frameGeo, this.goldMat);
    lanternGroup.add(frameMesh);

    // Glowing Lantern Core
    const coreGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const coreMesh = new THREE.Mesh(coreGeo, this.lanternGlowMat);
    lanternGroup.add(coreMesh);

    // Warm Point Light with shadows
    const light = new THREE.PointLight(0xf59e0b, 1.6, 9, 2);
    light.castShadow = false; // keep fast performance
    lanternGroup.add(light);

    this.lanterns.push({ group: lanternGroup, light, baseIntensity: 1.6 });
    this.group.add(lanternGroup);
  }

  update(delta) {
    this.time += delta;

    // 1. Animate sails
    if (this.sailMat.uniforms) {
      this.sailMat.uniforms.uTime.value = this.time;
    }

    // 2. Animate lantern light flicker
    this.lanterns.forEach((l, index) => {
      const noise = Math.sin(this.time * 6 + index * 1.7) * 0.25 + Math.cos(this.time * 11 + index) * 0.15;
      l.light.intensity = l.baseIntensity + noise;
    });

    // 3. Realistic Buoyancy & Wave Dynamics
    const ocean = this.experience.world?.ocean;
    if (ocean) {
      const shipX = this.group.position.x;
      const shipZ = this.group.position.z;

      // Compute wave heights at bow and stern for pitch
      const bowY = ocean.getWaveHeight(shipX, shipZ + 3.5, this.time);
      const sternY = ocean.getWaveHeight(shipX, shipZ - 3.5, this.time);
      const centerY = ocean.getWaveHeight(shipX, shipZ, this.time);

      // Compute wave heights at port and starboard for roll
      const portY = ocean.getWaveHeight(shipX - 1.5, shipZ, this.time);
      const stbdY = ocean.getWaveHeight(shipX + 1.5, shipZ, this.time);

      // Target heave, pitch and roll
      this.targetY = centerY * 0.85 + 0.2;
      this.targetPitch = (bowY - sternY) * 0.08;
      this.targetRoll = (portY - stbdY) * 0.12;

      // Smooth dampening physics
      this.group.position.y = lerp(this.group.position.y, this.targetY, 0.08);
      this.group.rotation.x = lerp(this.group.rotation.x, this.targetPitch, 0.06);
      this.group.rotation.z = lerp(this.group.rotation.z, this.targetRoll, 0.06);

      // Subtle yaw swaying
      this.group.rotation.y = Math.sin(this.time * 0.35) * 0.03;
    }
  }
}
