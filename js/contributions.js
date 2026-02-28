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

      const svgWidth = parseFloat(w);
      svg.querySelectorAll('rect').forEach(rect => {
        const rectWidth = parseFloat(rect.getAttribute('width') || 0);
        if (rectWidth > svgWidth * 0.5) {
          rect.style.fill = 'transparent';
        }
      });

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
    const style = rect.getAttribute('style') || '';
    if (style.includes('#eeeeee')) {
      rect.style.fill = tintColor;
    }
  });
}

// On theme change, just reload the chart cleanly with correct tint
new MutationObserver(loadGhChart).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
});

loadGhChart();