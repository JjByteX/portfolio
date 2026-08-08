/* ─── VANTA.JS ───────────────────────────────────────────
   One NET instance on #vanta-bg.
   On theme change: destroy + recreate with correct bg color.
──────────────────────────────────────────────────────── */
const VANTA_COLORS = {
  dark:  { bg: 0x050508, net: 0x7744dd },
  light: { bg: 0xffffff, net: 0x7744dd },
};

let vantaEffect = null;

function isDark() {
  return document.documentElement.getAttribute('data-theme') !== 'light';
}

// AFTER
function startVanta() {
  const el = document.getElementById('vanta-bg');
  if (!el) return;

  const colors = isDark() ? VANTA_COLORS.dark : VANTA_COLORS.light;

  if (vantaEffect) {
    // Just update color — no destroy/recreate
    vantaEffect.setOptions({ backgroundColor: colors.bg });
    return;
  }

  vantaEffect = VANTA.NET({
    el,
    THREE,
    mouseControls: false,
    touchControls: false,
    gyroControls:  false,
    minHeight:       200,
    minWidth:        200,
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
  new MutationObserver(startVanta).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
}

window.addEventListener('load', initVanta);