function loadGhChart() {
  const wrap = document.getElementById('ghChart');
  if (!wrap) return;

  fetch('https://corsproxy.io/?https://ghchart.rshah.org/JjByteX')
    .then(r => r.text())
    .then(svgText => {
      wrap.innerHTML = svgText;
const svg = wrap.querySelector('svg');
if (!svg) return;

// Make it responsive
const w = svg.getAttribute('width') || 663;
const h = svg.getAttribute('height') || 104;
svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
svg.removeAttribute('width');
svg.removeAttribute('height');

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
      rect.setAttribute('style', style.replace('#eeeeee', tintColor));
    }
  });
}

function transitionTint(svg, isDark) {
  const tintColor = isDark ? '#0e0e20' : '#e8e4f5';
  svg.querySelectorAll('rect').forEach(rect => {
    const style = rect.getAttribute('style') || '';
    // Match either the dark or light tint so it swaps correctly
    if (style.includes('#0e0e20') || style.includes('#e8e4f5') || style.includes('#eeeeee')) {
      rect.setAttribute('style', style
        .replace('#0e0e20', tintColor)
        .replace('#e8e4f5', tintColor)
        .replace('#eeeeee', tintColor)
      );
    }
  });
}

// Re-fetch on theme change so tint color updates correctly
new MutationObserver(() => {
  const svg = document.querySelector('#ghChart svg');
  if (!svg) return;
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  transitionTint(svg, isDark);
}).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
});

loadGhChart();

