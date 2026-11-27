// 페이지 공방 내용 칸 입력 — 부품의 칸 정의(parts.json slots)를 보고 입력 폼을 만든다. 자유 배치 판(끌어 옮기기)도 여기
(function (root) {
  'use strict';
  var U = root.PSUI, el = U.el;
  var CHOICE_KO = { split: '옆으로 나란히', center: '가운데', primary: '주색', neutral: '무채색', success: '초록(좋음)', warning: '노랑(주의)',
    error: '빨강(위험)', info: '파랑(안내)', outline: '테두리만', done: '끝', now: '지금', todo: '할 일', spin: '도는 원', dots: '점',
    bar: '흐르는 막대', pulse: '숨쉬는 점', grid: '격자', lines: '빗금', waves: '물결', glow: '빛 번짐', mesh: '그러데이션',
    title: '제목', text: '글', sticker: '스티커', icon: '아이콘', badge: '배지', '16/9': '와이드 16:9', '4/3': '4:3', '1/1': '정사각', '3/4': '세로 3:4' };
  var X = null;  // { D, E, S, changed, previewSoon } — app.js 가 init 으로 넣음

  function iconPicker(onPick) {
    var names = Object.keys(X.D.icons), grid = el('div', { class: 'igrid' });
    var q = el('input', { class: 'inp', placeholder: '영어 이름으로 찾기 (예: heart, map, coffee)', 'aria-label': '아이콘 찾기' });
    function draw() {
      grid.innerHTML = ''; var s = q.value.trim().toLowerCase();
      names.filter(function (n) { return !s || n.indexOf(s) >= 0; }).slice(0, 160).forEach(function (n) {
        grid.append(el('button', { type: 'button', title: n, html: X.E.icon(n) + '<span>' + n + '</span>', onclick: function () { U.closeDialog(); onPick(n); } }));
      });
    }
    q.addEventListener('input', U.debounce(draw, 120)); draw();
    U.dialog('아이콘 고르기 · ' + names.length + '개', el('div', {}, [q, el('p', { class: 'hint', text: '앞 160개만 보입니다. 낱말로 좁혀 보세요.' }), grid]));
    setTimeout(function () { q.focus(); }, 50);
  }
  function stickerPicker(onPick) {
    var grid = el('div', { class: 'igrid' });
    grid.append(el('button', { type: 'button', text: '없음', onclick: function () { U.closeDialog(); onPick(''); } }));
    Object.keys(X.D.stickers).forEach(function (n) {
      grid.append(el('button', { type: 'button', title: n, html: '<img alt="" src="' + X.D.stickers[n] + '"><span>' + n.replace(/_/g, ' ') + '</span>', onclick: function () { U.closeDialog(); onPick(n); } }));
    });
    U.dialog('스티커 고르기', grid);
  }
  // 올린 사진은 긴 변 1600px JPEG 로 줄여 기기에 저장
  function readImage(file, cb) {
    var r = new FileReader();
    r.onload = function () {
      var img = new Image();
      img.onload = function () {
        var k = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = function () { U.toast('그림을 읽지 못했습니다'); };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  }
  function blankFor(slots) {
    var o = {};
    Object.keys(slots).forEach(function (k) {
      var t = slots[k][0];
      o[k] = t === 'list' || t === 'free' ? [] : t === 'num' ? 50 : t === 'bool' ? false : t === 'choice' ? slots[k][2][0] : t === 'group' ? null : '';
    });
    return o;
  }
  function itemSummary(it) {
    if (typeof it === 'string') return it;
    var keys = ['title', 'name', 'label', 'q', 'text', 'quote', 'value', 'date'];
    for (var i = 0; i < keys.length; i++) if (it && it[keys[i]]) return String(it[keys[i]]);
    return '항목';
  }

  function field(slots, k, obj, rer) {
    var spec = slots[k], t = spec[0], lab = spec[1] || k, id = U.uid('f');
    var set = function (v) { obj[k] = v; X.changed(); };
    var redo = function () { if (rer) rer(); };
    var wrap = function (ctrl) { return el('div', { class: 'fld' }, [el('label', { for: id, text: lab }), ctrl]); };
    if (t === 'text' || t === 'url') return wrap(el('input', { class: 'inp', id: id, type: t === 'url' ? 'url' : 'text', value: obj[k] || '', oninput: function (e) { set(e.target.value); } }));
    if (t === 'long') return wrap(el('textarea', { class: 'inp', id: id, oninput: function (e) { set(e.target.value); } }, [obj[k] || '']));
    if (t === 'num') {
      var v0 = obj[k] == null ? 50 : obj[k];
      var num = el('input', { class: 'inp', type: 'number', min: 0, max: 100, value: v0, style: 'max-width:5rem', 'aria-label': lab });
      var rng = el('input', { id: id, type: 'range', min: 0, max: 100, value: v0, style: 'flex:1' });
      rng.oninput = function () { num.value = rng.value; set(+rng.value); };
      num.oninput = function () { rng.value = num.value; set(+num.value || 0); };
      return wrap(el('div', { class: 'row' }, [rng, num]));
    }
    if (t === 'choice') return wrap(el('select', { class: 'inp', id: id, onchange: function (e) { set(e.target.value); redo(); } },
      spec[2].map(function (v) { return el('option', { value: v, selected: obj[k] === v, text: CHOICE_KO[v] || v }); })));
    if (t === 'bool') return el('label', { class: 'fld row' }, [el('input', { type: 'checkbox', checked: obj[k], onchange: function (e) { set(e.target.checked); } }), lab]);
    if (t === 'icon') {
      var has = obj[k] && X.D.icons[obj[k]];
      return wrap(el('div', { class: 'row' }, [
        el('button', { class: 'btn pick', id: id, type: 'button', html: (has ? X.E.icon(obj[k]) : '') + '<span>' + (obj[k] || '고르기') + '</span>',
          onclick: function () { iconPicker(function (n) { set(n); redo(); }); } }),
        obj[k] ? el('button', { class: 'btn sm ghost', type: 'button', text: '빼기', onclick: function () { set(''); redo(); } }) : null]));
    }
    if (t === 'sticker') return wrap(el('button', { class: 'btn pick', id: id, type: 'button',
      html: (obj[k] ? '<img alt="" src="' + X.D.stickers[obj[k]] + '">' : '') + '<span>' + (obj[k] ? obj[k].replace(/_/g, ' ') : '고르기') + '</span>',
      onclick: function () { stickerPicker(function (n) { set(n); redo(); }); } }));
    if (t === 'image') {
      var v = obj[k] || '', isPh = !v || v.indexOf('ph:') === 0;
      var file = el('input', { type: 'file', accept: 'image/*', hidden: true, onchange: function (e) { var f = e.target.files[0]; if (f) readImage(f, function (u) { set(u); redo(); }); } });
      var sel = el('select', { class: 'inp', id: id, onchange: function (e) { if (e.target.value === 'up') file.click(); else { set(e.target.value); redo(); } } },
        [0, 1, 2, 3, 4, 5].map(function (n) { return el('option', { value: 'ph:' + n, selected: v === 'ph:' + n, text: '그림 자리 ' + (n + 1) + '(테마 색)' }); })
          .concat([el('option', { value: 'up', selected: !isPh, text: isPh ? '내 사진 올리기…' : '올린 사진(바꾸려면 고르기)' })]));
      return wrap(el('div', {}, [sel, file, !isPh ? el('img', { src: v, alt: '', style: 'max-width:100%;max-height:8rem;border-radius:.5rem;margin-top:.4rem' }) : null]));
    }
    if (t === 'group') {
      var on = obj[k] != null, box = el('fieldset', { class: 'grp' }, [el('legend', { text: lab })]);
      box.append(el('label', { class: 'fld row' }, [el('input', { type: 'checkbox', checked: on, onchange: function (e) {
        obj[k] = e.target.checked ? blankFor(spec[2]) : null; X.changed(); redo(); } }), '보이기']));
      if (on) Object.keys(spec[2]).forEach(function (q) { box.append(field(spec[2], q, obj[k], rer)); });
      return box;
    }
    if (t === 'list') return listField(spec, k, obj, lab, rer);
    if (t === 'free') return freeField(spec, k, obj, rer);
    return wrap(el('input', { class: 'inp', id: id, value: obj[k] || '', oninput: function (e) { set(e.target.value); } }));
  }

  function listField(spec, k, obj, lab, rer) {
    var arr = obj[k] = obj[k] || [], sub = spec[2], box = el('fieldset', { class: 'grp' }, [el('legend', { text: lab + ' · ' + arr.length + '개' })]);
    var mv = function (i, j) { return function (e) { e.preventDefault(); arr.splice(j, 0, arr.splice(i, 1)[0]); X.changed(); rer(); }; };
    arr.forEach(function (it, i) {
      var acts = el('span', { class: 'row', style: 'flex:none' }, [
        el('button', { class: 'btn sm ghost ico', type: 'button', 'aria-label': '위로', text: '↑', disabled: i === 0, onclick: mv(i, i - 1) }),
        el('button', { class: 'btn sm ghost ico', type: 'button', 'aria-label': '아래로', text: '↓', disabled: i === arr.length - 1, onclick: mv(i, i + 1) }),
        el('button', { class: 'btn sm ghost ico danger', type: 'button', 'aria-label': '지우기', text: '✕', onclick: function (e) { e.preventDefault(); arr.splice(i, 1); X.changed(); rer(); } })]);
      if (typeof sub === 'string') {
        box.append(el('div', { class: 'row', style: 'margin-bottom:.4rem' }, [el('input', { class: 'inp', value: it, 'aria-label': lab + ' ' + (i + 1),
          oninput: function (e) { arr[i] = e.target.value; X.changed(); } }), acts]));
        return;
      }
      var body = el('div');
      Object.keys(sub).forEach(function (q) { body.append(field(sub, q, it, rer)); });
      box.append(el('details', { class: 'li', open: arr.length <= 2 }, [el('summary', {}, [el('span', { text: (i + 1) + '. ' + itemSummary(it) }), acts]), body]));
    });
    box.append(el('button', { class: 'btn sm add', type: 'button', text: '+ ' + lab + ' 더하기', onclick: function () {
      arr.push(arr.length ? U.clone(arr[arr.length - 1]) : (typeof sub === 'string' ? '' : blankFor(sub))); X.changed(); rer(); } }));
    return box;
  }

  // 자유 배치 판 — 놓인 것을 끌어 옮긴다(위치 · 너비는 판 크기의 %)
  function freeField(spec, k, obj, rer) {
    var items = obj[k] = obj[k] || [], sub = spec[2], S = X.S, wrap = el('div');
    var box = el('div', { class: 'fbox', style: 'aspect-ratio:' + (obj.ratio || '16/9') });
    function inner(it) {
      if (it.kind === 'sticker') return it.sticker ? '<img alt="" src="' + X.D.stickers[it.sticker] + '">' : '스티커';
      if (it.kind === 'icon') return it.icon && X.D.icons[it.icon] ? X.E.icon(it.icon) : '아이콘';
      return '<span style="font-weight:' + (it.kind === 'title' ? 800 : 500) + '">' + X.E.esc(it.text || CHOICE_KO[it.kind]) + '</span>';
    }
    var selBox = el('div');
    function drawSel() {
      selBox.innerHTML = '';
      var it = items[S.fsel]; if (!it) return;
      var g = el('fieldset', { class: 'grp' }, [el('legend', { text: '고른 것 · ' + (CHOICE_KO[it.kind] || it.kind) })]);
      ['kind', it.kind === 'sticker' ? 'sticker' : it.kind === 'icon' ? 'icon' : 'text', 'w', 'x', 'y'].forEach(function (q) { g.append(field(sub, q, it, rer)); });
      g.append(el('button', { class: 'btn sm danger', type: 'button', text: '이것 지우기', onclick: function () { items.splice(S.fsel, 1); S.fsel = 0; X.changed(); rer(); } }));
      selBox.append(g);
    }
    items.forEach(function (it, i) {
      var n = el('div', { class: 'fit' + (i === S.fsel ? ' sel' : ''), html: inner(it), style: 'left:' + (it.x || 0) + '%;top:' + (it.y || 0) + '%;width:' + (it.w || 30) + '%' });
      n.addEventListener('pointerdown', function (ev) {
        ev.preventDefault(); n.setPointerCapture(ev.pointerId);
        if (S.fsel !== i) { S.fsel = i; box.querySelectorAll('.fit').forEach(function (x, j) { x.classList.toggle('sel', j === i); }); drawSel(); }
        var r = box.getBoundingClientRect(), sx = ev.clientX, sy = ev.clientY, ox = it.x || 0, oy = it.y || 0;
        function mv(e) {
          it.x = Math.round(Math.max(0, Math.min(100 - (it.w || 30) / 2, ox + (e.clientX - sx) / r.width * 100)));
          it.y = Math.round(Math.max(0, Math.min(95, oy + (e.clientY - sy) / r.height * 100)));
          n.style.left = it.x + '%'; n.style.top = it.y + '%'; X.previewSoon();
        }
        function up() { n.removeEventListener('pointermove', mv); n.removeEventListener('pointerup', up); X.changed(); drawSel(); }
        n.addEventListener('pointermove', mv); n.addEventListener('pointerup', up);
      });
      box.append(n);
    });
    drawSel();
    var adds = el('div', { class: 'chips', style: 'margin-bottom:.6rem' }, ['title', 'text', 'badge', 'sticker', 'icon'].map(function (kind) {
      return el('button', { class: 'chip', type: 'button', text: '+ ' + CHOICE_KO[kind], onclick: function () {
        var it = { kind: kind, x: 10, y: 10, w: kind === 'sticker' || kind === 'icon' ? 14 : kind === 'title' ? 60 : 40 };
        if (kind === 'sticker') it.sticker = 'sparkles'; else if (kind === 'icon') it.icon = 'star';
        else it.text = kind === 'title' ? '새 제목' : kind === 'badge' ? '새 배지' : '새 글';
        items.push(it); S.fsel = items.length - 1; X.changed(); rer(); } });
    }));
    wrap.append(el('p', { class: 'hint', text: '판 위의 것을 손가락이나 마우스로 끌어 옮깁니다. 위치는 판 크기의 % 라서 폰 · PC 에서 같은 모양입니다.' }), box, adds, selBox);
    return wrap;
  }

  root.PSFields = { init: function (ctx) { X = ctx; }, field: field, itemSummary: itemSummary, CHOICE_KO: CHOICE_KO, readImage: readImage };
})(this);
