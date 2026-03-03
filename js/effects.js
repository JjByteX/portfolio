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

  const original    = el.innerHTML;
  const plain       = el.textContent;
  let frame         = 0;
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
  const match    = original.match(/^([^0-9]*)(\d+)([^0-9]*)$/);

  if (!match) { scramble(el); return; }

  const [, pre, num, suf] = match;
  const target = parseInt(num);
  const start  = performance.now();
  const dur    = 900;

  (function tick(now) {
    const t     = Math.min((now - start) / dur, 1);
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
      btn.style.transform  = '';
      setTimeout(() => btn.style.transition = '', 550);
    });
  });
}

// ── INTERSECTION OBSERVERS ────────────────────────────
function initObservers() {
  const labelObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('wiped');
    });
  }, { threshold: 0.8 });

  document.querySelectorAll('.section-label').forEach(el => labelObserver.observe(el));

  document.querySelectorAll('.section-title').forEach(el => {
    new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) scramble(e.target);
      });
    }, { threshold: 0.6 }).observe(el);
  });

  document.querySelectorAll('.stat-val').forEach(el => {
    new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) countUp(e.target);
      });
    }, { threshold: 0.8 }).observe(el);
  });

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

  if (!window.matchMedia('(pointer: fine)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive: true });

  (function lerp() {
    rx += (mx - rx) * 0.28;
    ry += (my - ry) * 0.28;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(lerp);
  })();

  const hoverSelector = 'a, button, [data-modal], .chip, .proj-filter-btn, .social-item, .contact-link, #ghChartWrap';

  document.querySelectorAll(hoverSelector).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

  document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget) document.body.classList.add('cursor-hidden');
  });

  document.addEventListener('mouseover', () => {
    document.body.classList.remove('cursor-hidden');
  });
}

// ── HERO FACE ──────────────────────────────────────────────────────────────
// INTERACTION MAP
// ─────────────────────────────────────────────────────────────────────────
// Mouse enters hero              → s-eager     circles + wider smile + bounce
// Mouse leaves hero              → s-pleased   ^^ eyes + flat line
// Cursor between the two eyes    → cross-eyed  both eyes drift inward (lerp only)
// Cursor ≤88px from face center  → s-grin      ^^ eyes + bean smile, 900ms
// Hover "VIEW PROJECTS"          → s-squint    arc eyes + arc smile, 1.1s
// Hover "CONTACT ME"             → s-surprised dot eyes + O mouth, 950ms
// Theme toggle → light mode      → s-annoyed   flat eyes + flat mouth, 1.6s
// Theme toggle → dark mode       → s-pleased   ^^ satisfied, 900ms
// Click anywhere in hero         → surprised → dead → eager  (3-beat comic)
// Idle 7s                        → s-sleepy    droopy eyes, slow transition
// Idle 32s                       → PONG        vintage screensaver inside face
// Wake from idle / pong          → surprised → eager
// Auto-cycle every 3–6s          → happy / eager / pleased / thinking (drift)
// Auto rare ~5%                  → s-dead flash (820ms)
// Auto rare ~4%                  → s-wtf text  (1.1s)
// ─────────────────────────────────────────────────────────────────────────
function initHeroFace() {
  const face = document.getElementById('heroFace');
  const text = face?.querySelector('.hf-text');
  const eyeL = face?.querySelector('.hf-eye-l');   // translate lives on the wrapper
  const eyeR = face?.querySelector('.hf-eye-r');   // scaleY blink lives on .hf-pupil
  const hero = document.getElementById('hero');
  if (!face || !text || !eyeL || !eyeR || !hero) return;

  // ── Mobile guard ──────────────────────────────────────────────────────
  function isFaceVisible() {
    return window.getComputedStyle(face).display !== 'none';
  }

  if (!isFaceVisible()) {
    const ro = new ResizeObserver(() => {
      if (isFaceVisible()) { ro.disconnect(); bootFace(); }
    });
    ro.observe(document.documentElement);
    return;
  }

  bootFace();

  // ────────────────────────────────────────────────────────────────────
  function bootFace() {

    // ── Constants ───────────────────────────────────────────────────────
const ALL_STATES = [
      's-happy', 's-eager', 's-pleased', 's-smile',
      's-grin', 's-squint', 's-surprised', 's-sleepy',
's-annoyed', 's-thinking', 's-wink', 's-dead', 's-wtf', 's-sad', 's-starstruck', 's-nervous', 's-blinded', 's-reading'
    ];

const NO_BLINK = new Set([
      's-sleepy', 's-wtf', 's-dead', 's-squint',
      's-annoyed', 's-pleased', 's-grin', 's-thinking', 's-blinded', 's-reading'
    ]);

const NO_TRACK = new Set([
      's-wtf', 's-sleepy', 's-dead', 's-squint',
      's-annoyed', 's-pleased', 's-grin', 's-thinking',
      's-pong', 's-reading'
    ]);

    const WTF_WORDS = ['WTF', '???', 'HUH', '!!!', 'OOF', 'NOPE', 'BAKA'];

    // ── State vars ────────────────────────────────────────────────────
let current    = 's-happy';
    let isReacting = false;
    let isIdle     = false;
    let isPonging  = false;
    let isBlinded  = false;
    let idleTimer  = null;
    let pongTimer  = null;
    let autoTimer  = null;
    let blinkTimer = null;
    let lastMX     = -9999;
    let lastMY     = -9999;
    let lerpActive = true;
let peekTimer  = null;
    let fromNav    = false;
    let navHovered = false;
    let navTargetX = null;
    let navTargetY = null;

    // ── State helpers ─────────────────────────────────────────────────
    function clearState() {
      face.classList.remove(...ALL_STATES);
      text.textContent = '';
    }

    function setState(state) {
      clearState();
      current = state;
      face.classList.add(current);
    }

function reactFor(state, duration, returnTo = 's-eager') {
      if (isReacting || isBlinded) return;
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
      }, 75);
    }

    // ── Blink ─────────────────────────────────────────────────────────
    function scheduleBlink() {
      clearTimeout(blinkTimer);
      blinkTimer = setTimeout(() => {
        if (!NO_BLINK.has(current) && !isPonging) {
          face.classList.add('blinking');
          setTimeout(() => face.classList.remove('blinking'), 70);
        }
        scheduleBlink();
      }, 2600 + Math.random() * 4000);
    }

    // ── Eye tracking + cross-eyed ──────────────────────────────────────
    // NOTE: transform is written to .hf-eye (the wrapper), NOT .hf-pupil.
    // This keeps tracking translate() and blink scaleY() on separate
    // elements so they never overwrite each other.
