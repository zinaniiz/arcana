/* ARCANA — 메뉴 패널(단계별) + 서랍장(장바구니) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const won = (n) => '₩' + n.toLocaleString('ko-KR');
  const html = document.documentElement;
  const cat = (k) => CATEGORIES.find((c) => c.key === k);
  const drw = (no) => DRAWERS.find((d) => d.no === no);

  /* ───────── 메뉴 패널 ───────── */
  const VIEWS = {
    root: { title: 'ARCANA', items: [
      { t: 'About', s: '브랜드 스토리', go: 'about' },
      { t: 'Shop', s: '라인별 · 제품별', go: 'shop' },
      { t: 'Le Rituel', s: '아침 · 한낮 · 밤의 순서', href: '#rituel' },
      { t: "L'Espace", s: '매장 공간', href: '#boutique' },
      { t: 'Ordonnance', s: '처방전 갤러리', href: '#ordonnance' },
      { sep: true },
      { t: '처방받기', s: '오늘의 서랍 고르기', act: 'consult', kr: true },
      { t: '서랍장', s: '담아 둔 제품', act: 'cab', kr: true },
    ] },
    about: { title: 'About', groups: [{ h: '브랜드', items: [
      { t: '브랜드 스토리', href: '#concept', kr: true },
      { t: '서랍의 철학', href: '#roles', kr: true },
      { t: '원료 이야기', href: '#herbier', kr: true },
      { t: '하나의 병, 다섯 가지 투명도', href: '#bottle', kr: true },
      { t: '패키지', href: '#coffret', kr: true },
    ] }] },
    shop: { title: 'Shop', groups: [
      { h: '카테고리', items: [
        ...CATEGORIES.map((c) => ({ t: `${c.ko}`, s: c.fr, cat: c.key, kr: true })),
        { t: '코프레 세트', s: 'Coffret · 5단계', href: '#coffret', kr: true },
        { t: '모든 제품 보기', href: '#apothicaire', kr: true, all: true },
      ] },
      { h: '제품 라인', items: [
        ...DRAWERS.map((d) => ({ t: d.fr, s: `N°${d.no} · ${d.concern} · ${d.ko}`, line: d.no })),
        { t: '모든 제품 보기', href: '#apothicaire', kr: true, all: true },
      ] },
    ] },
  };
  const item = (i) => {
    if (i.sep) return '<li class="mp-sep" aria-hidden="true"></li>';
    const attrs = i.go ? `data-go="${i.go}"` : i.href ? `data-href="${i.href}"` : i.cat ? `data-cat="${i.cat}"` : i.line ? `data-line="${i.line}"` : `data-act="${i.act}"`;
    return `<li><button class="mp-row${i.kr ? ' mp-row--kr' : ''}${i.all ? ' mp-row--all' : ''}" ${attrs}><span><b>${i.t}</b>${i.s ? `<small>${i.s}</small>` : ''}</span>${i.go ? '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>' : ''}</button></li>`;
  };
  const render = (key) => {
    const v = VIEWS[key];
    const body = v.items ? `<ul class="mp-list">${v.items.map(item).join('')}</ul>`
      : v.groups.map((g) => `<p class="mp-h">${g.h}</p><ul class="mp-list">${g.items.map(item).join('')}</ul>`).join('');
    return `<div class="mp-view" data-view="${key}">${body}</div>`;
  };
  const mp = $('#mpanel'), views = $('#mpViews'), back = $('#mpBack'), title = $('#mpTitle'), opener = $('#menuOpen');
  const stack = [];
  const show = (key, dir = 1) => {
    views.innerHTML = render(key);
    const v = views.firstElementChild; v.classList.add(dir > 0 ? 'from-r' : 'from-l');
    requestAnimationFrame(() => v.classList.remove('from-r', 'from-l'));
    title.textContent = VIEWS[key].title; back.hidden = stack.length === 0; views.scrollTop = 0;
  };
  const openMenu = (key = 'root') => {
    stack.length = 0; if (key !== 'root') stack.push('root');
    show(key); mp.classList.add('is-on'); mp.setAttribute('aria-hidden', 'false'); opener?.setAttribute('aria-expanded', 'true'); html.classList.add('is-locked');
    window.__lenis?.stop?.();
  };
  const closeMenu = () => { mp.classList.remove('is-on'); mp.setAttribute('aria-hidden', 'true'); opener?.setAttribute('aria-expanded', 'false'); unlock(); };
  const unlock = () => { if (!mp.classList.contains('is-on') && !cab.classList.contains('is-on')) { html.classList.remove('is-locked'); window.__lenis?.start?.(); } };
  const goTo = (hash) => { const el = document.querySelector(hash === '#top' ? 'main' : hash); if (!el) return; if (window.__lenis) window.__lenis.scrollTo(el, { offset: -64 }); else el.scrollIntoView({ behavior: 'smooth' }); };

  opener?.addEventListener('click', () => openMenu());
  back.addEventListener('click', () => { const k = stack.pop() || 'root'; show(k, -1); });
  mp.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) return closeMenu();
    const r = e.target.closest('.mp-row'); if (!r) return;
    if (r.dataset.go) { stack.push(views.firstElementChild.dataset.view); show(r.dataset.go); return; }
    closeMenu();
    if (r.dataset.href) setTimeout(() => goTo(r.dataset.href), 80);
    else if (r.dataset.cat) window.ArcanaOpen.category(r.dataset.cat);
    else if (r.dataset.line) window.ArcanaOpen.drawer(r.dataset.line);
    else if (r.dataset.act === 'consult') window.ArcanaOpen.consult();
    else if (r.dataset.act === 'cab') openCab();
  });

  /* ───────── 서랍장 (장바구니) ───────── */
  const KEY = 'arcana-cabinet';
  let items = [];
  try { items = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { items = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} };
  const info = (it) => {
    const d = drw(it.no);
    if (it.k === 'coffret') return { name: `N°${d.no} ${d.fr} Coffret`, sub: `${d.concern} · 5단계 세트`, price: COFFRET_PRICE, img: 'assets/img/pkg-coffret.jpg', set: true };
    const c = cat(it.k);
    return { name: `ARCANA N°${d.no} ${c.fr}`, sub: `${c.ko} · ${c.vol} · ${d.concern}`, price: c.price, img: `assets/img/bottle/${c.key}.webp` };
  };
  const count = () => items.reduce((s, i) => s + i.q, 0);
  const cab = $('#cab'), body = $('#cabBody');
  const paintCount = () => {
    const n = count();
    document.querySelectorAll('#cabCount, [data-count]').forEach((b) => { b.textContent = n; b.hidden = n === 0; });
  };
  const paint = () => {
    paintCount();
    if (!items.length) {
      body.innerHTML = `<div class="cab-empty">
        <img src="assets/img/pkg-cabinet.jpg" alt="" />
        <h3>서랍장</h3>
        <p>서랍장이 아직 비어 있어요.<br/>마음에 드는 서랍을 열어 하나씩 담아 보세요.</p>
        <ul class="cab-links"><li><button data-c="shop">제품별로 보기</button></li><li><button data-c="line">라인별로 보기</button></li><li><button data-c="consult">처방받고 고르기</button></li></ul></div>`;
      return;
    }
    const total = items.reduce((s, i) => s + info(i).price * i.q, 0);
    body.innerHTML = `<p class="cab-note">${count()}개의 보틀이 서랍장에 담겨 있어요</p>
      <ul class="cab-list">${items.map((it, n) => { const f = info(it); return `
        <li class="cab-item${f.set ? ' cab-item--set' : ''}">
          <button class="cab-item__img" data-view="${n}"><img src="${f.img}" alt="" /></button>
          <div class="cab-item__txt"><b>${f.name}</b><small>${f.sub}</small>
            <div class="cab-qty"><button data-dec="${n}" aria-label="하나 빼기">−</button><span>${it.q}</span><button data-inc="${n}" aria-label="하나 더">+</button></div></div>
          <div class="cab-item__right"><span>${won(f.price * it.q)}</span><button class="cab-rm" data-rm="${n}">비우기</button></div>
        </li>`; }).join('')}</ul>
      <div class="cab-sum"><dl><dt>소계</dt><dd>${won(total)}</dd><dt>배송</dt><dd>${total >= 100000 ? '무료' : won(3000)}</dd><dt class="cab-total">합계</dt><dd class="cab-total">${won(total + (total >= 100000 ? 0 : 3000))}</dd></dl>
        <button class="btn btn--primary cab-go" id="cabGo">조제 요청하기</button>
        <p class="cab-fine">콘셉트 브랜드 사이트로, 실제 주문·결제는 진행되지 않아요.</p></div>`;
  };
  const openCab = () => { paint(); cab.classList.add('is-on'); cab.setAttribute('aria-hidden', 'false'); html.classList.add('is-locked'); window.__lenis?.stop?.(); };
  const closeCab = () => { cab.classList.remove('is-on'); cab.setAttribute('aria-hidden', 'true'); unlock(); };
  $('#cabOpen')?.addEventListener('click', openCab);
  cab.addEventListener('click', (e) => {
    if (e.target.closest('[data-cclose]')) return closeCab();
    const t = e.target.closest('button'); if (!t) return;
    const d = t.dataset;
    if (d.inc) { items[d.inc].q++; save(); paint(); }
    else if (d.dec) { if (--items[d.dec].q <= 0) items.splice(d.dec, 1); save(); paint(); }
    else if (d.rm) { items.splice(d.rm, 1); save(); paint(); }
    else if (d.view) { const it = items[d.view]; closeCab(); it.k === 'coffret' ? window.ArcanaOpen.drawer(it.no) : window.ArcanaOpen.product(it.no, it.k); }
    else if (d.c) { closeCab(); d.c === 'consult' ? window.ArcanaOpen.consult() : openMenu('shop'); }
    else if (t.id === 'cabGo') { t.textContent = '조제 요청이 접수되었어요'; t.disabled = true; }
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMenu(); closeCab(); } });

  /* 하단 탭 */
  document.querySelector('.tabbar')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]'); if (!b) return;
    b.dataset.tab === 'cab' ? openCab() : openMenu('shop');
  });

  /* 담기: 보틀이 서랍장 아이콘으로 날아가는 작은 연출 */
  const add = (no, k, src) => {
    const f = items.find((i) => i.no === no && i.k === k);
    f ? f.q++ : items.push({ no, k, q: 1 });
    save(); paintCount();
    const target = matchMedia('(max-width: 760px)').matches ? document.querySelector('.tabbar [data-tab="cab"]') : $('#cabOpen');
    if (src && target) {
      const a = src.getBoundingClientRect(), b = target.getBoundingClientRect();
      const g = document.createElement('img'); g.className = 'cab-fly'; g.src = k === 'coffret' ? 'assets/img/pkg-coffret.jpg' : `assets/img/bottle/${k}.webp`;
      g.style.left = a.left + a.width / 2 - 24 + 'px'; g.style.top = a.top - 30 + 'px'; document.body.appendChild(g);
      requestAnimationFrame(() => { g.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top - a.top + 30}px) scale(.3)`; g.style.opacity = '.2'; });
      setTimeout(() => { g.remove(); target.classList.add('is-bump'); setTimeout(() => target.classList.remove('is-bump'), 500); }, 750);
    }
    if (src) { const o = src.textContent; src.textContent = '서랍장에 담았어요 ✓'; setTimeout(() => (src.textContent = o), 1600); }
  };
  window.ArcanaCart = { add, open: openCab };
  paintCount();
})();
