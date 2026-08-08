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
        // mark empty contribution squares for theme re-tinting,
        // mark filled squares with their contribution level
        const svgWidth = parseFloat(w);

        // Known ghchart fill colors for each level
        const LEVEL_MAP = {
          '#d6e685': '1', '#9be9a8': '1',
          '#8cc665': '2', '#40c463': '2',
          '#44a340': '3', '#30a14e': '3',
          '#1e6823': '4', '#216e39': '4',
        };

        svg.querySelectorAll('rect').forEach(rect => {
          const rw = parseFloat(rect.getAttribute('width') || 0);
          if (rw > svgWidth * 0.5) {
            rect.style.fill = 'transparent';
            return;
          }
          // Get fill from style attribute or fill attribute
          const styleStr = rect.getAttribute('style') || '';
          const fillAttr = (rect.getAttribute('fill') || '').toLowerCase().trim();
          const styleMatch = styleStr.match(/fill\s*:\s*([^;]+)/i);
          const fill = (styleMatch ? styleMatch[1].trim() : fillAttr).toLowerCase();

          if (fill.includes('#eeeeee') || fill.includes('#ebedf0')) {
            rect.dataset.ghLevel = '0';
            return;
          }
          for (const [color, level] of Object.entries(LEVEL_MAP)) {
            if (fill.includes(color)) {
              rect.dataset.ghLevel = level;
              return;
            }
          }
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
    // Full palette for dark and light modes
    const palette = isDark
      ? { '0': '#0e0e20', '1': '#0e4429', '2': '#006d32', '3': '#26a641', '4': '#39d353' }
      : { '0': '#e8e4f5', '1': '#9be9a8', '2': '#40c463', '3': '#30a14e', '4': '#216e39' };

    document.querySelectorAll('#ghChart rect[data-gh-level]').forEach(rect => {
      const color = palette[rect.dataset.ghLevel];
      if (color) rect.style.fill = color;
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
    if (!largeDest || !modal) return;

    largeDest.innerHTML = '';

    const src = wrap?.querySelector('svg');
    if (src) {
      const clone = src.cloneNode(true);
      clone.style.width  = '100%';
      clone.style.height = 'auto';
      largeDest.appendChild(clone);

      // Re-tint cloned SVG to match current theme
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const palette = isDark
        ? { '0': '#0e0e20', '1': '#0e4429', '2': '#006d32', '3': '#26a641', '4': '#39d353' }
        : { '0': '#e8e4f5', '1': '#9be9a8', '2': '#40c463', '3': '#30a14e', '4': '#216e39' };
      clone.querySelectorAll('rect[data-gh-level]').forEach(rect => {
        const color = palette[rect.dataset.ghLevel];
        if (color) rect.style.fill = color;
      });
    } else {
      // Proxy failed — fallback img path
      const img = wrap?.querySelector('img');
      if (!img) return;
      const imgClone = img.cloneNode(true);
      imgClone.style.width  = '100%';
      imgClone.style.height = 'auto';
      largeDest.appendChild(imgClone);
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [modal] });

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