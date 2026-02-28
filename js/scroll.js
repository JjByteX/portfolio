/* ─── SCROLL.JS ──────────────────────────────────────────
   Handles two things:
   1. Fade-up reveal animation via IntersectionObserver
   2. Nav link active state based on scroll position
──────────────────────────────────────────────────────── */

/**
 * Observes all .fade-up elements and adds .visible
 * when they enter the viewport.
 */
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.fade-up').forEach((el) => {
    observer.observe(el);
  });
}

/**
 * Highlights the nav link matching the current section
 * as the user scrolls through the page.
 */
function initNavActiveState() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  function updateActiveLink() {
    let currentId = '';

    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 120) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${currentId}`;
      link.classList.toggle('active', isActive);
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink(); // run once on load
}

// ── Init ──
initScrollReveal();
initNavActiveState();
initLiveClock();
initBackToTop();

/**
 * Shows the back-to-top button once the user scrolls
 * past the about section, hides it at the top.
 */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  const about = document.getElementById('about');
  if (!btn || !about) return;

  window.addEventListener('scroll', () => {
    const past = window.scrollY >= about.offsetTop - 100;
    btn.classList.toggle('visible', past);
  }, { passive: true });
}

/**
 * Live clock — ticks every second, displays in 12hr format.
 * Targets the #liveClock element in the GitHub widget.
 */
function initLiveClock() {
  const el = document.getElementById('liveClock');
  if (!el) return;

  function tick() {
    const now = new Date();
    // Force UTC+8 (Asia/Manila)
    const ph = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    let h = ph.getHours();
    const m = String(ph.getMinutes()).padStart(2, '0');
    const s = String(ph.getSeconds()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    el.textContent = `${String(h).padStart(2, '0')}:${m}:${s} ${ampm}`;
  }

  tick();
  setInterval(tick, 1000);
}