import * as THREE from 'three';

// Text/intro animation must run no matter what happens with the 3D scene below.
setupHeroText();

const canvas = document.getElementById('hero-canvas');
const heroSection = document.getElementById('top');

const isMobile = window.innerWidth < 760;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let W = window.innerWidth, H = window.innerHeight;
let renderer, scene, camera;
const stars = [];
const mountains = [];
let nebula;
let running = true;
let rafId = null;
let targetCam = { x: 0, y: 22, z: 140 };
let curCam = { x: 0, y: 22, z: 140 };
let scrollProgress = 0; // 0..1 across the whole document
let heroProgress = 0;   // 0..1 across just the hero section (for the text overlay fade)
let lastFrame = performance.now();

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
}

function init() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03040a, 0.00028);

  camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 3000);
  camera.position.set(curCam.x, curCam.y, curCam.z);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.55;

  createStars();
  createNebula();
  createMountains();

  setupResize();
  setupScroll();
  setupIO();

  animate();
}

function createStars() {
  const layers = isMobile ? 1 : 2;
  const count = isMobile ? 900 : 2600;

  for (let l = 0; l < layers; l++) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 200 + Math.random() * 1400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const c = new THREE.Color();
      const pick = Math.random();
      if (pick < 0.72) c.setHSL(0.6, 0.35, 0.85);
      else if (pick < 0.94) c.setHSL(0.58, 0.7, 0.65);
      else c.setHSL(0.5, 0.8, 0.7);

      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
      sizes[i] = Math.random() * 1.9 + 0.5;
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
          float angle = time * 0.02 * (1.0 - depth * 0.3);
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
  const geometry = new THREE.PlaneGeometry(7000, 3600, isMobile ? 16 : 50, isMobile ? 16 : 50);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color1: { value: new THREE.Color(0x1b63d9) },
      color2: { value: new THREE.Color(0x7dd3fc) },
      opacity: { value: 0.24 }
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
  nebula.position.z = -1400;
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

// ─── Camera flight path across the ENTIRE document ───
// A handful of keyframes the camera flies through as the whole page is scrolled.
const CAM_KEYFRAMES = [
  { p: 0,    x: 0,  y: 22,  z: 140  },
  { p: 0.15, x: 8,  y: 34,  z: -60  },
  { p: 0.4,  x: -6, y: 46,  z: -320 },
  { p: 0.7,  x: 6,  y: 40,  z: -680 },
  { p: 1,    x: 0,  y: 30,  z: -1080 }
];

function camAtProgress(p) {
  for (let i = 0; i < CAM_KEYFRAMES.length - 1; i++) {
    const a = CAM_KEYFRAMES[i], b = CAM_KEYFRAMES[i + 1];
    if (p >= a.p && p <= b.p) {
      const t = (p - a.p) / (b.p - a.p || 1);
      const ease = t * t * (3 - 2 * t); // smoothstep
      return {
        x: a.x + (b.x - a.x) * ease,
        y: a.y + (b.y - a.y) * ease,
        z: a.z + (b.z - a.z) * ease
      };
    }
  }
  const last = CAM_KEYFRAMES[CAM_KEYFRAMES.length - 1];
  return { x: last.x, y: last.y, z: last.z };
}

function updateScrollProgress() {
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress = docH > 0 ? Math.min(Math.max(window.scrollY / docH, 0), 1) : 0;

  const heroH = heroSection ? heroSection.offsetHeight : window.innerHeight;
  heroProgress = Math.min(Math.max(window.scrollY / (heroH * 0.9), 0), 1);
}

function setupScroll() {
  updateScrollProgress();
  window.addEventListener('scroll', () => {
    updateScrollProgress();
  }, { passive: true });
}

function animate() {
  if (!running) return;
  rafId = requestAnimationFrame(animate);

  const now = performance.now();
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;
  const t = now * 0.001;

  stars.forEach(s => { if (s.material.uniforms) s.material.uniforms.time.value = t; });
  if (nebula) nebula.material.uniforms.time.value = t * 0.35;

  targetCam = camAtProgress(scrollProgress);

  // Frame-rate independent smoothing (no jitter regardless of device fps)
  const smoothing = 1 - Math.pow(0.001, dt);
  curCam.x += (targetCam.x - curCam.x) * smoothing;
  curCam.y += (targetCam.y - curCam.y) * smoothing;
  curCam.z += (targetCam.z - curCam.z) * smoothing;

  const idleAmount = isMobile ? 0.6 : 1.5;
  const floatX = Math.sin(t * 0.12) * idleAmount;
  const floatY = Math.cos(t * 0.16) * (idleAmount * 0.6);

  camera.position.x = curCam.x + floatX;
  camera.position.y = curCam.y + floatY;
  camera.position.z = curCam.z;
  camera.lookAt(0, 14, curCam.z - 500);

  mountains.forEach((m, i) => {
    const p = 1 + i * 0.4;
    m.position.x = Math.sin(t * 0.1) * 1.2 * p;
  });

  const progressFill = document.getElementById('progressFill');
  if (progressFill) progressFill.style.width = (heroProgress * 100) + '%';

  const copy = document.querySelector('.hero-copy');
  if (copy) {
    const fade = Math.max(0, 1 - heroProgress * 1.5);
    copy.style.opacity = String(fade);
    copy.style.transform = `translateY(${heroProgress * -30}px)`;
    copy.style.pointerEvents = fade < 0.05 ? 'none' : 'auto';
  }

  renderer.render(scene, camera);
}

function setupResize() {
  let lastW = window.innerWidth, lastH = window.innerHeight;
  let resizeTimer = null;

  function applyResize() {
    W = window.innerWidth; H = window.innerHeight;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  }

  window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    // Ignore small height-only changes caused by mobile browser address bar show/hide.
    if (Math.abs(w - lastW) < 2 && Math.abs(h - lastH) < 120) return;
    lastW = w; lastH = h;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyResize, 120);
  }, { passive: true });
}

function setupIO() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !running) {
        running = true;
        lastFrame = performance.now();
        animate();
      } else if (!e.isIntersecting && running) {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
      }
    });
  }, { threshold: 0 });
  io.observe(document.body);
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

// ─── BOOT (runs last, after every const/let above has been initialized) ───
if (!supportsWebGL() || reducedMotion) {
  document.body.classList.add('no-webgl');
} else {
  try {
    init();
  } catch (err) {
    console.error('Hero 3D scene failed to initialize:', err);
    document.body.classList.add('no-webgl');
  }
}
