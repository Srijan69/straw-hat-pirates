import { lerp } from './math.js';

export class CustomCursor {
  constructor() {
    this.cursor = document.querySelector('.custom-cursor');
    this.follower = document.querySelector('.cursor-follower');
    
    if (!this.cursor || !this.follower) return;

    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.followerPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.isHovering = false;

    this.initEvents();
    this.render();
  }

  initEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;

      this.cursor.style.transform = `translate(${this.mouse.x}px, ${this.mouse.y}px)`;
    });

    // Detect hoverable elements
    const hoverElements = document.querySelectorAll('a, button, input, textarea, select, .crew-card, .project-card, .crew-tab-btn, .filter-btn');
    hoverElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });
  }

  render() {
    this.followerPos.x = lerp(this.followerPos.x, this.mouse.x, 0.15);
    this.followerPos.y = lerp(this.followerPos.y, this.mouse.y, 0.15);

    if (this.follower) {
      this.follower.style.transform = `translate(${this.followerPos.x}px, ${this.followerPos.y}px)`;
    }

    requestAnimationFrame(this.render.bind(this));
  }
}