let eyeTargetX  = 0, eyeTargetY  = 0;
    let eyeCurX     = 0, eyeCurY     = 0;
    let isCrossZone = false;

    // Shy drift — face moves away from cursor when it gets close
    // Uses standalone CSS 'translate' property so it never conflicts
    // with 'transform' used by hover bob and Web Animations one-shots.
    let shyTargetX = 0, shyTargetY = 0;
    let shyCurX    = 0, shyCurY    = 0;
    const SHY_ZONE = 285; // px — shy starts here
    const SHY_MAX  = 170;  // px — max drift distance

    function onMouseMove(e) {
      lastMX = e.clientX;
      lastMY = e.clientY;

      const fr   = face.getBoundingClientRect();
      const fcx  = fr.left + fr.width  / 2;
      const fcy  = fr.top  + fr.height / 2;
      const dx   = e.clientX - fcx;
      const dy   = e.clientY - fcy;
      const dist = Math.hypot(dx, dy) || 1;

isCrossZone = (Math.abs(dx) < 42 && dy > -70 && dy < 20 && dist < 88);

      // Grin trigger — cursor caught him
if (dist < 88 && !isCrossZone && !isReacting && !isIdle && current !== 's-grin' && !fromNav) {
        shyTargetX = 0;
        shyTargetY = 0;
        triggerFaceAnim(ANIM_TREMBLE, 550);
        reactFor('s-grin', 900, 's-eager');
        return;
      }

// Shy zone — drift away from cursor, stronger as it gets closer
      if (dist < SHY_ZONE && !isIdle && !isPonging && !fromNav) {
        const depth        = 1 - ((dist - 88) / (SHY_ZONE - 88));
        const clampedDepth = Math.max(0, Math.min(1, depth));
        shyTargetX = -(dx / dist) * clampedDepth * SHY_MAX;
        shyTargetY = -(dy / dist) * clampedDepth * SHY_MAX;

        // Switch to nervous face when entering shy zone
        if (!isReacting && current !== 's-nervous' && current !== 's-grin') {
          setState('s-nervous');
        }
      } else {
        shyTargetX = 0;
        shyTargetY = 0;

        // Leave shy zone — return to eager if we were nervous
        if (!isReacting && current === 's-nervous') {
          setState('s-eager');
        }
      }

      const pull = Math.min(dist / 280, 1);
      eyeTargetX = (dx / dist) * pull * 11;
      eyeTargetY = (dy / dist) * pull * 8;
    }

    document.addEventListener('mousemove', onMouseMove, { passive: true });

    (function lerpEyes() {
      if (!lerpActive) return;

      if (!NO_TRACK.has(current)) {
        if (isCrossZone) {
          const fr     = face.getBoundingClientRect();
          const fcx    = fr.left + fr.width / 2;
          const inward = 20 + Math.max(0, (42 - Math.abs(lastMX - fcx)) * 0.5);
          eyeCurX += (0 - eyeCurX) * 0.15;
          eyeCurY += (eyeTargetY - eyeCurY) * 0.12;
          eyeL.style.transform = `translate(${inward}px, ${eyeCurY}px)`;
          eyeR.style.transform = `translate(${-inward}px, ${eyeCurY}px)`;
} else if (navHovered) {
          // Aim each eye independently at the hovered nav link position
          const fr      = face.getBoundingClientRect();
          const fcx     = fr.left + fr.width  / 2;
          const fcy     = fr.top  + fr.height / 2;
          const eyeLCx  = fr.left + 67;  // approx left eye center X
          const eyeRCx  = fr.left + 193; // approx right eye center X

          // Target is the nav link's center
          const tx = navTargetX ?? fcx;
          const ty = navTargetY ?? (fr.top - 40);

          // Each eye looks from its own position toward the target
          const dxL = tx - eyeLCx;
          const dyL = ty - fcy;
          const dxR = tx - eyeRCx;
          const dyR = ty - fcy;
          const distL = Math.hypot(dxL, dyL) || 1;
          const distR = Math.hypot(dxR, dyR) || 1;
          const pullL = Math.min(distL / 280, 1);
          const pullR = Math.min(distR / 280, 1);

const tEyeLX = (dxL / distL) * pullL * 22;
          const tEyeLY = (dyL / distL) * pullL * 52;
          const tEyeRX = (dxR / distR) * pullR * 22;
          const tEyeRY = (dyR / distR) * pullR * 52;

          eyeCurX += (tEyeLX - eyeCurX) * 0.08;
          eyeCurY += (tEyeLY - eyeCurY) * 0.08;
          let eyeCurRX = parseFloat(eyeR.dataset.cx || 0);
          let eyeCurRY = parseFloat(eyeR.dataset.cy || 0);
          eyeCurRX += (tEyeRX - eyeCurRX) * 0.08;
          eyeCurRY += (tEyeRY - eyeCurRY) * 0.08;
          eyeR.dataset.cx = eyeCurRX;
          eyeR.dataset.cy = eyeCurRY;

          eyeL.style.transform = `translate(${eyeCurX}px, ${eyeCurY}px)`;
          eyeR.style.transform = `translate(${eyeCurRX}px, ${eyeCurRY}px)`;
        } else {
          eyeCurX += (eyeTargetX - eyeCurX) * 0.12;
          eyeCurY += (eyeTargetY - eyeCurY) * 0.12;
          eyeL.style.transform = `translate(${eyeCurX}px, ${eyeCurY}px)`;
          eyeR.style.transform = `translate(${eyeCurX}px, ${eyeCurY}px)`;
        }
      }

// Shy drift — smooth lerp on standalone translate property
      shyCurX += (shyTargetX - shyCurX) * 0.06;
      shyCurY += (shyTargetY - shyCurY) * 0.06;

      // Only apply if meaningful — avoids constantly dirtying style
      if (Math.abs(shyCurX) > 0.05 || Math.abs(shyCurY) > 0.05) {
        face.style.translate = `${shyCurX.toFixed(2)}px ${shyCurY.toFixed(2)}px`;
      } else {
        face.style.translate = '';
      }

      requestAnimationFrame(lerpEyes);
    })();

    new ResizeObserver(() => {
      lerpActive = isFaceVisible();
      if (lerpActive) lerpEyes();
    }).observe(document.documentElement);

    // ── Idle eye wander ───────────────────────────────────────────────
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

    // ── Auto-cycle ────────────────────────────────────────────────────
