import * as THREE from 'three';
import { lerp } from '../utils/math.js';

export class Camera {
  constructor(experience) {
    this.experience = experience;
    this.sizes = experience.sizes;
    this.scene = experience.scene;

    // Cinematic Editorial Staging:
    // Frames the magnificent tall ship on the right (golden ratio)
    // leaving the left 45% open for the typography and CTA buttons.
    this.targetPosition = new THREE.Vector3(-1.8, 3.6, 17.8);
    this.targetLookAt = new THREE.Vector3(0.6, 2.3, 0.4);
    this.currentLookAt = new THREE.Vector3(0.6, 2.3, 0.4);

    // Responsive position cache
    this.updateBaseTargetForScreen();
    this.currentLookAt.copy(this.targetLookAt);

    // Mouse parallax offsets
    this.mouse = { x: 0, y: 0 };
    this.parallax = { x: 0, y: 0 };

    this.setInstance();
    this.initMouseEvents();
  }

  updateBaseTargetForScreen() {
    const aspect = this.sizes.width / this.sizes.height;
    if (aspect < 1.0) {
      // Portrait / Mobile view: pull camera back and center slightly
      this.targetPosition.set(0.0, 4.0, 22.0);
      this.targetLookAt.set(1.2, 2.2, 0.4);
    } else if (aspect < 1.4) {
      // Tablet / Square view
      this.targetPosition.set(-0.6, 3.8, 19.5);
      this.targetLookAt.set(1.0, 2.3, 0.4);
    } else {
      // Desktop widescreen: cinematic golden-ratio staging framing the ship on the right
      this.targetPosition.set(-1.8, 3.6, 17.8);
      this.targetLookAt.set(0.6, 2.3, 0.4);
    }
  }

  setInstance() {
    // Cinematic focal length (~60mm equivalent): compresses perspective, keeps ship majestic and eliminates wide-angle distortion
    this.instance = new THREE.PerspectiveCamera(
      36,
      this.sizes.width / this.sizes.height,
      0.1,
      1000
    );
    this.instance.position.copy(this.targetPosition);
    this.instance.lookAt(this.targetLookAt);
    this.scene.add(this.instance);
  }

  initMouseEvents() {
    window.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / this.sizes.width - 0.5) * 2;
      this.mouse.y = -(event.clientY / this.sizes.height - 0.5) * 2;
    });
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
    this.updateBaseTargetForScreen();
  }

  update() {
    const time = performance.now() * 0.001;

    // 1. Subtle, organic harmonic ocean floating motion
    const floatX = Math.sin(time * 0.38) * 0.15;
    const floatY = Math.sin(time * 0.58) * 0.12 + Math.cos(time * 0.28) * 0.06;
    const floatZ = Math.cos(time * 0.34) * 0.10;

    const lookFloatX = Math.sin(time * 0.32) * 0.06;
    const lookFloatY = Math.cos(time * 0.46) * 0.04;

    // 2. Ultra-smooth dampened mouse parallax
    this.parallax.x = lerp(this.parallax.x, this.mouse.x * 0.65, 0.035);
    this.parallax.y = lerp(this.parallax.y, this.mouse.y * 0.42, 0.035);

    // 3. Apply position
    this.instance.position.x = this.targetPosition.x + this.parallax.x + floatX;
    this.instance.position.y = this.targetPosition.y + this.parallax.y + floatY;
    this.instance.position.z = this.targetPosition.z + floatZ;

    // 4. Smooth camera focus tracking
    this.currentLookAt.x = lerp(this.currentLookAt.x, this.targetLookAt.x + this.parallax.x * 0.22 + lookFloatX, 0.05);
    this.currentLookAt.y = lerp(this.currentLookAt.y, this.targetLookAt.y + this.parallax.y * 0.18 + lookFloatY, 0.05);
    this.currentLookAt.z = lerp(this.currentLookAt.z, this.targetLookAt.z, 0.05);

    this.instance.lookAt(this.currentLookAt);
  }
}
