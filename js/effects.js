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

  const allStates = ['s-happy','s-pleased','s-annoyed','s-smile','s-sleepy',
                     's-squint','s-grin','s-surprised','s-dead','s-thinking','s-wink'];
  const wtfWords  = ['WTF','???','HUH','!!!','OOF','PST','HEY','bruh'];

  let current    = 's-happy';
  let idleTimer  = null;
  let isIdle     = false;
  let isReacting = false;
  let autoTimer  = null;
  let blinkTimer = null;

  face.classList.add(current);

  // ── State management ──────────────────────────────
  function clearState() {
    face.classList.remove(...allStates, 's-wtf');
  }

  function setState(state) {
    clearState();
    current = state;
    face.classList.add(current);
  }

  function reactFor(state, duration, returnTo = 's-happy') {
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

  function glitch(cb) {
    face.classList.add('glitch-shift');
    setTimeout(() => {
      face.classList.remove('glitch-shift');
      if (cb) cb();
    }, 80);
  }

  // ── Blink ──────────────────────────────────────────
  function scheduleBlink() {
    clearTimeout(blinkTimer);
    blinkTimer = setTimeout(() => {
      if (current !== 's-sleepy' && current !== 's-wtf' && current !== 's-dead') {
        face.classList.add('blinking');
        setTimeout(() => face.classList.remove('blinking'), 120);
      }
      scheduleBlink();
    }, 3000 + Math.random() * 4000);
  }

  // ── Eye tracking with lerp ─────────────────────────
  let eyeTargetX = 0, eyeTargetY = 0, eyeCurX = 0, eyeCurY = 0;

document.addEventListener('mousemove', e => {
    const hr = hero.getBoundingClientRect();
    if (e.clientX < hr.left || e.clientX > hr.right + 60 ||
        e.clientY < hr.top  || e.clientY > hr.bottom) return;
            const fr  = face.getBoundingClientRect();
    const fcx = fr.left + fr.width  / 2;
    const fcy = fr.top  + fr.height / 2;
    const dx  = e.clientX - fcx;
    const dy  = e.clientY - fcy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const factor = Math.min(dist / 300, 1);
    eyeTargetX = (dx / dist) * factor * 12;
    eyeTargetY = (dy / dist) * factor * 9;
  }, { passive: true });

  (function lerpEyes() {
    if (current !== 's-wtf' && current !== 's-sleepy' && current !== 's-dead') {
      eyeCurX += (eyeTargetX - eyeCurX) * 0.12;
      eyeCurY += (eyeTargetY - eyeCurY) * 0.12;
      eyeL.style.transform = `translate(${eyeCurX}px, ${eyeCurY}px)`;
      eyeR.style.transform = `translate(${eyeCurX}px, ${eyeCurY}px)`;
    }
    requestAnimationFrame(lerpEyes);
  })();

  // ── Idle eye wander ────────────────────────────────
  function startWander() {
    if (!isIdle) return;
    const positions = [
      { x: -10, y: 0 }, { x: 10, y: 0 },
      { x: 0,  y: -6 }, { x: -8, y: 4 }, { x: 8, y: 4 }
    ];
    let i = 0;
    const wander = setInterval(() => {
      if (!isIdle) { clearInterval(wander); eyeTargetX = 0; eyeTargetY = 0; return; }
      const p = positions[i % positions.length];
      eyeTargetX = p.x; eyeTargetY = p.y;
      i++;
    }, 1200);
  }

  // ── Auto cycle ────────────────────────────────────
  function scheduleAuto() {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(() => {
      if (isReacting || isIdle) { scheduleAuto(); return; }

      const roll = Math.random();

      // 4th wall break — 4% chance
      if (roll < 0.04) {
        glitch(() => {
          isReacting = true;
          eyeTargetX = 0; eyeTargetY = 0;
          text.textContent = 'PST';
          clearState(); face.classList.add('s-wtf'); current = 's-wtf';
          setTimeout(() => {
            text.textContent = 'YOU';
            setTimeout(() => {
              isReacting = false;
              glitch(() => setState('s-happy'));
              scheduleAuto();
            }, 900);
          }, 700);
        });
        return;
      }

      // WTF — 5% chance
      if (roll < 0.09) {
        glitch(() => {
          isReacting = true;
          text.textContent = wtfWords[Math.floor(Math.random() * wtfWords.length)];
          clearState(); face.classList.add('s-wtf'); current = 's-wtf';
          setTimeout(() => {
            isReacting = false;
            glitch(() => setState('s-happy'));
            scheduleAuto();
          }, 1200);
        });
        return;
      }

      // Normal cycle
      const pool = [
        's-happy','s-happy','s-happy',
        's-pleased','s-pleased',
        's-annoyed',
        's-squint',
        's-thinking',
        's-wink',
        's-surprised',
        's-dead','s-grin'
      ].filter(s => s !== current);

      const next = pool[Math.floor(Math.random() * pool.length)];
      const snapBack = ['s-surprised','s-dead','s-grin','s-wink'].includes(next);

      glitch(() => {
        if (snapBack) {
          isReacting = true;
          setState(next);
          setTimeout(() => {
            isReacting = false;
            setState('s-happy');
            scheduleAuto();
          }, 1000);
        } else {
          setState(next);
          scheduleAuto();
        }
      });

    }, 2200 + Math.random() * 2200);
  }

  // ── Hero enter/leave ──────────────────────────────
hero.addEventListener('mouseleave', e => {
    // Don't trigger if cursor moved onto the face itself
    if (face.contains(e.relatedTarget) || e.relatedTarget === face) return;
    eyeTargetX = 0; eyeTargetY = 0;
    if (!isReacting) setState('s-annoyed');
  });
  hero.addEventListener('mouseenter', () => {
    if (!isReacting && !isIdle) setState('s-happy');
  });

  // ── CTA buttons ───────────────────────────────────
  document.querySelector('a[href="#projects"].btn')
    ?.addEventListener('mouseenter', () => reactFor('s-grin', 800));
  document.querySelector('a[href="#contact"].btn')
    ?.addEventListener('mouseenter', () => reactFor('s-surprised', 800));

  // ── Nav link reactions ────────────────────────────
  const navReactions = {
    '#about':    's-thinking',
    '#skills':   's-squint',
    '#projects': 's-grin',
    '#contact':  's-surprised'
  };
  Object.entries(navReactions).forEach(([href, state]) => {
    document.querySelector(`.nav-links a[href="${href}"]`)
      ?.addEventListener('mouseenter', () => reactFor(state, 900));
  });

  // ── Theme toggle ──────────────────────────────────
document.getElementById('themeToggle')?.addEventListener('click', () => {
    // theme.js already toggled by now, so read the NEW value
    const nowLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (nowLight) {
      // switching TO light
      isReacting = true;
      clearState(); face.classList.add('s-annoyed'); current = 's-annoyed';
      text.style.opacity = '0';
      setTimeout(() => {
        text.textContent = 'BRIGHT';
        text.style.opacity = '1';
        clearState(); face.classList.add('s-wtf'); current = 's-wtf';
        setTimeout(() => {
          text.style.opacity = '0';
          isReacting = false;
          setState('s-annoyed');
          scheduleAuto();
        }, 1000);
      }, 300);
    } else {
      // switching TO dark
      reactFor('s-smile', 900);
    }
  });

  // ── Scroll reaction ───────────────────────────────
  const heroBottom = () => hero.getBoundingClientRect().bottom;
  window.addEventListener('scroll', () => {
    if (isReacting || isIdle) return;
    const hb = heroBottom();
    if (hb < window.innerHeight * 0.3) {
      setState('s-pleased'); // content with you reading
    } else if (hb < window.innerHeight * 0.7) {
      setState('s-happy');
    }
  }, { passive: true });

  // ── Click anywhere in hero ────────────────────────
  hero.addEventListener('click', () => {
    if (isReacting) return;
    isReacting = true;
    clearTimeout(autoTimer);
    text.textContent = '!!!';
    glitch(() => {
      clearState(); face.classList.add('s-wtf'); current = 's-wtf';
      setTimeout(() => {
        isReacting = false;
        glitch(() => setState('s-happy'));
        scheduleAuto();
      }, 900);
    });
  });

  // ── Idle detection ────────────────────────────────
  function resetIdle() {
    clearTimeout(idleTimer);
    if (isIdle) {
      isIdle = false;
      eyeTargetX = 0; eyeTargetY = 0;
      if (!isReacting) glitch(() => setState('s-happy'));
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
  document.addEventListener('keydown', resetIdle);
  document.addEventListener('click', resetIdle);

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