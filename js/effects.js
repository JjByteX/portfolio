/* ─── EFFECTS.JS ─────────────────────────────────────
   Scroll progress, text scramble, count-up,
   clip-wipe, chip stagger, magnetic buttons.
──────────────────────────────────────────────────────── */

// ── SCROLL PROGRESS ───────────────────────────────────
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / total * 100) + '%';
  }, { passive: true });
}

// ── TEXT SCRAMBLE ─────────────────────────────────────
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·—';

function scramble(el) {
  if (el.dataset.scrambled) return;
  el.dataset.scrambled = 'true';

  const original = el.innerHTML;
  const plain = el.textContent;
  let frame = 0;
const totalFrames = plain.replace(/ /g, '').length * 1.4;

  const id = setInterval(() => {
    let ci = 0;
    el.textContent = plain.split('').map(char => {
      if (char === ' ') return ' ';
      ci++;
      if (ci <= frame / 1.5) return char;
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join('');

    frame++;
    if (frame > totalFrames) {
      clearInterval(id);
      el.innerHTML = original;
    }
  }, 12);
}

// ── COUNT-UP ──────────────────────────────────────────
function countUp(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = 'true';

  const original = el.textContent.trim();
  const match = original.match(/^([^0-9]*)(\d+)([^0-9]*)$/);

  if (!match) { scramble(el); return; }

  const [, pre, num, suf] = match;
  const target = parseInt(num);
  const start = performance.now();
  const dur = 900;

  (function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = pre + Math.round(eased * target) + suf;
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = original;
  })(start);
}

// ── MAGNETIC BUTTONS ──────────────────────────────────
function initMagnetic() {
  document.querySelectorAll('.btn').forEach(btn => {
btn.addEventListener('mouseenter', () => {
  btn.style.transition = 'transform 0.35s cubic-bezier(0.16,1,0.3,1)';
});
btn.addEventListener('mousemove', e => {
  const r = btn.getBoundingClientRect();
  const x = Math.max(-10, Math.min(10, (e.clientX - r.left - r.width  / 2) * 0.28));
  const y = Math.max(-8,  Math.min(8,  (e.clientY - r.top  - r.height / 2) * 0.32));
  btn.style.transform = `translate(${x}px, ${y}px)`;
});
btn.addEventListener('mouseleave', () => {
  btn.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1)';
  btn.style.transform = '';
  setTimeout(() => btn.style.transition = '', 550);
});
  });
}

// ── INTERSECTION OBSERVERS ────────────────────────────
function initObservers() {
  // Section label clip-wipe
  const labelObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('wiped');
    });
  }, { threshold: 0.8 });
  
  document.querySelectorAll('.section-label').forEach(el => labelObserver.observe(el));

  // Section title scramble
  document.querySelectorAll('.section-title').forEach(el => {
    new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) scramble(e.target);
      });
    }, { threshold: 0.6 }).observe(el);
  });

  // Stat count-up
  document.querySelectorAll('.stat-val').forEach(el => {
    new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) countUp(e.target);
      });
    }, { threshold: 0.8 }).observe(el);
  });

  // Chip stagger
  document.querySelectorAll('.skill-group').forEach(el => {
    new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('chipped');
      });
    }, { threshold: 0.3 }).observe(el);
  });
}

