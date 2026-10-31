/* Zing Neighbors App: group deals. Pools neighbors who need the same service, texts the 3 most recommended
   providers for a group price, negotiates, and locks in the chosen one. Shared across pages via localStorage.
   Texts go through ZSMS (simulated until Twilio is connected). */
window.ZPool = (function(){
  var KEY = 'zingN.app.pools', OKEY = 'zingN.app.poolOptOut', n = 0;
  var BASE = { 'AC / HVAC': 350, 'Plumber': 180, 'Cleaner': 160, 'Pest control': 150, 'Landscaping': 120, 'Pool': 140, 'Painter': 400, 'Electrician': 200, 'Handyman': 120, 'Car detailing': 120, 'Appliance repair': 160 };
  var SCOPE = { 'AC / HVAC': 'Filter, coil clean and drain line flush', 'Pest control': 'Interior and exterior treatment', 'Cleaner': 'Standard 2-hour clean', 'Plumber': 'Water heater flush and leak check', 'Car detailing': 'Exterior wash and interior detail', 'Landscaping': 'Monthly patio and planter care' };
  var SVC = { 'AC / HVAC': 'routine AC maintenance', 'Pest control': 'pest control', 'Cleaner': 'a home cleaning', 'Plumber': 'a plumbing check-up', 'Car detailing': 'car detailing', 'Landscaping': 'patio and planter care', 'Painter': 'interior painting', 'Electrician': 'an electrical safety check', 'Handyman': 'small repairs' };
  function all(){ try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(l){ try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) {} window.dispatchEvent(new Event('zpool')); }
  function optOut(){ try { return JSON.parse(localStorage.getItem(OKEY)) || {}; } catch (e) { return {}; } }
  function upd(id, fn){ var l = all(), p = l.find(function(x){ return x.id === id; }); if (!p) return null; fn(p); p.updated = Date.now(); save(l); return p; }
  function first(s){ return String(s || '').split(' ')[0]; }
  function cfg(){ return window.ZCFG ? window.ZCFG.get().bot : {}; }
  function live(){ return !!(window.ZSMS && window.ZSMS.live); }
  function round5(x){ return Math.round(x / 5) * 5; }
  function count(p){ return (p.you ? 1 : 0) + (p.others || 0); }
  function priceFor(o, k){ var best = null; (o.tiers || []).forEach(function(t){ if (k >= t[0] && (best === null || t[1] < best)) best = t[1]; }); return best; }
  function minFor(o){ return (o.tiers || []).length ? Math.min.apply(null, o.tiers.map(function(t){ return t[0]; })) : null; }
  function lowest(o){ return (o.tiers || []).length ? Math.min.apply(null, o.tiers.map(function(t){ return t[1]; })) : null; }
  function log(p, t){ (p.log = p.log || []).push([Date.now(), t]); }
  function svc(p){ return p.need || SVC[p.trade] || p.trade.toLowerCase() + ' service'; }
  function top(trade, sups){ var o = optOut(); return (sups || []).filter(function(s){ return s.trade === trade && s.phone && !s.warnings && !o[s.id]; }).sort(function(a, b){ return b.recs - a.recs; }).slice(0, 3); }
  function waitMs(){ return live() ? (cfg().smsWait || 120) * 60000 : 25000; }
  function autoReplies(){ var r = cfg().smsReplies || 'mix'; return !live() && r !== 'manual' && r !== 'none'; }

  function create(o){
    var p = { id: 'gp' + Date.now().toString(36) + (n++), trade: o.trade, title: o.title || ('Group ' + (SVC[o.trade] || o.trade.toLowerCase())), need: o.need || '', by: o.by || 'Neighbors AI',
      goal: o.goal || 20, you: !!o.you, others: o.others || 0, invited: o.invited || 0, status: 'Collecting', base: BASE[o.trade] || 150, offers: [], chosen: null, log: [], ts: Date.now() };
    log(p, o.from === 'detect' ? 'Started from ' + o.invited + ' requests in the group' : 'Started by ' + p.by);
    var l = all(); l.unshift(p); save(l); return p;
  }
  function recheck(p){
    var ok = p.offers.some(function(o){ return priceFor(o, count(p)) !== null && !/declined|opted|no reply/.test(o.status); });
    if (p.status === 'Need more neighbors' && ok) { p.status = 'Choose a provider'; log(p, 'Enough households now. An offer is unlocked.'); if (cfg().poolPick === 'auto') setTimeout(function(){ autoChoose(p.id); }, 800); }
    else if (p.status === 'Choose a provider' && !ok) p.status = 'Need more neighbors';
  }
  function join(id){ return upd(id, function(p){ p.you = !p.you; log(p, p.you ? 'You joined (' + count(p) + ' in)' : 'You left (' + count(p) + ' in)'); recheck(p); }); }
  function addOthers(id, k){ return upd(id, function(p){ p.others = Math.max(0, (p.others || 0) + k); log(p, (k > 0 ? k + (k === 1 ? ' neighbor joined' : ' neighbors joined') : 'Neighbors left') + ' (' + count(p) + ' in)'); recheck(p); }); }

  function simQuote(p, rank){
    var b = p.base, k = count(p), r = cfg().smsReplies || 'mix';
    if (r === 'no') return 'Sorry, we can’t take on a group job right now.';
    if (r === 'unclear') return 'Call me to discuss';
    if (r === 'mix' && rank === 2 && Math.random() < .3) return 'Sorry, we’re booked out for the next month.';
    var sc = SCOPE[p.trade] || 'Standard visit';
    if (rank === 0) return '$' + round5(b * .72) + ' per unit for 10 or more, $' + round5(b * .66) + ' at 20+. ' + sc + '. Monday to Friday next week.';
    if (rank === 1) return '$' + round5(b * .62) + ' per unit if you get 15 or more. ' + sc + '. The week after next.';
    return '$' + round5(b * .58) + ' per unit for 20 or more. Same scope. Earliest is in three weeks.';
  }
  function simCounter(o, ask, ask2, goal){
    if (Math.random() < .7) return 'For one building in one week, yes. $' + ask + ' at ' + Math.max(1, minFor(o) || 1) + '+, and $' + ask2 + ' at ' + goal + '+.';
    var mid = round5((ask + (lowest(o) || ask)) / 2); return '$' + mid + ' per unit is the best I can do.';
  }
  function quoteText(p, s){
    return 'Hi ' + first(s.name) + ', this is Zing for the ' + window.HOA.GROUP.name + ' neighbors group. ' + count(p) + ' households in the same building want ' + svc(p) + ' in the next few weeks, and more are joining. Could you quote a group price per unit? Please include what’s included, your dates, and whether the price drops at 15 or 20 units. Reply NO if you can’t, or STOP to opt out.';
  }
  function askQuotes(id, sups){
    var p0 = all().find(function(x){ return x.id === id; }); if (!p0 || !/Collecting/.test(p0.status)) return;
    var list = top(p0.trade, sups);
    var p = upd(id, function(p){ p.status = list.length ? 'Getting quotes' : 'No providers'; p.offers = list.map(function(s){ return { sid: s.id, name: s.name, recs: s.recs, tid: 'p_' + p.id + '_' + s.id, status: 'asked', tiers: [], asked: Date.now() }; });
      log(p, list.length ? 'Asked ' + list.map(function(s){ return s.name; }).join(', ') + ' for a group price' : 'No recommended ' + p.trade + ' provider with a phone number'); });
    if (!p) return;
    list.forEach(function(s, i){ var o = p.offers[i]; window.ZSMS.send(o.tid, { sid: s.id, provider: s.name, phone: s.phone, pool: p.id, trade: p.trade }, quoteText(p, s));
      if (autoReplies()) { var body = simQuote(p, i); setTimeout(function(){ window.ZSMS.receive(o.tid, body); }, 3000 + i * 2200 + Math.random() * 1500); } });
  }
  function negotiateWith(id, sid){
    var p = all().find(function(x){ return x.id === id; }); if (!p) return;
    var o = p.offers.find(function(x){ return x.sid === sid; }); if (!o || !o.tiers.length) return;
    var others = p.offers.filter(function(x){ return x.sid !== sid && x.tiers.length && x.status !== 'declined'; });
    var comp = others.map(function(x){ return [lowest(x), minFor(x), x]; }).sort(function(a, b){ return a[0] - b[0]; })[0];
    var k = count(p), mn = minFor(o) || 1, now = priceFor(o, Math.max(k, mn)) || lowest(o);
    var ask = comp ? Math.min(now, round5(comp[0] + 10)) : round5(now * .93), ask2 = comp ? round5(comp[0] - 10) : round5(now * .88);
    if (ask >= now) ask = round5(now * .95); if (ask2 >= ask) ask2 = round5(ask * .92);
    var body = 'Thanks ' + first(o.name) + '. ' + (comp ? 'Another recommended provider offered $' + comp[0] + ' at ' + comp[1] + '+. ' : '') + 'Neighbors recommend you' + (comp && o.recs >= comp[2].recs ? ' most' : '') + ' (' + o.recs + ' recommendations). ' + (k >= mn ? 'Could you do $' + ask + ' at ' + k + ' units' : 'We have ' + k + ' households so far. Could you do $' + ask + ' starting at ' + k + ' units') + ', and $' + ask2 + ' if we reach ' + p.goal + '?';
    upd(id, function(q){ var oo = q.offers.find(function(x){ return x.sid === sid; }); oo.status = 'negotiating'; oo.asked = Date.now(); q.status = 'Negotiating'; log(q, 'Asked ' + oo.name + ' for $' + ask + ' at ' + k + ' units and $' + ask2 + ' at ' + q.goal + (k < mn ? ' (their minimum was ' + mn + ')' : '')); });
    window.ZSMS.send(o.tid, null, body);
    if (autoReplies()) { var r = simCounter(o, ask, ask2, p.goal); setTimeout(function(){ window.ZSMS.receive(o.tid, r); }, 3500 + Math.random() * 1500); }
  }
  function negotiate(id){
    var p = all().find(function(x){ return x.id === id; }); if (!p) return;
    var q = p.offers.filter(function(x){ return x.tiers.length && x.status === 'quoted'; }).sort(function(a, b){ return b.recs - a.recs; })[0];
    if (q) negotiateWith(id, q.sid); else upd(id, function(x){ x.status = 'Choose a provider'; });
  }
  function choose(id, sid){
    var p = upd(id, function(p){ p.chosen = sid; p.status = 'Locked in'; p.offers.forEach(function(o){ if (o.status !== 'declined' && o.status !== 'opted out' && o.status !== 'no reply') o.status = o.sid === sid ? 'chosen' : 'not chosen'; });
      var o = p.offers.find(function(x){ return x.sid === sid; }); log(p, (o ? o.name : 'Provider') + ' chosen at $' + (o ? priceFor(o, count(p)) : '?') + ' per unit'); });
    if (!p) return;
    p.offers.forEach(function(o){ if (o.sid === sid) window.ZSMS.send(o.tid, null, 'Great news: the group chose you. ' + count(p) + ' units at $' + priceFor(o, count(p)) + ' per unit. Zing will send unit numbers and times as neighbors book. Reply here with any questions.');
      else if (o.status === 'not chosen') window.ZSMS.send(o.tid, null, 'Thanks for the quote, ' + first(o.name) + '. The group went with another provider this time. We’ll keep you in mind.'); });
  }
  function autoChoose(id){ var p = all().find(function(x){ return x.id === id; }); if (!p) return; var k = count(p);
    var best = p.offers.filter(function(o){ return priceFor(o, k) !== null && !/declined|opted|no reply/.test(o.status); }).sort(function(a, b){ return priceFor(a, k) - priceFor(b, k) || b.recs - a.recs; })[0];
    if (best) choose(id, best.sid); }
  function cancel(id){ var p = upd(id, function(p){ p.status = 'Cancelled'; log(p, 'Cancelled'); }); if (!p) return;
    p.offers.forEach(function(o){ if (/asked|quoted|negotiating|replied/.test(o.status)) window.ZSMS.send(o.tid, null, 'Thanks ' + first(o.name) + ', the group decided not to go ahead this time.'); }); }
  function book(id, day, unit){ var p = upd(id, function(p){ p.mySlot = day; log(p, 'You picked ' + day); }); if (!p) return; var o = p.offers.find(function(x){ return x.sid === p.chosen; });
    if (o) window.ZSMS.send(o.tid, null, 'Booking for the group: unit ' + (unit || 'number to follow') + ', ' + day + '.'); }

  function parseKw(body){
    var t = String(body || '').trim();
    if (/^(stop|unsubscribe|end|quit)\b/i.test(t)) return { intent: 'stop' };
    var tiers = [], re = /\$\s?(\d+(?:\.\d\d)?)[^$]{0,40}?(\d{1,3})\s*(?:\+|or more|units|households|homes)/gi, m;
    while ((m = re.exec(t))) tiers.push([+m[2], +m[1]]);
    if (!tiers.length) { var one = t.match(/\$\s?(\d+(?:\.\d\d)?)/); if (one) tiers.push([1, +one[1]]); }
    var dm = t.match(/\b(mon(day)?|tue(sday)?|wed(nesday)?|thu(rsday)?|fri(day)?|sat(urday)?|sun(day)?|next week|this week|the week after next|in (two|three|four|\d) weeks|earliest[^.]*)[^.]*/i);
    if (tiers.length) return { intent: 'quote', tiers: tiers.sort(function(a, b){ return a[0] - b[0]; }), dates: dm ? dm[0].trim() : '' };
    if (/\b(no|sorry|can'?t|cannot|booked|busy|not available|pass)\b/i.test(t)) return { intent: 'no' };
    return { intent: 'unclear' };
  }
  function parse(body){
    if (window.HOAI && window.HOAI.on()) {
      return window.claude.complete({ system: 'A service provider replied by text to a request for a group price for several households in one building. Return ONLY JSON: {"intent":"quote|no|unclear|stop","tiers":[[<min units>,<price per unit>]],"dates":"<when they can do it, short>"}. Use min 1 if they give one price with no minimum. "unclear" is anything that needs a person, like "call me".', max_tokens: 250, messages: [{ role: 'user', content: body }] })
        .then(function(raw){ var r = JSON.parse(String(raw).match(/\{[\s\S]*\}/)[0]); if (!/^(quote|no|unclear|stop)$/.test(r.intent)) throw 0; r.tiers = (r.tiers || []).map(function(x){ return [+x[0] || 1, +x[1]]; }).filter(function(x){ return x[1] > 0; }); if (r.intent === 'quote' && !r.tiers.length) throw 0; return r; })
        .catch(function(){ return parseKw(body); });
    }
    return Promise.resolve(parseKw(body));
  }
  function settle(p){
    if (p.offers.some(function(o){ return o.status === 'asked' || o.status === 'negotiating'; })) return;
    var c = cfg();
    if (p.status === 'Getting quotes') { if (c.poolNegotiate !== false && p.offers.some(function(o){ return o.status === 'quoted'; })) { setTimeout(function(){ negotiate(p.id); }, 800); } else p.status = p.offers.some(function(o){ return o.tiers.length; }) ? 'Choose a provider' : 'No offers'; }
    else if (p.status === 'Negotiating') p.status = 'Choose a provider';
    if (p.status === 'Choose a provider' && !p.offers.some(function(o){ return priceFor(o, count(p)) !== null && !/declined|opted|no reply/.test(o.status); })) { p.status = 'Need more neighbors'; log(p, 'No offer works at ' + count(p) + ' households yet. Still collecting.'); }
    if (p.status === 'Choose a provider' && c.poolPick === 'auto') setTimeout(function(){ autoChoose(p.id); }, 800);
  }
  function handle(th, msg){
    window.ZSMS.mark(th.id, msg.id);
    parse(msg.body).then(function(r){
      upd(th.pool, function(p){
        var o = p.offers.find(function(x){ return x.tid === th.id; }); if (!o) return;
        if (/chosen|not chosen/.test(o.status) || /Locked in|Cancelled/.test(p.status)) { log(p, o.name + ' texted: “' + msg.body + '”'); return; }
        if (r.intent === 'stop') { o.status = 'opted out'; var oo = optOut(); oo[o.sid] = 1; try { localStorage.setItem(OKEY, JSON.stringify(oo)); } catch (e) {} log(p, o.name + ' opted out of texts'); }
        else if (r.intent === 'no') { o.status = 'declined'; log(p, o.name + ' declined'); }
        else if (r.intent === 'quote') { var neg = o.status === 'negotiating'; if (neg) { var merged = (o.tiers || []).slice(); r.tiers.forEach(function(t){ merged = merged.filter(function(x){ return x[0] !== t[0]; }); merged.push(t); }); merged.sort(function(a, b){ return a[0] - b[0]; }); o.tiers = merged.filter(function(t, i){ return !merged.slice(0, i).some(function(x){ return x[1] <= t[1]; }); }); o.negotiated = true; } else o.tiers = r.tiers;
          if (r.dates && !o.dates) o.dates = r.dates; o.status = 'quoted'; o.reply = msg.body; log(p, o.name + (neg ? ' came back with ' : ' quoted ') + o.tiers.map(function(t){ return '$' + t[1] + ' at ' + t[0] + '+'; }).join(', ')); }
        else { o.status = o.tiers.length ? 'quoted' : 'replied'; o.reply = msg.body; log(p, o.name + ' replied “' + msg.body + '”. Needs a person to follow up.'); }
        settle(p);
      });
    });
  }
  function process(){ window.ZSMS.list().forEach(function(th){ if (!th.pool) return; th.msgs.forEach(function(m){ if (m.dir === 'in' && !m.processed) handle(th, m); }); }); }
  function tick(sups){
    var now = Date.now(), c = cfg();
    all().forEach(function(p){
      if (/Choose a provider|Need more neighbors/.test(p.status)) { var ok = p.offers.some(function(o){ return priceFor(o, count(p)) !== null && !/declined|opted|no reply/.test(o.status); });
        if ((p.status === 'Choose a provider') !== ok) upd(p.id, recheck); }
      if (p.status === 'Collecting' && c.poolAutoQuote !== false && count(p) >= (c.poolQuoteAt || 5)) askQuotes(p.id, sups);
      if (/Getting quotes|Negotiating/.test(p.status) && p.offers.some(function(o){ return /asked|negotiating/.test(o.status) && now - o.asked > waitMs(); }))
        upd(p.id, function(q){ q.offers.forEach(function(o){ if (o.status === 'asked' && now - o.asked > waitMs()) { o.status = 'no reply'; log(q, o.name + ' didn’t reply'); } if (o.status === 'negotiating' && now - o.asked > waitMs()) { o.status = 'quoted'; log(q, o.name + ' didn’t answer the counteroffer'); } }); settle(q); });
    });
  }
  function detect(requests, sups, minPeople){
    var since = Date.now() - 30 * 864e5, by = {}, act = all().filter(function(p){ return !/Cancelled|Locked in|No providers|No offers/.test(p.status); });
    (requests || []).forEach(function(r){ var d = +(r.d || r.ts); if (!r.trade || r.trade === 'Other' || d < since) return; (by[r.trade] = by[r.trade] || []).push(r); });
    return Object.keys(by).filter(function(t){ return by[t].length >= (minPeople || 3) && !act.some(function(p){ return p.trade === t; }) && top(t, sups).length; })
      .map(function(t){ return { trade: t, n: by[t].length, top: top(t, sups) }; }).sort(function(a, b){ return b.n - a.n; });
  }
  function subscribe(fn){ var h = function(e){ if (e.type === 'storage' && e.key !== KEY) return; fn(); }; window.addEventListener('zpool', h); window.addEventListener('storage', h);
    return function(){ window.removeEventListener('zpool', h); window.removeEventListener('storage', h); }; }
  return { list: all, get: function(id){ return all().find(function(x){ return x.id === id; }) || null; }, create: create, join: join, addOthers: addOthers, askQuotes: askQuotes, negotiate: negotiate, negotiateWith: negotiateWith,
    choose: choose, autoChoose: autoChoose, cancel: cancel, book: book, process: process, tick: tick, detect: detect, subscribe: subscribe, count: count, priceFor: priceFor, minFor: minFor, top: top, svc: svc, SVC: SVC,
    clear: function(){ try { localStorage.removeItem(KEY); } catch (e) {} window.dispatchEvent(new Event('zpool')); } };
})();
