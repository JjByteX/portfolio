/* ─── FILTER.JS ──────────────────────────────────────────
   Handles the All | Academic | Personal filter tabs
   in the Projects section.

   Each .proj-card has a data-category attribute
   ("academic" or "personal"). Clicking a filter button
   hides cards that don't match and reveals those that do.

   The personal project spans 2 columns via inline style.
   When filtering to academic-only we reset that span so
   it doesn't leave a gap in the grid.
──────────────────────────────────────────────────────── */

function initProjectFilter() {
  const buttons = document.querySelectorAll('.proj-filter-btn');
  const cards   = document.querySelectorAll('.proj-card[data-category]');

  if (!buttons.length || !cards.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Show / hide cards
      cards.forEach((card) => {
        const category = card.dataset.category;
        const isVisible = filter === 'all' || category === filter;

        card.classList.toggle('hidden', !isVisible);

        // Restore full-width span for personal card only when visible
        if (category === 'personal') {
          card.style.gridColumn = isVisible ? 'span 2' : '';
        }
      });
    });
  });
}

// ── Init ──
initProjectFilter();
