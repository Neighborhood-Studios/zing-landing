/* Zing Neighbors App, Resident and Supplier pages (started from the Instinct version). window.ZPAGE picks the page. Modules and bot behavior come from window.ZCFG, set on the AI Control page. */
const { useState, useEffect, useRef } = React;
const H = window.HOA, AI = window.HOAI, SH = window.HOASheet;
const KEY = 'zingN.app.v1';
let UID = 1; const uid = () => 'x' + Date.now().toString(36) + (UID++);
const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
const short = t => t.length > 70 ? t.slice(0, 68) + '…' : t;
const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const nextDay = w => { const d = new Date(); if (!w || /soon/i.test(w)) return ymd(d); const k = DOW.indexOf(w.slice(0, 3).toLowerCase()); if (k < 0) return ymd(d); d.setDate(d.getDate() + ((k - d.getDay() + 7) % 7)); return ymd(d); };
const words = t => new Set(H.titleFrom(t).toLowerCase().split(/\W+/).filter(w => w.length >= 5));
const similar = (a, b) => { const A = words(a); return [...words(b)].some(w => A.has(w)); };
const ROLES = { resident: 'Resident', board: 'Board / HOA', admin: 'Admin', provider: 'Provider' };

const fresh = () => ({
  me: { name: '', unit: '', role: 'resident', providerId: '' }, sheetId: H.GROUP.sheetId,
  messages: [], items: [], events: [], bookings: [], localSups: [], localRecs: [], localReqs: [], plus: {}, deals: {}, groupDeals: [], reactions: {}, dms: {}, aiLevel: 'helpful', lastSeen: null, going: {}, reminded: {}, agentTyping: false,
  agent: [{ id: 'a0', text: "Hi! Ask me anything about the group: who neighbors recommend, what’s going on in the building, or what you missed. I can also help you book someone. Only you see this conversation.", ts: Date.now() }]
});
const load = () => { try { const t = localStorage.getItem(KEY); if (t) return { ...fresh(), ...JSON.parse(t), agentTyping: false }; } catch (e) {} return fresh(); };

/* merge sheet providers with recommendations made in this app */
function mergeSup(sheet, st){
  const base = (sheet ? sheet.suppliers : []).map(s => ({ ...s, quotes: s.quotes.slice() })).concat(st.localSups.map(s => ({ ...s, quotes: [] })));
  st.localRecs.forEach(r => { const s = base.find(x => x.id === r.sid); if (s) { s.recs += 1; s.quotes.unshift([r.who, r.quote, new Date(r.ts)]); } });
  const PR = window.ZPro ? window.ZPro.profiles() : {};
  base.forEach(s => { const p = PR[s.id]; if (!p || !p.done) return; s.claimed = true; if (p.services && p.services.length) s.services = p.services.join(', '); if (p.biz) s.biz = p.biz; if (p.hours) s.hours = p.hours; s.coi = !!(p.coi && p.coi.media); });
  (st.localWarns || []).forEach(w => { const s = w.sid && base.find(x => x.id === w.sid); if (s) s.warnings = (s.warnings ? s.warnings + ' · ' : '') + '“' + w.text + '” ' + String(w.who).split(' · ')[0]; });
  return base;
}

