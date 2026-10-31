/* Instinct playback engine. One reducer for every use case. State is rebuilt by replaying
   fixture → init events → steps[0..idx-1] (+ your manual actions at the point you made them),
   so Pause, Next, Previous and Restart are exact and runs are deterministic. Nothing here touches real app data. */
window.ZEngine = (function(){
  const DAY = 864e5, clone = o => JSON.parse(JSON.stringify(o));
  const ymd = t => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const short = t => { t = String(t || ''); return t.length > 90 ? t.slice(0, 88) + '…' : t; };
  const priceFor = (o, n) => { let p = null; (o.tiers || []).forEach(([m, v]) => { if (n >= m && (p === null || v < p)) p = v; }); return p; };
  const minFor = o => Math.min(...(o.tiers || [[Infinity]]).map(t => t[0]));
  const count = o => (o.participants || []).length + (o.extra || 0);
  const nm = (s, r) => s.people[r] ? s.people[r][0] : r === 'ai' ? 'Neighbors AI' : r;
  const who = (s, r) => s.people[r] ? s.people[r][0] + (s.people[r][1] ? ' · ' + s.people[r][1] : '') : r;
  const O = (s, id) => s.opps.find(x => x.id === id);
  function fresh(cs){ const F = window.ZFIX; return { you: cs.you, focus: cs.focus || null, people: F.people, feed: [], dm: {}, suppliers: F.suppliers(), opps: [], items: [], events: [], going: {}, recs: [], memory: [], outcomes: [], log: [], lastSeen: null, seq: 0, step: -1 }; }
  function find(s, id){
    for (const m of s.feed) if (m.id === id) return m;
    for (const k in s.dm) for (const m of s.dm[k]) if (m.id === id) return m;
    for (const k in s.suppliers) for (const m of s.suppliers[k].inbox) if (m.id === id) return m;
    return null;
  }
  const resolve = (s, v) => { if (typeof v === 'string' && v.indexOf('$chosen:') === 0) { const o = O(s, v.slice(8)); return o && o.chosen || null; } return v; };
  const defOrigin = e => (e.t === 'MESSAGE_POSTED' && e.from !== 'ai') || e.t === 'RESIDENT_REPLY' || (e.t === 'SUPPLIER_MSG' && e.from === 'supplier') || e.t === 'POLL_VOTE' ? 'scripted' : 'sim';
  function L(s, type, text, origin){ s.log.push({ n: s.log.length, step: s.step, type, text: short(text), origin }); }

  function ap(s, e0, ctx){
    const e = clone(e0);
    if (e.sid !== undefined) { e.sid = resolve(s, e.sid); if (e.sid === null && String(e0.sid).indexOf('$chosen') === 0) return; }
    if (e.cond) { const o = O(s, e.cond.split(':')[1]); if (!o || !o.chosen) return; }
    const origin = e.origin || (ctx.origin !== 'scripted' ? ctx.origin : defOrigin(e));
    const ts = e.ago !== undefined ? ctx.base - e.ago * 60000 : ctx.base + (++s.seq) * 30000;
    const o = e.id ? O(s, e.id) : null, sp = e.sid ? s.suppliers[e.sid] : null;
    const uid = p => p + '_' + s.seq + '_' + (s.log.length);
    switch (e.t){
      case 'MESSAGE_POSTED': {
        const m = { ...e, id: e.id || uid('m'), ts, origin }; delete m.t; s.feed.push(m);
        L(s, e.kind === 'nudge' ? 'AI_SUGGESTION' : e.kind === 'outcome' ? 'OUTCOME_POSTED' : 'MESSAGE_POSTED', (e.from === 'ai' ? 'AI posted' : who(s, e.from) + ' posted') + ': ' + (e.text || e.title || e.body || e.kind), origin); break; }
      case 'AI_DM': (s.dm[e.to] = s.dm[e.to] || []).push({ id: e.id || uid('d'), ai: true, title: e.title, text: e.text, draft: e.draft, actions: e.actions, on: e.on, ts, origin }); L(s, 'RESIDENT_CONTACTED', 'Private message to ' + who(s, e.to) + ': ' + e.text, origin); break;
      case 'RESIDENT_REPLY': (s.dm[e.from] = s.dm[e.from] || []).push({ id: uid('r'), me: true, text: e.text, ts, origin }); L(s, 'RESIDENT_REPLIED', who(s, e.from) + ': ' + e.text, origin); break;
      case 'CHOICE': {
        const m = find(s, e.target); if (!m || m.done) return;
        const a = (m.actions || []).find(x => x[1] === e.k); m.picked = e.k; m.done = (a ? a[0] : e.k);
        L(s, 'CHOICE', (e.auto ? 'Scripted choice: ' : 'Your choice: ') + m.done, e.auto ? 'scripted' : origin);
        ((m.on || {})[e.k] || []).forEach(x => ap(s, x, ctx)); break; }
      case 'DETECT': L(s, 'AI_PATTERN_DETECTED', e.text, 'sim'); break;
      case 'OPPORTUNITY_CREATED': s.opps.push({ participants: [], declined: [], extra: 0, offers: [], filled: 0, requirements: [], ...clone(e.opp), ts }); L(s, 'OPPORTUNITY_CREATED', e.opp.title + ' · confidence ' + Math.round(e.opp.confidence * 100) + '%', 'sim'); break;
      case 'OPP_UPDATE': { if (!o) return; Object.assign(o, clone(e.patch || {})); Object.entries(e.add || {}).forEach(([k, v]) => { o[k] = Math.max(0, (o[k] || 0) + v); });
        const bits = []; if (e.patch && e.patch.status) bits.push('status → ' + e.patch.status); if (e.add && e.add.extra) bits.push((e.add.extra > 0 ? '+' : '') + e.add.extra + ' joined (now ' + count(o) + ')'); if (e.patch && e.patch.requirements) bits.push('requirements updated');
        if (bits.length) L(s, 'OPPORTUNITY_UPDATED', o.title + ': ' + bits.join(', '), origin); break; }
      case 'OPT_IN': { if (!o) return; o.participants = o.participants.filter(x => x !== e.rid); o.declined = o.declined.filter(x => x !== e.rid);
        if (e.v === 'toggle') { if (!e0._was) o.participants.push(e.rid); } else (e.v === 'yes' ? o.participants : o.declined).push(e.rid);
        L(s, e.v === 'no' ? 'RESIDENT_DECLINED' : 'RESIDENT_OPTED_IN', who(s, e.rid) + (e.v === 'no' ? ' declined ' : ' is in for ') + o.title + ' (' + count(o) + ' in)', origin); break; }
      case 'JOIN_TOGGLE': { if (!o) return; const inn = o.participants.includes(s.you); o.participants = o.participants.filter(x => x !== s.you); o.declined = o.declined.filter(x => x !== s.you); if (!inn) o.participants.push(s.you); L(s, inn ? 'RESIDENT_LEFT' : 'RESIDENT_OPTED_IN', who(s, s.you) + (inn ? ' left ' : ' joined ') + o.title + ' (' + count(o) + ' in)', origin); break; }
      case 'QUOTE': { if (!o) return; o.offers = o.offers.filter(x => x.sid !== e.offer.sid); o.offers.push({ status: 'received', ...clone(e.offer) }); L(s, 'SUPPLIER_QUOTE_RECEIVED', s.suppliers[e.offer.sid].biz || s.suppliers[e.offer.sid].name + ': ' + e.offer.tiers.map(t => '$' + t[1] + ' at ' + t[0] + '+').join(', '), origin); break; }
      case 'OFFER_UPDATE': { if (!o) return; const f = o.offers.find(x => x.sid === e.sid); if (!f) return; Object.assign(f, clone(e.patch)); if (e.patch.status === 'rejected' && o.chosen === e.sid) o.chosen = null;
        L(s, e.patch.tiers ? 'OFFER_NEGOTIATED' : 'OFFER_UPDATED', (sp.biz || sp.name) + ': ' + (e.patch.tiers ? e.patch.tiers.map(t => '$' + t[1] + ' at ' + t[0] + '+').join(', ') : e.patch.status), origin); break; }
      case 'OFFER_SELECTED': { if (!o) return; if (e.auto && o.chosen !== undefined) return; let sid = e.sid;
        if (sid === undefined) { const n = count(o); const c = o.offers.filter(x => x.status !== 'rejected' && priceFor(x, n) !== null).sort((a, b) => priceFor(a, n) - priceFor(b, n) || s.suppliers[b.sid].recs - s.suppliers[a.sid].recs)[0]; sid = c ? c.sid : null; }
        if (sid && (o.offers.find(x => x.sid === sid) || {}).status === 'rejected') return;
        o.chosen = sid; o.offers.forEach(x => { if (x.status !== 'rejected') x.status = x.sid === sid ? 'selected' : 'received'; });
        L(s, 'OFFER_SELECTED', sid ? (s.suppliers[sid].biz || s.suppliers[sid].name) + ' selected for ' + o.title : 'No offer selected for ' + o.title, origin); break; }
      case 'SLOTS': { if (!o || !o.chosen) return; o.filled = Math.min(e.n, count(o)); L(s, 'BOOKING_CONFIRMED', o.filled + ' of ' + count(o) + ' appointments booked', origin); break; }
      case 'SUPPLIER_MSG': { if (!sp) return; sp.inbox.push({ id: e.id || uid('s'), sid: e.sid, inbox: !!e.actions, from: e.from, via: e.via, text: e.text, actions: e.actions, on: e.on, ts, origin }); L(s, e.from === 'ai' ? 'SUPPLIER_CONTACTED' : 'SUPPLIER_REPLIED', (e.from === 'ai' ? 'To ' : 'From ') + (sp.biz || sp.name) + (e.via ? ' (' + e.via + ')' : '') + ': ' + e.text, origin); break; }
      case 'SUPPLIER_UPDATE': { if (!sp) return; Object.assign(sp, e.patch || {}); Object.entries(e.add || {}).forEach(([k, v]) => { sp[k] = (sp[k] || 0) + v; }); L(s, e.add && e.add.jobs ? 'SERVICE_COMPLETED' : 'SUPPLIER_UPDATED', (sp.biz || sp.name) + (e.add && e.add.jobs ? ': ' + e.add.jobs + ' jobs completed' : e.patch && e.patch.claimed ? ' claimed their profile' : ' updated'), origin); break; }
      case 'OPENING_SET': { if (!sp) return; sp.openings.push({ ...e.opening }); L(s, 'AVAILABILITY_PUBLISHED', (sp.biz || sp.name) + ': ' + e.opening.day + ', ' + e.opening.where + ', ' + e.opening.total + ' openings', origin); break; }
      case 'OPENING_TAKE': { if (!sp) return; const op = sp.openings.find(x => x.id === e.oid); if (!op || op.left <= 0) return; op.left--; sp.calendar.push({ day: op.day, time: e.time, unit: e.unit, what: e.what }); L(s, 'BOOKING_CONFIRMED', (sp.biz || sp.name) + ': unit ' + e.unit + ', ' + op.day + ' ' + e.time + ' (' + op.left + ' left)', origin); break; }
      case 'REC': { if (!sp) return; sp.recs++; sp.quotes.unshift([who(s, e.who), e.quote, Math.round((ctx.base - ts) / DAY)]); s.recs.push({ sid: e.sid, who: who(s, e.who), quote: e.quote, ts }); L(s, 'COMMUNITY_MEMORY_UPDATED', 'Recommendation saved: ' + (sp.biz || sp.name) + ' by ' + who(s, e.who), origin); break; }
      case 'MEMORY': s.memory.push({ text: e.text, source: e.source || 'Chat', ts }); L(s, 'COMMUNITY_MEMORY_UPDATED', e.text, origin); break;
      case 'EVENT_CREATED': s.events.push({ photos: [], bring: [], going: 0, ...clone(e.event), date: ymd(ctx.base + e.event.inDays * DAY), ts, sim: true }); L(s, 'EVENT_CREATED', e.event.title, origin); break;
      case 'EVENT_UPDATE': { const ev = s.events.find(x => x.id === e.id); if (!ev) return; Object.assign(ev, e.patch || {}); Object.entries(e.add || {}).forEach(([k, v]) => { ev[k] = (ev[k] || 0) + v; }); if (e.bring) ev.bring.push([who(s, e.who), e.bring]); L(s, 'EVENT_UPDATED', ev.title + (e.bring ? ': ' + nm(s, e.who) + ' brings ' + e.bring.toLowerCase() : '') + ' · ' + ev.going + ' going', origin); break; }
      case 'RSVP': { const ev = s.events.find(x => x.id === e.id); if (!ev) return; const on = !s.going[e.id]; if (on) s.going[e.id] = 1; else delete s.going[e.id]; ev.going += on ? 1 : -1; L(s, 'RSVP', who(s, s.you) + (on ? ' is going to ' : ' is not going to ') + ev.title, origin); break; }
      case 'ISSUE_CREATED': { const it = { cat: 'Maintenance', reports: 1, ...clone(e.item), ts, sim: true, fresh: true }; it.log = typeof it.log === 'string' ? [[ts, it.log]] : (it.log || []).map(([a, t]) => [ctx.base - a * 60000, t]); s.items.unshift(it); L(s, 'ISSUE_CREATED', it.title + ' · ' + it.status, origin); break; }
      case 'ISSUE_UPDATE': { const it = s.items.find(x => x.id === e.id); if (!it) return; Object.assign(it, e.patch || {}); Object.entries(e.add || {}).forEach(([k, v]) => { it[k] = (it[k] || 0) + v; }); if (e.log) it.log.push([ts, e.log]); it.fresh = true; L(s, 'ISSUE_UPDATED', it.title + ': ' + (e.log || (e.patch && e.patch.status) || 'updated'), origin); break; }
      case 'POLL_VOTE': { const m = find(s, e.id); if (!m) return; if (e.you) { if (m.voted !== undefined) return; m.voted = e.opt; } m.options[e.opt][1] += e.n || 1; L(s, 'POLL_VOTE', (e.you ? 'You voted ' : (e.n || 1) + ' votes for ') + m.options[e.opt][0], origin); break; }
      case 'OUTCOME': {
        let out = { title: e.title, stats: e.stats || [], notes: e.notes || [] };
        if (e.opp) { const p = O(s, e.opp), f = p && p.chosen && p.offers.find(x => x.sid === p.chosen);
          if (!f) out = { title: e.title, stats: [['0', 'households booked']], notes: ['No offer was accepted, so nothing was booked. The opportunity stays in memory for next time.'] };
          else { const n = p.filled || count(p), pr = priceFor(f, count(p)); out.stats = [[String(n), 'households served'], ['$' + p.base, 'typical single-unit price'], ['$' + pr, 'group price, ' + (s.suppliers[f.sid].biz || s.suppliers[f.sid].name)], ['$' + (n * (p.base - pr)).toLocaleString('en-US'), 'saved together (illustrative)'], ...(e.extra || [])]; } }
        s.outcomes.push(out); s.feed.push({ id: uid('oc'), kind: 'outcome', from: 'ai', ...out, ts, origin: 'sim' }); L(s, 'OUTCOME_RECORDED', out.title + ': ' + out.stats.map(x => x[0] + ' ' + x[1]).join(', '), 'sim'); break; }
      case 'SET': { const p = { ...e.patch }; if (p.lastSeenAgo !== undefined) { p.lastSeen = ctx.base - p.lastSeenAgo * 60000; delete p.lastSeenAgo; } Object.assign(s, p); break; }
    }
  }

  function build(cs, steps, idx, manual, base){
    const s = fresh(cs), ctx = { origin: 'scripted', base };
    (cs.init || []).forEach(e => ap(s, e, ctx));
    for (let k = 0; k <= idx; k++){
      s.step = k;
      manual.filter(m => m.at === k).forEach(m => m.evs.forEach(e => ap(s, e, { ...ctx, origin: m.origin || 'you' })));
      if (k < idx && steps[k]) { if (steps[k].focus) s.focus = steps[k].focus; steps[k].events.forEach(e => ap(s, e, ctx)); }
    }
    return s;
  }

  /* map sandbox state onto the shape the existing screens read */
  function toView(s, real, extra){
    const H = window.HOA, P = s.people;
    const feed = s.feed.map(m => ({ ...m, from: m.from === s.you ? 'You' : m.from === 'ai' ? 'Neighbors AI' : who(s, m.from), desk: m.from === 'ai', sim: m.origin !== 'you', body: m.body, d: new Date(m.ts), time: H.fmtTime(new Date(m.ts)) }));
    const suppliers = Object.values(s.suppliers).map(x => ({ id: x.id, name: x.biz || x.name, biz: x.biz ? x.name : '', trade: x.trade, recs: x.recs, phone: '', claimed: x.claimed, quotes: x.quotes.map(q => [q[0], q[1], new Date(Date.now() - q[2] * DAY)]), lastD: x.quotes[0] ? Date.now() - x.quotes[0][2] * DAY : null, sim: true }));
    const agent = [{ id: 'a0', text: 'Hi ' + (P[s.you] ? P[s.you][0] : '') + '! This is your private conversation with the AI. Ask about anything in the building.', ts: s.feed.length ? s.feed[0].ts - 1 : Date.now() }].concat((s.dm[s.you] || []).map(m => m.actions || m.title || m.draft ? { id: m.id, kind: 'nudge', ts: m.ts, title: m.title || 'Neighbors AI', body: m.text, draft: m.draft, actions: m.actions, done: m.done ? 'You chose: ' + m.done : null, scope: 'Private conversation with you', sim: true } : { id: m.id, ts: m.ts, me: !!m.me, text: m.text, origin: m.origin }));
    const groupDeals = s.opps.filter(o => o.kind === 'group').map(o => { const n = count(o), inn = o.participants.includes(s.you), f = o.chosen && o.offers.find(x => x.sid === o.chosen), best = o.offers.filter(x => x.status !== 'rejected').map(x => [priceFor(x, n), x]).filter(x => x[0] !== null).sort((a, b) => a[0] - b[0])[0];
      return { id: o.id, title: o.title, goal: o.goal || Math.max(n, 3), units: Array.from({ length: n }, (_, i) => inn && i === 0 ? 'You' : 'Neighbor'), status: o.status, provider: f ? (s.suppliers[f.sid].biz || s.suppliers[f.sid].name) : o.offers.length ? 'choosing' : 'not chosen yet',
        note: f ? '$' + priceFor(f, n) + ' per unit' + (o.filled ? ' · ' + o.filled + ' booked' : '') : best ? 'Best offer so far: $' + best[0] + ' per unit' : o.offers.length ? 'Offers need more units' : null, sim: true }; });
    return { ...real, me: { name: P[s.you] ? P[s.you][0] : 'You', unit: P[s.you] ? P[s.you][1] : '', role: 'resident', providerId: '' }, messages: feed, feed, items: s.items, events: s.events, bookings: [], localSups: [], localRecs: s.recs, localReqs: [], plus: {}, deals: {}, groupDeals, going: s.going, lastSeen: s.lastSeen, agent, agentTyping: false, suppliers, requests: [], aiLevel: 'helpful', sheet: { live: false, suppliers: [], at: Date.now() }, ...(extra || {}) };
  }

  return { build, toView, priceFor, minFor, count, who, nm };
})();
