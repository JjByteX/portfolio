function loadGhChart() {
  const wrap = document.getElementById('ghChart');
  if (!wrap) return;

  fetch('https://corsproxy.io/?https://ghchart.rshah.org/JjByteX')
    .then(r => r.text())
    .then(svgText => {
      wrap.innerHTML = svgText;
      const svg = wrap.querySelector('svg');
      if (!svg) return;

      const w = svg.getAttribute('width') || 663;
      const h = svg.getAttribute('height') || 104;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.style.background = 'transparent';

      // Clear background rect
      const svgWidth = parseFloat(w);
      svg.querySelectorAll('rect').forEach(rect => {
        const rectWidth = parseFloat(rect.getAttribute('width') || 0);
        if (rectWidth > svgWidth * 0.5) {
          rect.style.fill = 'transparent';
          return;
        }
        // Mark empty squares for re-tinting later
        const style = rect.getAttribute('style') || '';
        if (style.includes('#eeeeee')) {
          rect.dataset.empty = 'true';
        }
      });

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      tintEmptySquares(isDark);

      svg.style.width   = '100%';
      svg.style.height  = 'auto';
      svg.style.display = 'block';
    })
    .catch(() => {
      wrap.innerHTML = '<img src="https://ghchart.rshah.org/JjByteX" style="width:100%;height:auto;display:block;" alt="GitHub contributions" />';
    });
}

function tintEmptySquares(isDark) {
  const tintColor = isDark ? '#0e0e20' : '#e8e4f5';
  document.querySelectorAll('#ghChart rect[data-empty]').forEach(rect => {
    rect.style.fill = tintColor;
  });
}

// ← Only re-tint, NEVER re-fetch
new MutationObserver(() => {
  requestAnimationFrame(() => {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    tintEmptySquares(isDark);
  });
}).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
});

loadGhChart();

// ── Chart expand modal ──
document.getElementById('ghChartWrap')?.addEventListener('click', () => {
  const src = document.querySelector('#ghChart svg');
  const dest = document.getElementById('ghChartLarge');
  const modal = document.getElementById('ghModal');
  if (!src || !dest || !modal) return;

  // Clone the SVG into the modal
  dest.innerHTML = '';
  const clone = src.cloneNode(true);
  clone.style.width = '100%';
  clone.style.height = 'auto';
  dest.appendChild(clone);

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [modal] });
  document.addEventListener('keydown', onGhModalKey);
});

document.getElementById('ghModalClose')?.addEventListener('click', closeGhModal);
document.getElementById('ghModal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('ghModal')) closeGhModal();
});

function closeGhModal() {
  document.getElementById('ghModal')?.classList.remove('open');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', onGhModalKey);
}

function onGhModalKey(e) {
  if (e.key === 'Escape') closeGhModal();
}