export const CREW_MEMBERS = [
  {
    id: 'luffy',
    name: 'Monkey D. Luffy',
    japanese: 'モンキー・D・ルフィ',
    role: 'Captain & Visionary Director',
    bounty: '3,000,000,000',
    category: 'command',
    icon: '👑',
    quote: 'If you don\'t take risks, you can\'t create a future. Let\'s build something extraordinary!',
    skills: [
      { label: 'Leadership Haki', score: '99%' },
      { label: 'Product Vision', score: '100%' },
      { label: 'Risk Tolerance', score: '99%' }
    ]
  },
  {
    id: 'zoro',
    name: 'Roronoa Zoro',
    japanese: 'ロロノア・ゾロ',
    role: 'Principal Systems Architect & Code Blade',
    bounty: '1,111,000,000',
    category: 'tech',
    icon: '⚔️',
    quote: 'Three-style compiler: zero latency, zero memory leaks, and cuts through any bug without blinking.',
    skills: [
      { label: 'C++ / Rust Concurrency', score: '98%' },
      { label: 'Architecture Slicing', score: '97%' },
      { label: 'Orientation in Code', score: '12%' }
    ]
  },
  {
    id: 'nami',
    name: 'Nami',
    japanese: 'ナミ',
    role: 'Head of Navigation & UI/UX Director',
    bounty: '366,000,000',
    category: 'command',
    icon: '🧭',
    quote: 'Design isn\'t just what it looks like. It is navigating the stormy Grand Line with elegance and precision.',
    skills: [
      { label: 'Interaction Design', score: '99%' },
      { label: 'Conversion Navigation', score: '96%' },
      { label: 'Budget Optimization', score: '100%' }
    ]
  },
  {
    id: 'usopp',
    name: 'Usopp',
    japanese: 'ウソップ',
    role: 'Lead Creative Developer & Storyteller',
    bounty: '500,000,000',
    category: 'creative',
    icon: '🎯',
    quote: 'Sniper of edge cases. When client deadlines strike from 10 miles away, I hit the deploy button flawlessly.',
    skills: [
      { label: 'GSAP Animation', score: '98%' },
      { label: 'Visual Storytelling', score: '99%' },
      { label: 'Courage Under Pressure', score: '88%' }
    ]
  },
  {
    id: 'sanji',
    name: 'Sanji',
    japanese: 'サンジ',
    role: 'Master Chef of Performance & DevOps',
    bounty: '1,032,000,000',
    category: 'tech',
    icon: '🔥',
    quote: 'Serving Michelin-grade server response times. No user will ever starve waiting for a webpage to load.',
    skills: [
      { label: 'Kubernetes & CI/CD', score: '96%' },
      { label: 'Flame Cache Warming', score: '99%' },
      { label: 'Gentleman UI Polish', score: '95%' }
    ]
  },
  {
    id: 'chopper',
    name: 'Tony Tony Chopper',
    japanese: 'トニートニー・チョッパー',
    role: 'Chief Site Health, Diagnostics & QA',
    bounty: '1,000',
    category: 'tech',
    icon: '🌸',
    quote: 'There isn\'t any bug or performance illness in the world that cannot be cured with proper test coverage!',
    skills: [
      { label: 'Vitest & E2E Healing', score: '97%' },
      { label: 'Telemetry Monitoring', score: '95%' },
      { label: 'Cutest Bug Hunter', score: '100%' }
    ]
  },
  {
    id: 'robin',
    name: 'Nico Robin',
    japanese: 'ニコ・ロビン',
    role: 'Chief Archaeologist & AI / Data Architect',
    bounty: '930,000,000',
    category: 'tech',
    icon: '📚',
    quote: 'Deciphering the ancient Rio Poneglyphs of legacy enterprise databases and building autonomous AI pipelines.',
    skills: [
      { label: 'LLM & Vector DBs', score: '98%' },
      { label: 'Deep Data Forensics', score: '99%' },
      { label: 'Clutch Security', score: '94%' }
    ]
  },
  {
    id: 'franky',
    name: 'Franky',
    japanese: 'フランキー',
    role: 'Chief WebGL & Creative Hardware Engineer',
    bounty: '394,000,000',
    category: 'creative',
    icon: '⭐',
    quote: 'SUUUUU-PERRR! Building custom GLSL wave shaders and futuristic 3D WebGL experiences powered by pure cola!',
    skills: [
      { label: 'Three.js & WebGPU', score: '99%' },
      { label: 'Custom GLSL Shaders', score: '99%' },
      { label: 'Super Loud Innovation', score: '100%' }
    ]
  },
  {
    id: 'brook',
    name: 'Brook',
    japanese: 'ブルック',
    role: 'Audio & Sensory Immersion Director',
    bounty: '383,000,000',
    category: 'creative',
    icon: '🎻',
    quote: 'Yo-ho-ho-ho! A website without spatial sound and soulful micro-interactions is like a skeleton without a heart!',
    skills: [
      { label: 'Web Audio API', score: '98%' },
      { label: 'Spatial Sound Design', score: '96%' },
      { label: 'Skeleton Humor', score: '100%' }
    ]
  },
  {
    id: 'jinbe',
    name: 'Jinbe',
    japanese: 'ジンベエ',
    role: 'Chief Security Officer & Cloud Helmsman',
    bounty: '1,100,000,000',
    category: 'command',
    icon: '🌊',
    quote: 'Steering the ship through catastrophic DDoS whirlpools. Water-Stream defense against zero-day exploits.',
    skills: [
      { label: 'Zero-Trust Security', score: '99%' },
      { label: 'Cloud Helmsmanship', score: '97%' },
      { label: 'Unshakable Loyalty', score: '100%' }
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
