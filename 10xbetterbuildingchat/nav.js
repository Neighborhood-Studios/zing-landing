/* Page bar shared by the three Zing Neighbors App pages. Set window.ZPAGE before loading. */
(function(){
  if (!window.ZPAGE) return; /* only the Zing Neighbors App pages set this */
  var P = [['landing', 'Landing.html', 'Landing page', 'The neighborhood chat that gets things done.'], ['onboard', 'Onboarding.html', 'Onboarding', 'Sign up, join or start a group'], ['resident', 'Resident.html', 'Resident', 'What neighbors see'], ['supplier', 'Supplier.html', 'Supplier', 'What providers see']];
  var cur = P.find(function(p){ return p[0] === window.ZPAGE; }) || P[0];
  var css = '.zvb{position:fixed;top:0;left:0;right:0;z-index:1000;height:44px;display:flex;align-items:center;gap:14px;padding:0 16px;background:#0F1B33;color:#F5F3EE;font:500 13px/1.2 Geist,system-ui,sans-serif;overflow-x:auto;scrollbar-width:none}'
    + '.zvb::-webkit-scrollbar{display:none}.zvb .zc{display:flex;flex-direction:column;flex-shrink:0;padding-right:14px;border-right:1px solid #2A3A5E}.zvb .zc b{font-size:13.5px;font-weight:600}.zvb .zc span{font-size:11.5px;color:#9AA4BC}'
    + '.zvb nav{display:flex;gap:6px;flex-shrink:0}.zvb a{display:inline-flex;align-items:center;min-height:30px;padding:0 12px;border-radius:999px;color:#BCC4D6;text-decoration:none;white-space:nowrap}.zvb a:hover{color:#fff;background:#1A2847}.zvb a.on{background:#EE6A2C;color:#fff}'
    + 'body.has-zvb{padding-top:44px}body.has-zvb .stage{min-height:calc(100% - 44px)}'
    + '@media (max-width:520px){.zvb{display:none}body.has-zvb{padding-top:0}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  function mount(){
    var bar = document.createElement('div'); bar.className = 'zvb'; bar.setAttribute('role', 'navigation'); bar.setAttribute('aria-label', 'Pages');
    bar.innerHTML = '<div class="zc"><b>Zing Neighbors</b><span>' + cur[3] + '</span></div><nav>'
      + P.map(function(p){ return '<a href="' + encodeURI(p[1]) + '"' + (p === cur ? ' class="on" aria-current="page"' : '') + '>' + p[2] + '</a>'; }).join('') + '</nav>';
    document.body.insertBefore(bar, document.body.firstChild); document.body.classList.add('has-zvb');
    document.title = 'Zing Neighbors · ' + cur[2];
    var f = function(){ if (innerWidth > 520) document.documentElement.style.setProperty('--pz', Math.max(.4, Math.min(1, (innerHeight - 92) / 844))); };
    f(); addEventListener('resize', f);
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
