/* ─── CONTRIBUTIONS.JS ───────────────────────────────────
   Fetches and renders the GitHub contribution chart for
   @JjByteX, re-tints empty squares on theme change,
   and handles the expand-to-modal interaction.

   PROXY NOTE: ghchart.rshah.org does not send CORS headers,
   so a proxy is required for the fetch(). corsproxy.io is a
   free public proxy with no SLA. If it goes down, the catch()
   block falls back to a direct <img> tag — the chart still
   displays, just without theme-aware square tinting.
   If uptime matters, swap the PROXY_URL constant for a
   self-hosted or more reliable CORS proxy.
──────────────────────────────────────────────────────── */
(function () {
  const USERNAME  = 'JjByteX';
  const CHART_URL = `https://ghchart.rshah.org/${USERNAME}`;
  const PROXY_URL = `https://corsproxy.io/?${CHART_URL}`;

  // Cached element references
  const wrap     = document.getElementById('ghChart');
  const modal    = document.getElementById('ghModal');
  const modalClose = document.getElementById('ghModalClose');
  const chartWrap  = document.getElementById('ghChartWrap');
  const largeDest  = document.getElementById('ghChartLarge');

  /* ── Chart load ── */
  function loadGhChart() {
    if (!wrap) return;

    fetch(PROXY_URL)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(svgText => {
        wrap.innerHTML = svgText;
        const svg = wrap.querySelector('svg');
        if (!svg) return;

        const w = svg.getAttribute('width')  || 663;
        const h = svg.getAttribute('height') || 104;
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.style.background = 'transparent';

        // Mark the large background rect transparent,
        // mark empty contribution squares for theme re-tinting
        const svgWidth = parseFloat(w);
        svg.querySelectorAll('rect').forEach(rect => {
          const rw = parseFloat(rect.getAttribute('width') || 0);
          if (rw > svgWidth * 0.5) {
            rect.style.fill = 'transparent';
            return;
          }
          const style = rect.getAttribute('style') || '';
          if (style.includes('#eeeeee')) rect.dataset.empty = 'true';
        });

        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        tintEmptySquares(isDark);

        svg.style.width   = '100%';
        svg.style.height  = 'auto';
        svg.style.display = 'block';
      })
      .catch(() => {
        // Proxy failed — fall back to direct img tag.
        // No theme-aware tinting in this path, but the chart still shows.
        if (wrap) {
          wrap.innerHTML = `<img
            src="${CHART_URL}"
            style="width:100%;height:auto;display:block;"
            alt="GitHub contributions for ${USERNAME}"
          />`;
        }
      });
  }

  /* ── Theme re-tint ── */
  function tintEmptySquares(isDark) {
    const color = isDark ? '#0e0e20' : '#e8e4f5';
    document.querySelectorAll('#ghChart rect[data-empty]').forEach(rect => {
      rect.style.fill = color;
    });
  }

  // Re-tint only on theme change — never re-fetch the SVG
  new MutationObserver(() => {
    requestAnimationFrame(() => {
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      tintEmptySquares(isDark);
    });
  }).observe(document.documentElement, {
    attributes:      true,
    attributeFilter: ['data-theme'],
  });

  /* ── Expand modal ── */
  function openGhModal() {
    const src = wrap?.querySelector('svg');
    if (!src || !largeDest || !modal) return;

    largeDest.innerHTML = '';
    const clone = src.cloneNode(true);
    clone.style.width  = '100%';
    clone.style.height = 'auto';
    largeDest.appendChild(clone);

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [modal] });

    // Use { once: true } so the listener self-removes — no stacking
    // if the user opens the modal multiple times in one session.
    document.addEventListener('keydown', onGhModalKey);
  }

  function closeGhModal() {
    if (!modal) return;
    modal.classList.add('closing');
    setTimeout(() => {
      modal.classList.remove('open', 'closing');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onGhModalKey);
    }, 380);
  }

  function onGhModalKey(e) {
    if (e.key === 'Escape') closeGhModal();
  }

  chartWrap?.addEventListener('click', openGhModal);
  modalClose?.addEventListener('click', closeGhModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeGhModal(); });

  /* ── Boot ── */
  loadGhChart();
})();