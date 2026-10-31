/* Zing Neighbors App: the group a person belongs to, joining rules, WhatsApp import and invites.
   Saved in this browser (zingN.app.group); this is the shape of the Supabase `groups`, `members` and `join_requests` tables later.
   Joining: a phone number that was in the imported WhatsApp group gets in automatically; everyone else waits for an admin. */
window.ZGroup = (function(){
  var KEY = 'zingN.app.group';
  var TYPES = {
    HOA: { label: 'HOA', noun: 'HOA', who: 'Owners and a board', place: 'Building or community', unit: 'Unit', mgmt: 'the board or management company' },
    Multifamily: { label: 'Apartment building', noun: 'building', who: 'Mostly renters, with a property manager', place: 'Building', unit: 'Unit', mgmt: 'the leasing office' },
    Neighborhood: { label: 'Neighborhood', noun: 'neighborhood', who: 'Houses on nearby streets, no management', place: 'Area', unit: 'Street', mgmt: null }
  };
  /* demo groups a new person can search for or open by code */
  var DEMO = [
    { id: 'cgn', name: 'CGN Household/Services', type: 'Neighborhood', address: 'Coconut Grove, Miami', members: 214, code: 'CGN-4821', imported: ['3055550142', '3055550177'] },
    { id: 'roxy', name: 'Alexan Roxy Neighbors', type: 'Multifamily', address: 'Coral Gables, Miami', members: 63, code: 'ROXY-2210', imported: ['3055550142'] },
    { id: 'forma', name: 'Forma Residents', type: 'Multifamily', address: 'Downtown Miami', members: 118, code: 'FORMA-7734', imported: [] }
  ];
  var digits = function(p){ return String(p || '').replace(/\D/g, '').slice(-10); };
  function all(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(o){ try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} window.dispatchEvent(new Event('zgroup')); }
  function patch(p){ var o = all(); Object.keys(p).forEach(function(k){ o[k] = p[k]; }); save(o); return o; }
  function code(name){ var w = String(name || 'GROUP').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) || 'GROUP'; return w + '-' + (1000 + Math.floor(Math.random() * 9000)); }
  function find(q){ q = String(q || '').trim(); if (!q) return null;
    var m = q.match(/[?&]j=([A-Z0-9-]+)/i), c = (m ? m[1] : q).toUpperCase(), mine = all().group;
    if (mine && mine.code === c) return mine;
    return DEMO.find(function(g){ return g.code === c; }) || null; }
  function search(q){ q = String(q || '').toLowerCase().trim(); var mine = all().group, l = (mine ? [mine] : []).concat(DEMO);
    return q ? l.filter(function(g){ return (g.name + ' ' + g.address).toLowerCase().indexOf(q) > -1; }) : l; }
  function wasImported(g, phone){ var d = digits(phone); if (!d) return false; var o = all();
    var list = (g.imported || []).concat(o.group && o.group.code === g.code && o.imported ? o.imported.members.map(function(m){ return m.phone; }) : []);
    return list.some(function(p){ return digits(p) === d; }); }
  function link(g){ var base = location.href.replace(/[^/]*$/, ''); return base + 'Onboarding.html?j=' + encodeURIComponent(g.code); }
  function moveMsg(g, me){
    return 'Hey neighbors! I set up our group on Zing so recommendations, building stuff and plans don’t get lost in the scroll. '
      + 'Everything we’ve shared here over time is already there. Join with your phone number, it takes a minute: ' + link(g)
      + ' I’ll keep this chat open for a couple of weeks while everyone moves over.' + (me && me.name ? ' – ' + me.name.split(' ')[0] : ''); }
  function smsMsg(g, me){ return (me && me.name ? me.name.split(' ')[0] + (me.unit ? ' from ' + me.unit : '') : 'A neighbor') + ' invited you to the ' + g.name + ' group on Zing: ' + link(g); }

  /* ---------- WhatsApp export (.txt, or _chat.txt inside the .zip) ---------- */
  var TR = [['Plumber', /plumb|leak|clog|drain|faucet|toilet|water heater/i], ['AC / HVAC', /\b(ac|a\/c|hvac|air ?con)/i], ['Electrician', /electric|outlet|breaker|wiring/i],
    ['Cleaner', /clean(er|ing)|maid|housekeep/i], ['Handyman', /handyman|mount|assemble|drywall/i], ['Pest control', /pest|roach|termite|exterminat/i], ['Locksmith', /locksmith|locked out/i],
    ['Painter', /paint(er|ing)/i], ['Pool', /pool (guy|service|clean)/i], ['Landscaping', /landscap|lawn|gardener|tree trim/i], ['Mover', /\bmov(er|ers|ing company)\b/i]];
  var REC = /recommend|highly|great job|did a great|use[ds]? (him|her|them)|call (him|her)|his number|her number|contact|\.vcf|\(\+?\d{3}\)|\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/i;
  var ISSUE = /broken|not working|out of order|leak(ing)?|flood|stuck|outage|no (water|power|hot water)|elevator|gate is|smell of gas/i;
  var EVENT = /\b(party|potluck|meeting|bbq|gathering|cleanup|halloween|christmas|game night)\b/i;
  var LINE = [/^\u200e?\[(\d{1,4}[\/.-]\d{1,2}[\/.-]\d{1,4}),?\s+([\d:.]+(?:\s?[APap]\.?\s?[Mm]\.?)?)\]\s+([^:]{1,60}):\s([\s\S]*)$/,
    /^\u200e?(\d{1,4}[\/.-]\d{1,2}[\/.-]\d{1,4}),?\s+([\d:.]+(?:\s?[APap]\.?\s?[Mm]\.?)?)\s+-\s+([^:]{1,60}):\s([\s\S]*)$/];
  var SYS = /^\u200e?(\[?\d{1,4}[\/.-]\d{1,2}[\/.-]\d{1,4}),?\s+[\d:.]+[^\]-]*\]?\s*-?\s*(.*)$/;
  function parseWhatsApp(text){
    var msgs = [], cur = null, sysPhones = [];
    String(text || '').split(/\r?\n/).forEach(function(raw){
      var l = raw.replace(/[\u200e\u202f]/g, function(c){ return c === '\u202f' ? ' ' : ''; }), m = null;
      for (var i = 0; i < LINE.length && !m; i++) m = l.match(LINE[i]);
      if (m){ cur = { d: m[1], who: m[3].trim(), text: m[4] }; msgs.push(cur); return; }
      var s = l.match(SYS); if (s && /added|joined|left|created/i.test(s[2])){ (s[2].match(/\+?\d[\d\s().-]{8,}\d/g) || []).forEach(function(p){ sysPhones.push(p.trim()); }); cur = null; return; }
      if (cur && l.trim()) cur.text += '\n' + l;
    });
    var mem = {};
    msgs.forEach(function(x){ var isP = /^\+?[\d\s().-]{9,}$/.test(x.who), k = isP ? digits(x.who) : x.who.toLowerCase();
      if (!mem[k]) mem[k] = { name: isP ? '' : x.who, phone: isP ? x.who : '', n: 0 }; mem[k].n++; });
    sysPhones.forEach(function(p){ var k = digits(p); if (k && !mem[k]) mem[k] = { name: '', phone: p, n: 0 }; });
    var recs = [], issues = 0, events = 0, ask = null; // ask: the latest "anyone know a plumber?" so replies count for that trade
    var ASK = /\?|anyone (know|have|recommend)|looking for|need (a|an|someone)|recommendations? for/i;
    var GIVE = /\.vcf|\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}|\b(we|i) (use|used|love|called)\b|recommend|try \w+|is great|was great|did a great/i;
    msgs.forEach(function(x, idx){ if (/<Media omitted>|image omitted|sticker omitted/i.test(x.text) && x.text.length < 30) return;
      var tr0 = TR.find(function(t){ return t[1].test(x.text); });
      if (tr0 && ASK.test(x.text) && !GIVE.test(x.text)){ ask = { trade: tr0[0], idx: idx, who: x.who }; return; }
      var tr = tr0 || (ask && idx - ask.idx <= 20 && x.who !== ask.who && GIVE.test(x.text) ? [ask.trade] : null);
      if (tr && (REC.test(x.text) || GIVE.test(x.text))) recs.push({ who: x.who, trade: tr[0], text: x.text.slice(0, 160), phone: ((x.text.match(/\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/) || [])[0] || '').trim() });
      else if (ISSUE.test(x.text)) issues++; else if (EVENT.test(x.text)) events++; });
    var trades = {}; recs.forEach(function(r){ trades[r.trade] = (trades[r.trade] || 0) + 1; });
    return { msgs: msgs.length, members: Object.keys(mem).map(function(k){ return mem[k]; }), recs: recs, trades: trades, issues: issues, events: events,
      from: msgs[0] ? msgs[0].d : '', to: msgs.length ? msgs[msgs.length - 1].d : '' };
  }
  function readExport(file){
    if (/\.zip$/i.test(file.name)) return new Promise(function(ok, no){
      var go = function(){ window.JSZip.loadAsync(file).then(function(z){ var f = Object.keys(z.files).find(function(n){ return /\.txt$/i.test(n); }); if (!f) return no(new Error('No chat .txt inside the zip')); return z.files[f].async('string'); }).then(function(t){ if (t) ok(t); }).catch(no); };
      if (window.JSZip) return go(); var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'; s.onload = go; s.onerror = function(){ no(new Error('Could not open the zip')); }; document.head.appendChild(s); });
    return file.text();
  }
  function current(){ var o = all(); if (o.group) return o.group; if (o.joined) return find(o.joined.code) || DEMO[0]; return DEMO[0]; }
  function subscribe(fn){ var h = function(e){ if (e.type === 'storage' && e.key !== KEY) return; fn(); }; window.addEventListener('zgroup', h); window.addEventListener('storage', h);
    return function(){ window.removeEventListener('zgroup', h); window.removeEventListener('storage', h); }; }
  /* the app shows the group this person created or joined; the CGN directory sheet stays the data source for now */
  try { var cg = current(), o0 = all(); if (window.HOA && (o0.group || o0.joined)) { window.HOA.GROUP.name = cg.name; window.HOA.GROUP.short = cg.name.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 3).map(function(w){ return w[0]; }).join('').toUpperCase(); } } catch (e) {}
  return { current: current, KEY: KEY, TYPES: TYPES, DEMO: DEMO, get: all, set: save, patch: patch, code: code, find: find, search: search, wasImported: wasImported, link: link, moveMsg: moveMsg, smsMsg: smsMsg, parseWhatsApp: parseWhatsApp, readExport: readExport, digits: digits, subscribe: subscribe,
    reset: function(){ try { localStorage.removeItem(KEY); } catch (e) {} window.dispatchEvent(new Event('zgroup')); } };
})();
