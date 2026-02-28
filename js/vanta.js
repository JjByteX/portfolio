/* ─── VANTA.JS ───────────────────────────────────────────
   One NET instance on #vanta-bg.
   On theme change: destroy the old one, create a new one
   with the correct backgroundColor. One context at a time
   — this won't crash.
──────────────────────────────────────────────────────── */

const VANTA_COLORS = {
  dark:  { bg: 0x080810, net: 0x7744dd },
  light: { bg: 0xf0eef8, net: 0x7744dd },
};

let vantaEffect = null;

function isDark() {
  return document.documentElement.getAttribute('data-theme') !== 'light';
}

function startVanta() {
  const el = document.getElementById('vanta-bg');
  if (!el) return;

  // Destroy existing first
  if (vantaEffect) {
    vantaEffect.destroy();
    vantaEffect = null;
  }

  const colors = isDark() ? VANTA_COLORS.dark : VANTA_COLORS.light;

  vantaEffect = VANTA.NET({
    el,
    THREE,
    mouseControls: false,
    touchControls: false,
    gyroControls:  false,
    minHeight: 200,
    minWidth:  200,
    backgroundColor: colors.bg,
    color:           colors.net,
    points:          6,
    maxDistance:     16,
    spacing:         24,
    showDots:        false,
  });
}

function initVanta() {
  if (typeof VANTA === 'undefined' || typeof THREE === 'undefined') {
    console.warn('Vanta or Three.js not loaded');
    return;
  }

  startVanta();

  // Watch for theme changes — destroy + recreate with correct bg
  new MutationObserver(startVanta)
    .observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
}

window.addEventListener('load', initVanta);