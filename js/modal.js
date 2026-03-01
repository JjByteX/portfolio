/* ─── MODAL.JS ─────────────────────────────────────────── */
(function () {
  const overlay  = document.getElementById('projModal');
  const closeBtn = document.getElementById('projModalClose');
  const slidesEl = document.getElementById('mSlides');
  const dotsEl   = document.getElementById('mDots');
  const titleEl  = document.getElementById('mTitle');
  const badgesEl = document.getElementById('mBadges');
  const descEl   = document.getElementById('mDesc');
  const tagsEl   = document.getElementById('mTags');
  const prevBtn  = document.getElementById('mPrev');
  const nextBtn  = document.getElementById('mNext');

  if (!overlay) return;

  let images    = [];
  let current   = 0;
  let lightbox  = null;
  let lbCurrent = 0;

  /* ── Carousel ── */
  function buildCarousel(imgs) {
    images  = imgs;
    current = 0;

    slidesEl.innerHTML = '';
    imgs.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'modal-slide';
      const img = document.createElement('img');
      img.src = src; img.alt = `Screenshot ${i + 1}`; img.loading = 'lazy';
      slide.appendChild(img);
      slidesEl.appendChild(slide);
    });

    dotsEl.innerHTML = '';
    imgs.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'modal-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });

    /* Zoom button — injected once, persists */
    const carousel = document.getElementById('mCarousel');
    let zoomBtn = carousel.querySelector('.modal-zoom-btn');
    if (!zoomBtn) {
      zoomBtn = document.createElement('button');
      zoomBtn.className = 'modal-zoom-btn';
      zoomBtn.setAttribute('aria-label', 'View full image');
      zoomBtn.innerHTML = '<i data-lucide="zoom-in"></i>';
      zoomBtn.addEventListener('click', () => openLightbox(current));
      carousel.appendChild(zoomBtn);
      if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [zoomBtn] });
    }

    if (prevBtn) prevBtn.style.display = imgs.length <= 1 ? 'none' : '';
    if (nextBtn) nextBtn.style.display = imgs.length <= 1 ? 'none' : '';

    updateCarousel();
  }

  function goTo(index) {
    current = (index + images.length) % images.length;
    updateCarousel();
  }

  function updateCarousel() {
    slidesEl.style.transform = `translateX(-${current * 100}%)`;
    dotsEl.querySelectorAll('.modal-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));

  function onCarouselKey(e) {
    if (!overlay.classList.contains('open')) return;
    if (lightbox?.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  }

  /* ── Modal open / close ── */
  function openModal(card) {
    const imgs     = JSON.parse(card.dataset.images || '[]');
    const title    = card.querySelector('.proj-name')?.textContent || '';
    const desc     = card.querySelector('.proj-desc')?.textContent || '';
    const tagNodes = card.querySelectorAll('.proj-tag');

    titleEl.textContent = title;

    /* Badges: intentionally empty — tags only in TECH STACK, zero duplication */
    badgesEl.innerHTML = '';

    descEl.textContent = desc;

    /* Tags — rendered exactly once */
    tagsEl.innerHTML = '';
    tagNodes.forEach(t => {
      const span = document.createElement('span');
      span.className   = t.className;
      span.textContent = t.textContent;
      tagsEl.appendChild(span);
    });

    buildCarousel(imgs.length ? imgs : []);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onModalKey);
  }

function closeModal() {
  const overlay = document.getElementById('projModal');
  overlay.classList.add('closing');
  setTimeout(() => {
    overlay.classList.remove('open', 'closing');
    document.body.style.overflow = '';
  }, 320);
}

  function onModalKey(e) {
    if (e.key === 'Escape') { closeModal(); return; }
    onCarouselKey(e);
  }

  document.querySelectorAll('.proj-card[data-modal]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.proj-filter-btn')) openModal(card);
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  /* ── Lightbox ── */
  function buildLightbox() {
    if (lightbox) return;
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox-overlay';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Full image viewer');
    lightbox.innerHTML = `
      <div class="lightbox-frame">
        <div class="lightbox-frame-inner">
          <button class="lightbox-close" id="lbClose" aria-label="Close lightbox"><i data-lucide="x"></i></button>
          <span class="lightbox-counter" id="lbCounter"></span>
          <img class="lightbox-img" id="lbImg" src="" alt="Full screenshot" />
          <button class="lightbox-nav lightbox-nav-prev" id="lbPrev" aria-label="Previous image"><i data-lucide="chevron-left"></i></button>
          <button class="lightbox-nav lightbox-nav-next" id="lbNext" aria-label="Next image"><i data-lucide="chevron-right"></i></button>
        </div>
      </div>`;
    document.body.appendChild(lightbox);
    if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [lightbox] });
    lightbox.querySelector('#lbClose').addEventListener('click', closeLightbox);
    lightbox.querySelector('#lbPrev').addEventListener('click', () => lbGoTo(lbCurrent - 1));
    lightbox.querySelector('#lbNext').addEventListener('click', () => lbGoTo(lbCurrent + 1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  }

  function openLightbox(index) {
    buildLightbox();
    lbCurrent = index;
    lightbox.classList.toggle('single', images.length <= 1);
    updateLightbox();
    lightbox.classList.add('open');
    document.addEventListener('keydown', onLightboxKey);
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.removeEventListener('keydown', onLightboxKey);
  }

  function lbGoTo(index) {
    lbCurrent = (index + images.length) % images.length;
    updateLightbox();
  }

  function updateLightbox() {
    if (!lightbox) return;
    const img = lightbox.querySelector('#lbImg');
    const ctr = lightbox.querySelector('#lbCounter');
    img.style.opacity = '0';
    setTimeout(() => { img.src = images[lbCurrent]; img.style.opacity = '1'; }, 150);
    ctr.textContent = images.length > 1
      ? `${String(lbCurrent + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}` : '';
    goTo(lbCurrent);
  }

  function onLightboxKey(e) {
    if (e.key === 'Escape')     { closeLightbox(); return; }
    if (e.key === 'ArrowLeft')  lbGoTo(lbCurrent - 1);
    if (e.key === 'ArrowRight') lbGoTo(lbCurrent + 1);
  }
})();