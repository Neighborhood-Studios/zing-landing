/* Zing Neighbors App: the provider side. A conversational profile (no forms), insurance and licenses when they matter,
   announced visits ("I'll be in the building Tuesday morning"), and the texts from Zing.
   Visits target a neighborhood (Coconut Grove) or a building. Residents only see them when they look for that trade, in the directory or by asking the agent. */
const { useState: pS, useEffect: pE, useRef: pR } = React;
const NO_COI = /Dog walker|Pet care|Babysitter|Tutor|Beauty|Fitness|Medical|Legal/;
const PWINS = ['Morning', 'Afternoon', 'Evening', 'All day'];
const zDays = n => Array.from({ length: n || 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return { ymd: window.ZPro.ymd(d), label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'long' }), short: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }; });
const zDayLabel = ymd => { const d = zDays(7).find(x => x.ymd === ymd); if (d) return d.label; const p = window.HOA.parseDate(ymd); return p ? p.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ymd; };
const zList = a => a.length < 2 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
const zTrade = (t, n) => { const m = { 'AC / HVAC': ['AC tech', 'AC techs'], 'Handyman': ['handyman', 'handymen'] }[t]; return m ? m[n === 1 ? 0 : 1] : /[A-Z]{2}/.test(t) ? t + (n === 1 ? ' provider' : ' providers') : t.toLowerCase() + (n === 1 ? '' : 's'); };
function proPlace(t){ const Z = window.ZPro, lo = String(t).toLowerCase(), b = Z.BUILDINGS().find(x => lo.includes(x.name.toLowerCase()));
  if (b) return b.name; const a = Z.AREAS().find(x => lo.includes(x.name.toLowerCase()) || x.alias.test(t)); return (a || Z.AREAS()[0]).name; }
const zDayIn = ymd => { const l = zDayLabel(ymd); return /^(Today|Tomorrow)$/.test(l) ? l.toLowerCase() : l; };
function useProStore(){ const [, setV] = pS(0); pE(() => window.ZPro.subscribe(() => setV(x => x + 1)), []); }

