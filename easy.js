// 페이지 공방 쉬운 만들기 — 그림 카드로 먼저 묻고(무엇 · 이름 · 목표 · 누구 · 성격 · 느낌 · 색 · 넣을 것 · 한 줄 자랑) «이렇게 만들까요?» 확인 뒤 한 번에 만들고, 사진 · 글을 하나씩 채워 보낸다. 6살 아이 · 79살 어르신 기준
(function (root) {
  'use strict';
  var U = root.PSUI, el = U.el, X = null, W = null;
  var SR = root.SpeechRecognition || root.webkitSpeechRecognition;
  var TOUCH = root.matchMedia && root.matchMedia('(pointer:coarse)').matches;

  var WHAT = [['shop', '🏪', '우리 가게', '가게를 알리고 찾아오게'], ['event', '🎉', '잔치 · 모임', '생일 · 모임에 사람을 불러요'],
    ['work', '🎨', '내 작품', '그림 · 사진 · 만든 것 자랑'], ['me', '🙋', '나를 소개', '나는 이런 사람이에요'],
    ['story', '📖', '이야기', '여행 · 일기 · 긴 글'], ['service', '📱', '우리 일 · 서비스', '하는 일을 알리고 써 보게'], ['blank', '✨', '그 밖의 것', '무엇이든 만들어요']];
  var GOAL = [['visit', '📍', '찾아오면 좋겠어요'], ['call', '📞', '연락하면 좋겠어요'], ['come', '🙌', '와서 함께하면 좋겠어요'],
    ['look', '👀', '구경하면 좋겠어요'], ['buy', '🛒', '사거나 써 보면 좋겠어요']];
  var WHO = [['family', '👨‍👩‍👧', '가족 · 친구'], ['guest', '🙂', '손님'], ['town', '🏘️', '동네 사람'], ['all', '🌏', '누구나']];
  var TRAIT = [['warm', '☀️', '따뜻한', 'mag'], ['trust', '🤝', '믿음직한', 'plain'], ['fun', '🥳', '신나는', 'brutal'], ['cute', '🧸', '귀여운', 'soft'],
    ['cool', '😎', '멋진', 'tech'], ['calm', '🌿', '차분한', 'mag'], ['new', '💎', '새로운', 'glass'], ['old', '🏮', '전통 있는', 'lux']];
  var FEEL = [['plain', '깔끔하게'], ['soft', '귀엽게'], ['tech', '멋지게(어둡게)'], ['mag', '차분하게'], ['lux', '고급스럽게'], ['glass', '반짝이게'], ['brutal', '눈에 띄게']];
  var COLOR = [['red', '#e5484d', '빨강'], ['orange', '#f76b15', '주황'], ['yellow', '#f5b400', '노랑'], ['green', '#30a46c', '초록'], ['sky', '#0ea5e9', '하늘'],
    ['blue', '#3e63dd', '파랑'], ['purple', '#8e4ec6', '보라'], ['pink', '#e93d82', '분홍'], ['gray', '#6b7280', '흑백']];
  var MUST = [['photos', '📷', '사진'], ['what', '⭐', '자랑할 것'], ['price', '💰', '가격'], ['when', '📅', '날짜와 장소'],
    ['contact', '☎️', '연락처'], ['story', '📝', '긴 이야기'], ['faq', '❓', '묻고 답하기'], ['words', '💬', '받은 한마디']];
  var MUST0 = { shop: ['photos', 'what', 'price', 'contact'], event: ['when', 'photos', 'faq'], work: ['photos', 'what', 'contact'], me: ['story', 'photos', 'contact'],
    story: ['story', 'photos'], service: ['what', 'price', 'faq', 'words'], blank: ['photos'] };
  var GOAL0 = { shop: 'visit', event: 'come', work: 'look', me: 'call', story: 'look', service: 'buy', blank: 'look' };
  var FONT = { soft: { body: 'suit' }, tech: { body: 'pretendard', head: 'black-han-sans' }, brutal: { body: 'pretendard', head: 'black-han-sans' } };
  var LOGO = { shop: 'store', event: 'party-popper', work: 'palette', me: 'smile', story: 'book-open', service: 'sparkles', blank: 'sparkles' };
  var MOTION = { plain: 1, soft: 2, tech: 1, mag: 0, lux: 0, glass: 1, brutal: 2 };
  var QS = [
    { k: 'what', q: '무엇을 만들까요?', one: WHAT },
    { k: 'name', q: '이름이 뭐예요?', s: '가게 이름 · 모임 이름 · 내 이름처럼 맨 위에 크게 나와요.', text: 0 },
    { k: 'goal', q: '보는 사람이 무엇을 하면 좋겠어요?', one: GOAL },
    { k: 'who', q: '누구에게 보여 줄 거예요?', one: WHO },
    { k: 'traits', q: '어떤 성격이에요?', s: '두 개까지 골라요. 첫 화면 맨 위에 작게 나와요.', many: TRAIT, max: 2 },
    { k: 'feel', q: '어떤 느낌으로 꾸밀까요?', s: '성격에 맞춰 하나 골라 두었어요. 바꿔도 돼요.' },
    { k: 'color', q: '좋아하는 색은요?' },
    { k: 'must', q: '꼭 넣을 것을 골라 주세요', s: '여러 개 골라도 돼요. 뒤에서 하나씩 채워요.', many: MUST },
    { k: 'brag', q: '한 줄로 자랑해 주세요', s: '이름 아래에 나와요. 말로 해도 돼요.', text: 2 }
  ];
  var FILLS = ['hero', 'story', 'what', 'price', 'photos', 'when', 'contact', 'faq', 'words'];
  var FILLQ = { hero: '첫 화면에 넣을 사진이 있나요?', story: '이야기를 들려주세요', what: '자랑할 것 세 가지를 알려 주세요', price: '무엇을 얼마에 파나요?',
    photos: '사진을 넣어 주세요', when: '언제, 어디서 해요?', contact: '어떻게 연락하면 돼요?', faq: '사람들이 자주 묻는 것은요?', words: '들은 칭찬 한마디가 있나요?' };
  var NAMES = { hero: '첫 화면 사진', story: '긴 이야기', what: '자랑할 것', price: '가격', photos: '사진', when: '날짜와 장소', contact: '연락처', faq: '묻고 답하기', words: '받은 한마디' };

  function ez() { return X.S.cur.easy; }
  function find(list, id) { return list.filter(function (o) { return o[0] === id; })[0]; }
  function pu() { var id = ez().a.what; return W.PURPOSES.filter(function (p) { return p.id === id; })[0] || W.PURPOSES[W.PURPOSES.length - 1]; }
  function redraw() { X.renderPane(); }
  function trim(s) { return (s || '').trim(); }

  // ── 색 고르기 — 고른 느낌의 추천 색 묶음을 먼저, 고른 색과 주 색 빛깔이 가장 가까운 것 ──
  function hsl(hex) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0, l = (mx + mn) / 2, s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
    if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [(h * 60 + 360) % 360, s, l];
  }
  function pickTheme(a) {
    var look = a.feel || 'plain', dark = look === 'tech', rec = (W.THEMES[look] || []).filter(function (id) { return X.E.tokens[id]; });
    if (!a.color) return rec[0] || 'daisy-nord';
    var want = hsl(find(COLOR, a.color)[1]), best = rec[0], bs = 1e9;
    X.D.core.tokens.forEach(function (t) {
      if ((t.scheme === 'dark') !== dark) return;
      var h = hsl(t.color.primary), dh = Math.abs(h[0] - want[0]), sc;
      dh = Math.min(dh, 360 - dh);
      sc = a.color === 'gray' ? h[1] * 120 : dh + (h[1] < 0.3 ? 80 : 0);
      if (rec.indexOf(t.id) < 0) sc += 15;
      if (sc < bs) { bs = sc; best = t.id; }
    });
    return best;
  }

  // ── 답 → 페이지 — 답(a)과 채운 것(v)만으로 늘 새로 짓는다(뒤로 가 고쳐도 채운 글이 남음) ──
  function base(p, id) {
    var ex = p.ex >= 0 ? ((X.D.core.examples || [])[p.ex] || {}).blocks || [] : [];
    var src = ex.filter(function (x) { return x.part === id; })[0];
    return U.clone((src && src.content) || X.E.parts[id].sample);
  }
  function rows(arr, keys) { return (arr || []).filter(function (o) { return o && keys.some(function (k) { return trim(o[k]); }); }); }
  function mapUrl(q) { return 'https://map.naver.com/p/search/' + encodeURIComponent(q); }
  function tel(s) { return 'tel:' + s.replace(/[^0-9+]/g, ''); }
  function goalLink(a, v) {
    var c = v.contact || {}, w = v.when || {}, ph = trim(c.phone), ad = trim(c.addr), pl = trim(w.place), ml = trim(c.mail);
    if (a.goal === 'visit' && ad) return { label: '찾아오는 길', href: mapUrl(ad) };
    if (a.goal === 'come' && pl) return { label: '오는 길 보기', href: mapUrl(pl) };
    if ((a.goal === 'call' || a.goal === 'buy' || a.goal === 'come') && ph) return { label: a.goal === 'buy' ? '물어보기' : '전화하기', href: tel(ph) };
    if (a.goal === 'call' && ml) return { label: '메일 보내기', href: 'mailto:' + ml };
    return null;
  }
  function needs(a) {
    var m = (a.must || []).slice();
    if (['visit', 'call', 'buy'].indexOf(a.goal) >= 0 && m.indexOf('contact') < 0) m.push('contact');
    if (a.goal === 'come' && m.indexOf('when') < 0) m.push('when');
    return m;
  }
  var KEYS = {};  // 채우기 칸 → 블록 자리(미리보기 테두리용)
  function build() {
    var e = ez(), a = e.a, v = e.v, p = pu(), m = needs(a), name = trim(a.name) || p.tip[0], brag = trim(a.brag), link = goalLink(a, v);
    var bl = [], has = function (k) { return m.indexOf(k) >= 0; };
    var add = function (key, part, c, tone) { KEYS[key] = bl.length; bl.push({ id: U.uid(), part: part, tone: tone || 'plain', content: c }); };
    KEYS = {};
    if (['shop', 'service', 'work', 'story'].indexOf(p.id) >= 0 && a.who !== 'family') {
      var h = base(p, 'header'); h.brand = name; h.logo = LOGO[p.id]; h.links = []; h.cta = link; add('header', 'header', h);
    }
    var hero = base(p, 'hero');
    hero.eyebrow = (a.traits || []).map(function (t) { return find(TRAIT, t)[2]; }).join(' · ');
    hero.title = name; hero.text = brag || p.tip[2]; hero.primary = link; hero.secondary = null;
    if (v.heroImg) { hero.image = v.heroImg; hero.layout = 'split'; } else if (!hero.image) hero.layout = 'center';
    add('hero', 'hero', hero, p.id === 'event' ? 'glow' : 'plain');
    if (has('story')) { var it = base(p, 'intro'); it.kicker = ''; it.title = p.id === 'me' ? '나는요' : '이야기';
      if (trim(v.story)) it.body = trim(v.story); add('story', 'intro', it); }
    if (has('what')) { var cw = base(p, 'cards'), wr = rows(v.what, ['t', 'd']);
      cw.kicker = ''; cw.lead = ''; cw.title = p.id === 'event' ? '이런 걸 해요' : '자랑하고 싶은 것';
      if (wr.length) cw.items = wr.map(function (r, i) { return { icon: ['star', 'heart', 'sparkles'][i % 3], title: trim(r.t), text: trim(r.d) }; });
      add('what', 'cards', cw); }
    if (has('price')) { var pr = rows(v.price, ['t', 'p']), cp = { kicker: '', title: '가격', lead: '',
        items: pr.length ? pr.map(function (r) { return { icon: 'tag', title: trim(r.t), text: trim(r.p) }; })
          : [{ icon: 'tag', title: '무엇', text: '얼마' }, { icon: 'tag', title: '무엇', text: '얼마' }, { icon: 'tag', title: '무엇', text: '얼마' }] };
      add('price', 'cards', cp, 'surface'); }
    if (has('photos')) { var ph = (v.photos || []).filter(function (x) { return x && x.img; });
      add('photos', 'gallery', { title: '사진', items: ph.length ? ph.map(function (x) { return { image: x.img, alt: trim(x.cap), caption: trim(x.cap) }; })
        : [1, 2, 3, 4].map(function (n) { return { image: 'ph:' + n, alt: '', caption: '' }; }) }); }
    if (has('when')) { var w = v.when || {}, wi = [['calendar', '날짜', w.date, '○월 ○일'], ['clock', '시간', w.time, '○시'], ['map-pin', '곳', w.place, '○○에서']];
      var any = wi.some(function (x) { return trim(x[2]); });
      add('when', 'contact', { title: '언제 · 어디서', text: '', items: wi.filter(function (x) { return !any || trim(x[2]); }).map(function (x) {
        return { icon: x[0], label: x[1], value: trim(x[2]) || x[3], href: x[0] === 'map-pin' && trim(x[2]) ? mapUrl(trim(x[2])) : '' }; }) }, 'surface'); }
    if (has('words')) { var tw = base(p, 'testimonials'), wo = rows(v.words, ['q']);
      tw.title = '받은 한마디'; if (wo.length) tw.items = wo.map(function (r, i) { return { quote: trim(r.q), name: trim(r.who), role: '', avatar: ['red_heart', 'star', 'sparkles'][i % 3] }; });
      add('words', 'testimonials', tw); }
    if (has('faq')) { var fq = base(p, 'faq'), fr = rows(v.faq, ['q']);
      fq.title = '물어보세요'; if (fr.length) fq.items = fr.map(function (r) { return { q: trim(r.q), a: trim(r.a) }; }); add('faq', 'faq', fq); }
    if (has('contact')) { var c = v.contact || {}, ci = [['phone', '전화', c.phone, 'tel'], ['map-pin', '주소', c.addr, 'map'], ['clock', '여는 시간', c.hours, ''], ['mail', '메일 · SNS', c.mail, '']];
      var ct = base(p, 'contact'), got = ci.filter(function (x) { return trim(x[2]); });
      ct.title = p.id === 'shop' ? '찾아오기' : '연락하기'; ct.text = '';
      if (got.length) ct.items = got.map(function (x) { var s = trim(x[2]);
        return { icon: x[0], label: x[1], value: s, href: x[3] === 'tel' ? tel(s) : x[3] === 'map' ? mapUrl(s) : /@/.test(s) && !/\s/.test(s) && s[0] !== '@' ? 'mailto:' + s : '' }; });
      add('contact', 'contact', ct); }
    if (link && (a.who === 'guest' || a.who === 'town' || a.goal === 'come'))
      add('cta', 'buttons', { title: { visit: '오늘 들러 주세요', come: '꼭 와 주세요', call: '편하게 연락 주세요', buy: '지금 물어보세요' }[a.goal] || name, text: '', primary: link, secondary: null }, 'primary');
    var ft = base(p, 'footer'); ft.brand = name; ft.logo = LOGO[p.id]; ft.text = brag; ft.columns = []; ft.copyright = '© ' + new Date().getFullYear() + ' ' + name;
    add('footer', 'footer', ft);
    var d = X.defn(), look = a.feel || p.look;
    d.title = name; d.description = brag; d.look = look; d.theme = pickTheme({ feel: look, color: a.color }); d.motion = MOTION[look];
    d.font = U.clone(FONT[look] || { body: 'pretendard' }); delete d.dark_theme; d.blocks = bl;
    X.$('#pname').value = name; X.changed();
  }
  function empty(key) {
    var v = ez().v;
    if (key === 'hero') return !v.heroImg;
    if (key === 'story') return !trim(v.story);
    if (key === 'photos') return !(v.photos || []).some(function (x) { return x && x.img; });
    if (key === 'when' || key === 'contact') { var o = v[key] || {}; return !Object.keys(o).some(function (k) { return trim(o[k]); }); }
    return !rows(v[key], ['t', 'd', 'p', 'q']).length;
  }
  function fillKeys() { var m = needs(ez().a); return FILLS.filter(function (k) { return k === 'hero' || m.indexOf(k) >= 0; }); }

  // ── 입력 도우미 — 큰 칸 · 말로 적기 · 사진 찍기/고르기 ──
  function mic(get, set) {
    if (!SR) return null;
    var b = el('button', { type: 'button', class: 'ez-mic', 'aria-label': '말로 적기', text: '🎤' });
    b.onclick = function () {
      if (b._r) { b._r.stop(); return; }
      var r = new SR(), before = get();
      r.lang = 'ko-KR'; r.interimResults = true;
      r.onresult = function (ev) { var t = ''; for (var i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript; set(trim((before ? before + ' ' : '') + t)); };
      r.onerror = function (ev) { U.toast(ev.error === 'not-allowed' ? '마이크를 쓰게 허락해 주세요' : '잘 못 들었어요. 다시 눌러 말해 주세요'); };
      r.onend = function () { b._r = null; b.classList.remove('on'); b.textContent = '🎤'; };
      b._r = r; b.classList.add('on'); b.textContent = '⏹'; U.toast('말해 주세요. 다 하면 ⏹ 를 눌러요');
      try { r.start(); } catch (err) { r.onend(); }
    };
    return b;
  }
  function tfield(label, val, ph, on, long) {
    var inp = el(long ? 'textarea' : 'input', { class: 'inp ez-inp', value: val || '', rows: long ? 5 : null, placeholder: ph ? '예: ' + ph : null, 'aria-label': label || ph,
      oninput: function (ev) { on(ev.target.value); } });
    return el('label', { class: 'ez-fld' }, [label ? el('span', { text: label }) : null,
      el('div', { class: 'ez-row' }, [inp, mic(function () { return inp.value; }, function (t) { inp.value = t; on(t); })])]);
  }
  function pickFile(cam, on) {
    var f = el('input', { type: 'file', accept: 'image/*', hidden: true });
    if (cam) f.setAttribute('capture', 'environment');
    f.onchange = function () { var x = f.files[0]; f.remove(); if (x) X.readImage(x, on); };
    document.body.append(f); f.click();
  }
  function photo(cur, on) {
    var set = function (u) { on(u); build(); redraw(); };
    return el('div', { class: 'ez-photo' }, [cur ? el('img', { src: cur, alt: '' }) : el('div', { class: 'ez-ph', text: '🖼️' }),
      el('div', { class: 'ez-pb' }, [TOUCH ? el('button', { class: 'btn', type: 'button', text: '📷 찍기', onclick: function () { pickFile(true, set); } }) : null,
        el('button', { class: 'btn', type: 'button', text: cur ? '🖼️ 바꾸기' : '🖼️ 고르기', onclick: function () { pickFile(false, set); } }),
        cur ? el('button', { class: 'btn ghost', type: 'button', text: '빼기', onclick: function () { set(''); } }) : null])]);
  }
  function card(on, kids, onclick, cls) { return el('button', { type: 'button', class: 'ez-card' + (cls ? ' ' + cls : ''), 'aria-pressed': String(!!on), onclick: onclick }, kids); }
  function changed() { build(); }
  function put(p) { for (var i = 1; i < arguments.length; i++) if (arguments[i]) p.append(arguments[i]); }  // 빈 자리(null)는 건너뜀

  // ── 묻기 ──
  function ask(p) {
    var e = ez(), a = e.a, Q = QS[e.q];
    put(p, el('h2', { class: 'ez-q', text: Q.q }), Q.s ? el('p', { class: 'ez-s', text: Q.s }) : null);
    if (Q.one) p.append(el('div', { class: 'ez-grid' }, Q.one.map(function (o) {
      return card(a[Q.k] === o[0], [el('i', { text: o[1] }), el('b', { text: o[2] }), o[3] ? el('small', { text: o[3] }) : null], function () {
        if (Q.k === 'what' && a.what !== o[0]) { var pp = W.PURPOSES.filter(function (x) { return x.id === o[0]; })[0];
          a.goal = GOAL0[o[0]]; a.must = MUST0[o[0]].slice(); if (!a.feelSet) a.feel = pp.look; }
        a[Q.k] = o[0]; build(); redraw(); setTimeout(function () { go(e.q + 1); }, 280); });
    })));
    if (Q.many) p.append(el('div', { class: 'ez-grid' }, Q.many.map(function (o) {
      var list = a[Q.k] || (a[Q.k] = []), on = list.indexOf(o[0]) >= 0;
      return card(on, [el('i', { text: o[1] }), el('b', { text: o[2] })], function () {
        if (on) list.splice(list.indexOf(o[0]), 1); else { if (Q.max && list.length >= Q.max) list.shift(); list.push(o[0]); }
        if (Q.k === 'traits' && !a.feelSet && list.length) a.feel = find(TRAIT, list[0])[3];
        build(); redraw(); });
    })));
    if (Q.text != null) p.append(tfield('', a[Q.k], pu().tip[Q.text], function (t) { a[Q.k] = t; changed(); }));
    if (Q.k === 'feel') p.append(el('div', { class: 'ez-grid' }, FEEL.map(function (o) {
      return card(a.feel === o[0], [el('i', { class: 'lk lk-' + o[0], text: '가나다' }), el('b', { text: o[1] })], function () {
        a.feel = o[0]; a.feelSet = true; build(); redraw(); setTimeout(function () { go(e.q + 1); }, 280); });
    })));
    if (Q.k === 'color') p.append(el('div', { class: 'ez-colors' }, COLOR.map(function (o) {
      return el('button', { type: 'button', class: 'ez-dot', 'aria-pressed': String(a.color === o[0]), 'aria-label': o[2], onclick: function () {
        a.color = o[0]; build(); redraw(); setTimeout(function () { go(e.q + 1); }, 280); } }, [el('i', { style: 'background:' + o[1] }), el('span', { text: o[2] })]);
    })));
  }
  // ── 이렇게 만들까요? ──
  function spec(p) {
    var a = ez().a, d = X.defn(), tok = X.E.tokens[d.theme];
    var row = function (q, label, val) { return el('button', { type: 'button', class: 'ez-srow', onclick: function () { ez().phase = 'ask'; go(q); } },
      [el('span', { text: label }), el('b', {}, [].concat(val)), el('small', { text: '고치기' })]); };
    p.append(el('h2', { class: 'ez-q', text: '이렇게 만들까요?' }), el('p', { class: 'ez-s', text: '고칠 것이 있으면 그 줄을 누르세요.' }));
    p.append(el('div', { class: 'ez-spec' }, [
      el('div', { class: 'ez-id' }, [el('small', { text: (a.traits || []).map(function (t) { return find(TRAIT, t)[2]; }).join(' · ') }), el('b', { text: d.title }), el('p', { text: trim(a.brag) })]),
      row(0, '무엇', find(WHAT, a.what)[1] + ' ' + find(WHAT, a.what)[2]),
      row(2, '바라는 것', a.goal ? find(GOAL, a.goal)[1] + ' ' + find(GOAL, a.goal)[2] : '정하지 않음'),
      row(3, '보는 사람', a.who ? find(WHO, a.who)[2] : '정하지 않음'),
      row(5, '느낌', find(FEEL, d.look)[1]),
      row(6, '색', [el('i', { class: 'ez-sw', style: 'background:' + tok.color.primary }), a.color ? find(COLOR, a.color)[2] : '알아서']),
      row(7, '넣을 것', needs(a).map(function (k) { var o = find(MUST, k); return o[1] + ' ' + o[2]; }).join('  '))]));
  }
  // ── 채우기 ──
  function fill(p) {
    var e = ez(), v = e.v, keys = fillKeys(), key = keys[e.fill] || keys[0], shop = e.a.what === 'shop';
    var set = function (k, sub) { return function (t) { (v[k] || (v[k] = {}))[sub] = t; changed(); }; };
    var setRow = function (k, i, sub) { return function (t) { var r = v[k] || (v[k] = []); (r[i] || (r[i] = {}))[sub] = t; changed(); }; };
    X.S.focus = KEYS[key];
    p.append(el('h2', { class: 'ez-q', text: FILLQ[key] }), el('p', { class: 'ez-s', text: '비워 두면 예시 글이 들어가요. 언제든 다시 고칠 수 있어요.' }));
    if (key === 'hero') p.append(photo(v.heroImg, function (u) { v.heroImg = u; }));
    if (key === 'story') p.append(tfield('', v.story, '우리 가게는 할머니가 처음 연 곳이에요', function (t) { v.story = t; changed(); }, true));
    if (key === 'what' || key === 'price' || key === 'faq' || key === 'words') {
      var L = { what: [['t', '이름', '크루아상'], ['d', '한 줄 설명', '버터를 듬뿍 넣었어요']], price: [['t', '무엇', '크루아상'], ['p', '얼마', '3,500원']],
        faq: [['q', '물음', '주차할 곳이 있나요?'], ['a', '대답', '가게 앞에 두 칸 있어요']], words: [['q', '한마디', '정말 맛있어요!'], ['who', '누가', '단골 손님']] }[key];
      var n = key === 'faq' || key === 'words' ? 2 : 3, r = v[key] || [];
      for (var i = 0; i < n; i++) p.append(el('div', { class: 'ez-set' }, [el('b', { text: (i + 1) + '' })].concat(L.map(function (f) {
        return tfield(f[1], (r[i] || {})[f[0]], i ? '' : f[2], setRow(key, i, f[0])); }))));
    }
    if (key === 'photos') { var ph = v.photos || (v.photos = []);
      p.append(el('div', { class: 'ez-gal' }, [0, 1, 2, 3].map(function (j) { var x = ph[j] || {};
        return el('div', {}, [photo(x.img, function (u) { (ph[j] || (ph[j] = {})).img = u; }), x.img ? tfield('', x.cap, '사진 아래 한마디', setRow('photos', j, 'cap')) : null]); }))); }
    if (key === 'when') { var w = v.when || {};
      p.append(tfield('날짜', w.date, '12월 14일 토요일', set('when', 'date')), tfield('시간', w.time, '낮 12시', set('when', 'time')), tfield('곳', w.place, '행복동 꽃마을 식당', set('when', 'place'))); }
    if (key === 'contact') { var c = v.contact || {};
      put(p, tfield('전화', c.phone, '010-1234-5678', set('contact', 'phone')), tfield('주소', c.addr, '서울 행복구 꽃길 12', set('contact', 'addr')),
        shop ? tfield('여는 시간', c.hours, '아침 7시 ~ 저녁 7시', set('contact', 'hours')) : null, tfield('메일 · SNS', c.mail, '@우리가게', set('contact', 'mail'))); }
  }
  // ── 다 됐어요 ──
  var ready = null;
  function done(p) {
    var left = fillKeys().filter(function (k) { return k !== 'hero' && empty(k); }), send, save;
    p.append(el('div', { class: 'ez-party', text: '🎉' }), el('h2', { class: 'ez-q', text: '다 만들었어요!' }),
      el('p', { class: 'ez-s', text: root.innerWidth < 900 ? '아래 «미리보기»를 눌러 내 페이지를 보세요.' : '오른쪽이 완성된 내 페이지예요.' }));
    if (left.length) p.append(el('p', { class: 'ez-s', text: '아직 예시 글인 곳 — 누르면 채우러 가요.' }),
      el('div', { class: 'chips' }, left.map(function (k) { return el('button', { class: 'chip', type: 'button', text: NAMES[k], onclick: function () {
        var e = ez(); e.phase = 'fill'; e.fill = fillKeys().indexOf(k); go(e.q); } }); })));
    send = el('button', { class: 'btn pri ez-big', type: 'button', text: '📤 보내기', disabled: true, onclick: function () { share(); } });
    save = el('button', { class: 'btn ez-big', type: 'button', text: '💾 내 기기에 저장', disabled: true, onclick: function () { U.download(ready, fname(), 'text/html'); U.toast('저장했어요'); } });
    p.append(el('div', { class: 'ez-end' }, [send, save,
      el('button', { class: 'btn ez-big', type: 'button', text: '✏️ 더 자세히 고치기', onclick: function () { ez().phase = 'off'; X.S.focus = null; X.S.tab = 'blocks'; X.save(); redraw(); X.preview(); } }),
      el('button', { class: 'btn ghost', type: 'button', text: '새로 하나 더 만들기', onclick: start })]));
    ready = null;
    X.exportDoc().then(function (doc) { ready = doc; send.disabled = save.disabled = false; }, function (err) { U.toast(err.message); });
  }
  function fname() { return (X.defn().title || '내 페이지').replace(/[\\/:*?"<>|]/g, '_') + '.html'; }
  function share() {
    var file = new File([ready], fname(), { type: 'text/html' });
    if (navigator.canShare && navigator.canShare({ files: [file] }))
      return navigator.share({ files: [file], title: X.defn().title }).catch(function (err) { if (err.name !== 'AbortError') U.download(ready, fname(), 'text/html'); });
    U.download(ready, fname(), 'text/html'); U.toast('보내기 창이 없는 기기라 파일로 저장했어요. 그 파일을 보내 주세요');
  }

  // ── 틀 · 이동 ──
  function go(i) {
    var e = ez();
    if (e.phase === 'ask') { if (i >= QS.length) { e.phase = 'spec'; } else e.q = Math.max(0, i); }
    X.S.focus = e.phase === 'fill' ? KEYS[fillKeys()[e.fill]] : null;
    X.save(); redraw(); X.$('#pane').scrollTop = 0; X.preview();
  }
  function step(dir) {
    var e = ez(), n = fillKeys().length;
    if (e.phase === 'ask') return go(e.q + dir);
    if (e.phase === 'spec') { if (dir < 0) { e.phase = 'ask'; return go(QS.length - 1); } e.phase = 'fill'; e.fill = 0; build(); return go(0); }
    if (e.phase === 'fill') { e.fill += dir; if (e.fill < 0) { e.phase = 'spec'; e.fill = 0; } else if (e.fill >= n) e.phase = 'done'; return go(0); }
    if (e.phase === 'done' && dir < 0) { e.phase = 'fill'; e.fill = n - 1; return go(0); }
  }
  function render(p) {
    var e = ez(), body = el('div', { class: 'ez-body' }), n = fillKeys().length, at, all, label;
    if (e.phase === 'ask') { at = e.q + 1; all = QS.length; label = '물음 ' + at + ' / ' + all; }
    else if (e.phase === 'fill') { at = e.fill + 1; all = n; label = '채우기 ' + at + ' / ' + all; }
    else { at = all = 1; label = e.phase === 'spec' ? '확인' : '완성'; }
    ({ ask: ask, spec: spec, fill: fill, done: done }[e.phase])(body);
    var first = e.phase === 'ask' && e.q === 0, need = e.phase === 'ask' && e.q === 0 && !e.a.what;
    put(p, el('div', { class: 'ez-top' }, [el('span', { text: label }), el('i', {}, [el('b', { style: 'width:' + Math.round(at / all * 100) + '%' })])]), body,
      e.phase === 'done' ? null : el('div', { class: 'ez-nav' }, [
        el('button', { class: 'btn ez-big', type: 'button', text: '← 뒤로', disabled: first, onclick: function () { step(-1); } }),
        el('button', { class: 'btn pri ez-big', type: 'button', disabled: need,
          text: e.phase === 'spec' ? '좋아요, 만들어 주세요' : e.phase === 'fill' && e.fill === n - 1 ? '다 했어요' : '다음 →', onclick: function () { step(1); } })]));
  }
  function start() {
    U.closeDialog();
    var pg = X.newPage({ title: '새 페이지', theme: 'daisy-nord', look: 'plain', motion: 1, font: { body: 'pretendard' }, blocks: [{ part: 'hero', tone: 'glow',
      content: { layout: 'center', eyebrow: '페이지 공방', title: '무엇을 만들까요?', text: '물음에 하나씩 답하면 여기에 내 페이지가 생겨요.', image: '' } }] });
    pg.easy = { q: 0, phase: 'ask', a: {}, v: {}, fill: 0 }; X.S.focus = null; X.DB.put(pg); X.openPage(pg);
  }
  function jump(i) {
    var e = ez(); if (e.phase === 'ask' || e.phase === 'spec') return;
    var k = Object.keys(KEYS).filter(function (x) { return KEYS[x] === i; })[0], at = fillKeys().indexOf(k);
    if (at >= 0) { e.phase = 'fill'; e.fill = at; go(0); }
  }

  root.PSEasy = {
    init: function (ctx) { X = ctx; W = root.PSWizard; },  // { D, E, S, DB, $, defn, changed, preview, renderPane, newPage, openPage, exportDoc, readImage, save }
    active: function () { var c = X && X.S.cur; return !!(c && c.easy && c.easy.phase !== 'off'); },
    render: function (p) { if (ez().a.what && !Object.keys(KEYS).length) build(); render(p); },
    start: start, jump: jump, QS: QS
  };
})(window);
