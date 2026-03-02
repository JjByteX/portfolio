/* ─── INTRO.JS — Terminal boot + Robot with gravity ──────────────────
   Sequence:
   1. Terminal types fast → bar fills
   2. Terminal fades
   3. Robot GLITCHES into existence (flickers, chromatic jitter)
   4. Robot: surprised → grins → winks
   5. Robot launches UP (ease-out, stretch) → falls DOWN (ease-in,
      gravity) → squashes on land at heroFace → settles
   6. Overlay fades mid-flight, heroFace waits underneath
──────────────────────────────────────────────────────────────────── */
(function () {
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
     INJECT ROBOT CSS
  ═══════════════════════════════════ */
  function injectRobotCSS() {
    if (document.getElementById('introRobotStyles')) return;
    const style = document.createElement('style');
    style.id = 'introRobotStyles';
    style.textContent = `
      /* ── Box ── */
      #introRobot {
        position: fixed;
        width:  260px;
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
        /* centered by JS */
        left: 50%;
        top:  50%;
        transform: translate(-50%, -50%);
      transition: filter 0.2s ease;
        }

        /* Add a motion blur effect during the jump */
        #introRobot.jumping {
          filter: blur(1px) brightness(1.2);
        }

      /* HUD corners */
      #introRobot::before,
      #introRobot::after {
        content: '';
        position: absolute;
        width: 12px; height: 12px;
        border-color: #ff0a37;
        border-style: solid;
      }
      #introRobot::before { top:-1px;    left:-1px;  border-width:2px 0 0 2px; }
      #introRobot::after  { bottom:-1px; right:-1px; border-width:0 2px 2px 0; }

      /* Scanlines */
      #introRobot .ir-scan {
        position: absolute; inset: 0;
        background: repeating-linear-gradient(
          0deg, transparent, transparent 3px,
          rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px
        );
        pointer-events: none;
        z-index: 2;
      }

      /* Frame label */
      #introRobot .ir-label {
        position: absolute;
        bottom: -1.4rem; left: 0;
        font-family: 'Share Tech Mono', monospace;
        font-size: 0.58rem; letter-spacing: 0.2em;
        color: rgba(255,10,55,0.4);
        white-space: nowrap;
      }

      /* ── Eyes — default = surprised (small circles) ── */
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

      /* ── Mouth — default = surprised (O shape) ── */
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

      /* ── Grin state ── */
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

      /* ── Wink state ── */
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

      /* ════════════
         GLITCH-IN
         Flickers with chromatic shift — feels like being
         teleported rather than smoothly appearing.
      ════════════ */
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

      /* ════════════
         BLINK
      ════════════ */
      @keyframes irBlink {
        0%,100% { transform: scaleY(1); }
        50%      { transform: scaleY(0.05); }
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
  function setState(robot, ...add) {
    robot.classList.remove(...FACE_STATES);
    robot.classList.add(...add.filter(Boolean));
  }

  /* ═══════════════════════════════════
     PHASE 3 — Robot glitch-appears
  ═══════════════════════════════════ */
  function showRobot() {
    const terminal = document.getElementById('introTerminal');
    const heroFace = document.getElementById('heroFace');

    /* Fade terminal */
    terminal.style.transition = 'opacity 0.28s ease';
    terminal.style.opacity = '0';

    setTimeout(() => {
      terminal.style.display = 'none';
      injectRobotCSS();

      /* Build robot */
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

      /* ── Beat 1: GLITCH IN ── */
      robot.classList.add('glitch-appearing');

/* ── Beat 2: After glitch settles → GRIN ── */
      setTimeout(() => {
        robot.classList.remove('glitch-appearing');
        setState(robot, 's-grin');

        /* Snappy Blink */
        setTimeout(() => {
          robot.classList.add('blinking');
          setTimeout(() => robot.classList.remove('blinking'), 70); // 70ms is key
        }, 150);

        /* ── Beat 3: WINK (The "Goodbye") ── */
        setTimeout(() => {
          setState(robot, 's-wink');

          /* ── Beat 4: ANTICIPATION (Look up before jump) ── */
          setTimeout(() => {
            // Switch to round eyes and shift them up to "aim"
            setState(robot); // Clears s-wink, goes to default surprised eyes
            const eyes = robot.querySelectorAll('.ir-eye');
            eyes.forEach(e => e.style.transform = 'translateY(-10px) scale(1.1)');
            
            /* ── Beat 5: LAUNCH ── */
            setTimeout(() => {
              const faceReachable =
                heroFace &&
                window.innerWidth > 900 &&
                window.getComputedStyle(heroFace).display !== 'none';

              if (faceReachable) {
                jumpToHero(robot, heroFace);
              } else {
                dismiss(robot);
              }
            }, 200); // Short pause for the "look up" to register

          }, 400); // Wink duration

        }, 600); // Grin duration
      }, 700); // Initial settle

    }, 300);
  }

  /* ═══════════════════════════════════
     PHASE 4 — Gravity arc jump
     
     Real gravity physics:
     LAUNCH  → ease-out (fast start, slow at peak)
     FALL    → ease-in  (slow at peak, accelerates down)
     LAND    → squash   (wide + short briefly)
     SETTLE  → back to normal scale
     
     Per-keyframe easing in Web Animations API
     controls each *segment* independently.
  ═══════════════════════════════════ */
function jumpToHero(robot, heroFace) {
  robot.classList.add('jumping'); // Add blur/glow
  // Ensure the face is "displaying" so we can measure it, 
  // even if it is invisible (opacity 0).
  heroFace.style.display = 'flex'; 

  const rr = robot.getBoundingClientRect();
  const hr = heroFace.getBoundingClientRect();

  // SAFETY CHECK: If the face is reporting 0 or a weird 
  // location, we use a fallback center-screen target.
  const targetX = hr.left === 0 ? window.innerWidth * 0.7 : hr.left;
  const targetY = hr.top === 0 ? window.innerHeight * 0.5 : hr.top;

  // Calculate exact center-to-center distance
  const rCX = rr.left + rr.width / 2;
  const rCY = rr.top + rr.height / 2;
  const hCX = targetX + hr.width / 2;
  const hCY = targetY + hr.height / 2;

  const dx = hCX - rCX;
  const dy = hCY - rCY;

  // The rest of your animation code remains the same...
  const peakX = dx * 0.35;
  const peakY = Math.min(-Math.abs(dy) * 0.6, -120) - 60;

robot.animate(
    [
      // 0%: Starting position
      { transform: `translate(-50%,-50%) translate(0px, 0px) scale(1)`, easing: 'cubic-bezier(0.33, 1, 0.68, 1)', offset: 0 },
      
      // 6%: SQUASH (Flatten down before the big push)
      { transform: `translate(-50%,-50%) translate(0px, 10px) scaleX(1.3) scaleY(0.7)`, easing: 'cubic-bezier(0.33, 1, 0.68, 1)', offset: 0.06 },
      
      // 15%: STRETCH (Launch! Thin and long as it shoots up)
      { transform: `translate(-50%,-50%) translate(${peakX * 0.2}px, ${peakY * 0.2}px) scaleX(0.7) scaleY(1.4)`, easing: 'cubic-bezier(0.32, 0, 0.67, 0)', offset: 0.15 },
      
      // 50%: PEAK (Natural shape at the top of the arc)
      { transform: `translate(-50%,-50%) translate(${peakX}px, ${peakY}px) scale(1)`, easing: 'cubic-bezier(0.32, 0, 0.67, 0)', offset: 0.50 },
      
      // 90%: IMPACT SQUASH (Hits the face and flattens out)
      { transform: `translate(-50%,-50%) translate(${dx}px, ${dy}px) scaleX(1.5) scaleY(0.6)`, easing: 'cubic-bezier(0.33, 1, 0.68, 1)', offset: 0.90 },
      
      // 100%: SETTLE (Back to normal)
      { transform: `translate(-50%,-50%) translate(${dx}px, ${dy}px) scale(1)`, offset: 1 }
    ],
    { duration: 900, fill: 'forwards' } // Sped up to 900ms for more "oomph"
  ).onfinish = () => {
    robot.classList.remove('jumping');
  robot.style.display = 'none'; 
  heroFace.style.opacity = '1';
  
  // 1. Add the arrival class
  heroFace.classList.add('intro-arrived');

  // 2. Clear any accidental state and FORCE 's-grin' 
  // This makes the robot look happy to have "arrived"
  heroFace.className = 'intro-arrived s-grin'; 

  // 3. Trigger one final "Happy Blink" on the actual Hero Face
  heroFace.classList.add('blinking');
  setTimeout(() => heroFace.classList.remove('blinking'), 70);

  dismiss(robot);
};

  setTimeout(() => {
    overlay.style.transition = 'opacity 0.4s ease';
    overlay.style.opacity = '0';
  }, 600);
}

  /* ═══════════════════════════════════
     PHASE 5 — Dismiss
  ═══════════════════════════════════ */
function dismiss(robot) {
    sessionStorage.setItem('introDone', '1');

    // Fade overlay quickly
    overlay.style.transition = 'opacity 0.3s ease';
    overlay.style.opacity = '0';

    setTimeout(() => {
      overlay.remove();
      if (robot) robot.remove();
      document.getElementById('introRobotStyles')?.remove();
    }, 350);
  }

  /* ── Boot ── */
  setTimeout(typeLine, 300);
})();