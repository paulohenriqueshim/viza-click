// ============================================
// PARTÍCULAS DE FUNDO
// ============================================
(function () {
  const c = document.getElementById('pc');
  const x = c.getContext('2d');
  let W, H;
  const ps = [];
  function resize() { W = c.width = window.innerWidth; H = c.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 55; i++) ps.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.4 + .3,
    dx: (Math.random() - .5) * .28,
    dy: (Math.random() - .5) * .28,
    o: Math.random() * .45 + .1
  });
  function draw() {
    x.clearRect(0, 0, W, H);
    ps.forEach(p => {
      x.beginPath(); x.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      x.fillStyle = `rgba(90,155,255,${p.o})`; x.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ============================================
// GLOW QUE SEGUE O MOUSE
// ============================================
const g = document.getElementById('pg');
document.addEventListener('mousemove', e => {
  const x = (e.clientX / window.innerWidth - .5) * 90;
  const y = (e.clientY / window.innerHeight - .5) * 90;
  g.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
});

// ============================================
// CURSOR PERSONALIZADO
// ============================================
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  // Trail com leve delay via CSS transition
  cursorTrail.style.left = e.clientX + 'px';
  cursorTrail.style.top = e.clientY + 'px';
});

// ============================================
// NAV SCROLL
// ============================================
window.addEventListener('scroll', () => {
  document.getElementById('nb').classList.toggle('s', window.scrollY > 36);

  // Esconde o scroll hint após rolar um pouco
  const hint = document.querySelector('.scroll-hint');
  if (hint) hint.style.opacity = window.scrollY > 80 ? '0' : '';
});

// ============================================
// REVEAL ON SCROLL
// ============================================
const revs = document.querySelectorAll('.rev');
const ob = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: .1 });
revs.forEach(r => ob.observe(r));

// ============================================
// CONTADOR DECRESCENTE DO PREÇO
// Começa em número alto e vai até 97 com easing
// ============================================
function animatePrice() {
  const el = document.getElementById('priceCounter');
  if (!el) return;

  const startValue = 347;
  const endValue = 97;
  const duration = 1800; // ms
  const startTime = performance.now();

  // Easing out cubic — desacelera no final
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(progress);

    const current = Math.round(startValue - (startValue - endValue) * eased);

    // Efeito de blur rápido a cada troca
    el.classList.add('changing');
    el.textContent = current;
    requestAnimationFrame(() => {
      el.classList.remove('changing');
    });

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = endValue;
      el.classList.remove('changing');
    }
  }

  // Começa após o hero aparecer (delay das animações CSS)
  setTimeout(() => {
    requestAnimationFrame(step);
  }, 1300);
}

// Inicia quando a página carrega
window.addEventListener('load', animatePrice);

// ============================================
// PIX
// ============================================
function cpix() {
  const btn = document.getElementById('pxbtn');
  navigator.clipboard.writeText('11995945650').then(() => {
    btn.textContent = '✅ Chave copiada!';
    btn.style.borderColor = '#22c55e';
    btn.style.color = '#22c55e';
    setTimeout(() => {
      btn.textContent = '📋 Pagar via Pix';
      btn.style.borderColor = '';
      btn.style.color = '';
    }, 2500);
  }).catch(() => {
    const el = document.createElement('textarea');
    el.value = '11995945650';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    btn.textContent = '✅ Chave copiada!';
    setTimeout(() => { btn.textContent = '📋 Pagar via Pix'; }, 2500);
  });
}

// ============================================
// SALVAR CONTATO (Instagram workaround)
// ============================================
document.querySelectorAll('.salvar-contato').forEach(b => {
  b.addEventListener('click', e => {
    if (navigator.userAgent.toLowerCase().includes('instagram')) {
      e.preventDefault();
      alert('Para salvar o contato:\n1. Toque nos 3 pontos\n2. Abrir no navegador\n3. Clique novamente 😊');
    }
  });
});
