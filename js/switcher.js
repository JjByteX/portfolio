/* ─── SWITCHER.JS ────────────────────────────────────────────────────────
   KDE Plasma-style task switcher for the Projects section.
   • 5 cards visible: 1 center + 2 each side, perspective spread
   • Clicking a side card: slides it to center → opens modal
   • Clicking center card: opens modal directly
   • Arrow keys, swipe, nav arrows, dot pagination
   • Filter tabs rebuild the pool, reset to index 0
   • Fully integrates with the existing modal.js — no changes needed

   SETUP (index.html):
   1. Remove:  <script src="js/filter.js" defer></script>
   2. Add:     <script src="js/switcher.js" defer></script>
──────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const grid = document.querySelector('.projects-grid');
  if (!grid) return;

  // ── Wrap grid in switcher shell ──────────────────────────────────────
  const shell = document.createElement('div');
  shell.className = 'sw-shell';
  grid.parentNode.insertBefore(shell, grid);
  shell.appendChild(grid);
  grid.classList.add('sw-track');

  // ── Collect all modal cards ──────────────────────────────────────────
  const ALL = Array.from(document.querySelectorAll('.proj-card[data-modal]'));

  // Kill grid-column span (ABTCMS uses span 2) — switcher owns layout now
  ALL.forEach(c => { c.style.gridColumn = ''; });

  // ── State ────────────────────────────────────────────────────────────
  let pool = [...ALL];
  let idx  = 0;
  let busy = false;
  const DUR = 480;

  // ── Position profiles ────────────────────────────────────────────────
  const PROFILES = {
    '-2': { x: -430, ry:  34, scale: 0.63, op: 0.30, br: 0.50, sa: 0.30, z: 1 },
    '-1': { x: -225, ry:  19, scale: 0.81, op: 0.60, br: 0.70, sa: 0.60, z: 2 },
     '0': { x:    0, ry:   0, scale: 1.00, op: 1.00, br: 1.00, sa: 1.00, z: 5 },
     '1': { x:  225, ry: -19, scale: 0.81, op: 0.60, br: 0.70, sa: 0.60, z: 2 },
     '2': { x:  430, ry: -34, scale: 0.63, op: 0.30, br: 0.50, sa: 0.30, z: 1 },
  };

  // ── Apply positions ───────────────────────────────────────────────────
  function place(animate) {
    const tr = animate
      ? `transform ${DUR}ms cubic-bezier(0.16,1,0.3,1), opacity ${DUR}ms ease, filter ${DUR}ms ease`
      : 'none';

    pool.forEach((card, i) => {
      const pos = i - idx;
      const key = String(Math.max(-2, Math.min(2, pos)));
      const p   = PROFILES[key];

      card.style.transition = tr;
      card.dataset.swPos    = pos;
      card.classList.toggle('sw-active', pos === 0);

      if (Math.abs(pos) <= 2) {
        card.style.transform     = `translateX(${p.x}px) rotateY(${p.ry}deg) scale(${p.scale})`;
        card.style.opacity       = p.op;
        card.style.filter        = `brightness(${p.br}) saturate(${p.sa})`;
        card.style.zIndex        = p.z;
        card.style.pointerEvents = 'all';
        card.style.visibility    = 'visible';
      } else {
        const offX = pos < 0 ? -720 : 720;
        card.style.transform     = `translateX(${offX}px) rotateY(${pos < 0 ? 42 : -42}deg) scale(0.5)`;
        card.style.opacity       = '0';
        card.style.zIndex        = '0';
        card.style.pointerEvents = 'none';
        card.style.visibility    = 'hidden';
      }
    });

    syncDots();
    syncArrows();
    syncCounter();
  }

  // ── Navigate ─────────────────────────────────────────────────────────
  let openAfter = false;

  function go(to, withModal) {
    if (busy) return;
    to = Math.max(0, Math.min(pool.length - 1, to));
    if (to === idx && !withModal) return;
    busy      = true;
    openAfter = !!withModal;
    idx       = to;
    place(true);
    setTimeout(() => {
      busy = false;
      if (openAfter) { openAfter = false; triggerModal(pool[idx]); }
    }, DUR + 40);
  }

  // ── Trigger modal (bypass our own interceptor) ────────────────────────
  let bypass = false;
  function triggerModal(card) {
    bypass = true;
    card.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    requestAnimationFrame(() => { bypass = false; });
  }

  // ── Click interceptor — capture phase, before modal.js ───────────────
  ALL.forEach(card => {
    card.addEventListener('click', e => {
      if (bypass) return;
      const pos = parseInt(card.dataset.swPos ?? '0');
      if (pos !== 0) {
        e.stopImmediatePropagation();
        const to = pool.indexOf(card);
        if (to !== -1) go(to, true);
      }
      // pos === 0: let event bubble through to modal.js
    }, true); // capture phase
  });

  // ── Nav arrows ───────────────────────────────────────────────────────
  function makeBtn(cls, label, html) {
    const el = document.createElement('button');
    el.className = cls;
    el.setAttribute('aria-label', label);
    el.innerHTML = html;
    return el;
  }

  const navL = makeBtn('sw-nav sw-nav-l', 'Previous', '<i data-lucide="chevron-left"></i>');
  const navR = makeBtn('sw-nav sw-nav-r', 'Next',     '<i data-lucide="chevron-right"></i>');
  shell.appendChild(navL);
  shell.appendChild(navR);
  navL.addEventListener('click', () => go(idx - 1));
  navR.addEventListener('click', () => go(idx + 1));

  function syncArrows() {
    navL.style.opacity       = idx === 0               ? '0.22' : '1';
    navL.style.pointerEvents = idx === 0               ? 'none'  : 'all';
    navR.style.opacity       = idx === pool.length - 1 ? '0.22' : '1';
    navR.style.pointerEvents = idx === pool.length - 1 ? 'none'  : 'all';
  }

  // ── Dots ─────────────────────────────────────────────────────────────
  const dotsEl = document.createElement('div');
  dotsEl.className = 'sw-dots';
  shell.appendChild(dotsEl);

  function buildDots() {
    dotsEl.innerHTML = '';
    pool.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'sw-dot';
      d.setAttribute('aria-label', `Project ${i + 1}`);
      d.addEventListener('click', () => go(i));
      dotsEl.appendChild(d);
    });
  }

  function syncDots() {
    dotsEl.querySelectorAll('.sw-dot')
      .forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  // ── Counter ───────────────────────────────────────────────────────────
  const counter = document.createElement('span');
  counter.className = 'sw-counter';
  shell.appendChild(counter);

  function syncCounter() {
    counter.textContent =
      `${String(idx + 1).padStart(2,'0')} / ${String(pool.length).padStart(2,'0')}`;
  }

// ── Keyboard ─────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (document.querySelector('.proj-modal-overlay.open')) return;
  if (e.key === 'ArrowLeft')  go(idx - 1);
  if (e.key === 'ArrowRight') go(idx + 1);
  if (e.key === 'Enter')      triggerModal(pool[idx]); // ← add this line
});

  // ── Touch swipe ───────────────────────────────────────────────────────
  let tx0 = 0;
  shell.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; }, { passive: true });
  shell.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - tx0;
    if (Math.abs(dx) > 48) go(dx < 0 ? idx + 1 : idx - 1);
  }, { passive: true });

// ── Filter tabs ──────────────────────────────────────────────────────
document.querySelectorAll('.proj-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    document.querySelectorAll('.proj-filter-btn')
      .forEach(b => b.classList.toggle('active', b === btn));

    // ✅ Hide ALL cards first before rebuilding the pool
    ALL.forEach(c => {
      c.style.visibility    = 'hidden';
      c.style.opacity       = '0';
      c.style.pointerEvents = 'none';
      c.style.transition    = 'none';
    });

    pool = f === 'all' ? [...ALL] : ALL.filter(c => c.dataset.category === f);
    idx  = 0;
    buildDots();

    // Small delay so the hide paints before place() runs
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        place(false);
      });
    });
  });
});

  // ── Lucide icons ──────────────────────────────────────────────────────
  if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [navL, navR] });

  // ── Boot ─────────────────────────────────────────────────────────────
  buildDots();
  place(false);

})();