import Lenis from 'lenis';
import { Experience } from './core/Experience.js';
import { AssetLoader } from './core/AssetLoader.js';
import { SoundManager } from './audio/SoundManager.js';
import { ScrollAnimation } from './animations/ScrollAnimation.js';
import { UIAnimations } from './animations/UIAnimations.js';
import { Navigation } from './components/Navigation.js';
import { CrewSection } from './components/CrewSection.js';
import { ProjectsSection } from './components/ProjectsSection.js';
import { SkillsSection } from './components/SkillsSection.js';
import { ContactSection } from './components/ContactSection.js';
import { CustomCursor } from './utils/cursor.js';

class App {
  constructor() {
    this.initCursor();
    this.initLenis();
    this.initExperience();
    this.initLoader();
  }

  initCursor() {
    this.cursor = new CustomCursor();
  }

  initLenis() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false
    });
  }

  initExperience() {
    this.canvas = document.getElementById('webgl-canvas');
    this.experience = new Experience(this.canvas);
  }

  initLoader() {
    this.assetLoader = new AssetLoader(() => {
      this.onLoaded();
    });
  }

  onLoaded() {
    // 1. Initialize Audio Engine
    this.soundManager = new SoundManager();

    // 2. Initialize Navigation
    this.navigation = new Navigation(this.lenis);

    // 3. Initialize Interactive Sections
    this.crewSection = new CrewSection();
    this.projectsSection = new ProjectsSection();
    this.skillsSection = new SkillsSection();
    this.contactSection = new ContactSection(this.soundManager);

    // 4. Initialize GSAP Scroll Transitions & UI Animations
    this.scrollAnimation = new ScrollAnimation(this.experience, this.lenis);
    this.uiAnimations = new UIAnimations();

    console.log('⚓ Team Straw Hat Pirates 3D Experience Ready to Sail!');
  }
}

// Boot application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
