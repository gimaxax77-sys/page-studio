// 페이지 공방 안내 만들기 — ①무엇을 ②이름 ③형태 ④디자인 ⑤기능 ⑥내용 ⑦확인 순서로 묻고, 고르는 대로 미리보기가 바로 바뀐다. app.js 가 init 으로 손잡이(X)를 넘김
(function (root) {
  'use strict';
  var U = root.PSUI, F = root.PSFields, el = U.el, X = null;
  var STEPS = ['무엇을', '이름', '구성', '디자인', '꾸밈', '내용', '확인'];
  var DESC = {
    header: '위쪽 메뉴 — 맨 위 이름(로고)과 메뉴', hero: '첫 화면 — 큰 제목 · 설명 · 버튼 · 사진', intro: '소개글 — 이야기를 몇 문단으로',
    cards: '카드 — 메뉴 · 상품 · 자랑거리를 3~6개 나란히', stats: '숫자 자랑 — 숫자로 보여 주기(예: 손님 1,200명)', table: '표 — 시간표 · 요일별 메뉴처럼 줄과 칸',
    figure: '큰 사진 — 사진 한 장과 설명', gallery: '사진 모음 — 사진 여러 장', buttons: '버튼 줄 — 예약 · 문의처럼 누르게 하는 버튼',
    footer: '맨 아래 — 연락처 · 저작권 한 줄', pricing: '가격표 — 요금 2~3가지 견주기', faq: '자주 묻는 질문 — 묻고 답하기',
    testimonials: '후기 — 손님 · 고객의 한마디', contact: '연락처 — 전화 · 주소 · 메일 · 지도', free: '자유롭게 놓기 — 글 · 사진을 도화지 위에 끌어 놓기',
    badge: '꼬리표 — 작은 표시(신메뉴 · 무료 등)', progress: '진행 막대 — 목표까지 얼마나 왔나', ring: '동그라미 진행 — 몇 퍼센트인지 동그라미로',
    steps: '단계 — 1 · 2 · 3 순서 안내', loader: '빙글빙글 표시 — 도는 동그라미 같은 움직이는 꾸밈', alert: '알림 — 눈에 띄는 안내 한 줄',
    tabs: '눌러 바꿔 보기 — 이름을 누르면 내용이 바뀜', timeline: '날짜별 기록 — 날짜마다 있었던 일 · 일정', icon: '아이콘 줄 — 아이콘과 짧은 글',
    sticker: '스티커 — 귀여운 그림 하나', pattern: '배경 무늬 — 꾸밈용 무늬 띠'
  };
  var PURPOSES = [
    { id: 'shop', name: '가게 소개', desc: '빵집 · 카페 · 공방을 알리고 찾아오게', ex: 0, theme: 'daisy-nord', look: 'plain', font: { body: 'pretendard' },
      blocks: ['header', 'hero', 'intro', 'cards', 'gallery', 'testimonials', 'contact', 'footer'], small: [], tip: ['밀과 소금', '동네에서 가장 먼저 여는 빵집', '매일 아침 스무 가지 빵을 굽습니다'] },
    { id: 'event', name: '행사 초대', desc: '생일 · 모임 · 전시에 사람을 부르기', ex: 2, theme: 'daisy-cupcake', look: 'soft', font: { body: 'suit' },
      blocks: ['hero', 'intro', 'gallery', 'faq', 'contact', 'footer'], small: ['steps', 'sticker'], tip: ['하율이 첫 생일', '하율이 첫 생일에 초대합니다', '12월 14일 토요일 낮 12시, 함께 축하해 주세요'] },
    { id: 'work', name: '작업 모음', desc: '그림 · 사진 · 디자인 작업 보여 주기', ex: 1, theme: 'radix-violet-dark', look: 'tech', font: { body: 'pretendard', head: 'black-han-sans' },
      blocks: ['header', 'hero', 'cards', 'gallery', 'testimonials', 'contact', 'footer'], small: ['timeline'], tip: ['한별 작업실', '멈춘 화면에 숨을 불어넣습니다', '모션 디자인 6년차, 움직이는 그림을 만듭니다'] },
    { id: 'service', name: '서비스 · 앱 소개', desc: '기능과 요금을 알리고 가입하게', ex: 4, theme: 'flowbite-default-light', look: 'plain', font: { body: 'pretendard' },
      blocks: ['header', 'hero', 'cards', 'stats', 'pricing', 'testimonials', 'faq', 'buttons', 'footer'], small: ['badge'], tip: ['모아장부', '동네 가게 장부를 폰 하나로', '매출 · 외상 · 재고를 한 화면에서 봅니다'] },
    { id: 'story', name: '글 · 잡지', desc: '여행기 · 칼럼처럼 긴 글을 멋지게', ex: 3, theme: 'daisy-silk', look: 'mag', font: { body: 'pretendard' },
      blocks: ['header', 'hero', 'intro', 'figure', 'stats', 'testimonials', 'footer'], small: [], tip: ['겨울 바다', '겨울 바다를 걷는 법', '바람이 센 날, 바다는 더 또렷해집니다'] },
    { id: 'me', name: '자기소개', desc: '나를 소개하는 한 장(명함 · 이력)', ex: 1, theme: 'radix-teal-light', look: 'glass', font: { body: 'pretendard' },
      blocks: ['hero', 'intro', 'gallery', 'contact', 'footer'], small: ['timeline', 'badge'], tip: ['김한별', '움직임으로 이야기하는 디자이너', '앱 · 광고 · 발표 자료에 움직임을 더합니다'] },
    { id: 'blank', name: '빈 것에서', desc: '위쪽 메뉴 · 첫 화면 · 맨 아래만 두고 직접 채우기', ex: -1, theme: 'daisy-nord', look: 'plain', font: { body: 'pretendard' },
      blocks: ['header', 'hero', 'footer'], small: [], tip: ['내 페이지', '큰 제목을 적어 주세요', '한 줄 소개를 적어 주세요'] }
  ];
  var LOOKS = { plain: '깔끔하고 무난한 기본', glass: '반투명 면 · 은은한 빛', mag: '명조 제목 · 넓은 여백', brutal: '굵은 테두리 · 강한 대비',
    lux: '가는 선 · 명조 · 차분한 고급', tech: '격자 · 또렷한 각 · 어두운 화면', soft: '둥근 모서리 · 파스텔 · 귀여움' };
  var THEMES = {
    plain: ['daisy-nord', 'daisy-light', 'daisy-corporate', 'flowbite-default-light', 'flowbite-minimal-light', 'radix-indigo-light', 'radix-teal-light', 'daisy-winter'],
    glass: ['radix-teal-light', 'radix-violet-light', 'daisy-aqua', 'daisy-winter', 'radix-indigo-dark', 'daisy-night', 'daisy-pastel', 'daisy-dim'],
    mag: ['daisy-silk', 'daisy-lofi', 'daisy-autumn', 'daisy-caramellatte', 'radix-amber-light', 'daisy-retro', 'flowbite-mono-light', 'daisy-black'],
    brutal: ['daisy-cmyk', 'daisy-acid', 'daisy-bumblebee', 'daisy-cyberpunk', 'daisy-wireframe', 'daisy-retro', 'flowbite-mono-light', 'daisy-lemonade'],
    lux: ['daisy-luxury', 'daisy-black', 'daisy-coffee', 'daisy-business', 'daisy-silk', 'radix-amber-dark', 'flowbite-enterprise-dark', 'daisy-caramellatte'],
    tech: ['radix-violet-dark', 'daisy-synthwave', 'daisy-dracula', 'daisy-night', 'flowbite-default-dark', 'radix-teal-dark', 'daisy-dark', 'daisy-abyss'],
    soft: ['daisy-cupcake', 'daisy-pastel', 'daisy-valentine', 'daisy-garden', 'daisy-fantasy', 'daisy-emerald', 'radix-crimson-light', 'flowbite-playful-light']
  };
  var FONTS = [
    { label: '또박또박', body: 'pretendard', sample: '가장 무난하고 읽기 쉬움' },
    { label: '동글동글', body: 'suit', sample: '둥글고 다정한 느낌' },
    { label: '붓글씨 느낌', body: 'gowun-batang', sample: '긴 글 · 잡지 느낌' },
    { label: '굵은 제목', body: 'pretendard', head: 'black-han-sans', sample: '제목이 크게 튀는 느낌' },
    { label: '붓글씨 제목', body: 'pretendard', head: 'gowun-batang', sample: '읽기 쉬운 글에 우아한 제목' }
  ];
  var MOTION = [['0', '차분', '움직임 없이 조용히'], ['1', '보통', '내릴 때 살짝 떠오름'], ['2', '많음', '눈에 띄게 움직임']];

  function wiz() { return X.S.cur.wiz; }
  function purpose() { var id = wiz().purpose; return PURPOSES.filter(function (p) { return p.id === id; })[0] || PURPOSES[PURPOSES.length - 1]; }
  function part(id) { return X.E.parts[id]; }
  function head(t, s) { return el('div', { class: 'wz-head' }, [el('h2', { text: t }), s ? el('p', { class: 'hint', text: s }) : null]); }
  function card(on, kids, onclick, cls) { return el('button', { type: 'button', class: 'wz-card' + (cls ? ' ' + cls : ''), 'aria-pressed': String(!!on), onclick: onclick }, kids); }
  function redraw() { X.renderPane(); }
  function fk(k) { var m = root.PSSimple && root.PSSimple.FONT_KO; return (m && m[k]) || X.D.core.fonts[k].family; }  // 글씨체 우리말 이름
  function focusOn(i) { X.S.focus = i; X.preview(); }

  // ── 부분 만들기 — 고른 목적의 예시에 같은 부분이 있으면 그 글을, 없으면 그 부분의 기본 예시를 넣는다 ──
  function makeBlock(pu, id) {
    var ex = pu.ex >= 0 ? ((X.D.core.examples || [])[pu.ex] || {}).blocks || [] : [];
    var src = ex.filter(function (x) { return x.part === id; })[0], p = part(id);
    var b = src ? { part: id, tone: src.tone || 'plain', title: src.title, content: U.clone(src.content || p.sample) }
      : { part: id, tone: 'plain', title: p.kind === 'small' ? p.name : undefined, content: U.clone(p.sample) };
    b.id = U.uid(); wiz().orig[b.id] = JSON.stringify(b.content);
    return b;
  }
  function insertAt() { var bl = X.defn().blocks, i = bl.map(function (b) { return b.part; }).lastIndexOf('footer'); return i < 0 ? bl.length : i; }
  function applyNames() {
    var d = X.defn(), w = wiz();
    if (w.name) d.title = w.name;
    if (w.line) d.description = w.line;
    d.blocks.forEach(function (b) {
      var c = b.content || {};
      if (w.name && (b.part === 'header' || b.part === 'footer')) c.brand = w.name;
      if (b.part === 'hero') { if (w.head) c.title = w.head; if (w.line) c.text = w.line; }
    });
  }
  function pickPurpose(pu) {
    var d = X.defn(), w = wiz(), order = pu.blocks.slice(), fi = order.indexOf('footer');
    w.purpose = pu.id; w.orig = {};
    order.splice.apply(order, [fi < 0 ? order.length : fi, 0].concat(pu.small));
    d.theme = pu.theme; d.look = pu.look; d.motion = 1; d.font = U.clone(pu.font); delete d.dark_theme;
    d.blocks = order.map(function (id) { return makeBlock(pu, id); });
    applyNames(); X.S.focus = null; X.changed(); redraw();
  }

  // ── ① 무엇을 ──
  function purposeStep(p) {
    var w = wiz();
    p.append(head('무엇을 만드시나요?', '고르면 미리보기에 그 종류에 맞는 페이지 뼈대가 바로 잡힙니다. 다음 단계에서 하나씩 내 것으로 바꿉니다.'));
    p.append(el('div', { class: 'wz-grid' }, PURPOSES.map(function (pu) {
      return card(w.purpose === pu.id, [el('b', { text: pu.name }), el('small', { text: pu.desc })], function () { pickPurpose(pu); });
    })));
  }
  // ── ② 이름 ──
  function nameStep(p) {
    var w = wiz(), tip = purpose().tip;
    p.append(head('이름과 첫 문장', '페이지 맨 위와 첫 화면에 들어갈 글입니다. 적는 대로 미리보기에 바로 보입니다.'));
    [['name', '이름(가게 · 행사 · 내 이름)', tip[0]], ['head', '첫 화면 큰 제목', tip[1]], ['line', '한 줄 소개', tip[2]]].forEach(function (f) {
      p.append(el('div', { class: 'fld' }, [el('label', { for: 'wz-' + f[0], text: f[1] }),
        el('input', { class: 'inp', id: 'wz-' + f[0], value: w[f[0]] || '', placeholder: '예: ' + f[2], oninput: function (e) {
          w[f[0]] = e.target.value.trim(); applyNames(); X.changed(); if (f[0] === 'name') X.$('#pname').value = X.defn().title; } })]));
    });
  }
  // ── ③ 형태 ──
  function shapeStep(p) {
    var d = X.defn(), bl = d.blocks, ul = el('ul', { class: 'blist' }), idx = [];
    bl.forEach(function (b, i) { if (part(b.part).kind === 'block') idx.push(i); });
    p.append(head('들어갈 부분과 순서', purpose().name + '에 맞는 부분을 미리 골라 두었습니다. 빼거나 더하고, 화살표로 순서를 바꿉니다.'));
    function swap(a, b) { var t = bl[a]; bl[a] = bl[b]; bl[b] = t; X.S.focus = b; X.changed(); redraw(); }
    idx.forEach(function (i, k) {
      var b = bl[i];
      ul.append(el('li', { class: 'bitem' + (X.S.focus === i ? ' sel' : '') }, [el('span', { class: 'handle', text: String(k + 1) }),
        el('div', { class: 'bname', role: 'button', tabindex: 0, onclick: function () { focusOn(i); redraw(); } }, [el('b', { text: part(b.part).name }), el('small', { text: DESC[b.part] || '' })]),
        el('span', { class: 'bacts' }, [
          el('button', { class: 'btn sm ghost ico', type: 'button', 'aria-label': '위로', text: '↑', disabled: k === 0, onclick: function () { swap(i, idx[k - 1]); } }),
          el('button', { class: 'btn sm ghost ico', type: 'button', 'aria-label': '아래로', text: '↓', disabled: k === idx.length - 1, onclick: function () { swap(i, idx[k + 1]); } }),
          el('button', { class: 'btn sm ghost ico danger', type: 'button', 'aria-label': '빼기', text: '✕', disabled: idx.length < 2, onclick: function () {
            bl.splice(i, 1); X.S.focus = null; X.changed(); redraw(); } })])]));
    });
    p.append(ul, el('h3', { text: '더 넣을 수 있는 부분' }));
    var have = bl.map(function (b) { return b.part; }), more = el('div', { class: 'wz-grid' });
    X.D.core.catalog.parts.forEach(function (pp) {
      if (pp.kind !== 'block' || have.indexOf(pp.id) >= 0) return;
      more.append(card(false, [el('b', { text: '+ ' + pp.name }), el('small', { text: DESC[pp.id] || '' })], function () {
        var at = pp.id === 'header' ? 0 : insertAt(); bl.splice(at, 0, makeBlock(purpose(), pp.id)); applyNames();
        X.S.focus = at; X.changed(); redraw(); U.toast(pp.name + ' 부분을 넣었습니다'); }));
    });
    p.append(more);
  }
  // ── ④ 디자인 ──
  function swatch(t, on, cb) {
    var c = t.color;
    return el('button', { class: 'sw', type: 'button', 'aria-pressed': String(on), onclick: cb },
      [el('i', { html: ['bg', 'primary', 'accent', 'fg'].map(function (k) { return '<b style="background:' + c[k] + '"></b>'; }).join('') }),
        el('span', { text: t.label })]);
  }
  function designStep(p) {
    p.append(head('디자인', '위에서부터 분위기 → 색상 → 글씨체 → 어두운 화면 순서로 고릅니다. 누를 때마다 미리보기가 바뀝니다(폰은 아래 «미리보기»).'));
    design(p, wiz());
  }
  function design(p, w) {  // w = 이 화면 상태(모두 보기 여부) — 쉬운 고치기(simple.js)도 씀
    var d = X.defn(), look = d.look || 'plain', set = function () { X.changed(); redraw(); };
    p.append(el('h3', { text: '1. 분위기' }), el('div', { class: 'wz-grid' }, Object.keys(LOOKS).map(function (k) {
      return card(look === k, [el('i', { class: 'lk lk-' + k, text: 'Aa 가' }), el('b', { text: X.D.core.catalog.looks[k] }), el('small', { text: LOOKS[k] })], function () {
        d.look = k; if (THEMES[k].indexOf(d.theme) < 0) { d.theme = THEMES[k][0]; delete d.dark_theme; U.toast('분위기에 맞춰 색도 바꿨습니다'); } set(); });
    })));
    var rec = THEMES[look].filter(function (id) { return X.E.tokens[id]; }), sw = el('div', { class: 'swatches' });
    (w.allThemes ? X.D.core.tokens.map(function (t) { return t.id; }) : rec).forEach(function (id) {
      sw.append(swatch(X.E.tokens[id], d.theme === id, function () { d.theme = id; delete d.dark_theme; set(); }));
    });
    p.append(el('h3', { text: '2. 색상' }), el('p', { class: 'hint', text: w.allThemes ? '57가지 모두입니다.' : '«' + X.D.core.catalog.looks[look] + '» 분위기에 어울리는 8가지입니다.' }), sw,
      el('button', { class: 'btn sm ghost', type: 'button', text: w.allThemes ? '추천만 보기' : '57가지 모두 보기', onclick: function () { w.allThemes = !w.allThemes; redraw(); } }));
    var f = d.font || {}, lh = X.D.core.lookHead[look];
    p.append(el('h3', { text: '3. 글씨체' }), lh ? el('p', { class: 'hint', text: '«' + X.D.core.catalog.looks[look] + '» 분위기는 제목을 ' + fk(lh) + '로 씁니다. 제목 글씨체가 따로 있는 것을 고르면 그쪽이 앞섭니다.' }) : '',
      el('div', { class: 'wz-grid' }, FONTS.map(function (o) {
      var fam = function (k) { return "'" + X.D.core.fonts[k].family + "',sans-serif"; };
      return card(f.body === o.body && (f.head || null) === (o.head || null), [
        el('i', { class: 'fs', style: 'font-family:' + fam(o.head || o.body), text: '웹 페이지 가나다' }),
        el('b', { text: o.label }), el('small', { style: 'font-family:' + fam(o.body), text: o.sample })], function () {
        d.font = { body: o.body }; if (o.head) d.font.head = o.head; set(); });
    })));
    var tok = X.E.tokens[d.theme], darks = X.D.core.tokens.filter(function (t) { return t.scheme === 'dark'; });
    p.append(el('h3', { text: '4. 어두운 화면' }));
    if (tok.scheme === 'dark') p.append(el('p', { class: 'hint', text: '고른 색이 이미 어두운 색입니다. 보는 사람 기기와 상관없이 늘 어둡게 보입니다.' }));
    else p.append(el('div', { class: 'wz-grid' }, [
      card(!d.dark_theme, [el('b', { text: '늘 이 색으로' }), el('small', { text: '보는 사람 폰이 어두운 모드여도 그대로' })], function () { delete d.dark_theme; set(); }),
      card(!!d.dark_theme, [el('b', { text: '기기 따라 어둡게' }), el('small', { text: '폰이 어두운 모드면 어울리는 어두운 색으로' })], function () {
        d.dark_theme = (darks.filter(function (t) { return t.from === tok.from; })[0] || darks[0]).id; set(); })]));
  }
  // ── ⑤ 기능 ──
  function featStep(p) {
    var d = X.defn(), bl = d.blocks;
    p.append(head('꾸밈', '움직임과 작은 꾸밈을 고릅니다. 켜면 맨 아래 부분 바로 위에 들어가고, 순서는 ③에서 바꿀 수 있습니다.'));
    p.append(el('h3', { text: '움직임' }), el('div', { class: 'wz-grid' }, MOTION.map(function (m) {
      return card(String(d.motion == null ? 1 : d.motion) === m[0], [el('b', { text: m[1] }), el('small', { text: m[2] })], function () { d.motion = +m[0]; X.changed(); redraw(); });
    })));
    var g = el('div', { class: 'wz-grid' });
    X.D.core.catalog.parts.forEach(function (pp) {
      if (pp.kind !== 'small') return;
      var on = bl.some(function (b) { return b.part === pp.id; });
      g.append(card(on, [el('b', { text: (on ? '✓ ' : '+ ') + pp.name }), el('small', { text: DESC[pp.id] || '' })], function () {
        if (on) d.blocks = bl.filter(function (b) { return b.part !== pp.id; });
        else { var at = insertAt(); bl.splice(at, 0, makeBlock(purpose(), pp.id)); X.S.focus = at; }
        X.changed(); redraw(); }));
    });
    p.append(el('h3', { text: '작은 꾸밈' }), g,
      el('p', { class: 'hint wz-note', text: '만든 페이지는 웹 페이지 파일 하나라서 신청서 받기 · 회원 가입 · 결제는 넣을 수 없습니다. 연락처 부분의 전화 · 메일 · 링크로 대신합니다.' }));
  }
  // ── ⑥ 내용 ──
  function untouched(b) { var o = wiz().orig[b.id]; return o != null && o === JSON.stringify(b.content); }
  function fillStep(p) {
    var d = X.defn(), bl = d.blocks, w = wiz();
    if (w.fill == null || w.fill >= bl.length) w.fill = 0;
    var b = bl[w.fill], pp = part(b.part);
    if (X.S.focus !== w.fill) focusOn(w.fill);
    p.append(head('내용 채우기 · ' + (w.fill + 1) + ' / ' + bl.length, '부분마다 예시 글을 내 글로 바꿉니다. 사진은 고르기 상자에서 «내 사진 넣기»를 고릅니다. 미리보기에서 눌러도 그 부분으로 옵니다.'));
    p.append(el('div', { class: 'chips wz-jump' }, bl.map(function (x, i) {
      return el('button', { class: 'chip', type: 'button', 'aria-pressed': String(i === w.fill), text: (i + 1) + ' ' + part(x.part).name + (untouched(x) ? '' : ' ✓'),
        onclick: function () { w.fill = i; redraw(); } });
    })));
    p.append(el('div', { class: 'wz-now' }, [el('b', { text: pp.name }), el('small', { text: DESC[b.part] || '' })]));
    if (pp.kind === 'small') p.append(el('div', { class: 'fld' }, [el('label', { for: 'wz-tt', text: '위 제목(없으면 비움)' }),
      el('input', { class: 'inp', id: 'wz-tt', value: b.title || '', oninput: function (e) { b.title = e.target.value; X.changed(); } })]));
    if (b.content == null) b.content = U.clone(pp.sample);
    Object.keys(pp.slots).forEach(function (k) { p.append(F.field(pp.slots, k, b.content, redraw)); });
    p.append(el('div', { class: 'row wz-sub' }, [
      el('button', { class: 'btn sm', type: 'button', text: '← 앞 부분', disabled: w.fill === 0, onclick: function () { w.fill -= 1; redraw(); X.$('#pane').scrollTop = 0; } }),
      el('button', { class: 'btn sm', type: 'button', text: '다음 부분 →', disabled: w.fill === bl.length - 1, onclick: function () { w.fill += 1; redraw(); X.$('#pane').scrollTop = 0; } })]));
  }
  // ── ⑦ 확인 ──
  function doneStep(p) {
    var d = X.defn(), w = wiz(), f = d.font || {}, left = [], hd = f.head || X.D.core.lookHead[d.look || 'plain'];
    d.blocks.forEach(function (b, i) { if (untouched(b)) left.push(i); });
    var fam = function (k) { return k ? fk(k) : ''; };
    p.append(head('다 됐습니다', '미리보기가 완성된 페이지입니다. 저장하면 인터넷 없이도 열리는 웹 페이지 파일 하나가 됩니다.'));
    p.append(el('dl', { class: 'wz-sum' }, [
      ['종류', purpose().name], ['이름', d.title || '(없음)'], ['부분', d.blocks.length + '개'], ['분위기', X.D.core.catalog.looks[d.look || 'plain']],
      ['색상', X.E.tokens[d.theme].label + (d.dark_theme ? ' · 기기 따라 어둡게' : '')], ['글씨체', fam(f.body) + (hd && hd !== f.body ? ' · 제목 ' + fam(hd) : '')],
      ['움직임', MOTION[d.motion == null ? 1 : d.motion][1]]].reduce(function (a, r) { return a.concat([el('dt', { text: r[0] }), el('dd', { text: r[1] })]); }, [])));
    if (left.length) {
      p.append(el('h3', { text: '아직 예시 글 그대로인 부분 · ' + left.length + '개' }), el('p', { class: 'hint', text: '누르면 그 부분 채우기로 갑니다.' }),
        el('div', { class: 'chips' }, left.map(function (i) {
          return el('button', { class: 'chip', type: 'button', text: (i + 1) + ' ' + part(d.blocks[i].part).name, onclick: function () { w.fill = i; go(5); } });
        })));
    } else p.append(el('p', { class: 'ok', text: '모든 부분을 내 글로 바꿨습니다.' }));
    p.append(el('div', { class: 'wz-end' }, [
      el('button', { class: 'btn pri', type: 'button', text: '📤 저장 · 보내기', onclick: X.exportDialog }),
      el('button', { class: 'btn', type: 'button', text: '✏️ 더 고치기', onclick: finish }),
      el('button', { class: 'btn ghost', type: 'button', text: '새 페이지 하나 더', onclick: start })]));
  }

  // ── 틀 · 이동 ──
  function progress() {
    var w = wiz();
    return el('ol', { class: 'wz-steps' }, STEPS.map(function (s, i) {
      return el('li', {}, [el('button', { type: 'button', class: i === w.step ? 'cur' : i < w.step ? 'done' : '', 'aria-current': i === w.step ? 'step' : null,
        disabled: !w.purpose && i > 0, onclick: function () { go(i); } }, [el('b', { text: String(i + 1) }), el('span', { text: s })])]);
    }));
  }
  function nav() {
    var w = wiz(), last = w.step === STEPS.length - 1;
    return el('div', { class: 'wz-nav' }, [
      el('button', { class: 'btn', type: 'button', text: '← 이전', disabled: w.step === 0, onclick: function () { go(w.step - 1); } }),
      el('span', { class: 'sp', text: (w.step + 1) + ' / ' + STEPS.length }),
      last ? null : el('button', { class: 'btn pri', type: 'button', text: w.step === 5 ? '확인으로 →' : '다음 →', disabled: !w.purpose, onclick: function () { go(w.step + 1); } })]);
  }
  function go(i) {
    var w = wiz(); w.step = Math.max(0, Math.min(STEPS.length - 1, i));
    if (w.step !== 2 && w.step !== 5) X.S.focus = w.step === 1 ? 0 : null;
    X.save(); redraw(); X.$('#pane').scrollTop = 0; X.preview();
  }
  function render(p) {
    var w = wiz(), body = el('div', { class: 'wz-body' });
    [purposeStep, nameStep, shapeStep, designStep, featStep, fillStep, doneStep][w.step](body);
    p.append(progress(), body, nav());
  }
  function start() {
    U.closeDialog();
    var pg = X.newPage({ title: '새 페이지', theme: 'daisy-nord', look: 'plain', motion: 1, font: { body: 'pretendard' }, blocks: [{ part: 'hero', tone: 'glow',
      content: { layout: 'center', eyebrow: '페이지 공방', title: '무엇을 만들까요?', text: '왼쪽에서 만들 페이지의 종류를 고르면 여기에 바로 모양이 잡힙니다.', image: '' } }] });
    pg.wiz = { step: 0, orig: {} }; X.S.focus = null; X.DB.put(pg); X.openPage(pg);
    if (root.innerWidth >= 900) { var pc = X.$('[data-dev=pc]'); if (pc) pc.click(); }
  }
  function finish() { wiz().done = true; X.S.focus = null; X.S.sel = null; X.S.view = null; X.save(); redraw(); X.preview(); U.toast('이제 고칠 곳을 눌러 하나씩 고칠 수 있습니다'); }
  function jumpFill(i) { var w = wiz(); if (!w.purpose) return; w.fill = i; go(5); }

  root.PSWizard = {
    init: function (ctx) {
      X = ctx;  // { D, E, S, DB, $, defn, changed, preview, renderPane, newPage, openPage, exportDialog, fontCssFor, save }
      document.head.append(el('style', { text: X.fontCssFor(['suit', 'gowun-batang', 'black-han-sans'], function (p) { return "'data/fonts/" + p.file + "'"; }) }));
    },
    active: function () { var c = X && X.S.cur; return !!(c && c.wiz && !c.wiz.done); },
    render: render, start: start, jumpFill: jumpFill, STEPS: STEPS, PURPOSES: PURPOSES, THEMES: THEMES,  // 쉬운 만들기(easy.js)도 같은 종류 · 색 묶음을 씀
    DESC: DESC, design: design  // 쉬운 고치기(simple.js)가 부분 설명 · 디자인 고르기를 씀
  };
})(window);
