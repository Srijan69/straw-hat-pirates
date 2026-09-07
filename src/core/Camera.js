import * as THREE from 'three';
import { lerp } from '../utils/math.js';

export class Camera {
  constructor(experience) {
    this.experience = experience;
    this.sizes = experience.sizes;
    this.scene = experience.scene;

    // Cinematic Editorial Staging: Frames ship majestically on the right, hero typography on left
    this.targetPosition = new THREE.Vector3(0.0, 3.2, 13.8);
    this.targetLookAt = new THREE.Vector3(0.8, 2.0, 0.4);
    this.currentLookAt = new THREE.Vector3(0.8, 2.0, 0.4);

    // Parallax mouse offsets
    this.mouse = { x: 0, y: 0 };
    this.parallax = { x: 0, y: 0 };

    this.setInstance();
    this.initMouseEvents();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      42,
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
    // Smooth cinematic mouse parallax
    this.parallax.x = lerp(this.parallax.x, this.mouse.x * 0.85, 0.05);
    this.parallax.y = lerp(this.parallax.y, this.mouse.y * 0.55, 0.05);

    this.instance.position.x = this.targetPosition.x + this.parallax.x;
    this.instance.position.y = this.targetPosition.y + this.parallax.y;
    this.instance.position.z = this.targetPosition.z;

    this.currentLookAt.x = lerp(this.currentLookAt.x, this.targetLookAt.x, 0.08);
    this.currentLookAt.y = lerp(this.currentLookAt.y, this.targetLookAt.y, 0.08);
    this.currentLookAt.z = lerp(this.currentLookAt.z, this.targetLookAt.z, 0.08);

    this.instance.lookAt(this.currentLookAt);
  }
}
