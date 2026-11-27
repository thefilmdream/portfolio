/* =========================================================
   林知 LIN ZHI — Portfolio interactions
   - preloader, staggered reveals, nav theming, custom cursor,
     draggable project rail, index preview, mobile menu
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------------- preloader ---------------- */
  const loader = $('.loader');
  const pctEl = $('.loader__pct');
  const barEl = $('.loader__bar i');
  document.body.classList.add('is-locked');

  let progress = 0;
  let done = false;
  const tick = () => {
    progress = Math.min(progress + Math.random() * 13 + 5, 100);
    if (pctEl) pctEl.textContent = String(Math.round(progress)).padStart(2, '0');
    if (barEl) barEl.style.transform = `scaleX(${progress / 100})`;
    if (progress < 100) {
      setTimeout(tick, 90 + Math.random() * 90);
    } else if (!done) {
      finish();
    }
  };

  const finish = () => {
    if (done) return;
    done = true;
    loader?.classList.add('is-done');
    document.body.classList.remove('is-locked');
    document.documentElement.classList.add('is-ready');
    setTimeout(() => heroReveal(), 120);
    setTimeout(() => loader?.remove(), 1200);
  };

  const heroReveal = () => {
    const hero = $('.hero');
    if (!hero) return;
    const revs = $$('.rev', hero);
    revs.forEach((el, i) => {
      el.style.setProperty('--d', `${0.06 + i * 0.075}s`);
      el.classList.add('in');
    });
    const foot = $$('.hero__foot .rev, .hero__scroll');
    foot.forEach((el, i) => {
      el.style.setProperty('--d', `${0.5 + i * 0.08}s`);
      el.classList.add('in');
    });
  };

  if (reduce) { finish(); } else { setTimeout(tick, 180); }
  window.addEventListener('load', () => { if (!done) progress = Math.max(progress, 55); });
  setTimeout(() => { if (!done) finish(); }, 3800);

  /* ---------------- scroll reveals ---------------- */
  const revEls = $$('.rev').filter((el) => !el.closest('.hero'));
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = Array.from(el.parentElement?.children || []).filter((n) => n.classList?.contains('rev'));
        const idx = Math.max(0, siblings.indexOf(el));
        el.style.setProperty('--d', `${Math.min(idx * 0.09, 0.45)}s`);
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revEls.forEach((el) => io.observe(el));
  } else {
    revEls.forEach((el) => el.classList.add('in'));
  }

  // generic fade-ups for smaller blocks
  if ('IntersectionObserver' in window && !reduce) {
    const faders = $$('.card, .m, .approach__list li, .about__portrait, .sec-head, .index__list li');
    faders.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(26px)';
      el.style.transition = 'opacity .9s cubic-bezier(.16,1,.3,1), transform 1.1s cubic-bezier(.16,1,.3,1)';
    });
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const i = faders.indexOf(el);
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        }, Math.min((i % 6) * 60, 240));
        io2.unobserve(el);
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.05 });
    faders.forEach((el) => io2.observe(el));
  }

  /* ---------------- nav theming ---------------- */
  const nav = $('.nav');
  const themeSections = [
    [$('.hero'), 'dark'],
    [$('.manifesto'), 'light'],
    [$('.work'), 'dark'],
    [$('.about'), 'light'],
    [$('.approach'), 'dark'],
    [$('.style'), 'light'],
    [$('.contact'), 'dark'],
  ].filter(([el]) => el);

  let lastTheme = '';
  const updateNav = () => {
    const y = (nav?.offsetHeight || 64) * 0.62;
    let theme = 'dark';
    themeSections.forEach(([el, t]) => {
      const r = el.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) theme = t;
    });
    const scrolled = window.scrollY > (window.innerHeight * 0.55);
    nav?.classList.toggle('is-scrolled', window.scrollY > 24);
    if (theme !== lastTheme) {
      nav?.classList.toggle('is-dark-text', theme === 'light');
      nav?.classList.toggle('is-light-text', theme === 'dark');
      lastTheme = theme;
    }
    // solid backdrop only over light sections
    const solid = theme === 'light' && scrolled;
    nav?.classList.toggle('is-solid', solid);
    if (solid) nav?.classList.add('is-dark-text');
  };

  /* ---------------- custom cursor ---------------- */
  if (fine && !reduce) {
    const cursor = $('.c-cursor');
    const dot = $('.c-cursor__dot');
    const label = $('.c-cursor__label');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let cx = mx, cy = my;
    let raf = 0;
    const loop = () => {
      cx += (mx - cx) * 0.2;
      cy += (my - cy) * 0.2;
      if (cursor) cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (!cursor?.classList.contains('is-on')) cursor?.classList.add('is-on');
    }, { passive: true });
    window.addEventListener('pointerdown', () => dot && (dot.style.transform = 'scale(.7)'));
    window.addEventListener('pointerup', () => dot && (dot.style.transform = ''));
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-cursor], a, button');
      if (!t) { cursor?.classList.remove('is-label', 'is-link'); return; }
      const txt = t.getAttribute('data-cursor');
      if (txt && label) { label.textContent = txt; cursor?.classList.add('is-label'); cursor?.classList.remove('is-link'); }
      else { cursor?.classList.add('is-link'); cursor?.classList.remove('is-label'); }
    });
    document.addEventListener('pointerleave', () => cursor?.classList.remove('is-on'));
    raf = requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(loop);
    });
  }

  /* ---------------- project rail: drag + wheel ---------------- */
  const rail = $('[data-rail]');
  const track = $('.rail__track', rail || document);
  if (rail && track) {
    let down = false, startX = 0, startLeft = 0, moved = 0, pid = null;

    const onDown = (e) => {
      if (e.pointerType === 'touch') return;
      down = true; moved = 0; pid = e.pointerId;
      startX = e.clientX; startLeft = track.scrollLeft;
      rail.classList.add('is-dragging');
      try { track.setPointerCapture(pid); } catch {}
    };
    const onMove = (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      track.scrollLeft = startLeft - dx;
      if (moved > 6) e.preventDefault();
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      rail.classList.remove('is-dragging');
      try { track.releasePointerCapture(pid); } catch {}
    };
    track.addEventListener('pointerdown', onDown);
    track.addEventListener('pointermove', onMove, { passive: false });
    track.addEventListener('pointerup', onUp);
    track.addEventListener('pointercancel', onUp);
    track.addEventListener('dragstart', (e) => e.preventDefault());
    track.addEventListener('click', (e) => { if (moved > 8) { e.preventDefault(); e.stopPropagation(); } }, true);

    track.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const atStart = track.scrollLeft <= 0 && e.deltaY < 0;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1 && e.deltaY > 0;
      if (atStart || atEnd) return;
      e.preventDefault();
      track.scrollLeft += e.deltaY * 1.15;
    }, { passive: false });
  }

  /* ---------------- index hover preview ---------------- */
  const preview = $('.index__preview');
  const previewImg = preview ? $('img', preview) : null;
  if (preview && previewImg && fine && !reduce) {
    let px = 0, py = 0, tx = 0, ty = 0, pRaf = 0, active = false;
    const ploop = () => {
      px += (tx - px) * 0.18;
      py += (ty - py) * 0.18;
      preview.style.left = `${px}px`;
      preview.style.top = `${py}px`;
      pRaf = requestAnimationFrame(ploop);
    };
    $$('[data-preview]').forEach((li) => {
      li.addEventListener('pointerenter', () => {
        previewImg.src = li.getAttribute('data-preview');
        preview.classList.add('is-on');
        if (!active) { active = true; pRaf = requestAnimationFrame(ploop); }
      });
      li.addEventListener('pointerleave', () => preview.classList.remove('is-on'));
    });
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX + 120; ty = e.clientY;
      px = px || tx; py = py || ty;
    }, { passive: true });
    document.addEventListener('pointerleave', () => preview.classList.remove('is-on'));
  }

  /* ---------------- mobile menu ---------------- */
  const burger = $('.nav__burger');
  if (burger) {
    const panel = document.createElement('div');
    panel.className = 'menu';
    panel.innerHTML = `
      <nav class="menu__nav" aria-label="行動版導覽">
        <a href="#work"><span>01</span>作品 <em>Work</em></a>
        <a href="#about"><span>02</span>關於 <em>About</em></a>
        <a href="#approach"><span>03</span>主張 <em>Approach</em></a>
        <a href="#style"><span>04</span>樣貌 <em>Style</em></a>
        <a href="#contact"><span>05</span>聯絡 <em>Contact</em></a>
      </nav>
      <p class="menu__foot">hello@linzhi.studio</p>`;
    document.body.appendChild(panel);

    const toggle = (open) => {
      const next = typeof open === 'boolean' ? open : !panel.classList.contains('is-open');
      panel.classList.toggle('is-open', next);
      burger.setAttribute('aria-expanded', String(next));
      document.body.classList.toggle('is-locked', next);
      const lines = $$('span', burger);
      if (lines[0]) lines[0].style.transform = next ? 'translateY(3.5px) rotate(45deg)' : '';
      if (lines[1]) lines[1].style.transform = next ? 'translateY(-3.5px) rotate(-45deg)' : '';
    };
    burger.addEventListener('click', () => toggle());
    $$('a', panel).forEach((a) => a.addEventListener('click', () => toggle(false)));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggle(false); });
  }

  /* ---------------- subtle parallax ---------------- */
  const heroTitle = $('.hero__title');
  const heroScribble = $('.hero__scribble');
  const cWatermark = $('.contact__watermark');
  let ticking = false;
  const onScroll = () => {
    updateNav();
    if (reduce) return;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const vh = window.innerHeight;
        if (heroTitle && y < vh * 1.2) {
          heroTitle.style.transform = `translate3d(0, ${y * 0.13}px, 0)`;
          heroTitle.style.opacity = String(clamp(1 - y / (vh * 0.95), 0, 1));
        }
        if (heroScribble && y < vh * 1.2) {
          heroScribble.style.transform = `translate3d(0, ${y * -0.06}px, 0) rotate(${y * 0.012}deg)`;
        }
        if (cWatermark) {
          const r = cWatermark.getBoundingClientRect();
          if (r.top < vh && r.bottom > 0) {
            const p = (vh - r.top) / (vh + r.height);
            cWatermark.style.transform = `translate3d(0, ${(p - 0.5) * -70}px, 0)`;
          }
        }
        ticking = false;
      });
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateNav();

  /* ---------------- active nav link ---------------- */
  if ('IntersectionObserver' in window) {
    const links = $$('.nav__links a');
    const map = new Map(links.map((a) => [a.getAttribute('href'), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const link = map.get('#' + entry.target.id);
        links.forEach((a) => a.classList.toggle('is-active', a === link));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['work', 'about', 'approach', 'style', 'contact'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }
})();
