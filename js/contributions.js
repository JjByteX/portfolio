/* ─── CONTRIBUTIONS.JS ───────────────────────────────────
   Fetches contribution data from a public API and
   renders a heatmap calendar on <canvas>.
──────────────────────────────────────────────────────── */

const GITHUB_USERNAME = 'JjByteX';

const APIS = [
  `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`,
  `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}`,
];

const DARK_COLORS  = ['#1e1e2e', '#2d2b4e', '#5a3d8a', '#8b5cf6', '#cba6f7'];
const LIGHT_COLORS = ['#e4e0f5', '#c5b8e8', '#9d75d4', '#7a4cc0', '#5b21b6'];

// GitHub returns these exact hex colors for levels 0-4
const GH_COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];

function getColors() {
  return document.documentElement.getAttribute('data-theme') === 'light'
    ? LIGHT_COLORS : DARK_COLORS;
}

/**
 * Map GitHub's own color string to a 0-4 level index,
 * then return our themed palette color for that level.
 * This gives accurate density variation matching real GitHub.
 */
function getLevelColor(day, colors) {
  if (!day || day.contributionCount === 0) return colors[0];
  // Find closest GitHub level by matching the color field
  const ghColor = (day.color || '').toLowerCase();
  let level = 1; // default to lowest active
  if (ghColor === GH_COLORS[1]) level = 1;
  else if (ghColor === GH_COLORS[2]) level = 2;
  else if (ghColor === GH_COLORS[3]) level = 3;
  else if (ghColor === GH_COLORS[4]) level = 4;
  // Fallback: scale by count if color field missing
  else {
    const ratio = day.contributionCount / 10;
    level = ratio < 0.3 ? 1 : ratio < 0.6 ? 2 : ratio < 0.9 ? 3 : 4;
  }
  return colors[level];
}

function groupIntoWeeks(days) {
  if (!days.length) return [];
  const weeks = [];
  let week = [];
  const firstDow = new Date(days[0].date).getDay();
  for (let i = 0; i < firstDow; i++) week.push(null);
  days.forEach(day => {
    week.push(day);
    if (week.length === 7) { weeks.push(week); week = []; }
  });
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

function renderCalendar(days) {
  const canvas  = document.getElementById('contribCanvas');
  const loading = document.getElementById('contribLoading');
  if (!canvas) return;

  const weeks  = groupIntoWeeks(days);
  const colors = getColors();
  const CELL = 11, GAP = 3, STEP = 14;
  const PAD_TOP = 20, PAD_LEFT = 30;
  const W = PAD_LEFT + weeks.length * STEP;
  const H = PAD_TOP + 7 * STEP + 4;
  const DPR = window.devicePixelRatio || 1;

  canvas.width  = W * DPR;
  canvas.height = H * DPR;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);
  ctx.clearRect(0, 0, W, H);

  const mutedColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--muted').trim() || '#5a5a7a';

  ctx.font = `9px 'Share Tech Mono', monospace`;

  // Month labels — enforce minimum gap so they never overlap
  let lastMonth = -1;
  let lastLabelX = -99;
  weeks.forEach((week, wi) => {
    const firstReal = week.find(d => d !== null);
    if (!firstReal) return;
    const date = new Date(firstReal.date);
    const month = date.getMonth();
    const x = PAD_LEFT + wi * STEP;
    if (month !== lastMonth && x - lastLabelX > 28) {
      lastMonth = month;
      lastLabelX = x;
      ctx.fillStyle = mutedColor;
      ctx.fillText(date.toLocaleString('en', { month: 'short' }), x, 11);
    }
  });

  // Day labels
  ctx.textAlign = 'right';
  [['Mon', 1], ['Wed', 3], ['Fri', 5]].forEach(([lbl, row]) => {
    ctx.fillStyle = mutedColor;
    ctx.fillText(lbl, PAD_LEFT - 4, PAD_TOP + row * STEP + CELL - 2);
  });
  ctx.textAlign = 'left';

  // Squares
  weeks.forEach((week, wi) => {
    week.forEach((day, row) => {
      if (!day) return;
      ctx.fillStyle = getLevelColor(day, colors);
      ctx.beginPath();
      ctx.roundRect(PAD_LEFT + wi * STEP, PAD_TOP + row * STEP, CELL, CELL, 2);
      ctx.fill();
    });
  });

  canvas.style.display = 'block';
  if (loading) loading.style.display = 'none';
}

async function fetchWithFallback() {
  for (const url of APIS) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.contributions && Array.isArray(data.contributions)) {
        // Keep only the last 4 months
        const all = data.contributions;
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - 4);
        return all.filter(d => new Date(d.date) >= cutoff);
      }
    } catch (e) {
      console.warn('Contributions API failed:', url, e);
    }
  }
  return null;
}

async function initContributions() {
  const loading = document.getElementById('contribLoading');
  const canvas  = document.getElementById('contribCanvas');
  if (!canvas) return;
  canvas.style.display = 'none';

  const days = await fetchWithFallback();
  if (!days) {
    if (loading) loading.textContent = 'Could not load contributions.';
    return;
  }

  renderCalendar(days);
  new MutationObserver(() => renderCalendar(days))
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

initContributions();