/* ---- understanding what the provider writes ---- */
function proTradesKw(text){ const H = window.HOA, out = []; String(text).split(/[,.;]|\band\b|\balso\b/i).concat(text).forEach(c => { const t = H.tradeOf(c); if (t && !out.includes(t)) out.push(t); }); return out; }
function proServicesKw(text){
  const not = [], svc = [], trades = window.HOA.TRADES.map(t => t.toLowerCase());
  String(text).replace(/[’‘]/g, "'").split(/[,.;!\n]|\band\b|\balso\b|\bplus\b/i).map(x => x.trim()).filter(Boolean).forEach(x => {
    if (/\b(don'?t|do not|no longer|never|won'?t)\b/i.test(x)) { const r = x.replace(/^.*?\b(don'?t|do not|no longer|never|won'?t)\b\s*(do|take|handle)?\s*/i, '').trim(); if (r) not.push(r.toLowerCase()); return; }
    const c = x.replace(/^(i'?m|i am|we'?re|we are)\s+(a|an)\s+/i, '').replace(/^(i|we)\s+(mostly\s+|mainly\s+|usually\s+)?(do|fix|handle|install|repair|offer|can do|can)\s+/i, '').replace(/^(mostly|mainly|lots of|a lot of)\s+/i, '').trim();
    if (c.length >= 3 && c.length <= 48 && !/^(hi|hello|hey|thanks|yes|no)\b/i.test(c) && !trades.includes(c.toLowerCase()) && !/^(condos?|homes?|apartments?|houses?)$/i.test(c)) svc.push(c.toLowerCase()); });
  return { services: [...new Set(svc)].slice(0, 8), not: [...new Set(not)].slice(0, 5) };
}
async function proAsk(system, user){
  if (!(window.HOAI && window.HOAI.on())) return null;
  try { const raw = await window.claude.complete({ system, max_tokens: 400, messages: [{ role: 'user', content: user }] }); return JSON.parse(String(raw).match(/\{[\s\S]*\}/)[0]); } catch (e) { return null; }
}
async function proExtract(text){
  const H = window.HOA, r = await proAsk('Extract a service provider\'s profile from what they wrote about their work. Return ONLY JSON {"trades":[categories from this list only: ' + H.TRADES.join(', ') + '],"services":["short lowercase phrases, max 8"],"not":["things they said they do not do"]}', text);
  if (r && Array.isArray(r.trades)) return { trades: r.trades.filter(t => H.TRADES.includes(t)), services: (r.services || []).slice(0, 8), not: (r.not || []).slice(0, 5) };
  return { trades: proTradesKw(text), ...proServicesKw(text) };
}
function proVisitKw(text){
  const t = String(text), days = zDays(7), lo = t.toLowerCase();
  let ds = days.filter((d, i) => i === 0 ? /\btoday\b/.test(lo) : i === 1 ? /\btomorrow\b/.test(lo) || new RegExp('\\b' + new Date(Date.now() + 864e5).toLocaleDateString('en-US', { weekday: 'long' }).slice(0, 3).toLowerCase()).test(lo) : new RegExp('\\b' + d.label.toLowerCase().slice(0, 3)).test(lo));
  const rg = lo.match(/\b(mon|tue|wed|thu|fri|sat|sun)\w*\s*(?:-|to|through|thru|until)\s*(mon|tue|wed|thu|fri|sat|sun)/);
  if (rg) { const wd = i => new Date(Date.now() + i * 864e5).toLocaleDateString('en-US', { weekday: 'long' }).slice(0, 3).toLowerCase(), i0 = days.findIndex((d, i) => wd(i) === rg[1]), i1 = days.findIndex((d, i) => wd(i) === rg[2]); if (i0 >= 0 && i1 >= i0) ds = days.slice(i0, i1 + 1); }
  const day = ds[0];
  if (!day && !/\b(be at|be in|working at|openings?|slots?)\b/i.test(t)) return null;
  const win = /morning|\bam\b/i.test(t) ? 'Morning' : /afternoon/i.test(t) ? 'Afternoon' : /evening|night/i.test(t) ? 'Evening' : 'All day';
  const W = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 }, sm = lo.match(/(\d+|one|two|three|four|five|six)\s*(openings?|slots?|spots?|appointments?)/);
  return { days: (ds.length ? ds : [days[1]]).map(d => d.ymd), day: (day || days[1]).ymd, place: proPlace(t), win, slots: sm ? (W[sm[1]] || +sm[1]) : 2, note: /no trip fee|waive/i.test(t) ? 'No trip fee' : '' };
}
async function proFree(text, p){
  const r = await proAsk('You are Zing\'s assistant talking with a service provider about their profile. Decide what they want. Return ONLY JSON {"action":"update|visit|other","add":["services to add"],"remove":["services to remove"],"hours":"new hours or empty","area":"new area or empty","visit":{"days":["each day they named: today|tomorrow|monday|...|sunday"],"place":"the neighborhood or building they named, or empty","win":"Morning|Afternoon|Evening|All day","slots":<number>,"note":"optional extra info for residents such as no trip fee; never the building, day or time; empty if none"},"reply":"one or two friendly sentences when action is other"}. Today is ' + new Date().toDateString() + '.', JSON.stringify({ message: text, profile: { services: p.services, hours: p.hours, area: p.area } }));
  if (r && r.action) { if (r.action === 'visit' && r.visit) { const days = zDays(7), one = d => { d = String(d || '').toLowerCase(); return d === 'today' ? days[0] : d === 'tomorrow' ? days[1] : days.find(x => x.label.toLowerCase() === d) || days.find((x, i) => new Date(Date.now() + i * 864e5).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === d); };
    const ms = [...new Set((r.visit.days || [r.visit.day]).map(one).filter(Boolean))], P = window.ZPro.AREAS().concat(window.ZPro.BUILDINGS()), pl = P.find(x => r.visit.place && x.name.toLowerCase().includes(String(r.visit.place).toLowerCase().replace(/^the /, ''))) ;
    r.visit = { days: (ms.length ? ms : [days[1]]).map(x => x.ymd), day: (ms[0] || days[1]).ymd, place: pl ? pl.name : proPlace(text), win: PWINS.includes(r.visit.win) ? r.visit.win : 'All day', slots: Math.max(1, Math.min(8, +r.visit.slots || 2)), note: r.visit.note || '' }; } return r; }
  const v = proVisitKw(text); if (v && /\b(be at|be in|working|openings?|slots?|i'?ll be|will be|coming)\b/i.test(text)) return { action: 'visit', visit: v };
  const add = text.match(/\b(?:also do|i also do|i also|add|now do|now offer)\s+(.+)/i), rem = text.match(/\b(?:no longer do|don'?t do|stop(?:ped)? doing|remove)\s+(.+)/i), off = text.match(/\b(?:off|closed|not working)\s+(?:on\s+)?(\w+days?|weekends)/i);
  if (add || rem || off) return { action: 'update', add: add ? [add[1].replace(/[.!]$/, '').toLowerCase()] : [], remove: rem ? [rem[1].replace(/[.!]$/, '').toLowerCase()] : [], hours: off ? (p.hours ? p.hours + '. ' : '') + 'Off ' + off[1] : '' };
  return { action: 'other', reply: 'I can update your profile, like “I also do water heaters”, or tell neighbors when you’ll be around, like “I’ll be in Coconut Grove Monday to Wednesday with 2 openings a day”.' };
}
const proParseDate = t => { const x = Date.parse(t) || Date.parse('1 ' + t); if (!x) return null; const d = new Date(x); return d.getFullYear() > 2020 ? d : null; };

/* ---- the conversation ---- */
function proStart(s){
  const Z = window.ZPro, H = window.HOA, q = s.quotes && s.quotes[0];
  Z.patch(s.id, { name: s.name, step: 'about', trades: [s.trade] });
  Z.say(s.id, { from: 'zing', text: 'Hi ' + s.name.split(' ')[0] + '! ' + (s.recs ? s.recs + (s.recs === 1 ? ' neighbor' : ' neighbors') + ' in ' + H.GROUP.name + ' recommend you' + (q ? '. One wrote: “' + q[1] + '”' : '') + '.' : 'Welcome to Zing.') + '\n\nI’m Zing’s assistant. I’ll set up your free profile by chatting, no forms. To start, tell me about your work: what you do, the jobs you like, and anything you don’t take on.' });
}
async function proTurn(s, text, key){
  const Z = window.ZPro, H = window.HOA, sid = s.id, p = Z.profile(sid) || {}, say = (t, o) => Z.say(sid, { from: 'zing', text: t, ...(o || {}) }), set = x => Z.patch(sid, x);
  const toLicense = () => { set({ step: 'license' }); say('Last one: do you have a state or county license for this work? If so, what’s the number?', { chips: [['Not required for my work', 'na'], ['I’ll add it later', 'later']] }); };
  const finish = () => say('You’re all set. Neighbors in ' + H.GROUP.name + ' can now see your profile.\n\nTell me anytime if something changes, like “I also do water heaters” or “I’m off Sundays”. And when you’ll already be in a neighborhood, tell me, like “I’ll be in Coconut Grove Monday to Wednesday with 2 openings a day”. Residents there who look for your kind of work that week will see you first and can book you.', { chips: [['See my profile', 'tab:profile'], ['Announce a visit', 'tab:visits']] });
  switch (p.step) {
    case 'about': { const ex = await proExtract(text), tr = ex.trades.length ? ex.trades : [s.trade];
      set({ about: text, trades: tr, services: ex.services, not: ex.not, step: 'confirm' });
      return say('Here’s what I heard:\n• ' + (tr.length > 1 ? 'Categories: ' : 'Category: ') + tr.join(', ') + (ex.services.length ? '\n• Services: ' + ex.services.join(', ') : '') + (ex.not.length ? '\n• Not taking on: ' + ex.not.join(', ') : '') + '\n\nDid I get that right?', { chips: [['Yes, that’s right', 'yes'], ['Let me fix it', 'fix']] }); }
    case 'confirm': if (key === 'fix' || (!key && /\b(no|fix|wrong|change|not quite)\b/i.test(text))) { set({ step: 'about' }); return say('No problem. Tell me again in your own words, and include anything I missed.'); }
      set({ step: 'biz' }); return say('Do you work under a business name?', { chips: [['Just my name', 'none']] });
    case 'biz': set({ biz: key === 'none' || /^(no|nope|just (my|me)|none)\b/i.test(text) ? '' : text.trim(), step: 'contact' });
      return say('What’s the best number for neighbors to reach you? Is it on WhatsApp?', { chips: s.phone ? [[H.fmtPhone(s.phone) + ', also on WhatsApp', 'dirwa'], [H.fmtPhone(s.phone) + ', calls and texts only', 'dir']] : [] });
    case 'contact': { const ph = key && key.indexOf('dir') === 0 ? s.phone : (text.match(/\+?[\d()\-.\s]{7,}/) || [''])[0].trim();
      if (H.digits(ph).length < 7) return say('I didn’t catch a phone number. Could you type it, like (305) 555-0100?');
      set({ phone: ph, whatsapp: key === 'dirwa' || (!key && /whats ?app|\bwa\b|\byes\b/i.test(text)), step: 'area' });
      return say('Where do you usually work? Name buildings, neighborhoods, or how far you’ll go.', { chips: [[H.GROUP.name, 'g'], ['Anywhere in Miami', 'm']] }); }
    case 'area': set({ area: text.trim(), step: 'hours' }); return say('When do you usually work?', { chips: [['Weekdays, 8 AM–5 PM', 'a'], ['Weekdays and Saturdays', 'b'], ['Evenings and weekends too', 'c']] });
    case 'hours': set({ hours: text.trim() });
      if ((p.trades || [s.trade]).every(t => NO_COI.test(t))) return toLicense();
      set({ step: 'insurance' }); return say('Some buildings ask for a certificate of insurance (COI) before you work in common areas or bring equipment through the lobby, and ' + H.GROUP.name + ' is one of them. Do you carry general liability insurance?', { chips: [['Yes', 'yes'], ['No', 'no'], ['Not sure', 'unsure']] });
    case 'insurance': if (key === 'yes' || (!key && /^(y|yes|yeah|yep|i do)/i.test(text))) { set({ insured: true, step: 'coi' }); return say('Great. Upload your COI here. A photo or PDF is fine. If it’s not handy, you can add it later.', { upload: true, chips: [['Add it later', 'later']] }); }
      { const no = key === 'no' || (!key && /^(n|no|nope)/i.test(text)); set({ insured: no ? false : null });
        say(no ? 'Okay. You can still take jobs inside people’s homes. Some buildings won’t allow common-area work without it, and I’ll tell you when that’s the case.' : 'No problem. If you find out later, just tell me.'); return toLicense(); }
    case 'coi': if (key === 'later' || /later|not now/i.test(text)) { say('Okay. Send it whenever you have it, and I’ll add it to your profile.'); return toLicense(); }
      return say('Upload the file with the button below, or tap “Add it later”.', { upload: true, chips: [['Add it later', 'later']] });
    case 'coi_exp': { const d = proParseDate(text); set({ coi: { ...(p.coi || {}), expires: d ? window.ZPro.ymd(d) : text.trim() } });
      say(d ? 'Thanks. I’ll remind you a month before it expires on ' + d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + '.' : 'Thanks, saved.'); return toLicense(); }
    case 'license': set({ license: key === 'na' ? 'Not required' : key === 'later' ? '' : text.trim(), step: 'done', done: true }); return finish();
    default: {
      if (key === 'post' && p.pendingVisit) { const pv = p.pendingVisit, ds = pv.days && pv.days.length ? pv.days : [pv.date || pv.day];
        ds.forEach(d => window.ZPro.addVisit({ building: pv.building, date: d, win: pv.win, slots: pv.slots, note: pv.note, sid, name: p.biz || p.name || s.name, trade: (p.trades || [s.trade])[0], phone: p.phone || s.phone, coi: !!(p.coi && p.coi.media) })); set({ pendingVisit: null });
        return say('Posted. I’ll text you each time someone books one of your openings.', { chips: [['See my visits', 'tab:visits']] }); }
      if (key === 'change' && p.pendingVisit) { set({ pendingVisit: null }); return say('Okay. Tell me the day, morning or afternoon, and how many openings.'); }
      const r = await proFree(text, p);
      if (r.action === 'visit' && r.visit) { const Z = window.ZPro, place = r.visit.place || proPlace(text), b = Z.BUILDINGS().find(x => x.name === place), reach = Z.reach(place), nt = String(r.visit.note || '').trim(), bad = !nt || place.toLowerCase().includes(nt.toLowerCase()) || nt.toLowerCase().includes(place.toLowerCase()) || /^(today|tomorrow|morning|afternoon|evening|\w+day)\b/i.test(nt);
        const v = { ...r.visit, days: r.visit.days && r.visit.days.length ? r.visit.days : [r.visit.date || r.visit.day], note: bad ? '' : nt, building: place }; set({ pendingVisit: v });
        return say((reach ? 'I’ll let neighbors in ' + place + ' know, about ' + reach + ' residents on Zing' : 'I’ll let residents of ' + place + ' know') + ': ' + zList(v.days.map(zDayIn)) + ', ' + v.win.toLowerCase() + ', ' + v.slots + (v.slots === 1 ? ' opening' : ' openings') + (v.days.length > 1 ? ' a day' : '') + (v.note ? ' · ' + v.note : '') + '.\n\nThey won’t get a mass message. When one of them looks for a ' + zTrade((p.trades || [s.trade])[0], 1) + ' those days, Zing shows you first and they can book an opening.' + (b && b.coi && !(p.coi && p.coi.media) ? '\n\nHeads up: this building asks for a COI for common-area work, and I don’t have yours yet. Jobs inside units are usually fine.' : '') + '\n\nPost it?', { chips: [['Post it', 'post'], ['Change something', 'change']] }); }
      if (r.action === 'update') { const sv = (p.services || []).filter(x => !(r.remove || []).some(y => x.includes(y) || y.includes(x))).concat((r.add || []).filter(Boolean));
        set({ services: [...new Set(sv)], ...(r.hours ? { hours: r.hours } : {}), ...(r.area ? { area: r.area } : {}) });
        return say('Updated.' + ((r.add || []).length ? ' Added ' + r.add.join(', ') + '.' : '') + ((r.remove || []).length ? ' Removed ' + r.remove.join(', ') + '.' : '') + (r.hours ? ' Hours: ' + r.hours + '.' : '') + (r.area ? ' Area: ' + r.area + '.' : ''), { chips: [['See my profile', 'tab:profile']] }); }
      return say(r.reply || 'Got it.');
    }
  }
}

function ProChat({ s, goTab, toast }){
  useProStore();
  const Z = window.ZPro, chat = Z.chat(s.id), p = Z.profile(s.id) || {}, [txt, setTxt] = pS(''), [busy, setBusy] = pS(false), file = pR(null);
  pE(() => { if (!Z.chat(s.id).length) proStart(s); }, [s.id]);
  const ref = useBottom(chat.length + (busy ? 'b' : ''));
  const run = async (text, key) => { if (key && key.indexOf('tab:') === 0) return goTab(key.slice(4)); Z.say(s.id, { from: 'me', text }); setBusy(true); try { await proTurn(s, text, key); } finally { setBusy(false); } };
  const tap = (m, label, key) => { if (m.picked) return; Z.markChat(s.id, m.id, { picked: key }); run(label, key); };
  const send = () => { const t = txt.trim(); if (!t || busy) return; setTxt(''); const last = chat[chat.length - 1]; if (last && last.chips && !last.picked) Z.markChat(s.id, last.id, { picked: '_typed' }); run(t); };
  const upload = async f => { if (!f) return; const mid = await window.ZMedia.put(f); Z.patch(s.id, { coi: { media: mid, name: f.name, type: f.type, size: f.size }, insured: true, step: 'coi_exp' });
    Z.say(s.id, { from: 'me', text: 'Uploaded ' + f.name }); Z.say(s.id, { from: 'zing', text: 'Got it, ' + f.name + '. When does it expire? A month and year is enough.' }); };
  const lastUpload = [...chat].reverse().find(m => m.from === 'zing');
  return <div className="scr">
    <div className="wa agent-bg" ref={ref}>
      <div className="sys">Only you and Zing see this conversation. Zing builds your profile from it.</div>
      {chat.map(m => m.from === 'me' ? <div key={m.id} className="b out"><span className="bt">{m.text}</span><time>{window.HOA.fmtTime(new Date(m.ts))}</time></div>
        : <div key={m.id} className="b agent"><small style={{ color: 'var(--or)' }}>Zing assistant</small><span className="bt">{m.text}</span><time>{window.HOA.fmtTime(new Date(m.ts))}</time>
          {m.chips && m.chips.length > 0 && <div className="chips">{m.chips.map(([l, k]) => <button key={k} className={'slot' + (m.picked === k ? ' on' : '')} disabled={!!m.picked && k.indexOf('tab:') !== 0} onClick={() => k.indexOf('tab:') === 0 ? goTab(k.slice(4)) : tap(m, l, k)}>{l}</button>)}</div>}
          {m.upload && m === lastUpload && p.step === 'coi' && <><button className="btn ghost" style={{ marginTop: 8, width: '100%' }} onClick={() => file.current.click()}><Ico d={I.plus} s={17} />Upload COI</button><input ref={file} type="file" accept="image/*,application/pdf" hidden onChange={e => { upload(e.target.files[0]); e.target.value = ''; }} /></>}
        </div>)}
      {busy && <div className="b agent typing"><small style={{ color: 'var(--or)' }}>Zing assistant</small><span className="dots"><i></i><i></i><i></i></span></div>}
    </div>
    <div className="cmp"><input value={txt} onChange={e => setTxt(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={p.done ? 'Tell Zing what changed, or when you’ll be in a building' : 'Type your answer'} aria-label="Message Zing" /><button className="sendb" aria-label="Send" onClick={send}><Ico d={I.send} s={19} /></button></div>
  </div>;
}

function ProProfile({ s, goTab }){
  useProStore();
  const H = window.HOA, p = window.ZPro.profile(s.id) || {}, coiUrl = useMediaUrl(p.coi && p.coi.media);
  const row = (l, v) => v ? <div><span>{l}</span>{v}</div> : null;
  return <div className="list">
    {!p.done && <div className="card desk"><span className="lbl" style={{ marginTop: 0 }}>Almost there</span><span className="nb2">Finish the conversation in Assistant and your profile goes live for neighbors.</span><button className="btn" style={{ marginTop: 10 }} onClick={() => goTab('chat')}>Continue</button></div>}
    <div className="card"><div className="sh-top"><span className="sav lg" style={{ background: colorOf(s.name) }}>{initials(p.biz || s.name)}</span><div><h3 style={{ font: "400 22px/1.15 'Libre Caslon Text',serif", margin: 0 }}>{p.biz || s.name}</h3><span className="meta">{p.biz ? s.name + ' · ' : ''}{(p.trades || [s.trade]).join(', ')}{p.done ? ' · Claimed' : ''}</span></div></div>
      {p.about && <p className="quote" style={{ fontStyle: 'normal', marginTop: 10 }}>“{p.about}”</p>}
      <div className="facts">{row('Services', (p.services || []).join(', '))}{row('Not taking on', (p.not || []).join(', '))}{row('Where', p.area)}{row('When', p.hours)}{row('Contact', p.phone ? H.fmtPhone(p.phone) + (p.whatsapp ? ' · WhatsApp' : '') : '')}
        {(p.insured !== undefined || p.coi) && <div><span>Insurance</span>{p.coi && p.coi.media ? <>COI on file{p.coi.expires ? ', expires ' + p.coi.expires : ''}{coiUrl && <> · <a href={coiUrl} target="_blank" rel="noopener">View</a></>}</> : p.insured === true ? 'Insured, COI not uploaded yet' : p.insured === false ? 'No general liability insurance' : 'Not sure yet'}</div>}
        {row('License', p.license)}</div>
      <span className="fine" style={{ margin: '8px 0 0' }}>Insurance and license details are what you told Zing. They aren’t verified yet.</span>
      <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => goTab('chat')}>Change something by chatting</button></div>
    <ZRep s={{ recs: s.recs, jobs: 0, quotes: (s.quotes || []).map(q => [q[0], q[1]]) }} />
  </div>;
}

function ProVisits({ s, goTab }){
  useProStore();
  const Z = window.ZPro, p = Z.profile(s.id) || {}, A = Z.AREAS(), B = Z.BUILDINGS(), days = zDays(7), tr = (p.trades || [s.trade])[0];
  const [f, setF] = pS({ place: A[0].name, days: [days[1].ymd], win: 'Morning', slots: 2, note: '', fee: true });
  const mine = Z.visits().filter(v => v.sid === s.id && v.status !== 'Cancelled' && v.date >= days[0].ymd).sort((a, b) => a.date.localeCompare(b.date));
  const b = B.find(x => x.name === f.place), reach = Z.reach(f.place), coi = !!(p.coi && p.coi.media);
  const togDay = d => setF({ ...f, days: f.days.includes(d) ? (f.days.length > 1 ? f.days.filter(x => x !== d) : f.days) : [...f.days, d].sort() });
  const post = () => { f.days.forEach(d => Z.addVisit({ sid: s.id, name: p.biz || s.name, trade: tr, phone: p.phone || s.phone, coi, building: f.place, date: d, win: f.win, slots: f.slots, note: [f.fee ? 'No trip fee' : '', f.note.trim()].filter(Boolean).join(' · ') })); setF({ ...f, note: '' }); };
  return <div className="list">
    <div className="card desk"><span className="lbl" style={{ marginTop: 0 }}>Already working nearby?</span><span className="nb2">Tell a neighborhood or building when you’ll be around. Residents there who look for a {zTrade(tr, 1)} those days see you first and can book an opening, so you fill your day without extra trips.</span></div>
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Field label="Where"><select value={f.place} onChange={e => setF({ ...f, place: e.target.value })}>{A.map(x => <option key={x.name} value={x.name}>{x.name} · about {x.residents} residents</option>)}{B.map(x => <option key={x.name} value={x.name}>{x.name} · building</option>)}</select></Field>
      <span className="lbl">Days</span><div className="seg-scroll" style={{ margin: 0, padding: 0 }}>{days.map(d => <button key={d.ymd} className={'fchip' + (f.days.includes(d.ymd) ? ' on' : '')} onClick={() => togDay(d.ymd)}>{d.short}</button>)}</div>
      <span className="lbl">Time</span><div className="seg" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>{PWINS.map(w => <button key={w} className={f.win === w ? 'on' : ''} onClick={() => setF({ ...f, win: w })}>{w}</button>)}</div>
      <span className="lbl">Openings{f.days.length > 1 ? ' a day' : ''}</span><div className="pstep"><button className="slot" onClick={() => setF({ ...f, slots: Math.max(1, f.slots - 1) })} aria-label="Fewer">−</button><b>{f.slots}</b><button className="slot" onClick={() => setF({ ...f, slots: Math.min(8, f.slots + 1) })} aria-label="More">+</button></div>
      <label className="fol" style={{ marginTop: 8 }}><input type="checkbox" checked={f.fee} onChange={e => setF({ ...f, fee: e.target.checked })} />No trip fee for these visits</label>
      <Field label="Note for residents (optional)"><input value={f.note} onChange={e => setF({ ...f, note: e.target.value })} placeholder="Already there for a water heater job" /></Field>
      {b && b.coi && !coi && <div className="warnb"><b>This building asks for a COI</b>{b.note}. Jobs inside units are usually fine. <button className="lnk" style={{ margin: 0, minHeight: 0 }} onClick={() => goTab('chat')}>Add your COI</button></div>}
      <span className="fine" style={{ margin: '4px 0 0' }}>{reach ? 'About ' + reach + ' residents in ' + f.place + ' use Zing. ' : ''}Nobody gets a mass message. You show up when someone there needs a {zTrade(tr, 1)}.</span>
      <button className="btn" style={{ marginTop: 8 }} onClick={post}>Post {f.days.length > 1 ? f.days.length + ' days' : 'visit'}</button>
      <span className="fine" style={{ margin: '4px 0 0' }}>You can also just tell the assistant, like “I’ll be in Coconut Grove Monday to Wednesday with 2 openings a day”.</span>
    </div>
    <span className="lbl">Your upcoming visits</span>
    {!mine.length && <p className="empty">Nothing posted yet.</p>}
    {mine.map(v => <div key={v.id} className="card"><div className="item"><span><b>{zDayLabel(v.date)} · {v.win}</b><span className="meta">{v.building}{v.note ? ' · ' + v.note : ''}</span></span><span className={'pill ' + (v.booked.length >= v.slots ? 'ok' : 'blue')}>{v.booked.length} of {v.slots} booked</span></div>
      {v.booked.map(x => <span key={x.id} className="meta" style={{ color: 'var(--ink2)' }}>Unit {x.unit || '(not given)'}{x.need ? ': ' + x.need : ''}</span>)}
      <div className="chips" style={{ marginTop: 8 }}><button className="slot" onClick={() => { if (confirm('Cancel this visit? Residents who booked would need to be told.')) Z.cancelVisit(v.id); }}>Cancel visit</button></div></div>)}
  </div>;
}

function SupplierHome({ real, act }){
  useProStore();
  const list = real.suppliers.filter(window.zOk).sort((a, b) => b.recs - a.recs);
  const [as, setAs] = pS(() => { try { return localStorage.getItem('zingN.app.supplierAs') || ''; } catch (e) { return ''; } });
  const [tab, setTab] = pS('chat'), [pick, setPick] = pS(false), [q, setQ] = pS('');
  const s = list.find(x => x.id === as) || list.find(x => x.id === window.ZSMS.latestSid()) || list[0];
  if (!s) return <div className="scr"><div className="empty">Loading the directory…</div></div>;
  const p = window.ZPro.profile(s.id) || {}, choose = id => { setAs(id); try { localStorage.setItem('zingN.app.supplierAs', id); } catch (e) {} setPick(false); setTab('chat'); };
  const texts = window.ZSMS.list().filter(t => t.sid === s.id).length;
  const T = [['chat', 'Assistant', I.agent], ['profile', 'Profile', I.user], ['visits', 'Visits', I.ev], ['texts', 'Texts', I.chat]];
  return <div className="scr">
    <Header av={initials(p.biz || s.name)} title={p.biz || s.name} sub={(p.trades || [s.trade]).join(', ') + (p.done ? ' · Claimed' : ' · Setting up')} right={<button className="askb" onClick={() => setPick(true)}>Switch</button>} />
    {tab === 'chat' && <ProChat key={s.id} s={s} goTab={setTab} toast={act.toast} />}
    {tab === 'profile' && <ProProfile s={s} goTab={setTab} />}
    {tab === 'visits' && <ProVisits s={s} goTab={setTab} />}
    {tab === 'texts' && <div className="list"><SmsInbox sid={s.id} name={s.name} /><ZFee /></div>}
    <nav className="tabs" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>{T.map(([k, l, d]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)} aria-label={l}><span className="ti"><Ico d={d} />{k === 'texts' && texts ? <em>{texts}</em> : null}</span>{l}</button>)}</nav>
    {pick && <Sheet onClose={() => setPick(false)}><h3>View as a provider</h3><span className="meta">For testing. Pick any recommended provider to see their side.</span>
      <label className="srch" style={{ marginTop: 8 }}><Ico d={I.search} s={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search providers" aria-label="Search providers" autoFocus /></label>
      {list.filter(x => !q || (x.name + ' ' + x.trade).toLowerCase().includes(q.toLowerCase())).slice(0, 60).map(x => <button key={x.id} className="mrow" onClick={() => choose(x.id)}><span className="sav sm" style={{ background: colorOf(x.name) }}>{initials(x.name)}</span><span><b>{x.name}</b><span className="meta">{x.trade} · {x.recs} recs{window.ZPro.profile(x.id) && window.ZPro.profile(x.id).done ? ' · claimed' : ''}</span></span><span></span></button>)}
      <button className="lnk" onClick={() => { if (confirm('Erase ' + s.name + '’s profile, chat and visits on this device?')) { window.ZPro.reset(s.id); setPick(false); } }}>Reset {s.name.split(' ')[0]}’s profile</button>
    </Sheet>}
  </div>;
}

/* ---- Resident side: shown only when someone looks for that kind of help ---- */
function VisitSheet({ v, st, act, onClose }){
  const [need, setNeed] = pS(''), s = st.suppliers.find(x => x.id === v.sid);
  return <Sheet onClose={onClose}>
    <span className="ev-when">{zDayLabel(v.date)} · {v.win} · {v.building}</span><h3 style={{ marginTop: 6 }}>{v.name}</h3>
    <span className="meta">{v.trade}{s ? ' · ' + s.recs + (s.recs === 1 ? ' neighbor recommends' : ' neighbors recommend') + ' them' : ''}</span>
    <div className="facts">{v.note && <div><span>Note</span>{v.note}</div>}<div><span>Openings</span>{v.slots - v.booked.length} of {v.slots} still open</div><div><span>Insurance</span>{v.coi ? 'COI on file with Zing' : 'No COI on file yet'}</div></div>
    {s && s.quotes && s.quotes[0] && <div className="qt">“{s.quotes[0][1]}”<small>{s.quotes[0][0]}</small></div>}
    <Field label="What do you need?"><input value={need} onChange={e => setNeed(e.target.value)} placeholder="Dripping kitchen faucet" autoFocus /></Field>
    <button className="btn" onClick={() => { act.bookVisit(v, need.trim()); onClose(); }}>Book an opening</button>
    <span className="fine">Zing texts {v.name.split(' ')[0]} your unit number and what you need. You pay them directly.</span>
  </Sheet>;
}
function NearbyVisits({ st, act, trade }){
  useProStore();
  const H = window.HOA, Z = window.ZPro, [open, setOpen] = pS(null);
  pE(() => { Z.seedDemo(st.suppliers); }, [st.suppliers.length]);
  if (!zOn('providerVisits') || !trade) return null;
  const vs = Z.nearby(H.GROUP.name, trade, 7).filter(v => st.suppliers.some(x => x.id === v.sid));
  if (!vs.length) return null;
  const n = new Set(vs.map(v => v.sid)).size, ds = [...new Set(vs.map(v => zDayIn(v.date)))], sel = open && vs.find(v => v.id === open);
  return <>
    <div className="card wkv">
      <span className="nb2" style={{ marginTop: 0 }}>{n === 1 ? 'A recommended ' + zTrade(trade, 1) : n + ' recommended ' + zTrade(trade, n)} will be in {Z.areaOf(H.GROUP.name) || 'the building'} {zList(ds)}. They’re in the area anyway, so it’s often the quickest way to get someone.</span>
      {vs.slice(0, 4).map(v => { const sx = st.suppliers.find(x => x.id === v.sid);
        return <button key={v.id} className="wkr" onClick={() => setOpen(v.id)}>
          <span className="wkd"><b>{zDayLabel(v.date)}</b>{v.win}</span>
          <span><b>{v.name}</b><span className="meta" style={{ margin: 0 }}>{sx ? sx.recs + (sx.recs === 1 ? ' rec' : ' recs') : v.trade}{v.note ? ' · ' + v.note : ''}</span></span>
          <span className="pill ok">{v.slots - v.booked.length} open</span></button>; })}
    </div>
    {sel && <VisitSheet v={sel} st={st} act={act} onClose={() => setOpen(null)} />}
  </>;
}

/* ---- Resident side: the building's service week, inside Ask. Hidden when nobody is coming. ---- */
function ServiceWeek({ st, act, pinned }){
  useProStore();
  const H = window.HOA, Z = window.ZPro, [fold, setFoldS] = pS(() => { try { return localStorage.getItem('zingN.app.swkFold') !== '0'; } catch (e) { return true; } }), [day, setDay] = pS(null), [open, setOpen] = pS(null), [need, setNeed] = pS('');
  pE(() => { Z.seedDemo(st.suppliers); }, [st.suppliers.length]);
  if (!zOn('providerVisits')) return null;
  const vs = Z.upcoming(H.GROUP.name, 6).filter(v => st.suppliers.some(x => x.id === v.sid));
  if (!vs.length) return null;
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return { ymd: Z.ymd(d), wd: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }), n: d.getDate() }; });
  const by = d => vs.filter(v => v.date === d), first = days.find(d => by(d.ymd).length), cur = day && by(day).length ? day : first.ymd, list = by(cur), area = Z.areaOf(H.GROUP.name);
  const short = t => ({ 'AC / HVAC': 'AC' })[t] || t.split(/[ /]/)[0];
  const sel = open && vs.find(v => v.id === open), sx = sel && st.suppliers.find(x => x.id === sel.sid);
  const setFold = v => { setFoldS(v); try { localStorage.setItem('zingN.app.swkFold', v ? '1' : '0'); } catch (e) {} };
  const sum = days.filter(d => by(d.ymd).length).slice(0, 3).map(d => d.wd + ' ' + [...new Set(by(d.ymd).map(v => short(v.trade)))].slice(0, 2).join(', ')).join(' · ');
  return <div className={'swk' + (pinned ? ' pin' : '') + (fold ? ' fold' : '')}>
    <button className="swk-h" onClick={() => setFold(!fold)} aria-expanded={!fold}><span className="lbl" style={{ marginTop: 0 }}>Coming to the building</span><span className="meta swk-s" style={{ margin: 0 }}>{fold ? sum : 'Hide'}</span><span className="swk-c" aria-hidden="true">{fold ? '▾' : '▴'}</span></button>
    {!fold && <>
    <div className="swk-g">{days.map(d => { const x = by(d.ymd), on = d.ymd === cur;
      return <button key={d.ymd} className={'swk-d' + (x.length ? ' has' : '') + (on ? ' on' : '')} disabled={!x.length} onClick={() => { setDay(d.ymd); setOpen(null); }} aria-label={d.wd + ' ' + d.n + (x.length ? ', ' + x.map(v => v.trade).join(', ') : ', nothing scheduled')}>
        <span className="swk-wd">{d.wd}</span><span className="swk-n">{d.n}</span>
        <span className="swk-t">{x.length ? [...new Set(x.map(v => short(v.trade)))].slice(0, 2).map(t => <i key={t}>{t}</i>) : <i className="nil">·</i>}</span></button>; })}</div>
    <div className="swk-l">{list.map(v => { const s = st.suppliers.find(x => x.id === v.sid), left = v.slots - v.booked.length;
      return <button key={v.id} className={'wkr' + (open === v.id ? ' on' : '')} disabled={left <= 0} onClick={() => { setOpen(open === v.id ? null : v.id); setNeed(''); }}>
        <span className="wkd"><b>{short(v.trade)}</b>{v.win}</span>
        <span><b>{v.name}</b><span className="meta" style={{ margin: 0 }}>{s ? s.recs + (s.recs === 1 ? ' rec' : ' recs') : ''}{v.building === area ? ' · in the Grove' : ' · in the building'}{v.note ? ' · ' + v.note : ''}</span></span>
        <span className={'pill ' + (left > 0 ? 'ok' : 'grey')}>{left > 0 ? left + ' open' : 'Full'}</span></button>; })}</div>
    {sel && <div className="swk-b">
      {sx && sx.quotes && sx.quotes[0] && <span className="quote" style={{ margin: 0 }}>“{sx.quotes[0][1]}”</span>}
      <div className="askrow" style={{ marginTop: 6 }}><input value={need} onChange={e => setNeed(e.target.value)} onKeyDown={e => e.key === 'Enter' && (act.bookVisit(sel, need.trim()), setOpen(null))} placeholder={'What do you need from ' + sel.name.split(' ')[0] + '?'} aria-label="What do you need" autoFocus /><button className="sendb" aria-label="Book an opening" onClick={() => { act.bookVisit(sel, need.trim()); setOpen(null); }}><Ico d={I.check} s={19} /></button></div>
      <span className="fine" style={{ margin: 0 }}>Zing texts {sel.name.split(' ')[0]} your unit and what you need. You pay them directly.</span>
    </div>}
    </>}
  </div>;
}

Object.assign(window, { ServiceWeek, zDayIn, SupplierHome, NearbyVisits, VisitSheet, zList, zTrade, zDayLabel, proFree, proExtract, proVisitKw });
