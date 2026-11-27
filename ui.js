// 페이지 공방 앱 기반 — 요소 만들기 · 알림 · 고르기 창 · 파일 받기 · 복사 · 기기 저장(IndexedDB). 화면 기능은 이것만 쓴다
(function (root) {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function el(tag, props, kids) {
    var e = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      var v = props[k];
      if (v == null || v === false) return;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else if (k === 'value') e.value = v;
      else if (k === 'checked') e.checked = !!v;
      else e.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c))); });
    return e;
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function uid(p) { return (p || 'b') + Math.random().toString(36).slice(2, 9); }
  function toast(msg) {
    var t = el('div', { class: 'toast', role: 'status', text: msg }); document.body.append(t);
    setTimeout(function () { t.remove(); }, 2200);
  }
  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }
  function dialog(title, body, foot) {
    var d = $('#dlg'); d.innerHTML = '';
    var close = el('button', { class: 'btn sm ghost', type: 'button', text: '닫기', onclick: function () { d.close(); } });
    d.append(el('div', { class: 'dlg' }, [el('header', {}, [el('b', { text: title }), close]), el('div', { class: 'body' }, [body]), foot ? el('footer', {}, foot) : null]));
    if (!d.open) d.showModal();
    return d;
  }
  function closeDialog() { var d = $('#dlg'); if (d.open) d.close(); }
  // 두 번 눌러야 지워지는 버튼(확인 창 대신)
  function sure(btn, label, act) {
    if (btn.dataset.sure !== '1') {
      btn.dataset.sure = '1'; btn.textContent = '정말요? 한 번 더 누르기';
      setTimeout(function () { btn.dataset.sure = ''; btn.textContent = label; }, 2500); return;
    }
    act();
  }
  function download(text, name, type) {
    var a = el('a', { href: URL.createObjectURL(new Blob([text], { type: type })), download: name.replace(/[\\/:*?"<>|]/g, '_') });
    document.body.append(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function copy(text, done) {
    function fallback() {
      var t = el('textarea', { style: 'position:fixed;opacity:0' }, [text]); document.body.append(t); t.select();
      try { document.execCommand('copy'); toast(done); } catch (e) { toast('복사하지 못했습니다'); }
      t.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { toast(done); }, fallback); else fallback();
  }
  function b64(buf) {
    var s = '', bytes = new Uint8Array(buf);
    for (var i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }
  // 기기 저장 — IndexedDB(안 되면 이 화면을 연 동안만 기억)
  var DB = {
    db: null,
    open: function () {
      return new Promise(function (ok) {
        try {
          var r = indexedDB.open('page-studio', 1);
          r.onupgradeneeded = function () { r.result.createObjectStore('pages', { keyPath: 'id' }); };
          r.onsuccess = function () { DB.db = r.result; ok(); };
          r.onerror = function () { ok(); };
        } catch (e) { ok(); }
      });
    },
    store: function (mode) { return DB.db.transaction('pages', mode).objectStore('pages'); },
    all: function () {
      if (!DB.db) return Promise.resolve([]);
      return new Promise(function (ok) { var r = DB.store('readonly').getAll(); r.onsuccess = function () { ok(r.result || []); }; r.onerror = function () { ok([]); }; });
    },
    put: function (p) { if (DB.db) try { DB.store('readwrite').put(p); } catch (e) { toast('저장하지 못했습니다 — 사진이 너무 클 수 있어요'); } },
    del: function (id) { if (DB.db) DB.store('readwrite').delete(id); }
  };
  root.PSUI = { $: $, el: el, clone: clone, uid: uid, toast: toast, debounce: debounce, dialog: dialog, closeDialog: closeDialog, sure: sure,
    download: download, copy: copy, b64: b64, DB: DB };
})(this);
