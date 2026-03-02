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
      's-annoyed', 's-thinking', 's-wink', 's-dead', 's-wtf'
    ];

    const NO_BLINK = new Set([
      's-sleepy', 's-wtf', 's-dead', 's-squint',
      's-annoyed', 's-pleased', 's-grin', 's-thinking'
    ]);

    const NO_TRACK = new Set([
      's-wtf', 's-sleepy', 's-dead', 's-squint',
      's-annoyed', 's-pleased', 's-grin', 's-thinking',
      's-pong'  // pong hides the face elements entirely
    ]);

    const WTF_WORDS = ['WTF', '???', 'HUH', '!!!', 'OOF', 'NOPE', 'BAKA'];

    // ── State vars ────────────────────────────────────────────────────
    let current    = 's-happy';
    let isReacting = false;
    let isIdle     = false;
    let isPonging  = false;
    let idleTimer  = null;
    let pongTimer  = null;
    let autoTimer  = null;
    let blinkTimer = null;
    let lastMX     = -9999;
    let lastMY     = -9999;
    let lerpActive = true;

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

      if (dist < 88 && !isCrossZone && !isReacting && !isIdle && current !== 's-grin') {
        reactFor('s-grin', 900, 's-eager');
        return;
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
        } else {
          eyeCurX += (eyeTargetX - eyeCurX) * 0.12;
          eyeCurY += (eyeTargetY - eyeCurY) * 0.12;
          eyeL.style.transform = `translate(${eyeCurX}px, ${eyeCurY}px)`;
          eyeR.style.transform = `translate(${eyeCurX}px, ${eyeCurY}px)`;
        }
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
        if (isReacting || isIdle) { scheduleAuto(); return; }

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

    // ── Hero enter / leave ────────────────────────────────────────────
    hero.addEventListener('mouseenter', () => {
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

    hero.addEventListener('mouseleave', () => {
      eyeTargetX  = 0;
      eyeTargetY  = 0;
      isCrossZone = false;
      if (!isReacting && !isIdle) setState('s-pleased');
    });

    // ── CTA button hovers ─────────────────────────────────────────────
    document.querySelector('a[href="#projects"].btn')
      ?.addEventListener('mouseenter', () => reactFor('s-squint', 1100, 's-eager'));

    document.querySelector('a[href="#contact"].btn')
      ?.addEventListener('mouseenter', () => reactFor('s-surprised', 950, 's-eager'));

    // ── Theme toggle ──────────────────────────────────────────────────
    document.getElementById('themeToggle')?.addEventListener('click', () => {
      const nowLight = document.documentElement.getAttribute('data-theme') === 'light';
      reactFor(nowLight ? 's-annoyed' : 's-pleased', nowLight ? 1600 : 900, 's-happy');
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
          }, 5000);
        }
      }, 7000);
    }

    document.addEventListener('mousemove', resetIdle, { passive: true });
    document.addEventListener('keydown',   resetIdle);
    document.addEventListener('click',     resetIdle);

    if (sessionStorage.getItem('introDone')) {
      face.classList.add('intro-arrived');
      face.style.opacity = '1';
    }

    // ── Boot ──────────────────────────────────────────────────────────
    setState(current);
    resetIdle();
    scheduleAuto();
    scheduleBlink();

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

      // Hide the face elements — the canvas replaces them visually
      face.querySelectorAll('.hf-eye, .hf-mouth, .hf-text').forEach(el => {
        el.style.opacity = '0';
      });

      // ── Canvas setup ─────────────────────────────────────────────────
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
      face.appendChild(pongCanvas);

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
      });
      face.appendChild(pongWakeLabel);

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

      // Resolve the current --text color for drawing
      function textColor() {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--text').trim() || '#e2e2f0';
      }

      // ── Game state ────────────────────────────────────────────────────
      const PAD_W = 5, PAD_H = 36, PAD_SPEED = 2.6;
      const BALL_SIZE = 5;

      const state = {
        ball: {
          x:  W / 2,
          y:  H / 2,
          vx: (Math.random() > 0.5 ? 1 : -1) * 2.8,
          vy: (Math.random() * 2 - 1) * 2.2,
          trail: [],  // { x, y } history for motion blur
        },
        padL: { x: 14,      y: H / 2 - PAD_H / 2 },
        padR: { x: W - 14 - PAD_W, y: H / 2 - PAD_H / 2 },
        score: { l: 0, r: 0 },
      };

      // ── AI paddle move ─────────────────────────────────────────────────
      // Tracks the ball with a speed cap and a small intentional lag so
      // it's not perfect — misses happen occasionally, which looks natural.
      function moveAI(pad, targetY) {
        const center = pad.y + PAD_H / 2;
        const diff   = targetY - center;
        // Add slight randomness so neither side is a perfect wall
        const jitter = (Math.random() - 0.5) * 1.2;
        const step   = Math.sign(diff) * Math.min(Math.abs(diff), PAD_SPEED + jitter);
        pad.y = Math.max(0, Math.min(H - PAD_H, pad.y + step));
      }

      // ── Score flash ───────────────────────────────────────────────────
      let scoreFlash = 0; // frames remaining for score flash highlight

      function resetBall(direction) {
        state.ball.x     = W / 2;
        state.ball.y     = H / 2;
        state.ball.vx    = direction * (2.6 + Math.random() * 0.6);
        state.ball.vy    = (Math.random() * 2 - 1) * 2.4;
        state.ball.trail = [];
        scoreFlash       = 28;
      }

      // ── Draw frame ────────────────────────────────────────────────────
      function drawFrame() {
        const b   = state.ball;
        const col = textColor();

        // Semi-transparent clear — creates the motion-blur trail naturally
        ctx.fillStyle = 'rgba(8, 8, 16, 0.72)';
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
        moveAI(state.padL, b.y);
        moveAI(state.padR, b.y);

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

      pongCanvas?.remove();
      pongCanvas = null;

      pongWakeLabel?.remove();
      pongWakeLabel = null;

      // Restore face elements
      face.querySelectorAll('.hf-eye, .hf-mouth, .hf-text').forEach(el => {
        el.style.opacity = '';
      });

      // Reset eye position so they don't snap from a stale transform
      eyeCurX = 0; eyeCurY = 0;
      eyeTargetX = 0; eyeTargetY = 0;
      eyeL.style.transform = '';
      eyeR.style.transform = '';
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

// ── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initMagnetic();
  initCursor();
  initObservers();
  initHeroFace();
});