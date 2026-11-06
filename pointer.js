/* ポインター確認: 画面をクリックしてコメントを打つ。ai-site-kit tools/review/pointer.js
 * data-mode="server" なら確認用サーバーへ保存、"offline" ならこのブラウザに保存して「書き出す」で渡す。 */
(function () {
  'use strict';
  var me = document.currentScript;
  var PAGE = (me && me.dataset.page) || location.pathname;
  var MODE = (me && me.dataset.mode) || 'offline';
  var BRIDGE = MODE === 'bridge' ? window.parent && window.parent.WFBridge : null;  // 公開ページの外枠が保存を受け持つ
  if (MODE === 'bridge' && !BRIDGE) MODE = 'offline';
  var KEY = 'ai-site-kit-pointer:' + PAGE;
  var WHO_KEY = 'ai-site-kit-pointer:who';
  var WHO = { hirano: '平野', client: 'お客様', other: 'その他' };
  var COLOR = { hirano: '#c46a12', client: '#2e8a57', other: '#2f6fb3' };
  var SCOPE = { page: 'このページだけ', plan: 'この案の全ページ（同じ場所）', same: '全案のこのページ', all: '全案・全ページ（同じ場所）' };
  var comments = [];
  var shared = [];  // ほかのページで一括にしたコメント（このページにも当たるもの。読むだけ）
  var deleted = [];
  var adding = false;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); return true; } catch (e) { return v === undefined ? null : false; } }
  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text != null) e.textContent = text;
    return e;
  }

  var css = '' +
    '#__ptr-bar{position:fixed;right:12px;bottom:12px;z-index:2147483000;display:flex;flex-wrap:wrap;gap:6px;align-items:center;' +
    'background:#1d2a33;color:#fff;padding:8px 10px;border-radius:10px;font:13px/1.4 "Hiragino Sans","Yu Gothic",sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.25);max-width:calc(100vw - 24px)}' +
    '#__ptr-bar button,#__ptr-bar select{font:inherit;border:0;border-radius:6px;padding:5px 9px;cursor:pointer;background:#fff;color:#1d2a33}' +
    '#__ptr-bar button.on{background:#c46a12;color:#fff}' +
    '#__ptr-layer{position:absolute;left:0;top:0;width:0;height:0;z-index:2147482990}' +
    '.__ptr-pin{position:absolute;width:26px;height:26px;margin:-26px 0 0 -2px;border-radius:50% 50% 50% 0;color:#fff;font:bold 12px/26px sans-serif;' +
    'text-align:center;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.35);border:2px solid #fff}' +
    '.__ptr-pin.done{opacity:.45}' +
    '.__ptr-pin.bulk{border-style:dashed}.__ptr-pin.shared{background:#6b4fa3!important;border:2px dashed #fff}' +
    '.__ptr-box select{font:inherit;width:100%;margin-top:6px;padding:4px;border:1px solid #c9d1d6;border-radius:6px}' +
    '.__ptr-box label{display:block;margin-top:8px;font-size:12px;color:#55636c}' +
    '.__ptr-panel .src{display:block;font-size:11px;color:#6b4fa3}' +
    '.__ptr-shot{display:block;max-width:100%;max-height:160px;margin:6px 0;border:1px solid #c9d1d6;border-radius:4px;cursor:zoom-in}' +
    '.__ptr-panel .__ptr-shot{max-height:70px}' +
    '.__ptr-attach{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:8px;font-size:12px;color:#55636c}' +
    '.__ptr-box{position:absolute;z-index:2147483001;background:#fff;color:#1d2a33;border:1px solid #c9d1d6;border-radius:8px;padding:10px;width:260px;' +
    'font:13px/1.5 "Hiragino Sans","Yu Gothic",sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.2)}' +
    '.__ptr-box textarea{width:100%;box-sizing:border-box;min-height:80px;font:inherit;border:1px solid #c9d1d6;border-radius:6px;padding:6px}' +
    '.__ptr-box .row{display:flex;gap:6px;justify-content:flex-end;margin-top:8px;flex-wrap:wrap}' +
    '.__ptr-box button{font:inherit;border:1px solid #c9d1d6;background:#f5f7f8;border-radius:6px;padding:4px 10px;cursor:pointer}' +
    '.__ptr-box button.main{background:#1d2a33;color:#fff;border-color:#1d2a33}' +
    '.__ptr-panel{position:fixed;right:12px;bottom:64px;z-index:2147483001;background:#fff;color:#1d2a33;width:min(360px,calc(100vw - 24px));max-height:60vh;overflow:auto;' +
    'border:1px solid #c9d1d6;border-radius:10px;padding:12px;font:13px/1.5 "Hiragino Sans","Yu Gothic",sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.2)}' +
    '.__ptr-panel ol{margin:0;padding-left:1.4em}.__ptr-panel li{margin:6px 0;cursor:pointer}' +
    '.__ptr-panel textarea{width:100%;box-sizing:border-box;min-height:160px;font:12px monospace}' +
    'body.__ptr-adding,body.__ptr-adding *{cursor:crosshair!important}';
  document.head.appendChild(el('style', null, css));

  var layer = el('div', { id: '__ptr-layer', 'aria-hidden': 'true' });
  var bar = el('div', { id: '__ptr-bar', role: 'toolbar', 'aria-label': 'ポインター確認' });
  var whoSel = el('select', { 'aria-label': '確認する人' });
  Object.keys(WHO).forEach(function (k) { var o = el('option', { value: k }, WHO[k]); whoSel.appendChild(o); });
  whoSel.value = store(WHO_KEY) || (MODE === 'server' ? 'hirano' : 'client');
  whoSel.addEventListener('change', function () { store(WHO_KEY, whoSel.value); });
  var addBtn = el('button', { type: 'button' }, 'コメントする');
  var listBtn = el('button', { type: 'button' }, '一覧');
  var outBtn = el('button', { type: 'button' }, '書き出す');
  var count = el('span', null, '');
  [whoSel, addBtn, listBtn, outBtn, count].forEach(function (x) { bar.appendChild(x); });

  function ours(t) { return t && t.closest && (t.closest('#__ptr-bar') || t.closest('.__ptr-box') || t.closest('.__ptr-panel') || t.closest('.__ptr-pin')); }
  function closeBoxes() { document.querySelectorAll('.__ptr-box,.__ptr-panel').forEach(function (b) { b.remove(); }); }

  function selectorOf(node) {
    if (!(node instanceof Element)) return 'body';
    var parts = [];
    while (node && node !== document.body && node.nodeType === 1 && parts.length < 12) {
      if (node.id && /^[A-Za-z][\w-]*$/.test(node.id)) { parts.unshift('#' + node.id); break; }
      var tag = node.tagName.toLowerCase();
      var i = 1, sib = node;
      while ((sib = sib.previousElementSibling)) { if (sib.tagName === node.tagName) i++; }
      parts.unshift(tag + ':nth-of-type(' + i + ')');
      node = node.parentElement;
    }
    if (!parts.length || parts[0].charAt(0) !== '#') parts.unshift('body');
    return parts.join(' > ');
  }

  function save() {
    if (BRIDGE) {
      var gone = deleted.slice(); deleted = [];
      BRIDGE.save(PAGE, comments, gone).then(function (d) { comments = d.comments; shared = d.shared; render(); })
        .catch(function () { count.textContent = '保存できませんでした。もう一度お試しください'; });
      render();
      return;
    }
    if (store(KEY, JSON.stringify(comments)) === false && MODE !== 'server') {
      count.textContent = '保存できる量を超えました。「書き出す」で一度保存してください';
    }
    if (MODE === 'server') {
      var sent = deleted.slice();
      fetch('/api/comments?page=' + encodeURIComponent(PAGE), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comments: comments, deleted: sent })
      }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (d) {
        // サーバーで、ほかの人や取り込みのコメントと合わせた一覧に置き換える
        deleted = deleted.filter(function (x) { return sent.indexOf(x) < 0; });
        if (d && d.comments) { comments = d.comments; store(KEY, JSON.stringify(comments)); render(); }
      }).catch(function () {
        count.textContent = '保存できませんでした（このブラウザには残っています）';
      });
    }
    render();
  }

  function load() {
    if (BRIDGE) {
      BRIDGE.load(PAGE).then(function (d) { comments = d.comments; shared = d.shared; render(); });
      BRIDGE.onChange(PAGE, function (d) { if (!document.querySelector('.__ptr-box')) { comments = d.comments; shared = d.shared; render(); } });
      return;
    }
    var local = [];
    try { local = JSON.parse(store(KEY) || '[]') || []; } catch (e) { local = []; }
    if (MODE !== 'server') { comments = local; render(); return; }
    fetch('/api/comments?page=' + encodeURIComponent(PAGE)).then(function (r) { return r.json(); })
      .then(function (d) { comments = (d && d.comments) || local; shared = (d && d.shared) || []; render(); })
      .catch(function () { comments = local; render(); });
  }

  function position(c) {
    var t = null;
    try { t = document.querySelector(c.selector); } catch (e) { t = null; }
    if (t) {
      var r = t.getBoundingClientRect();
      return { x: r.left + scrollX + c.rx * r.width, y: r.top + scrollY + c.ry * r.height };
    }
    return { x: c.px, y: c.py };
  }

  function render() {
    layer.textContent = '';
    comments.forEach(function (c) {
      var p = position(c);
      var bulk = c.scope && c.scope !== 'page';
      var pin = el('div', { class: '__ptr-pin' + (c.status === 'done' ? ' done' : '') + (bulk ? ' bulk' : ''), title: WHO[c.who] + (bulk ? '（一括：' + SCOPE[c.scope] + '）' : '') + ': ' + c.text }, String(c.n));
      pin.style.left = p.x + 'px'; pin.style.top = p.y + 'px'; pin.style.background = COLOR[c.who] || COLOR.other;
      pin.addEventListener('click', function (e) { e.stopPropagation(); showComment(c, p); });
      layer.appendChild(pin);
    });
    shared.forEach(function (c) {
      var t = null;
      try { t = document.querySelector(c.selector); } catch (e) { t = null; }
      if (!t) return;  // 同じ場所がこのページにない
      var p = position(c);
      var pin = el('div', { class: '__ptr-pin shared' + (c.status === 'done' ? ' done' : ''), title: '一括（' + c.source + '）: ' + c.text }, '括');
      pin.style.left = p.x + 'px'; pin.style.top = p.y + 'px';
      pin.addEventListener('click', function (e) { e.stopPropagation(); showShared(c, p); });
      layer.appendChild(pin);
    });
    var open = comments.filter(function (c) { return c.status !== 'done'; }).length;
    count.textContent = 'コメント ' + comments.length + '件（未対応 ' + open + '）' + (shared.length ? '・一括 ' + shared.length + '件' : '');
  }

  function boxAt(x, y) {
    closeBoxes();
    var b = el('div', { class: '__ptr-box' });
    b.style.left = Math.max(8, Math.min(x, scrollX + innerWidth - 280)) + 'px';
    b.style.top = (y + 8) + 'px';
    document.body.appendChild(b);
    return b;
  }

  function showComment(c, p) {
    var b = boxAt(p.x, p.y);
    b.appendChild(el('strong', null, '#' + c.n + ' ' + (WHO[c.who] || '') + (c.status === 'done' ? '（対応済み）' : '')));
    b.appendChild(el('p', { style: 'margin:6px 0;white-space:pre-wrap' }, c.text));
    if (c.img) b.appendChild(shotEl(c.img));
    if (c.scope && c.scope !== 'page') b.appendChild(el('p', { style: 'margin:0;font-size:12px;color:#6b4fa3' }, '反映する範囲：' + SCOPE[c.scope]));
    var row = el('div', { class: 'row' });
    var done = el('button', { type: 'button' }, c.status === 'done' ? '未対応に戻す' : '対応済みにする');
    var del = el('button', { type: 'button' }, '削除');
    var close = el('button', { type: 'button', class: 'main' }, '閉じる');
    done.onclick = function () { c.status = c.status === 'done' ? 'open' : 'done'; closeBoxes(); save(); };
    del.onclick = function () {
      if (del.dataset.sure) { comments = comments.filter(function (x) { return x !== c; }); deleted.push(c.id); closeBoxes(); save(); }
      else { del.dataset.sure = '1'; del.textContent = 'もう一度押すと削除'; }
    };
    close.onclick = closeBoxes;
    [done, del, close].forEach(function (x) { row.appendChild(x); });
    b.appendChild(row);
  }

  function shrink(file, done) {
    var img = new Image();
    var url = URL.createObjectURL(file);
    img.onload = function () {
      var max = 1280, w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, max / Math.max(w, h));
      var cv = document.createElement('canvas');
      cv.width = Math.round(w * k); cv.height = Math.round(h * k);
      var cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height);
      cx.drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      var q = 0.75, out = cv.toDataURL('image/jpeg', q);
      var cap = BRIDGE ? 200000 : 850000;  // 公開ページの保存は1件256KBまで
      if (out.length > cap && BRIDGE) { k = Math.min(k, 960 / Math.max(w, h)); cv.width = Math.round(w * k); cv.height = Math.round(h * k); cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(img, 0, 0, cv.width, cv.height); out = cv.toDataURL('image/jpeg', q); }
      while (out.length > cap && q > 0.3) { q -= 0.1; out = cv.toDataURL('image/jpeg', q); }
      done(out.length <= cap ? out : null);
    };
    img.onerror = function () { URL.revokeObjectURL(url); done(null); };
    img.src = url;
  }

  function shotEl(src) {
    var im = el('img', { class: '__ptr-shot', src: src, alt: '添付のスクショ' });
    im.addEventListener('click', function (e) { e.stopPropagation(); var w = window.open(); if (w) { var big = w.document.createElement('img'); big.src = src; big.style.maxWidth = '100%'; w.document.title = 'スクショ'; w.document.body.appendChild(big); } });
    return im;
  }

  function showShared(c, p) {
    var b = boxAt(p.x, p.y);
    b.appendChild(el('strong', null, '一括コメント ' + (WHO[c.who] || '') + (c.status === 'done' ? '（対応済み）' : '')));
    b.appendChild(el('p', { style: 'margin:6px 0;white-space:pre-wrap' }, c.text));
    if (c.img) b.appendChild(shotEl(c.img));
    b.appendChild(el('p', { style: 'margin:0;font-size:12px;color:#6b4fa3' }, '反映する範囲：' + SCOPE[c.scope] + '／打ったページ：' + c.source));
    var row = el('div', { class: 'row' });
    var go = el('a', { href: '/review/' + c.source + '.html' }, '打ったページを開く');
    var close = el('button', { type: 'button', class: 'main' }, '閉じる');
    close.onclick = closeBoxes;
    row.appendChild(go); row.appendChild(close); b.appendChild(row);
  }

  function newComment(e) {
    var target = e.target;
    var r = target.getBoundingClientRect();
    var c = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      n: comments.reduce(function (m, x) { return Math.max(m, x.n || 0); }, 0) + 1,
      who: whoSel.value, text: '', selector: selectorOf(target),
      rx: r.width ? Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) : 0,
      ry: r.height ? Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) : 0,
      px: e.pageX, py: e.pageY, vw: innerWidth, created: new Date().toISOString(), status: 'open', scope: 'page'
    };
    var b = boxAt(e.pageX, e.pageY);
    b.appendChild(el('strong', null, '#' + c.n + ' ' + WHO[c.who] + 'のコメント'));
    var ta = el('textarea', { 'aria-label': 'コメント', maxlength: '4000', placeholder: '直してほしいことを書いてください（スクショは下のボタンか、貼り付け〔⌘V／Ctrl+V〕で添付できます）' });
    b.appendChild(ta);
    var att = el('div', { class: '__ptr-attach' });
    var fileIn = el('input', { type: 'file', accept: 'image/*', style: 'display:none' });
    var pick = el('button', { type: 'button' }, 'スクショを添付');
    var note = el('span', null, '');
    var prev = el('div');
    function setShot(file) {
      if (!file || !/^image\//.test(file.type)) return;
      note.textContent = '縮小しています…';
      shrink(file, function (data) {
        if (!data) { note.textContent = '画像を読み込めませんでした'; return; }
        c.img = data; note.textContent = '添付しました';
        prev.textContent = ''; prev.appendChild(shotEl(data));
        var rm = el('button', { type: 'button' }, '添付を外す');
        rm.onclick = function () { delete c.img; prev.textContent = ''; note.textContent = ''; };
        prev.appendChild(rm);
      });
    }
    pick.onclick = function () { fileIn.click(); };
    fileIn.onchange = function () { setShot(fileIn.files && fileIn.files[0]); };
    b.addEventListener('paste', function (ev) {
      var items = (ev.clipboardData && ev.clipboardData.items) || [];
      for (var i = 0; i < items.length; i++) { if (items[i].type.indexOf('image') === 0) { ev.preventDefault(); setShot(items[i].getAsFile()); return; } }
    });
    att.appendChild(pick); att.appendChild(fileIn); att.appendChild(note);
    b.appendChild(att); b.appendChild(prev);
    var lab = el('label', null, '反映する範囲');
    var sc = el('select', { 'aria-label': '反映する範囲' });
    Object.keys(SCOPE).forEach(function (k) { sc.appendChild(el('option', { value: k }, SCOPE[k])); });
    lab.appendChild(sc); b.appendChild(lab);
    var row = el('div', { class: 'row' });
    var cancel = el('button', { type: 'button' }, 'やめる');
    var ok = el('button', { type: 'button', class: 'main' }, '保存');
    cancel.onclick = closeBoxes;
    ok.onclick = function () {
      var t = ta.value.trim();
      if (!t) { ta.focus(); return; }
      c.text = t; c.scope = sc.value; comments.push(c); closeBoxes(); save();
    };
    row.appendChild(cancel); row.appendChild(ok); b.appendChild(row);
    ta.focus();
  }

  function setAdding(on) {
    adding = on;
    addBtn.classList.toggle('on', on);
    addBtn.textContent = on ? 'コメントする場所をクリック（終了）' : 'コメントする';
    document.body.classList.toggle('__ptr-adding', on);
  }

  document.addEventListener('click', function (e) {
    if (ours(e.target)) return;
    if (!adding) { closeBoxes(); return; }
    e.preventDefault(); e.stopPropagation();
    newComment(e);
  }, true);

  function asText() {
    var lines = ['ページ: ' + PAGE, ''];
    comments.forEach(function (c) {
      lines.push('#' + c.n + ' [' + (WHO[c.who] || c.who) + ']' + (c.status === 'done' ? '（対応済み）' : '') + (c.scope && c.scope !== 'page' ? '【一括：' + SCOPE[c.scope] + '】' : '') + ' 場所: ' + c.selector);
      lines.push('  ' + c.text.replace(/\n/g, '\n  ') + (c.img ? '\n  （スクショあり：ファイルに保存すると一緒に入ります）' : ''));
    });
    return lines.join('\n');
  }

  function showList() {
    closeBoxes();
    var p = el('div', { class: '__ptr-panel', role: 'dialog', 'aria-label': 'コメント一覧' });
    p.appendChild(el('strong', null, 'コメント一覧'));
    var ol = el('ol');
    comments.forEach(function (c) {
      var li = el('li', null, '[' + (WHO[c.who] || '') + '] ' + c.text + (c.status === 'done' ? '（対応済み）' : ''));
      if (c.img) li.appendChild(shotEl(c.img));
      li.value = c.n;
      li.onclick = function () { var q = position(c); scrollTo({ top: Math.max(0, q.y - 120), behavior: 'smooth' }); };
      ol.appendChild(li);
    });
    if (shared.length) {
      p.appendChild(el('strong', { style: 'display:block;margin-top:10px' }, 'ほかのページからの一括コメント'));
      var ul = el('ul', { style: 'margin:0;padding-left:1.2em' });
      shared.forEach(function (c) {
        var li = el('li', null, '[' + (WHO[c.who] || '') + '] ' + c.text + (c.status === 'done' ? '（対応済み）' : ''));
        li.appendChild(el('span', { class: 'src' }, SCOPE[c.scope] + '／' + c.source));
        ul.appendChild(li);
      });
      p.appendChild(ul);
    }
    if (!comments.length && !shared.length) p.appendChild(el('p', null, 'まだコメントはありません。「コメントする」を押して、気になる場所をクリックしてください。'));
    p.appendChild(ol);
    var close = el('button', { type: 'button' }, '閉じる');
    close.onclick = closeBoxes;
    p.appendChild(close);
    document.body.appendChild(p);
  }

  function showExport() {
    closeBoxes();
    var p = el('div', { class: '__ptr-panel', role: 'dialog', 'aria-label': 'コメントを書き出す' });
    p.appendChild(el('strong', null, 'コメントを書き出す'));
    if (BRIDGE && BRIDGE.shared()) {
      p.appendChild(el('p', null, 'このページのコメントは自動で共有され、平野にも届いています。ファイルを送る必要はありません。'));
    } else p.appendChild(el('p', null, MODE === 'server' ? '「このページだけ保存」または「文章をコピー」で書き出せます。' :
      'すべてのページを見終わったら「全ページのコメントをまとめて保存」を押し、保存されたファイル（comments-all-日付.json）を平野へお送りください。スクショも一緒に入ります。'));
    var ta = el('textarea', { readonly: 'readonly', 'aria-label': '書き出した内容' });
    ta.value = asText();
    p.appendChild(ta);
    var row = el('div', { class: 'row', style: 'display:flex;gap:6px;flex-wrap:wrap;margin-top:8px' });
    var all = el('button', { type: 'button', style: 'font-weight:bold' }, '全ページのコメントをまとめて保存');
    all.onclick = function () {
      if (BRIDGE) { BRIDGE.exportAll().then(function (m) { all.textContent = m; }); return; }
      var pages = [];
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k.indexOf('ai-site-kit-pointer:') !== 0 || k === WHO_KEY) continue;
          var list = JSON.parse(localStorage.getItem(k) || '[]');
          if (list && list.length) pages.push({ page: k.slice('ai-site-kit-pointer:'.length), comments: list });
        }
      } catch (e) { pages = [{ page: PAGE, comments: comments }]; }
      var n = pages.reduce(function (m, x) { return m + x.comments.length; }, 0);
      var data = JSON.stringify({ exported: new Date().toISOString(), pages: pages }, null, 2);
      var stamp = new Date().toISOString().slice(0, 10);
      var a = el('a', { href: URL.createObjectURL(new Blob([data], { type: 'application/json' })), download: 'comments-all-' + stamp + '.json' });
      document.body.appendChild(a); a.click(); a.remove();
      all.textContent = pages.length + 'ページ・' + n + '件を保存しました';
    };
    var file = el('button', { type: 'button' }, 'このページだけ保存');
    var copy = el('button', { type: 'button' }, '文章をコピー');
    var close = el('button', { type: 'button' }, '閉じる');
    file.onclick = function () {
      var data = JSON.stringify({ page: PAGE, exported: new Date().toISOString(), comments: comments }, null, 2);
      var a = el('a', { href: URL.createObjectURL(new Blob([data], { type: 'application/json' })), download: 'comments-' + PAGE.replace(/[^\w-]+/g, '_') + '.json' });
      document.body.appendChild(a); a.click(); a.remove();
    };
    copy.onclick = function () {
      var done = function () { copy.textContent = 'コピーしました'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(done, function () { ta.select(); });
      else { ta.select(); }
    };
    close.onclick = closeBoxes;
    (MODE === 'server' ? [file, copy, close] : [all, file, copy, close]).forEach(function (x) { row.appendChild(x); });
    p.appendChild(row);
    document.body.appendChild(p);
  }

  addBtn.addEventListener('click', function () { setAdding(!adding); });
  listBtn.addEventListener('click', showList);
  outBtn.addEventListener('click', showExport);
  window.addEventListener('resize', render);
  window.addEventListener('load', render);

  function start() { document.body.appendChild(layer); document.body.appendChild(bar); load(); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
