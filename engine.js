// 페이지 공방 엔진 — 파이썬 parts.py · build.py 와 똑같이 부품을 그리고 페이지 한 장을 조립한다(앱 · node 시험 공용)
(function (root) {
  'use strict';
  var TONES = { plain: '', surface: 'ps-t-surface', primary: 'ps-t-primary', dots: 'ps-t-dots', grid: 'ps-t-grid', glow: 'ps-t-glow' };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
  }

  // ── 틀 엔진(mustache 부분집합 — parts.py 와 같은 규칙) ──
  var TOK = /\{\{\{\s*([\w.]+)\s*\}\}\}|\{\{\s*([#^/]?)\s*([\w.]+)\s*\}\}/g;
  var parsed = {};
  function parse(tpl) {
    if (parsed[tpl]) return parsed[tpl];
    var rootN = [], stack = [], cur = rootN, pos = 0, m;
    TOK.lastIndex = 0;
    while ((m = TOK.exec(tpl))) {
      if (m.index > pos) cur.push(['t', tpl.slice(pos, m.index)]);
      pos = TOK.lastIndex;
      if (m[1]) { cur.push(['raw', m[1]]); continue; }
      var op = m[2], name = m[3];
      if (op === '#' || op === '^') { var node = ['sec', name, op === '^', []]; cur.push(node); stack.push([cur, name]); cur = node[3]; }
      else if (op === '/') { if (!stack.length || stack[stack.length - 1][1] !== name) throw new Error('틀 짝이 안 맞음: ' + name); cur = stack.pop()[0]; }
      else cur.push(['var', name]);
    }
    if (stack.length) throw new Error('닫히지 않은 칸: ' + stack[stack.length - 1][1]);
    if (pos < tpl.length) cur.push(['t', tpl.slice(pos)]);
    return (parsed[tpl] = rootN);
  }
  function isObj(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
  function look(name, stack) {
    if (name === '.') return stack[stack.length - 1];
    for (var i = stack.length - 1; i >= 0; i--) if (isObj(stack[i]) && Object.prototype.hasOwnProperty.call(stack[i], name)) return stack[i][name];
    return null;
  }
  function empty(v) { return v === null || v === undefined || v === false || v === '' || (Array.isArray(v) && !v.length) || (isObj(v) && !Object.keys(v).length); }
  function run(nodes, stack, out) {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n[0] === 't') out.push(n[1]);
      else if (n[0] === 'var' || n[0] === 'raw') {
        var v = look(n[1], stack);
        if (v === null || v === undefined || v === false) continue;
        var s = v === true ? 'True' : String(v);
        out.push(n[0] === 'raw' ? s : esc(s));
      } else {
        var val = look(n[1], stack);
        if (n[2]) { if (empty(val)) run(n[3], stack, out); }
        else if (empty(val)) continue;
        else if (Array.isArray(val)) val.forEach(function (it, j) { run(n[3], stack.concat([{ _i: j, _first: j === 0 }, it]), out); });
        else run(n[3], stack.concat([val]), out);
      }
    }
  }
  function fill(tpl, data) { var out = []; run(parse(tpl), [data], out); return out.join(''); }

  function create(core, icons, stickers) {
    var parts = {}; core.catalog.parts.forEach(function (p) { parts[p.id] = p; });
    var toks = {}; core.tokens.forEach(function (t) { toks[t.id] = t; });
    var uid = 0;

    function icon(name) {
      if (!icons[name]) throw new Error('아이콘 없음: ' + name);
      return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + icons[name] + '</svg>';
    }
    function sticker(name) { if (!stickers[name]) throw new Error('스티커 없음: ' + name); return stickers[name]; }
    function placeholder(n, alt) {
      uid += 1; var g = 'g' + uid; n = parseInt(n, 10) || 0;
      var CX = [[80, 220, 330], [300, 120, 60], [200, 60, 340], [60, 300, 180], [330, 260, 90], [150, 330, 250]][n % 6];
      var CY = [[70, 230, 120], [90, 200, 260], [150, 60, 240], [220, 90, 50], [60, 220, 160], [240, 120, 40]][n % 6];
      var R = [90, 60, 40], C = ['accent', 'secondary', 'bg'], O = [0.55, 0.6, 0.5], circ = '';
      for (var i = 0; i < 3; i++) circ += '<circle cx="' + CX[i] + '" cy="' + CY[i] + '" r="' + R[i] + '" style="fill:var(--ps-' + C[i] + ');opacity:' + O[i] + '"/>';
      var lab = alt ? ' role="img" aria-label="' + esc(alt) + '"' : ' aria-hidden="true"';
      return '<svg class="ps-ph" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"' + lab + '>' +
        '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--ps-primary)"/>' +
        '<stop offset="1" style="stop-color:var(--ps-accent)"/></linearGradient></defs>' +
        '<rect width="400" height="300" fill="url(#' + g + ')"/>' + circ +
        '<path d="M0 230 Q100 ' + (190 + n * 7) + ' 200 230 T400 ' + (220 - n * 5) + ' V300 H0Z" style="fill:var(--ps-bg);opacity:.35"/></svg>';
    }

    function prep(slots, val) {
      var out = {};
      Object.keys(slots).forEach(function (k) {
        if (!val || !Object.prototype.hasOwnProperty.call(val, k)) return;
        var spec = slots[k], t = spec[0], v = val[k];
        if (t === 'icon') out[k] = v ? icon(v) : '';
        else if (t === 'sticker') out[k] = v ? sticker(v) : '';
        else if (t === 'image') {
          var alt = val.alt || '';
          if (typeof v === 'string' && v.indexOf('ph:') === 0) out[k] = placeholder(v.slice(3), alt);
          else if (v) out[k] = '<img src="' + esc(v) + '" alt="' + esc(alt) + '" loading="lazy">';
        } else if (t === 'long') out[k] = String(v).split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
        else if (t === 'num') out[k] = Math.max(0, Math.min(100, Math.trunc(Number(v) || 0)));
        else if (t === 'list') out[k] = (v || []).map(function (it) { return isObj(spec[2]) ? prep(spec[2], it) : it; });
        else if (t === 'free') out[k] = (v || []).map(function (it) {
          var p = prep(spec[2], it), kind = it.kind || 'text', tx = it.text || '', h;
          if (kind === 'title' || kind === 'text') h = '<p>' + esc(tx) + '</p>';
          else if (kind === 'sticker') h = p.sticker ? '<img src="' + p.sticker + '" alt="' + esc(tx) + '">' : '';
          else if (kind === 'icon') h = p.icon || '';
          else h = '<span class="ps-badge">' + esc(tx) + '</span>';
          if (!('w' in p)) p.w = 30; if (!('x' in p)) p.x = 0; if (!('y' in p)) p.y = 0;
          var o = {}; Object.keys(p).forEach(function (q) { o[q] = p[q]; }); o.kind = kind; o.html = h; return o;
        });
        else if (t === 'group') out[k] = v ? prep(spec[2], v) : null;
        else out[k] = v;
      });
      return out;
    }

    function render(pid, content, tone, title) {
      var p = parts[pid]; if (!p) throw new Error('없는 부품: ' + pid);
      tone = tone || 'plain';
      var data = prep(p.slots, content == null ? p.sample : content);
      uid += 1; data._tone = TONES[tone]; data._uid = uid;
      var h = fill(core.templates[pid], data);
      if (p.kind === 'small') {
        var head = title ? '<h2 class="ps-h3">' + esc(title) + '</h2>' : '';
        h = '<section class="ps-b ps-small ' + TONES[tone] + '"><div class="ps-in ps-narrow" style="display:grid;gap:1rem">' + head + h + '</div></section>';
      }
      return h;
    }

    function tokenCss(tok, sel) {
      var v = [];
      Object.keys(tok.color).forEach(function (k) { v.push('--ps-' + k + ':' + tok.color[k]); });
      Object.keys(tok.radius).forEach(function (k) { v.push('--ps-r-' + k + ':' + tok.radius[k]); });
      v.push('--ps-border:' + tok.border, '--ps-shadow-sm:' + tok.shadow.sm, '--ps-shadow-md:' + tok.shadow.md,
        '--ps-fast:' + tok.motion.fast, '--ps-base:' + tok.motion.base, '--ps-ease:' + tok.motion.ease, 'color-scheme:' + tok.scheme);
      return (sel || ':root') + '{' + v.join(';') + '}';
    }

    function fontsOf(defn) {
      var want = defn.font || {}, lk = defn.look || 'plain';
      var body = want.body || 'pretendard';
      var head = want.head || core.lookHead[lk] || body;
      return { body: body, head: head };
    }

    function textOf(html) {
      var s = html.replace(/<(svg|style)\b[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ');
      return s.replace(/&(amp|lt|gt|quot|#x27|#39);/g, function (_, e) { return { amp: '&', lt: '<', gt: '>', quot: '"', '#x27': "'", '#39': "'" }[e]; });
    }

    // 글꼴 계획 — 페이지에 쓰인 글자가 든 묶음만(라틴 · 기호 묶음 0번은 늘)
    function fontPlan(defn, text) {
      var f = fontsOf(defn), keys = [f.body]; if (f.head !== f.body) keys.push(f.head);
      var used = new Set(text), plan = [];
      keys.forEach(function (key) {
        var fm = core.fonts[key]; if (!fm) return;
        fm.faces.forEach(function (face) {
          face.chunks.forEach(function (c, i) {
            var need = i === 0 || Array.prototype.some.call(c.chars, function (ch) { return used.has(ch); });
            if (need) plan.push({ family: fm.family, weight: face.weight, file: c.file, range: c.range, bytes: c.bytes });
          });
        });
      });
      return plan;
    }
    function fontFaceCss(plan, srcOf) {
      return plan.map(function (p) {
        return "@font-face{font-family:'" + p.family + "';src:url(" + srcOf(p) + ") format('woff2');font-weight:" + p.weight + ';font-display:swap;unicode-range:' + p.range + '}';
      }).join('');
    }

    function check(defn) {
      var out = [];
      if (!defn.theme) out.push('테마를 골라야 합니다');
      else if (!toks[defn.theme]) out.push('없는 테마: ' + defn.theme);
      if (defn.dark_theme && !toks[defn.dark_theme]) out.push('없는 어두움 테마: ' + defn.dark_theme);
      if (!core.catalog.looks[defn.look || 'plain']) out.push('없는 모양: ' + defn.look);
      if ([0, 1, 2].indexOf(defn.motion == null ? 1 : defn.motion) < 0) out.push('움직임은 0 · 1 · 2 중 하나');
      if (!defn.blocks || !defn.blocks.length) out.push('블록이 하나도 없습니다');
      (defn.blocks || []).forEach(function (b, i) {
        if (!parts[b.part]) out.push((i + 1) + '번 블록: 없는 부품 ' + b.part);
        else if (b.tone && !(b.tone in TONES)) out.push((i + 1) + '번 블록: 없는 바탕 ' + b.tone);
      });
      return out;
    }

    function body(defn) {
      return defn.blocks.map(function (b) { return render(b.part, b.content, b.tone || 'plain', b.title); }).join('');
    }

    // 페이지 한 장 — fontCss 는 부르는 쪽이 만든다(내보내기 = data URI · 미리보기 = 파일 주소)
    function buildDoc(defn, fontCss, bodyHtml) {
      var errs = check(defn); if (errs.length) throw new Error('페이지 정의 문제: ' + errs.join(' · '));
      var lk = defn.look || 'plain', motion = defn.motion == null ? 1 : defn.motion, f = fontsOf(defn);
      var b = bodyHtml == null ? body(defn) : bodyHtml;
      var title = defn.title || '새 페이지';
      var tcss = tokenCss(toks[defn.theme]);
      if (defn.dark_theme) tcss += '@media (prefers-color-scheme:dark){' + tokenCss(toks[defn.dark_theme]) + '}';
      var fam = function (k) { return core.fonts[k].family; };
      var vars = ".ps[data-look]{--ps-font-body:'" + fam(f.body) + "';--ps-font-head:'" + fam(f.head) + "'}";
      if (f.head === 'black-han-sans') vars += '.ps h1,.ps h2,.ps h3{font-weight:400}';
      var desc = defn.description ? '<meta name="description" content="' + esc(defn.description) + '">' : '';
      return '<!doctype html><html lang="' + esc(defn.lang || 'ko') + '"><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' +
        '<title>' + esc(title) + '</title>' + desc + '<meta name="generator" content="페이지 공방">' +
        '<style>' + (fontCss || '') + tcss + 'html,body{margin:0;background:var(--ps-bg)}' + core.css + vars + '</style></head>' +
        '<body><div class="ps" data-look="' + lk + '" data-motion="' + motion + '">' + b + '</div></body></html>\n';
    }

    return { parts: parts, tokens: toks, TONES: TONES, render: render, prep: prep, fill: fill, esc: esc, icon: icon, sticker: sticker,
      placeholder: placeholder, tokenCss: tokenCss, fontsOf: fontsOf, textOf: textOf, fontPlan: fontPlan, fontFaceCss: fontFaceCss,
      check: check, body: body, buildDoc: buildDoc, resetUid: function () { uid = 0; } };
  }

  var E = { create: create, fill: fill, esc: esc };
  if (typeof module !== 'undefined' && module.exports) module.exports = E; else root.PSEngine = E;
})(this);
