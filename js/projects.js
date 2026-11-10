/* ─── PROJECTS.JS ────────────────────────────────────────
   Renders featured rows, compact grid, detail overlay and
   lightbox from window.PROJECTS (js/projects-data.js).
   Loads before scroll.js so reveal classes are observed.
──────────────────────────────────────────────────────── */
(function () {
  const data = window.PROJECTS;
  const rows = document.getElementById('ppRows');
  const grid = document.getElementById('ppGrid');
  const ov   = document.getElementById('ppOverlay');
  const lb   = document.getElementById('ppLightbox');
  if (!Array.isArray(data) || !rows || !grid || !ov || !lb) return;

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ARROW = '<i class="ph ph-arrow-right" aria-hidden="true"></i>';

  rows.innerHTML = data.filter(p => p.kind === 'featured').map(p => {
    const cover = p.images && p.images.length
      ? `<img src="${esc(p.images[0])}" alt="${esc(p.title)}" loading="lazy" />`
      : `<div class="pp-wordmark">${esc(p.title)}</div>`;
    return `<article class="pp-row fade-up">
      <div class="pp-row-text">
        <h3 class="pp-row-title">${esc(p.title)}</h3>
        <p class="pp-row-desc">${esc(p.summary)}</p>
        <hr class="pp-row-line" />
        <p class="pp-row-over">${esc(p.overview || '')}</p>
        <button class="pp-link" data-pp="${esc(p.id)}">${esc(p.title)} case study ${ARROW}</button>
      </div>
      <button class="pp-cover" data-pp="${esc(p.id)}" aria-label="${esc(p.title)}">${cover}</button>
    </article>`;
  }).join('');

  grid.innerHTML = data.filter(p => p.kind === 'grid').map((p, i) => `
    <button class="pp-card fade-up" data-pp="${esc(p.id)}" style="transition-delay:${(i % 3) * 0.08}s">
      ${p.images && p.images.length
        ? `<img class="pp-card-img" src="${esc(p.images[0])}" alt="${esc(p.title)}" loading="lazy" />`
        : `<span class="pp-card-img pp-card-title">${esc(p.title)}</span>`}
      <span class="pp-card-body">
        <span class="pp-card-metric">${esc(p.metric || '')}</span>
        <span class="pp-card-desc">${esc(p.summary)}</span>
      </span>
    </button>`).join('');

  /* ── Detail overlay ── */
  function openDetail(id) {
    const p = data.find(x => x.id === id);
    if (!p) return;
    const list = a => (a || []).map(t => `<li>${esc(t)}</li>`).join('');
    ov.innerHTML = `<div class="pp-d-wrap">
      <button class="pp-close" id="ppClose"><i class="ph ph-arrow-left" aria-hidden="true"></i> All projects</button>
      <div class="pp-d-grid">
        <div class="pp-d-main">
          <h2 class="pp-d-title">${esc(p.title)}</h2>
          <p class="pp-d-desc">${esc(p.summary)}</p>
          ${p.link ? `<a class="pp-pill" href="${esc(p.link.url)}" target="_blank" rel="noopener noreferrer">${esc(p.link.label)} ${ARROW}</a>` : '<div style="height:1.5rem"></div>'}
          <h3 class="pp-d-h">About the project</h3>
          ${(p.about || []).map(t => `<p>${esc(t)}</p>`).join('')}
        </div>
        <aside class="pp-d-side">
          <div><h3 class="pp-d-h">Role</h3><p>${esc(p.role || '')}${p.status ? ' · ' + esc(p.status) : ''}</p></div>
          <div><h3 class="pp-d-h">Provided services</h3><ul>${list(p.services)}</ul></div>
          <div><h3 class="pp-d-h">Technology stack</h3><ul>${list(p.stack)}</ul></div>
        </aside>
      </div>
      ${p.results && p.results.length ? `<div class="pp-d-results"><h3>Key results and outcomes</h3><div class="pp-d-rgrid">${p.results.map(r => `<div>${esc(r)}</div>`).join('')}</div></div>` : ''}
      ${p.images && p.images.length ? `<div class="pp-d-shots">${p.images.map((src, i) => `<img src="${esc(src)}" alt="${esc(p.title)} screenshot ${i + 1}" data-shot="${i}" loading="lazy" />`).join('')}</div>` : ''}
    </div>`;
    ov.classList.add('open');
    ov.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    ov.querySelector('#ppClose').addEventListener('click', closeDetail);
    ov.querySelectorAll('[data-shot]').forEach(img => img.addEventListener('click', () => openLb(p.images, +img.dataset.shot)));
  }
  function closeDetail() { ov.classList.remove('open'); document.body.style.overflow = ''; }

  /* ── Lightbox ── */
  let imgs = [], cur = 0;
  function showLb() { lb.querySelector('img').src = imgs[cur]; lb.querySelectorAll('.pp-lb-p,.pp-lb-n').forEach(b => b.style.display = imgs.length > 1 ? '' : 'none'); }
  function openLb(list, i) {
    imgs = list; cur = i;
    lb.innerHTML = '<button class="pp-lb-btn pp-lb-x" aria-label="Close"><i class="ph ph-x" aria-hidden="true"></i></button><button class="pp-lb-btn pp-lb-p" aria-label="Previous"><i class="ph ph-caret-left" aria-hidden="true"></i></button><img alt="" /><button class="pp-lb-btn pp-lb-n" aria-label="Next"><i class="ph ph-caret-right" aria-hidden="true"></i></button>';
    lb.querySelector('.pp-lb-x').onclick = closeLb;
    lb.querySelector('.pp-lb-p').onclick = () => { cur = (cur - 1 + imgs.length) % imgs.length; showLb(); };
    lb.querySelector('.pp-lb-n').onclick = () => { cur = (cur + 1) % imgs.length; showLb(); };
    lb.onclick = e => { if (e.target === lb) closeLb(); };
    showLb(); lb.classList.add('open');
  }
  function closeLb() { lb.classList.remove('open'); }

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-pp]');
    if (t) openDetail(t.dataset.pp);
  });
  document.addEventListener('keydown', e => {
    if (lb.classList.contains('open')) {
      if (e.key === 'Escape') closeLb();
      else if (imgs.length > 1 && e.key === 'ArrowLeft') { cur = (cur - 1 + imgs.length) % imgs.length; showLb(); }
      else if (imgs.length > 1 && e.key === 'ArrowRight') { cur = (cur + 1) % imgs.length; showLb(); }
    } else if (e.key === 'Escape' && ov.classList.contains('open')) closeDetail();
  });
})();