function scheduleAuto() {
      clearTimeout(autoTimer);
      autoTimer = setTimeout(() => {
        if (isReacting || isIdle || isBlinded) { scheduleAuto(); return; }

        const roll = Math.random();

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

if (roll < 0.09) {
  glitch(() => {
    isReacting = true;
    const word = WTF_WORDS[Math.floor(Math.random() * WTF_WORDS.length)];
    clearState();
    face.classList.add('s-wtf');
    current = 's-wtf';
    text.textContent = word;  // ← set AFTER clearState, not before
            setTimeout(() => {
              isReacting = false;
              glitch(() => setState('s-eager'));
              scheduleAuto();
            }, 1100);
          });
          return;
        }

        const pool = [
          's-eager', 's-eager', 's-eager',
          's-happy', 's-happy',
          's-pleased',
          's-thinking'
        ].filter(s => s !== current);

const next = pool[Math.floor(Math.random() * pool.length)];
        setState(next);
        scheduleAuto();

      }, 3200 + Math.random() * 2800);
    }

// ── Physical face animations ──────────────────────────────────────
// Uses Web Animations API for one-shots — runs completely separately
// from the CSS breathing loop, so they never conflict.
// A cooldown flag prevents rapid cursor swipes from stacking reactions.

let faceAnimCooldown = false;
let faceAnimPlayer   = null; // current one-shot player

function triggerFaceAnim(keyframes, duration, easing = 'cubic-bezier(0.16,1,0.3,1)') {
  if (faceAnimCooldown) return;
  faceAnimCooldown = true;

  // Cancel any in-progress one-shot cleanly
  if (faceAnimPlayer) {
    faceAnimPlayer.cancel();
    faceAnimPlayer = null;
  }

  faceAnimPlayer = face.animate(keyframes, {
    duration,
    easing,
    fill: 'none', // never hold end state — let the CSS breathe loop take over
  });

  faceAnimPlayer.onfinish = () => {
    faceAnimPlayer = null;
  };

  // Cooldown window — ignore rapid re-triggers during this time
  setTimeout(() => { faceAnimCooldown = false; }, duration * 0.6);
}

// K-VRC reacts with his whole body — bouncy, snappy, robot energy.

const ANIM_LUNGE = [
  // Anticipation: compress down
  { transform: 'translate(0, 0)         scaleX(1)    scaleY(1)',    offset: 0    },
  { transform: 'translate(0, 6px)       scaleX(1.1)  scaleY(0.88)', offset: 0.12 },
  // Launch: pop UP and LEFT toward cursor
  { transform: 'translate(-10px, -14px) scaleX(0.88) scaleY(1.15)', offset: 0.30 },
  { transform: 'translate(-6px, -6px)   scaleX(1.06) scaleY(0.94)', offset: 0.50 },
  { transform: 'translate(-4px, -10px)  scaleX(0.95) scaleY(1.06)', offset: 0.65 },
  { transform: 'translate(-1px, -4px)   scaleX(1.02) scaleY(0.98)', offset: 0.80 },
  { transform: 'translate(0, 0)         scaleX(1)    scaleY(1)',    offset: 1    },
];

