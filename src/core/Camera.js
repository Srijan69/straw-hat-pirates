import * as THREE from 'three';
import { lerp } from '../utils/math.js';

export class Camera {
  constructor(experience) {
    this.experience = experience;
    this.sizes = experience.sizes;
    this.scene = experience.scene;

    // Base cinematic editorial staging: frames Thousand Sunny proudly in golden ratio on the right
    this.baseTargetPosition = new THREE.Vector3(0.0, 4.4, 19.5);
    this.baseTargetLookAt = new THREE.Vector3(3.8, 2.6, 0.2);

    // Scroll-driven offsets (driven by GSAP ScrollTrigger)
    this.scrollTargetPosition = new THREE.Vector3(0, 0, 0);
    this.scrollTargetLookAt = new THREE.Vector3(0, 0, 0);
    this.scrollFovOffset = 0;

    // Combined target vectors
    this.targetPosition = new THREE.Vector3(0.0, 4.4, 19.5);
    this.targetLookAt = new THREE.Vector3(3.8, 2.6, 0.2);
    this.currentLookAt = new THREE.Vector3(3.8, 2.6, 0.2);

    this.updateBaseTargetForScreen();
    this.currentLookAt.copy(this.targetLookAt);

    // Mouse parallax offsets
    this.mouse = { x: 0, y: 0 };
    this.parallax = { x: 0, y: 0 };

    this.baseFov = 35;
    this.setInstance();
    this.initMouseEvents();
  }

  updateBaseTargetForScreen() {
    const aspect = this.sizes.width / this.sizes.height;
    if (aspect < 1.0) {
      // Portrait / Mobile view: pull camera back and center slightly
      this.baseTargetPosition.set(0.0, 4.5, 23.0);
      this.baseTargetLookAt.set(1.2, 2.2, 0.0);
    } else if (aspect < 1.4) {
      // Tablet / Square view
      this.baseTargetPosition.set(0.0, 4.2, 20.5);
      this.baseTargetLookAt.set(2.4, 2.4, 0.2);
    } else {
      // Desktop widescreen: cinematic golden-ratio staging framing the Thousand Sunny on the right
      this.baseTargetPosition.set(0.0, 4.4, 19.5);
      this.baseTargetLookAt.set(3.8, 2.6, 0.2);
    }
  }

  setInstance() {
    // Cinematic focal length (~60mm equivalent)
    this.instance = new THREE.PerspectiveCamera(
      this.baseFov,
      this.sizes.width / this.sizes.height,
      0.1,
      1000
    );
    this.instance.position.copy(this.baseTargetPosition);
    this.instance.lookAt(this.baseTargetLookAt);
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

    // Combine base target + scroll offsets
    this.targetPosition.copy(this.baseTargetPosition).add(this.scrollTargetPosition);
    this.targetLookAt.copy(this.baseTargetLookAt).add(this.scrollTargetLookAt);

    // Dynamic FOV breathing
    if (this.instance.fov !== this.baseFov + this.scrollFovOffset) {
      this.instance.fov = lerp(this.instance.fov, this.baseFov + this.scrollFovOffset, 0.05);
      this.instance.updateProjectionMatrix();
    }

    // 1. Organic harmonic ocean floating motion
    const floatX = Math.sin(time * 0.38) * 0.15;
    const floatY = Math.sin(time * 0.58) * 0.12 + Math.cos(time * 0.28) * 0.06;
    const floatZ = Math.cos(time * 0.34) * 0.10;

    const lookFloatX = Math.sin(time * 0.32) * 0.06;
    const lookFloatY = Math.cos(time * 0.46) * 0.04;

    // 2. Ultra-smooth dampened mouse parallax
    this.parallax.x = lerp(this.parallax.x, this.mouse.x * 0.65, 0.035);
    this.parallax.y = lerp(this.parallax.y, this.mouse.y * 0.42, 0.035);

    // 3. Apply position
    this.instance.position.x = lerp(this.instance.position.x, this.targetPosition.x + this.parallax.x + floatX, 0.065);
    this.instance.position.y = lerp(this.instance.position.y, this.targetPosition.y + this.parallax.y + floatY, 0.065);
    this.instance.position.z = lerp(this.instance.position.z, this.targetPosition.z + floatZ, 0.065);

    // 4. Smooth camera focus tracking
    this.currentLookAt.x = lerp(this.currentLookAt.x, this.targetLookAt.x + this.parallax.x * 0.22 + lookFloatX, 0.055);
    this.currentLookAt.y = lerp(this.currentLookAt.y, this.targetLookAt.y + this.parallax.y * 0.18 + lookFloatY, 0.055);
    this.currentLookAt.z = lerp(this.currentLookAt.z, this.targetLookAt.z, 0.055);

    this.instance.lookAt(this.currentLookAt);
  }
}