// ── CUSTOM CURSOR ─────────────────────────────────────
function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // Only on pointer-fine devices
  if (!window.matchMedia('(pointer: fine)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  }, { passive: true });

  // Ring follows with lerp
  (function lerp() {
    rx += (mx - rx) * 0.28;
    ry += (my - ry) * 0.28;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(lerp);
  })();

  // Hover state on interactive elements
// Hover state on interactive elements
const hoverEls = 'a, button, [data-modal], .chip, .proj-filter-btn, .social-item, .contact-link, #ghChartWrap';

document.querySelectorAll(hoverEls).forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

document.addEventListener('mouseout', (e) => {
  if (!e.relatedTarget) {
    document.body.classList.add('cursor-hidden');
  }
});

document.addEventListener('mouseover', () => {
  document.body.classList.remove('cursor-hidden');
});
}

// ── HERO FACE ──────────────────────────────────────────────────────────────
// Replace the entire initHeroFace() function in effects.js with this.
//
// INTERACTION MAP
// ─────────────────────────────────────────────────────────────────────────
// Mouse enters hero              → s-eager     circles + wider smile + bounce
// Mouse leaves hero              → s-pleased   ^^ eyes + flat line
// Cursor between the two eyes    → cross-eyed  both eyes drift inward (lerp only, no class)
// Cursor ≤88px from face center  → s-grin      ^^ eyes + bean smile, 900ms
// Hover "VIEW PROJECTS"          → s-squint    arc eyes + arc smile, 1.1s
// Hover "CONTACT ME"             → s-surprised dot eyes + O mouth, 950ms
// Theme toggle → light mode      → s-annoyed   flat eyes + flat mouth, 1.6s
// Theme toggle → dark mode       → s-pleased   ^^ satisfied, 900ms
// Click anywhere in hero         → surprised → dead → eager  (3-beat comic)
// Idle 7s                        → s-sleepy    droopy eyes, slow transition
// Wake from idle                 → surprised → eager
// Auto-cycle every 3–6s          → happy / eager / pleased / thinking (drift)
// Auto rare ~5%                  → s-dead flash (820ms)
// Auto rare ~4%                  → s-wtf text  (1.1s)
// ─────────────────────────────────────────────────────────────────────────
function initHeroFace() {

  const face  = document.getElementById('heroFace');
  const text  = face?.querySelector('.hf-text');
const eyeL = face?.querySelector('.hf-eye-l .hf-pupil');
const eyeR = face?.querySelector('.hf-eye-r .hf-pupil');
  const hero  = document.getElementById('hero');
  if (!face || !text || !eyeL || !eyeR || !hero) return;

  // ── Constants ─────────────────────────────────────────────────────────
  const ALL_STATES = [
    's-happy', 's-eager', 's-pleased', 's-smile',
    's-grin', 's-squint', 's-surprised', 's-sleepy',
    's-annoyed', 's-thinking', 's-wink', 's-dead', 's-wtf'
  ];

  // States where blinking looks wrong (non-circle eyes)
  const NO_BLINK = new Set([
    's-sleepy', 's-wtf', 's-dead', 's-squint',
    's-annoyed', 's-pleased', 's-grin', 's-thinking'
  ]);

  // States where eye lerp tracking should be skipped
  const NO_TRACK = new Set([
    's-wtf', 's-sleepy', 's-dead', 's-squint',
    's-annoyed', 's-pleased', 's-grin', 's-thinking'
  ]);

  const WTF_WORDS = ['WTF', '???', 'HUH', '!!!', 'OOF', 'NOPE', 'BAKA'];

  // ── State vars ────────────────────────────────────────────────────────
  let current     = 's-happy';
  let isReacting  = false;
  let isIdle      = false;
  let idleTimer   = null;
  let autoTimer   = null;
  let blinkTimer  = null;
  let lastMX      = -9999;
  let lastMY      = -9999;

  // ── State helpers ─────────────────────────────────────────────────────
function clearState() {
  face.classList.remove(...ALL_STATES);
  if (text) text.textContent = ''; // Clear the WTF text when changing emotions
}

  function setState(state) {
    clearState();
    current = state;
    face.classList.add(current);
  }

  // Hold a state for duration ms, then return to returnTo
  function reactFor(state, duration, returnTo = 's-eager') {
    if (isReacting) return;
    isReacting = true;
    clearTimeout(autoTimer);
    setState(state);
    setTimeout(() => {
      isReacting = false;
      setState(returnTo);
      scheduleAuto();
    }, duration);
  }

  // Quick pixel glitch before state change — feels robotic
  function glitch(cb) {
    face.classList.add('glitch-shift');
    setTimeout(() => {
      face.classList.remove('glitch-shift');
      if (cb) cb();
    }, 75);
  }

// ── Blink ─────────────────────────────────────────────────────────────
  function scheduleBlink() {
    clearTimeout(blinkTimer);
    blinkTimer = setTimeout(() => {
      if (!NO_BLINK.has(current)) {
        face.classList.add('blinking');
        // 70ms is the "sweet spot" to let the CSS snap the eyes back open
        setTimeout(() => face.classList.remove('blinking'), 70); 
      }
      scheduleBlink();
    }, 2600 + Math.random() * 4000);
  }

  // ── Eye tracking + cross-eyed ─────────────────────────────────────────
  let eyeTargetX  = 0, eyeTargetY  = 0;
  let eyeCurX     = 0, eyeCurY     = 0;
  let isCrossZone = false;

  document.addEventListener('mousemove', e => {
    lastMX = e.clientX;
    lastMY = e.clientY;

    const fr   = face.getBoundingClientRect();
    const fcx  = fr.left + fr.width  / 2;
    const fcy  = fr.top  + fr.height / 2;
    const dx   = e.clientX - fcx;
    const dy   = e.clientY - fcy;
    const dist = Math.hypot(dx, dy) || 1;

    // Cross-eyed zone: cursor X within ±42px of center at eye height
    isCrossZone = (
      Math.abs(dx) < 42 &&
      dy > -70 && dy < 20 &&
      dist < 88
    );

    // Close-to-face grin trigger (skips if in cross zone)
    if (dist < 88 && !isCrossZone && !isReacting && !isIdle && current !== 's-grin') {
      reactFor('s-grin', 900, 's-eager');
      return;
    }

    // Normal tracking vector
    const pull = Math.min(dist / 280, 1);
    eyeTargetX = (dx / dist) * pull * 11;
    eyeTargetY = (dy / dist) * pull * 8;
  }, { passive: true });

  // Lerp loop — runs every frame
  (function lerpEyes() {
    if (!NO_TRACK.has(current)) {
      if (isCrossZone) {
        // Both eyes drift inward — cross-eyed effect
        const fr     = face.getBoundingClientRect();
        const fcx    = fr.left + fr.width / 2;
const inward = 20 + Math.max(0, (42 - Math.abs(lastMX - fcx)) * 0.5);
        eyeCurX += (0 - eyeCurX) * 0.15;
        eyeCurY += (eyeTargetY - eyeCurY) * 0.12;
        eyeL.style.transform = `translate(${inward}px, ${eyeCurY}px)`;
        eyeR.style.transform = `translate(${-inward}px, ${eyeCurY}px)`;
      } else {
        eyeCurX += (eyeTargetX - eyeCurX) * 0.12;
        eyeCurY += (eyeTargetY - eyeCurY) * 0.12;
        eyeL.style.transform = `translate(${eyeCurX}px, ${eyeCurY}px)`;
        eyeR.style.transform = `translate(${eyeCurX}px, ${eyeCurY}px)`;
      }
    }
    requestAnimationFrame(lerpEyes);
  })();

  // ── Idle eye wander ───────────────────────────────────────────────────
  function startWander() {
    const spots = [
      { x: -9, y: 2 }, { x: 9, y: 0 },
      { x: 0, y: -5 }, { x: -7, y: 5 }, { x: 7, y: 3 }
    ];
    let i = 0;
    const tick = setInterval(() => {
      if (!isIdle) {
        clearInterval(tick);
        eyeTargetX = 0;
        eyeTargetY = 0;
        return;
      }
      const p = spots[i % spots.length];
      eyeTargetX = p.x;
      eyeTargetY = p.y;
      i++;
    }, 1900);
  }

  // ── Auto-cycle ────────────────────────────────────────────────────────
  function scheduleAuto() {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(() => {
      if (isReacting || isIdle) { scheduleAuto(); return; }

      const roll = Math.random();

      // ~5% — dead flash
      if (roll < 0.05) {
        isReacting = true;
        glitch(() => {
          setState('s-dead');
          setTimeout(() => {
            isReacting = false;
            glitch(() => setState('s-eager'));
            scheduleAuto();
          }, 820);
        });
        return;
      }

      // ~4% — WTF text
      if (roll < 0.09) {
        glitch(() => {
          isReacting = true;
          text.textContent = WTF_WORDS[Math.floor(Math.random() * WTF_WORDS.length)];
          clearState();
          face.classList.add('s-wtf');
          current = 's-wtf';
          setTimeout(() => {
            isReacting = false;
            glitch(() => setState('s-eager'));
            scheduleAuto();
          }, 1100);
        });
        return;
      }

      // Normal drift — mostly attentive states
      const pool = [
        's-eager', 's-eager', 's-eager',
        's-happy', 's-happy',
        's-pleased',
        's-thinking'
      ].filter(s => s !== current);

      const next = pool[Math.floor(Math.random() * pool.length)];
      glitch(() => { setState(next); scheduleAuto(); });

    }, 3200 + Math.random() * 2800);
  }

  // ── Hero enter / leave ────────────────────────────────────────────────
  hero.addEventListener('mouseenter', () => {
    if (isIdle) {
      // Startled awake, then goes eager
      isIdle = false;
      isReacting = true;
      setState('s-surprised');
      setTimeout(() => {
        isReacting = false;
        setState('s-eager');
        scheduleAuto();
      }, 580);
    } else if (!isReacting) {
      setState('s-eager');
    }
  });

  hero.addEventListener('mouseleave', () => {
    eyeTargetX  = 0;
    eyeTargetY  = 0;
    isCrossZone = false;
    if (!isReacting && !isIdle) setState('s-pleased');
  });

  // ── CTA button hovers ─────────────────────────────────────────────────
  document.querySelector('a[href="#projects"].btn')
    ?.addEventListener('mouseenter', () => reactFor('s-squint', 1100, 's-eager'));

  document.querySelector('a[href="#contact"].btn')
    ?.addEventListener('mouseenter', () => reactFor('s-surprised', 950, 's-eager'));

  // ── Theme toggle ──────────────────────────────────────────────────────
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const nowLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (nowLight) {
      reactFor('s-annoyed', 1600, 's-happy');
    } else {
      reactFor('s-pleased', 900, 's-eager');
    }
  });

  // ── Click in hero — 3-beat comic ──────────────────────────────────────
  hero.addEventListener('click', () => {
    if (isReacting) return;
    isReacting = true;
    clearTimeout(autoTimer);
    setState('s-surprised');
    setTimeout(() => {
      glitch(() => setState('s-dead'));
      setTimeout(() => {
        isReacting = false;
        glitch(() => setState('s-eager'));
        scheduleAuto();
      }, 600);
    }, 440);
  });

  // ── Idle detection ────────────────────────────────────────────────────
  function resetIdle() {
    clearTimeout(idleTimer);
    if (isIdle) {
      isIdle = false;
      eyeTargetX = 0;
      eyeTargetY = 0;
      if (!isReacting) {
        setState('s-surprised');
        setTimeout(() => { if (!isReacting) setState('s-eager'); }, 520);
      }
    }
    idleTimer = setTimeout(() => {
      if (!isReacting) {
        isIdle = true;
        glitch(() => setState('s-sleepy'));
        startWander();
      }
    }, 7000);
  }

  document.addEventListener('mousemove', resetIdle, { passive: true });
  document.addEventListener('keydown',   resetIdle);
  document.addEventListener('click',     resetIdle);

  // If intro was already seen, make sure face is visible immediately
  if (sessionStorage.getItem('introDone')) {
    face.classList.add('intro-arrived');
    face.style.opacity = '1';
  }

  // ── Boot ──────────────────────────────────────────────────────────────
  setState(current);
  resetIdle();
  scheduleAuto();
  scheduleBlink();
}

// ── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initMagnetic();
  initCursor();
  initObservers();
  initHeroFace();
});