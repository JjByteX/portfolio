/* ─── INTRO.JS — Terminal boot + Robot with gravity ──────────────────
   Sequence:
   1. Terminal types fast → bar fills
   2. Terminal fades
   3. Robot GLITCHES into existence (flickers, chromatic jitter)
   4. Robot: surprised → grins → winks
   5. Robot launches UP (ease-out, stretch) → falls DOWN (ease-in,
      gravity) → squashes on land at heroFace → settles
   6. Overlay fades mid-flight, heroFace waits underneath

   NOTE: This script is intentionally loaded WITHOUT defer in index.html.
   It must run before the DOM renders to block the flash of unstyled
   content on first visit. Do not add defer without re-testing the intro
   timing against effects.js.
──────────────────────────────────────────────────────────────────── */
(function () {
  // Suppress the terminal's blinking ::after cursor before the first paint.
  // The style attribute on the element itself is the fastest path — no CSSOM
  // round-trip needed, resolved before any layout/paint.
  const _t = document.getElementById('introTerminal');
  if (_t) _t.style.display = 'none';

  const overlay = document.getElementById('introOverlay');
  if (!overlay) return;

  if (sessionStorage.getItem('introDone')) {
    overlay.remove();
    return;
  }

  const lines = [
    '> INITIALIZING PORTFOLIO_v2026...',
    '> LOADING MODULES: [AUTH · UI · DB · NET]',
    '> SECURITY CHECK PASSED — WELCOME, OPERATOR',
    '> LAUNCHING JJ_BASSIG.EXE'
  ];
  const lineEls = [
    document.getElementById('iLine1'),
    document.getElementById('iLine2'),
    document.getElementById('iLine3'),
    document.getElementById('iLine4')
  ];
  const bar = document.getElementById('introBar');
  let lineIndex = 0, charIndex = 0, progress = 0;

  /* ═══════════════════════════════════
     PHASE 1 — Terminal typing
  ═══════════════════════════════════ */
  function typeLine() {
    if (lineIndex >= lines.length) { animateBar(); return; }
    const line = lines[lineIndex];
    const el   = lineEls[lineIndex];
    if (!el) return;
    if (charIndex < line.length) {
      el.textContent = line.slice(0, charIndex + 1);
      charIndex++;
      setTimeout(typeLine, 20);
    } else {
      el.classList.add('done');
      lineIndex++;
      charIndex = 0;
      setTimeout(typeLine, 120);
    }
  }

  /* ═══════════════════════════════════
     PHASE 2 — Progress bar
  ═══════════════════════════════════ */
  function animateBar() {
    const id = setInterval(() => {
      progress += 4;
      bar.style.width = Math.min(progress, 100) + '%';
      if (progress >= 100) {
        clearInterval(id);
        setTimeout(showRobot, 200);
      }
    }, 16);
  }

  /* ═══════════════════════════════════
     ROBOT CSS
     NOTE: Lives here (injected) because the robot element is
     created dynamically and only exists during the intro sequence.
     Moving this to animations.css would load ~150 lines of one-time
     styles on every page visit. Injecting on demand is intentional.
  ═══════════════════════════════════ */
  function injectRobotCSS() {
    if (document.getElementById('introRobotStyles')) return;
    const style = document.createElement('style');
    style.id = 'introRobotStyles';
    style.textContent = `
      #introRobot {
        position: fixed;
        width: 260px;
        height: 260px;
        background: #14142a;
        border: 1px solid rgba(255, 10, 55, 0.65);
        box-shadow:
          0 0 0 1px rgba(255,10,55,0.12),
          0 0 28px rgba(255,10,55,0.30),
          0 0 70px rgba(255,10,55,0.12),
          inset 0 0 30px rgba(0,0,0,0.5);
        z-index: 10001;
        pointer-events: none;
        user-select: none;
        overflow: visible;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        transition: filter 0.2s ease;
      }

      #introRobot.jumping {
        filter: blur(1px) brightness(1.2);
      }

      #introRobot::before,
      #introRobot::after {
        content: '';
        position: absolute;
        width: 12px; height: 12px;
        border-color: #ff0a37;
        border-style: solid;
      }
      #introRobot::before { top: -1px;    left: -1px;  border-width: 2px 0 0 2px; }
      #introRobot::after  { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

      #introRobot .ir-scan {
        position: absolute; inset: 0;
        background: repeating-linear-gradient(
          0deg, transparent, transparent 3px,
          rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px
        );
        pointer-events: none;
        z-index: 2;
      }

      #introRobot .ir-label {
        position: absolute;
        bottom: -1.4rem; left: 0;
        font-family: 'Share Tech Mono', monospace;
        font-size: 0.58rem; letter-spacing: 0.2em;
        color: rgba(255,10,55,0.4);
        white-space: nowrap;
      }

      #introRobot .ir-eye {
        position: absolute;
        background: #e2e2f0;
        width: 12px; height: 12px;
        border-radius: 50%;
        top: 86px;
        box-shadow: 0 0 10px rgba(226,226,240,0.6);
        transition: all 0.1s ease;
      }
      #introRobot .ir-eye-l { left:  52px; }
      #introRobot .ir-eye-r { right: 52px; }

      #introRobot .ir-mouth {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        transition: all 0.2s ease;
        width: 18px; height: 18px;
        border-radius: 50%;
        background: none;
        border: 2px solid #e2e2f0;
        bottom: 80px;
      }

      #introRobot.s-grin .ir-eye {
        width: 26px !important; height: 15px !important;
        border-radius: 26px 26px 0 0 !important;
        top: 90px !important;
        background: none !important;
        border: 2.5px solid #e2e2f0 !important;
        border-bottom: none !important;
        box-shadow: none !important;
      }
      #introRobot.s-grin .ir-mouth {
        width: 80px !important; height: 26px !important;
        border-radius: 50px !important;
        background: #e2e2f0 !important;
        border: none !important;
        box-shadow: 0 0 12px rgba(226,226,240,0.3) !important;
        bottom: 76px !important;
      }

      #introRobot.s-wink .ir-eye-l {
        width: 26px !important; height: 26px !important;
        border-radius: 50% !important;
        top: 88px !important;
        background: #e2e2f0 !important;
        border: none !important;
        box-shadow: 0 0 10px rgba(226,226,240,0.6) !important;
      }
      #introRobot.s-wink .ir-eye-r {
        width: 26px !important; height: 3px !important;
        border-radius: 2px !important;
        top: 101px !important;
        background: #e2e2f0 !important;
        border: none !important;
        box-shadow: none !important;
      }
      #introRobot.s-wink .ir-mouth {
        width: 54px !important; height: 12px !important;
        border-radius: 0 0 54px 54px !important;
        background: none !important;
        border: 2px solid #e2e2f0 !important;
        border-top: none !important;
        box-shadow: none !important;
        bottom: 86px !important;
      }

      @keyframes irGlitchIn {
        0%   {
          opacity: 0;
          transform: translate(-50%,-50%) scale(0.94) skewX(-4deg);
          clip-path: inset(60% 0 0% 0);
          filter: hue-rotate(90deg) brightness(2);
        }
        8%   {
          opacity: 1;
          transform: translate(-50%,-50%) scale(1.04) skewX(2deg) translateX(-6px);
          clip-path: inset(0% 0 55% 0);
          filter: hue-rotate(-60deg) brightness(1.8);
        }
        16%  {
          opacity: 0;
          transform: translate(-50%,-50%) scale(0.97) translateX(8px);
          clip-path: inset(25% 0 25% 0);
        }
        24%  {
          opacity: 1;
          transform: translate(-50%,-50%) scale(1.02) skewX(-1deg);
          clip-path: inset(0% 0 0% 0);
          filter: hue-rotate(40deg) brightness(1.4);
        }
        32%  {
          opacity: 0;
          transform: translate(-50%,-50%) translateX(-4px);
        }
        44%  {
          opacity: 1;
          transform: translate(-50%,-50%) scale(1.01);
          filter: hue-rotate(0deg) brightness(1.2);
        }
        55%  {
          opacity: 0.6;
          transform: translate(-50%,-50%) translateX(3px);
        }
        70%  {
          opacity: 1;
          transform: translate(-50%,-50%) scale(1);
          filter: none;
        }
        100% {
          opacity: 1;
          transform: translate(-50%,-50%) scale(1);
          filter: none;
          clip-path: inset(0);
        }
      }

      #introRobot.glitch-appearing {
        animation: irGlitchIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @keyframes irBlink {
        0%, 100% { transform: scaleY(1); }
        50%       { transform: scaleY(0.05); }
      }
      #introRobot.blinking .ir-eye {
        animation: irBlink 0.1s ease-in-out;
      }
    `;
    document.head.appendChild(style);
  }

  /* ═══════════════════════════════════
     State helpers
  ═══════════════════════════════════ */
  const FACE_STATES = ['s-grin', 's-wink'];

  function setRobotState(robot, ...add) {
    robot.classList.remove(...FACE_STATES);
    if (add.filter(Boolean).length) robot.classList.add(...add.filter(Boolean));
  }

  /* ═══════════════════════════════════
     PHASE 3 — Robot glitch-appears
  ═══════════════════════════════════ */
  function showRobot() {
    const terminal = document.getElementById('introTerminal');
    const heroFace = document.getElementById('heroFace');

    // Hide terminal immediately (text + bar are skipped entirely)
    if (terminal) terminal.style.display = 'none';

    injectRobotCSS();

      const robot = document.createElement('div');
      robot.id = 'introRobot';
      robot.setAttribute('aria-hidden', 'true');
      robot.innerHTML = `
        <div class="ir-scan"></div>
        <div class="ir-eye ir-eye-l"></div>
        <div class="ir-eye ir-eye-r"></div>
        <div class="ir-mouth"></div>
        <span class="ir-label">SYS://UNIT_01</span>
      `;
      document.body.appendChild(robot);

      /* Beat 1: GLITCH IN */
      robot.classList.add('glitch-appearing');

      /* Beat 2: After glitch settles → GRIN */
      setTimeout(() => {
        robot.classList.remove('glitch-appearing');
        setRobotState(robot, 's-grin');

        setTimeout(() => {
          robot.classList.add('blinking');
          setTimeout(() => robot.classList.remove('blinking'), 70);
        }, 150);

        /* Beat 3: WINK */
        setTimeout(() => {
          setRobotState(robot, 's-wink');

          /* Beat 4: ANTICIPATION — eyes shift up before jump */
          setTimeout(() => {
            setRobotState(robot); // clears s-wink, reverts to surprised
            robot.querySelectorAll('.ir-eye').forEach(e => {
              e.style.transform = 'translateY(-10px) scale(1.1)';
            });

            /* Beat 5: LAUNCH */
            setTimeout(() => {
              const faceReachable =
                heroFace &&
                window.innerWidth > 900 &&
                window.getComputedStyle(heroFace).display !== 'none';

              faceReachable ? jumpToHero(robot, heroFace) : dismiss(robot);
            }, 200);

          }, 400);
        }, 600);
      }, 700);
  }

  /* ═══════════════════════════════════
     PHASE 4 — Gravity arc jump
  ═══════════════════════════════════ */
  function jumpToHero(robot, heroFace) {
    robot.classList.add('jumping');

    // Use visibility:hidden instead of display changes to preserve
    // layout — this lets getBoundingClientRect() return real coordinates
    // without conflicting with the CSS display:block on #heroFace.
    const prevVisibility = heroFace.style.visibility;
    heroFace.style.visibility = 'hidden';

    const rr = robot.getBoundingClientRect();
    const hr = heroFace.getBoundingClientRect();

    // Safety: fall back to a reasonable screen position if face has no size
    const targetX = hr.width > 0 ? hr.left : window.innerWidth * 0.7;
    const targetY = hr.height > 0 ? hr.top  : window.innerHeight * 0.5;

    const rCX = rr.left + rr.width  / 2;
    const rCY = rr.top  + rr.height / 2;
    const hCX = targetX + hr.width  / 2;
    const hCY = targetY + hr.height / 2;

    const dx = hCX - rCX;
    const dy = hCY - rCY;

    const peakX = dx * 0.35;
    const peakY = Math.min(-Math.abs(dy) * 0.6, -120) - 60;

    robot.animate(
      [
        { transform: `translate(-50%,-50%) translate(0px, 0px) scale(1)`,                                                           easing: 'cubic-bezier(0.33, 1, 0.68, 1)',  offset: 0    },
        { transform: `translate(-50%,-50%) translate(0px, 10px) scaleX(1.3) scaleY(0.7)`,                                          easing: 'cubic-bezier(0.33, 1, 0.68, 1)',  offset: 0.06 },
        { transform: `translate(-50%,-50%) translate(${peakX * 0.2}px, ${peakY * 0.2}px) scaleX(0.7) scaleY(1.4)`,                easing: 'cubic-bezier(0.32, 0, 0.67, 0)',  offset: 0.15 },
        { transform: `translate(-50%,-50%) translate(${peakX}px, ${peakY}px) scale(1)`,                                            easing: 'cubic-bezier(0.32, 0, 0.67, 0)',  offset: 0.50 },
        { transform: `translate(-50%,-50%) translate(${dx}px, ${dy}px) scaleX(1.5) scaleY(0.6)`,                                   easing: 'cubic-bezier(0.33, 1, 0.68, 1)',  offset: 0.90 },
        { transform: `translate(-50%,-50%) translate(${dx}px, ${dy}px) scale(1)`,                                                                                              offset: 1    }
      ],
      { duration: 900, fill: 'forwards' }
    ).onfinish = () => {
      robot.classList.remove('jumping');
      robot.style.display = 'none';

      // Restore visibility before making the face visible
      heroFace.style.visibility = prevVisibility || '';
      heroFace.style.opacity    = '1';

      // Use classList.add individually — never overwrite className directly,
      // as initHeroFace() in effects.js may have already set state classes.
      heroFace.classList.add('intro-arrived');
      heroFace.classList.add('s-grin');

      heroFace.classList.add('blinking');
      setTimeout(() => heroFace.classList.remove('blinking'), 70);

      dismiss(robot);
    };

// Start fading the overlay late in the flight, after robot nears face
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.25s ease';
      overlay.style.opacity    = '0';
    }, 920);
  }

  /* ═══════════════════════════════════
     PHASE 5 — Dismiss
  ═══════════════════════════════════ */
  function dismiss(robot) {
    sessionStorage.setItem('introDone', '1');

    overlay.style.transition = 'opacity 0.3s ease';
    overlay.style.opacity    = '0';

    setTimeout(() => {
      overlay.remove();
      if (robot) robot.remove();
      document.getElementById('introRobotStyles')?.remove();
    }, 350);
  }

  /* ── Boot ── */
  // Skip terminal typing + progress bar — jump straight to robot
  showRobot();
})();