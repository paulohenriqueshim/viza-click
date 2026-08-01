// CURSOR
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');
let mx = 0, my = 0, rafPending = false;

if (cursor && cursorTrail) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        cursor.style.left = mx + 'px';
        cursor.style.top = my + 'px';
        cursorTrail.style.left = mx + 'px';
        cursorTrail.style.top = my + 'px';
        rafPending = false;
      });
    }
  }, { passive: true });
}

// NAV SCROLL
window.addEventListener('scroll', () => {
  document.getElementById('nb').classList.toggle('s', window.scrollY > 36);
}, { passive: true });

// REVEAL ON SCROLL
const revEls = document.querySelectorAll('.rev');
const revOb = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: .1 });
revEls.forEach(r => revOb.observe(r));
