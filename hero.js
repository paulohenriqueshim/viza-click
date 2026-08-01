import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// Text/intro animation must run no matter what happens with the 3D scene below.
setupHeroText();

const canvas = document.getElementById('hero-canvas');
const container = document.querySelector('.hero3d-inner');
const heroSection = document.querySelector('.hero3d');

const isMobile = window.innerWidth < 760;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let W = container.clientWidth, H = container.clientHeight;
let renderer, scene, camera, composer;
const stars = [];
const mountains = [];
let nebula;
let running = true;
let rafId = null;
let targetCam = { x: 0, y: 22, z: 140 };
let curCam = { x: 0, y: 22, z: 140 };

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
}

if (!supportsWebGL()) {
  heroSection.classList.add('no-webgl');
} else {
  try {
    init();
  } catch (err) {
    console.error('Hero 3D scene failed to initialize:', err);
    heroSection.classList.add('no-webgl');
  }
}

function init() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03040a, 0.00035);

  camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 3000);
  camera.position.set(0, 22, 140);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.55;

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  if (!isMobile) {
    const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.75, 0.4, 0.86);
    composer.addPass(bloom);
  }

  createStars();
  createNebula();
  createMountains();

  window.addEventListener('resize', onResize, { passive: true });

  animate();
  setupScroll();
  setupIO();
}

function createStars() {
  const layers = isMobile ? 1 : 2;
  const count = isMobile ? 1400 : 2600;

  for (let l = 0; l < layers; l++) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 200 + Math.random() * 900;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const c = new THREE.Color();
      const pick = Math.random();
      if (pick < 0.78) c.setHSL(0.6, 0.35, 0.85);
      else c.setHSL(0.58, 0.7, 0.65);

      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
      sizes[i] = Math.random() * 1.8 + 0.4;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, depth: { value: l } },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        uniform float depth;
        void main() {
          vColor = color;
          vec3 pos = position;
          float angle = time * 0.025 * (1.0 - depth * 0.3);
          mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
          pos.xy = rot * pos.xy;
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (280.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float o = 1.0 - smoothstep(0.0, 0.5, d);
          gl_FragColor = vec4(vColor, o);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    stars.push(points);
  }
}

function createNebula() {
  const geometry = new THREE.PlaneGeometry(6000, 3000, isMobile ? 20 : 60, isMobile ? 20 : 60);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color1: { value: new THREE.Color(0x1b63d9) },
      color2: { value: new THREE.Color(0x3d80f5) },
      opacity: { value: 0.22 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying float vElevation;
      uniform float time;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float e = sin(pos.x * 0.01 + time) * cos(pos.y * 0.01 + time) * 18.0;
        pos.z += e;
        vElevation = e;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1; uniform vec3 color2; uniform float opacity; uniform float time;
      varying vec2 vUv; varying float vElevation;
      void main() {
        float mixFactor = sin(vUv.x * 8.0 + time) * cos(vUv.y * 8.0 + time);
        vec3 color = mix(color1, color2, mixFactor * 0.5 + 0.5);
        float alpha = opacity * (1.0 - length(vUv - 0.5) * 2.0);
        alpha *= 1.0 + vElevation * 0.01;
        gl_FragColor = vec4(color, max(alpha, 0.0));
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  nebula = new THREE.Mesh(geometry, material);
  nebula.position.z = -900;
  scene.add(nebula);
}

function createMountains() {
  const layers = [
    { z: -40, height: 46, color: 0x0a1220, opacity: 1 },
    { z: -90, height: 62, color: 0x0d1a30, opacity: 0.85 },
    { z: -150, height: 80, color: 0x11213e, opacity: 0.6 },
    { z: -210, height: 96, color: 0x14315e, opacity: 0.38 }
  ];

  layers.forEach((layer, idx) => {
    const points = [];
    const segments = 48;
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments - 0.5) * 900;
      const y = Math.sin(i * 0.11 + idx) * layer.height +
                Math.sin(i * 0.05 + idx * 2) * layer.height * 0.5 - 90;
      points.push(new THREE.Vector2(x, y));
    }
    points.push(new THREE.Vector2(4500, -300));
    points.push(new THREE.Vector2(-4500, -300));

    const shape = new THREE.Shape(points);
    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({
      color: layer.color, transparent: true, opacity: layer.opacity, side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = layer.z;
    mesh.position.y = 40;
    mesh.userData = { baseZ: layer.z };
    scene.add(mesh);
    mountains.push(mesh);
  });
}

function animate() {
  if (!running) return;
  rafId = requestAnimationFrame(animate);
  const t = performance.now() * 0.001;

  stars.forEach(s => { if (s.material.uniforms) s.material.uniforms.time.value = t; });
  if (nebula) nebula.material.uniforms.time.value = t * 0.4;

  const ease = 0.055;
  curCam.x += (targetCam.x - curCam.x) * ease;
  curCam.y += (targetCam.y - curCam.y) * ease;
  curCam.z += (targetCam.z - curCam.z) * ease;

  const floatX = Math.sin(t * 0.12) * 1.5;
  const floatY = Math.cos(t * 0.16) * 0.8;

  camera.position.x = curCam.x + floatX;
  camera.position.y = curCam.y + floatY;
  camera.position.z = curCam.z;
  camera.lookAt(0, 14, -500);

  mountains.forEach((m, i) => {
    const p = 1 + i * 0.4;
    m.position.x = Math.sin(t * 0.1) * 1.5 * p;
  });

  composer.render();
}

function onResize() {
  W = container.clientWidth; H = container.clientHeight;
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  renderer.setSize(W, H);
  composer.setSize(W, H);
}

function setupScroll() {
  if (!window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.create({
    trigger: heroSection,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.6,
    onUpdate: self => {
      const p = self.progress;
      targetCam = {
        x: 0,
        y: 22 + p * 30,
        z: 140 - p * 260
      };
      document.getElementById('progressFill').style.width = (p * 100) + '%';
      const copy = document.querySelector('.hero-copy');
      if (copy) {
        copy.style.opacity = String(Math.max(0, 1 - p * 1.6));
        copy.style.transform = `translateY(${p * -40}px)`;
      }
    }
  });
}

function setupIO() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !running) {
        running = true;
        animate();
      } else if (!e.isIntersecting && running) {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
      }
    });
  }, { threshold: 0.05 });
  io.observe(heroSection);
}

// TEXT INTRO ANIMATION
function setupHeroText() {
  const titleEl = document.getElementById('heroTitle');
  const text = 'VIZA CLICK';
  titleEl.innerHTML = text.split('').map(ch =>
    ch === ' ' ? '<span class="title-char"> </span>' : `<span class="title-char">${ch}</span>`
  ).join('');

  if (window.gsap) {
    const tl = gsap.timeline({ delay: .15 });
    tl.from('#heroEyebrow', { opacity: 0, y: 16, duration: .7, ease: 'power3.out' })
      .from(titleEl.querySelectorAll('.title-char'), {
        y: 70, opacity: 0, duration: 1.1, stagger: 0.035, ease: 'power4.out'
      }, '-=.35')
      .from('#heroSub .subtitle-line', {
        y: 24, opacity: 0, duration: .8, stagger: 0.15, ease: 'power3.out'
      }, '-=.6')
      .from('#heroCta', { opacity: 0, y: 20, duration: .7, ease: 'power3.out' }, '-=.5')
      .from('#scrollProgress', { opacity: 0, y: 16, duration: .6, ease: 'power2.out' }, '-=.4');
  } else {
    titleEl.style.opacity = 1;
  }
}