const ANIM_TREMBLE = [
  // Tight, barely-contained — thruster stutter, not a shake
  { transform: 'translate(0, 0)      scaleX(1)    scaleY(1)',    offset: 0    },
  { transform: 'translate(-2px, -1px) scaleX(1.03) scaleY(0.98)', offset: 0.10 },
  { transform: 'translate(2px, -2px)  scaleX(0.98) scaleY(1.03)', offset: 0.22 },
  { transform: 'translate(-2px, -1px) scaleX(1.02) scaleY(0.98)', offset: 0.34 },
  { transform: 'translate(2px, -2px)  scaleX(0.98) scaleY(1.02)', offset: 0.46 },
  { transform: 'translate(-1px, -1px) scaleX(1.01) scaleY(0.99)', offset: 0.60 },
  { transform: 'translate(1px, -1px)  scaleX(0.99) scaleY(1.01)', offset: 0.74 },
  { transform: 'translate(0, 0)       scaleX(1)    scaleY(1)',    offset: 1    },
];


const ANIM_WILT = [
  // K-VRC deflates — thrusters sputter, he sinks and bobs sadly.
  { transform: 'translate(0, 0)     scaleX(1)    scaleY(1)',    offset: 0    },
  { transform: 'translate(0, 12px)  scaleX(1.1)  scaleY(0.86)', offset: 0.30 },
  // Sad little secondary bounce — weight with no energy behind it
  { transform: 'translate(0, 6px)   scaleX(0.96) scaleY(1.05)', offset: 0.52 },
  { transform: 'translate(0, 10px)  scaleX(1.04) scaleY(0.96)', offset: 0.68 },
  { transform: 'translate(0, 4px)   scaleX(0.99) scaleY(1.01)', offset: 0.84 },
  { transform: 'translate(0, 0)     scaleX(1)    scaleY(1)',    offset: 1    },
];

// Start the always-on breathing base layer
face.classList.add('hf-idle-breathe');

    // ── Hero enter / leave ────────────────────────────────────────────
hero.addEventListener('mouseenter', (e) => {
  const wasAway = (current === 's-sad' || isIdle || isPonging) && !fromNav;
  if (wasAway) triggerFaceAnim(ANIM_LUNGE, 700);
            if (isIdle || isPonging) {
        stopPong();
        isIdle     = false;
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

hero.addEventListener('mouseleave', (e) => {
  const leftSide      = e.clientX <= 8;
  const rightSide     = e.clientX >= window.innerWidth - 8;
  const topExit       = e.clientY <= 8;
  const bottomExit    = e.clientY >= window.innerHeight - 8;
  const exitedViewport = leftSide || rightSide || topExit || bottomExit;
  const likelySideClip = !exitedViewport && e.clientY < window.innerHeight * 0.6;
  if (likelySideClip) return;

  eyeTargetX  = 0;
  eyeTargetY  = 0;
  isCrossZone = false;
  shyTargetX  = 0;
  shyTargetY  = 0;

  // Delay — if cursor went to nav, fromNav is already true, skip wilt
setTimeout(() => {
    if (fromNav) return;
    triggerFaceAnim(ANIM_WILT, 650);
    if (!isReacting && !isIdle) setState('s-sad');
  }, 80);
});

// ── Nav peek — reacts from s-sad, returns to s-sad ────────────────
    // A lightweight reactFor that doesn't require isReacting to be false
    // and always returns to s-sad instead of s-eager, because the cursor
    // is outside the hero when nav is hovered.

function peekAt(state, duration = 1200) {
      if (isReacting || isPonging || isBlinded) return;
      clearTimeout(peekTimer);
      clearState();
      current = state;
      face.classList.add(current);

      peekTimer = setTimeout(() => {
        if (!isReacting && !isPonging && !isIdle) {
          setState('s-sad');
        }
      }, duration);
    }

    // Cancel peek when cursor leaves the nav entirely
    function cancelPeek() {
      clearTimeout(peekTimer);
      if (!isReacting && !isPonging && !isIdle) {
        setState('s-sad');
      }
    }


const navLinks     = document.querySelectorAll('nav .nav-links a');
    const navLinksWrap = document.querySelector('nav .nav-links');
    const navEl        = document.querySelector('nav');
    navEl?.addEventListener('mouseenter', () => { fromNav = true; });

    navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
        fromNav    = true;
        navHovered = true;
        const r    = link.getBoundingClientRect();
        navTargetX = r.left + r.width  / 2;
        navTargetY = r.top  + r.height / 2;
        const href = link.getAttribute('href');
        if      (href === '#about')    peekAt('s-pleased',    1100);
        else if (href === '#skills')   peekAt('s-squint',     1200);
        else if (href === '#projects') peekAt('s-eager',      1000);
        else if (href === '#contact')  peekAt('s-starstruck', 1600);
      });
    });

    // Only truly exit when cursor leaves the entire nav links container
    // — not on each individual link, which fires between adjacent items
    navLinksWrap?.addEventListener('mouseleave', () => {
      cancelPeek();
      navHovered = false;
      navTargetX = null;
      navTargetY = null;
      eyeR.dataset.cx = 0;
      eyeR.dataset.cy = 0;
      setTimeout(() => { fromNav = false; }, 600);
    });

    // ── CTA button hovers ─────────────────────────────────────────────
    document.querySelector('a[href="#projects"].btn')
      ?.addEventListener('mouseenter', () => reactFor('s-squint', 1100, 's-eager'));

document.querySelector('a[href="#contact"].btn')
      ?.addEventListener('mouseenter', () => reactFor('s-starstruck', 1600, 's-eager'));

    // ── Theme toggle ──────────────────────────────────────────────────
