export const CREW_MEMBERS = [
  {
    id: 'manish',
    name: 'Gundem Manish Reddy',
    japanese: 'チームリーダー',
    role: 'Team Leader & Supreme Captain',
    bounty: '3,000,000,000',
    category: 'command',
    icon: '👑',
    quote: 'Leading the fleet across uncharted digital horizons. Taking bold architectural risks to forge the future of software.',
    skills: [
      { label: 'Conqueror\'s Leadership', score: '100%' },
      { label: 'Strategic Enterprise Vision', score: '99%' },
      { label: 'Full-Stack Fleet Command', score: '98%' }
    ]
  },
  {
    id: 'srijan',
    name: 'Kommidi Sai Srijan Reddy',
    japanese: 'ファーストメイト',
    role: 'First Mate & Creative 3D Systems Architect',
    bounty: '1,500,000,000',
    category: 'creative',
    icon: '⚔️',
    quote: 'Wielding Three.js, custom GLSL shaders, and autonomous AI pipelines to build cinematic realities that elevate the web.',
    skills: [
      { label: 'Creative WebGL & Three.js', score: '99%' },
      { label: 'Advanced Observation Haki', score: '98%' },
      { label: 'Autonomous AI Integration', score: '97%' }
    ]
  },
  {
    id: 'nikhil',
    name: 'Gaddam Nikhil Reddy',
    japanese: 'コアエンジニア',
    role: 'Core Systems Engineer & Backend Helmsman',
    bounty: '1,200,000,000',
    category: 'tech',
    icon: '⚓',
    quote: 'Steering high-throughput distributed microservices and resilient cloud engines through the most turbulent production traffic.',
    skills: [
      { label: 'Armament Cloud Hardening', score: '98%' },
      { label: 'Distributed Concurrency', score: '97%' },
      { label: 'Zero-Downtime Resilience', score: '99%' }
    ]
  },
  {
    id: 'charan',
    name: 'Kondakindi Sai Charan Reddy',
    japanese: 'セキュリティ戦略家',
    role: 'Senior Security Architect & Tactical Strategist',
    bounty: '1,100,000,000',
    category: 'tech',
    icon: '🛡️',
    quote: 'Impenetrable cryptographic shielding and zero-trust fortifications protecting the Grand Fleet\'s digital sovereignty.',
    skills: [
      { label: 'Threat Modeling & Defense', score: '99%' },
      { label: 'Zero-Trust Cryptography', score: '98%' },
      { label: 'Tactical Risk Mitigation', score: '96%' }
    ]
  },
  {
    id: 'yashwanth',
    name: 'Yashwanth',
    japanese: 'ナビゲーター',
    role: 'Interactive Frontend Navigator & Performance Lead',
    bounty: '950,000,000',
    category: 'creative',
    icon: '🧭',
    quote: 'Navigating lightning-fast user interactions and frictionless micro-animations for peak client delight and engagement.',
    skills: [
      { label: 'Motion & GSAP Choreography', score: '98%' },
      { label: 'Performance Velocity Tuning', score: '97%' },
      { label: 'Modern Reactive Frameworks', score: '99%' }
    ]
  }
];

export class CrewSection {
  constructor() {
    this.container = document.getElementById('crew-grid');
    this.filterBtns = document.querySelectorAll('.crew-tab-btn');

    this.renderCrew('all');
    this.initFilters();
  }

  initFilters() {
    this.filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-category');
        this.renderCrew(category);
      });
    });
  }

  renderCrew(category = 'all') {
    if (!this.container) return;

    const filtered = category === 'all' 
      ? CREW_MEMBERS 
      : CREW_MEMBERS.filter((m) => m.category === category);

    this.container.innerHTML = filtered.map((m) => `
      <article class="crew-card" data-crew-id="${m.id}">
        <header class="crew-card-header">
          <div class="crew-avatar-frame">
            <span class="crew-avatar-symbol">${m.icon}</span>
          </div>
          <div class="crew-bounty-badge">
            <span class="bounty-label">BOUNTY</span>
            <span class="bounty-amount">฿ ${m.bounty}</span>
          </div>
        </header>

        <div class="crew-card-body">
          <h3 class="crew-name">${m.name}</h3>
          <p class="crew-role">${m.role}</p>
          <blockquote class="crew-quote">"${m.quote}"</blockquote>
        </div>

        <div class="crew-stats-list">
          ${m.skills.map((s) => `
            <div class="stat-item">
              <span class="stat-label">${s.label}</span>
              <div class="stat-bar-container">
                <div class="stat-bar" style="width: ${s.score}"></div>
              </div>
              <span class="stat-score">${s.score}</span>
            </div>
          `).join('')}
        </div>
      </article>
    `).join('');

    // Re-attach card tilt listener
    this.rebindCardEvents();
  }

  rebindCardEvents() {
    const cards = this.container.querySelectorAll('.crew-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }
}
