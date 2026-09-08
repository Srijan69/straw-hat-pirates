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

    // Staging parameters - Majestic frontal 3/4 heroic composition: Sunny lion prow faces viewer proudly
    this.baseX = 12.8;
    this.baseZ = -0.8;
    this.baseRotationY = 0.28; // ~16 degrees: lion figurehead and Jolly Roger sail face camera heroically

    // Deep natural water draft immersion
    this.draftOffset = -0.68; // Hull sits naturally immersed with sheer stripe and lion prow gleaming above water
    this.targetY = this.draftOffset;
    this.targetPitch = 0;
    this.targetRoll = 0;

    // Scroll-driven dynamic response parameters
    this.scrollOffset = {
      x: 0,
      y: 0,
      z: 0,
      rotationY: 0,
      roll: 0,
      pitch: 0,
      sailFlutter: 1.0
    };

    this.updateBasePositionForScreen();
    this.createMaterials();
    this.buildShipModel();
    this.scene.add(this.group);
  }

  createMaterials() {
    // 1. High-Detail Procedural Wood & Lawn Textures
    this.woodPlankTexture = this.createWoodPlankTexture();
    this.deckPlankTexture = this.createDeckPlankTexture();
    this.lawnTexture = this.createLawnTexture();
    this.stonePaverTexture = this.createStonePaverTexture();

    // Hull Upper Material (Rich Varnished Sunny Teak)
    this.hullMat = new THREE.MeshStandardMaterial({
      map: this.woodPlankTexture,
      roughness: 0.46,
      metalness: 0.08
    });

    // Hull Lower Waterline Material (Submerged Naval Anti-Fouling Dark Copper)
    this.lowerHullMat = new THREE.MeshStandardMaterial({
      color: 0x241812,
      roughness: 0.72,
      metalness: 0.18
    });

    // Dark Teak Accent Wales, Trim, Capstans & Mast Spars
    this.darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x20140e,
      roughness: 0.65,
      metalness: 0.04
    });

    // Deck Flooring Material
    this.deckMat = new THREE.MeshStandardMaterial({
      map: this.deckPlankTexture,
      roughness: 0.62,
      metalness: 0.04
    });

    // Thousand Sunny Lawn Turf Material (Lush Green Grass)
    this.lawnMat = new THREE.MeshStandardMaterial({
      map: this.lawnTexture,
      roughness: 0.85,
      metalness: 0.02
    });

    // Lawn Central Stone Path
    this.stoneMat = new THREE.MeshStandardMaterial({
      map: this.stonePaverTexture,
      roughness: 0.75,
      metalness: 0.05
    });

    // Polished Naval Gold & Brass (Sunny Lion Mane, Railings, Coup de Burst rim)
    this.goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.22,
      metalness: 0.92,
      emissive: 0xb45309,
      emissiveIntensity: 0.24
    });

    // Thousand Sunny Signature Crimson Paint (Sunbursts, Soldier Dock & Trim)
    this.paintRedMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.40,
      metalness: 0.15
    });

    // Sunny Vibrant Orange Accent (Soldier Dock channel markings & mast collars)
    this.sunnyOrangeMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.38,
      metalness: 0.12
    });

    // Pure Ivory Bone Material for Crossbones behind head
    this.boneMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.45,
      metalness: 0.05
    });

    // Forged Naval Iron (Gaon Cannon barrel, Coup de Burst interior, Chains)
    this.ironMat = new THREE.MeshStandardMaterial({
      color: 0x1e242b,
      roughness: 0.38,
      metalness: 0.88
    });

    // Rigging Cordage & Shrouds
    this.ropeMat = new THREE.MeshStandardMaterial({
      color: 0x5a4838,
      roughness: 0.92,
      metalness: 0.02
    });

    // Glass & Aquarium Windows
    this.windowMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.12,
      metalness: 0.6,
      emissive: 0x0369a1,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.85
    });

    // Distinctive Thousand Sunny Canvas Sails Textures
    this.jollyRogerTexture = this.createSunnyJollyRogerTexture();
    this.plainSailTexture = this.createSunnyPlainSailTexture();

    // Translucent Backlit Canvas Sails Shaders
    this.jollyRogerSailMat = this.createSailShaderMaterial(this.jollyRogerTexture);
    this.plainSailMat = this.createSailShaderMaterial(this.plainSailTexture);

    // Dedicated Wireframe Material for Lantern Cage
    this.lanternCageMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
      metalness: 0.88,
      wireframe: true
    });

    // Lantern Core & Warm Amber Glass
    this.lanternCoreMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
  }

  createWoodPlankTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Rich teak base
    ctx.fillStyle = '#b46328';
    ctx.fillRect(0, 0, 1024, 1024);

    const plankHeight = 32;
    const numPlanks = 1024 / plankHeight;

    for (let i = 0; i < numPlanks; i++) {
      const y = i * plankHeight;
      const shade = (Math.random() - 0.5) * 22;
      ctx.fillStyle = `rgb(${180 + shade}, ${99 + shade * 0.6}, ${40 + shade * 0.3})`;
      ctx.fillRect(0, y, 1024, plankHeight);

      // Wood grain lines
      ctx.strokeStyle = 'rgba(70, 32, 10, 0.22)';
      ctx.lineWidth = 1;
      for (let j = 0; j < 8; j++) {
        ctx.beginPath();
        const lineY = y + Math.random() * plankHeight;
        ctx.moveTo(0, lineY);
        ctx.bezierCurveTo(256, lineY + (Math.random() - 0.5) * 6, 768, lineY + (Math.random() - 0.5) * 6, 1024, lineY);
        ctx.stroke();
      }

      // Plank seam grooves
      ctx.strokeStyle = '#3b1d0c';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  createDeckPlankTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Clean Scandinavian naval deck
    ctx.fillStyle = '#d99b61';
    ctx.fillRect(0, 0, 1024, 1024);

    const plankWidth = 24;
    const numPlanks = 1024 / plankWidth;

    for (let i = 0; i < numPlanks; i++) {
      const x = i * plankWidth;
      const shade = (Math.random() - 0.5) * 16;
      ctx.fillStyle = `rgb(${217 + shade}, ${155 + shade * 0.7}, ${97 + shade * 0.4})`;
      ctx.fillRect(x, 0, plankWidth, 1024);

      ctx.strokeStyle = '#4a250e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 3);
    return texture;
  }

  createLawnTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Vibrant Thousand Sunny grass green
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(0, 0, 512, 512);

    // Grass blade variation
    for (let i = 0; i < 18000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const shade = Math.random() * 40 - 20;
      ctx.fillStyle = `rgba(${34 + shade * 0.4}, ${197 + shade}, ${94 + shade * 0.3}, 0.65)`;
      ctx.fillRect(x, y, 2 + Math.random() * 2, 4 + Math.random() * 4);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 8);
    return texture;
  }

  createStonePaverTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    for (let y = 0; y < 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
      for (let x = 0; x < 256; x += 32) {
        ctx.strokeRect(x, y, 32, 32);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 6);
    return texture;
  }

  createSunnyJollyRogerTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 1. Warm ivory sail canvas
    ctx.fillStyle = '#fefce8';
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. Thousand Sunny Distinctive Orange / Yellow Accent Stripes
    ctx.fillStyle = 'rgba(249, 115, 22, 0.88)';
    ctx.fillRect(0, 40, 1024, 85);
    ctx.fillRect(0, 895, 1024, 90);

    ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
    ctx.fillRect(0, 130, 1024, 40);
    ctx.fillRect(0, 850, 1024, 40);

    // Fine canvas fabric weave
    for (let i = 0; i < 9000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const shade = Math.random() * 24 - 12;
      ctx.fillStyle = `rgba(${210 + shade}, ${200 + shade}, ${180 + shade}, 0.16)`;
      ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }

    // Vertical canvas cloth seams
    ctx.strokeStyle = 'rgba(125, 105, 80, 0.25)';
    ctx.lineWidth = 3;
    ctx.setLineDash([16, 12]);
    for (let x = 170; x < 1024; x += 170) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // ----------------------------------------------------
    // Authentic One Piece Straw Hat Jolly Roger Emblem
    // ----------------------------------------------------
    ctx.save();
    ctx.translate(512, 530);
    ctx.scale(0.85, 0.85);

    // Crossed Bones (Dark pirate ink)
    ctx.fillStyle = '#110e0b';
    ctx.strokeStyle = '#110e0b';
    ctx.lineWidth = 46;
    ctx.lineCap = 'round';

    // Bone 1: Top-Left to Bottom-Right
    ctx.beginPath();
    ctx.moveTo(-310, -230);
    ctx.lineTo(310, 230);
    ctx.stroke();
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.arc(dir * 310 - dir * 18, dir * 230 + 24, 34, 0, Math.PI * 2);
      ctx.arc(dir * 310 + 24, dir * 230 - dir * 18, 34, 0, Math.PI * 2);
      ctx.fill();
    });

    // Bone 2: Bottom-Left to Top-Right
    ctx.beginPath();
    ctx.moveTo(-310, 230);
    ctx.lineTo(310, -230);
    ctx.stroke();
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.arc(dir * 310 - dir * 18, -dir * 230 - 24, 34, 0, Math.PI * 2);
      ctx.arc(dir * 310 + 24, -dir * 230 + dir * 18, 34, 0, Math.PI * 2);
      ctx.fill();
    });

    // Skull Head
    ctx.beginPath();
    ctx.ellipse(0, 5, 195, 175, 0, 0, Math.PI * 2);
    ctx.fill();

    // Jaw Outline
    ctx.beginPath();
    ctx.moveTo(-115, 120);
    ctx.lineTo(-85, 235);
    ctx.quadraticCurveTo(0, 255, 85, 235);
    ctx.lineTo(115, 120);
    ctx.closePath();
    ctx.fill();

    // Large Round Hollow Eyes
    ctx.fillStyle = '#fefce8';
    ctx.beginPath();
    ctx.ellipse(-65, 52, 48, 56, -0.06, 0, Math.PI * 2);
    ctx.ellipse(65, 52, 48, 56, 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Inverted Heart Nose Cavity
    ctx.beginPath();
    ctx.moveTo(0, 112);
    ctx.lineTo(-18, 142);
    ctx.lineTo(18, 142);
    ctx.closePath();
    ctx.fill();

    // Big One Piece Pirate Grin
    ctx.strokeStyle = '#fefce8';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 160, 88, 0.18 * Math.PI, 0.82 * Math.PI, false);
    ctx.stroke();

    // Teeth Dividing Lines
    ctx.lineWidth = 7;
    [-55, -28, 0, 28, 55].forEach((tx) => {
      ctx.beginPath();
      ctx.moveTo(tx, 192);
      ctx.lineTo(tx, 226);
      ctx.stroke();
    });

    // ----------------------------------------------------
    // The Iconic Straw Hat (Mugiwara)
    // ----------------------------------------------------
    // Hat Brim
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(0, -95, 245, 52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Hat Crown
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(0, -155, 138, 105, 0, Math.PI, 0, false);
    ctx.fill();
    ctx.stroke();

    // Red Ribbon Band
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(0, -118, 142, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  createSunnyPlainSailTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Warm ivory base
    ctx.fillStyle = '#fefce8';
    ctx.fillRect(0, 0, 1024, 1024);

    // Sunny orange & yellow stripes on topsails
    ctx.fillStyle = 'rgba(249, 115, 22, 0.85)';
    ctx.fillRect(0, 50, 1024, 110);
    ctx.fillRect(0, 860, 1024, 110);

    ctx.fillStyle = 'rgba(245, 158, 11, 0.82)';
    ctx.fillRect(0, 165, 1024, 45);
    ctx.fillRect(0, 810, 1024, 45);

    // Fabric weave
    for (let i = 0; i < 9000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const shade = Math.random() * 24 - 12;
      ctx.fillStyle = `rgba(${210 + shade}, ${200 + shade}, ${180 + shade}, 0.16)`;
      ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }

    // Seams
    ctx.strokeStyle = 'rgba(125, 105, 80, 0.25)';
    ctx.lineWidth = 3;
    ctx.setLineDash([16, 12]);
    for (let x = 170; x < 1024; x += 170) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  createSailShaderMaterial(textureMap) {
    return new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: textureMap },
        uTime: { value: 0 },
        uSunDirection: { value: new THREE.Vector3(25, 55, -25).normalize() },
        uSunColor: { value: new THREE.Color('#fffbeb') }
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vec3 p = position;

          // Billowing canvas curvature + harmonic wind flutter
          float billow = sin(vUv.x * 3.14159) * sin(vUv.y * 3.14159) * 0.42;
          float flutter = sin(uTime * 2.8 + vUv.x * 6.0 + vUv.y * 4.0) * 0.05 * (1.0 - vUv.y);
          p.z += billow + flutter;

          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(p, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D uMap;
        uniform vec3 uSunDirection;
        uniform vec3 uSunColor;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec4 texColor = texture2D(uMap, vUv);
          vec3 norm = normalize(vNormal);

          // Standard diffuse lighting
          float nDotL = dot(norm, uSunDirection);
          float directLight = max(nDotL, 0.0);

          // Translucent fabric transmission (Subsurface backlight through canvas)
          float backLight = max(-nDotL, 0.0) * 0.65;
          float totalLight = 0.45 + directLight * 0.65 + backLight;

          vec3 finalColor = texColor.rgb * totalLight * uSunColor;
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });
  }

  buildShipModel() {
    // ----------------------------------------------------
    // 1. Thousand Sunny Master Hull Architecture
    // ----------------------------------------------------
    const hullGeometry = new THREE.BoxGeometry(3.2, 2.4, 9.6, 6, 4, 16);
    const pos = hullGeometry.attributes.position;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      vertex.fromBufferAttribute(pos, i);

      // Ship Prow (Bow tapering)
      if (vertex.z > 1.0) {
        const bowTaper = Math.max(0.12, 1.0 - ((vertex.z - 1.0) / 3.8) * 0.72);
        vertex.x *= bowTaper;
        vertex.y += (vertex.z - 1.0) * 0.16; // Forecastle sheer lift
      }

      // Ship Poop Deck (Stern rounding)
      if (vertex.z < -1.0) {
        const sternTaper = Math.max(0.35, 1.0 - (Math.abs(vertex.z + 1.0) / 3.8) * 0.28);
        vertex.x *= sternTaper;
        vertex.y += Math.abs(vertex.z + 1.0) * 0.24; // High poop deck sheer
      }

      // Tumblehome & Rounded Bottom
      if (vertex.y < 0) {
        const keelTaper = Math.max(0.15, 1.0 + (vertex.y / 1.2) * 0.65);
        vertex.x *= keelTaper;
      }

      pos.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    hullGeometry.computeVertexNormals();

    const hullMesh = new THREE.Mesh(hullGeometry, this.hullMat);
    hullMesh.position.y = 1.08;
    hullMesh.castShadow = true;
    hullMesh.receiveShadow = true;
    this.group.add(hullMesh);

    // Waterline Lower Keel
    const lowerHullGeo = new THREE.CylinderGeometry(0.38, 0.14, 9.6, 12);
    lowerHullGeo.rotateX(Math.PI / 2);
    const lowerHull = new THREE.Mesh(lowerHullGeo, this.lowerHullMat);
    lowerHull.position.y = 0.08;
    this.group.add(lowerHull);

    // Gilded Gunwale Railing Capping
    const railGeo = new THREE.BoxGeometry(3.32, 0.20, 10.0);
    const railMesh = new THREE.Mesh(railGeo, this.goldMat);
    railMesh.position.y = 2.26;
    this.group.add(railMesh);

    this.createHullDetail();

    // ----------------------------------------------------
    // 2. Main Lawn Deck & Central Flagstone Walkway
    // ----------------------------------------------------
    // Wooden subdeck
    const mainDeckGeo = new THREE.BoxGeometry(2.88, 0.15, 9.4);
    const mainDeck = new THREE.Mesh(mainDeckGeo, this.deckMat);
    mainDeck.position.y = 2.18;
    mainDeck.receiveShadow = true;
    this.group.add(mainDeck);

    // Thousand Sunny Lawn Turf (Real Grass on the Main Deck)
    const lawnGeo = new THREE.BoxGeometry(2.70, 0.04, 5.2);
    const lawnMesh = new THREE.Mesh(lawnGeo, this.lawnMat);
    lawnMesh.position.set(0, 2.26, 0.2);
    lawnMesh.receiveShadow = true;
    this.group.add(lawnMesh);

    // Central Stone Paver Path through the Lawn
    const stonePathGeo = new THREE.BoxGeometry(0.68, 0.045, 5.2);
    const stonePath = new THREE.Mesh(stonePathGeo, this.stoneMat);
    stonePath.position.set(0, 2.27, 0.2);
    stonePath.receiveShadow = true;
    this.group.add(stonePath);

    // Forecastle Raised Deck (Forward)
    const foreDeckGeo = new THREE.BoxGeometry(2.65, 0.42, 2.3);
    const foreDeck = new THREE.Mesh(foreDeckGeo, this.deckMat);
    foreDeck.position.set(0, 2.52, 3.5);
    this.group.add(foreDeck);

    // Deck Grating Hatch
    const hatchGeo = new THREE.BoxGeometry(1.25, 0.12, 1.45);
    const hatchMesh = new THREE.Mesh(hatchGeo, this.darkWoodMat);
    hatchMesh.position.set(0, 2.30, 0.6);
    this.group.add(hatchMesh);

    // Forecastle Capstan
    const capstanGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.58, 10);
    const capstan = new THREE.Mesh(capstanGeo, this.goldMat);
    capstan.position.set(0, 2.95, 3.3);
    this.group.add(capstan);

    // ----------------------------------------------------
    // 3. Broadside Cannons with Weathered Port Lids (8 total)
    // ----------------------------------------------------
    const cannonPositions = [-2.2, -0.8, 0.6, 2.0];
    cannonPositions.forEach((zPos) => {
      this.createCannon(-1.58, 1.78, zPos, -Math.PI / 2);
      this.createCannon(1.58, 1.78, zPos, Math.PI / 2);
    });

    // ----------------------------------------------------
    // 4. Stern Castle, Coup de Burst & Aquarium Lounge
    // ----------------------------------------------------
    const cabinGeo = new THREE.BoxGeometry(2.75, 1.85, 3.1);
    const cabinMesh = new THREE.Mesh(cabinGeo, this.hullMat);
    cabinMesh.position.set(0, 3.05, -3.15);
    cabinMesh.castShadow = true;
    this.group.add(cabinMesh);

    // Poop Deck Roof
    const poopDeckGeo = new THREE.BoxGeometry(2.9, 0.22, 3.2);
    const poopDeck = new THREE.Mesh(poopDeckGeo, this.goldMat);
    poopDeck.position.set(0, 4.08, -3.15);
    this.group.add(poopDeck);

    // Stern Carved Balustrade
    const sternBalustradeGeo = new THREE.BoxGeometry(2.85, 0.42, 0.15);
    const sternBalustrade = new THREE.Mesh(sternBalustradeGeo, this.goldMat);
    sternBalustrade.position.set(0, 4.38, -4.7);
    this.group.add(sternBalustrade);

    this.createSternDetail();

    // ----------------------------------------------------
    // 5. Quarterdeck Helm (Ship's Wheel)
    // ----------------------------------------------------
    this.createShipHelm(0, 4.22, -2.4);

    // ----------------------------------------------------
    // 6. Thousand Sunny Lion-Paw Anchors (Port & Starboard Bow)
    // ----------------------------------------------------
    this.createLionPawAnchor(-1.62, 1.55, 4.1, -1);
    this.createLionPawAnchor(1.62, 1.55, 4.1, 1);

    // ----------------------------------------------------
    // 7. Authentic Thousand Sunny Lion Figurehead (King of Beasts)
    // ----------------------------------------------------
    const figureheadGroup = new THREE.Group();
    figureheadGroup.position.set(0, 2.65, 5.05);

    // Sculpted Golden Lion Head
    const headGeo = new THREE.SphereGeometry(0.68, 24, 24);
    const headMesh = new THREE.Mesh(headGeo, this.goldMat);
    figureheadGroup.add(headMesh);

    // Lion Muzzle & Open Smiling Mouth
    const muzzleGeo = new THREE.CylinderGeometry(0.26, 0.34, 0.40, 16);
    muzzleGeo.rotateX(Math.PI / 2);
    const muzzleMesh = new THREE.Mesh(muzzleGeo, this.goldMat);
    muzzleMesh.position.set(0, -0.08, 0.42);
    figureheadGroup.add(muzzleMesh);

    // Gaon Cannon Barrel inside Mouth (The Sunny's Ultimate Superweapon)
    const gaonGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.36, 16);
    gaonGeo.rotateX(Math.PI / 2);
    const gaonMesh = new THREE.Mesh(gaonGeo, this.ironMat);
    gaonMesh.position.set(0, -0.08, 0.50);
    figureheadGroup.add(gaonMesh);

    const gaonMuzzleRingGeo = new THREE.TorusGeometry(0.14, 0.025, 8, 16);
    const gaonMuzzleRing = new THREE.Mesh(gaonMuzzleRingGeo, this.goldMat);
    gaonMuzzleRing.position.set(0, -0.08, 0.68);
    figureheadGroup.add(gaonMuzzleRing);

    // Cute Lion Nose
    const noseGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const noseMesh = new THREE.Mesh(noseGeo, this.paintRedMat);
    noseMesh.position.set(0, 0.06, 0.65);
    figureheadGroup.add(noseMesh);

    // Layered Muzzle Plate & Whiskers
    [-1, 1].forEach((side) => {
      const whiskerGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.52, 6);
      const whisker = new THREE.Mesh(whiskerGeo, this.goldMat);
      whisker.position.set(side * 0.34, -0.02, 0.5);
      whisker.rotation.z = side * 0.24;
      whisker.rotation.x = Math.PI / 2;
      figureheadGroup.add(whisker);
    });

    // Stylized Dark Eyes for Lion Face
    [-0.22, 0.22].forEach((eyeX) => {
      const eyeGeo = new THREE.SphereGeometry(0.068, 12, 12);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(eyeX, 0.18, 0.60);
      figureheadGroup.add(eye);
    });

    // Two Golden Lion Ears
    [-0.38, 0.38].forEach((earX) => {
      const earGeo = new THREE.ConeGeometry(0.16, 0.32, 10);
      const earMesh = new THREE.Mesh(earGeo, this.goldMat);
      earMesh.position.set(earX, 0.54, 0.12);
      earMesh.rotation.z = -earX * 0.9;
      figureheadGroup.add(earMesh);
    });

    // Pure White Crossbones mounted behind the head
    [-1, 1].forEach((dir) => {
      const boneGeo = new THREE.CylinderGeometry(0.065, 0.065, 1.85, 8);
      const bone = new THREE.Mesh(boneGeo, this.boneMat);
      bone.position.set(0, 0, -0.15);
      bone.rotation.z = dir * Math.PI / 4;
      figureheadGroup.add(bone);

      // Bone Knobs
      [-0.92, 0.92].forEach((bp) => {
        const knobGeo = new THREE.SphereGeometry(0.11, 8, 8);
        const knob1 = new THREE.Mesh(knobGeo, this.boneMat);
        knob1.position.set(bp * Math.cos(dir * Math.PI / 4) + 0.05, bp * Math.sin(dir * Math.PI / 4) + 0.05, -0.15);
        figureheadGroup.add(knob1);
      });
    });

    // 16 Radiating Sunflower Petals (Authentic Thousand Sunny Mane)
    const petalCount = 16;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalGeo = new THREE.ConeGeometry(0.18, 0.88, 10);
      const petalMesh = new THREE.Mesh(petalGeo, this.goldMat);
      petalMesh.position.set(Math.cos(angle) * 0.82, Math.sin(angle) * 0.82, -0.10);
      petalMesh.rotation.z = angle - Math.PI / 2;
      petalMesh.rotation.x = Math.PI / 2;
      figureheadGroup.add(petalMesh);
    }

    const maneRingGeo = new THREE.TorusGeometry(0.82, 0.07, 10, 32);
    const maneRing = new THREE.Mesh(maneRingGeo, this.goldMat);
    maneRing.position.z = -0.12;
    figureheadGroup.add(maneRing);

    this.group.add(figureheadGroup);

    // ----------------------------------------------------
    // 8. Triangular Jib Staysails (Anchored to Forecastle Deck)
    // ----------------------------------------------------
    this.createJibSail(0, 2.7, 4.5, 0, 6.2, 2.8, 0, 3.2, 3.4);

    // ----------------------------------------------------
    // 9. Authentic Thousand Sunny Masts & Observation Dome
    // ----------------------------------------------------
    // Mainmast (Center - displaying iconic Straw Hat Jolly Roger on billowing sunny canvas)
    this.createMast(0, 2.18, 0.1, 7.6, 4.0, 2.8, true, true);

    // Foremast (Forward - displaying yellow/orange striped topsail)
    this.createMast(0, 2.52, 2.8, 6.2, 3.2, 2.2, false, false);

    // Mizzenmast (Aft on cabin - clean sunny sail)
    this.createMast(0, 4.18, -3.1, 4.2, 2.0, 1.4, false, false);

    // Standing Rigging: Shrouds with Realistic Ratlines
    this.createShroudsWithRatlines(-1.52, 2.2, 0.1, 0, 6.8, 0.1);
    this.createShroudsWithRatlines(1.52, 2.2, 0.1, 0, 6.8, 0.1);
    this.createShroudsWithRatlines(-1.48, 2.4, 2.8, 0, 5.6, 2.8);
    this.createShroudsWithRatlines(1.48, 2.4, 2.8, 0, 5.6, 2.8);

    // Heavy Forestays from Masts to Bow
    this.createRopeStay(0, 5.6, 2.8, 0, 2.7, 4.5);
    this.createRopeStay(0, 6.8, 0.1, 0, 5.0, 2.8);

    // ----------------------------------------------------
    // 10. Warm Brass Deck Lanterns
    // ----------------------------------------------------
    this.createOrnateLantern(0, 3.7, 4.8);
    this.createOrnateLantern(-1.52, 2.55, 0.2);
    this.createOrnateLantern(1.52, 2.55, 0.2);
    this.createOrnateLantern(0, 4.75, -4.5);

    // Hero Staging: Positioned on the right with a 3/4 cinematic angle
    this.group.scale.set(0.85, 0.85, 0.85);
    this.group.position.set(this.baseX, this.draftOffset, this.baseZ);
    this.group.rotation.y = this.baseRotationY;
  }

  createHullDetail() {
    // Gold sheer stripe follows the visible profile
    const stripeGeo = new THREE.BoxGeometry(3.30, 0.11, 9.25, 2, 1, 12);
    const stripe = new THREE.Mesh(stripeGeo, this.goldMat);
    stripe.position.y = 1.42;
    stripe.castShadow = true;
    this.group.add(stripe);

    // Framed portholes
    const portholeRingGeo = new THREE.TorusGeometry(0.16, 0.035, 8, 16);
    const portholeGeo = new THREE.CircleGeometry(0.12, 16);
    [-1, 1].forEach((side) => {
      [-2.9, -1.7, -0.5, 0.7, 1.9, 3.0].forEach((z, index) => {
        const ring = new THREE.Mesh(portholeRingGeo, this.goldMat);
        ring.position.set(side * 1.57, 1.58 + (index % 2) * 0.03, z);
        ring.rotation.y = side * Math.PI / 2;
        this.group.add(ring);

        const glass = new THREE.Mesh(portholeGeo, this.windowMat);
        glass.position.set(side * 1.575, 1.58 + (index % 2) * 0.03, z);
        glass.rotation.y = side * Math.PI / 2;
        this.group.add(glass);
      });
    });

    // Vertical ribs along hull side
    [-3.8, -2.6, -1.4, -0.2, 1.0, 2.2, 3.4].forEach((z) => {
      [-1, 1].forEach((side) => {
        const ribGeo = new THREE.BoxGeometry(0.08, 0.92, 0.16);
        const rib = new THREE.Mesh(ribGeo, this.darkWoodMat);
        rib.position.set(side * 1.57, 1.18, z);
        rib.rotation.x = z > 0 ? -0.08 : 0.05;
        this.group.add(rib);
      });
    });

    // Red sunburst panels beneath the gunwale
    [-1, 1].forEach((side) => {
      const panelGeo = new THREE.BoxGeometry(0.08, 0.34, 1.4);
      const panel = new THREE.Mesh(panelGeo, this.paintRedMat);
      panel.position.set(side * 1.62, 1.88, 3.72);
      panel.rotation.z = side * 0.18;
      this.group.add(panel);
    });

    // ----------------------------------------------------
    // Soldier Dock System Dials (Channels 0–6)
    // ----------------------------------------------------
    [-1, 1].forEach((side) => {
      const dockDialGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.12, 24);
      dockDialGeo.rotateZ(Math.PI / 2);
      const dockDial = new THREE.Mesh(dockDialGeo, this.darkWoodMat);
      dockDial.position.set(side * 1.60, 1.05, 0.0);
      this.group.add(dockDial);

      const dockRimGeo = new THREE.TorusGeometry(0.48, 0.045, 8, 24);
      dockRimGeo.rotateY(Math.PI / 2);
      const dockRim = new THREE.Mesh(dockRimGeo, this.goldMat);
      dockRim.position.set(side * 1.62, 1.05, 0.0);
      this.group.add(dockRim);

      // Red paddlewheel casing
      const paddleCasingGeo = new THREE.BoxGeometry(0.18, 0.72, 1.35);
      const paddleCasing = new THREE.Mesh(paddleCasingGeo, this.paintRedMat);
      paddleCasing.position.set(side * 1.63, 0.75, 0.0);
      this.group.add(paddleCasing);
    });

    // Forecastle bollards with caps
    [-0.85, 0.85].forEach((x) => {
      const bollardGeo = new THREE.CylinderGeometry(0.10, 0.13, 0.42, 10);
      const bollard = new THREE.Mesh(bollardGeo, this.goldMat);
      bollard.position.set(x, 2.78, 3.72);
      this.group.add(bollard);
      const capGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.06, 10);
      const cap = new THREE.Mesh(capGeo, this.goldMat);
      cap.position.set(x, 2.98, 3.72);
      this.group.add(cap);
    });
  }

  createSternDetail() {
    // ----------------------------------------------------
    // Coup de Burst Giant Propulsion Thruster (Rear Jet Cannon)
    // ----------------------------------------------------
    const coupGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.85, 20);
    coupGeo.rotateX(Math.PI / 2);
    const coupMesh = new THREE.Mesh(coupGeo, this.ironMat);
    coupMesh.position.set(0, 1.65, -4.85);
    this.group.add(coupMesh);

    const coupRimGeo = new THREE.TorusGeometry(0.56, 0.06, 8, 24);
    const coupRim = new THREE.Mesh(coupRimGeo, this.goldMat);
    coupRim.position.set(0, 1.65, -5.28);
    this.group.add(coupRim);

    // ----------------------------------------------------
    // Aquarium Lounge Curved Bay Windows
    // ----------------------------------------------------
    [-0.85, 0, 0.85].forEach((x) => {
      const frameGeo = new THREE.BoxGeometry(0.54, 0.72, 0.08);
      const frame = new THREE.Mesh(frameGeo, this.goldMat);
      frame.position.set(x, 3.28, -4.77);
      this.group.add(frame);

      const paneGeo = new THREE.PlaneGeometry(0.42, 0.58);
      const pane = new THREE.Mesh(paneGeo, this.windowMat);
      pane.position.set(x, 3.28, -4.82);
      pane.rotation.y = Math.PI;
      this.group.add(pane);
    });

    // Stern balconies
    [-1, 1].forEach((side) => {
      const balconyGeo = new THREE.BoxGeometry(0.72, 0.10, 0.58);
      const balcony = new THREE.Mesh(balconyGeo, this.deckMat);
      balcony.position.set(side * 0.94, 4.18, -4.56);
      this.group.add(balcony);

      [0.72, 1.16].forEach((x) => {
        const postGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.34, 6);
        const post = new THREE.Mesh(postGeo, this.goldMat);
        post.position.set(side * x, 4.38, -4.56);
        this.group.add(post);
      });
    });

    // Flag staff & Straw Hat pirate pennant
    const staffGeo = new THREE.CylinderGeometry(0.035, 0.05, 1.15, 8);
    const staff = new THREE.Mesh(staffGeo, this.darkWoodMat);
    staff.position.set(0, 5.03, -4.42);
    this.group.add(staff);

    const pennantGeo = new THREE.PlaneGeometry(0.85, 0.38);
    const pennant = new THREE.Mesh(pennantGeo, new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.55,
      side: THREE.DoubleSide
    }));
    pennant.position.set(0.42, 5.42, -4.42);
    this.group.add(pennant);
  }

  createLionPawAnchor(x, y, z, side = 1) {
    const anchorGroup = new THREE.Group();
    anchorGroup.position.set(x, y, z);
    anchorGroup.rotation.z = side * -Math.PI / 6;

    // Shank
    const shankGeo = new THREE.CylinderGeometry(0.065, 0.065, 1.45, 8);
    const shank = new THREE.Mesh(shankGeo, this.ironMat);
    anchorGroup.add(shank);

    // Wooden Stock
    const stockGeo = new THREE.BoxGeometry(0.14, 0.14, 0.95);
    const stock = new THREE.Mesh(stockGeo, this.darkWoodMat);
    stock.position.y = 0.54;
    anchorGroup.add(stock);

    // Thousand Sunny Signature Lion Paw Flukes
    const pawCenterGeo = new THREE.SphereGeometry(0.22, 12, 12);
    const pawCenter = new THREE.Mesh(pawCenterGeo, this.goldMat);
    pawCenter.position.y = -0.72;
    anchorGroup.add(pawCenter);

    [-0.18, 0, 0.18].forEach((toeX) => {
      const toeGeo = new THREE.SphereGeometry(0.10, 10, 10);
      const toe = new THREE.Mesh(toeGeo, this.paintRedMat);
      toe.position.set(toeX, -0.92, 0.08);
      anchorGroup.add(toe);
    });

    this.group.add(anchorGroup);
  }

  createJibSail(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
    const geom = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      x1, y1, z1,
      x2, y2, z2,
      x3, y3, z3,
      x1, y1, z1,
      x3, y3, z3,
      x2, y2, z2
    ]);
    const uvs = new Float32Array([
      0.0, 0.0,
      0.5, 1.0,
      1.0, 0.0,
      0.0, 0.0,
      1.0, 0.0,
      0.5, 1.0
    ]);
    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geom.computeVertexNormals();

    const mesh = new THREE.Mesh(geom, this.plainSailMat);
    mesh.castShadow = true;
    this.sails.push(mesh);
    this.group.add(mesh);
  }

  createRopeStay(x1, y1, z1, x2, y2, z2) {
    const p1 = new THREE.Vector3(x1, y1, z1);
    const p2 = new THREE.Vector3(x2, y2, z2);
    const length = p1.distanceTo(p2);

    const geo = new THREE.CylinderGeometry(0.018, 0.018, length, 6);
    geo.translate(0, length / 2, 0);
    geo.rotateX(Math.PI / 2);

    const mesh = new THREE.Mesh(geo, this.ropeMat);
    mesh.position.copy(p1);
    mesh.lookAt(p2);
    this.group.add(mesh);
  }

  createShroudsWithRatlines(deckX, deckY, deckZ, mastTopX, mastTopY, mastTopZ) {
    const shroudGroup = new THREE.Group();
    const numLines = 4;
    const shroudSpread = 0.52;

    for (let i = 0; i < numLines; i++) {
      const zOffset = (i - (numLines - 1) / 2) * (shroudSpread / numLines);
      const start = new THREE.Vector3(deckX, deckY, deckZ + zOffset);
      const end = new THREE.Vector3(mastTopX, mastTopY, mastTopZ);
      const length = start.distanceTo(end);

      const geo = new THREE.CylinderGeometry(0.016, 0.016, length, 4);
      geo.translate(0, length / 2, 0);
      geo.rotateX(Math.PI / 2);

      const rope = new THREE.Mesh(geo, this.ropeMat);
      rope.position.copy(start);
      rope.lookAt(end);
      shroudGroup.add(rope);
    }

    // Horizontal Ratlines (Rope ladder rungs)
    const numRatlines = 10;
    const startHeight = deckY + 0.45;
    const endHeight = mastTopY - 0.75;

    for (let r = 0; r < numRatlines; r++) {
      const t = r / (numRatlines - 1);
      const curY = lerp(startHeight, endHeight, t);
      const curX = lerp(deckX, mastTopX, t);
      const curZ = lerp(deckZ, mastTopZ, t);
      const rungWidth = shroudSpread * (1.0 - t * 0.75);

      const rungGeo = new THREE.CylinderGeometry(0.012, 0.012, rungWidth, 4);
      rungGeo.rotateX(Math.PI / 2);
      const rung = new THREE.Mesh(rungGeo, this.ropeMat);
      rung.position.set(curX, curY, curZ);
      shroudGroup.add(rung);
    }

    this.group.add(shroudGroup);
  }

  createCannon(x, y, z, rotY) {
    const cannonGroup = new THREE.Group();
    cannonGroup.position.set(x, y, z);
    cannonGroup.rotation.y = rotY;

    // Cannon Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.09, 0.15, 1.05, 14);
    barrelGeo.rotateZ(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeo, this.ironMat);
    barrel.position.set(0.18, 0, 0);
    barrel.castShadow = true;
    cannonGroup.add(barrel);

    // Cannon Muzzle Flare
    const muzzleGeo = new THREE.TorusGeometry(0.10, 0.025, 8, 14);
    muzzleGeo.rotateY(Math.PI / 2);
    const muzzle = new THREE.Mesh(muzzleGeo, this.ironMat);
    muzzle.position.set(0.68, 0, 0);
    cannonGroup.add(muzzle);

    // Wooden Truck Carriage
    const carriageGeo = new THREE.BoxGeometry(0.42, 0.26, 0.38);
    const carriage = new THREE.Mesh(carriageGeo, this.darkWoodMat);
    carriage.position.set(-0.24, -0.10, 0);
    cannonGroup.add(carriage);

    this.group.add(cannonGroup);
  }

  createShipHelm(x, y, z) {
    const helmGroup = new THREE.Group();
    helmGroup.position.set(x, y, z);

    const binnacleGeo = new THREE.CylinderGeometry(0.16, 0.20, 0.80, 8);
    const binnacle = new THREE.Mesh(binnacleGeo, this.darkWoodMat);
    binnacle.position.y = 0.40;
    helmGroup.add(binnacle);

    const rimGeo = new THREE.TorusGeometry(0.38, 0.048, 8, 18);
    const rim = new THREE.Mesh(rimGeo, this.darkWoodMat);
    rim.position.set(0, 0.82, 0.12);
    helmGroup.add(rim);

    const hubGeo = new THREE.CylinderGeometry(0.10, 0.10, 0.18, 8);
    hubGeo.rotateX(Math.PI / 2);
    const hub = new THREE.Mesh(hubGeo, this.goldMat);
    hub.position.set(0, 0.82, 0.12);
    helmGroup.add(hub);

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const spokeGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.92, 6);
      const spoke = new THREE.Mesh(spokeGeo, this.goldMat);
      spoke.position.set(0, 0.82, 0.12);
      spoke.rotation.z = angle;
      helmGroup.add(spoke);
    }

    this.group.add(helmGroup);
  }

  createMast(x, y, z, height, yardWidth, sailHeight, hasJollyRoger = false, isMainObservationMast = false) {
    const mastGroup = new THREE.Group();
    mastGroup.position.set(x, y, z);

    // Mast Spar
    const mastGeo = new THREE.CylinderGeometry(0.11, 0.20, height, 12);
    const mastMesh = new THREE.Mesh(mastGeo, this.darkWoodMat);
    mastMesh.position.y = height / 2;
    mastMesh.castShadow = true;
    mastGroup.add(mastMesh);

    // Main Yard (Lower horizontal spar)
    const lowerYardGeo = new THREE.CylinderGeometry(0.075, 0.075, yardWidth, 8);
    const lowerYard = new THREE.Mesh(lowerYardGeo, this.darkWoodMat);
    lowerYard.rotation.z = Math.PI / 2;
    lowerYard.position.y = height * 0.73;
    mastGroup.add(lowerYard);

    // Top Yard (Upper horizontal spar)
    const topYardGeo = new THREE.CylinderGeometry(0.05, 0.05, yardWidth * 0.70, 8);
    const topYard = new THREE.Mesh(topYardGeo, this.darkWoodMat);
    topYard.rotation.z = Math.PI / 2;
    topYard.position.y = height * 0.95;
    mastGroup.add(topYard);

    if (isMainObservationMast) {
      // ----------------------------------------------------
      // Thousand Sunny Observation Room / Gym (Spherical Dome Crow's Nest)
      // ----------------------------------------------------
      const domeGeo = new THREE.SphereGeometry(0.72, 20, 16);
      const domeMesh = new THREE.Mesh(domeGeo, this.hullMat);
      domeMesh.position.y = height * 0.82;
      mastGroup.add(domeMesh);

      const domeCapGeo = new THREE.ConeGeometry(0.75, 0.42, 16);
      const domeCap = new THREE.Mesh(domeCapGeo, this.paintRedMat);
      domeCap.position.y = height * 0.82 + 0.65;
      mastGroup.add(domeCap);

      const windowRingGeo = new THREE.TorusGeometry(0.68, 0.045, 8, 24);
      windowRingGeo.rotateX(Math.PI / 2);
      const windowRing = new THREE.Mesh(windowRingGeo, this.goldMat);
      windowRing.position.y = height * 0.82;
      mastGroup.add(windowRing);
    } else {
      // Regular Crows Nest
      const nestGeo = new THREE.CylinderGeometry(0.55, 0.46, 0.60, 12, 1, true);
      const nestMesh = new THREE.Mesh(nestGeo, this.hullMat);
      nestMesh.position.y = height * 0.80;
      mastGroup.add(nestMesh);
    }

    // Masthead Cap
    const capGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.08, 12);
    const cap = new THREE.Mesh(capGeo, this.goldMat);
    cap.position.y = height * 0.77;
    mastGroup.add(cap);

    // Pirate Pennant Flag at Mast Top
    const flagGeo = new THREE.PlaneGeometry(0.95, 0.48);
    const flagMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.6,
      side: THREE.DoubleSide
    });
    const flagMesh = new THREE.Mesh(flagGeo, flagMat);
    flagMesh.position.set(0.48, height + 0.12, 0);
    mastGroup.add(flagMesh);

    // Main Square Sail
    const sailMat = hasJollyRoger ? this.jollyRogerSailMat : this.plainSailMat;
    const sailGeo = new THREE.PlaneGeometry(yardWidth * 0.94, sailHeight, 14, 14);
    const sailMesh = new THREE.Mesh(sailGeo, sailMat);
    sailMesh.position.set(0, height * 0.48, 0.22);
    sailMesh.castShadow = true;
    mastGroup.add(sailMesh);
    this.sails.push(sailMesh);

    // Upper Topsail
    const topSailGeo = new THREE.PlaneGeometry(yardWidth * 0.66, sailHeight * 0.62, 10, 10);
    const topSailMesh = new THREE.Mesh(topSailGeo, this.plainSailMat);
    topSailMesh.position.set(0, height * 0.85, 0.16);
    topSailMesh.castShadow = true;
    mastGroup.add(topSailMesh);
    this.sails.push(topSailMesh);

    this.group.add(mastGroup);
  }

  createOrnateLantern(x, y, z) {
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(x, y, z);

    // Bracket
    const bracketGeo = new THREE.CylinderGeometry(0.025, 0.035, 0.42, 6);
    bracketGeo.rotateX(Math.PI / 4);
    const bracket = new THREE.Mesh(bracketGeo, this.goldMat);
    lanternGroup.add(bracket);

    // Cap & Base
    const capGeo = new THREE.ConeGeometry(0.18, 0.14, 6);
    const cap = new THREE.Mesh(capGeo, this.goldMat);
    cap.position.y = 0.26;
    lanternGroup.add(cap);

    const baseGeo = new THREE.CylinderGeometry(0.12, 0.06, 0.08, 6);
    const base = new THREE.Mesh(baseGeo, this.goldMat);
    base.position.y = -0.22;
    lanternGroup.add(base);

    // Amber Glass Core
    const glassGeo = new THREE.CylinderGeometry(0.12, 0.10, 0.36, 6);
    const glass = new THREE.Mesh(glassGeo, this.glassMat);
    lanternGroup.add(glass);

    // Golden Wireframe Cage
    const cageGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.38, 6);
    const cage = new THREE.Mesh(cageGeo, this.lanternCageMat);
    lanternGroup.add(cage);

    // Inner Glowing Core
    const coreGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const core = new THREE.Mesh(coreGeo, this.lanternCoreMat);
    lanternGroup.add(core);

    // Point Light for Realistic Deck Illumination
    const pointLight = new THREE.PointLight(0xf59e0b, 2.2, 12, 1.8);
    lanternGroup.add(pointLight);

    this.lanterns.push({
      group: lanternGroup,
      light: pointLight,
      baseIntensity: 2.2
    });

    this.group.add(lanternGroup);
  }

  update(delta) {
    this.time += delta;

    // Advance sail flutter with scroll velocity reactivity
    const flutterFactor = Math.max(0.6, this.scrollOffset.sailFlutter || 1.0);
    if (this.jollyRogerSailMat?.uniforms?.uTime) {
      this.jollyRogerSailMat.uniforms.uTime.value += delta * flutterFactor;
    }
    if (this.plainSailMat?.uniforms?.uTime) {
      this.plainSailMat.uniforms.uTime.value += delta * flutterFactor;
    }

    // Lantern flame flicker
    this.lanterns.forEach((l, index) => {
      const flicker = Math.sin(this.time * 7.5 + index * 1.9) * 0.3 +
                      Math.cos(this.time * 13.0 + index * 2.7) * 0.18;
      l.light.intensity = Math.max(0.8, l.baseIntensity + flicker);
    });

    // Buoyancy Wave Physics with natural water immersion and scroll progression
    const ocean = this.experience.world?.ocean;
    if (ocean) {
      const currentBaseX = this.baseX + this.scrollOffset.x;
      const currentBaseZ = this.baseZ + this.scrollOffset.z;

      const bowY = ocean.getWaveHeight(currentBaseX, currentBaseZ + 4.2, this.time);
      const sternY = ocean.getWaveHeight(currentBaseX, currentBaseZ - 4.2, this.time);
      const centerY = ocean.getWaveHeight(currentBaseX, currentBaseZ, this.time);

      const portY = ocean.getWaveHeight(currentBaseX - 1.8, currentBaseZ, this.time);
      const stbdY = ocean.getWaveHeight(currentBaseX + 1.8, currentBaseZ, this.time);

      // Deep draft so the hull stays naturally immersed in the water
      this.targetY = this.draftOffset + this.scrollOffset.y + centerY * 0.85;
      this.targetPitch = (bowY - sternY) * 0.082 + this.scrollOffset.pitch;
      this.targetRoll = (portY - stbdY) * 0.125 + this.scrollOffset.roll;

      this.group.position.x = lerp(this.group.position.x, currentBaseX, 0.08);
      this.group.position.z = lerp(this.group.position.z, currentBaseZ, 0.08);
      this.group.position.y = lerp(this.group.position.y, this.targetY, 0.08);

      this.group.rotation.x = lerp(this.group.rotation.x, this.targetPitch, 0.065);
      this.group.rotation.z = lerp(this.group.rotation.z, this.targetRoll, 0.065);

      // Gentle yaw sway + scroll steering
      const dynamicYaw = this.baseRotationY + this.scrollOffset.rotationY + Math.sin(this.time * 0.32) * 0.035;
      this.group.rotation.y = lerp(this.group.rotation.y, dynamicYaw, 0.065);
    }
  }

  updateBasePositionForScreen() {
    const width = this.experience.sizes?.width || window.innerWidth;
    const height = this.experience.sizes?.height || window.innerHeight;
    const aspect = width / height;

    if (aspect < 1.0) {
      // Mobile / Portrait: center ship slightly below hero text
      this.baseX = 2.4;
      this.baseZ = -1.2;
      this.baseRotationY = 0.20;
    } else if (aspect < 1.4) {
      // Tablet / Medium square
      this.baseX = 8.8;
      this.baseZ = -1.0;
      this.baseRotationY = 0.24;
    } else {
      // Desktop widescreen: majestic golden-ratio staging on the right
      this.baseX = 12.8;
      this.baseZ = -0.8;
      this.baseRotationY = 0.28;
    }
  }

  resize() {
    this.updateBasePositionForScreen();
  }
}
