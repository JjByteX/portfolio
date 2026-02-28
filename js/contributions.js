function loadGhChart() {
  const wrap = document.getElementById('ghChart');
  if (!wrap) return;

  fetch('https://corsproxy.io/?https://ghchart.rshah.org/JjByteX')
    .then(r => r.text())
    .then(svgText => {
      wrap.innerHTML = svgText;
      const svg = wrap.querySelector('svg');
      if (!svg) return;

      // Make responsive
      const w = svg.getAttribute('width') || 663;
      const h = svg.getAttribute('height') || 104;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.removeAttribute('width');
      svg.removeAttribute('height');

      // ← ADD HERE
      svg.style.background = 'transparent';
const svgWidth = parseFloat(w);
svg.querySelectorAll('rect').forEach(rect => {
  const rectWidth = parseFloat(rect.getAttribute('width') || 0);
  if (rectWidth > svgWidth * 0.5) {
    rect.style.fill = 'transparent';
    rect.dataset.bg = 'true';
  }
});
      // ← END ADD

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      tintEmptySquares(svg, isDark);

      svg.style.width   = '100%';
      svg.style.height  = 'auto';
      svg.style.display = 'block';
    })
    .catch(() => {
      wrap.innerHTML = '<img src="https://ghchart.rshah.org/JjByteX" style="width:100%;height:auto;display:block;" alt="GitHub contributions" />';
    });
}

function tintEmptySquares(svg, isDark) {
  const tintColor = isDark ? '#0e0e20' : '#e8e4f5';
  svg.querySelectorAll('rect').forEach(rect => {
    if (rect.dataset.bg) return; // skip background rect
    const style = rect.getAttribute('style') || '';
    if (style.includes('#eeeeee')) {
      rect.style.fill = tintColor;
    }
  });
}
function transitionTint(svg, isDark) {
  const tintColor = isDark ? '#0e0e20' : '#e8e4f5';
  svg.querySelectorAll('rect').forEach(rect => {
    if (rect.dataset.bg) return; // keep background always transparent
    if (rect.style.fill) {
      rect.style.fill = tintColor;
    }
  });
}

// Re-fetch on theme change so tint color updates correctly
new MutationObserver(() => {
  requestAnimationFrame(() => {
    const svg = document.querySelector('#ghChart svg');
    if (!svg) return;
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    transitionTint(svg, isDark);
  });
}).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
});

loadGhChart();

