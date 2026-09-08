import * as THREE from 'three';

export class Ocean {
  constructor(experience) {
    this.experience = experience;
    this.scene = experience.scene;
    this.time = 0;

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(180, 180, 180, 180);
    this.geometry.rotateX(-Math.PI / 2);
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        uniform float uWaveIntensity;
        
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying float vWaveHeight;
        varying float vSteepnessSum;
        varying vec2 vUv;

        // 4-Wave Gerstner Wave Formula
        vec3 gerstnerWave(vec4 wave, vec3 p, inout vec3 tangent, inout vec3 binormal, inout float steepnessAcc) {
          float steepness = wave.z * uWaveIntensity;
          float wavelength = wave.w;
          float k = 2.0 * 3.14159265 / wavelength;
          float c = sqrt(9.8 / k);
          vec2 d = normalize(wave.xy);
          float f = k * (dot(d, p.xz) - c * uTime * 0.45);
          float a = steepness / k;

          tangent += vec3(
            -d.x * d.x * (steepness * sin(f)),
            d.x * (steepness * cos(f)),
            -d.x * d.y * (steepness * sin(f))
          );
          binormal += vec3(
            -d.x * d.y * (steepness * sin(f)),
            d.y * (steepness * cos(f)),
            -d.y * d.y * (steepness * sin(f))
          );

          steepnessAcc += (sin(f) * 0.5 + 0.5) * steepness;

          return vec3(
            d.x * (a * cos(f)),
            a * sin(f),
            d.y * (a * cos(f))
          );
        }

        void main() {
          vUv = uv;
          vec3 p = position;
          vec3 tangent = vec3(1.0, 0.0, 0.0);
          vec3 binormal = vec3(0.0, 0.0, 1.0);
          float steepnessAcc = 0.0;

          // 4 realistic oceanic swell waves
          vec4 w1 = vec4(1.0, 0.35, 0.26, 24.0);
          vec4 w2 = vec4(0.4, 0.9,  0.20, 14.0);
          vec4 w3 = vec4(-0.5, 0.6, 0.14, 8.0);
          vec4 w4 = vec4(-0.8, -0.3, 0.08, 4.5);

          vec3 pFinal = p;
          pFinal += gerstnerWave(w1, p, tangent, binormal, steepnessAcc);
          pFinal += gerstnerWave(w2, p, tangent, binormal, steepnessAcc);
          pFinal += gerstnerWave(w3, p, tangent, binormal, steepnessAcc);
          pFinal += gerstnerWave(w4, p, tangent, binormal, steepnessAcc);

          vec3 calculatedNormal = normalize(cross(binormal, tangent));
          vNormal = calculatedNormal;
          vWaveHeight = pFinal.y;
          vSteepnessSum = steepnessAcc;

          vec4 worldPos = modelMatrix * vec4(pFinal, 1.0);
          vWorldPosition = worldPos.xyz;

          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uGoldenHour;
        uniform vec3 uDepthColor;
        uniform vec3 uMidColor;
        uniform vec3 uSurfaceColor;
        uniform vec3 uFoamColor;
        uniform vec3 uSubsurfaceColor;
        uniform vec3 uSunDirection;
        uniform vec3 uSunColor;
        uniform vec3 uFogColor;

        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying float vWaveHeight;
        varying float vSteepnessSum;
        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
            u.y
          );
        }

        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 3; i++) {
            v += a * noise(p);
            p *= 2.1;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          vec3 lightDir = normalize(uSunDirection);

          // Micro-ripples perturbing surface normal
          vec2 rippleCoord = vWorldPosition.xz * 0.5 + vec2(uTime * 0.08, uTime * 0.05);
          float n1 = fbm(rippleCoord);
          float n2 = fbm(rippleCoord * 2.2 - vec2(uTime * 0.06));
          vec3 perturbedNormal = normalize(vNormal + vec3((n1 - 0.5) * 0.12, 0.0, (n2 - 0.5) * 0.12));

          // Physical Schlick Fresnel (damped so water depth stays visible)
          float nDotV = max(dot(viewDir, perturbedNormal), 0.0);
          float f0 = 0.024;
          float fresnel = f0 + (1.0 - f0) * pow(1.0 - nDotV, 5.0);

          // Dynamic Golden Hour Color Grading
          vec3 depthCol = mix(uDepthColor, vec3(0.06, 0.18, 0.38), uGoldenHour);
          vec3 midCol = mix(uMidColor, vec3(0.10, 0.38, 0.58), uGoldenHour);
          vec3 surfaceCol = mix(uSurfaceColor, vec3(0.92, 0.65, 0.22), uGoldenHour * 0.65);
          vec3 sssBaseCol = mix(uSubsurfaceColor, vec3(0.96, 0.78, 0.32), uGoldenHour * 0.75);
          vec3 sunCol = mix(uSunColor, vec3(1.0, 0.88, 0.62), uGoldenHour);

          // Tropical Depth Grading (Deep Cerulean -> Clear Azure -> Sunlit Turquoise/Amber)
          vec3 waterBody = mix(depthCol, midCol, smoothstep(-1.8, 0.3, vWaveHeight));
          waterBody = mix(waterBody, surfaceCol, smoothstep(0.1, 1.6, vWaveHeight));

          // Subsurface Scattering (SSS) through wave crests facing sunlight
          float sssFactor = max(0.0, dot(viewDir, -lightDir)) * smoothstep(0.4, 1.6, vWaveHeight);
          vec3 sssColor = sssBaseCol * (sssFactor * 0.75);

          // Brilliant Sun Specular Highlight
          vec3 halfVector = normalize(lightDir + viewDir);
          float nDotH = max(dot(perturbedNormal, halfVector), 0.0);
          float sunSpecularSharp = pow(nDotH, 160.0) * (2.8 + uGoldenHour * 1.2);
          float sunSpecularBroad = pow(nDotH, 20.0) * (0.35 + uGoldenHour * 0.25);
          vec3 specularHighlight = (sunSpecularSharp + sunSpecularBroad) * sunCol;

          // Sky Reflection (Bright tropical blue sky -> warm sunset gold)
          vec3 skyDay = mix(vec3(0.28, 0.58, 0.88), vec3(0.55, 0.78, 0.95), pow(1.0 - nDotV, 2.0));
          vec3 skySunset = mix(vec3(0.92, 0.62, 0.38), vec3(0.98, 0.88, 0.72), pow(1.0 - nDotV, 2.0));
          vec3 skyReflection = mix(skyDay, skySunset, uGoldenHour);

          // Composite Base Ocean (Controlled fresnel prevents white wash-out)
          vec3 baseColor = mix(waterBody + sssColor, skyReflection, fresnel * 0.42) + specularHighlight;

          // Crisp White Organic Seafoam strictly on the highest wave crests
          float crestMask = smoothstep(1.15, 1.75, vWaveHeight + vSteepnessSum * 0.25);
          float foamNoise = fbm(vWorldPosition.xz * 3.8 + vec2(uTime * 0.16));
          float foamPattern = smoothstep(0.52, 0.78, foamNoise) * crestMask;

          vec3 colorWithFoam = mix(baseColor, uFoamColor, foamPattern * 0.75);

          // Daylight -> Golden Sunset Atmospheric Sea Mist
          float dist = length(cameraPosition - vWorldPosition);
          float distanceFog = 1.0 - exp(-dist * dist * 0.000028);
          float heightFog = exp(-max(0.0, vWorldPosition.y) * 0.25) * 0.05;
          float totalFog = clamp(distanceFog + heightFog, 0.0, 0.70);

          vec3 fogCol = mix(uFogColor, vec3(0.98, 0.92, 0.80), uGoldenHour);
          vec3 finalColor = mix(colorWithFoam, fogCol, totalFog);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uWaveIntensity: { value: 1.0 },
        uGoldenHour: { value: 0.0 },
        uDepthColor: { value: new THREE.Color('#023e8a') },       // Deep rich sapphire
        uMidColor: { value: new THREE.Color('#0077b6') },         // Vibrant ocean azure
        uSurfaceColor: { value: new THREE.Color('#00b4d8') },     // Clear sunlit turquoise
        uSubsurfaceColor: { value: new THREE.Color('#2ec4b6') },  // Emerald green SSS
        uFoamColor: { value: new THREE.Color('#ffffff') },        // Crisp white foam
        uSunDirection: { value: new THREE.Vector3(25, 55, -25) },
        uSunColor: { value: new THREE.Color('#fffbeb') },
        uFogColor: { value: new THREE.Color('#e0f2fe') }          // Soft azure mist
      },
      wireframe: false,
      transparent: false
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.y = 0;
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);
  }

  setGoldenHour(factor) {
    if (this.material?.uniforms?.uGoldenHour) {
      this.material.uniforms.uGoldenHour.value = factor;
    }
  }

  setWaveIntensity(factor) {
    if (this.material?.uniforms?.uWaveIntensity) {
      this.material.uniforms.uWaveIntensity.value = factor;
    }
  }

  getWaveHeight(x, z, time) {
    const intensity = this.material?.uniforms?.uWaveIntensity?.value || 1.0;
    const w1_dir = new THREE.Vector2(1.0, 0.35).normalize();
    const w1_k = (2.0 * Math.PI) / 24.0;
    const w1_c = Math.sqrt(9.8 / w1_k);
    const w1_f = w1_k * (w1_dir.x * x + w1_dir.y * z - w1_c * time * 0.45);
    const w1_a = (0.26 * intensity) / w1_k;

    const w2_dir = new THREE.Vector2(0.4, 0.9).normalize();
    const w2_k = (2.0 * Math.PI) / 14.0;
    const w2_c = Math.sqrt(9.8 / w2_k);
    const w2_f = w2_k * (w2_dir.x * x + w2_dir.y * z - w2_c * time * 0.45);
    const w2_a = (0.20 * intensity) / w2_k;

    const w3_dir = new THREE.Vector2(-0.5, 0.6).normalize();
    const w3_k = (2.0 * Math.PI) / 8.0;
    const w3_c = Math.sqrt(9.8 / w3_k);
    const w3_f = w3_k * (w3_dir.x * x + w3_dir.y * z - w3_c * time * 0.45);
    const w3_a = (0.14 * intensity) / w3_k;

    return w1_a * Math.sin(w1_f) + w2_a * Math.sin(w2_f) + w3_a * Math.sin(w3_f);
  }

  update(delta) {
    this.time += delta;
    this.material.uniforms.uTime.value = this.time;
  }
}
