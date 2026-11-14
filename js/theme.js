/* ─── THEME.JS ───────────────────────────────────────────
   Manages dark/light theme switching.
   - Reads saved preference from localStorage on load
   - Toggles data-theme attribute on <html>
   - Updates the button icon and aria-label
   - Persists the choice so it survives page refreshes
──────────────────────────────────────────────────────── */

const STORAGE_KEY = 'jj-portfolio-theme';
const DARK  = 'dark';
const LIGHT = 'light';

const html   = document.documentElement;
const btn    = document.getElementById('themeToggle');
const icon   = btn?.querySelector('.toggle-icon');

/** Swap the Phosphor icon class (shows the theme you'll switch TO). */
function setIcon(name) {
  if (!icon) return;
  icon.classList.remove('ph-moon', 'ph-sun');
  icon.classList.add(name);
}

/**
 * Apply a theme by setting the data-theme attribute
 * and updating the toggle button state.
 *
 * @param {'dark'|'light'} theme
 */
function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
  if (theme === LIGHT) {
    setIcon('ph-moon');
    btn?.setAttribute('aria-label', 'Switch to dark theme');
  } else {
    setIcon('ph-sun');
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
 * Read saved preference, fall back to light.
 */
function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  applyTheme(saved === DARK ? DARK : LIGHT);
}

// ── Wire up the button ──
btn?.addEventListener('click', toggleTheme);

// ── Init on page load ──
initTheme();
