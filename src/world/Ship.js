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

    // Staging parameters
    this.baseX = 4.4;
    this.baseZ = 0.2;
    this.baseRotationY = -0.58; // ~33 degree broadside hero angle

    // Buoyancy target states
    this.targetY = 0;
    this.targetPitch = 0;
    this.targetRoll = 0;

    this.createMaterials();
    this.buildShipModel();
    this.scene.add(this.group);
  }

  createMaterials() {
    // 1. Teak / Oak Hull in Daylight
    this.hullMat = new THREE.MeshStandardMaterial({
      color: 0x3d271a,
      roughness: 0.58,
      metalness: 0.06
    });

    // 2. Dark Planking & Wales
    this.darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x1a1109,
      roughness: 0.72,
      metalness: 0.04
    });

    // 3. Deck Flooring Material
    this.deckMat = new THREE.MeshStandardMaterial({
      color: 0x4a3224,
      roughness: 0.65,
      metalness: 0.05
    });

    // 4. Polished Pirate Gold & Brass (Sunny Lion Mane, Cannons, Trim)
    this.goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.22,
      metalness: 0.92,
      emissive: 0x78350f,
      emissiveIntensity: 0.12
    });

    // 5. Wrought Iron (Anchors, Chains, Hardware)
    this.ironMat = new THREE.MeshStandardMaterial({
      color: 0x1f242c,
      roughness: 0.44,
      metalness: 0.88
    });

    // 6. Ropes & Rigging
    this.ropeMat = new THREE.MeshStandardMaterial({
      color: 0x5a4838,
      roughness: 0.9,
      metalness: 0.02
    });

    // 7. Jolly Roger Canvas Textures
    this.jollyRogerTexture = this.createJollyRogerTexture();
    this.plainSailTexture = this.createPlainSailTexture();

    // 8. Translucent Backlit Canvas Sails Shaders
    this.jollyRogerSailMat = this.createSailShaderMaterial(this.jollyRogerTexture);
    this.plainSailMat = this.createSailShaderMaterial(this.plainSailTexture);

    // 9. Lantern Core & Glass
    this.lanternCoreMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
    this.glassMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.55
    });
  }

  createJollyRogerTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Weathered warm ivory canvas
    ctx.fillStyle = '#f8f2e4';
    ctx.fillRect(0, 0, 1024, 1024);

    // Canvas fabric weave texture
    for (let i = 0; i < 7000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const shade = Math.random() * 26 - 13;
      ctx.fillStyle = `rgba(${190 + shade}, ${180 + shade}, ${160 + shade}, 0.16)`;
      ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }

    // Vertical seam stitching
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
    // Authentic One Piece Straw Hat Jolly Roger
    // ----------------------------------------------------
    ctx.save();
    ctx.translate(512, 575);
    ctx.scale(0.76, 0.76); // Perfect fit on billowing canvas sail

    // Crossed Bones (Dark pirate ink)
    ctx.fillStyle = '#110d08';
    ctx.strokeStyle = '#110d08';
    ctx.lineWidth = 46;
    ctx.lineCap = 'round';

    // Bone 1: Top-Left to Bottom-Right
    ctx.beginPath();
    ctx.moveTo(-310, -230);
    ctx.lineTo(310, 230);
    ctx.stroke();
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.arc(dir * 310 - dir * 18, dir * 230 + 24, 30, 0, Math.PI * 2);
      ctx.arc(dir * 310 + 24, dir * 230 - dir * 18, 30, 0, Math.PI * 2);
      ctx.fill();
    });

    // Bone 2: Bottom-Left to Top-Right
    ctx.beginPath();
    ctx.moveTo(-310, 230);
    ctx.lineTo(310, -230);
    ctx.stroke();
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.arc(dir * 310 - dir * 18, -dir * 230 - 24, 30, 0, Math.PI * 2);
      ctx.arc(dir * 310 + 24, -dir * 230 + dir * 18, 30, 0, Math.PI * 2);
      ctx.fill();
    });

    // Skull Head (Solid Black Stencil)
    ctx.beginPath();
    ctx.ellipse(0, 5, 195, 175, 0, 0, Math.PI * 2);
    ctx.fill();

    // Jaw Outline
    ctx.beginPath();
    ctx.rect(-95, 110, 190, 105);
    ctx.fill();

    // Large hollow eye sockets (cloth background shows through)
    ctx.fillStyle = '#f8f2e4';
    ctx.beginPath();
    ctx.ellipse(-70, -8, 46, 58, -0.15, 0, Math.PI * 2);
    ctx.ellipse(70, -8, 46, 58, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Inverted heart / triangle nose
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.lineTo(-22, 82);
    ctx.lineTo(22, 82);
    ctx.closePath();
    ctx.fill();

    // Skull Teeth
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#f8f2e4';
    for (let x = -65; x <= 65; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 125);
      ctx.lineTo(x, 195);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-85, 160);
    ctx.lineTo(85, 160);
    ctx.stroke();

    // Straw Hat Crown (Luffy's signature golden-yellow hat dome)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, -95, 170, Math.PI, 0);
    ctx.fill();

    // Straw Hat Crimson Red Ribbon Band
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-172, -118, 344, 30);

    // Straw Hat Wide Curved Brim
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.ellipse(0, -94, 290, 42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Brim dark rim border
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 5;
    ctx.stroke();

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

    ctx.fillStyle = '#f8f2e4';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 3500; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const shade = Math.random() * 24 - 12;
      ctx.fillStyle = `rgba(${190 + shade}, ${180 + shade}, ${160 + shade}, 0.16)`;
      ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }

    ctx.strokeStyle = 'rgba(125, 105, 80, 0.25)';
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
          // Billow outwards towards +Z with natural wind flutter
          float billow = sin(uv.y * 3.14159) * 0.52;
          float flutter = sin(uTime * 2.2 + uv.y * 4.0 + uv.x * 3.0) * 0.08 * (1.0 - uv.y);
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

          // Daylight translucency
          float backlight = pow(max(dot(-viewDir, lightDir), 0.0), 2.2) * 0.7;
          float frontlight = max(dot(n, lightDir), 0.0) * 0.75;
          float ambientCloth = 0.52;

          vec4 texColor = texture2D(uSailMap, vUv);

          vec3 finalIllumination = (ambientCloth + frontlight) * vec3(0.96, 0.96, 0.94) + backlight * uSunColor * 1.1;
          gl_FragColor = vec4(texColor.rgb * finalIllumination, 1.0);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uSailMap: { value: texture },
        uSunDirection: { value: new THREE.Vector3(25, 55, -25) },
        uSunColor: { value: new THREE.Color('#fffbeb') }
      },
      side: THREE.DoubleSide
    });
  }

  buildShipModel() {
    // ----------------------------------------------------
    // 1. Sculpted Hull with Nautical Flare & Planking
    // ----------------------------------------------------
    const hullGeo = new THREE.BoxGeometry(2.8, 2.1, 9.2, 4, 3, 10);
    const pos = hullGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      if (z > 0) {
        let t = z / 4.6;
        let taper = 1.0 - t * 0.7;
        pos.setX(i, x * taper);
        pos.setY(i, y + t * t * 0.65);
        if (y < 0) {
          pos.setX(i, pos.getX(i) * 0.6);
        }
      }
      if (z < 0) {
        let t = Math.abs(z) / 4.6;
        let taper = 1.0 - t * 0.35;
        pos.setX(i, x * taper);
        pos.setY(i, y + t * 0.55);
      }
    }
    hullGeo.computeVertexNormals();

    const hullMesh = new THREE.Mesh(hullGeo, this.hullMat);
    hullMesh.position.y = 1.0;
    hullMesh.castShadow = true;
    hullMesh.receiveShadow = true;
    this.group.add(hullMesh);

    // Wale strakes (wooden cladding strips)
    const strakeGeo = new THREE.BoxGeometry(2.95, 0.16, 9.1);
    const strake1 = new THREE.Mesh(strakeGeo, this.darkWoodMat);
    strake1.position.y = 1.5;
    this.group.add(strake1);

    const strake2 = new THREE.Mesh(strakeGeo, this.darkWoodMat);
    strake2.position.y = 0.9;
    this.group.add(strake2);

    // Golden Gunwale Rub Rail
    const railGeo = new THREE.BoxGeometry(3.0, 0.22, 9.3);
    const railMesh = new THREE.Mesh(railGeo, this.goldMat);
    railMesh.position.y = 2.05;
    this.group.add(railMesh);

    // ----------------------------------------------------
    // 2. Deck Surfaces & Planking
    // ----------------------------------------------------
    const mainDeckGeo = new THREE.BoxGeometry(2.6, 0.15, 8.8);
    const mainDeck = new THREE.Mesh(mainDeckGeo, this.deckMat);
    mainDeck.position.y = 2.0;
    mainDeck.receiveShadow = true;
    this.group.add(mainDeck);

    // Deck Hatch Grating
    const hatchGeo = new THREE.BoxGeometry(1.2, 0.12, 1.4);
    const hatchMesh = new THREE.Mesh(hatchGeo, this.darkWoodMat);
    hatchMesh.position.set(0, 2.12, 0.6);
    this.group.add(hatchMesh);

    // ----------------------------------------------------
    // 3. Cannons (4 Port, 4 Starboard)
    // ----------------------------------------------------
    const cannonPositions = [-2.2, -0.8, 0.6, 2.0];
    cannonPositions.forEach((zPos) => {
      this.createCannon(-1.42, 1.65, zPos, -Math.PI / 2);
      this.createCannon(1.42, 1.65, zPos, Math.PI / 2);
    });

    // ----------------------------------------------------
    // 4. Stern Castle / Captain's Cabin
    // ----------------------------------------------------
    const cabinGeo = new THREE.BoxGeometry(2.5, 1.7, 2.8);
    const cabinMesh = new THREE.Mesh(cabinGeo, this.hullMat);
    cabinMesh.position.set(0, 2.8, -3.0);
    cabinMesh.castShadow = true;
    cabinMesh.receiveShadow = true;
    this.group.add(cabinMesh);

    // Cabin Roof Deck (Poop Deck)
    const cabinRoofGeo = new THREE.BoxGeometry(2.65, 0.22, 2.9);
    const cabinRoof = new THREE.Mesh(cabinRoofGeo, this.goldMat);
    cabinRoof.position.set(0, 3.7, -3.0);
    this.group.add(cabinRoof);

    // Stern Gallery Multilane Glowing Windows
    const sternWindowGeo = new THREE.PlaneGeometry(1.8, 0.9);
    const sternWindowMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide
    });
    const sternWindow = new THREE.Mesh(sternWindowGeo, sternWindowMat);
    sternWindow.position.set(0, 2.85, -4.42);
    sternWindow.rotation.y = Math.PI;
    this.group.add(sternWindow);

    // Window frame
    const frameGeo = new THREE.BoxGeometry(1.85, 0.95, 0.05);
    const frameMesh = new THREE.Mesh(frameGeo, this.darkWoodMat);
    frameMesh.position.set(0, 2.85, -4.4);
    this.group.add(frameMesh);

    // ----------------------------------------------------
    // 5. Quarterdeck Helm (Ship Steering Wheel)
    // ----------------------------------------------------
    this.createShipHelm(0, 3.82, -2.5);

    // ----------------------------------------------------
    // 6. Anchor & Iron Chains
    // ----------------------------------------------------
    this.createAnchor(1.45, 1.3, 3.8);

    // ----------------------------------------------------
    // 7. Thousand Sunny Lion Figurehead & Bowsprit
    // ----------------------------------------------------
    const figureheadGroup = new THREE.Group();
    figureheadGroup.position.set(0, 2.4, 4.7);

    // Lion Face Sphere
    const headGeo = new THREE.SphereGeometry(0.65, 20, 20);
    const headMesh = new THREE.Mesh(headGeo, this.goldMat);
    figureheadGroup.add(headMesh);

    // Lion Muzzle
    const muzzleGeo = new THREE.CylinderGeometry(0.26, 0.34, 0.38, 12);
    muzzleGeo.rotateX(Math.PI / 2);
    const muzzleMesh = new THREE.Mesh(muzzleGeo, this.goldMat);
    muzzleMesh.position.set(0, -0.12, 0.45);
    figureheadGroup.add(muzzleMesh);

    // Sunny Mane Petals (12 radiating gold petals)
    const petalCount = 12;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalGeo = new THREE.ConeGeometry(0.24, 0.9, 8);
      const petalMesh = new THREE.Mesh(petalGeo, this.goldMat);
      petalMesh.position.set(Math.cos(angle) * 0.82, Math.sin(angle) * 0.82, -0.12);
      petalMesh.rotation.z = angle - Math.PI / 2;
      petalMesh.rotation.x = Math.PI / 2;
      figureheadGroup.add(petalMesh);
    }

    // Heavy Tapered Bowsprit
    const bowspritGeo = new THREE.CylinderGeometry(0.1, 0.18, 3.2, 10);
    const bowspritMesh = new THREE.Mesh(bowspritGeo, this.darkWoodMat);
    bowspritMesh.rotation.x = Math.PI / 3.4;
    bowspritMesh.position.set(0, 0.65, 1.3);
    figureheadGroup.add(bowspritMesh);

    this.group.add(figureheadGroup);

    // ----------------------------------------------------
    // 8. Three Tiered Masts with Full Rigging & Billowing Sails
    // ----------------------------------------------------
    // Main Mast (Center, largest - with Straw Hat Jolly Roger)
    this.createMast(0, 2.0, 0.2, 8.4, 3.8, 2.8, true);

    // Foremast (Forward - also displaying the Straw Hat Jolly Roger)
    this.createMast(0, 2.0, 2.7, 6.8, 2.9, 2.2, true);

    // Mizzenmast (Aft on cabin - clean ivory topsail)
    this.createMast(0, 3.8, -2.8, 5.2, 2.2, 1.7, false);

    // Standing Rigging: Shrouds and Ratlines
    this.createShrouds(-1.3, 2.0, 0.2, 0, 7.8, 0.2);
    this.createShrouds(1.3, 2.0, 0.2, 0, 7.8, 0.2);
    this.createShrouds(-1.3, 2.0, 2.7, 0, 6.2, 2.7);
    this.createShrouds(1.3, 2.0, 2.7, 0, 6.2, 2.7);

    // Forestays (Heavy anchor ropes from mast to bow)
    this.createRopeStay(0, 6.2, 2.7, 0, 3.4, 5.8);
    this.createRopeStay(0, 7.8, 0.2, 0, 5.5, 2.7);

    // ----------------------------------------------------
    // 9. Ornate Warm Nautical Lanterns with Volumetric Glow
    // ----------------------------------------------------
    this.createOrnateLantern(0, 3.4, 4.6);     // Bow Figurehead Lantern
    this.createOrnateLantern(-1.35, 2.4, 0.3); // Port Midship Lantern
    this.createOrnateLantern(1.35, 2.4, 0.3);  // Starboard Midship Lantern
    this.createOrnateLantern(0, 4.3, -4.2);    // Stern Flagship Lantern

    // Hero Staging: Placed cleanly in the right negative space
    this.group.scale.set(0.96, 0.96, 0.96);
    this.group.position.set(this.baseX, 0, this.baseZ);
    this.group.rotation.y = this.baseRotationY;
  }

  createCannon(x, y, z, rotationY) {
    const cannonGroup = new THREE.Group();
    cannonGroup.position.set(x, y, z);
    cannonGroup.rotation.y = rotationY;

    const barrelGeo = new THREE.CylinderGeometry(0.09, 0.14, 0.85, 10);
    barrelGeo.rotateZ(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeo, this.ironMat);
    barrel.castShadow = true;
    cannonGroup.add(barrel);

    const carriageGeo = new THREE.BoxGeometry(0.35, 0.22, 0.35);
    const carriage = new THREE.Mesh(carriageGeo, this.darkWoodMat);
    carriage.position.set(-0.25, -0.08, 0);
    cannonGroup.add(carriage);

    this.group.add(cannonGroup);
  }

  createShipHelm(x, y, z) {
    const helmGroup = new THREE.Group();
    helmGroup.position.set(x, y, z);

    const baseGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.7, 8);
    const base = new THREE.Mesh(baseGeo, this.darkWoodMat);
    base.position.y = 0.35;
    helmGroup.add(base);

    const rimGeo = new THREE.TorusGeometry(0.32, 0.04, 8, 16);
    const rim = new THREE.Mesh(rimGeo, this.darkWoodMat);
    rim.position.set(0, 0.75, 0.1);
    helmGroup.add(rim);

    const hubGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.15, 8);
    hubGeo.rotateX(Math.PI / 2);
    const hub = new THREE.Mesh(hubGeo, this.goldMat);
    hub.position.set(0, 0.75, 0.1);
    helmGroup.add(hub);

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const spokeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6);
      const spoke = new THREE.Mesh(spokeGeo, this.goldMat);
      spoke.position.set(0, 0.75, 0.1);
      spoke.rotation.z = angle;
      helmGroup.add(spoke);
    }

    this.group.add(helmGroup);
  }

  createAnchor(x, y, z) {
    const anchorGroup = new THREE.Group();
    anchorGroup.position.set(x, y, z);
    anchorGroup.rotation.z = -Math.PI / 6;

    const shankGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8);
    const shank = new THREE.Mesh(shankGeo, this.ironMat);
    anchorGroup.add(shank);

    const stockGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.7, 6);
    stockGeo.rotateZ(Math.PI / 2);
    const stock = new THREE.Mesh(stockGeo, this.darkWoodMat);
    stock.position.y = 0.45;
    anchorGroup.add(stock);

    const flukeGeo = new THREE.TorusGeometry(0.35, 0.05, 6, 12, Math.PI);
    const fluke = new THREE.Mesh(flukeGeo, this.ironMat);
    fluke.position.y = -0.55;
    fluke.rotation.z = Math.PI;
    anchorGroup.add(fluke);

    this.group.add(anchorGroup);
  }

  createMast(x, y, z, height, yardWidth, sailHeight, hasJollyRoger = false) {
    const mastGroup = new THREE.Group();
    mastGroup.position.set(x, y, z);

    // Mast Pole
    const mastGeo = new THREE.CylinderGeometry(0.09, 0.17, height, 12);
    const mastMesh = new THREE.Mesh(mastGeo, this.darkWoodMat);
    mastMesh.position.y = height / 2;
    mastMesh.castShadow = true;
    mastGroup.add(mastMesh);

    // Lower Yard
    const lowerYardGeo = new THREE.CylinderGeometry(0.06, 0.06, yardWidth, 8);
    const lowerYard = new THREE.Mesh(lowerYardGeo, this.darkWoodMat);
    lowerYard.rotation.z = Math.PI / 2;
    lowerYard.position.y = height * 0.76;
    mastGroup.add(lowerYard);

    // Top Yard
    const topYardGeo = new THREE.CylinderGeometry(0.04, 0.04, yardWidth * 0.65, 8);
    const topYard = new THREE.Mesh(topYardGeo, this.darkWoodMat);
    topYard.rotation.z = Math.PI / 2;
    topYard.position.y = height * 0.96;
    mastGroup.add(topYard);

    // Crow's Nest
    const nestGeo = new THREE.CylinderGeometry(0.48, 0.4, 0.55, 12, 1, true);
    const nestMesh = new THREE.Mesh(nestGeo, this.hullMat);
    nestMesh.position.y = height * 0.82;
    mastGroup.add(nestMesh);

    // Flag
    const flagGeo = new THREE.PlaneGeometry(1.1, 0.65);
    const flagMat = new THREE.MeshStandardMaterial({
      color: 0x07090e,
      roughness: 0.85,
      side: THREE.DoubleSide
    });
    const flagMesh = new THREE.Mesh(flagGeo, flagMat);
    flagMesh.position.set(0.55, height + 0.25, 0);
    mastGroup.add(flagMesh);

    // Main Billowing Sail (Positioned in front of the mast at z = 0.22)
    const sailGeo = new THREE.PlaneGeometry(yardWidth * 0.94, sailHeight, 24, 24);
    const mat = hasJollyRoger ? this.jollyRogerSailMat : this.plainSailMat;
    const sailMesh = new THREE.Mesh(sailGeo, mat);
    sailMesh.position.set(0, height * 0.54, 0.22);
    sailMesh.castShadow = true;
    mastGroup.add(sailMesh);
    this.sails.push(sailMesh);

    // Upper Topsail
    const topSailGeo = new THREE.PlaneGeometry(yardWidth * 0.62, sailHeight * 0.55, 16, 16);
    const topSailMesh = new THREE.Mesh(topSailGeo, this.plainSailMat);
    topSailMesh.position.set(0, height * 0.89, 0.16);
    mastGroup.add(topSailMesh);
    this.sails.push(topSailMesh);

    this.group.add(mastGroup);
  }

  createShrouds(x1, y1, z1, x2, y2, z2) {
    for (let offset = -0.3; offset <= 0.3; offset += 0.3) {
      const points = [
        new THREE.Vector3(x1, y1, z1 + offset),
        new THREE.Vector3(x2, y2, z2)
      ];
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(curveGeo, new THREE.LineBasicMaterial({ color: 0x3e3228 }));
      this.group.add(line);
    }
  }

  createRopeStay(x1, y1, z1, x2, y2, z2) {
    const points = [new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2)];
    const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(curveGeo, new THREE.LineBasicMaterial({ color: 0x4a3c30, linewidth: 2 }));
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
    const cage = new THREE.Mesh(cageGeo, this.goldMat);
    cage.material.wireframe = true;
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

    const pointLight = new THREE.PointLight(0xf59e0b, 2.6, 13, 1.8);
    lanternGroup.add(pointLight);

    this.lanterns.push({
      group: lanternGroup,
      light: pointLight,
      sprite: glowSprite,
      baseIntensity: 2.6
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

    // Realistic Lantern Flame Flicker
    this.lanterns.forEach((l, index) => {
      const flicker = Math.sin(this.time * 7.5 + index * 1.9) * 0.35 +
                      Math.cos(this.time * 13.0 + index * 2.7) * 0.2;
      const currentIntensity = Math.max(0.8, l.baseIntensity + flicker);
      l.light.intensity = currentIntensity;

      const spriteScale = 1.35 + flicker * 0.16;
      l.sprite.scale.set(spriteScale, spriteScale, spriteScale);
    });

    // Buoyancy Wave Physics
    const ocean = this.experience.world?.ocean;
    if (ocean) {
      const shipX = this.baseX;
      const shipZ = this.baseZ;

      const bowY = ocean.getWaveHeight(shipX, shipZ + 3.8, this.time);
      const sternY = ocean.getWaveHeight(shipX, shipZ - 3.8, this.time);
      const centerY = ocean.getWaveHeight(shipX, shipZ, this.time);

      const portY = ocean.getWaveHeight(shipX - 1.6, shipZ, this.time);
      const stbdY = ocean.getWaveHeight(shipX + 1.6, shipZ, this.time);

      this.targetY = centerY * 0.88 + 0.18;
      this.targetPitch = (bowY - sternY) * 0.085;
      this.targetRoll = (portY - stbdY) * 0.13;

      this.group.position.x = this.baseX;
      this.group.position.z = this.baseZ;
      this.group.position.y = lerp(this.group.position.y, this.targetY, 0.08);

      this.group.rotation.x = lerp(this.group.rotation.x, this.targetPitch, 0.065);
      this.group.rotation.z = lerp(this.group.rotation.z, this.targetRoll, 0.065);

      // Sway around the broadside angle
      this.group.rotation.y = this.baseRotationY + Math.sin(this.time * 0.32) * 0.035;
    }
  }
}
