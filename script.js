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

// PORTFOLIO DRAG CAROUSEL
(function () {
  const track = document.getElementById('portTrack');
  const prevBtn = document.getElementById('portPrev');
  const nextBtn = document.getElementById('portNext');
  if (!track) return;

  let isDown = false;
  let startX = 0;
  let startScroll = 0;
  let moved = false;

  function down(x) {
    isDown = true;
    moved = false;
    startX = x;
    startScroll = track.scrollLeft;
    track.classList.add('dragging');
  }
  function move(x) {
    if (!isDown) return;
    const dx = x - startX;
    if (Math.abs(dx) > 4) moved = true;
    track.scrollLeft = startScroll - dx;
  }
  function up() {
    isDown = false;
    track.classList.remove('dragging');
  }

  track.addEventListener('mousedown', e => { down(e.pageX); });
  window.addEventListener('mousemove', e => { move(e.pageX); });
  window.addEventListener('mouseup', up);

  track.addEventListener('touchstart', e => { down(e.touches[0].pageX); }, { passive: true });
  track.addEventListener('touchmove', e => { move(e.touches[0].pageX); }, { passive: true });
  track.addEventListener('touchend', up);

  // Prevent link clicks from firing right after a drag
  track.addEventListener('click', e => {
    if (moved) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  function cardStep() {
    const card = track.querySelector('.pcard');
    if (!card) return 300;
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || 20);
    return card.getBoundingClientRect().width + gap;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -cardStep(), behavior: 'smooth' });
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: cardStep(), behavior: 'smooth' });
  });

  function updateArrows() {
    if (!prevBtn || !nextBtn) return;
    prevBtn.disabled = track.scrollLeft <= 4;
    nextBtn.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
  }
  track.addEventListener('scroll', updateArrows, { passive: true });
  updateArrows();
})();

// REVEAL ON SCROLL
const revEls = document.querySelectorAll('.rev');
const revOb = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: .1 });
revEls.forEach(r => revOb.observe(r));
