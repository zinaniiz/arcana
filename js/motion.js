/* ARCANA · motion layer
   로더 → 첫 화면 등장 · 부드러운 스크롤(Lenis) · 스크롤 리빌 · 패럴랙스 · 커서 · 마그네틱 · 딸깍 프레스 */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const Sound = window.ArcanaSound;
  const ss = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };

  root.classList.add('js-motion');

  /* ── 1. 로더: 세션당 한 번, 1.3초 ── */
  const loader = $('#loader');
  const ready = () => root.classList.add('is-ready');
  if (reduce || ss.get('arcana-intro')) { loader.classList.add('is-skip'); requestAnimationFrame(ready); }
  else {
    ss.set('arcana-intro', '1');
    const finish = () => { loader.classList.add('is-done'); setTimeout(ready, 380); };
    setTimeout(finish, 1350);
  }

  /* ── 2. 부드러운 스크롤 ── */
  let lenis = null;
  if (!reduce && window.Lenis) {
    root.style.scrollBehavior = 'auto';
    lenis = window.__lenis = new window.Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true, wheelMultiplier: .95,
      prevent: (node) => !!node.closest('.sheet, .consult, .path__track') });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    // 서랍 패널 · 상담이 열리면 배경 스크롤 정지
    new MutationObserver(() => { document.body.classList.contains('is-locked') ? lenis.stop() : lenis.start(); })
      .observe(document.body, { attributes: true, attributeFilter: ['class'] });
    // 앵커 링크도 부드럽게
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]'); if (!a) return;
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const el = document.querySelector(id); if (!el) return;
      e.preventDefault(); lenis.scrollTo(el, { offset: -70, duration: 1.6 });
    });
  }

  /* ── 3. nav: 내려가면 숨고 올라가면 나타남 ── */
  const nav = $('#nav'); let lastY = 0;
  const onScrollNav = () => {
    const y = window.scrollY;
    if (y > 240 && y > lastY + 4) nav.classList.add('is-hidden');
    else if (y < lastY - 4 || y < 240) nav.classList.remove('is-hidden');
    lastY = y;
  };
  window.addEventListener('scroll', onScrollNav, { passive: true });

  /* ── 4. 스크롤 리빌 (첫 화면 아래에 있는 것만 숨겼다가 드러냄) ── */
  if (!reduce) {
    const vh = window.innerHeight;
    const below = (el) => el.getBoundingClientRect().top > vh * .92;

    // 제목: 어절 단위로 마스크 안에서 올라온다
    const splitWords = (el) => {
      let i = 0;
      const walk = (node) => {
        [...node.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            const parts = n.textContent.split(/(\s+)/);
            const frag = document.createDocumentFragment();
            parts.forEach((p) => {
              if (!p) return;
              if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
              const w = document.createElement('span'); w.className = 'split-w';
              const s = document.createElement('span'); s.textContent = p; s.style.setProperty('--i', i++);
              w.appendChild(s); frag.appendChild(w);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
        });
      };
      walk(el);
    };
    const heads = $$('.sechead');
    heads.forEach((h) => { const t = $('.h2', h); if (t) splitWords(t); });
    const finaleH = $('.finale .h2'); if (finaleH) splitWords(finaleH);
    const introT = $('.intro__text');

    const targets = [];
    const add = (el, pre, inn) => { if (!el || !below(el)) return; el.classList.add(...pre.split(' ')); targets.push([el, inn]); };

    heads.forEach((h) => add(h, 'split-pre line-pre', 'split-in line-in'));
    if (finaleH) add(finaleH.parentElement, 'split-pre', 'split-in');
    add(introT, 'rv-pre', 'rv-in');
    $$('.intro__cta, .apo__toolbar, .concept__grid > div, .path__head').forEach((el) => add(el, 'rv-pre', 'rv-in'));
    // 이미지는 아래에서 위로 걷히며 드러남
    $$('.onebottle, .pkg figure, .scene-card, .duo__tile').forEach((el) => add(el, 'img-pre', 'img-in'));
    // 칸칸이 순서대로
    const stag = (sel) => $$(sel).forEach((wrap) => { [...wrap.children].forEach((c, k) => c.style.setProperty('--si', k % 12)); add(wrap, 'stagger-pre', 'stagger-in'); });
    stag('.chest'); stag('.lines'); stag('.specimens'); stag('.pkg__list'); stag('.onebottle__cols'); stag('.promises'); stag('.path__track');
    $$('.lattice-frame').forEach((el) => add(el, 'rv-pre', 'rv-in'));
    // 약장 칸은 한 칸씩 빛이 켜지듯
    const cab = $('#cabinet');
    if (cab && below(cab)) {
      const cells = $$('.cell, .cab__row, .cab__head', cab);
      cells.forEach((c, k) => { c.style.transitionDelay = (k % 6) * 45 + Math.floor(k / 6) * 70 + 'ms'; c.classList.add('rv-pre'); });
      targets.push([cab, '__cells']);
    }

    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const pair = targets.find((p) => p[0] === e.target); if (!pair) return;
      if (pair[1] === '__cells') {
        $$('.rv-pre', e.target).forEach((c) => { c.classList.add('rv-in'); c.classList.remove('rv-pre');
          setTimeout(() => { c.style.transitionDelay = ''; c.classList.remove('rv-in'); }, 2200); });
      } else {
        const [pre] = [e.target.className];
        e.target.classList.add(...pair[1].split(' '));
        e.target.classList.remove('rv-pre', 'split-pre', 'line-pre', 'img-pre', 'stagger-pre');
        // 리빌이 끝나면 클래스를 정리해 원래 hover/transform이 살아나게
        setTimeout(() => e.target.classList.remove('rv-in', 'img-in', 'stagger-in'), 2400);
      }
      io.unobserve(e.target);
    }), { threshold: .14, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(([el]) => io.observe(el));
  }

  /* ── 5. 패럴랙스 ── */
  if (!reduce) {
    const px = $$('.onebottle img, .pkg img, .scene-card img, .finale__img, .cover__in').map((el) => ({ el, k: el.classList.contains('cover__in') ? -.18 : el.classList.contains('finale__img') ? .12 : .08 }));
    px.forEach(({ el }) => el.classList.add('px'));
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      px.forEach(({ el, k }) => {
        const host = el.classList.contains('cover__in') ? el.parentElement : el.parentElement;
        const r = host.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const c = (r.top + r.height / 2 - vh / 2);
        if (el.classList.contains('cover__in')) { el.style.transform = `translate3d(0, ${(-r.top * .25).toFixed(1)}px, 0)`; el.style.opacity = Math.max(0, 1 - (-r.top) / (r.height * .8)).toFixed(3); }
        else if (el.closest('.img-pre')) return;
        else el.style.transform = `translate3d(0, ${(c * -k).toFixed(1)}px, 0) scale(1.1)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ── 6. 딸깍: 누르는 순간 스프링 + 링 + 소리 + 진동 ── */
  const PRESS = 'button, a, .cell, .cab__row, .cab__head, .pitem, .spec, .opt, .comp, .fcol, .minicab__d, .duo__tile, .secret__a, [role="tab"]';
  document.addEventListener('pointerdown', (e) => {
    const t = e.target.closest(PRESS); if (!t || t.closest('.role__face') || t.disabled) return;
    t.classList.remove('is-press'); void t.offsetWidth; t.classList.add('is-press');
    setTimeout(() => t.classList.remove('is-press'), 450);
    if (!reduce) {
      const r = document.createElement('span'); r.className = 'ripple';
      r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
      document.body.appendChild(r); setTimeout(() => r.remove(), 720);
    }
    if (Sound) Sound.click();
    if (navigator.vibrate && e.pointerType === 'touch') { try { navigator.vibrate(8); } catch (err) {} }
  }, { passive: true });

  /* ── 7. 커서 ── */
  if (fine && !reduce) {
    const cur = $('#cursor'), lab = $('.cursor__label', cur);
    let x = -100, y = -100, cx = x, cy = y;
    window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; cur.classList.add('is-on'); }, { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.remove('is-on'));
    window.addEventListener('pointerdown', () => cur.classList.add('is-down'));
    window.addEventListener('pointerup', () => cur.classList.remove('is-down'));
    const loop = () => { cx += (x - cx) * .2; cy += (y - cy) * .2; cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)` + (cur.classList.contains('is-down') ? ' scale(.82)' : ''); requestAnimationFrame(loop); };
    loop();
    const LABELS = [['.cell, .cab__row, .minicab__d', 'OPEN'], ['.spec', 'TURN'], ['.scene-card, .onebottle, .pkg figure', 'VIEW'], ['.pitem', 'SEE']];
    document.addEventListener('pointerover', (e) => {
      const l = LABELS.find(([s]) => e.target.closest(s));
      const link = e.target.closest('a, button, [role="tab"], .role__face, .opt, .comp, .fcol, .secret__a, .cab__head');
      cur.classList.toggle('is-label', !!l && !(l[1] === 'DRAG' && link));
      lab.textContent = l && !(l[1] === 'DRAG' && link) ? l[1] : '';
      cur.classList.toggle('is-link', !l && !!link);
    });
  }

  /* ── 8. 마그네틱 버튼 ── */
  if (fine && !reduce) {
    $$('.btn, .cover__arrow, .path__next').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / r.width, dy = (e.clientY - r.top - r.height / 2) / r.height;
        b.style.transform = `translate(${(dx * 10).toFixed(1)}px, ${(dy * 8).toFixed(1)}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }
})();

/* 상단 로고 = 홈: 열린 서랍·상담을 닫고 맨 위로 */
(() => {
  const mark = document.querySelector('.nav__mark'); if (!mark) return;
  mark.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    document.querySelectorAll('[data-close], #consultClose').forEach((b) => { if (b.closest('.is-open')) b.click(); });
    document.body.classList.remove('is-locked');
    const top = () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.4 }); else top();
    try { history.replaceState(null, '', location.pathname + location.search); } catch (err) {}
  }, true);
})();
