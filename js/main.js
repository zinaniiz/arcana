/* ARCANA — interactions
   HOVER(틈의 실버빛) · PULL(무겁게 당겨지고 멈칫) · BLOOM(꽃잎 4장) · TAKE(드래그) · SEAL(실링) · TIME(시간대 톤) · NAV(메뉴=약장) */
(() => {
  try { if (window.self !== window.top) document.documentElement.classList.add('is-embedded'); } catch (e) { document.documentElement.classList.add('is-embedded'); }
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const catBy = (k) => CATEGORIES.find((c) => c.key === k);
  const linesFor = (k) => Object.keys(LINES).filter((l) => LINES[l].steps.includes(k));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  /* ───────── 소리 : 관리의 소리 (딸깍 · 톡 · 봉인) ───────── */
  const Sound = {
    on: store.get('arcana-sound') === '1', ctx: null,
    ensure() { if (!this.ctx) { const C = window.AudioContext || window.webkitAudioContext; if (C) this.ctx = new C(); } return this.ctx; },
    noise(dur, f, q, gain) {
      const c = this.ensure(); if (!c) return;
      const b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
      const s = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain();
      bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q; g.gain.value = gain;
      s.buffer = b; s.connect(bp).connect(g).connect(c.destination); s.start();
    },
    tone(freq, dur, gain, type = 'sine') {
      const c = this.ensure(); if (!c) return;
      const o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
      o.type = type; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * .6, t + dur);
      g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(c.destination); o.start(); o.stop(t + dur);
    },
    _t: 0,
    click() { const n = performance.now(); if (n - this._t < 90) return; this._t = n; if (this.on) { this.noise(.04, 3200, 4, .5); setTimeout(() => this.noise(.03, 1800, 6, .35), 45); } },
    tok() { if (this.on) this.tone(980, .12, .12); },
    slide() { if (this.on) this.noise(.5, 700, .8, .18); },
    thump() { if (this.on) { this.tone(110, .35, .5); this.noise(.12, 500, 1, .4); } },
  };
  const sbtn = $('#soundToggle');
  const syncSound = () => { sbtn.setAttribute('aria-pressed', Sound.on); sbtn.title = Sound.on ? '관리의 소리 끄기' : '관리의 소리 켜기'; };
  sbtn.addEventListener('click', () => { Sound.on = !Sound.on; store.set('arcana-sound', Sound.on ? '1' : '0'); syncSound(); Sound.click(); });
  syncSound();

  /* ───────── SVG : 꽃잎 · 용기 · 실링 ───────── */
  const PETAL = 'M0 -4 C -18 -9 -25 -34 -13 -46 C -7 -51 -2 -48 0 -43 C 2 -48 7 -51 13 -46 C 25 -34 18 -9 0 -4Z';
  const flower = (colors, size = 120, s0 = 1) => `
    <svg viewBox="-60 -60 120 120" width="${size}" height="${size}">
      ${[-45, 45, 225, 135].map((r, i) => `<path class="petal" data-r="${r}" d="${PETAL}" fill="${colors[i]}" stroke="rgba(58,54,50,.35)" stroke-width=".6" transform="rotate(${r}) scale(${s0})"/>`).join('')}
      <circle r="4" fill="#EDE4B5" stroke="rgba(58,54,50,.4)" stroke-width=".6"/>
    </svg>`;
  const PETALS = DRAWERS.map((d) => d.petal);

  let uid = 0;
  /* 네 칸의 꽃 모노그램 — 사각 프레임 안 2×2 칸, 칸마다 꽃잎 하나 */
  const mono = (cx, cy, s, col = '#C9A86A') => `<g transform="translate(${cx - s / 2} ${cy - s / 2}) scale(${s / 40})" fill="none" stroke="${col}" stroke-width="1.6">
      <rect x="1" y="1" width="38" height="38"/><rect x="5" y="5" width="30" height="30" stroke-width=".9"/>
      <path d="M20 5 V35 M5 20 H35" stroke-width=".9"/>
      ${[-45, 45, 135, 225].map((r) => `<path d="${PETAL}" transform="translate(20 20) rotate(${r}) scale(.2)" stroke-width="5"/>`).join('')}
    </g>`;

  /* ARCANA 시그니처 보틀 (PPT 14p): 형태 하나 · 월넛 캡 · 아이보리 라벨 + 골드 엠블럼.
     제형은 유리 마감으로 (Clear · Light · Half frost · Frost · Opal), 서랍은 라벨 아래 라인 컬러로 구분 */
  /* 실사 보틀: 코프레 사진에서 잘라낸 다섯 제형 (水·乳·精·膏·露) */
  function bottle(type, d) {
    const n = ++uid, cat = catBy(type), no = d ? d.no : '00';
    return `<svg class="bph" viewBox="0 0 120 200" role="img" aria-label="ARCANA N°${no} ${cat.fr}">
      <defs><radialGradient id="bf${n}" cx=".5" cy=".52" r=".62"><stop offset=".62" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
      <mask id="bm${n}"><rect width="120" height="200" fill="url(#bf${n})"/></mask></defs>
      <image href="assets/img/bottle/${cat.key}.jpg" width="120" height="200" preserveAspectRatio="xMidYMid slice" mask="url(#bm${n})"/>
    </svg>`;
  }

  function seal(size = 120) {
    const n = ++uid; const pts = [];
    for (let i = 0; i <= 64; i++) {
      const t = (i / 64) * Math.PI * 2;
      const r = 52 + 2.6 * Math.sin(t * 7) + 1.6 * Math.sin(t * 13 + 1) + 1.2 * Math.sin(t * 3 + 2);
      pts.push(`${(Math.cos(t) * r).toFixed(2)} ${(Math.sin(t) * r).toFixed(2)}`);
    }
    return `<svg viewBox="-60 -60 120 120" width="${size}" height="${size}" aria-label="ARCANA 실버 왁스 실링">
      <defs>
        <radialGradient id="wx${n}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#F2F3F5"/><stop offset=".45" stop-color="#BFC2C6"/><stop offset="1" stop-color="#7F8287"/></radialGradient>
        <path id="ring${n}" d="M0,-41 A41,41 0 1,1 -0.1,-41"/>
      </defs>
      <path d="M${pts.join(' L')}Z" fill="url(#wx${n})" stroke="#7A7D82" stroke-width=".6"/>
      <circle r="36" fill="none" stroke="#878A8F" stroke-width="1.2"/>
      <circle r="47" fill="none" stroke="#9EA1A5" stroke-width=".6"/>
      <text font-family="Cormorant Garamond, serif" font-size="7" letter-spacing="2.4" fill="#5E6166"><textPath href="#ring${n}">ARCANA · ORDONNANCE DE SOIN · FROM ESSENCE TO RITUAL ·</textPath></text>
      <g transform="scale(.62)" fill="none" stroke="#6E7176" stroke-width="1.6">${[-45, 45, 135, 225].map((r) => `<path d="${PETAL}" transform="rotate(${r})"/>`).join('')}</g>
      <text y="7" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="20" fill="#5E6166">A</text>
    </svg>`;
  }

  const stageIcon = (stage) => {
    const p = (r, s = 1, o = 1) => `<path d="${PETAL}" transform="rotate(${r}) scale(${s})" style="fill:var(--primrose)" stroke="currentColor" stroke-width="1" opacity="${o}"/>`;
    const stem = `<path d="M0 6 C 2 20 -2 30 0 40" stroke="currentColor" stroke-width="1" fill="none"/>`;
    const g = { bud: p(0, .55) + p(-12, .5, .8) + p(12, .5, .8), half: p(-30, .7) + p(30, .7) + p(0, .6, .9), bloom: [-45, 45, 135, 225].map((r) => p(r, .62)).join('') + '<circle r="3" fill="currentColor"/>' }[stage];
    return `<svg class="line__icon" viewBox="-40 -40 80 80">${stage !== 'bloom' ? stem : ''}${g}</svg>`;
  };

  const specimenCard = (d) => `<svg viewBox="0 0 120 200"><rect x="22" y="40" width="76" height="118" fill="#F7F2E8" stroke="rgba(58,54,50,.4)"/><g transform="translate(60 92) scale(.42)" fill="${d.petal}" stroke="#3A3632" stroke-width="1.4">${[-45, 45, 135, 225].map((r) => `<path d="${PETAL}" transform="rotate(${r})"/>`).join('')}</g><text x="60" y="140" text-anchor="middle" font-family="Courier Prime, monospace" font-size="8" fill="#3A3632">N°${d.no}</text></svg>`;
  const petalSachet = () => `<svg viewBox="0 0 120 200"><g transform="translate(60 105) scale(.8)">${flower(PETALS, 1).replace(/<svg[^>]*>|<\/svg>/g, '')}</g></svg>`;

  /* 서랍 하드웨어: 실버 라벨 홀더 · 컵 손잡이 · 유리 창 */
  const holder = (t) => `<span class="holder"><span>${t}</span></span>`;
  const cup = () => `<span class="cup" aria-hidden="true"></span>`;
  const win = (img, cls = '') => `<span class="win ${cls}" style="background-image:url(${img})"></span>`;

  /* ───────── TIME : 접속 시간 → Matin · Midi · Nuit ───────── */
  const autoLine = () => { const h = new Date().getHours(); return h >= 5 && h < 11 ? 'Matin' : h >= 11 && h < 17 ? 'Midi' : 'Nuit'; };
  let currentLine = store.get('arcana-time') || autoLine();
  function setTime(line, save) {
    currentLine = line;
    document.documentElement.dataset.time = line;
    $$('.timeswitch button').forEach((b) => b.classList.toggle('is-on', b.dataset.time === line));
    $('.js-greet').textContent = LINES[line].greet;
    $$('.line').forEach((el) => el.classList.toggle('is-now', el.dataset.line === line));
    if (save) store.set('arcana-time', line);
    if (typeof tick === 'function') try { tick(); } catch (e) {}
  }
  $$('.timeswitch button').forEach((b) => b.addEventListener('click', () => { setTime(b.dataset.time, true); Sound.click(); }));
  const tick = () => { const d = new Date(); $('.js-clock').textContent = `${currentLine} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  setInterval(tick, 20000);

  /* ───────── NAV ───────── */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-solid', window.scrollY > window.innerHeight * .7);
  window.addEventListener('scroll', onScroll, { passive: true });
  $$('.nav__drawer').forEach((a) => a.addEventListener('click', () => Sound.click()));

  /* ───────── HERO : 닫힌 미니 약장 ───────── */
  $('#heroCab').innerHTML = `<img src="assets/img/wall-4x5.jpg" alt="한지 벽 앞 월넛 선반에 4줄 × 5칸으로 놓인 ARCANA 보틀"/>` +
    DRAWERS.map((d, i) => `<button class="minicab__d" data-no="${d.no}" style="--i:${i}" aria-label="N°${d.no} ${d.concern} 서랍 열기"><span class="hot__tag">${holder(`N°${d.no} · ${d.concern}`)}</span></button>`).join('');
  $$('#heroCab .minicab__d').forEach((b) => {
    b.addEventListener('mouseenter', () => Sound.tok());
    b.addEventListener('click', () => openDrawer(DRAWERS.find((d) => d.no === b.dataset.no)));
  });

  /* ───────── COVER SLIDES : 화보가 넘어간다 ───────── */
  (() => {
    const imgs = $$('#coverSlides .cover__img'); if (!imgs.length) return;
    const dots = $('#coverDots'), no = $('#coverNo');
    $('#coverTot').textContent = String(imgs.length).padStart(2, '0');
    dots.innerHTML = imgs.map((_, i) => `<button aria-label="${i + 1}번 화보" class="${i ? '' : 'is-on'}"></button>`).join('');
    let cur = 0, timer = null;
    const go = (n) => {
      const nx = (n + imgs.length) % imgs.length; if (nx === cur) return;
      imgs.forEach((im) => im.classList.remove('is-prev'));
      imgs[cur].classList.remove('is-on'); imgs[cur].classList.add('is-prev'); dots.children[cur].classList.remove('is-on');
      const old = imgs[cur]; setTimeout(() => old.classList.remove('is-prev'), 2600);
      cur = nx;
      imgs[cur].loading = 'eager';
      imgs[cur].classList.add('is-on'); dots.children[cur].classList.add('is-on');
      no.textContent = String(cur + 1).padStart(2, '0');
    };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const play = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(cur + 1), 6000); };
    $('#coverPrev').addEventListener('click', () => { go(cur - 1); play(); });
    $('#coverNext').addEventListener('click', () => { go(cur + 1); play(); });
    [...dots.children].forEach((b, i) => b.addEventListener('click', () => { go(i); play(); }));
    let sx = null; const cv = $('.cover');
    cv.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    cv.addEventListener('touchend', (e) => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) { go(cur + (dx < 0 ? 1 : -1)); play(); } sx = null; });
    imgs.slice(1).forEach((im) => { im.loading = 'eager'; });
    play();
  })();

  /* ───────── YOUR PATH TO ARCANA ───────── */
  const track = $('#pathTrack'), bar = $('#pathBar');
  let pathNo = '02';
  const renderPath = () => {
    const d = DRAWERS.find((x) => x.no === pathNo);
    $('#pathTabs').innerHTML = DRAWERS.map((x) => `<button role="tab" aria-selected="${x.no === pathNo}" class="${x.no === pathNo ? 'is-on' : ''}" data-no="${x.no}">N°${x.no} <span>${x.concern}</span></button>`).join('');
    track.innerHTML = CATEGORIES.map((c) => `
      <button class="pitem" data-k="${c.key}">
        <span class="pitem__img">${bottle(c.key, d)}</span>
        <span class="pitem__row"><b>ARCANA N°${d.no} ${c.fr}</b><em>${c.vol}</em></span>
        <span class="pitem__sub">${c.ko} · ${linesFor(c.key).join(' / ')}</span>
      </button>`).join('');
    $$('#pathTabs button').forEach((b) => b.addEventListener('click', () => { pathNo = b.dataset.no; Sound.click(); renderPath(); }));
    $$('.pitem', track).forEach((b) => b.addEventListener('click', () => openProduct(d, catBy(b.dataset.k))));
    track.scrollLeft = 0; syncBar();
  };
  const syncBar = () => {
    const vis = track.clientWidth / track.scrollWidth, max = track.scrollWidth - track.clientWidth;
    bar.style.width = (Math.min(1, vis) * 100) + '%';
    bar.style.transform = `translateX(${max > 0 ? (track.scrollLeft / max) * ((1 / vis) - 1) * 100 : 0}%)`;
  };
  track.addEventListener('scroll', syncBar, { passive: true });
  window.addEventListener('resize', syncBar);
  $('#pathNext').addEventListener('click', () => { const w = track.querySelector('.pitem').offsetWidth; track.scrollBy({ left: track.scrollLeft >= track.scrollWidth - track.clientWidth - 4 ? -track.scrollWidth : w, behavior: 'smooth' }); });
  renderPath();

  /* ───────── 서랍의 역할 ───────── */
  $('#rolesChest').innerHTML = ROLES.map((r, i) => `
    <div class="role">
      <div class="role__in"><span class="k">${r.en}</span><p><b>${r.meaning}</b></p><p>→ ${r.arcana}</p></div>
      <button class="role__face" aria-expanded="false"><span class="role__num">${String(i + 1).padStart(2, '0')}</span>
        <span class="role__frame"><b>${r.ko}</b><small>${r.en}</small></span>${cup()}</button>
    </div>`).join('');
  $$('.role').forEach((el) => {
    const face = $('.role__face', el);
    face.addEventListener('click', () => { const o = el.classList.toggle('is-open'); face.setAttribute('aria-expanded', o); o ? Sound.slide() : Sound.click(); });
  });

  /* ───────── L'APOTHICAIRE : 4 × 5 ───────── */
  const cab = $('#cabinet');
  cab.innerHTML =
    `<div class="cab__corner">Tiroir \\ Forme</div>` +
    CATEGORIES.map((c, ci) => `<button class="cab__head" data-col="${ci}"><b>${c.fr}</b><small>${c.ko} · ${c.vol}</small></button>`).join('') +
    DRAWERS.map((d, ri) =>
      `<button class="cab__row" data-row="${ri}">${win(d.img, 'win--row')}<span><b>N°${d.no} ${d.fr}</b><small>${d.concern} · ${d.ko}</small></span></button>` +
      CATEGORIES.map((c, ci) => `<button class="cell" data-row="${ri}" data-col="${ci}" aria-label="ARCANA N°${d.no} ${c.fr}">
          <span class="cubby">${bottle(c.key, d)}</span>${holder(`N°${d.no} · ${c.fr}`)}${cup()}
</button>`).join('')
    ).join('');

  const light = (sel) => { $$('.is-lit', cab).forEach((e) => e.classList.remove('is-lit')); if (!sel) { cab.classList.remove('is-dim'); return; } $$(sel, cab).forEach((e) => e.classList.add('is-lit')); cab.classList.add('is-dim'); };
  const modeSel = (el) => cab.dataset.mode === 'drawer' ? `[data-row="${el.dataset.row}"]` : `[data-col="${el.dataset.col}"]`;
  $$('.cell, .cab__row, .cab__head', cab).forEach((el) => {
    el.addEventListener('mouseenter', () => {
      if (el.classList.contains('cab__row') && cab.dataset.mode !== 'drawer') return;
      if (el.classList.contains('cab__head') && cab.dataset.mode !== 'category') return;
      light(modeSel(el)); Sound.tok();
    });
    el.addEventListener('mouseleave', () => light(null));
  });
  $$('.cell', cab).forEach((el) => el.addEventListener('click', () => openProduct(DRAWERS[+el.dataset.row], CATEGORIES[+el.dataset.col])));
  $$('.cab__row', cab).forEach((el) => el.addEventListener('click', () => cab.dataset.mode === 'drawer' && openDrawer(DRAWERS[+el.dataset.row])));
  $$('.cab__head', cab).forEach((el) => el.addEventListener('click', () => cab.dataset.mode === 'category' && openCategory(CATEGORIES[+el.dataset.col])));
  $$('.seg button').forEach((b) => b.addEventListener('click', () => {
    $$('.seg button').forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', x === b); });
    cab.dataset.mode = b.dataset.mode; Sound.click();
    // 기준이 바뀌는 순간 한 줄을 살짝 열어 보여준다
    light(b.dataset.mode === 'drawer' ? '[data-row="1"]' : '[data-col="3"]'); setTimeout(() => light(null), 900);
  }));

  /* ───────── SHEET (서랍 패널) ───────── */
  const sheet = $('#sheet');
  let lastFocus = null;
  function openSheet(frame, html) {
    lastFocus = document.activeElement;
    $('#sheetFrame').textContent = frame;
    $('#sheetBody').innerHTML = html;
    $('#sheetBody').scrollTop = 0;
    sheet.classList.add('is-open'); sheet.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked'); Sound.slide();
    setTimeout(() => $('.sheet__close').focus({ preventScroll: true }), 50);
  }
  function closeSheet() {
    if (!sheet.classList.contains('is-open')) return;
    sheet.classList.remove('is-open'); sheet.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked'); Sound.click();
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }
  $$('[data-close]', sheet).forEach((b) => b.addEventListener('click', closeSheet));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeSheet(); closeConsult(); } });

  const lineTags = (k) => `<span class="tags">${linesFor(k).map((l) => `<span class="tag">${l}</span>`).join('')}</span>`;

  function openDrawer(d) {
    openSheet(`TIROIR N°${d.no}`, `
      <div class="dhead">
        <img class="dhead__img" src="${d.img}" alt="${d.ko}" />
        <div>
          <span class="dhead__no">Tiroir N°${d.no} · ${d.concern} · ${d.concernEn}</span>
          <h3 id="sheetTitle">${d.fr}<small>${d.ko} — ${d.origin}</small></h3>
          <p>${d.story}</p>
          <dl class="meta">
            <dt>서랍의 소리</dt><dd>${d.sound}</dd>
            <dt>함께 조제</dt><dd>${d.co} — ${d.coNote}</dd>
            <dt>베이스</dt><dd>N°00 달맞이꽃 오일 (L'Arcanum)</dd>
          </dl>
        </div>
      </div>
      <p class="label">이 서랍의 라인 · 5단계 처방</p>
      <div class="tray tray--5">
        ${CATEGORIES.map((c) => `<button class="comp" data-p="${d.no}|${c.key}">${bottle(c.key, d)}<b>N°${d.no} ${c.fr}</b><small>${c.ko} · ${c.vol}</small>${lineTags(c.key)}</button>`).join('')}
      </div>
      <div class="coffret-strip"><img src="assets/img/pkg-coffret.jpg" alt="水乳精膏露 다섯 보틀이 든 ARCANA 코프레" loading="lazy"/><div><span class="dhead__no">Coffret N°${d.no}</span><b>${d.fr} 5단계 세트</b><small>한 서랍 = 다섯 보틀. 상자는 간직하고, 보틀만 리필합니다.</small></div></div>
      <div class="sheet__cta"><p>서랍 세트 박스 — 꽃잎처럼 열리는 자석 플랩, 속은 서랍 트레이, 실버 실링 봉인</p>
        <button class="btn btn--primary" data-consult="${d.no}">이 서랍으로 처방받기</button></div>`);
    bindSheet();
  }
  function openCategory(c) {
    openSheet(c.fr.toUpperCase(), `
      <div class="pdetail">
        <div class="comp">${bottle(c.key, null)}</div>
        <div>
          <span class="dhead__no">Shop by Category · ${c.ko}</span>
          <h3 id="sheetTitle">${c.fr}</h3>
          <p class="how">${c.how}</p>
          <dl class="meta"><dt>용기</dt><dd>${c.vessel}</dd><dt>용량</dt><dd>${c.vol}</dd><dt>Measure</dt><dd>${c.measure}</dd><dt>소리</dt><dd>${c.sound}</dd><dt>Le Rituel</dt><dd>${linesFor(c.key).join(' · ')}</dd></dl>
        </div>
      </div>
      <p class="label" style="margin-top:28px">같은 병, 네 개의 서랍 — 라벨의 N°와 꽃잎 컬러만 바뀝니다</p>
      <div class="tray tray--4">
        ${DRAWERS.map((d) => `<button class="comp" data-p="${d.no}|${c.key}">${bottle(c.key, d)}<b>N°${d.no} ${c.fr}</b><small>${d.concern} · ${d.fr}</small></button>`).join('')}
      </div>`);
    bindSheet();
  }
  function openProduct(d, c) {
    openSheet(`N°${d.no} · ${c.fr.toUpperCase()}`, `
      <div class="pdetail">
        <div class="comp">${bottle(c.key, d)}</div>
        <div>
          <span class="dhead__no">Tiroir N°${d.no} · ${d.concern}</span>
          <h3 id="sheetTitle">ARCANA N°${d.no} ${c.fr}</h3>
          <p class="how">${c.how}</p>
          <dl class="meta">
            <dt>주인공 원료</dt><dd>${d.ko} (${d.fr}) — ${d.origin}</dd>
            <dt>함께 조제</dt><dd>${d.co}</dd><dt>베이스</dt><dd>N°00 달맞이꽃 오일</dd>
            <dt>용기 · 용량</dt><dd>${c.vessel} · ${c.vol}</dd><dt>Measure</dt><dd>${c.measure}</dd>
            <dt>사용 시간대</dt><dd>${linesFor(c.key).join(' · ')}</dd>
          </dl>
          <div class="jump"><button data-jd="${d.no}">N°${d.no} 서랍 전체 보기</button><button data-jc="${c.key}">${c.fr} 4종 보기</button></div>
        </div>
      </div>`);
    bindSheet();
  }
  function bindSheet() {
    $$('#sheetBody [data-p]').forEach((b) => b.addEventListener('click', () => { const [no, k] = b.dataset.p.split('|'); openProduct(DRAWERS.find((d) => d.no === no), catBy(k)); }));
    $$('#sheetBody [data-jd]').forEach((b) => b.addEventListener('click', () => openDrawer(DRAWERS.find((d) => d.no === b.dataset.jd))));
    $$('#sheetBody [data-jc]').forEach((b) => b.addEventListener('click', () => openCategory(catBy(b.dataset.jc))));
    $$('#sheetBody [data-consult]').forEach((b) => b.addEventListener('click', () => { closeSheet(); openConsult(b.dataset.consult); }));
  }

  /* ───────── LE RITUEL ───────── */
  $('#lines').innerHTML = Object.entries(LINES).map(([k, l]) => `
    <article class="line" data-line="${k}">
      <div class="niche">${l.steps.map((s) => bottle(s, null)).join('')}<i class="ledge"></i></div>
      <div class="line__head">${stageIcon(l.stage)}<span class="line__now">지금의 시간</span></div>
      <h3>${k}</h3><span class="line__ko">${l.ko} — ${l.role}</span>
      <span class="line__meta">${l.time} · ${l.scent}</span>
      <ol>${l.steps.map((s) => { const c = catBy(s); return `<li><b>${c.fr}</b> ${c.ko}<small>${c.measure}</small></li>`; }).join('')}</ol>
    </article>`).join('');

  /* ───────── L'HERBIER ───────── */
  /* 표본 카드: 실제 카드 디자인 (앞 · 일러스트 · 뒤) — 누를 때마다 다음 면으로 */
  const HERB = [
    { no: '00', fr: 'Onagre', ko: '달맞이꽃', ord: '本' },
    { no: '01', fr: 'Mûrier Blanc', ko: '화이트 멀베리', ord: '壹' },
    { no: '02', fr: 'Églantine', ko: '로즈힙', ord: '貳' },
    { no: '03', fr: 'Fleur de Sureau', ko: '엘더플라워', ord: '參' },
    { no: '04', fr: 'Trémelle', ko: '트레멜라', ord: '肆' },
  ];
  const FACES = ['front', 'art', 'back'];
  $('#specimens').innerHTML = HERB.map((s) => `
    <button class="spec spec--card" data-face="0" aria-label="${s.fr} ${s.ko} 표본 카드 — 눌러서 다음 면 보기">
      <span class="spec__stack">${FACES.map((f, i) => `<img class="spec__face${i ? '' : ' is-on'}" src="assets/img/herbier/${s.no}-${f}.jpg" alt="${s.fr} 표본 카드 ${['앞면', '일러스트', '뒷면'][i]}" loading="lazy" />`).join('')}</span>
      <span class="spec__meta"><b>${s.ord}</b><span>${s.fr}</span><i>${FACES.map((_, i) => `<em class="${i ? '' : 'is-on'}"></em>`).join('')}</i></span>
    </button>`).join('');
  $$('.spec--card').forEach((b) => b.addEventListener('click', () => {
    const n = (+b.dataset.face + 1) % 3; b.dataset.face = n;
    $$('.spec__face', b).forEach((im, i) => im.classList.toggle('is-on', i === n));
    $$('.spec__meta em', b).forEach((e, i) => e.classList.toggle('is-on', i === n));
    b.classList.remove('is-turn'); void b.offsetWidth; b.classList.add('is-turn');
  }));

  const fs = $('#finaleSeal'); if (fs) fs.innerHTML = seal(96);

  /* ───────── PACKAGE ───────── */
  const fc = $('#finishCols');
  if (fc) {
    const order = ['lotion', 'brume', 'elixir', 'emulsion', 'creme'];
    fc.innerHTML = order.map((k, i) => { const c = catBy(k); return `<button class="fcol" data-k="${k}"><b>${c.fr}</b><span>${i + 1} · ${c.ko} · ${c.finish}</span></button>`; }).join('');
    $$('.fcol', fc).forEach((b) => b.addEventListener('click', () => openCategory(catBy(b.dataset.k))));
  }

  /* ───────── LE SECRET : 7 × 5의 亞(버금 아), 가운데 틈에서 비밀이 드러난다 ───────── */
  const COLS = 7, ROWS = 5, gapRow = 2, gap = [2, 3, 4];
  let cells = '';
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (r === gapRow && c === gap[0]) { cells += `<span class="secret__slit" style="grid-column:${c + 1}/span 3"><b>ARCANA</b><i></i><small>숨겨진 비밀 · Arcanum</small></span>`; continue; }
    if (r === gapRow && gap.includes(c)) continue;
    cells += `<span class="secret__a">亞</span>`;
  }
  $('#secretGrid').innerHTML = cells;
  $$('.secret__a').forEach((el) => el.addEventListener('mouseenter', () => { el.classList.add('is-lit'); setTimeout(() => el.classList.remove('is-lit'), 1600); }));

  /* ───────── reveal ───────── */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ═════════ CONSULTATION 02 → 06 ═════════ */
  const consult = $('#consult'), stageEl = $('#consultStage');
  const S = { drawer: null, line: null, cond: null, name: '', q: 0 };
  let raf = null, cleanup = [];
  const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); cleanup.push(() => el.removeEventListener(ev, fn, o)); };
  const resetListeners = () => { cleanup.forEach((f) => f()); cleanup = []; cancelAnimationFrame(raf); };
  const setStep = (i) => $$('#consultSteps li').forEach((li, j) => { li.classList.toggle('is-on', j === i); li.classList.toggle('is-done', j < i); });

  function openConsult(presetNo) {
    Object.assign(S, { drawer: presetNo ? DRAWERS.find((d) => d.no === presetNo) : null, line: currentLine, cond: null, name: '', q: presetNo ? 1 : 0 });
    consult.classList.add('is-open'); consult.setAttribute('aria-hidden', 'false'); document.body.classList.add('is-locked');
    Sound.click(); renderAsk();
  }
  function closeConsult() {
    if (!consult.classList.contains('is-open')) return;
    resetListeners(); consult.classList.remove('is-open'); consult.setAttribute('aria-hidden', 'true');
    if (!sheet.classList.contains('is-open')) document.body.classList.remove('is-locked');
  }
  $$('.js-consult').forEach((b) => b.addEventListener('click', () => openConsult()));
  $('#consultClose').addEventListener('click', closeConsult);

  /* 02 오늘을 묻다 — 고민 · 시간대 · 컨디션 세 가지만 (+ 처방전 이름) */
  function renderAsk() {
    resetListeners(); setStep(0);
    const qs = [
      { t: '요즘 가장 마음이 쓰이는 피부 고민은요?', sub: '서랍 하나 = 고민 하나 = 주인공 원료 하나',
        opts: DRAWERS.map((d) => ({ v: d.no, b: d.ask, s: `N°${d.no} ${d.fr} · ${d.concern}`, ico: d.petal })), key: 'drawer' },
      { t: '언제의 리추얼을 처방할까요?', sub: `지금은 ${autoLine()}의 시간이에요.`,
        opts: Object.entries(LINES).map(([k, l]) => ({ v: k, b: `${k} · ${l.ko}`, s: `${l.role} · ${l.time}`, stage: l.stage })), key: 'line' },
      { t: '오늘의 컨디션은 어떤가요?', sub: '수면 · 스트레스 · 기분, 가장 가까운 하나를 골라주세요.',
        opts: CONDITIONS.map((c) => ({ v: c.key, b: c.label, s: '' })), key: 'cond' },
      { t: '처방전에 새길 이름을 알려주세요.', sub: '비워두면 ‘당신’으로 조제합니다.', name: true },
    ];
    const q = qs[S.q];
    const cur = q.key === 'drawer' ? S.drawer && S.drawer.no : q.key === 'line' ? S.line : q.key === 'cond' ? S.cond && S.cond.key : null;
    stageEl.innerHTML = `<div class="stage ask">
      <span class="ask__count">Consultation · ${S.q + 1} / 4</span>
      <h2>${q.t}</h2><p class="ask__sub">${q.sub}</p>
      ${q.name ? `<label class="namefield"><span class="label">Nom · 처방받는 분</span><input id="nameIn" maxlength="16" autocomplete="off" value="${S.name}" placeholder="이름"/></label>`
        : `<div class="opts">${q.opts.map((o) => `<button class="opt ${o.v === cur ? 'is-on' : ''}" data-v="${o.v}">
            ${o.ico ? `<svg class="ico" viewBox="-60 -60 120 120"><path d="${PETAL}" transform="scale(1.15) translate(0 22)" fill="${o.ico}" stroke="currentColor" stroke-width="2"/></svg>` : o.stage ? stageIcon(o.stage).replace('line__icon', 'ico') : `<span class="ico"></span>`}
            <b>${o.b}</b>${o.s ? `<small>${o.s}</small>` : ''}</button>`).join('')}</div>`}
      <div class="ask__nav">
        <button class="link" id="back">${S.q === 0 ? '' : '← 이전'}</button>
        ${q.name ? `<button class="btn btn--primary" id="next">서랍에게 묻기</button>` : ''}
      </div></div>`;
    $$('.opt', stageEl).forEach((b) => on(b, 'click', () => {
      const v = b.dataset.v;
      if (q.key === 'drawer') S.drawer = DRAWERS.find((d) => d.no === v);
      if (q.key === 'line') { S.line = v; }
      if (q.key === 'cond') S.cond = CONDITIONS.find((c) => c.key === v);
      $$('.opt', stageEl).forEach((x) => x.classList.toggle('is-on', x === b)); Sound.tok();
      setTimeout(() => { S.q++; renderAsk(); }, 380);
    }));
    const back = $('#back'); on(back, 'click', () => { if (S.q > 0) { S.q--; renderAsk(); } });
    if (q.name) {
      const inp = $('#nameIn'); setTimeout(() => inp.focus(), 100);
      const go = () => { S.name = inp.value.trim(); renderReact(); };
      on($('#next'), 'click', go); on(inp, 'keydown', (e) => e.key === 'Enter' && go());
    }
  }

  /* 03 서랍이 반응하다 → 04 서랍을 당기다 (스크롤 = 서랍을 당기는 손) */
  function renderReact() {
    resetListeners(); setStep(1);
    const d = S.drawer;
    stageEl.innerHTML = `<div class="stage react">
      <div class="react__copy">
        <span class="label">${S.line} · Tiroir N°${d.no}</span>
        <h2>맞는 서랍만<br/>틈이 벌어졌어요.</h2>
        <p>N°${d.no} ${d.fr} — ${d.concern}. 스크롤하거나, 손잡이를 아래로 끌거나, 버튼을 눌러 천천히 당겨보세요.</p>
        <div class="pullmeter"><i id="meter"></i></div><span class="pullhint" id="pullhint">PULL · 0%</span>
        <div style="margin-top:22px"><button class="btn btn--primary" id="pullBtn">서랍 당기기</button></div>
      </div>
      <div class="scene" id="scene">
        <div class="cab3d is-reacting" id="cab3d">
          ${DRAWERS.map((x) => `<div class="d3 ${x.no === d.no ? 'is-match' : ''}">
            <div class="d3__box"><div class="d3__bottom">${x.no === d.no ? flower(PETALS, 100) : ''}</div><div class="d3__side d3__side--l"></div><div class="d3__side d3__side--r"></div></div>
            <div class="d3__front"><span class="d3__slit"></span>${win(x.img)}${holder(`N°${x.no} · ${x.concern}`)}${cup()}</div>
          </div>`).join('')}
        </div>
      </div></div>`;
    Sound.tok();
    const cab3 = $('#cab3d'), match = $('.d3.is-match', cab3), meter = $('#meter'), hint = $('#pullhint');
    let target = 0, p = 0, done = false, started = false;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const loop = () => {
      p += (target - p) * .075;                     // 무게감: 목표값을 천천히 따라간다
      if (Math.abs(target - p) < .001) p = target;
      cab3.style.setProperty('--p', ease(p).toFixed(4));
      match.style.setProperty('--pull', ease(p).toFixed(4));
      meter.style.setProperty('--p', p.toFixed(3));
      hint.textContent = `PULL · ${Math.round(p * 100)}%`;
      if (p >= .999 && !done) { done = true; match.classList.add('is-halt'); Sound.click(); setTimeout(renderInside, 750); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const add = (v) => { if (done) return; if (!started) { started = true; setStep(2); Sound.slide(); } target = Math.min(1, Math.max(0, target + v)); };
    on(stageEl, 'wheel', (e) => { e.preventDefault(); add(e.deltaY / 900); }, { passive: false });
    let ty = null;
    on(stageEl, 'touchstart', (e) => { ty = e.touches[0].clientY; }, { passive: true });
    on(stageEl, 'touchmove', (e) => { if (ty == null) return; const y = e.touches[0].clientY; add((ty - y) / 420); ty = y; e.preventDefault(); }, { passive: false });
    let dy = null;
    on(match, 'pointerdown', (e) => { dy = e.clientY; match.setPointerCapture(e.pointerId); });
    on(match, 'pointermove', (e) => { if (dy == null) return; add((e.clientY - dy) / 260); dy = e.clientY; });
    on(match, 'pointerup', () => { dy = null; });
    on($('#pullBtn'), 'click', () => { add(0); target = 1; });
  }

  /* 05 서랍 속을 보다 — 탑뷰, 꽃이 피고 4칸에 처방 · TAKE */
  function renderInside() {
    resetListeners(); setStep(3);
    const d = S.drawer, L = LINES[S.line];
    const items = L.steps.map((k) => ({ id: k, name: catBy(k).fr, svg: bottle(k, d) }));
    items.push({ id: 'card', name: `Specimen N°${d.no}`, svg: specimenCard(d) });
    if (items.length < 4) items.push({ id: 'vial', name: 'Élixir Mini', svg: bottle('elixir', null) });
    if (items.length < 4) items.push({ id: 'petal', name: 'Pétales', svg: petalSachet() });
    const four = items.slice(0, 4);
    stageEl.innerHTML = `<div class="stage inside">
      <div class="topview"><div class="topview__tray" id="tray">
        ${four.map((it) => `<div class="slot"><div class="item" data-id="${it.id}">${it.svg}<small>${it.name}</small></div></div>`).join('')}
        <div class="bloom" id="bloom">${flower(PETALS, '100%', 0)}</div>
      </div></div>
      <div>
        <span class="label">${S.line} · N°${d.no} ${d.fr}</span>
        <h2 class="h2" style="font-size:clamp(24px,3vw,34px)">꽃잎 네 장이 열리고,<br/>오늘의 처방이 놓였어요.</h2>
        <p style="color:var(--muted);font-size:14px;margin:14px 0 20px">제품을 끌어 처방전 위에 옮겨 담으세요. 탭해도 담깁니다.</p>
        <div class="receive" id="receive"><span class="label" style="margin:0">Ordonnance · 오늘 꺼낸 것</span><div class="receive__list" id="rlist"></div></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">
          <button class="btn btn--ghost" id="takeAll">한 번에 꺼내기</button>
          <button class="btn btn--primary" id="toOrd" disabled>처방전 받기</button>
        </div>
      </div></div>`;
    const bloom = $('#bloom');
    // 꽃잎 4장이 하나씩 (서랍 4개)
    const back = (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);   // 끝에서 살짝 넘쳤다 돌아오는 개화
    $$('.petal', bloom).forEach((pt, i) => setTimeout(() => {
      Sound.tok(); const t0 = performance.now(), r = pt.dataset.r;
      const f = (now) => { const t = Math.min(1, (now - t0) / 1100); pt.setAttribute('transform', `rotate(${r}) scale(${back(t).toFixed(3)})`); if (t < 1) requestAnimationFrame(f); };
      requestAnimationFrame(f);
    }, 300 + i * 380));
    setTimeout(() => { bloom.classList.add('is-done'); $$('.item', stageEl).forEach((el, i) => setTimeout(() => el.classList.add('is-shown'), i * 160)); }, 3100);

    const taken = new Set(), rlist = $('#rlist'), recv = $('#receive'), toOrd = $('#toOrd');
    const take = (el) => {
      const id = el.dataset.id; if (taken.has(id)) return; taken.add(id);
      el.classList.add('is-taken'); Sound.tok();
      rlist.insertAdjacentHTML('beforeend', `<span class="chip">${$('small', el).textContent}</span>`);
      if (taken.size === four.length) toOrd.disabled = false;
    };
    $$('.item', stageEl).forEach((el) => {
      let sx, sy, ghost = null;
      on(el, 'pointerdown', (e) => { if (!el.classList.contains('is-shown')) return; sx = e.clientX; sy = e.clientY; el.setPointerCapture(e.pointerId); });
      on(el, 'pointermove', (e) => {
        if (sx == null) return;
        if (!ghost && Math.hypot(e.clientX - sx, e.clientY - sy) > 6) {
          ghost = el.cloneNode(true); ghost.classList.add('is-drag'); document.body.appendChild(ghost); el.style.opacity = .25;
        }
        if (ghost) {
          ghost.style.left = e.clientX - 30 + 'px'; ghost.style.top = e.clientY - 50 + 'px';
          const r = recv.getBoundingClientRect();
          recv.classList.toggle('is-hover', e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom);
        }
      });
      on(el, 'pointerup', (e) => {
        if (sx == null) return;
        if (ghost) {
          const r = recv.getBoundingClientRect(), inside = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
          ghost.remove(); ghost = null; el.style.opacity = ''; recv.classList.remove('is-hover');
          if (inside) take(el);
        } else take(el);
        sx = null;
      });
    });
    on($('#takeAll'), 'click', () => $$('.item.is-shown', stageEl).forEach((el, i) => setTimeout(() => take(el), i * 160)));
    on(toOrd, 'click', renderOrd);
  }

  /* 06 처방을 받다 — 이름이 찍힌 Ordonnance + 실버 실링 */
  function renderOrd() {
    resetListeners(); setStep(4);
    const d = S.drawer, L = LINES[S.line], cond = S.cond || CONDITIONS[3];
    const H = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const hanNum = (n) => String(n).split('').map((c) => H[+c]).join('');
    const hanMD = (n) => n <= 10 ? (n === 10 ? '十' : H[n]) : (n < 20 ? '十' + H[n - 10] : H[Math.floor(n / 10)] + '十' + (n % 10 ? H[n % 10] : ''));
    const now = new Date();
    const dateH = `${hanNum(now.getFullYear())} · ${hanMD(now.getMonth() + 1)} · ${hanMD(now.getDate())}`;
    const no = 200 + Math.floor(Math.random() * 99);
    const ORD = { '01': '壹', '02': '貳', '03': '參', '04': '肆' }[d.no];
    const MOM = { Matin: '朝 · MATIN', Midi: '晝 · MIDI', Nuit: '夜 · NUIT' }[S.line];
    const ELEM = { '01': 'MÛRIER BLANC · ARGOUSIER', '02': 'ÉGLANTINE · BAKUCHIOL', '03': 'SUREAU · TANAISIE BLEUE', '04': 'TRÉMELLE · VARECH' }[d.no] + ' · ONAGRE';
    const HAN = { lotion: '水', emulsion: '乳', elixir: '精', creme: '膏', brume: '露' };
    const SHORT = { lotion: '세 번 감싸기', emulsion: '두 번 펴 바르기', elixir: '세 방울', creme: '데워서 위로', brume: '두 번 칙' };
    stageEl.innerHTML = `<div class="stage ord-wrap">
      <article class="ord ord--card" id="ord">
        <div class="ord__in">
          <span class="ord__mark" aria-hidden="true"></span>
          <p class="ord__brand">ARCANA</p>
          <p class="ord__kind">ORDONNANCE DE SOIN</p>
          <p class="ord__lbl">POUR <span>받는 분</span></p>
          <p class="ord__name" data-type="${S.name || '당신'}"></p>
          <div class="ord__pair">
            <div><p class="ord__lbl">TIROIR <span>서랍</span></p><p class="ord__val ord__val--han">${ORD}</p></div>
            <div><p class="ord__lbl">MOMENT <span>시간</span></p><p class="ord__val">${MOM}</p></div>
          </div>
          <p class="ord__lbl">ÉLÉMENTS <span>원료</span></p>
          <p class="ord__elem">${ELEM}</p>
          <div class="ord__steps">${L.steps.map((k) => { const c = catBy(k); return `<div class="ord__step" title="${c.how}"><span class="ord__ring">${HAN[k]}</span><b>${c.fr.toUpperCase()}</b><small>${SHORT[k]}</small></div>`; }).join('')}</div>
          <p class="ord__say">오늘은 이것만 하면 돼요.</p>
          <p class="ord__note">${cond.label} — ${cond.note}</p>
          <p class="ord__no">第 ${hanNum(no)} 號 · ${dateH}</p>
        </div>
        <div class="ord__seal ord__seal--mark" id="ordSeal"><span class="ord__stamp"></span></div>
      </article>
      <div class="ord__actions">
        <button class="btn btn--primary" id="seeDrawer">N°${d.no} 서랍 보러가기</button>
        <button class="btn btn--ghost" id="again">다시 상담하기</button>
      </div></div>`;
    const fields = $$('[data-type]', stageEl); let fi = 0;
    const typeNext = () => {
      if (fi >= fields.length) { setTimeout(() => { $('#ordSeal').classList.add('is-stamped'); setTimeout(() => Sound.thump(), 420); }, 300); return; }
      const el = fields[fi++], txt = el.dataset.type; let i = 0; el.classList.add('type-caret');
      const t = setInterval(() => { el.textContent = txt.slice(0, ++i); if (i >= txt.length) { clearInterval(t); el.classList.remove('type-caret'); setTimeout(typeNext, 120); } }, 110);
      cleanup.push(() => clearInterval(t));
    };
    setTimeout(typeNext, 600);
    on($('#seeDrawer'), 'click', () => { closeConsult(); openDrawer(d); });
    on($('#again'), 'click', () => openConsult());
  }

  setTime(currentLine); tick(); onScroll();
  window.ArcanaSound = Sound;
})();
