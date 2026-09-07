export const PROJECTS = [
  {
    id: 'egghead-os',
    title: 'Egghead Future OS',
    category: 'ai',
    categoryLabel: 'Autonomous AI',
    metric: '500k+ TPS',
    description: 'A 500-years-into-the-future neural interface platform featuring multi-modal cognitive agents, holographic visualizer, and distributed vector retrieval.',
    details: 'Commissioned by Dr. Vegapunk research syndicate, Egghead OS leverages custom WebGL compute nodes and WebAudio spatialization to render high-density real-time satellite telemetry with sub-millisecond query latencies.',
    stack: ['WebGL / Three.js', 'PyTorch / ONNX', 'Rust WebAssembly', 'Distributed Vector DB', 'WebSockets'],
    client: 'Vegapunk Satellite Labs',
    year: '2026',
    artColor: 'linear-gradient(135deg, #0ea5e9, #0284c7)'
  },
  {
    id: 'wano-cloud',
    title: 'Wano Distributed Cloud',
    category: 'architecture',
    categoryLabel: 'Cloud Platform',
    metric: '99.999% SLA',
    description: 'Decentralized multi-region cloud infrastructure designed to liberate isolated software ecosystems through resilient peer-to-peer relay clusters.',
    details: 'Architected to withstand extreme network partition events and state-sponsored censorship. Features automated failover across five Grand Line geographical nodes with zero downtime.',
    stack: ['Kubernetes', 'Go / eBPF', 'Terraform', 'Kafka Mesh', 'Envoy Gateway'],
    client: 'Kozuki Restoration Tech Council',
    year: '2025',
    artColor: 'linear-gradient(135deg, #f59e0b, #b45309)'
  },
  {
    id: 'enies-lobby-sec',
    title: 'Enies Lobby Zero-Day Defense',
    category: 'security',
    categoryLabel: 'Offensive Security',
    metric: '100% Exploit Neutralized',
    description: 'Next-generation automated threat emulation and red-teaming platform designed to penetrate and harden impenetrable government-grade fortresses.',
    details: 'Developed to stress-test critical cloud infrastructure against advanced persistent threats (Buster Call class volumetric assaults). Includes automated kernel vulnerability discovery and instant patch synthesis.',
    stack: ['Rust', 'eBPF Kernel Probes', 'Zero-Trust Architecture', 'Cryptographic Enclaves', 'Python ML'],
    client: 'Secret Cipher Intelligence',
    year: '2025',
    artColor: 'linear-gradient(135deg, #ef4444, #991b1b)'
  },
  {
    id: 'skypiea-webgl',
    title: 'Skypiea Spatial Web',
    category: 'webgl',
    categoryLabel: 'Immersive 3D',
    metric: '60 FPS / 4K Shaders',
    description: 'A high-altitude spatial 3D experience delivering cloud-island navigation, volumetric lighting, and interactive sound design awarded Site of the Year.',
    details: 'Built entirely on vanilla Three.js and custom GLSL cloud scattering shaders. Implements dynamic level-of-detail (LOD) and frustum culling to sustain silky 60 FPS on mobile and desktop alike.',
    stack: ['Three.js', 'Custom GLSL Shaders', 'GSAP Motion', 'Web Audio API', 'Vite'],
    client: 'Birkian Spatial Initiative',
    year: '2026',
    artColor: 'linear-gradient(135deg, #38bdf8, #818cf8)'
  },
  {
    id: 'fishman-deepdata',
    title: 'Fish-Man Island Deep Pipeline',
    category: 'architecture',
    categoryLabel: 'High-Throughput Streaming',
    metric: '4.2 TB/s Ingestion',
    description: 'Sub-sea deep sea data pipeline engineered 10,000 meters underwater to process hyper-dense marine telemetry streams with zero packet degradation.',
    details: 'Designed with custom memory-mapped ring buffers and kernel-bypass networking to deliver reliable telemetry during intense seismic ocean events and volcanic seafloor eruptions.',
    stack: ['C++20', 'DPDK', 'ClickHouse', 'Apache Flink', 'Grafana Enterprise'],
    client: 'Neptune Marine Consortium',
    year: '2025',
    artColor: 'linear-gradient(135deg, #065f46, #047857)'
  }
];

export class ProjectsSection {
  constructor() {
    this.grid = document.getElementById('projects-grid');
    this.filterBtns = document.querySelectorAll('.filter-btn');
    this.modal = document.getElementById('project-modal');
    this.modalCard = document.querySelector('.project-modal-card');
    this.modalCloseBtn = document.querySelector('.modal-close-btn');

    this.renderProjects('all');
    this.initFilters();
    this.initModal();
  }

  initFilters() {
    this.filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const cat = btn.getAttribute('data-filter');
        this.renderProjects(cat);
      });
    });
  }

  renderProjects(category = 'all') {
    if (!this.grid) return;

    const filtered = category === 'all'
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === category);

    this.grid.innerHTML = filtered.map((p) => `
      <article class="project-card" data-project-id="${p.id}">
        <div class="project-thumbnail-wrapper">
          <div class="project-visual" style="background: ${p.artColor}">
            <div style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; color: rgba(255,255,255,0.22); letter-spacing: 0.1em; text-transform: uppercase;">
              ${p.title.split(' ')[0]}
            </div>
          </div>
          <span class="badge badge-cyan project-category-badge">${p.categoryLabel}</span>
          <span class="badge project-metrics-badge">${p.metric}</span>
        </div>

        <div class="project-content">
          <h3 class="project-title">${p.title}</h3>
          <p class="project-description">${p.description}</p>
          <div class="project-tags">
            ${p.stack.slice(0, 3).map((t) => `<span class="tech-tag">${t}</span>`).join('')}
          </div>
        </div>

        <footer class="project-card-footer">
          <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">${p.year} / ${p.client}</span>
          <button type="button" class="project-link-btn view-case-study-btn" data-id="${p.id}">
            EXPLORE EXPEDITION <span>→</span>
          </button>
        </footer>
      </article>
    `).join('');

    this.bindProjectCardClicks();
  }

  bindProjectCardClicks() {
    this.grid.querySelectorAll('.view-case-study-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        const proj = PROJECTS.find((p) => p.id === id);
        if (proj) this.openModal(proj);
      });
    });
  }

  initModal() {
    if (!this.modal) return;

    this.modalCloseBtn?.addEventListener('click', () => this.closeModal());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }

  openModal(project) {
    const titleEl = document.getElementById('modal-project-title');
    const badgeEl = document.getElementById('modal-project-category');
    const metricEl = document.getElementById('modal-project-metric');
    const descEl = document.getElementById('modal-project-description');
    const detailsEl = document.getElementById('modal-project-details');
    const stackEl = document.getElementById('modal-project-stack');
    const metaEl = document.getElementById('modal-project-meta');

    if (titleEl) titleEl.textContent = project.title;
    if (badgeEl) badgeEl.textContent = project.categoryLabel;
    if (metricEl) metricEl.textContent = project.metric;
    if (descEl) descEl.textContent = project.description;
    if (detailsEl) detailsEl.textContent = project.details;
    if (metaEl) metaEl.textContent = `Client: ${project.client} | Epoch: ${project.year}`;

    if (stackEl) {
      stackEl.innerHTML = project.stack.map((s) => `<span class="badge badge-cyan">${s}</span>`).join('');
    }

    this.modal?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.modal?.classList.remove('open');
    document.body.style.overflow = '';
  }
}
