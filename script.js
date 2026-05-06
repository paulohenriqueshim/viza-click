(function () {
  const c = document.getElementById('pc');
  const x = c.getContext('2d');
  let W, H;
  const ps = [];
  function resize() { W = c.width = window.innerWidth; H = c.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 55; i++)ps.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, r: Math.random() * 1.4 + .3, dx: (Math.random() - .5) * .28, dy: (Math.random() - .5) * .28, o: Math.random() * .45 + .1 });
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

const g = document.getElementById('pg');
document.addEventListener('mousemove', e => {
  const x = (e.clientX / window.innerWidth - .5) * 90;
  const y = (e.clientY / window.innerHeight - .5) * 90;
  g.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
});

window.addEventListener('scroll', () => {
  document.getElementById('nb').classList.toggle('s', window.scrollY > 36);
});

const revs = document.querySelectorAll('.rev');
const ob = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: .1 });
revs.forEach(r => ob.observe(r));

function cpix() {
  const btn = document.getElementById('pxbtn');
  navigator.clipboard.writeText('11995945650').then(() => {
    btn.textContent = '✅ Chave copiada!';
    btn.style.borderColor = '#22c55e'; btn.style.color = '#22c55e';
    setTimeout(() => { btn.textContent = '📋 Pagar via Pix'; btn.style.borderColor = ''; btn.style.color = ''; }, 2500);
  }).catch(() => {
    const el = document.createElement('textarea'); el.value = '11995945650';
    document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el);
    btn.textContent = '✅ Chave copiada!';
    setTimeout(() => { btn.textContent = '📋 Pagar via Pix'; }, 2500);
  });
}

document.querySelectorAll('.salvar-contato').forEach(b => {
  b.addEventListener('click', e => {
    if (navigator.userAgent.toLowerCase().includes('instagram')) {
      e.preventDefault();
      alert('Para salvar o contato:\n1. Toque nos 3 pontos\n2. Abrir no navegador\n3. Clique novamente 😊');
    }
  });
});