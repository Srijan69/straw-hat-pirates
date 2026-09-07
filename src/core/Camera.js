import * as THREE from 'three';
import { lerp } from '../utils/math.js';

export class Camera {
  constructor(experience) {
    this.experience = experience;
    this.sizes = experience.sizes;
    this.scene = experience.scene;

    // Base position and look-at target
    this.targetPosition = new THREE.Vector3(0, 4.5, 14);
    this.targetLookAt = new THREE.Vector3(0, 1.8, 0);
    this.currentLookAt = new THREE.Vector3(0, 1.8, 0);

    // Parallax mouse offsets
    this.mouse = { x: 0, y: 0 };
    this.parallax = { x: 0, y: 0 };

    this.setInstance();
    this.initMouseEvents();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      45,
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
  }

  update() {
    // Parallax smooth interpolation
    this.parallax.x = lerp(this.parallax.x, this.mouse.x * 1.2, 0.05);
    this.parallax.y = lerp(this.parallax.y, this.mouse.y * 0.8, 0.05);

    // Dynamic camera position with parallax offset
    this.instance.position.x = this.targetPosition.x + this.parallax.x;
    this.instance.position.y = this.targetPosition.y + this.parallax.y;
    this.instance.position.z = this.targetPosition.z;

    // Smooth lookAt target lerp
    this.currentLookAt.x = lerp(this.currentLookAt.x, this.targetLookAt.x, 0.08);
    this.currentLookAt.y = lerp(this.currentLookAt.y, this.targetLookAt.y, 0.08);
    this.currentLookAt.z = lerp(this.currentLookAt.z, this.targetLookAt.z, 0.08);

    this.instance.lookAt(this.currentLookAt);
  }
}
