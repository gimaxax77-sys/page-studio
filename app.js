// 페이지 공방 앱 — 쉬운 만들기 · 안내 만들기 · 쉬운 고치기 · 고급 고치기(부분 · 디자인 · 페이지 탭) · 페이지 목록 · 미리보기 · 저장 · 보내기. 기반 ui.js · 입력 칸 fields.js · 조립 engine.js
(function () {
  'use strict';
  var U = window.PSUI, F = window.PSFields, W = window.PSWizard, EZ = window.PSEasy, SM = window.PSSimple, el = U.el, $ = U.$, DB = U.DB;
  function guided() { return EZ.active() || W.active() || SM.active(); }
  var D = {}, E = null;
  var S = { list: [], cur: null, tab: 'blocks', sel: null, dev: 'phone', fsel: 0, themeFilter: 'all', withFonts: true };
  var BLANK = { title: '새 페이지', theme: 'daisy-nord', look: 'plain', motion: 1, font: { body: 'pretendard' }, blocks: [{ part: 'header' }, { part: 'hero' }, { part: 'footer' }] };
  function defn() { return S.cur.defn; }

  // ── 저장 · 미리보기 ──
  var saveSoon = U.debounce(function () { if (S.cur) { S.cur.updated = Date.now(); DB.put(S.cur); } }, 400);
  function fontCssFor(keys, src) {
    var plan = [];
    keys.forEach(function (k) { var fm = D.core.fonts[k]; fm.faces.forEach(function (face) { face.chunks.forEach(function (c) {
      plan.push({ family: fm.family, weight: face.weight, file: c.file, range: c.range }); }); }); });
    return E.fontFaceCss(plan, src);
  }
  var lastScroll = 0;
  function preview() {
    var fr = $('#frame'), d = defn(), errs = E.check(d);
    try { lastScroll = fr.contentWindow ? fr.contentWindow.scrollY : 0; } catch (e) { lastScroll = 0; }
    if (errs.length) { fr.srcdoc = '<p style="font:15px sans-serif;padding:1rem">' + E.esc(errs.join(' · ')) + '</p>'; return; }
    var f = E.fontsOf(d);  // 미리보기는 글꼴 파일 주소를 그대로(필요한 묶음만 브라우저가 받음)
    fr.srcdoc = E.buildDoc(d, fontCssFor(f.head === f.body ? [f.body] : [f.body, f.head], function (p) { return "'data/fonts/" + p.file + "'"; }));
    $('#vinfo').textContent = guided() ? '내 페이지 미리보기' : '부분 ' + d.blocks.length + '개 · ' + E.tokens[d.theme].label;
  }
  var previewSoon = U.debounce(preview, 220);
  function changed() { saveSoon(); previewSoon(); }
  function onFrameLoad() {
    var fr = $('#frame'), doc = fr.contentDocument; if (!doc) return;
    var ps0 = doc.querySelector('.ps'), foc = guided() && S.focus != null && ps0 ? ps0.children[S.focus] : null;
    if (foc) {  // 안내 중에는 지금 다루는 칸으로 내려 테두리를 둘러 보여 줌
      foc.style.outline = '3px solid #8b85ff'; foc.style.outlineOffset = '-3px';
      try { fr.contentWindow.scrollTo(0, Math.max(0, foc.offsetTop - 12)); } catch (e) { /* 처음 */ }
    } else try { fr.contentWindow.scrollTo(0, lastScroll); } catch (e) { /* 처음 */ }
    doc.addEventListener('click', function (ev) {  // 미리보기에서 부분을 누르면 그 부분 고치기로(안내 중이면 그 칸 채우기로)
      if (ev.target.closest('a')) ev.preventDefault();
      var ps = doc.querySelector('.ps'), node = ev.target;
      while (node && node.parentNode !== ps) node = node.parentNode;
      if (!ps || !node) return;
      var i = Array.prototype.indexOf.call(ps.children, node);
      if (EZ.active()) return EZ.jump(i);
      if (W.active()) return W.jumpFill(i);
      if (SM.active()) return SM.pick(i);
      S.tab = 'blocks'; S.sel = i; S.fsel = 0; renderTabs(); renderPane();
    });
  }

  // ── 고급 고치기: 부분 목록 · 끌어서 순서 바꾸기 ──
  function blockSummary(b) {
    var c = b.content || E.parts[b.part].sample || {};
    return c.title || c.brand || (c.items && c.items[0] && F.itemSummary(c.items[0])) || '';
  }
  function moveBlock(from, to) {
    var bl = defn().blocks; if (to < 0 || to >= bl.length || from === to) return;
    bl.splice(to, 0, bl.splice(from, 1)[0]); changed(); renderPane();
  }
  function dragHandle(hd, li, ul, i) {
    hd.addEventListener('pointerdown', function (ev) {
      ev.preventDefault(); hd.setPointerCapture(ev.pointerId);
      var sy = ev.clientY, rows = Array.prototype.slice.call(ul.children), dy = 0, mid0 = li.getBoundingClientRect();
      li.classList.add('drag');
      function mv(e) { dy = e.clientY - sy; li.style.transform = 'translateY(' + dy + 'px)'; }
      function up() {
        hd.removeEventListener('pointermove', mv); hd.removeEventListener('pointerup', up);
        li.classList.remove('drag'); li.style.transform = '';
        if (Math.abs(dy) < 6) return;
        var y = mid0.top + mid0.height / 2 + dy, to = i;
        rows.forEach(function (x, j) { if (j === i) return; var r = x.getBoundingClientRect(), m = r.top + r.height / 2;
          if (j > i && y > m) to = j; if (j < i && y < m && to === i) to = j; });
        moveBlock(i, to);
      }
      hd.addEventListener('pointermove', mv); hd.addEventListener('pointerup', up);
    });
  }
  function blocksPane(p) {
    var bl = defn().blocks, ul = el('ul', { class: 'blist' });
    p.append(el('p', { class: 'hint', text: '⠿ 를 끌어 순서를 바꾸고, 이름을 눌러 내용을 고칩니다. 미리보기에서 눌러도 됩니다.' }));
    bl.forEach(function (b, i) {
      var part = E.parts[b.part], hd = el('span', { class: 'handle', 'aria-label': '끌어서 옮기기', text: '⠿' });
      var open = function () { S.sel = i; S.fsel = 0; renderPane(); };
      var li = el('li', { class: 'bitem' + (S.sel === i ? ' sel' : '') }, [hd,
        el('div', { class: 'bname', role: 'button', tabindex: 0, onclick: open, onkeydown: function (e) { if (e.key === 'Enter') open(); } },
          [el('b', { text: part.name }), el('small', { text: blockSummary(b) || (part.kind === 'small' ? '작은 꾸밈' : '부분') })]),
        el('span', { class: 'bacts' }, [
          el('button', { class: 'btn sm ghost ico', type: 'button', 'aria-label': '위로', text: '↑', disabled: i === 0, onclick: function () { moveBlock(i, i - 1); } }),
          el('button', { class: 'btn sm ghost ico', type: 'button', 'aria-label': '아래로', text: '↓', disabled: i === bl.length - 1, onclick: function () { moveBlock(i, i + 1); } })])]);
      dragHandle(hd, li, ul, i);
      ul.append(li);
    });
    p.append(ul, el('button', { class: 'btn add', type: 'button', text: '+ 부분 더하기', onclick: addBlockDialog }));
  }
  function addBlockDialog() {
    var box = el('div');
    [['block', '큰 부분 — 페이지를 이루는 덩어리'], ['small', '작은 꾸밈 — 꼬리표 · 진행 막대 · 단계 같은 것']].forEach(function (g) {
      var pg = el('div', { class: 'pgrid', style: 'margin-bottom:1rem' });
      Object.keys(E.parts).forEach(function (id) {
        var p = E.parts[id]; if (p.kind !== g[0]) return;
        pg.append(el('button', { class: 'pcard', type: 'button', onclick: function () {
          var bl = defn().blocks, at = S.sel == null ? bl.length : S.sel + 1;
          bl.splice(at, 0, { id: U.uid(), part: id, tone: 'plain', title: p.kind === 'small' ? p.name : undefined, content: U.clone(p.sample) });
          S.sel = at; S.fsel = 0; U.closeDialog(); changed(); renderPane(); U.toast(p.name + ' 부분을 넣었습니다');
        } }, [el('b', { text: (SM.EMO[id] || '') + ' ' + p.name }), el('small', { text: (W.DESC[id] || '').split(' — ')[1] || '' })]));
      });
      box.append(el('h3', { text: g[1] }), pg);
    });
    U.dialog('부분 더하기', box);
  }
  function editorPane(p) {
    var bl = defn().blocks, b = bl[S.sel]; if (!b) { S.sel = null; return blocksPane(p); }
    var part = E.parts[b.part];
    if (b.content == null) b.content = U.clone(part.sample);
    p.append(el('div', { class: 'ed-head' }, [
      el('button', { class: 'btn sm', type: 'button', text: '← 목록', onclick: function () { S.sel = null; renderPane(); } }),
      el('b', { text: (S.sel + 1) + '. ' + part.name }),
      el('button', { class: 'btn sm', type: 'button', text: '하나 더', onclick: function () { bl.splice(S.sel + 1, 0, Object.assign(U.clone(b), { id: U.uid() })); S.sel += 1; changed(); renderPane(); } }),
      el('button', { class: 'btn sm danger', type: 'button', text: '빼기', onclick: function (e) { U.sure(e.target, '빼기', function () { bl.splice(S.sel, 1); S.sel = null; changed(); renderPane(); }); } })]));
    var tones = D.core.catalog.tones;
    p.append(el('div', { class: 'fld' }, [el('label', { for: 'f-tone', text: '배경' }), el('select', { class: 'inp', id: 'f-tone', onchange: function (e) { b.tone = e.target.value; changed(); } },
      Object.keys(tones).map(function (t) { return el('option', { value: t, selected: (b.tone || 'plain') === t, text: tones[t] }); }))]));
    if (part.kind === 'small') p.append(el('div', { class: 'fld' }, [el('label', { for: 'f-tt', text: '위 제목(없으면 비움)' }),
      el('input', { class: 'inp', id: 'f-tt', value: b.title || '', oninput: function (e) { b.title = e.target.value; changed(); } })]));
    Object.keys(part.slots).forEach(function (k) { p.append(F.field(part.slots, k, b.content, renderPane)); });
  }

  // ── 디자인 탭 ──
  function chips(opts, val, on) {
    return el('div', { class: 'chips', style: 'margin-bottom:1rem' }, opts.map(function (o) {
      return el('button', { class: 'chip', type: 'button', 'aria-pressed': String(o[0] === val), text: o[1], onclick: function () { on(o[0]); changed(); renderPane(); } });
    }));
  }
  function stylePane(p) {
    var d = defn(), toks = D.core.tokens, darks = toks.filter(function (t) { return t.scheme === 'dark'; });
    p.append(el('h3', { text: '색상 · ' + E.tokens[d.theme].label }));
    p.append(chips([['all', '전체'], ['light', '밝은 것'], ['dark', '어두운 것']], S.themeFilter, function (v) { S.themeFilter = v; }));
    var sw = el('div', { class: 'swatches', style: 'margin-bottom:1rem' });
    toks.forEach(function (t) {
      if (S.themeFilter !== 'all' && t.scheme !== S.themeFilter) return;
      var c = t.color;
      sw.append(el('button', { class: 'sw', type: 'button', 'aria-pressed': String(d.theme === t.id), onclick: function () { d.theme = t.id; changed(); renderPane(); } },
        [el('i', { html: ['bg', 'primary', 'accent', 'fg'].map(function (k) { return '<b style="background:' + c[k] + '"></b>'; }).join('') }),
          el('span', { text: t.label })]));
    });
    p.append(sw, el('label', { class: 'fld row' }, [el('input', { type: 'checkbox', checked: !!d.dark_theme, onchange: function (e) {
      d.dark_theme = e.target.checked ? (darks.filter(function (t) { return t.from === E.tokens[d.theme].from; })[0] || darks[0]).id : undefined; changed(); renderPane(); } }),
      '보는 사람 폰이 어두운 모드면 어두운 색상으로']));
    if (d.dark_theme) p.append(el('div', { class: 'fld' }, [el('label', { for: 'f-dk', text: '어두울 때 색상' }),
      el('select', { class: 'inp', id: 'f-dk', onchange: function (e) { d.dark_theme = e.target.value; changed(); } },
        darks.map(function (t) { return el('option', { value: t.id, selected: d.dark_theme === t.id, text: t.label }); }))]));
    var looks = D.core.catalog.looks;
    p.append(el('h3', { text: '분위기' }), chips(Object.keys(looks).map(function (k) { return [k, looks[k]]; }), d.look || 'plain', function (v) { d.look = v; }));
    p.append(el('h3', { text: '움직임' }), chips([['0', '차분'], ['1', '보통'], ['2', '많음']], String(d.motion == null ? 1 : d.motion), function (v) { d.motion = +v; }));
    var fonts = Object.keys(D.core.fonts); d.font = d.font || {};
    var fsel = function (id, lab, val, first, on) {
      return el('div', { class: 'fld' }, [el('label', { for: id, text: lab }), el('select', { class: 'inp', id: id, onchange: function (e) { on(e.target.value); changed(); } },
        (first ? [el('option', { value: '', text: first })] : []).concat(fonts.map(function (k) { return el('option', { value: k, selected: val === k, text: SM.FONT_KO[k] || D.core.fonts[k].family }); })))]);
    };
    p.append(el('h3', { text: '글씨체' }), fsel('f-fb', '본문', d.font.body || 'pretendard', null, function (v) { d.font.body = v; }),
      fsel('f-fh', '제목', d.font.head, '본문과 같게(잡지 · 고급 분위기는 붓글씨 느낌)', function (v) { d.font.head = v || undefined; }));
  }

  // ── 페이지 탭 · 목록 ──
  function stripIds(d) { var c = U.clone(d); c.blocks.forEach(function (b) { delete b.id; }); return c; }
  function pagePane(p) {
    var d = defn();
    p.append(el('div', { class: 'fld' }, [el('label', { for: 'f-ds', text: '한 줄 설명(검색 · 공유 미리보기에 보임)' }),
      el('input', { class: 'inp', id: 'f-ds', value: d.description || '', oninput: function (e) { d.description = e.target.value; changed(); } })]));
    var imp = el('input', { type: 'file', accept: 'application/json,.json', hidden: true, onchange: function (e) {
      var f = e.target.files[0]; if (!f) return; var r = new FileReader();
      r.onload = function () { try { var dd = JSON.parse(r.result), errs = E.check(dd); if (errs.length) throw new Error(errs[0]); openPage(newPage(dd)); U.toast('불러왔습니다'); }
        catch (err) { U.toast('불러오지 못했습니다 — ' + err.message); } };
      r.readAsText(f); } });
    p.append(el('h3', { text: '백업' }), el('p', { class: 'hint', text: '작업 파일로 저장해 두면 다른 기기에서 불러와 이어서 고칠 수 있습니다.' }),
      el('div', { class: 'row' }, [el('button', { class: 'btn sm', type: 'button', text: '작업 파일 저장', onclick: function () { U.download(JSON.stringify(stripIds(d), null, 1), (d.title || 'page') + '.json', 'application/json'); } }),
        el('button', { class: 'btn sm', type: 'button', text: '작업 파일 불러오기', onclick: function () { imp.click(); } }), imp]));
  }
  function newPage(d) {
    var dd = U.clone(d); delete dd._;
    dd.blocks.forEach(function (b) { b.id = U.uid(); if (b.content == null) b.content = U.clone(E.parts[b.part].sample); });
    var pg = { id: U.uid('p'), created: Date.now(), updated: Date.now(), defn: dd };
    S.list.push(pg); DB.put(pg); return pg;
  }
  function openPage(pg) {
    S.cur = pg; S.sel = null; S.fsel = 0; S.view = null; S.focus = null;
    try { localStorage.setItem('ps-last', pg.id); } catch (e) { /* 저장소 막힘 */ }
    renderPane(); preview();
  }
  function pagesDialog() {
    var body = el('div'), list = el('div', { class: 'plist' }), g = el('div', { class: 'pgrid', style: 'margin-bottom:1.2rem' });
    var pick = function (d) { return function () { U.closeDialog(); openPage(newPage(d)); }; };
    g.append(el('button', { class: 'pcard wzc', type: 'button', onclick: EZ.start }, [el('b', { text: '쉽게 만들기' }), el('small', { text: '물음에 하나씩 답하면 페이지가 생겨요' })]));
    g.append(el('button', { class: 'pcard', type: 'button', onclick: W.start }, [el('b', { text: '자세히 안내받기' }), el('small', { text: '무엇을 · 이름 · 구성 · 디자인 · 꾸밈 · 내용 · 확인 7단계' })]));
    g.append(el('button', { class: 'pcard', type: 'button', onclick: pick(BLANK) }, [el('b', { text: '빈 페이지' }), el('small', { text: '위쪽 메뉴 · 첫 화면 · 맨 아래만' })]));
    (D.core.examples || []).forEach(function (ex) { g.append(el('button', { class: 'pcard', type: 'button', onclick: pick(ex) }, [el('b', { text: ex.title }), el('small', { text: '예시 · 부분 ' + ex.blocks.length + '개' })])); });
    S.list.slice().sort(function (a, b) { return b.updated - a.updated; }).forEach(function (pg) {
      var w = new Date(pg.updated);
      list.append(el('div', { class: 'prow' + (pg === S.cur ? ' cur' : '') }, [
        el('div', { onclick: function () { U.closeDialog(); openPage(pg); } }, [el('b', { text: pg.defn.title || '제목 없음' }),
          el('small', { text: '부분 ' + pg.defn.blocks.length + '개 · ' + (w.getMonth() + 1) + '-' + w.getDate() + ' ' + w.toTimeString().slice(0, 5) + ' 고침' +
            (pg.wiz && !pg.wiz.done ? ' · 안내 ' + (pg.wiz.step + 1) + '/' + W.STEPS.length + ' 단계' : '') +
            (pg.easy && pg.easy.phase !== 'off' && pg.easy.phase !== 'done' ? ' · 쉽게 만들기 중' : '') })]),
        el('button', { class: 'btn sm', type: 'button', text: '하나 더', onclick: function () { var c = newPage(pg.defn); c.defn.title = (pg.defn.title || '') + ' 사본'; DB.put(c); pagesDialog(); } }),
        el('button', { class: 'btn sm danger', type: 'button', text: '지우기', disabled: S.list.length < 2, onclick: function (e) { U.sure(e.target, '지우기', function () {
          S.list = S.list.filter(function (x) { return x !== pg; }); DB.del(pg.id); if (pg === S.cur) openPage(S.list[0]); pagesDialog(); }); } })]));
    });
    body.append(el('h3', { text: '새로 만들기' }), g, el('h3', { text: '이 기기에 저장된 페이지 · ' + S.list.length + '개' }), list);
    U.dialog('페이지 목록', body);
  }

  // ── 저장 · 보내기 — 쓰인 글자가 든 글꼴 묶음만 담은 바깥 요청 없는 한 장 ──
  function exportDoc() {
    var d = defn(), errs = E.check(d); if (errs.length) return Promise.reject(new Error(errs.join(' · ')));
    var body = E.body(d);
    if (!S.withFonts) return Promise.resolve(E.buildDoc(d, '', body));
    var plan = E.fontPlan(d, E.textOf(body) + (d.title || ''));
    return Promise.all(plan.map(function (p) { return fetch('data/fonts/' + p.file).then(function (r) { return r.arrayBuffer(); }).then(function (b) { p.data = U.b64(b); }); }))
      .then(function () { return E.buildDoc(d, E.fontFaceCss(plan, function (p) { return 'data:font/woff2;base64,' + p.data; }), body); });
  }
  function exportDialog() {
    var info = el('p', { class: 'hint', text: '만드는 중…' }), name = function () { return (defn().title || 'page'); };
    function refresh() {
      info.textContent = '만드는 중…';
      exportDoc().then(function (doc) { info.textContent = '파일 크기 ' + Math.round(new Blob([doc]).size / 1024) + 'KB · 인터넷 없이도 열리고, 어디에 올려도 그대로 보입니다'; },
        function (e) { info.textContent = e.message; });
    }
    var fail = function (e) { U.toast(e.message); };
    U.dialog('저장 · 보내기', el('div', {}, [
      el('label', { class: 'fld row' }, [el('input', { type: 'checkbox', checked: S.withFonts, onchange: function (e) { S.withFonts = e.target.checked; refresh(); } }),
        '글씨체 함께 담기(끄면 보는 사람 폰 글씨체로 · 파일이 아주 작아짐)']), info,
      el('div', { class: 'row' }, [
        el('button', { class: 'btn pri', type: 'button', text: '💾 웹 페이지 파일로 저장', onclick: function () { exportDoc().then(function (doc) { U.download(doc, name() + '.html', 'text/html'); U.toast('파일을 저장했습니다'); }, fail); } }),
        el('button', { class: 'btn', type: 'button', text: '페이지 원본 글자 복사', onclick: function () { exportDoc().then(function (doc) { U.copy(doc, '원본을 복사했습니다'); }, fail); } })]),
      el('h3', { text: '바로 인터넷 주소 만들기', style: 'margin-top:1.2rem' }),
      el('p', { class: 'hint', text: '누르면 인터넷 주소가 생기는 기능은 다음 단계에서 엽니다(올릴 곳 · 비용 · 악용 막기를 정한 뒤).' }),
      el('button', { class: 'btn', type: 'button', text: '인터넷 주소 만들기', disabled: true })]));
    refresh();
  }

  // ── 그리기 · 시작 ──
  function renderTabs() { document.querySelectorAll('.tabs [data-tab]').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === S.tab)); }); }
  function renderPane() {
    var p = $('#pane'), top = p.scrollTop; p.innerHTML = '';
    var ez = EZ.active(), wz = !ez && W.active(), sm = !ez && !wz && SM.active();
    $('#app').classList.toggle('easy', ez); $('#app').classList.toggle('wiz', wz); $('#app').classList.toggle('simple', sm);
    if (ez) EZ.render(p);
    else if (wz) W.render(p);
    else if (sm) SM.render(p);
    else {
      p.append(el('button', { class: 'btn sm ghost back-simple', type: 'button', text: '← 쉬운 고치기로', onclick: function () { S.cur.adv = false; S.sel = null; S.view = null; DB.put(S.cur); renderPane(); preview(); } }));
      if (S.tab === 'blocks') (S.sel == null ? blocksPane : editorPane)(p);
      else if (S.tab === 'style') stylePane(p); else pagePane(p);
    }
    p.scrollTop = top; $('#pname').value = defn().title || '';
  }
  function bind() {
    document.querySelectorAll('.tabs [data-tab]').forEach(function (b) { b.onclick = function () { S.tab = b.dataset.tab; renderTabs(); renderPane(); }; });
    document.querySelectorAll('[data-dev]').forEach(function (b) { b.onclick = function () {
      S.dev = b.dataset.dev; $('#frame').classList.toggle('phone', S.dev === 'phone');
      document.querySelectorAll('[data-dev]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }; });
    document.querySelectorAll('.mnav [data-m]').forEach(function (b) { b.onclick = function () {
      $('#app').dataset.m = b.dataset.m; document.querySelectorAll('.mnav [data-m]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }; });
    $('#pname').addEventListener('input', function (e) { defn().title = e.target.value; changed(); });
    $('#b-pages').onclick = pagesDialog; $('#b-export').onclick = exportDialog; $('#b-new').onclick = EZ.start;
    $('#frame').addEventListener('load', onFrameLoad);
  }
  function start() {
    var get = function (f) { return fetch('data/' + f).then(function (r) { if (!r.ok) throw new Error(f + ' ' + r.status); return r.json(); }); };
    Promise.all([get('core.json'), get('icons.json'), get('stickers.json'), DB.open()]).then(function (r) {
      D.core = r[0]; D.icons = r[1]; D.stickers = r[2];
      E = window.PSEngine.create(D.core, D.icons, D.stickers);
      F.init({ D: D, E: E, S: S, changed: changed, previewSoon: previewSoon });
      W.init({ D: D, E: E, S: S, DB: DB, $: $, defn: defn, changed: changed, preview: preview, renderPane: renderPane, newPage: newPage, openPage: openPage,
        exportDialog: exportDialog, fontCssFor: fontCssFor, save: function () { if (S.cur) { S.cur.updated = Date.now(); DB.put(S.cur); } } });
      EZ.init({ D: D, E: E, S: S, DB: DB, $: $, defn: defn, changed: changed, preview: preview, renderPane: renderPane, newPage: newPage, openPage: openPage,
        exportDoc: exportDoc, readImage: F.readImage, save: function () { if (S.cur) { S.cur.updated = Date.now(); DB.put(S.cur); } } });
      SM.init({ D: D, E: E, S: S, $: $, defn: defn, changed: changed, preview: preview, renderPane: renderPane, exportDialog: exportDialog,
        save: function () { if (S.cur) { S.cur.updated = Date.now(); DB.put(S.cur); } } });
      document.head.append(el('style', { text: fontCssFor(['pretendard'], function (p) { return "'data/fonts/" + p.file + "'"; }) }));
      window.PS_APP = { E: E, D: D, S: S, W: W, EZ: EZ, SM: SM, exportDoc: exportDoc, openPage: openPage, newPage: newPage };  // 시험 · 살펴보기용
      bind();
      return DB.all();
    }).then(function (list) {
      S.list = list;
      var last = null; try { last = localStorage.getItem('ps-last'); } catch (e) { /* 저장소 막힘 */ }
      var pg = S.list.filter(function (x) { return x.id === last; })[0] || S.list[0];
      if (!pg) return EZ.start();  // 처음 여는 기기는 쉽게 만들기부터
      openPage(pg);
    }).catch(function (e) { $('#pane').innerHTML = ''; $('#pane').append(el('p', { class: 'hint', text: '앱 자료를 읽지 못했습니다 — ' + e.message })); });
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      var hadSW = !!navigator.serviceWorker.controller;  // 새 판 일꾼이 자리를 잡으면 한 번 다시 열어 새 화면으로(처음 설치 때는 그대로)
      navigator.serviceWorker.addEventListener('controllerchange', function () { if (hadSW) { hadSW = false; saveSoon(); setTimeout(function () { location.reload(); }, 500); } });
      navigator.serviceWorker.register('sw.js').catch(function () { /* 오프라인 저장 없이도 돎 */ });
    }
  }
  start();
})();
