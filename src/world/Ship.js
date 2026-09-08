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

    // Staging parameters - Dynamic 3/4 bow composition: ship cuts forward towards right foreground
    this.baseX = 6.8;
    this.baseZ = 1.0;
    this.baseRotationY = 0.68; // ~39 degrees: powerful dynamic 3/4 angle showing golden lion prow, billowing sails and port flank

    // Deep natural water draft immersion
    this.draftOffset = -0.85; // Keel sits deep into waves so bottom is never unnaturally exposed
    this.targetY = this.draftOffset;
    this.targetPitch = 0;
    this.targetRoll = 0;

    this.createMaterials();
    this.buildShipModel();
    this.scene.add(this.group);
  }

  createMaterials() {
    // 1. High-Detail Procedural Wood Textures
    this.woodPlankTexture = this.createWoodPlankTexture();
    this.deckPlankTexture = this.createDeckPlankTexture();

    // Hull Upper Material (Rich Varnished Teak with plank grooves)
    this.hullMat = new THREE.MeshStandardMaterial({
      map: this.woodPlankTexture,
      roughness: 0.48,
      metalness: 0.06
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

    // Polished Naval Gold & Brass (Sunny Lion Mane, Railings, Lantern Fittings)
    this.goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.24,
      metalness: 0.90,
      emissive: 0x78350f,
      emissiveIntensity: 0.12
    });

    // Weathered Red Oak for Gunport Lids & Accents
    this.crimsonWoodMat = new THREE.MeshStandardMaterial({
      color: 0x881337,
      roughness: 0.55,
      metalness: 0.08
    });

    // Forged Naval Iron (Anchors, Chains, Cannon Barrels)
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

    // Canvas Sails Textures
    this.jollyRogerTexture = this.createJollyRogerTexture();
    this.plainSailTexture = this.createPlainSailTexture();

    // Translucent Backlit Canvas Sails Shaders
    this.jollyRogerSailMat = this.createSailShaderMaterial(this.jollyRogerTexture);
    this.plainSailMat = this.createSailShaderMaterial(this.plainSailTexture);

    // Dedicated Wireframe Material for Lantern Cage (Keeps other gold meshes solid)
    this.lanternCageMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
      metalness: 0.88,
      wireframe: true
    });

    // Lantern Core & Warm Amber Glass
    this.lanternCoreMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
    this.glassMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.12,
      metalness: 0.1,
      transparent: true,
      opacity: 0.58
    });

    this.windowMat = new THREE.MeshStandardMaterial({
      color: 0x123047,
      roughness: 0.18,
      metalness: 0.45,
      emissive: 0x0b2438,
      emissiveIntensity: 0.32
    });

    this.paintRedMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      roughness: 0.42,
      metalness: 0.12
    });

    this.creamMat = new THREE.MeshStandardMaterial({
      color: 0xfff7ed,
      roughness: 0.78,
      metalness: 0.02
    });
  }

  createWoodPlankTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Warm seasoned teak base
    ctx.fillStyle = '#543622';
    ctx.fillRect(0, 0, 1024, 1024);

    // Horizontal plank lines & caulk seams
    const plankHeight = 32;
    for (let y = 0; y < 1024; y += plankHeight) {
      const shade = (Math.random() * 28 - 14);
      ctx.fillStyle = `rgb(${78 + shade}, ${48 + shade * 0.8}, ${32 + shade * 0.6})`;
      ctx.fillRect(0, y, 1024, plankHeight - 2);

      // Deep caulk groove
      ctx.fillStyle = '#1c1009';
      ctx.fillRect(0, y + plankHeight - 2, 1024, 2);

      // Staggered butt joints
      const stagger = (y / plankHeight) % 3;
      const jointX1 = (stagger * 340 + 120) % 1024;
      const jointX2 = (jointX1 + 512) % 1024;
      ctx.fillRect(jointX1, y, 2, plankHeight - 2);
      ctx.fillRect(jointX2, y, 2, plankHeight - 2);
    }

    // Realistic wood grain noise
    for (let i = 0; i < 9500; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const length = 12 + Math.random() * 45;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(25, 14, 8, 0.22)' : 'rgba(110, 72, 48, 0.16)';
      ctx.fillRect(x, y, length, 1.2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }

  createDeckPlankTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Sun-bleached golden oak deck base
    ctx.fillStyle = '#6e4c33';
    ctx.fillRect(0, 0, 1024, 1024);

    const plankWidth = 24;
    for (let x = 0; x < 1024; x += plankWidth) {
      const shade = Math.random() * 22 - 11;
      ctx.fillStyle = `rgb(${106 + shade}, ${76 + shade * 0.85}, ${52 + shade * 0.7})`;
      ctx.fillRect(x, 0, plankWidth - 2, 1024);

      // Pitch seam
      ctx.fillStyle = '#1c1008';
      ctx.fillRect(x + plankWidth - 2, 0, 2, 1024);

      // Deck wood plugs / treenails
      for (let y = 30; y < 1024; y += 128) {
        ctx.beginPath();
        ctx.arc(x + plankWidth / 2 - 1, y + (x % 3) * 20, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 7500; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      ctx.fillStyle = 'rgba(25, 15, 9, 0.16)';
      ctx.fillRect(x, y, 1.5, 8 + Math.random() * 28);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1.5, 3);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }

  createJollyRogerTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Warm ivory sail canvas
    ctx.fillStyle = '#f8f4e8';
    ctx.fillRect(0, 0, 1024, 1024);

    // Fine canvas fabric weave
    for (let i = 0; i < 9000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const shade = Math.random() * 24 - 12;
      ctx.fillStyle = `rgba(${195 + shade}, ${185 + shade}, ${165 + shade}, 0.18)`;
      ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }

    // Vertical canvas cloth seams
    ctx.strokeStyle = 'rgba(125, 105, 80, 0.28)';
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
    ctx.translate(512, 555);
    ctx.scale(0.80, 0.80);

    // Crossed Bones (Dark pirate ink)
    ctx.fillStyle = '#110e0b';
    ctx.strokeStyle = '#110e0b';
    ctx.lineWidth = 44;
    ctx.lineCap = 'round';

    // Bone 1: Top-Left to Bottom-Right
    ctx.beginPath();
    ctx.moveTo(-310, -230);
    ctx.lineTo(310, 230);
    ctx.stroke();
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.arc(dir * 310 - dir * 18, dir * 230 + 24, 32, 0, Math.PI * 2);
      ctx.arc(dir * 310 + 24, dir * 230 - dir * 18, 32, 0, Math.PI * 2);
      ctx.fill();
    });

    // Bone 2: Bottom-Left to Top-Right
    ctx.beginPath();
    ctx.moveTo(-310, 230);
    ctx.lineTo(310, -230);
    ctx.stroke();
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.arc(dir * 310 - dir * 18, -dir * 230 - 24, 32, 0, Math.PI * 2);
      ctx.arc(dir * 310 + 24, -dir * 230 + dir * 18, 32, 0, Math.PI * 2);
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
    ctx.fillStyle = '#f8f4e8';
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
    ctx.strokeStyle = '#f8f4e8';
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
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(0, -92, 280, 58, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hat Crown
    ctx.beginPath();
    ctx.ellipse(0, -170, 155, 115, 0, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    // Iconic Red Ribbon Band
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(0, -108, 155, 34, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }

  createPlainSailTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f8f4e8';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 4500; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const shade = Math.random() * 24 - 12;
      ctx.fillStyle = `rgba(${195 + shade}, ${185 + shade}, ${165 + shade}, 0.18)`;
      ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }

    ctx.strokeStyle = 'rgba(125, 105, 80, 0.26)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    for (let x = 85; x < 512; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }

  createSailShaderMaterial(texture) {
    return new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);

          vec3 p = position;
          // Smooth aerodynamic catenary billow curve + gentle natural flutter
          float billow = sin(uv.y * 3.14159) * 0.52;
          float flutter = sin(uTime * 2.2 + uv.y * 4.8 + uv.x * 3.6) * 0.07 * (1.0 - uv.y);
          p.z += billow + flutter;

          vec4 worldPos = modelMatrix * vec4(p, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform sampler2D uSailMap;
        uniform vec3 uSunDirection;
        uniform vec3 uSunColor;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          vec3 lightDir = normalize(uSunDirection);
          vec3 n = normalize(vNormal);

          // Sunlight transmission through translucent canvas cloth
          float backlight = pow(max(dot(-viewDir, lightDir), 0.0), 2.2) * 0.55;
          float frontlight = max(dot(n, lightDir), 0.0) * 0.75;
          float ambientCloth = 0.60;

          vec4 texColor = texture2D(uSailMap, vUv);

          vec3 finalIllumination = (ambientCloth + frontlight) * vec3(0.98, 0.97, 0.94) + backlight * uSunColor * 1.05;
          gl_FragColor = vec4(texColor.rgb * finalIllumination, 1.0);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uSailMap: { value: texture },
        uSunDirection: { value: new THREE.Vector3(25, 55, -25) },
        uSunColor: { value: new THREE.Color('#fff7ed') }
      },
      side: THREE.DoubleSide
    });
  }

  buildShipModel() {
    // ----------------------------------------------------
    // 1. Realistic Naval Galleon Hull with Tumblehome & Sheer
    // ----------------------------------------------------
    const hullGeo = new THREE.BoxGeometry(3.1, 2.5, 9.8, 6, 4, 14);
    const pos = hullGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Bow flare & upward sheer (z > 0)
      if (z > 0) {
        let t = z / 4.9;
        let taper = 1.0 - t * 0.74;
        pos.setX(i, x * taper);
        pos.setY(i, y + t * t * 0.78); // dramatic upward prow curve
        if (y < 0) {
          pos.setX(i, pos.getX(i) * 0.52); // sharp V-entry keel
        }
      }
      // Stern quarterdeck lift and tumblehome (z < 0)
      if (z < 0) {
        let t = Math.abs(z) / 4.9;
        let taper = 1.0 - t * 0.28;
        pos.setX(i, x * taper);
        pos.setY(i, y + t * 0.68); // elevated poop deck
        if (y > 0.5) {
          pos.setX(i, pos.getX(i) * 0.92); // inward tumblehome
        }
      }
    }
    hullGeo.computeVertexNormals();

    const hullMesh = new THREE.Mesh(hullGeo, this.hullMat);
    hullMesh.position.y = 1.1;
    hullMesh.castShadow = true;
    hullMesh.receiveShadow = true;
    this.group.add(hullMesh);

    // Submerged Copper Keel
    const keelGeo = new THREE.BoxGeometry(1.6, 1.5, 9.4, 2, 2, 8);
    const keelPos = keelGeo.attributes.position;
    for (let i = 0; i < keelPos.count; i++) {
      let z = keelPos.getZ(i);
      let y = keelPos.getY(i);
      if (z > 0) {
        let t = z / 4.7;
        keelPos.setX(i, keelPos.getX(i) * (1.0 - t * 0.68));
      }
      if (y < 0) {
        keelPos.setX(i, keelPos.getX(i) * 0.38);
      }
    }
    keelGeo.computeVertexNormals();
    const keelMesh = new THREE.Mesh(keelGeo, this.lowerHullMat);
    keelMesh.position.y = -0.35;
    keelMesh.castShadow = true;
    this.group.add(keelMesh);

    // Continuous Wooden Wale Strakes (Horizontal reinforcing ribs)
    const strakeGeo = new THREE.BoxGeometry(3.22, 0.16, 9.8);
    const strake1 = new THREE.Mesh(strakeGeo, this.darkWoodMat);
    strake1.position.y = 1.68;
    this.group.add(strake1);

    const strake2 = new THREE.Mesh(strakeGeo, this.darkWoodMat);
    strake2.position.y = 0.96;
    this.group.add(strake2);

    // Gilded Gunwale Railing Capping
    const railGeo = new THREE.BoxGeometry(3.26, 0.20, 10.0);
    const railMesh = new THREE.Mesh(railGeo, this.goldMat);
    railMesh.position.y = 2.26;
    this.group.add(railMesh);

    this.createHullDetail();

    // ----------------------------------------------------
    // 2. Main Deck Planking & Deck Furniture
    // ----------------------------------------------------
    const mainDeckGeo = new THREE.BoxGeometry(2.88, 0.15, 9.4);
    const mainDeck = new THREE.Mesh(mainDeckGeo, this.deckMat);
    mainDeck.position.y = 2.18;
    mainDeck.receiveShadow = true;
    this.group.add(mainDeck);

    // Forecastle Raised Deck (Forward)
    const foreDeckGeo = new THREE.BoxGeometry(2.65, 0.42, 2.3);
    const foreDeck = new THREE.Mesh(foreDeckGeo, this.deckMat);
    foreDeck.position.set(0, 2.52, 3.5);
    this.group.add(foreDeck);

    // Deck Grating Hatch
    const hatchGeo = new THREE.BoxGeometry(1.25, 0.12, 1.45);
    const hatchMesh = new THREE.Mesh(hatchGeo, this.darkWoodMat);
    hatchMesh.position.set(0, 2.28, 0.6);
    this.group.add(hatchMesh);

    // Forecastle Capstan
    const capstanGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.58, 10);
    const capstan = new THREE.Mesh(capstanGeo, this.darkWoodMat);
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
    // 4. Stern Castle & Ornate Captain's Cabin
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

    // Stern Gallery Glazed Windows (Captain's Stateroom)
    const sternWindowGeo = new THREE.PlaneGeometry(2.1, 1.1);
    const sternWindowMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      side: THREE.DoubleSide
    });
    const sternWindow = new THREE.Mesh(sternWindowGeo, sternWindowMat);
    sternWindow.position.set(0, 3.15, -4.72);
    sternWindow.rotation.y = Math.PI;
    this.group.add(sternWindow);

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
    // 6. Admiralty Anchors (Port & Starboard Bow)
    // ----------------------------------------------------
    this.createAnchor(-1.62, 1.45, 4.1, -1);
    this.createAnchor(1.62, 1.45, 4.1, 1);

    // ----------------------------------------------------
    // 7. Thousand Sunny Lion Figurehead & Aligned Bowsprit
    // ----------------------------------------------------
    const figureheadGroup = new THREE.Group();
    figureheadGroup.position.set(0, 2.65, 5.05);

    // Sculpted Golden Lion Head
    const headGeo = new THREE.SphereGeometry(0.65, 24, 24);
    const headMesh = new THREE.Mesh(headGeo, this.goldMat);
    figureheadGroup.add(headMesh);

    // Lion Muzzle & Happy Mouth
    const muzzleGeo = new THREE.CylinderGeometry(0.24, 0.32, 0.38, 16);
    muzzleGeo.rotateX(Math.PI / 2);
    const muzzleMesh = new THREE.Mesh(muzzleGeo, this.goldMat);
    muzzleMesh.position.set(0, -0.10, 0.42);
    figureheadGroup.add(muzzleMesh);

    // Smiling Lion Nose
    const noseGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const noseMesh = new THREE.Mesh(noseGeo, this.crimsonWoodMat);
    noseMesh.position.set(0, 0.04, 0.62);
    figureheadGroup.add(noseMesh);

    // Layered muzzle plates and cheek whiskers give the Sunny figurehead a readable silhouette.
    const muzzlePlateGeo = new THREE.TorusGeometry(0.22, 0.035, 8, 18);
    const muzzlePlate = new THREE.Mesh(muzzlePlateGeo, this.goldMat);
    muzzlePlate.position.set(0, -0.10, 0.61);
    muzzlePlate.rotation.x = Math.PI / 2;
    figureheadGroup.add(muzzlePlate);

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
      const eyeGeo = new THREE.SphereGeometry(0.065, 12, 12);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(eyeX, 0.16, 0.58);
      figureheadGroup.add(eye);
    });

    // Two Golden Lion Ears
    [-0.38, 0.38].forEach((earX) => {
      const earGeo = new THREE.ConeGeometry(0.16, 0.32, 10);
      const earMesh = new THREE.Mesh(earGeo, this.goldMat);
      earMesh.position.set(earX, 0.52, 0.12);
      earMesh.rotation.z = -earX * 0.9;
      figureheadGroup.add(earMesh);
    });

    // Sculpted Golden Crossbones on Bow Stem
    [-1, 1].forEach((dir) => {
      const boneGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.25, 8);
      const bone = new THREE.Mesh(boneGeo, this.goldMat);
      bone.position.set(0, -0.62, 0.38);
      bone.rotation.z = dir * Math.PI / 4;
      figureheadGroup.add(bone);
    });

    // 12 Radiating Solar Petals (Sunny Mane)
    const petalCount = 12;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalGeo = new THREE.ConeGeometry(0.20, 0.85, 10);
      const petalMesh = new THREE.Mesh(petalGeo, this.goldMat);
      petalMesh.position.set(Math.cos(angle) * 0.78, Math.sin(angle) * 0.78, -0.12);
      petalMesh.rotation.z = angle - Math.PI / 2;
      petalMesh.rotation.x = Math.PI / 2;
      figureheadGroup.add(petalMesh);
    }

    const maneRingGeo = new THREE.TorusGeometry(0.78, 0.07, 10, 28);
    const maneRing = new THREE.Mesh(maneRingGeo, this.goldMat);
    maneRing.position.z = -0.13;
    figureheadGroup.add(maneRing);

    // Bowsprit Extending Forward & Gently Upward
    // Aligned directly along ship's prow (Z-axis) at 18 degrees upward rake
    const bowspritLength = 4.2;
    const bowspritGeo = new THREE.CylinderGeometry(0.09, 0.18, bowspritLength, 12);
    bowspritGeo.rotateX(Math.PI / 2);
    bowspritGeo.translate(0, 0, bowspritLength / 2); // pivot at base
    const bowspritMesh = new THREE.Mesh(bowspritGeo, this.hullMat);
    bowspritMesh.rotation.x = -0.32; // upward rake
    bowspritMesh.position.set(0, 0.35, 0.2);
    bowspritMesh.castShadow = true;
    figureheadGroup.add(bowspritMesh);

    // Golden Reinforcing Bands along Bowsprit
    [1.2, 2.4, 3.6].forEach((bz) => {
      const bandGeo = new THREE.TorusGeometry(0.14, 0.025, 8, 16);
      const band = new THREE.Mesh(bandGeo, this.goldMat);
      band.position.set(0, 0.35 + bz * Math.sin(0.32), 0.2 + bz * Math.cos(0.32));
      band.rotation.x = -0.32;
      figureheadGroup.add(band);
    });

    this.group.add(figureheadGroup);

    // ----------------------------------------------------
    // 8. Triangular Jib Staysails
    // ----------------------------------------------------
    // Inner Jib Sail
    this.createJibSail(0, 2.7, 5.8, 0, 7.2, 2.8, 0, 3.3, 3.7);
    // Outer Flying Jib Sail
    this.createJibSail(0, 3.8, 7.8, 0, 8.4, 2.8, 0, 4.4, 4.8);

    // ----------------------------------------------------
    // 9. Three Tiered Masts with Full Rigging & Billowing Sails
    // ----------------------------------------------------
    // Main Mast (Center, largest - displaying Straw Hat Jolly Roger)
    this.createMast(0, 2.18, 0.1, 9.6, 4.4, 3.3, true);

    // Foremast (Forward - displaying clean ivory topsail)
    this.createMast(0, 2.52, 2.8, 7.8, 3.4, 2.6, false);

    // Mizzenmast (Aft on cabin - clean ivory sail)
    this.createMast(0, 4.18, -3.1, 5.9, 2.5, 1.9, false);

    // Standing Rigging: Shrouds with Realistic Ratlines (Rope Ladders)
    this.createShroudsWithRatlines(-1.52, 2.2, 0.1, 0, 8.6, 0.1);
    this.createShroudsWithRatlines(1.52, 2.2, 0.1, 0, 8.6, 0.1);
    this.createShroudsWithRatlines(-1.48, 2.4, 2.8, 0, 7.0, 2.8);
    this.createShroudsWithRatlines(1.48, 2.4, 2.8, 0, 7.0, 2.8);

    // Heavy Forestays from Masts to Bowsprit
    this.createRopeStay(0, 7.0, 2.8, 0, 4.0, 8.2);
    this.createRopeStay(0, 8.6, 0.1, 0, 6.4, 2.8);

    // ----------------------------------------------------
    // 10. Warm Brass Deck Lanterns
    // ----------------------------------------------------
    this.createOrnateLantern(0, 3.7, 4.9);      // Bow Lantern
    this.createOrnateLantern(-1.52, 2.55, 0.2); // Port Midship Lantern
    this.createOrnateLantern(1.52, 2.55, 0.2);  // Starboard Midship Lantern
    this.createOrnateLantern(0, 4.75, -4.5);    // Stern Gallery Lantern

    // Hero Staging: Positioned on the right with a 3/4 cinematic angle
    this.group.scale.set(0.85, 0.85, 0.85);
    this.group.position.set(this.baseX, this.draftOffset, this.baseZ);
    this.group.rotation.y = this.baseRotationY;
  }

  createHullDetail() {
    // Gold sheer stripe follows the visible port/starboard profile and makes the Sunny read at a glance.
    const stripeGeo = new THREE.BoxGeometry(3.30, 0.11, 9.25, 2, 1, 12);
    const stripe = new THREE.Mesh(stripeGeo, this.goldMat);
    stripe.position.y = 1.42;
    stripe.castShadow = true;
    this.group.add(stripe);

    // Repeated framed portholes add scale and break up the broad hull side.
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

    // Short vertical ribs suggest real framing without adding a heavy high-poly hull.
    [-3.8, -2.6, -1.4, -0.2, 1.0, 2.2, 3.4].forEach((z) => {
      [-1, 1].forEach((side) => {
        const ribGeo = new THREE.BoxGeometry(0.08, 0.92, 0.16);
        const rib = new THREE.Mesh(ribGeo, this.darkWoodMat);
        rib.position.set(side * 1.57, 1.18, z);
        rib.rotation.x = z > 0 ? -0.08 : 0.05;
        this.group.add(rib);
      });
    });

    // Red sunburst panels are a signature Sunny accent beneath the gunwale.
    [-1, 1].forEach((side) => {
      const panelGeo = new THREE.BoxGeometry(0.08, 0.34, 1.4);
      const panel = new THREE.Mesh(panelGeo, this.paintRedMat);
      panel.position.set(side * 1.62, 1.88, 3.72);
      panel.rotation.z = side * 0.18;
      this.group.add(panel);
    });

    // Raised cleats and mooring bollards make the forecastle feel functional.
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
    // Framed stern windows with warm cabin light.
    [-0.78, 0, 0.78].forEach((x) => {
      const frameGeo = new THREE.BoxGeometry(0.48, 0.62, 0.08);
      const frame = new THREE.Mesh(frameGeo, this.goldMat);
      frame.position.set(x, 3.28, -4.77);
      this.group.add(frame);

      const paneGeo = new THREE.PlaneGeometry(0.34, 0.46);
      const pane = new THREE.Mesh(paneGeo, this.windowMat);
      pane.position.set(x, 3.28, -4.82);
      pane.rotation.y = Math.PI;
      this.group.add(pane);
    });

    // Two small stern balconies make the rear silhouette less box-like.
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

    // Stern flag staff and a compact red pennant.
    const staffGeo = new THREE.CylinderGeometry(0.035, 0.05, 1.15, 8);
    const staff = new THREE.Mesh(staffGeo, this.darkWoodMat);
    staff.position.set(0, 5.03, -4.42);
    this.group.add(staff);
    const pennantGeo = new THREE.PlaneGeometry(0.72, 0.34);
    const pennant = new THREE.Mesh(pennantGeo, new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.55,
      side: THREE.DoubleSide
    }));
    pennant.position.set(0.36, 5.42, -4.42);
    this.group.add(pennant);
  }

  createJibSail(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
    const geom = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      x1, y1, z1,
      x2, y2, z2,
      x3, y3, z3,
      // Double sided triangle
      x3, y3, z3,
      x2, y2, z2,
      x1, y1, z1
    ]);
    const uvs = new Float32Array([
      0.0, 0.0,
      0.5, 1.0,
      1.0, 0.0,
      1.0, 0.0,
      0.5, 1.0,
      0.0, 0.0
    ]);
    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geom.computeVertexNormals();

    const jibMesh = new THREE.Mesh(geom, this.plainSailMat);
    this.group.add(jibMesh);
  }

  createCannon(x, y, z, rotationY) {
    const cannonGroup = new THREE.Group();
    cannonGroup.position.set(x, y, z);
    cannonGroup.rotation.y = rotationY;

    // Recessed Dark Gunport Opening
    const portHoleGeo = new THREE.BoxGeometry(0.52, 0.52, 0.08);
    const portHoleMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const portHole = new THREE.Mesh(portHoleGeo, portHoleMat);
    portHole.position.set(0, 0, -0.02);
    cannonGroup.add(portHole);

    // Weathered Red Oak Gunport Lid
    const portLidGeo = new THREE.BoxGeometry(0.50, 0.50, 0.07);
    const portLid = new THREE.Mesh(portLidGeo, this.crimsonWoodMat);
    portLid.position.set(0, 0.32, 0.16);
    portLid.rotation.x = -Math.PI / 3.8; // realistically propped open
    cannonGroup.add(portLid);

    // Tapered Cast-Iron Cannon Barrel with Reinforce Rings
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

  createAnchor(x, y, z, side = 1) {
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

    // Flukes
    const flukeGeo = new THREE.TorusGeometry(0.42, 0.065, 6, 12, Math.PI);
    const fluke = new THREE.Mesh(flukeGeo, this.ironMat);
    fluke.position.y = -0.65;
    fluke.rotation.z = Math.PI;
    anchorGroup.add(fluke);

    this.group.add(anchorGroup);
  }

  createMast(x, y, z, height, yardWidth, sailHeight, hasJollyRoger = false) {
    const mastGroup = new THREE.Group();
    mastGroup.position.set(x, y, z);

    // Lower Mast & Topmast
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

    // Crow's Nest / Fighting Top Platform
    const nestGeo = new THREE.CylinderGeometry(0.55, 0.46, 0.60, 12, 1, true);
    const nestMesh = new THREE.Mesh(nestGeo, this.hullMat);
    nestMesh.position.y = height * 0.80;
    mastGroup.add(nestMesh);

    // Masthead Cap
    const capGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.08, 12);
    const cap = new THREE.Mesh(capGeo, this.goldMat);
    cap.position.y = height * 0.77;
    mastGroup.add(cap);

    // Pirate Pennant Flag at Mast Top
    const flagGeo = new THREE.PlaneGeometry(1.25, 0.72);
    const flagMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.85,
      side: THREE.DoubleSide
    });
    const flagMesh = new THREE.Mesh(flagGeo, flagMat);
    flagMesh.position.set(0.65, height + 0.32, 0);
    mastGroup.add(flagMesh);

    // Main Billowing Square Sail
    const sailGeo = new THREE.PlaneGeometry(yardWidth * 0.94, sailHeight, 28, 28);
    const mat = hasJollyRoger ? this.jollyRogerSailMat : this.plainSailMat;
    const sailMesh = new THREE.Mesh(sailGeo, mat);
    sailMesh.position.set(0, height * 0.52, 0.25);
    sailMesh.castShadow = true;
    mastGroup.add(sailMesh);
    this.sails.push(sailMesh);

    // Upper Topsail
    const topSailGeo = new THREE.PlaneGeometry(yardWidth * 0.66, sailHeight * 0.56, 18, 18);
    const topSailMesh = new THREE.Mesh(topSailGeo, this.plainSailMat);
    topSailMesh.position.set(0, height * 0.88, 0.18);
    mastGroup.add(topSailMesh);
    this.sails.push(topSailMesh);

    this.group.add(mastGroup);
  }

  createShroudsWithRatlines(x1, y1, z1, x2, y2, z2) {
    const shroudsGroup = new THREE.Group();

    // 3 Main Vertical Shroud Ropes
    const offsets = [-0.35, 0, 0.35];
    offsets.forEach((offset) => {
      const points = [
        new THREE.Vector3(x1, y1, z1 + offset),
        new THREE.Vector3(x2, y2, z2)
      ];
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(curveGeo, new THREE.LineBasicMaterial({ color: 0x3a2c20 }));
      shroudsGroup.add(line);
    });

    // Horizontal Ratlines (Rope Ladders spaced vertically)
    const stepCount = 14;
    for (let i = 2; i < stepCount; i++) {
      const t = i / stepCount;
      const curY = y1 + (y2 - y1) * t;
      const curX = x1 + (x2 - x1) * t;
      const width = 0.70 * (1.0 - t * 0.75);

      const rPoints = [
        new THREE.Vector3(curX, curY, z1 - width / 2),
        new THREE.Vector3(curX, curY, z1 + width / 2)
      ];
      const rGeo = new THREE.BufferGeometry().setFromPoints(rPoints);
      const rLine = new THREE.Line(rGeo, new THREE.LineBasicMaterial({ color: 0x48382c }));
      shroudsGroup.add(rLine);
    }

    this.group.add(shroudsGroup);
  }

  createRopeStay(x1, y1, z1, x2, y2, z2) {
    const points = [new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2)];
    const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(curveGeo, new THREE.LineBasicMaterial({ color: 0x443428, linewidth: 2 }));
    this.group.add(line);
  }

  createOrnateLantern(x, y, z) {
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(x, y, z);

    const capGeo = new THREE.ConeGeometry(0.18, 0.14, 6);
    const topCap = new THREE.Mesh(capGeo, this.goldMat);
    topCap.position.y = 0.22;
    lanternGroup.add(topCap);

    const botCap = new THREE.Mesh(capGeo, this.goldMat);
    botCap.rotation.x = Math.PI;
    botCap.position.y = -0.22;
    lanternGroup.add(botCap);

    const cageGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.36, 6, 1, true);
    const cage = new THREE.Mesh(cageGeo, this.lanternCageMat);
    lanternGroup.add(cage);

    const glassGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.32, 12);
    const glass = new THREE.Mesh(glassGeo, this.glassMat);
    lanternGroup.add(glass);

    const coreGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const core = new THREE.Mesh(coreGeo, this.lanternCoreMat);
    lanternGroup.add(core);

    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 64;
    glowCanvas.height = 64;
    const ctx = glowCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 215, 100, 1.0)');
    grad.addColorStop(0.3, 'rgba(251, 146, 60, 0.65)');
    grad.addColorStop(0.7, 'rgba(217, 119, 6, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    glowTexture.needsUpdate = true;
    const spriteMat = new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const glowSprite = new THREE.Sprite(spriteMat);
    glowSprite.scale.set(1.5, 1.5, 1.5);
    lanternGroup.add(glowSprite);

    const pointLight = new THREE.PointLight(0xf59e0b, 2.2, 12, 1.8);
    lanternGroup.add(pointLight);

    this.lanterns.push({
      group: lanternGroup,
      light: pointLight,
      sprite: glowSprite,
      baseIntensity: 2.2
    });

    this.group.add(lanternGroup);
  }

  update(delta) {
    this.time += delta;

    if (this.jollyRogerSailMat?.uniforms?.uTime) {
      this.jollyRogerSailMat.uniforms.uTime.value = this.time;
    }
    if (this.plainSailMat?.uniforms?.uTime) {
      this.plainSailMat.uniforms.uTime.value = this.time;
    }

    // Lantern flame flicker
    this.lanterns.forEach((l, index) => {
      const flicker = Math.sin(this.time * 7.5 + index * 1.9) * 0.3 +
                      Math.cos(this.time * 13.0 + index * 2.7) * 0.18;
      const currentIntensity = Math.max(0.8, l.baseIntensity + flicker);
      l.light.intensity = currentIntensity;

      const spriteScale = 1.35 + flicker * 0.16;
      l.sprite.scale.set(spriteScale, spriteScale, spriteScale);
    });

    // Buoyancy Wave Physics with natural water immersion
    const ocean = this.experience.world?.ocean;
    if (ocean) {
      const shipX = this.baseX;
      const shipZ = this.baseZ;

      const bowY = ocean.getWaveHeight(shipX, shipZ + 4.2, this.time);
      const sternY = ocean.getWaveHeight(shipX, shipZ - 4.2, this.time);
      const centerY = ocean.getWaveHeight(shipX, shipZ, this.time);

      const portY = ocean.getWaveHeight(shipX - 1.8, shipZ, this.time);
      const stbdY = ocean.getWaveHeight(shipX + 1.8, shipZ, this.time);

      // Deep draft so the hull stays naturally immersed in the water
      this.targetY = this.draftOffset + centerY * 0.85;
      this.targetPitch = (bowY - sternY) * 0.082;
      this.targetRoll = (portY - stbdY) * 0.125;

      this.group.position.x = this.baseX;
      this.group.position.z = this.baseZ;
      this.group.position.y = lerp(this.group.position.y, this.targetY, 0.08);

      this.group.rotation.x = lerp(this.group.rotation.x, this.targetPitch, 0.065);
      this.group.rotation.z = lerp(this.group.rotation.z, this.targetRoll, 0.065);

      // Gentle yaw sway
      this.group.rotation.y = this.baseRotationY + Math.sin(this.time * 0.32) * 0.035;
    }
  }
}