function apply(s, sups, actions, text, who){
  let { items, events, localSups, localRecs, localReqs } = s, localWarns = s.localWarns || []; const chips = [], reminders = [], ts = Date.now();
  actions.forEach(r => {
    if (r.type === 'rec'){ const x = sups.find(y => y.id === r.id); if (!x) return; localRecs = [...localRecs, { sid: x.id, who, quote: short(r.quote || text), ts }]; chips.push([x.name + ' · ' + x.trade + ' · ' + plural(x.recs + 1, 'rec'), 'suppliers', x.id]); }
    if (r.type === 'newrec' && r.name){ const nid = uid(), tr = H.TRADES.includes(r.trade) ? r.trade : (H.tradeOf(text) || 'Other');
      localSups = [...localSups, { id: nid, name: r.name, biz: '', trade: tr, recs: 0, phone: '', local: true, firstD: ts }]; localRecs = [...localRecs, { sid: nid, who, quote: short(r.quote || text), ts }];
      chips.push(['New provider: ' + r.name + ' · ' + tr, 'suppliers', nid]); }
    if (r.type === 'safety' || r.type === 'maint'){
      const cat = r.type === 'safety' ? 'Safety' : 'Maintenance';
      const ex = (r.match && items.find(i => i.id === r.match)) || items.find(i => i.cat === cat && !/fixed|resolved/i.test(i.status) && similar(i.title, text));
      let iid, n;
      if (ex){ iid = ex.id; n = (ex.reports || 1) + 1; items = items.map(i => i.id === iid ? { ...i, reports: n, fresh: true } : i); }
      else { iid = uid(); n = 1; items = [{ id: iid, cat, title: r.title || H.titleFrom(text), detail: text, by: who, reports: 1, status: cat === 'Safety' ? 'Flagged' : 'Open', ts, fresh: true }, ...items]; }
      chips.push(cat === 'Safety' ? ['Safety · flagged for the board', 'building', iid] : ['Maintenance · ' + plural(n, 'report'), 'building', iid]);
    }
    if (r.type === 'rule' && H.RULES[r.topic]){
      const R = H.RULES[r.topic], where = (r.where || H.whereOf(text) || '').toLowerCase();
      const ex = (r.match && items.find(i => i.id === r.match && i.cat === 'Rules')) || items.find(i => i.cat === 'Rules' && i.topic === r.topic && i.status !== 'Cleared' && (!where || !i.where || i.where === where));
      let iid, n;
      if (ex){ iid = ex.id; n = (ex.reports || 1) + 1; items = items.map(i => i.id === iid ? { ...i, reports: n, where: i.where || where, fresh: true } : i); }
      else { iid = uid(); n = 1; items = [{ id: iid, cat: 'Rules', topic: r.topic, where, title: R.label + (where ? ', ' + where : ''), detail: text, by: who, reports: 1, status: 'Reminder sent', ts, fresh: true }, ...items]; }
      chips.push(['Rule reminder · ' + R.label.toLowerCase() + ' · ' + plural(n, 'report'), 'building', iid]);
      if (n >= 3) chips.push(['Hotspot · flagged for the board', 'building', iid]);
      reminders.push(r.topic);
    }
    if (r.type === 'ops'){ const iid = uid(); items = [{ id: iid, cat: 'Operations', title: r.title || H.titleFrom(text), detail: r.when || '', by: who, status: 'On calendar', ts, fresh: true }, ...items]; chips.push(['Operations · on the calendar', 'building', iid]); }
    if (r.type === 'decision'){ const iid = uid(); items = [{ id: iid, cat: 'Decisions', title: r.title || H.titleFrom(text), detail: '', by: who, status: 'Decided', ts, fresh: true }, ...items]; chips.push(['Decision · on record', 'building', iid]); }
    if (r.type === 'event'){ const eid = uid(), w = (r.when || '').split('·').map(x => x.trim()); events = [{ id: eid, title: r.title || H.titleFrom(text), date: nextDay(w[0]), time: w[1] || '', where: r.where || '', by: who, going: 1, photos: [], ts, fresh: true }, ...events]; chips.push(['Event · added to the calendar', 'events', eid]); }
    if (r.type === 'warn'){ const x = r.id && sups.find(y => y.id === r.id), nm = x ? x.name : r.name || ''; localWarns = [...localWarns, { sid: x ? x.id : null, name: nm, trade: r.trade, text: short(r.quote || text), who, ts }]; chips.push(['Heads up noted' + (nm ? ' · ' + nm : ''), 'suppliers', x ? x.id : (H.TRADES.includes(r.trade) ? r.trade : null)]); }
    if (r.type === 'ask'){ const tr = H.TRADES.includes(r.trade) ? r.trade : 'Other', rid = uid(); localReqs = [{ id: rid, who, text, trade: tr, ts, answers: [] }, ...localReqs]; chips.push(['Request · ' + tr, 'suppliers', 'req:' + rid]); }
  });
  return { s: { ...s, items, events, localSups, localRecs, localReqs, localWarns }, chips, reminders };
}
const today = () => new Date().toDateString();
function remind(s, topics){
  const done = { ...(s.reminded || {}) }, add = [];
  topics.forEach(t => { if (done[t] === today()) return; done[t] = today(); add.push({ id: uid(), from: 'Neighbors app', desk: true, ts: Date.now(), fresh: true, text: 'A friendly reminder for everyone: ' + H.RULES[t].text + '. Thanks, neighbors!' }); });
  return add.length ? { ...s, reminded: done, messages: [...s.messages, ...add] } : s;
}

