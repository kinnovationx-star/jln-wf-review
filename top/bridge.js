/* TOP5案のコメントの受け渡し。WFと同じ Google スプレッドシート（../../config.js の WF_ENDPOINT）へ保存する。
 * pointer.js は window.parent.WFBridge を見る。枠なしのページでは parent は自分なので、ここで定義する。
 * 通信が失敗しても、未送信のコメントはこのブラウザに残し、20秒ごとに送り直す。 */
(function () {
  'use strict';
  var EP = (window.WF_ENDPOINT || '').trim();
  var CKEY = 'jln-wf-cache', PKEY = 'jln-wf-pending', LKEY = 'jln-top-comments';
  function jget(k) { try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch (e) { return {}; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  var pending = jget(PKEY), all = {}, listeners = [], online = false, busy = false;
  var recent = {};  // 送ったばかりの変更。遅れて届いた古い読み込みで戻さない（60秒）
  function parts(p) { var x = String(p).split('/'); return { stage: x[0], plan: x.length >= 3 ? x[1] : '', name: x[x.length - 1] }; }
  function applies(scope, src, page) {
    if (src === page || !scope || scope === 'page') return false;
    var a = parts(src), b = parts(page);
    if (a.stage !== b.stage) return false;
    if (scope === 'all') return true;
    if (scope === 'plan') return a.plan === b.plan;
    return a.name === b.name;
  }
  function strip(c) { var o = {}; Object.keys(c).forEach(function (k) { if (k !== 'page') o[k] = c[k]; }); return o; }
  function forPage(page) {
    var mine = [], shared = [];
    Object.keys(all).forEach(function (id) {
      var c = all[id];
      if (c.page === page) mine.push(strip(c));
      else if (applies(c.scope, c.page, page)) { var s = strip(c); s.source = c.page; shared.push(s); }
    });
    mine.sort(function (a, b) { return (a.n || 0) - (b.n || 0); });
    return { comments: mine, shared: shared };
  }
  function label() {
    var bar = document.getElementById('__ptr-bar');
    var n = Object.keys(pending).length;
    var text = !EP ? 'このブラウザに保存中' : n ? '送信中…（' + n + '件）' : online ? 'コメントは平野に届きます' : '読み込み中…';
    if (bar) {
      var st = document.getElementById('__ptr-st');
      if (!st) { st = document.createElement('span'); st.id = '__ptr-st'; st.setAttribute('role', 'status'); st.style.cssText = 'flex-basis:100%;font-size:11px;opacity:.85'; bar.appendChild(st); }
      st.textContent = text;
    }
  }
  function notify() {
    listeners.forEach(function (l) { try { l.fn(forPage(l.page)); } catch (e) {} });
    if (window.WFTopList) window.WFTopList(all);
    label();
  }
  function applyPending(base) {
    Object.keys(pending).forEach(function (id) { if (pending[id] === null) delete base[id]; else base[id] = pending[id]; });
    return base;
  }
  function pull() {
    return fetch(EP, { method: 'GET', redirect: 'follow', cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.ok) throw new Error('bad');
      var next = {};
      (d.comments || []).forEach(function (c) { if (c && c.id && c.page) next[c.id] = c; });
      Object.keys(recent).forEach(function (id) {
        if (Date.now() - recent[id].t > 60000) { delete recent[id]; return; }
        if (recent[id].row) next[id] = recent[id].row; else delete next[id];
      });
      jset(CKEY, next);
      all = applyPending(next);
      online = true;
    });
  }
  function flush() {
    var ids = Object.keys(pending);
    if (!EP || busy || !ids.length) return Promise.resolve();
    busy = true;
    var items = [], gone = [], sent = {};
    ids.forEach(function (id) { if (pending[id] === null) gone.push(id); else items.push(pending[id]); sent[id] = JSON.stringify(pending[id]); });
    return fetch(EP, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ items: items, deleted: gone }) })
      .then(function (r) { return r.json(); }).then(function (d) {
        if (!d || !d.ok) throw new Error((d && d.error) || 'bad');
        ids.forEach(function (id) { if (JSON.stringify(pending[id]) === sent[id]) { recent[id] = { t: Date.now(), row: pending[id] }; delete pending[id]; } });
        (d.saved || []).forEach(function (c) { if (!pending[c.id]) all[c.id] = c; });
        jset(PKEY, pending); online = true;
      }).catch(function () {}).then(function () { busy = false; notify(); });
  }
  all = EP ? applyPending(jget(CKEY)) : jget(LKEY);
  window.WFBridge = {
    load: function (page) { return Promise.resolve(forPage(page)); },
    onChange: function (page, fn) { listeners = listeners.filter(function (l) { return l.page !== page; }); listeners.push({ page: page, fn: fn }); setTimeout(label, 0); },
    shared: function () { return !!EP; },
    save: function (page, comments, gone) {
      comments.forEach(function (c) {
        var row = Object.assign({}, c, { page: page }); delete row.source;
        if (all[c.id] && JSON.stringify(all[c.id]) === JSON.stringify(row)) return;
        all[c.id] = row; pending[c.id] = row;
      });
      gone.forEach(function (id) { delete all[id]; pending[id] = null; });
      if (!EP) { pending = {}; return jset(LKEY, all) ? Promise.resolve(forPage(page)) : Promise.reject(new Error('full')); }
      jset(PKEY, pending); notify(); flush();
      return Promise.resolve(forPage(page));
    },
    exportAll: function () {
      var by = {};
      Object.keys(all).forEach(function (id) { var c = all[id]; if (parts(c.page).stage === '06-top') (by[c.page] = by[c.page] || []).push(strip(c)); });
      var pages = Object.keys(by).map(function (p) { return { page: p, comments: by[p] }; });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify({ exported: new Date().toISOString(), pages: pages }, null, 2)], { type: 'application/json' }));
      a.download = 'comments-top-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      return Promise.resolve(pages.length + 'ページ分を保存しました');
    }
  };
  if (EP) {
    pull().then(function () { notify(); return flush(); }, function () { label(); });
    setInterval(function () {
      if (document.hidden) return;
      flush().then(function () { return busy ? null : pull(); }).then(notify, function () {});
    }, 20000);
  }
  if (window.WFTopList) window.WFTopList(all);
})();
