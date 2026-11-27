// 페이지 공방 쉬운 고치기 — 다 만든 페이지를 미리보기에서 누르거나 목록에서 골라 큰 버튼(글 · 사진 · 배경 · 위로/아래로 · 빼기)으로 고치고, 디자인은 한 곳에서 그림 카드로 바꾼다. 세밀하게는 «고급 고치기»(탭 화면)
(function (root) {
  'use strict';
  var U = root.PSUI, F = root.PSFields, el = U.el, X = null, W = null;
  var EMO = { header: '🧭', hero: '🌅', intro: '📝', cards: '🃏', stats: '🔢', table: '📋', figure: '🖼️', gallery: '📷', buttons: '👉', footer: '⬇️',
    pricing: '💰', faq: '❓', testimonials: '💬', contact: '☎️', free: '🎨', badge: '🏷️', progress: '📊', ring: '⭕', steps: '👣', loader: '🌀',
    alert: '📢', tabs: '🗂️', timeline: '📅', icon: '✨', sticker: '😊', pattern: '🌈' };
  var FIRST = ['hero', 'intro', 'gallery', 'cards', 'contact', 'faq', 'testimonials', 'pricing', 'buttons', 'figure', 'stats', 'table', 'header', 'footer', 'free'];
  var FONT_KO = { pretendard: '또박또박 글씨', suit: '동글동글 글씨', 'gowun-batang': '붓글씨 느낌', 'black-han-sans': '굵은 제목 글씨' };
  var HUE = [[15, '빨강'], [40, '주황'], [65, '노랑'], [90, '연두'], [160, '초록'], [190, '청록'], [215, '하늘'], [250, '파랑'], [290, '보라'], [345, '분홍'], [360, '빨강']];

  // 색상 이름 — 영어 테마 이름 대신 «밝은 파랑 2»처럼 주 색의 빛깔 · 밝기로 부른다
  function hsl(hex) {
    var n = parseInt(String(hex).slice(1), 16), r = (n >> 16) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0, l = (mx + mn) / 2, s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
    if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [(h * 60 + 360) % 360, s, l];
  }
  function nameThemes(tokens, map) {
    var seen = {}, base = tokens.map(function (t) {
      var c = hsl(t.color.primary), hue = c[1] < 0.18 ? '흑백' : HUE.filter(function (x) { return c[0] < x[0]; })[0][1];
      var nm = (t.scheme === 'dark' ? '어두운 ' : '밝은 ') + hue; seen[nm] = (seen[nm] || 0) + 1; return nm;
    }), cnt = {};
    tokens.forEach(function (t, i) {
      var nm = base[i]; cnt[nm] = (cnt[nm] || 0) + 1;
      t.label = seen[nm] > 1 ? nm + ' ' + cnt[nm] : nm;
      if (map && map[t.id]) map[t.id].label = t.label;
    });
  }

  function S() { return X.S; }
  function bl() { return X.defn().blocks; }
  function part(id) { return X.E.parts[id]; }
  function redraw() { X.renderPane(); }
  function top(t, s, back) {
    return el('div', { class: 'sp-top' }, [back ? el('button', { class: 'btn ez-big sp-back', type: 'button', text: '← 돌아가기', onclick: back }) : null,
      el('h2', { class: 'ez-q', text: t }), s ? el('p', { class: 'ez-s', text: s }) : null]);
  }
  function home() { S().sel = null; S().view = null; S().focus = null; redraw(); X.preview(); X.$('#pane').scrollTop = 0; }
  function pick(i) {
    S().sel = i; S().view = null; S().focus = i; redraw(); X.preview(); X.$('#pane').scrollTop = 0;
    var m = X.$('#app'); if (m.dataset.m === 'view') { var b = X.$('.mnav [data-m=edit]'); if (b) b.click(); }
  }
  function move(i, j) {
    var a = bl(); if (j < 0 || j >= a.length) return;
    a.splice(j, 0, a.splice(i, 1)[0]); if (S().sel != null) S().sel = S().focus = j; X.changed(); redraw();
  }
  function summary(b) {
    var c = b.content || part(b.part).sample || {};
    return c.title || c.brand || (c.items && c.items[0] && F.itemSummary(c.items[0])) || '';
  }

  // ── 처음 — 페이지 구성 목록 ──
  function homeView(p) {
    var a = bl(), list = el('div', { class: 'sp-list' });
    p.append(top('무엇을 고칠까요?', '미리보기에서 고칠 곳을 누르거나, 아래 목록에서 고르세요.'));
    p.append(el('div', { class: 'ez-grid sp-two' }, [
      el('button', { class: 'ez-card', type: 'button', onclick: function () { S().view = 'design'; redraw(); X.$('#pane').scrollTop = 0; } },
        [el('i', { text: '🎨' }), el('b', { text: '디자인 바꾸기' }), el('small', { text: '분위기 · 색상 · 글씨체' })]),
      el('button', { class: 'ez-card', type: 'button', onclick: function () { S().view = 'add'; redraw(); X.$('#pane').scrollTop = 0; } },
        [el('i', { text: '➕' }), el('b', { text: '부분 더하기' }), el('small', { text: '사진 모음 · 묻고 답하기 같은 것' })])]));
    p.append(el('h3', { class: 'sp-h', text: '내 페이지 구성 · 위에서부터 ' + a.length + '개' }));
    a.forEach(function (b, i) {
      list.append(el('div', { class: 'sp-row' }, [
        el('button', { class: 'sp-name', type: 'button', onclick: function () { pick(i); } },
          [el('i', { text: EMO[b.part] || '▪' }), el('span', {}, [el('b', { text: part(b.part).name }), el('small', { text: summary(b) })])]),
        el('button', { class: 'btn sp-mv', type: 'button', 'aria-label': '위로', text: '↑', disabled: i === 0, onclick: function () { move(i, i - 1); } }),
        el('button', { class: 'btn sp-mv', type: 'button', 'aria-label': '아래로', text: '↓', disabled: i === a.length - 1, onclick: function () { move(i, i + 1); } })]));
    });
    p.append(list, el('div', { class: 'ez-end' }, [
      el('button', { class: 'btn pri ez-big', type: 'button', text: '📤 저장 · 보내기', onclick: X.exportDialog }),
      el('button', { class: 'btn ghost', type: 'button', text: '⚙️ 고급 고치기(하나하나 세밀하게)', onclick: function () { X.S.cur.adv = true; S().sel = null; S().focus = null; X.save(); redraw(); X.preview(); } })]));
  }

  // ── 한 부분 고치기 ──
  function partView(p) {
    var a = bl(), i = S().sel, b = a[i], pp = part(b.part), tones = X.D.core.catalog.tones;
    if (b.content == null) b.content = U.clone(pp.sample);
    p.append(top((EMO[b.part] || '') + ' ' + pp.name, (i + 1) + '번째 부분 · 고치는 대로 미리보기에 바로 보입니다.', home));
    p.append(el('div', { class: 'sp-acts' }, [
      el('button', { class: 'btn ez-big', type: 'button', text: '↑ 위로', disabled: i === 0, onclick: function () { move(i, i - 1); } }),
      el('button', { class: 'btn ez-big', type: 'button', text: '↓ 아래로', disabled: i === a.length - 1, onclick: function () { move(i, i + 1); } }),
      el('button', { class: 'btn ez-big', type: 'button', text: '📄 하나 더', onclick: function () {
        a.splice(i + 1, 0, Object.assign(U.clone(b), { id: U.uid() })); S().sel = S().focus = i + 1; X.changed(); redraw(); U.toast('똑같은 것을 아래에 하나 더 넣었습니다'); } }),
      el('button', { class: 'btn ez-big danger', type: 'button', text: '🗑 빼기', disabled: a.length < 2, onclick: function (e) {
        U.sure(e.target, '🗑 빼기', function () { a.splice(i, 1); X.changed(); home(); U.toast(pp.name + ' 부분을 뺐습니다'); }); } })]));
    p.append(el('h3', { class: 'sp-h', text: '배경' }), el('div', { class: 'chips sp-chips' }, Object.keys(tones).map(function (t) {
      return el('button', { class: 'chip', type: 'button', 'aria-pressed': String((b.tone || 'plain') === t), text: tones[t], onclick: function () { b.tone = t; X.changed(); redraw(); } });
    })));
    p.append(el('h3', { class: 'sp-h', text: '글 · 사진' }));
    var box = el('div', { class: 'sp-fields' });
    if (pp.kind === 'small') box.append(el('div', { class: 'fld' }, [el('label', { for: 'sp-tt', text: '위 제목(없으면 비워 두세요)' }),
      el('input', { class: 'inp', id: 'sp-tt', value: b.title || '', oninput: function (e) { b.title = e.target.value; X.changed(); } })]));
    Object.keys(pp.slots).forEach(function (k) { box.append(F.field(pp.slots, k, b.content, redraw)); });
    p.append(box, el('div', { class: 'ez-end' }, [el('button', { class: 'btn pri ez-big', type: 'button', text: '✓ 다 고쳤어요', onclick: home })]));
  }

  // ── 부분 더하기 ──
  function addView(p) {
    var cat = X.D.core.catalog.parts.slice(), at = function () {
      var a = bl(), f = a.map(function (b) { return b.part; }).lastIndexOf('footer'); return S().sel != null ? S().sel + 1 : f < 0 ? a.length : f;
    };
    cat.sort(function (x, y) { var a = FIRST.indexOf(x.id), b = FIRST.indexOf(y.id); return (a < 0 ? 99 : a) - (b < 0 ? 99 : b); });
    p.append(top('어떤 부분을 더할까요?', '고르면 예시 글이 든 채로 들어갑니다. 그다음 내 글로 바꾸면 됩니다.', home));
    [['block', '큰 부분'], ['small', '작은 꾸밈']].forEach(function (g) {
      var grid = el('div', { class: 'ez-grid' });
      cat.forEach(function (pp) {
        if (pp.kind !== g[0]) return;
        grid.append(el('button', { class: 'ez-card', type: 'button', onclick: function () {
          var i = pp.id === 'header' ? 0 : at(), b = { id: U.uid(), part: pp.id, tone: 'plain', title: pp.kind === 'small' ? pp.name : undefined, content: U.clone(pp.sample) };
          bl().splice(i, 0, b); X.changed(); pick(i); U.toast(pp.name + ' 부분을 넣었습니다');
        } }, [el('i', { text: EMO[pp.id] || '▪' }), el('b', { text: pp.name }), el('small', { text: (W.DESC[pp.id] || '').split(' — ')[1] || '' })]));
      });
      p.append(el('h3', { class: 'sp-h', text: g[1] }), grid);
    });
  }

  // ── 디자인 바꾸기 — 안내 만들기의 디자인 단계를 그대로 씀 ──
  function designView(p) {
    var c = X.S.cur; c.simple = c.simple || {};
    p.append(top('디자인 바꾸기', '누를 때마다 미리보기가 바뀝니다. 폰에서는 아래 «미리보기»로 보세요.', home));
    W.design(p, c.simple);
    p.append(el('div', { class: 'ez-end' }, [el('button', { class: 'btn pri ez-big', type: 'button', text: '✓ 이대로 할게요', onclick: home })]));
  }

  function render(p) {
    var body = el('div', { class: 'ez-body sp-body' }), s = S();
    if (s.sel != null && !bl()[s.sel]) s.sel = null;
    (s.view === 'design' ? designView : s.view === 'add' ? addView : s.sel != null ? partView : homeView)(body);
    p.append(body);
  }

  root.PSSimple = {
    init: function (ctx) { X = ctx; W = root.PSWizard; nameThemes(X.D.core.tokens, X.E.tokens); },
    active: function () { var c = X && X.S.cur; return !!(c && !c.adv); },
    render: render, pick: pick, nameThemes: nameThemes, FONT_KO: FONT_KO, EMO: EMO
  };
})(window);
