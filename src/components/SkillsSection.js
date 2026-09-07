export const SKILLS_DATA = [
  {
    category: 'Conqueror\'s Haki (覇王色)',
    sub: 'Distributed Systems & Architectural Mastery',
    icon: '⚡',
    theme: 'gold',
    items: [
      { name: 'Distributed Microservices & Kubernetes', level: 98 },
      { name: 'High-Concurrency Event Streaming (Kafka/Flink)', level: 96 },
      { name: 'Zero-Downtime Multi-Region Disaster Recovery', level: 99 },
      { name: 'Edge CDN Optimization & Sub-50ms Global P99', level: 97 }
    ]
  },
  {
    category: 'Armament Haki (武装色)',
    sub: 'Hardened Security & Rock-Solid Systems',
    icon: '🛡️',
    theme: 'crimson',
    items: [
      { name: 'Zero-Trust Enclaves & Cryptographic Handshakes', level: 99 },
      { name: 'Strict Rust / C++ Memory Safety & Kernel Probes', level: 97 },
      { name: 'Automated Penetration & Vulnerability Fuzzing', level: 95 },
      { name: 'DDoS Buster Call Mitigation & Resilient Firewalls', level: 98 }
    ]
  },
  {
    category: 'Observation Haki (見聞色)',
    sub: 'Predictive Intelligence & Observability',
    icon: '👁️',
    theme: 'cyan',
    items: [
      { name: 'Autonomous Agent Pipelines & Vector Retrieval', level: 98 },
      { name: 'Real-Time Telemetry & Predictive Anomaly Detection', level: 95 },
      { name: 'Deep User Intent Modeling & Adaptive UX', level: 94 },
      { name: 'High-Frequency Financial & Log Analytics', level: 96 }
    ]
  },
  {
    category: 'Devil Fruit Awakenings (悪魔の実)',
    sub: 'Immersive 3D & Sensory Web Realism',
    icon: '🌀',
    theme: 'gold',
    items: [
      { name: 'Procedural GLSL Shaders & Gerstner Wave Physics', level: 99 },
      { name: 'Three.js / WebGL / WebGPU 60fps Optimization', level: 99 },
      { name: 'GSAP Inertia & Cinematic Timeline Choreography', level: 98 },
      { name: 'Procedural Web Audio API & Spatial Synthesizers', level: 95 }
    ]
  }
];

export class SkillsSection {
  constructor() {
    this.container = document.getElementById('skills-matrix');
    this.render();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = SKILLS_DATA.map((s) => `
      <div class="skill-discipline-card">
        <header class="skill-card-head ${s.theme}">
          <div class="skill-icon-wrap">
            <span>${s.icon}</span>
          </div>
          <div class="skill-title-block">
            <h3>${s.category}</h3>
            <p>${s.sub}</p>
          </div>
        </header>

        <div class="skill-items-list">
          ${s.items.map((item) => `
            <div class="skill-gauge">
              <div class="skill-gauge-info">
                <span class="skill-gauge-name">${item.name}</span>
                <span class="skill-gauge-percent">${item.level}%</span>
              </div>
              <div class="skill-track">
                <div class="skill-fill" style="width: ${item.level}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }
}
