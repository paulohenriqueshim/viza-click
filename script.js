// PARTÍCULAS
(function () {
  const c = document.getElementById('pc');
  const ctx = c.getContext('2d');
  let W, H;
  const ps = [];
  const COUNT = window.innerWidth < 860 ? 25 : 45;

  function resize() { W = c.width = window.innerWidth; H = c.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  for (let i = 0; i < COUNT; i++) ps.push({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 1.2 + .3,
    dx: (Math.random() - .5) * .22,
    dy: (Math.random() - .5) * .22,
    o: Math.random() * .4 + .08
  });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const p of ps) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(90,155,255,${p.o})`;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0) p.x = W; else if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; else if (p.y > H) p.y = 0;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// GLOW + CURSOR
const glowEl = document.getElementById('pg');
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');
let mx = 0, my = 0, rafPending = false;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(() => {
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
      cursorTrail.style.left = mx + 'px';
      cursorTrail.style.top  = my + 'px';
      const gx = (mx / window.innerWidth  - .5) * 80;
      const gy = (my / window.innerHeight - .5) * 80;
      glowEl.style.transform = `translate(calc(-50% + ${gx}px), calc(-50% + ${gy}px))`;
      rafPending = false;
    });
  }
}, { passive: true });

// NAV SCROLL
window.addEventListener('scroll', () => {
  document.getElementById('nb').classList.toggle('s', window.scrollY > 36);
  const hint = document.querySelector('.scroll-hint');
  if (hint) hint.style.opacity = window.scrollY > 80 ? '0' : '';
}, { passive: true });

// REVEAL ON SCROLL
const revEls = document.querySelectorAll('.rev');
const revOb = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: .1 });
revEls.forEach(r => revOb.observe(r));

// FAQ TOGGLE
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const answer = item.querySelector('.faq-a');
  const isOpen = item.classList.contains('open');

  // Fecha todos
  document.querySelectorAll('.faq-item.open').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.faq-a').style.height = '0';
  });

  // Abre o clicado (se não estava aberto)
  if (!isOpen) {
    item.classList.add('open');
    answer.style.height = answer.scrollHeight + 'px';
  }
}