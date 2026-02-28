/* ─── GLITCH.JS ──────────────────────────────────────────
   Randomly re-triggers the CSS glitch animation on
   .glitch elements so it doesn't just loop on a fixed
   interval — feels more organic and unpredictable.
──────────────────────────────────────────────────────── */

/**
 * Forces a CSS animation restart by briefly removing
 * and re-applying the animation. Works by toggling
 * the animation property and forcing a reflow.
 *
 * @param {HTMLElement} el - The element to re-trigger
 */
function retriggerAnimation(el) {
  el.style.animation = 'none';
  void el.offsetWidth; // force reflow
  el.style.animation = '';
}

/**
 * Schedules the next glitch trigger at a random interval
 * between minMs and maxMs.
 *
 * @param {HTMLElement} el
 * @param {number} minMs
 * @param {number} maxMs
 */
function scheduleGlitch(el, minMs = 6000, maxMs = 12000) {
  const delay = minMs + Math.random() * (maxMs - minMs);

  setTimeout(() => {
    retriggerAnimation(el);
    scheduleGlitch(el, minMs, maxMs); // schedule next one
  }, delay);
}

/**
 * Initializes glitch retrigger on all .glitch elements.
 */
function initGlitch() {
  const glitchElements = document.querySelectorAll('.glitch');

  glitchElements.forEach((el) => {
    scheduleGlitch(el);
  });
}

// ── Init ──
initGlitch();
