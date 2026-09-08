import * as THREE from 'three';
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

      // Link scroll velocity to dynamic sail flutter
      this.lenis.on('scroll', (e) => {
        const velocity = Math.abs(e.velocity || 0);
        if (this.world?.ship?.scrollOffset) {
          const targetFlutter = 1.0 + Math.min(velocity * 0.08, 2.5);
          this.world.ship.scrollOffset.sailFlutter = THREE.MathUtils.lerp(
            this.world.ship.scrollOffset.sailFlutter,
            targetFlutter,
            0.15
          );
        }
      });

      gsap.ticker.add((time) => {
        this.lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    }
  }

  initScrollTimeline() {
    const cam = this.camera;
    const ship = this.world?.ship;
    const ocean = this.world?.ocean;
    const env = this.world?.environment;

    if (!cam || !ship) return;

    // Helper object for tweening atmosphere
    const atmosphere = {
      goldenHour: 0,
      waveIntensity: 1.0
    };

    // ------------------------------------------------------------------------
    // STAGE 1: Hero -> Section 2: The Crew
    // Camera glides to port quarter showing green lawn deck & Jolly Roger
    // Ship banks gracefully into the Grand Line
    // ------------------------------------------------------------------------
    gsap.timeline({
      scrollTrigger: {
        trigger: '#crew',
        start: 'top bottom',
        end: 'center center',
        scrub: 1.4
      }
    })
    .to(cam.scrollTargetPosition, {
      x: -2.4,
      y: 0.6,
      z: -6.5,
      ease: 'power2.inOut'
    }, 0)
    .to(cam.scrollTargetLookAt, {
      x: 0.8,
      y: 0.4,
      z: -0.2,
      ease: 'power2.inOut'
    }, 0)
    .to(cam, {
      scrollFovOffset: 2.5,
      ease: 'power2.inOut'
    }, 0)
    .to(ship.scrollOffset, {
      x: -1.2,
      z: -1.8,
      rotationY: -0.22,
      roll: 0.08,
      pitch: -0.04,
      ease: 'power2.inOut'
    }, 0)
    .to(atmosphere, {
      goldenHour: 0.20,
      waveIntensity: 1.15,
      ease: 'power1.out',
      onUpdate: () => {
        if (ocean) {
          ocean.setGoldenHour(atmosphere.goldenHour);
          ocean.setWaveIntensity(atmosphere.waveIntensity);
        }
        if (env) {
          env.setGoldenHour(atmosphere.goldenHour);
        }
      }
    }, 0);

    // ------------------------------------------------------------------------
    // STAGE 2: The Crew -> Section 3: Our Adventures (Expeditions)
    // High-angle majestic naval tracking shot; ship surges forward into open sea
    // ------------------------------------------------------------------------
    gsap.timeline({
      scrollTrigger: {
        trigger: '#adventures',
        start: 'top bottom',
        end: 'center center',
        scrub: 1.4
      }
    })
    .to(cam.scrollTargetPosition, {
      x: 3.8,
      y: 4.8,
      z: -3.5,
      ease: 'power2.inOut'
    }, 0)
    .to(cam.scrollTargetLookAt, {
      x: 1.2,
      y: -0.2,
      z: -2.0,
      ease: 'power2.inOut'
    }, 0)
    .to(cam, {
      scrollFovOffset: 3.0,
      ease: 'power2.inOut'
    }, 0)
    .to(ship.scrollOffset, {
      x: 2.2,
      z: -5.5,
      rotationY: 0.28,
      roll: -0.06,
      pitch: -0.06,
      ease: 'power2.inOut'
    }, 0)
    .to(atmosphere, {
      goldenHour: 0.50,
      waveIntensity: 1.25,
      ease: 'power1.out',
      onUpdate: () => {
        if (ocean) {
          ocean.setGoldenHour(atmosphere.goldenHour);
          ocean.setWaveIntensity(atmosphere.waveIntensity);
        }
        if (env) {
          env.setGoldenHour(atmosphere.goldenHour);
        }
      }
    }, 0);

    // ------------------------------------------------------------------------
    // STAGE 3: Adventures -> Section 4: Skills & Powers (Haki Matrix)
    // Low, dramatic hero prow angle close to Thousand Sunny Gaon Cannon
    // ------------------------------------------------------------------------
    gsap.timeline({
      scrollTrigger: {
        trigger: '#skills',
        start: 'top bottom',
        end: 'center center',
        scrub: 1.4
      }
    })
    .to(cam.scrollTargetPosition, {
      x: 4.6,
      y: -1.4,
      z: -10.2,
      ease: 'power2.inOut'
    }, 0)
    .to(cam.scrollTargetLookAt, {
      x: 0.8,
      y: 0.2,
      z: 2.2,
      ease: 'power2.inOut'
    }, 0)
    .to(cam, {
      scrollFovOffset: -2.0,
      ease: 'power2.inOut'
    }, 0)
    .to(ship.scrollOffset, {
      x: -0.4,
      z: -2.2,
      rotationY: -0.16,
      roll: 0.12,
      pitch: 0.08,
      ease: 'power2.inOut'
    }, 0)
    .to(atmosphere, {
      goldenHour: 0.80,
      waveIntensity: 1.35,
      ease: 'power1.out',
      onUpdate: () => {
        if (ocean) {
          ocean.setGoldenHour(atmosphere.goldenHour);
          ocean.setWaveIntensity(atmosphere.waveIntensity);
        }
        if (env) {
          env.setGoldenHour(atmosphere.goldenHour);
        }
      }
    }, 0);

    // ------------------------------------------------------------------------
    // STAGE 4: Skills -> Section 5: Join the Crew (Transponder Uplink)
    // Sunset horizon rear view past Coup de Burst thruster into the New World
    // ------------------------------------------------------------------------
    gsap.timeline({
      scrollTrigger: {
        trigger: '#contact',
        start: 'top bottom',
        end: 'center center',
        scrub: 1.4
      }
    })
    .to(cam.scrollTargetPosition, {
      x: 1.0,
      y: 0.3,
      z: -5.2,
      ease: 'power2.inOut'
    }, 0)
    .to(cam.scrollTargetLookAt, {
      x: -0.4,
      y: 0.0,
      z: -4.8,
      ease: 'power2.inOut'
    }, 0)
    .to(cam, {
      scrollFovOffset: 1.0,
      ease: 'power2.inOut'
    }, 0)
    .to(ship.scrollOffset, {
      x: 0.0,
      z: -6.4,
      rotationY: 0.02,
      roll: 0.02,
      pitch: 0.02,
      ease: 'power2.inOut'
    }, 0)
    .to(atmosphere, {
      goldenHour: 1.0,
      waveIntensity: 1.0,
      ease: 'power1.out',
      onUpdate: () => {
        if (ocean) {
          ocean.setGoldenHour(atmosphere.goldenHour);
          ocean.setWaveIntensity(atmosphere.waveIntensity);
        }
        if (env) {
          env.setGoldenHour(atmosphere.goldenHour);
        }
      }
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