document.getElementById('themeToggle')?.addEventListener('click', () => {
      const nowLight = document.documentElement.getAttribute('data-theme') === 'light';

      if (nowLight) {
        isBlinded  = true;
        isReacting = true;
        clearTimeout(autoTimer);

        // Step 1 — WTF flash first, like the brightness broke his brain
        const word = WTF_WORDS[Math.floor(Math.random() * WTF_WORDS.length)];
        clearState();
        face.classList.add('s-wtf');
        current = 's-wtf';
        text.textContent = word;

        // Step 2 — snap to blinded
        setTimeout(() => {
          glitch(() => setState('s-blinded'));

// Step 3 — blink burst after holding the grimace
          setTimeout(() => {
            // Switch to squint — eyes recovering but not fully open yet
            setState('s-sleepy');
            let blinks = 0;
            const blinkBurst = setInterval(() => {
              face.classList.add('blinking');
              setTimeout(() => face.classList.remove('blinking'), 60);
              blinks++;
              if (blinks >= 4) {
                clearInterval(blinkBurst);

                // Step 4 — return to annoyed on his own, unlock
                setTimeout(() => {
                  isReacting = false;
                  isBlinded  = false;
                  glitch(() => setState('s-annoyed'));
                  setTimeout(() => {
                    setState('s-sad');
                    scheduleAuto();
                  }, 1400);
                }, 400);
              }
            }, 180);
          }, 1200);

        }, 600);

      } else {
        // Dark mode restored — relief
        isBlinded  = false;
        isReacting = false;
        clearTimeout(autoTimer);
        setState('s-pleased');
        setTimeout(() => {
          setState('s-sad');
          scheduleAuto();
        }, 900);
      }
    });

    // ── Click in hero — 3-beat comic ──────────────────────────────────
    hero.addEventListener('click', () => {
      if (isPonging) { stopPong(); return; }
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

    // ── Idle detection ────────────────────────────────────────────────
    function resetIdle() {
      clearTimeout(idleTimer);
      clearTimeout(pongTimer);

      if (isPonging) {
        stopPong();
      }

      if (isIdle) {
        isIdle     = false;
        eyeTargetX = 0;
        eyeTargetY = 0;
        if (!isReacting) {
          setState('s-surprised');
          setTimeout(() => { if (!isReacting) setState('s-eager'); }, 520);
        }
      }

      // Tier 1: go sleepy after 7s
      idleTimer = setTimeout(() => {
        if (!isReacting) {
          isIdle = true;
          glitch(() => setState('s-sleepy'));
          startWander();

          // Tier 2: launch Pong after 25s more (32s total idle)
          pongTimer = setTimeout(() => {
            if (isIdle && !isReacting) startPong();
          }, 3000);
        }
      }, 1500);
    }

    document.addEventListener('mousemove', resetIdle, { passive: true });
    document.addEventListener('keydown',   resetIdle);
    document.addEventListener('click',     resetIdle);

    // ── Text selection display ─────────────────────────────────────────
    // When user highlights text inside #hero, show it on the face screen.
 document.addEventListener('selectionchange', () => {
      if (isPonging || isBlinded) return;

      const sel      = window.getSelection();
      const selected = sel?.toString().trim();

      if (selected && selected.length > 0) {
        // Check if ANY part of the selection touches the hero section
        // Using getRangeAt is more reliable than anchorNode during live drag
        let insideHero = false;
        try {
          const range    = sel.getRangeAt(0);
          const rect     = range.getBoundingClientRect();
          const heroRect = hero.getBoundingClientRect();
          insideHero = (
            rect.top    < heroRect.bottom &&
            rect.bottom > heroRect.top    &&
            rect.left   < heroRect.right  &&
            rect.right  > heroRect.left
          );
        } catch (e) {
          insideHero = false;
        }

        if (!insideHero) return;

        // Show full text — no truncation
        const display = selected.toUpperCase();

        if (current !== 's-reading') {
          clearState();
          current = 's-reading';
          face.classList.add('s-reading');
        }

text.textContent = display;

        // Dynamically scale font to fill available space
const len = display.length;
        let fontSize;
        if      (len <= 4)   fontSize = '4.8rem';
        else if (len <= 8)   fontSize = '3.6rem';
        else if (len <= 16)  fontSize = '2.6rem';
        else if (len <= 30)  fontSize = '1.8rem';
        else if (len <= 60)  fontSize = '1.3rem';
        else if (len <= 120) fontSize = '0.9rem';
        else                 fontSize = '0.62rem';

        text.style.fontSize = fontSize;

      } else {
if (current === 's-reading') {
          text.textContent = '';
          text.style.fontSize = '';
          setState('s-eager');
          scheduleAuto();
        }
      }
    });

    if (sessionStorage.getItem('introDone')) {
      face.classList.add('intro-arrived');
      face.style.opacity = '1';
    }

// ── Boot ──────────────────────────────────────────────
    resetIdle();
    scheduleBlink();

    if (sessionStorage.getItem('introDone')) {
      // Returning visitor — start normally
      setState(current);
      scheduleAuto();
    } else {
      // First visit — intro is playing. Hold state until the face arrives.
      const introWatcher = new MutationObserver(() => {
        if (face.classList.contains('intro-arrived')) {
          introWatcher.disconnect();
          // Let intro's s-grin show for a beat, then hand off to auto-cycle
          setTimeout(() => {
            if (!isReacting) {
              current = 's-eager';
              face.classList.remove('s-grin');
              face.classList.add('s-eager');
              scheduleAuto();
            }
          }, 900);
        }
      });
      introWatcher.observe(face, { attributes: true, attributeFilter: ['class'] });
    }

    // ════════════════════════════════════════════════════════════════════
    //  PONG SCREENSAVER
    //  Renders inside #heroFace on its own <canvas>.
    //  Both paddles are AI-controlled — this is a screensaver, not a game.
    //  The existing .hf-scanline overlay stays on top for the CRT look.
    //  Reads --text CSS var for color so light/dark theme works for free.
    // ════════════════════════════════════════════════════════════════════

    let pongCanvas    = null;
    let pongRAF       = null;
    let pongWakeLabel = null;

function startPong() {
      if (isPonging) return;
      isPonging = true;

      // ── Phase 1: glitch flash ────────────────────────────────────────
      face.classList.add('glitch-shift');
      setTimeout(() => face.classList.remove('glitch-shift'), 80);

      // ── Phase 2: face elements fade out ─────────────────────────────
      face.querySelectorAll('.hf-eye, .hf-mouth, .hf-text').forEach(el => {
        el.style.transition = 'opacity 0.2s ease';
        el.style.opacity    = '0';
      });

      // ── Phase 3: CRT scanline wipe ───────────────────────────────────
      const crtWipe = document.createElement('div');
      crtWipe.className = 'hf-crt-wipe';
      face.appendChild(crtWipe);
      setTimeout(() => crtWipe.remove(), 400);

      // ── Canvas setup — delayed until after wipe ──────────────────────
      pongCanvas        = document.createElement('canvas');
      pongCanvas.width  = face.offsetWidth  || 260;
      pongCanvas.height = face.offsetHeight || 260;
      Object.assign(pongCanvas.style, {
        position: 'absolute',
        top:      '0',
        left:     '0',
        width:    '100%',
        height:   '100%',
        zIndex:   '1',
        display:  'block',
      });
// Canvas starts invisible — fades in after wipe
      pongCanvas.style.opacity    = '0';
      pongCanvas.style.transition = 'opacity 0.25s ease';
      face.appendChild(pongCanvas);

      // Force dark background on face during pong — restored on stopPong
      face.dataset.prevBg = face.style.background || '';
      face.style.background = 'rgb(8, 8, 16)';

      // Fade canvas in after the scanline wipe passes
      setTimeout(() => {
        pongCanvas.style.opacity = '1';
      }, 280);

      // ── "CLICK TO WAKE" label ─────────────────────────────────────────
      pongWakeLabel = document.createElement('span');
      pongWakeLabel.textContent = '[ ACTIVITY TO WAKE ]';
      Object.assign(pongWakeLabel.style, {
        position:     'absolute',
        bottom:       '10px',
        left:         '50%',
        transform:    'translateX(-50%)',
        fontFamily:   'var(--font-m)',
        fontSize:     '0.42rem',
        letterSpacing:'0.18em',
        color:        'rgba(255,10,55,0.5)',
        whiteSpace:   'nowrap',
        zIndex:       '4',
        pointerEvents:'none',
animation:    'hfWakeBlink 1.4s ease-in-out infinite',
        opacity:      '0',
        transition:   'opacity 0.3s ease',
            });
      face.appendChild(pongWakeLabel);
      setTimeout(() => {
        if (pongWakeLabel) pongWakeLabel.style.opacity = '1';
      }, 500);

      // Inject the blink keyframe once
      if (!document.getElementById('pongWakeStyle')) {
        const s = document.createElement('style');
        s.id = 'pongWakeStyle';
        s.textContent = `
          @keyframes hfWakeBlink {
            0%, 100% { opacity: 0.5; }
            50%       { opacity: 0.1; }
          }
        `;
        document.head.appendChild(s);
      }

      const ctx = pongCanvas.getContext('2d');
      const W   = pongCanvas.width;
      const H   = pongCanvas.height;

// Pong is always a dark CRT screen — always draw with light color
      // regardless of theme. The face background is forced dark anyway.
      function textColor() {
        return '#e2e2f0';
      }

      // ── Game state ────────────────────────────────────────────────────
const PAD_W = 5, PAD_H = 36, PAD_SPEED = 1.7;
      const BALL_SIZE = 5;

      const state = {
        ball: {
          x:  W / 2,
          y:  H / 2,
vx: (Math.random() > 0.5 ? 1 : -1) * 1.8,
vy: (Math.random() * 2 - 1) * 1.4,
          trail: [],  // { x, y } history for motion blur
        },
        padL: { x: 14,      y: H / 2 - PAD_H / 2 },
        padR: { x: W - 14 - PAD_W, y: H / 2 - PAD_H / 2 },
        score: { l: 0, r: 0 },
      };

// ── AI paddles — each has its own personality ──────────────────────
const aiL = {
  speed:      PAD_SPEED * 0.82,
  lag:        0,
  slop:       14,
  aimOffset:  0,
};
const aiR = {
  speed:      PAD_SPEED * 1.08,
  lag:        0,
  slop:       8,
  aimOffset:  0,
};

// Randomise aim offsets when ball resets so each rally looks different
function randomiseAI() {
  aiL.aimOffset = (Math.random() - 0.5) * PAD_H * 0.55;
  aiR.aimOffset = (Math.random() - 0.5) * PAD_H * 0.45;
}
randomiseAI();

function moveAI(pad, ai, targetY) {
  // Smooth the AI's perceived target (simulates reaction lag)
  ai.lag += (targetY + ai.aimOffset - ai.lag) * 0.07;

  const center = pad.y + PAD_H / 2;
  const diff   = ai.lag - center;

  // Dead-zone: ignore tiny deviations (makes movement look intentional)
  if (Math.abs(diff) < ai.slop) return;

  const jitter = (Math.random() - 0.5) * 1.4;
  const step   = Math.sign(diff) * Math.min(Math.abs(diff), ai.speed + jitter);
  pad.y = Math.max(0, Math.min(H - PAD_H, pad.y + step));
}

      // ── Score flash ───────────────────────────────────────────────────
      let scoreFlash = 0; // frames remaining for score flash highlight

function resetBall(direction) {
  state.ball.x     = W / 2;
  state.ball.y     = H / 2;
state.ball.vx = direction * (1.6 + Math.random() * 0.4);
state.ball.vy = (Math.random() * 2 - 1) * 1.6;
  state.ball.trail = [];
  scoreFlash       = 28;
  randomiseAI();   // ← new: fresh aim offsets each rally
}

      // ── Draw frame ────────────────────────────────────────────────────
      function drawFrame() {
        const b   = state.ball;
        const col = textColor();

// Always opaque dark — pong is a CRT screen, never light mode
        ctx.fillStyle = 'rgba(8, 8, 16, 0.88)';
        ctx.fillRect(0, 0, W, H);

        // Centre dashed divider
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = `rgba(${hexToRgb(col)}, 0.18)`;
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(W / 2, 0);
        ctx.lineTo(W / 2, H);
        ctx.stroke();
        ctx.setLineDash([]);

        // Score
        const scoreCol = scoreFlash > 0
          ? `rgba(255,10,55,${0.4 + (scoreFlash / 28) * 0.6})`
          : `rgba(${hexToRgb(col)}, 0.55)`;
        ctx.fillStyle  = scoreCol;
        ctx.font       = `700 13px 'Share Tech Mono', monospace`;
        ctx.textAlign  = 'center';
        ctx.fillText(state.score.l, W / 2 - 24, 20);
        ctx.fillText(state.score.r, W / 2 + 24, 20);

        // Paddles
        ctx.fillStyle = col;
        ctx.fillRect(state.padL.x, state.padL.y, PAD_W, PAD_H);
        ctx.fillRect(state.padR.x, state.padR.y, PAD_W, PAD_H);

        // Ball trail (older = more transparent)
        b.trail.forEach((pt, i) => {
          const alpha = (i / b.trail.length) * 0.35;
          ctx.fillStyle = `rgba(${hexToRgb(col)}, ${alpha})`;
          const size    = BALL_SIZE * (i / b.trail.length);
          ctx.fillRect(pt.x - size / 2, pt.y - size / 2, size, size);
        });

        // Ball
        ctx.fillStyle = col;
        ctx.fillRect(b.x - BALL_SIZE / 2, b.y - BALL_SIZE / 2, BALL_SIZE, BALL_SIZE);
      }

      // ── Physics tick ──────────────────────────────────────────────────
      function tick() {
        if (!isPonging) return;

        const b = state.ball;

        // Trail
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 10) b.trail.shift();

        // Move ball
        b.x += b.vx;
        b.y += b.vy;

        // Top / bottom wall bounce
        if (b.y - BALL_SIZE / 2 <= 0) {
          b.y  = BALL_SIZE / 2;
          b.vy = Math.abs(b.vy);
        }
        if (b.y + BALL_SIZE / 2 >= H) {
          b.y  = H - BALL_SIZE / 2;
          b.vy = -Math.abs(b.vy);
        }

        // Paddle collision — left
        if (
          b.x - BALL_SIZE / 2 <= state.padL.x + PAD_W &&
          b.x + BALL_SIZE / 2 >= state.padL.x &&
          b.y >= state.padL.y &&
          b.y <= state.padL.y + PAD_H
        ) {
          b.x  = state.padL.x + PAD_W + BALL_SIZE / 2;
          b.vx = Math.abs(b.vx) * 1.04; // tiny speed up on each hit
          // Angle based on where it hit the paddle
          const hitPos = (b.y - (state.padL.y + PAD_H / 2)) / (PAD_H / 2);
          b.vy = hitPos * 3.2;
        }

        // Paddle collision — right
        if (
          b.x + BALL_SIZE / 2 >= state.padR.x &&
          b.x - BALL_SIZE / 2 <= state.padR.x + PAD_W &&
          b.y >= state.padR.y &&
          b.y <= state.padR.y + PAD_H
        ) {
          b.x  = state.padR.x - BALL_SIZE / 2;
          b.vx = -Math.abs(b.vx) * 1.04;
          const hitPos = (b.y - (state.padR.y + PAD_H / 2)) / (PAD_H / 2);
          b.vy = hitPos * 3.2;
        }

        // Cap max speed so it never becomes untrackable
        const maxSpeed = 6;
        const speed    = Math.hypot(b.vx, b.vy);
        if (speed > maxSpeed) {
          b.vx = (b.vx / speed) * maxSpeed;
          b.vy = (b.vy / speed) * maxSpeed;
        }

        // Score — ball exits left or right
        if (b.x < 0) {
          state.score.r++;
          resetBall(1);
        } else if (b.x > W) {
          state.score.l++;
          resetBall(-1);
        }

        if (scoreFlash > 0) scoreFlash--;

        // AI paddles track the ball
moveAI(state.padL, aiL, b.y);
moveAI(state.padR, aiR, b.y);

        drawFrame();
        pongRAF = requestAnimationFrame(tick);
      }

      pongRAF = requestAnimationFrame(tick);
    }

    // ── Stop Pong ─────────────────────────────────────────────────────
function stopPong() {
      if (!isPonging) return;
      isPonging = false;

      cancelAnimationFrame(pongRAF);
      pongRAF = null;

      // ── Phase 1: static burst over the canvas ────────────────────────
      const burst = document.createElement('div');
      burst.className = 'hf-static-burst';
      face.appendChild(burst);

      // ── Phase 2: fade canvas and label out ───────────────────────────
      if (pongCanvas) {
        pongCanvas.style.transition = 'opacity 0.2s ease';
        pongCanvas.style.opacity    = '0';
      }
      if (pongWakeLabel) {
        pongWakeLabel.style.opacity = '0';
      }

      setTimeout(() => {
        burst.remove();
        pongCanvas?.remove();
        pongCanvas = null;
        pongWakeLabel?.remove();
        pongWakeLabel = null;

        // ── Phase 3: glitch then restore face ──────────────────────────
        face.classList.add('glitch-shift');
        setTimeout(() => face.classList.remove('glitch-shift'), 80);

        face.querySelectorAll('.hf-eye, .hf-mouth, .hf-text').forEach(el => {
          el.style.transition = 'opacity 0.25s ease';
          el.style.opacity    = '';
        });

        // Clean up transitions after they finish
        setTimeout(() => {
          face.querySelectorAll('.hf-eye, .hf-mouth, .hf-text').forEach(el => {
            el.style.transition = '';
          });
        }, 300);

        // Restore face background
        face.style.background = face.dataset.prevBg || '';
        delete face.dataset.prevBg;

        // Reset eye position
        eyeCurX = 0; eyeCurY = 0;
        eyeTargetX = 0; eyeTargetY = 0;
        eyeL.style.transform = '';
        eyeR.style.transform = '';

      }, 350);
    }

    // ── Hex color → "r, g, b" string for rgba() ───────────────────────
    // Used to draw with the CSS --text token inside canvas (which only
    // accepts rgb values, not CSS custom properties).
    function hexToRgb(hex) {
      const clean = hex.replace('#', '').trim();
      if (clean.length === 3) {
        const [r, g, b] = clean.split('').map(c => parseInt(c + c, 16));
        return `${r}, ${g}, ${b}`;
      }
      const r = parseInt(clean.slice(0, 2), 16);
      const g = parseInt(clean.slice(2, 4), 16);
      const b = parseInt(clean.slice(4, 6), 16);
      return `${r}, ${g}, ${b}`;
    }

  } // end bootFace()
}

