export class Navigation {
  constructor(lenis) {
    this.lenis = lenis;
    this.header = document.querySelector('.site-header');
    this.mobileToggle = document.querySelector('.mobile-nav-toggle');
    this.navMenu = document.querySelector('.nav-menu');
    this.navLinks = document.querySelectorAll('.nav-link, .scroll-prompt, .footer-nav a, .btn[href^="#"]');
    this.sections = document.querySelectorAll('section[id]');

    this.init();
  }

  init() {
    // Header scroll background change
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        this.header?.classList.add('scrolled');
      } else {
        this.header?.classList.remove('scrolled');
      }
      this.updateActiveNav();
    });

    // Mobile nav toggle
    this.mobileToggle?.addEventListener('click', () => {
      this.mobileToggle.classList.toggle('open');
      this.navMenu?.classList.toggle('open');
    });

    // Smooth scroll for all anchor links via Lenis
    this.navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          e.preventDefault();
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            // Close mobile menu if open
            this.mobileToggle?.classList.remove('open');
            this.navMenu?.classList.remove('open');

            if (this.lenis) {
              this.lenis.scrollTo(targetEl, { offset: -60, duration: 1.4 });
            } else {
              targetEl.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      });
    });
  }

  updateActiveNav() {
    const scrollPos = window.scrollY + 200;

    this.sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.nav-link').forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }
}
