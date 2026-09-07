import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class ScrollAnimation {
  constructor(experience, lenis) {
    this.experience = experience;
    this.lenis = lenis;
    this.camera = experience.camera;
    this.world = experience.world;

    this.bindLenisWithGSAP();
    this.initScrollTimeline();
    this.initSectionReveals();
  }

  bindLenisWithGSAP() {
    if (this.lenis) {
      this.lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        this.lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    }
  }

  initScrollTimeline() {
    const cam = this.camera;
    const ship = this.world?.ship?.group;
    const moon = this.world?.environment?.moonLight;

    // Timeline for Section 2: The Crew
    gsap.timeline({
      scrollTrigger: {
        trigger: '#crew',
        start: 'top bottom',
        end: 'center center',
        scrub: 1.2
      }
    })
    .to(cam.targetPosition, {
      x: -3.5,
      y: 3.2,
      z: 8.5,
      ease: 'power2.out'
    }, 0)
    .to(cam.targetLookAt, {
      x: 0.5,
      y: 1.8,
      z: 0.5,
      ease: 'power2.out'
    }, 0);

    // Timeline for Section 3: Our Adventures (Expeditions)
    gsap.timeline({
      scrollTrigger: {
        trigger: '#adventures',
        start: 'top bottom',
        end: 'center center',
        scrub: 1.2
      }
    })
    .to(cam.targetPosition, {
      x: 4.8,
      y: 9.5,
      z: 15.0,
      ease: 'power2.out'
    }, 0)
    .to(cam.targetLookAt, {
      x: 0,
      y: 1.2,
      z: -2.0,
      ease: 'power2.out'
    }, 0);

    // Timeline for Section 4: Skills & Powers (Haki Matrix)
    gsap.timeline({
      scrollTrigger: {
        trigger: '#skills',
        start: 'top bottom',
        end: 'center center',
        scrub: 1.2
      }
    })
    .to(cam.targetPosition, {
      x: 5.5,
      y: 4.2,
      z: 6.8,
      ease: 'power2.out'
    }, 0)
    .to(cam.targetLookAt, {
      x: -0.8,
      y: 2.2,
      z: 0,
      ease: 'power2.out'
    }, 0);

    // Timeline for Section 5: Join the Crew (Transponder Uplink)
    gsap.timeline({
      scrollTrigger: {
        trigger: '#contact',
        start: 'top bottom',
        end: 'center center',
        scrub: 1.2
      }
    })
    .to(cam.targetPosition, {
      x: 0,
      y: 3.2,
      z: 11.5,
      ease: 'power2.out'
    }, 0)
    .to(cam.targetLookAt, {
      x: 0,
      y: 2.2,
      z: -5.0,
      ease: 'power2.out'
    }, 0);
  }

  initSectionReveals() {
    // Reveal animations for titles and cards
    const revealSections = document.querySelectorAll('.section-header, .crew-card, .project-card, .skill-discipline-card, .terminal-form-card, .contact-info-panel');
    
    revealSections.forEach((el) => {
      gsap.fromTo(el, 
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
  }
}