function App(){
  const [st, setSt] = useState(load);
  const [sheet, setSheet] = useState(() => SH.cached());
  const [sheetErr, setSheetErr] = useState(''); const [loading, setLoading] = useState(false);
  const [tab, setTabRaw] = useState(() => (location.hash.slice(1) || 'chat').split(':')[0]);
  const [target, setTarget] = useState(null);
  const [composer, setComposer] = useState(''); const [agentText, setAgentText] = useState('');
  const [unseen, setUnseen] = useState({}); const [toast, setToast] = useState(null);
  const [ask, setAsk] = useState(null); const [askQ, setAskQ] = useState(''); const [meOpen, setMeOpen] = useState(false);
  const [install, setInstall] = useState(null); const [aiAsk, setAiAsk] = useState(false); const [catchOpen, setCatchOpen] = useState(false);
  const stepRef = useRef(null); const eng = window.useEngine(stepRef);
  const [dm, setDm] = useState(null); const [persp, setPersp] = useState('resident'); const [follow, setFollow] = useState(true); const [supPick, setSupPick] = useState(null);
  const stRef = useRef(st); stRef.current = st; const tabRef = useRef(tab); tabRef.current = tab;
  useEffect(() => { const t = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify({ ...st, agentTyping: false })); } catch (e) {} }, 300); return () => clearTimeout(t); }, [st]);

  const refresh = async () => { setLoading(true); try { setSheet(await SH.load(stRef.current.sheetId)); setSheetErr(''); } catch (e) { console.warn('Sheet', e); setSheetErr(String(e.message || e)); } setLoading(false); };
  useEffect(() => { refresh(); const iv = setInterval(refresh, 10 * 60 * 1000); return () => clearInterval(iv); }, [st.sheetId]);
  useEffect(() => { const h = e => { e.preventDefault(); setInstall(e); }; window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h); }, []);

  const suppliers = mergeSup(sheet, st);
  const requests = [...(sheet ? sheet.requests : []), ...st.localReqs.map(r => ({ ...r, d: new Date(r.ts) }))].sort((a, b) => b.d - a.d);
  const feed = [...(sheet ? sheet.feed : []), ...st.messages.map(m => ({ ...m, d: new Date(m.ts) }))].sort((a, b) => a.d - b.d).map(m => ({ ...m, time: H.fmtTime(m.d) }));
  const view = { ...st, suppliers, requests, feed, messages: feed, sheet };
  const viewRef = useRef(view); viewRef.current = view;
  const myName = () => { const m = stRef.current.me; return (m.name || 'You') + (m.unit ? ' · ' + m.unit : ''); };
  const role = st.me.role, canManage = role === 'board' || role === 'admin';

  const setTab = t => { if (t === 'chat' && tabRef.current === 'chat') setDm(null); setTabRaw(t); setUnseen(u => ({ ...u, [t]: 0 })); try { history.replaceState(null, '', '#' + t); } catch (e) {} };
  const go = (t, id) => { if (t === 'events') t = 'building'; setTab(t); setTarget(id); clearTimeout(go.t); go.t = setTimeout(() => setTarget(null), 3000); };
  const bump = tabs => setUnseen(u => { const n = { ...u }; tabs.map(t => t === 'events' ? 'building' : t).forEach(t => { if (t !== tabRef.current) n[t] = (n[t] || 0) + 1; }); return n; });
  const flash = (text, t, id) => { setToast({ text, t, id }); clearTimeout(flash.t); flash.t = setTimeout(() => setToast(null), 3600); };
  const upd = f => setSt(s => ({ ...s, ...f(s) }));
  const react = (mid, e) => upd(s => { const r = { ...(s.reactions || {}) }, cur = { ...(r[mid] || {}) }, had = (cur[e] || []).includes('You');
    Object.keys(cur).forEach(k => { cur[k] = cur[k].filter(w => w !== 'You'); if (!cur[k].length) delete cur[k]; }); if (!had) cur[e] = [...(cur[e] || []), 'You']; r[mid] = cur; return { reactions: r }; });
  const sendDM = (k, text, opt = {}) => upd(s => ({ dms: { ...(s.dms || {}), [k]: [...((s.dms || {})[k] || []), { id: uid(), from: 'You', text, ts: Date.now(), fresh: true, ...(opt.att || {}), replyTo: opt.replyTo }] } }));

  const post = m => { const id = m.id || uid(); setSt(s => ({ ...s, messages: [...s.messages, { from: 'Neighbors AI', ts: Date.now(), fresh: true, sim: true, ...m, id }] })); return id; };
  const setMsg = (id, p) => upd(s => ({ messages: s.messages.map(m => m.id === id ? { ...m, ...p } : m) }));
  const privAnswer = async (text, v0) => {
    const v = v0 || viewRef.current, tr = H.tradeOf(text);
    if (tr){ const picks = window.zTop(v, tr); if (!picks.length) return { answer: 'Nobody in the group has recommended a ' + tr.toLowerCase() + ' yet. Neighbors may answer you here.' };
      return { lead: 'From the group’s memory: the ' + (picks.length === 1 ? tr.toLowerCase() + ' neighbors recommend' : picks.length + ' ' + tr.toLowerCase() + ' picks neighbors recommend most') + (/\$|cheap|afford|fortune|price|expensive/i.test(text) ? '. Price notes are included where neighbors shared them.' : '.'), picks: picks.map(x => x.id) }; }
    const hit = v.items.filter(i => similar(i.title, text)).sort((a, b) => b.ts - a.ts)[0];
    if (hit) return { answer: hit.title + ': ' + hit.status.toLowerCase() + '.' + (hit.reports > 1 ? ' ' + hit.reports + ' neighbors reported it.' : '') };
    if (AI.on()){ const r = await AI.ask(text, v); return { answer: r.answer, cites: r.cites }; }
    return { answer: 'I couldn’t find anything about that in the group’s memory yet.' };
  };
  const send = async (text, opt = {}) => {
    const id = uid(), who = myName(), tagged = /@ai\b/i.test(text), B = window.ZCFG.get().bot, wantAI = zOn('askAI') && B.trigger !== 'off' && (opt.ai || tagged) && !!text, ct = opt.att && opt.att.type === 'contact' ? opt.att.contact : null, sortText = text || (ct ? 'Shared a contact: ' + ct.name + (ct.phone ? ', ' + ct.phone : '') : '');
    setSt(s => ({ ...s, messages: [...s.messages, { id, from: 'You', text, ts: Date.now(), fresh: true, pending: true, sim: opt.sim, ...(opt.att || {}), replyTo: opt.replyTo }] }));
    if (wantAI){ const pid = uid(); setTimeout(() => setSt(s => ({ ...s, messages: [...s.messages, { id: pid, kind: 'priv', from: 'Neighbors AI', ts: Date.now(), loading: true, sim: opt.sim }] })), 50); privAnswer(text).then(r => setTimeout(() => setMsg(pid, { ...r, loading: false }), 900)); }
    if (!sortText || B.trigger === 'off' || (B.trigger === 'tagged' && !tagged && !opt.ai)) { setMsg(id, { pending: false }); if (sortText) ZLog.add({ id, ts: Date.now(), from: who, text: sortText, topic: 'skipped', reason: B.trigger === 'off' ? 'Bot is off' : 'Not tagged @AI' }); return; }
    const pk = m => m && { from: m.from, text: m.text, topic: m.topic, item: ((m.chips || []).find(c => c[1] === 'building') || [])[2] };
    const F = viewRef.current.feed, parent = opt.replyTo ? F.find(m => m.id === opt.replyTo) : null;
    const recent = F.filter(m => m.id !== id && m.topic && Date.now() - (+m.d || m.ts) < 30 * 60000).slice(-3);
    const r = await AI.sort(sortText, who, viewRef.current, { parent: pk(parent), recent: recent.map(pk) }), det = zDetect(r);
    r.actions = det.actions.filter(x => zAllows(x.type));
    ZLog.add({ id, ts: Date.now(), from: who, text: sortText, topic: det.topic, sub: det.off ? det.off + ' (switched off)' : r.sub, reason: r.reason, ai: r.ai, conf: r.conf, actions: r.actions.map(x => x.type) });
    setSt(s => { const { s: n, chips, reminders } = apply(s, viewRef.current.suppliers, r.actions, sortText, who); if (chips.length) bump([...new Set(chips.map(c => c[1]))]);
      return remind({ ...n, messages: n.messages.map(m => m.id === id ? { ...m, pending: false, chips, ai: r.ai, topic: det.topic, sub: r.sub, reason: r.reason } : m) }, zOn('rules') && B.publicPosts !== 'never' ? reminders : []); });
  };

  /* records */
  const addItem = (cat, title, detail) => { const id = uid(); upd(s => ({ items: [{ id, cat, title, detail, by: myName(), reports: 1, ts: Date.now(), fresh: true, status: { Maintenance: 'Open', Safety: 'Flagged', Rules: 'Reminder sent', Operations: 'On calendar', Decisions: 'Decided' }[cat] }, ...s.items] })); go('building', id); };
  const setItem = (id, patch) => upd(s => ({ items: s.items.map(i => i.id === id ? { ...i, ...patch, fresh: false } : i) }));
  const delItem = id => upd(s => ({ items: s.items.filter(i => i.id !== id) }));
  const plusOne = id => upd(s => s.plus[id] ? {} : ({ plus: { ...s.plus, [id]: 1 }, items: s.items.map(i => i.id === id ? { ...i, reports: (i.reports || 1) + 1 } : i) }));
  const addEvent = e => { const id = uid(); upd(s => ({ events: [{ id, ...e, by: myName(), going: 1, photos: [], ts: Date.now(), fresh: true }, ...s.events], going: { ...s.going, [id]: 1 } })); go('events', id); };
  const delEvent = id => upd(s => ({ events: s.events.filter(e => e.id !== id) }));
  const toggleGoing = id => upd(s => { const on = !s.going[id]; const g = { ...s.going }; if (on) g[id] = 1; else delete g[id]; return { going: g, events: s.events.map(e => e.id === id ? { ...e, going: Math.max(0, e.going + (on ? 1 : -1)) } : e) }; });
  const addPhoto = (id, file) => { const img = new Image(), r = new FileReader(); r.onload = () => { img.onload = () => { const k = Math.min(1, 900 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = img.width * k; c.height = img.height * k; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const src = c.toDataURL('image/jpeg', .72); upd(s => ({ events: s.events.map(e => e.id === id ? { ...e, photos: [...e.photos, { src, by: myName() }] } : e) })); }; img.src = r.result; }; r.readAsDataURL(file); };
  const recommend = (sid, quote) => { upd(s => ({ localRecs: [...s.localRecs, { sid, who: myName(), quote: quote || 'Recommended in the app', ts: Date.now() }] })); flash('Thanks! Your recommendation is saved', 'suppliers', sid); };
  const addProvider = p => { const id = uid(); upd(s => ({ localSups: [...s.localSups, { id, ...p, recs: 0, local: true, firstD: Date.now() }], localRecs: [...s.localRecs, { sid: id, who: myName(), quote: p.quote || 'Added in the app', ts: Date.now() }] })); go('suppliers', id); };

  /* agent + bookings */
  const agentSay = (msg, delay = 600) => new Promise(res => { upd(() => ({ agentTyping: true })); setTimeout(() => { setSt(s => ({ ...s, agentTyping: false, agent: [...s.agent, { id: uid(), ts: Date.now(), ...msg }] })); res(); }, delay); });
  const me = text => upd(s => ({ agent: [...s.agent, { id: uid(), me: true, text, ts: Date.now() }] }));
  const days = () => Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); });
  const askAgent = async text => {
    me(text); upd(() => ({ agentTyping: true }));
    if (/miss|catch.?up|what happened|this week|while i was/i.test(text)) { setCatchOpen(true); return agentSay({ text: 'I put together what happened since you were last here. It’s open now, and you can reopen it anytime.', catchup: true }, 400); }
    const hit = stRef.current.items.filter(i => similar(i.title, text)).sort((a, b) => b.ts - a.ts)[0];
    if (hit && /fix|status|happen|update|still|broken|done/i.test(text)) { const lg = hit.log && hit.log[hit.log.length - 1];
      return agentSay({ text: hit.title + ': ' + hit.status + '.' + (hit.reports > 1 ? ' ' + hit.reports + ' neighbors reported it.' : '') + (lg ? ' Latest, ' + (x => /^(Today|Yesterday)$/.test(x) ? x.toLowerCase() : x)(H.fmtDay(new Date(lg[0]))) + ': ' + lg[1] : ''), item: hit.id }, 500); }
    if (/event|weekend|party|happening|plans/i.test(text)) { const t0 = new Date(); t0.setHours(0, 0, 0, 0); const evs = stRef.current.events.filter(e => { const d = H.parseDate(e.date); return d && d >= t0; }).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
      return agentSay({ text: evs.length ? 'Coming up in the building:' : 'Nothing is planned yet. When neighbors start planning something in the chat, I’ll pick it up.', evs: evs.map(e => e.id) }, 500); }
    upd(() => ({ lastNeed: text.split(/\s+/).length >= 4 && !/^book\b/i.test(text) ? text.slice(0, 140) : '' }));
    const S = viewRef.current.suppliers, it = await AI.intent(text, viewRef.current);
    const named0 = it.supplierId && S.find(x => x.id === it.supplierId), named = named0 && text.toLowerCase().includes(named0.name.split(/[ (]/)[0].toLowerCase()) ? named0 : null;
    if (named) return agentSay({ sid: named.id, text: 'When should ' + named.name.split(' ')[0] + ' come?', days: days() }, 300);
    const tr = H.TRADES.includes(it.trade) ? it.trade : null;
    if (!tr && AI.on()) { const r = await AI.ask(text, viewRef.current); return agentSay({ text: r.answer }, 200); }
    if (!tr) return agentSay({ text: it.reply || 'Tell me the kind of help you need, like a plumber, a cleaner or an AC tech.' }, 300);
    const top = S.filter(x => x.trade === tr && !x.warnings).sort((a, b) => b.recs - a.recs).slice(0, 3);
    if (!top.length) return agentSay({ text: 'Nobody in the group has recommended a ' + tr.toLowerCase() + ' yet. Ask in the group chat and the bot will pick up the answers.' }, 300);
    window.ZPro.seedDemo(S);
    const near = zOn('providerVisits') ? window.ZPro.nearby(H.GROUP.name, tr, 7).filter(v => S.some(x => x.id === v.sid)).slice(0, 3) : [];
    if (near.length) { const ns = [...new Set(near.map(v => v.name))], ds = [...new Set(near.map(v => zDayIn(v.date)))];
      await agentSay({ text: (ns.length === 1 ? ns[0] + ', recommended by neighbors, will' : zList(ns) + ', all recommended by neighbors, will') + ' already be in ' + (window.ZPro.areaOf(H.GROUP.name) || 'the building') + ' ' + zList(ds) + '. Booking one of their openings is usually quicker, since they’re in the area anyway. Want one of these?', visits: near.map(v => v.id) }, 300); }
    agentSay({ text: near.length ? 'Or pick any of the ' + tr.toLowerCase() + ' picks neighbors recommend most:' : (top.length === 1 ? 'This is the ' + tr.toLowerCase() + ' your neighbors recommended.' : 'These are the ' + top.length + ' ' + tr.toLowerCase() + ' picks your neighbors recommend most.') + ' Who should I reach out to?', options: top.map(x => x.id) }, 300);
  };
  const mark = (mid, v) => upd(s => ({ agent: s.agent.map(m => m.id === mid ? { ...m, picked: v } : m) }));
  const sup = id => viewRef.current.suppliers.find(x => x.id === id);
  const availAsk = s => ({ sid: s.id, text: 'When are you free for ' + s.name.split(' ')[0] + '? Tap every time that works. I’ll only offer them these.', avail: true });
  const pick = (mid, sid) => { mark(mid, sid); const s = sup(sid); me(s.name); agentSay(availAsk(s)); };
  window.zSupById = id => sup(id);
  const pickAvail = (mid, slots) => { mark(mid, slots); me(window.zAvText(slots, true)); const m = stRef.current.agent.find(y => y.id === mid);
    if (!stRef.current.me.access) return agentSay({ sid: m.sid, slots, text: 'How should ' + sup(m.sid).name.split(' ')[0] + ' get in? I’ll remember this for next time.', access: window.ZACCESS });
    proceed(m.sid, slots); };
  const pickAccess = (mid, a) => { mark(mid, a); me(a); upd(s => ({ me: { ...s.me, access: a } })); const m = stRef.current.agent.find(y => y.id === mid); setTimeout(() => proceed(m.sid, m.slots), 50); };
  const pickDay = (mid, d) => { mark(mid, d); me(d); const m = stRef.current.agent.find(y => y.id === mid); agentSay({ sid: m.sid, day: d, text: 'What time of day?', wins: ['Morning', 'Afternoon', 'Evening', 'Any time'] }); };
  const waText = (s, when) => { const m = stRef.current.me; return 'Hi ' + s.name.split(' ')[0] + '! I got your number from my neighbors in the ' + H.GROUP.name + ' group. Are you available ' + when.toLowerCase().replace(/^today/, 'today').replace(/^tomorrow/, 'tomorrow') + '?' + (m.unit ? ' I’m in unit ' + m.unit + '.' : '') + (m.name ? ' Thanks, ' + m.name.split(' ')[0] : ' Thanks!'); };
  const waLink = (s, when) => s.phone ? 'https://wa.me/' + H.waNum(s.phone) + '?text=' + encodeURIComponent(waText(s, when)) : null;
  const pickWin = (mid, w) => { mark(mid, w); me(w); const m = stRef.current.agent.find(y => y.id === mid); proceed(m.sid, null, m.day + (w === 'Any time' ? '' : ' ' + w.toLowerCase()), m.day, w); };
  const proceed = async (sid, slots, when0, day0, win0) => {
    const s = sup(sid), f0 = window.zFirstFuture(slots);
    const when = when0 || window.zAvText(slots), m = { day: day0 || (f0 ? f0.label : 'Tomorrow') }, w = win0 || (f0 ? f0.win : 'Any time');
    const bid = uid();
    const viaSms = zOn('smsBooking') && !!s.phone && !(stRef.current.smsOptOut || {})[s.id];
    upd(x => ({ bookings: [{ id: bid, sid: s.id, name: s.name, trade: s.trade, when, day: m.day, win: w, slots: slots || null, access: x.me.access || '', need: x.lastNeed || '', unit: x.me.unit, by: myName(), status: viaSms ? 'Draft' : 'Requested', ts: Date.now() }, ...x.bookings] })); bump(['building']);
    if (viaSms) return agentSay({ text: 'Want Zing to text ' + s.name.split(' ')[0] + ' for you? I’ll ask about ' + when.replace(/^(Today|Tomorrow)\b/, x => x.toLowerCase()) + ' and bring back their answer. Your name and unit stay private until you say yes.', bid, acts: [['Have Zing text them', 'sms'], ['I’ll text them myself', 'self']] });
    await agentSay(s.phone ? { text: 'I wrote a message to ' + s.name + ' for ' + when.replace(/^(Today|Tomorrow)\b/, x => x.toLowerCase()) + '. Tap below to open it in WhatsApp and send it. When they reply, mark the booking here.', wa: waLink(s, when), bid }
      : { text: 'There’s no phone number for ' + s.name + ' in the directory yet.' + (s.other ? ' Other contact: ' + s.other + '.' : '') + ' I saved the booking so you can track it.', bid });
    flash('Booking saved · ' + s.name, 'building', bid);
  };
  const setBooking = (bid, status) => { upd(s => ({ bookings: s.bookings.map(b => b.id !== bid ? b : status === 'Confirmed' && !b.start ? { ...b, status, ...window.zStartFrom(b.when, b.slots, b.win) } : { ...b, status }) }));
    const b = stRef.current.bookings.find(x => x.id === bid); if (b && status === 'Done' && role !== 'provider') { setTab('agent'); agentSay({ text: 'How did it go with ' + b.name + '? Your answer counts toward their recommendations.', feedback: true, sid: b.sid }); } };
  const rate = (mid, k) => { mark(mid, k); me(k === 'good' ? 'It went great' : 'Not great'); const m = stRef.current.agent.find(y => y.id === mid);
    if (k === 'good'){ upd(s => ({ localRecs: [...s.localRecs, { sid: m.sid, who: myName(), quote: 'Booked through the app, it went great', ts: Date.now() }] })); bump(['suppliers']); agentSay({ text: 'Thanks! I added your recommendation.' }); }
    else agentSay({ text: 'Sorry to hear that. Next time I’ll suggest someone else first.' + (canManage ? '' : ' If it’s worth a warning, tell the group so the bot records it.') }); };
  const bookFrom = sid => { setTab('agent'); upd(() => ({ lastNeed: '' })); setTimeout(() => { const s = sup(sid); me('Book ' + s.name); agentSay(availAsk(s)); }, 200); };

  const runAsk = async q => { if (!q.trim()) return; setAsk({ q, loading: true }); const r = await AI.ask(q, viewRef.current); setAsk({ q, ...r }); };
  const resetLocal = () => { if (!confirm('Erase everything saved on this device (posts, bookings, events, building log)? The directory from the sheet stays.')) return; try { localStorage.removeItem(KEY); } catch (e) {} if (window.ZMedia) window.ZMedia.clear(); setDm(null); setSt(fresh()); setTabRaw('chat'); setAsk(null); setMeOpen(false); };
  const exportData = () => { const b = new Blob([JSON.stringify(stRef.current, null, 2)], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'zing-neighbors-backup-' + ymd(new Date()) + '.json'; a.click(); };
  const importData = file => { const r = new FileReader(); r.onload = () => { try { const o = JSON.parse(r.result); setSt({ ...fresh(), ...o }); flash('Backup restored', 'chat'); } catch (e) { alert('That file isn’t a Zing Neighbors backup.'); } }; r.readAsText(file); };

  const joinDeal = id => { const was = !!(stRef.current.deals || {})[id]; upd(s => { const d = { ...(s.deals || {}) }; if (d[id]) delete d[id]; else d[id] = 1; return { deals: d }; }); if (!was) flash('You’re on the list. We’ll reach out once enough neighbors join.', 'suppliers'); };
  const SC = window.ZScenarios({ post, setMsg, upd, uid, go, bump, send, view: () => viewRef.current, openCatch: () => setCatchOpen(true) });
  const resetDemo = () => { upd(s => ({ messages: s.messages.filter(m => !m.sim), items: s.items.filter(i => !i.sim), events: s.events.filter(e => !e.sim), localRecs: s.localRecs.filter(r => !r.sim), localSups: s.localSups.filter(x => !x.sim), localReqs: s.localReqs.filter(r => !r.sim), groupDeals: [], lastSeen: null })); setTab('chat'); flash('Demo content cleared', 'chat'); };
  const joinGroupDeal = gid => upd(s => ({ groupDeals: (s.groupDeals || []).map(g => g.id !== gid ? g : g.units.includes('You') ? { ...g, units: g.units.filter(u => u !== 'You') } : { ...g, units: ['You', ...g.units] }) }));
  const addBring = (eid, what) => upd(s => ({ events: s.events.map(e => e.id === eid ? { ...e, bring: [...(e.bring || []), [myName(), what]] } : e) }));
  window.usePoolEngine(() => viewRef.current.suppliers);
  const SB = window.useSmsBooking({ stRef, upd, agentSay, flash, uid, sup, waLink, suppliers: () => viewRef.current.suppliers });
  const agentAct = (mid, k) => { const m = stRef.current.agent.find(y => y.id === mid); if (!m || m.picked) return; mark(mid, k); const x = (m.acts || []).find(y => y[1] === k); me(x ? x[0] : k); SB.act(m.bid, k); };
  const bookVisit = (v, need) => { const m = stRef.current.me, r = window.ZPro.bookVisit(v.id, { unit: m.unit || '', name: m.name || '', need });
    if (!r) return flash('That visit just filled up.', 'building');
    const when = zDayLabel(v.date) + ' ' + v.win.toLowerCase(), bid = uid(), left = r.slots - r.booked.length;
    const vd = window.HOA.parseDate(v.date) || new Date(), hh = (window.ZWIN_H[v.win] || [9, 12])[0]; vd.setHours(hh, 0, 0, 0);
    upd(x => ({ bookings: [{ id: bid, sid: v.sid, name: v.name, trade: v.trade, when, unit: m.unit, by: myName(), status: 'Confirmed', visit: v.id, start: +vd, end: +vd + 3 * 3600e3, exact: false, access: m.access || '', ts: Date.now() }, ...x.bookings] }));
    window.ZSMS.send('v_' + v.id, { sid: v.sid, provider: v.name, phone: v.phone }, 'Zing here: ' + (m.unit ? 'unit ' + m.unit : 'a neighbor') + (m.name ? ' (' + m.name + ')' : '') + ' booked one of your openings at ' + v.building + ', ' + when + (need ? ': “' + need + '”' : '') + '. ' + (left ? left + (left === 1 ? ' opening' : ' openings') + ' left.' : 'You’re fully booked for that visit.'));
    flash('Booked · ' + v.name + ', ' + when, 'building', bid); };
  const bookNearby = (mid, v) => { mark(mid, v.id); me(v.name + ', ' + zDayLabel(v.date) + ' ' + v.win.toLowerCase()); bookVisit(v, stRef.current.lastNeed || ''); agentSay({ text: 'Booked. I texted ' + v.name.split(' ')[0] + ' your unit' + (stRef.current.lastNeed ? ' and what you need' : '') + '. They’ll come ' + (l => /^To/.test(l) ? l.toLowerCase() : 'on ' + l)(zDayLabel(v.date)) + ', ' + v.win.toLowerCase() + '. You pay them directly.' }); };
  const act = { agentAct, bookVisit, bookNearby, pickAvail, pickAccess, send, react, sendDM, toast: t => flash(t, 'chat'), joinDeal, joinGroupDeal, addBring, nudge: SC.nudge, openCatch: () => setCatchOpen(true), doneCatch: () => upd(() => ({ lastSeen: null })), go, ask: askAgent, pick, pickDay, pickWin, rate, bookFrom, setBooking, openAsk: () => { setAsk({}); setAskQ(''); }, openMe: () => setMeOpen(true),
    addItem, setItem, delItem, plusOne, addEvent, delEvent, toggleGoing, addPhoto, recommend, addProvider, vote: () => {}, claim: () => {}, addOpening: () => {} };
  const [, setCv] = useState(0); useEffect(() => window.ZCFG.subscribe(() => setCv(x => x + 1)), []); useEffect(() => window.ZPro.subscribe(() => setCv(x => x + 1)), []);
  const V = zApplyBot(eng.sim ? window.ZEngine.toView(eng.sim, st, { typing: eng.typing }) : view, st.aiLevel);
  if (eng.sim) Object.assign(act, window.zSimAct(eng, V, { flash, privAnswer }));
  stepRef.current = s => { if (s.go) go(s.go[0], s.go[1]); else if (s.tab) setTab(s.tab); if (s.ui === 'catchup') setCatchOpen(true); if (s.focus) setSupPick(null); };
  const pickCase = k => { eng.select(k); setSupPick(null); setCatchOpen(false); setTab('chat'); };
  const ui = { dm, setDm, aiAsk, setAiAsk, composer, setComposer, agentText, setAgentText, target, role, canManage, loading, sheetErr };
  const tabX = zTabOn(role === 'provider')([tab]) ? tab : 'chat', PAGE = window.ZPAGE || 'resident';
  const Screen = { chat: ChatScreen, suppliers: SuppliersScreen, events: EventsScreen, building: BuildingScreen, agent: AgentScreen, jobs: JobsScreen }[tabX === 'agent' && role === 'provider' ? 'jobs' : tabX] || ChatScreen;
  const aiOn = AI.on(), status = loading ? 'Updating from the sheet…' : sheet ? (sheet.live ? 'Live' : 'Saved copy') + ' · ' + plural(sheet.suppliers.length, 'provider') + ' · updated ' + H.fmtTime(sheet.at) : sheetErr ? 'Couldn’t reach the sheet' : 'Loading…';
  return <div className="stage">
    <aside className="intro">
      <span className="eyebrow">Zing Neighbors · {PAGE === 'supplier' ? 'Supplier' : 'Resident'}</span>
      <h1 style={{ fontSize: 30 }}>{PAGE === 'supplier' ? 'What a recommended provider sees.' : 'The group chat, with a memory.'}</h1>
      <StudioPanel eng={{ ...eng, select: pickCase, restart: () => pickCase(eng.key) }} persp={PAGE} />
      <span className={'aistat' + (sheet && sheet.live ? ' on' : '')}>● {eng.key ? 'Use case running in a sandbox. Your real data is untouched.' : status + ' · ' + (aiOn ? 'AI on' : 'AI off, keyword rules') + ' · bot reads ' + ({ every: 'every message', tagged: 'only @AI', off: 'nothing' })[window.ZCFG.get().bot.trigger]}</span>
      <div className="ctas">{PAGE === 'resident' && !eng.key && <button className="btn ghost" onClick={() => setMeOpen(true)}>You: {ROLES[role]}</button>}{install && <button className="btn ghost" onClick={() => { install.prompt(); setInstall(null); }}>Install app</button>}<a className="btn ghost" href={zPageHref('ai')}>AI Control</a></div>
    </aside>
    <div className="phone">
      {PAGE === 'supplier' ? <div className="screen">{zOn('supplierPortal') ? <SupplierApp sim={eng.sim} real={view} pick={supPick} setPick={setSupPick} act={act} /> : <div className="scr"><Header title="Supplier portal" sub="Module off" /><div className="list"><p className="empty">The supplier portal is turned off. Turn it on in AI Control.</p></div></div>}{toast && <button className="toast" onClick={() => setToast(null)}><Ico d={I.check} s={16} />{toast.text}</button>}</div> : <div className="screen">
        <Screen st={V} act={act} ui={ui} />
        {toast && <button className="toast" onClick={() => { go(toast.t, toast.id); setToast(null); }}><Ico d={I.check} s={16} />{toast.text}<b>View</b></button>}
        {ask && <Sheet onClose={() => setAsk(null)}>
          <h3>Ask the group</h3><span className="meta">Answers come from the group chat and the app’s records.</span>
          <div className="askrow"><input value={askQ} onChange={e => setAskQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && runAsk(askQ)} placeholder="Who do neighbors use for AC?" aria-label="Ask the group" autoFocus /><button className="sendb" aria-label="Ask" onClick={() => runAsk(askQ)}><Ico d={I.send} s={19} /></button></div>
          {!ask.q && <div className="sugg flat">{['Who do neighbors use for AC?', 'Is there a good plumber?', 'What’s happening this weekend?', 'Any open maintenance issues?'].map(x => <button key={x} onClick={() => { setAskQ(x); runAsk(x); }}>{x}</button>)}</div>}
          {ask.loading && <div className="ansb"><span className="dots"><i></i><i></i><i></i></span></div>}
          {ask.answer && <div className="ansb"><span className="lbl" style={{ marginTop: 0, color: 'var(--or)' }}>Answer</span><p>{ask.answer}</p>
            {ask.cites && ask.cites.length > 0 && <div className="cites">{ask.cites.map(id => { const m = feed.find(x => x.id === id); return m && <button key={id} onClick={() => { setAsk(null); go('chat', id); }}><b>{m.from} · {H.fmtDay(m.d)}</b>{short(m.text)}</button>; })}</div>}</div>}
        </Sheet>}
        {catchOpen && <CatchUpSheet view={V} since={V.lastSeen || Date.now() - 3 * 864e5} act={act} onClose={() => setCatchOpen(false)} />}
        {meOpen && <MeSheet aiLevel={st.aiLevel || 'helpful'} setAiLevel={v => upd(() => ({ aiLevel: v }))} st={view} ui={ui} status={status} aiOn={aiOn} install={install} onClose={() => setMeOpen(false)}
          setMe={p => upd(s => ({ me: { ...s.me, ...p } }))} setSheetId={id => upd(() => ({ sheetId: id }))} refresh={refresh} resetLocal={resetLocal} exportData={exportData} importData={importData}
          doInstall={() => { install.prompt(); setInstall(null); }} />}
        <Tabs tab={tabX} setTab={setTab} badges={unseen} provider={role === 'provider'} />
      </div>}
    </div>
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
