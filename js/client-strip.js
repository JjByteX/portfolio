/* ─── CLIENT-STRIP.JS ────────────────────────────────────
   Looping client photo strip (Projects section), same idea as
   the Qula site: tiles glide one step every few seconds, and a
   tile that leaves one edge re-enters from the other.
   - Each tile's slot is its shortest wrapped distance from the
     current position, recomputed every frame (no jump, no clones
     swapping). The photos are doubled so a tile only wraps while
     it is well off-screen.
   - Autoplay pauses on hover, focus, hidden tab and off-screen.
   - Dots jump to a photo; swipe or drag left / right steps.
   Sizes live in CSS (sections.css); this only sets --cs-pos.
──────────────────────────────────────────────────────── */
(function () {
  const strip    = document.getElementById('clientStrip');
  const viewport = strip && strip.querySelector('.cs-viewport');
  const dotsWrap = document.getElementById('csDots');
  if (!strip || !viewport || !dotsWrap) return;

  const SLIDE_MS = 6000;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  strip.style.setProperty('--cs-slide', SLIDE_MS + 'ms');

  /* Double the tiles so the loop wraps far outside the visible area */
  const originals = Array.from(viewport.children);
  const count = originals.length;
  originals.forEach(tile => {
    const copy = tile.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelector('img').alt = '';
    viewport.appendChild(copy);
  });
  const tiles = Array.from(viewport.children);
  const total = tiles.length;

  /* Dots */
  const dots = originals.map((tile, i) => {
    const dot = document.createElement('button');
    dot.className = 'cs-dot';
    dot.setAttribute('aria-label', 'Show photo ' + (i + 1));
    dot.innerHTML = '<span class="cs-pill"><span class="cs-fill"></span></span>';
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
    return dot;
  });

  let target = 0;      /* where the strip is heading, in tiles (grows without bound) */
  let offset = 0;      /* where it is now, eased toward target */
  let raf = 0, last = 0, timer = 0;
  let visible = false, hovered = false, focused = false;

  const mod = (n, m) => ((n % m) + m) % m;

  /* Shortest signed distance from the current position, wrapped around the loop */
  function slot(i) {
    let r = mod(i - offset, total);
    if (r >= total / 2) r -= total;
    return r;
  }

  function render() {
    tiles.forEach((tile, i) => tile.style.setProperty('--cs-pos', slot(i).toFixed(4)));
  }

  function frame(now) {
    const dt = Math.min(now - last, 64);
    last = now;
    offset += (target - offset) * (1 - Math.exp(-dt / 240));
    if (Math.abs(target - offset) < 0.001) { offset = target; raf = 0; }
    else raf = requestAnimationFrame(frame);
    render();
  }

  function restartFill() {
    const fill = dots[mod(target, count)].querySelector('.cs-fill');
    fill.style.animation = 'none';
    void fill.offsetWidth;
    fill.style.animation = '';
  }

  function updateAutoplay() {
    const run = visible && !hovered && !focused && !document.hidden && !reduceMotion;
    clearTimeout(timer);
    strip.classList.toggle('is-paused', !run);
    if (!run) return;
    restartFill();
    timer = setTimeout(() => go(1), SLIDE_MS);
  }

  function go(step) {
    target += step;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === mod(target, count)));
    if (reduceMotion) { offset = target; render(); }
    else if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    updateAutoplay();
  }

  function goTo(i) {
    let diff = i - mod(target, count);
    if (diff > count / 2) diff -= count;
    if (diff < -count / 2) diff += count;
    if (diff) go(diff);
  }

  /* Swipe / drag */
  let startX = null;
  viewport.addEventListener('pointerdown', e => { startX = e.clientX; });
  viewport.addEventListener('pointerup', e => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  });
  viewport.addEventListener('pointercancel', () => { startX = null; });

  /* Pause conditions */
  strip.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hovered = true; updateAutoplay(); } });
  strip.addEventListener('pointerleave', () => { hovered = false; updateAutoplay(); });
  /* Only keyboard focus pauses; a mouse click on a dot should not freeze autoplay */
  strip.addEventListener('focusin',  e => { focused = e.target.matches(':focus-visible'); updateAutoplay(); });
  strip.addEventListener('focusout', () => { focused = false; updateAutoplay(); });
  document.addEventListener('visibilitychange', updateAutoplay);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateAutoplay();
    }, { threshold: 0.2 }).observe(strip);
  } else {
    visible = true;
  }

  /* Boot */
  dots[0].classList.add('active');
  render();
  updateAutoplay();
})();
