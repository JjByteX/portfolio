/* ─── THEME.JS ───────────────────────────────────────────
   Manages dark/light theme switching.
   - Reads saved preference from localStorage on load
   - Toggles data-theme attribute on <html>
   - Updates the button label + icon
   - Persists the choice so it survives page refreshes
──────────────────────────────────────────────────────── */

const STORAGE_KEY = 'jj-portfolio-theme';
const DARK  = 'dark';
const LIGHT = 'light';

const html   = document.documentElement;
const btn    = document.getElementById('themeToggle');
const icon   = btn?.querySelector('.toggle-icon');
const label  = btn?.querySelector('.toggle-label');

/**
 * Apply a theme by setting the data-theme attribute
 * and updating the toggle button state.
 *
 * @param {'dark'|'light'} theme
 */
function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
  updateChartTheme(theme);   // ← add this line
  if (theme === LIGHT) {
    if (icon)  icon.textContent  = '●';
    if (label) label.textContent = 'DARK';
    btn?.setAttribute('aria-label', 'Switch to dark theme');
  } else {
    if (icon)  icon.textContent  = '◑';
    if (label) label.textContent = 'LIGHT';
    btn?.setAttribute('aria-label', 'Switch to light theme');
  }
}

/**
 * Toggle between dark and light.
 */
function toggleTheme() {
  const current = html.getAttribute('data-theme') || DARK;
  applyTheme(current === DARK ? LIGHT : DARK);
}

/**
 * Read saved preference, fall back to dark.
 */
function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  applyTheme(saved === LIGHT ? LIGHT : DARK);
}

// ── Wire up the button ──
btn?.addEventListener('click', toggleTheme);

// ── Init on page load ──
initTheme();

function updateChartTheme(theme) {
  const chart = document.getElementById('ghChart');
  if (!chart) return;
  const color = theme === 'light' ? '6d28d9' : '8b5cf6';
  chart.src = `https://ghchart.rshah.org/${color}/JjByteX?year=2026`;
}