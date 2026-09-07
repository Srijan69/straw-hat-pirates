# ⚓ Straw Hat Pirates — 3D Creative Portfolio

> **Awwwards-tier immersive 3D web experience celebrating the legendary Straw Hat Grand Fleet.**  
> Built with Three.js, GSAP ScrollTrigger, Lenis Smooth Scroll, and pure modern Vanilla JavaScript.

![Straw Hat Pirates Portfolio](public/audio/README_BANNER.png) <!-- (optional placeholder) -->

---

## 🌟 Overview

An ultra-modern, cinematic, and interactive 3D web portfolio inspired by *One Piece* and the world's most cutting-edge creative web showcases (like *Overworld Audio*, *United Carriers*, and *Zero University*).

Explore the Grand Line with dynamic procedural 3D environments, custom water shaders, volumetric atmospheric lighting, interactive crew dossier cards, an interactive adventure log modal, and a Dennis-level interactive Den Den Mushi recruitment station.

---

## ✨ Features

- 🚢 **3D Hero Ocean & Thousand Sunny:** Procedural ship model with rotating helm, swaying sails, solar-lion figurehead, and realistic multi-octave Gerstner-style ocean water shaders with cresting foam and depth scattering.
- 🌌 **Atmospheric Post-Processing & Particle FX:** Golden ambient particles, bioluminescent embers, and volumetric fog that react dynamically to cursor movement.
- 📜 **Interactive Crew Showcase:** Interactive 3D tilt cards for Luffy, Zoro, Nami, Sanji, Chopper, and Robin with bounty metrics, Devil Fruit / Haki indicators, and custom voice audio synthesizers.
- 🗺️ **Grand Line Expeditions & Mission Logs:** Interactive timeline showcasing legendary arcs (Enies Lobby, Marineford, Wano Kuni, Egghead) with modal dossiers and deep-dive lore.
- ⚡ **Powers & Haki Radar Station:** Live interactive SVG radar chart comparing Conqueror's Haki, Armament Haki, Observation, Tactical IQ, Agility, and Destructive Power with interactive crew selector.
- 🐌 **Transponder Snail (Den Den Mushi) Recruitment:** Complete functional recruitment terminal with Web Audio API sound generator (*Purupurupuru... Gacha!*), real-time validation, and toast notification dispatch.
- 🌊 **Cinematic Audio & Soundscapes:** Ocean wind & waves ambient generator with spatial volume control.
- 📱 **Fluid Responsiveness & Accessibility:** 60FPS fluid physics via Lenis smooth scrolling and full mobile touch compatibility.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Vite** | Blazing-fast Next-Gen frontend tooling & bundler |
| **Three.js** | 3D WebGL scenes, procedural geometry, lighting & custom GLSL shaders |
| **GSAP + ScrollTrigger** | High-performance cinematic scroll choreographies & timeline animations |
| **Lenis** | Smooth momentum-based inertial scrolling |
| **Web Audio API** | Real-time procedural audio synthesis for Den Den Mushi and ocean ambience |
| **Vanilla JavaScript (ES Modules)** | Pure, zero-overhead modular architecture |

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Srijan69/straw-hat-pirates.git
cd straw-hat-pirates
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Visit `http://localhost:3000` in your browser.

### 4. Build for production
```bash
npm run build
```
Production build assets will be generated in `dist/`.

---

## 📂 Project Structure

```text
straw-hat-pirates/
├── index.html            # Main HTML layout & semantic sections
├── package.json          # Project metadata & dependencies
├── vite.config.js        # Vite build configuration
├── src/
│   ├── main.js           # App bootstrapper, Lenis, UI events, Audio
│   ├── style.css         # Modern design tokens, glassmorphism, responsive styles
│   └── scene.js          # Three.js scene, procedural Thousand Sunny, ocean shaders & GSAP scroll camera
└── public/               # Static assets & icons
```

---

## 🏴‍☠️ License

Created with ❤️ by [Srijan69](https://github.com/Srijan69). Inspired by Eiichiro Oda's masterpiece *One Piece*.
