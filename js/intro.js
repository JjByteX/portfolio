/* ─── INTRO.JS — Terminal boot sequence ──────────────── */
(function () {
  const overlay = document.getElementById('introOverlay');
  if (!overlay) return;

  // Skip if already seen this session
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

  const els    = [
    document.getElementById('iLine1'),
    document.getElementById('iLine2'),
    document.getElementById('iLine3'),
    document.getElementById('iLine4')
  ];
  const bar    = document.getElementById('introBar');

  let lineIndex = 0;
  let charIndex = 0;
  let progress  = 0;

  function typeLine() {
    if (lineIndex >= lines.length) {
      animateBar();
      return;
    }
    const line = lines[lineIndex];
    const el   = els[lineIndex];
    if (!el) return;

    if (charIndex < line.length) {
      el.textContent = line.slice(0, charIndex + 1);
      charIndex++;
      setTimeout(typeLine, 28);
    } else {
      el.classList.add('done');
      lineIndex++;
      charIndex = 0;
      setTimeout(typeLine, 180);
    }
  }

  function animateBar() {
    const id = setInterval(() => {
      progress += 2.2;
      bar.style.width = Math.min(progress, 100) + '%';
      if (progress >= 100) {
        clearInterval(id);
        setTimeout(dismiss, 320);
      }
    }, 18);
  }

  function dismiss() {
    sessionStorage.setItem('introDone', '1');
    overlay.classList.add('hidden');
    setTimeout(() => overlay.remove(), 650);
  }

  // Start after a tiny delay so fonts load
  setTimeout(typeLine, 300);
})();