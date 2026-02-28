/* ─── MAIN.JS ────────────────────────────────────────────
   Entry point. Scripts are loaded in index.html with
   defer, so the DOM is already ready when this runs.

   This file should stay lean — it just kicks off
   the other modules. Business logic lives in its
   own file.
──────────────────────────────────────────────────────── */

// scroll.js and glitch.js are loaded before this file
// and self-initialize. Add any future cross-module
// logic or state here.

console.log('%c JJ_BASSIG · Portfolio loaded ', 'background:#ff0a37;color:#fff;font-family:monospace;padding:4px 8px;');

// Render all Lucide icons
if (typeof lucide !== 'undefined') lucide.createIcons();