// ── HERO TAGLINE TYPEWRITER ──────────────────────────────────────────────
// Paste this function into effects.js, then call initTaglineTypewriter()
// inside the DOMContentLoaded block at the bottom alongside the other inits.
// ─────────────────────────────────────────────────────────────────────────

function initTaglineTypewriter() {
  const el = document.getElementById('heroTagline');
  if (!el) return;

  const fullText = el.dataset.type || '';
  if (!fullText) return;

  // ── Cursor element ───────────────────────────────────────────────────
  const cursor = document.createElement('span');
  cursor.className = 'tagline-cursor';
  cursor.setAttribute('aria-hidden', 'true');

  if (!document.getElementById('s-tagline-cursor')) {
    const s = document.createElement('style');
    s.id = 's-tagline-cursor';
    s.textContent = `
      .tagline-cursor {
        display: inline-block;
        width: 2px;
        height: 1em;
        background: var(--red);
        box-shadow: var(--glow-r);
        margin-left: 2px;
        vertical-align: middle;
        animation: taglineBlink 0.55s step-end infinite;
        transition: opacity 0.6s ease;
      }
      .tagline-cursor.done {
        animation: none;
        opacity: 0;
      }
      @keyframes taglineBlink {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0; }
      }
    `;
    document.head.appendChild(s);
  }

  el.textContent = '';
  el.appendChild(cursor);

  // ── Per-character delay model (faster) ──────────────────────────────
  function charDelay(char, prevChar) {
    if (char === '.')  return 180 + Math.random() * 50;  // was 310+80
    if (char === ',')  return 100 + Math.random() * 40;  // was 170+60
    if (char === '!')  return 160 + Math.random() * 50;  // was 280+80
    if (char === '?')  return 150 + Math.random() * 40;  // was 260+70
    if (char === ' ')  return 35  + Math.random() * 30;  // was 55+50

    // Rare mid-word hesitation (~4%)
    if (Math.random() < 0.04) return 55 + Math.random() * 80; // was 90+130

    // Burst mode — flowing within a word
    const isLetter = (c) => /[a-zA-Z]/.test(c);
    if (prevChar && isLetter(prevChar) && isLetter(char)) {
      return 25 + Math.random() * 28; // was 42+48
    }

    // Default
    return 35 + Math.random() * 35;  // was 60+55
  }

  // ── Typing loop ──────────────────────────────────────────────────────
  let index = 0;

  function typeNext() {
    if (index >= fullText.length) {
      setTimeout(() => cursor.classList.add('done'), 1800);
      return;
    }

    const char     = fullText[index];
    const prevChar = index > 0 ? fullText[index - 1] : null;

    el.insertBefore(document.createTextNode(char), cursor);
    index++;

    setTimeout(typeNext, charDelay(char, prevChar));
  }

  // ── Start timing ────────────────────────────────────────────────────
  function startWhenReady() {
    if (!sessionStorage.getItem('introDone')) {
      const poll = setInterval(() => {
        if (sessionStorage.getItem('introDone')) {
          clearInterval(poll);
          setTimeout(typeNext, 520);
        }
      }, 100);
    } else {
      setTimeout(typeNext, 400);
    }
  }

  startWhenReady();
}

// ── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initMagnetic();
  initCursor();
  initObservers();
  initHeroFace();
  initTaglineTypewriter()
});