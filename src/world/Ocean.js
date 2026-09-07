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
    // High-resolution plane for Gerstner wave displacement
    this.geometry = new THREE.PlaneGeometry(160, 160, 160, 160);
    this.geometry.rotateX(-Math.PI / 2);
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        uniform vec2 uWaveA; // amplitude, wavelength
        uniform vec2 uWaveB;
        uniform vec2 uWaveC;
        
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying float vWaveHeight;

        // Gerstner Wave Formula
        vec3 gerstnerWave(vec4 wave, vec3 p, inout vec3 tangent, inout vec3 binormal) {
          float steepness = wave.z;
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

          return vec3(
            d.x * (a * cos(f)),
            a * sin(f),
            d.y * (a * cos(f))
          );
        }

        void main() {
          vec3 p = position;
          vec3 tangent = vec3(1.0, 0.0, 0.0);
          vec3 binormal = vec3(0.0, 0.0, 1.0);

          // 3 combined directional waves
          vec4 w1 = vec4(1.0, 0.4, 0.28, 18.0);
          vec4 w2 = vec4(0.5, 0.8, 0.20, 10.0);
          vec4 w3 = vec4(-0.4, 0.7, 0.15, 6.0);

          vec3 pFinal = p;
          pFinal += gerstnerWave(w1, p, tangent, binormal);
          pFinal += gerstnerWave(w2, p, tangent, binormal);
          pFinal += gerstnerWave(w3, p, tangent, binormal);

          vec3 calculatedNormal = normalize(cross(binormal, tangent));
          vNormal = calculatedNormal;
          vWaveHeight = pFinal.y;

          vec4 worldPos = modelMatrix * vec4(pFinal, 1.0);
          vWorldPosition = worldPos.xyz;

          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uDepthColor;
        uniform vec3 uSurfaceColor;
        uniform vec3 uFoamColor;
        uniform vec3 uMoonDirection;
        uniform vec3 uMoonColor;
        uniform vec3 uFogColor;
        uniform float uFogDensity;

        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying float vWaveHeight;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);

          // Fresnel Effect
          float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 4.0);

          // Water Depth Gradient
          float depthFactor = smoothstep(-1.2, 1.8, vWaveHeight);
          vec3 waterColor = mix(uDepthColor, uSurfaceColor, depthFactor);

          // Specular Moonlight Reflection
          vec3 lightDir = normalize(uMoonDirection);
          vec3 halfVector = normalize(lightDir + viewDir);
          float specular = pow(max(dot(normal, halfVector), 0.0), 64.0) * 1.5;

          // Bioluminescent Foam Crests on high wave peaks
          float foamFactor = smoothstep(0.7, 1.4, vWaveHeight);
          waterColor = mix(waterColor, uFoamColor, foamFactor * 0.75);

          // Combine with Moonlight & Fresnel Sky Reflection
          vec3 finalColor = waterColor + specular * uMoonColor * 1.2 + fresnel * vec3(0.08, 0.22, 0.45);

          // Atmospheric Exponential Height / Distance Fog
          float dist = length(cameraPosition - vWorldPosition);
          float fogFactor = 1.0 - exp(-dist * dist * 0.000085);
          finalColor = mix(finalColor, uFogColor, clamp(fogFactor, 0.0, 1.0));

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uDepthColor: { value: new THREE.Color('#030814') },
        uSurfaceColor: { value: new THREE.Color('#0a203d') },
        uFoamColor: { value: new THREE.Color('#38bdf8') },
        uMoonDirection: { value: new THREE.Vector3(10, 25, -20) },
        uMoonColor: { value: new THREE.Color('#e0f2fe') },
        uFogColor: { value: new THREE.Color('#04070e') },
        uFogDensity: { value: 0.012 }
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

  // Exact math to compute wave height at any (x, z) coordinate for ship buoyancy
  getWaveHeight(x, z, time) {
    const w1_dir = new THREE.Vector2(1.0, 0.4).normalize();
    const w1_k = (2.0 * Math.PI) / 18.0;
    const w1_c = Math.sqrt(9.8 / w1_k);
    const w1_f = w1_k * (w1_dir.x * x + w1_dir.y * z - w1_c * time * 0.45);
    const w1_a = 0.28 / w1_k;

    const w2_dir = new THREE.Vector2(0.5, 0.8).normalize();
    const w2_k = (2.0 * Math.PI) / 10.0;
    const w2_c = Math.sqrt(9.8 / w2_k);
    const w2_f = w2_k * (w2_dir.x * x + w2_dir.y * z - w2_c * time * 0.45);
    const w2_a = 0.20 / w2_k;

    return w1_a * Math.sin(w1_f) + w2_a * Math.sin(w2_f);
  }

  update(delta) {
    this.time += delta;
    this.material.uniforms.uTime.value = this.time;
  }
}
