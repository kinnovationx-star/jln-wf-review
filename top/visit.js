/* TOP5案を開いた記録。ページを開くたびに1回、スプレッドシートの「開いた記録」へ送る。
 * 誰かは、平野さんが渡すリンクの ?v=コード で分かる（名前はURLに入れず、シート「開く人」で対応させる）。
 * 公開先のページだけで動く。手元の確認では送らない。失敗しても画面には何も影響させない。 */
(function () {
  'use strict';
  var EP = (window.WF_ENDPOINT || '').trim();
  var me = document.currentScript;
  var PAGE = me && me.dataset.page;
  if (!EP || !PAGE || !/\.github\.io$/.test(location.hostname)) return;
  var CODE_KEY = 'jln-visit-code', ID_KEY = 'jln-visit-id', CODE_RE = /^[A-Za-z0-9_-]{1,20}$/;
  function get(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  var code = '';
  try {
    var u = new URL(location.href), v = u.searchParams.get('v');
    if (v !== null) {
      if (CODE_RE.test(v)) { code = v; set(CODE_KEY, v); }
      // アドレス欄から消す。開いたあとのURLを転送されても、同じ人の記録に混ざらないように（配ったリンク自体の転送は見分けられない）
      u.searchParams.delete('v');
      history.replaceState(history.state, '', u.pathname + u.search + u.hash);
    }
  } catch (e) {}
  code = code || get(CODE_KEY);
  var id = get(ID_KEY);
  if (!/^[a-z0-9]{8}$/.test(id)) {
    id = '';
    while (id.length < 8) id += Math.random().toString(36).slice(2);
    id = id.slice(0, 8);
    set(ID_KEY, id);
  }
  var side = Math.min(window.innerWidth, window.innerHeight);  // 横向きのスマホをタブレットに数えない
  var device = side < 600 ? 'スマホ' : window.innerWidth < 1200 ? 'タブレット' : 'PC';
  try {
    fetch(EP, {
      method: 'POST', mode: 'no-cors', keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ visit: { page: PAGE, code: code, id: id, device: device } })
    }).catch(function () {});
  } catch (e) {}
})();
