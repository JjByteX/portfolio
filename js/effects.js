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
  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('wiped');
      }
    });
  }, { threshold: 0.8 }).observe
  && document.querySelectorAll('.section-label').forEach(el => {
    new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('wiped');
        }
      });
    }, { threshold: 0.8 }).observe(el);
  });

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

// ── HERO FACE ──────────────────────────────────────────
function initHeroFace() {
  const face = document.getElementById('heroFace');
  const text = face?.querySelector('.hf-text');
  const eyeL = face?.querySelector('.hf-eye-l');
  const eyeR = face?.querySelector('.hf-eye-r');
  const hero = document.getElementById('hero');
  if (!face || !text || !eyeL || !eyeR || !hero) return;

  const states = ['s-happy', 's-pleased', 's-annoyed', 's-smile', 's-sleepy', 's-squint', 's-grin', 's-surprised', 's-dead'];
  const wtfWords = ['WTF', '???', 'HUH', '!!!', 'OOF'];

  let current = 's-happy';
  let idleTimer = null;
  let isIdle = false;
  let isReacting = false;
  let autoTimer = null;

  face.classList.add(current);

  // ── State management ──
  function setState(state, duration) {
    if (isReacting && state !== 's-wtf') return;

    face.classList.remove(current, 's-wtf');
    current = state;
    face.classList.add(current);

    if (duration) {
      isReacting = true;
      clearTimeout(autoTimer);
      setTimeout(() => {
        isReacting = false;
        setState('s-happy');
        scheduleAuto();
      }, duration);
    }
  }

  function glitch(cb) {
    face.classList.add('glitch-shift');
    setTimeout(() => {
      face.classList.remove('glitch-shift');
      if (cb) cb();
    }, 80);
  }

  function setStateWithGlitch(state, duration) {
    if (isReacting) return;
    glitch(() => setState(state, duration));
  }

  // ── Auto cycle (slower now, interactions take priority) ──
function scheduleAuto() {
    clearTimeout(autoTimer);
    const delay = 2500 + Math.random() * 2000;
    autoTimer = setTimeout(() => {
      if (!isReacting && !isIdle) {
        const wtfChance = Math.random() < 0.05;
        if (wtfChance) {
          glitch(() => {
            text.textContent = wtfWords[Math.floor(Math.random() * wtfWords.length)];
            face.classList.remove(current);
            face.classList.add('s-wtf');
            current = 's-wtf';
            isReacting = true;
            setTimeout(() => {
              isReacting = false;
              glitch(() => setState('s-happy'));
              scheduleAuto();
            }, 1200);
          });
          return;
        }

        // Weighted pool — all states included now
        const pool = [
          's-happy', 's-happy', 's-happy',
          's-pleased', 's-pleased',
          's-annoyed', 's-annoyed',
          's-squint',
          's-grin',
          's-surprised',
          's-dead'
        ];

        // Filter out current so it always changes
        const options = pool.filter(s => s !== current);
        const next = options[Math.floor(Math.random() * options.length)];

        // Short states snap back after a moment
        const shortStates = ['s-surprised', 's-dead', 's-grin'];
        if (shortStates.includes(next)) {
          glitch(() => {
            setState(next);
            isReacting = true;
            setTimeout(() => {
              isReacting = false;
              setState('s-happy');
              scheduleAuto();
            }, 1000);
          });
        } else {
          glitch(() => setState(next));
          scheduleAuto();
        }
      } else {
        scheduleAuto();
      }
    }, delay);
  }

  // ── Eye tracking ──
let eyeTargetX = 0, eyeTargetY = 0, eyeCurX = 0, eyeCurY = 0;

  hero.addEventListener('mousemove', e => {
    if (!eyeL || !eyeR) return;
    const fr = face.getBoundingClientRect();
    const fcx = fr.left + fr.width / 2;
    const fcy = fr.top + fr.height / 2;
    const dx = e.clientX - fcx;
    const dy = e.clientY - fcy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 300;
    const factor = Math.min(dist / maxDist, 1);
    eyeTargetX = (dx / dist) * factor * 12;
    eyeTargetY = (dy / dist) * factor * 9;
  }, { passive: true });

  (function lerpEyes() {
    if (current !== 's-wtf' && current !== 's-sleepy') {
      eyeCurX += (eyeTargetX - eyeCurX) * 0.12;
      eyeCurY += (eyeTargetY - eyeCurY) * 0.12;
      eyeL.style.transform = `translate(${eyeCurX}px, ${eyeCurY}px)`;
      eyeR.style.transform = `translate(${eyeCurX}px, ${eyeCurY}px)`;
    }
    requestAnimationFrame(lerpEyes);
  })();

  // ── Mouse leaves hero ──
hero.addEventListener('mouseleave', () => {
    eyeTargetX = 0; eyeTargetY = 0;
    if (!isReacting) setState('s-annoyed');
  });

  hero.addEventListener('mouseenter', () => {
    if (!isReacting && !isIdle) setState('s-happy');
  });

  // ── Button hover reactions ──
  const viewBtn = document.querySelector('a[href="#projects"].btn');
  const contactBtn = document.querySelector('a[href="#contact"].btn');

viewBtn?.addEventListener('mouseenter', () => {
    if (isReacting) return;
    isReacting = true;
    setState('s-smile');
    setTimeout(() => { isReacting = false; setState('s-happy'); }, 800);
  });

  contactBtn?.addEventListener('mouseenter', () => {
    if (isReacting) return;
    isReacting = true;
    setState('s-pleased');
    setTimeout(() => { isReacting = false; setState('s-happy'); }, 800);
  });

  // ── Click reaction ──
  hero.addEventListener('click', () => {
    if (isReacting) return;
    isReacting = true;
    clearTimeout(autoTimer);
    text.textContent = '!!!';
    glitch(() => {
      face.classList.remove(current);
      face.classList.add('s-wtf');
      current = 's-wtf';
      setTimeout(() => {
        isReacting = false;
        glitch(() => setState('s-happy'));
        scheduleAuto();
      }, 900);
    });
  });

  // ── Idle detection ──
  function resetIdle() {
    clearTimeout(idleTimer);
    if (isIdle) {
      isIdle = false;
      if (!isReacting) glitch(() => setState('s-happy'));
    }
    idleTimer = setTimeout(() => {
      if (!isReacting) {
        isIdle = true;
        glitch(() => setState('s-sleepy'));
      }
    }, 7000);
  }

  document.addEventListener('mousemove', resetIdle, { passive: true });
  document.addEventListener('keydown', resetIdle);
  document.addEventListener('click', resetIdle);

  resetIdle();
  scheduleAuto();
}

// ── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initMagnetic();
  initCursor();
  initObservers();
  initHeroFace();
});