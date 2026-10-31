/* Zing Neighbors App: book a provider by text. Zing texts a recommended provider, reads the reply,
   asks the resident, then confirms. The resident's name and unit are shared only after they say yes.
   Replies are simulated until Twilio is connected (see sms.js). */
const zFirst = n => String(n || '').split(' ')[0];
const ZPRICE = { 'Plumber': 90, 'AC / HVAC': 120, 'Electrician': 95, 'Cleaner': 120, 'Handyman': 75, 'Appliance repair': 85, 'Locksmith': 80, 'Pest control': 110, 'Painter': 150 };
const ZHOUR = { Morning: '10am', Afternoon: '2pm', Evening: '6pm', 'Any time': '11am' };
const ZREPLIES = [['mix', 'Realistic mix'], ['yes', 'Always yes'], ['counter', 'Offers another time'], ['no', 'Always no'], ['unclear', 'Unclear (“Call me”)'], ['none', 'Never replies'], ['manual', 'I’ll reply from the Supplier page']];

function zSimBody(style, b){
  const p = ZPRICE[b.trade] || 85, nx = b.slots && window.zNextStart ? window.zNextStart(b.slots) : null;
  const at = nx ? window.zWhenLabel(nx.ms) : null, day = at ? at.split(' at ')[0] : b.day || 'Tomorrow';
  if (style === 'mix') { const r = Math.random(); style = r < .5 ? 'yes' : r < .7 ? 'counter' : r < .85 ? 'no' : 'unclear'; }
  return { yes: (at || day + ' at ' + (ZHOUR[b.win] || '10am')) + ' works. $' + p + ' for the visit, plus parts if needed.',
    counter: 'Can’t do ' + day.toLowerCase() + ', but I can come Thursday at 9am. $' + p + ' visit fee.',
    alt: 'Thursday at 1pm works for me. Same price.', no: 'Sorry, I’m fully booked this week.', unclear: 'Call me' }[style] || null;
}
function zParseKw(body){
  const t = String(body || '').trim();
  if (/^(stop|unsubscribe|end|quit|stopall)\b/i.test(t)) return { intent: 'stop' };
  const tm = t.match(/\b((?:mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?|today|tomorrow|tonight)?(?:,?\s*[a-z]{3}\s\d{1,2})?\s*(?:at\s*)?\d{1,2}(?::\d\d)?\s?(?:am|pm)\b/i);
  const time = tm ? tm[0].trim().replace(/\s?(am|pm)$/i, x => ' ' + x.trim().toUpperCase()).replace(/^./, c => c.toUpperCase()) : '';
  const pm = t.match(/\$\s?\d+(?:\.\d\d)?(?:\s*(?:\+|plus)\s*parts)?/i), price = pm ? pm[0].replace(/\s+/g, ' ') : '';
  if (!time && /\b(no|nope|can'?t|cannot|not available|unavailable|fully booked|booked up|busy|sorry|out of town)\b/i.test(t)) return { intent: 'no' };
  if (!time && (/call me|give me a call|what('?s| is) the|send (a )?(pic|photo)|address/i.test(t) || /\?\s*$/.test(t))) return { intent: 'unclear' };
  if (time || /\b(yes|yep|sure|ok|okay|works|can do|available|i can come)\b/i.test(t)) return { intent: 'yes', time, price };
  return { intent: 'unclear' };
}
async function zParseReply(body){
  if (window.HOAI && window.HOAI.on()) {
    try { const raw = await window.claude.complete({ system: 'A service provider replied by text to a booking request sent by a neighbors app. Return ONLY JSON: {"intent":"yes|no|unclear|stop","time":"<the time they offered, short, e.g. Tue 10 AM, or empty>","price":"<the price they quoted, e.g. $90 + parts, or empty>"}. "yes" includes offering a different time. "unclear" is anything the resident has to handle, like "call me" or a question. "stop" means they don\'t want texts.', max_tokens: 200, messages: [{ role: 'user', content: body }] });
      const r = JSON.parse(String(raw).match(/\{[\s\S]*\}/)[0]); if (/^(yes|no|unclear|stop)$/.test(r.intent)) return r; } catch (e) {}
  }
  return zParseKw(body);
}

function useSmsBooking(env){
  const R = React, envRef = R.useRef(env); envRef.current = env;
  const E = () => envRef.current, cfg = () => window.ZCFG.get().bot, live = () => window.ZSMS.live;
  const B = bid => E().stRef.current.bookings.find(b => b.id === bid);
  const patch = (bid, p) => E().upd(s => ({ bookings: s.bookings.map(b => b.id === bid ? { ...b, ...p } : b) }));
  const waitMs = () => live() ? (cfg().smsWait || 120) * 60000 : cfg().smsReplies === 'manual' ? 10 * 60000 : 30000;
  const tradeNoun = t => !t || t === 'Other' ? 'help' : /[A-Z]{2}/.test(t) ? t + ' service' : 'a ' + t.toLowerCase();
  const reqText = b => { const m = E().stRef.current.me, H = window.HOA;
    return 'Hi ' + zFirst(b.name) + ', this is Zing for the ' + H.GROUP.name + ' neighbors group. A neighbor' + (m.unit ? ' in unit ' + m.unit : '') + ' needs ' + (b.need ? 'help with this: "' + b.need + '"' : tradeNoun(b.trade)) + '. ' + (b.slots ? 'They’re free: ' + b.when + '. Does any of that work?' : 'Are you free ' + b.when.toLowerCase() + '?') + ' Reply with a time and rough price, or NO if you can’t. Reply STOP to opt out.'; };
  const schedule = (b, style) => { if (live()) return; const s = style || cfg().smsReplies || 'mix'; if (s === 'manual' || s === 'none') return;
    const body = zSimBody(s === 'alt' ? 'alt' : s, b); if (body) setTimeout(() => window.ZSMS.receive(b.tid, body), 2500 + Math.random() * 2500); };
  const out = (st, b) => !!(st.smsOptOut || {})[b];
  const nextFor = b => { const st = E().stRef.current, tried = b.tried || [b.sid];
    return E().suppliers().filter(x => x.trade === b.trade && x.phone && !x.warnings && !tried.includes(x.id) && !out(st, x.id)).sort((x, y) => y.recs - x.recs)[0] || null; };
  const say = m => E().agentSay(m, 500);

  const start = b0 => { const b = typeof b0 === 'string' ? B(b0) : b0; if (!b) return; const tid = 't_' + b.id, nb = { ...b, tid }, s = E().sup(b.sid) || {};
    window.ZSMS.send(tid, { sid: b.sid, provider: b.name, phone: s.phone, bid: b.id, trade: b.trade }, reqText(nb));
    E().upd(st => ({ bookings: st.bookings.some(x => x.id === b.id) ? st.bookings.map(x => x.id === b.id ? { ...x, tid, sms: true, status: 'Waiting for reply', waitUntil: Date.now() + waitMs() } : x) : [{ ...nb, sms: true, status: 'Waiting for reply', waitUntil: Date.now() + waitMs() }, ...st.bookings] }));
    say({ text: 'I texted ' + zFirst(b.name) + ' from Zing’s number. I’ll tell you as soon as they reply. Your name and unit stay private until you say yes.', bid: b.id });
    schedule(nb); };
  const offerNext = (b, lead) => { const nx = nextFor(b);
    if (nx) return say({ text: lead + ' Want me to text ' + nx.name + '? ' + nx.recs + (nx.recs === 1 ? ' neighbor recommends' : ' neighbors recommend') + ' them.', bid: b.id, acts: [['Text ' + zFirst(nx.name), 'next'], ['No thanks', 'cancel']] });
    say({ text: lead + ' There’s no other recommended ' + (b.trade || 'provider').toLowerCase() + ' with a phone number yet. Ask in the group and I’ll pick up the answers.' }); };

  const handle = async (th, msg) => {
    window.ZSMS.mark(th.id, msg.id);
    const b = B(th.bid); if (!b) return;
    const f = zFirst(b.name), q = '“' + msg.body + '”';
    if (/Confirmed|Done/.test(b.status)) return say({ text: f + ' texted: ' + q, bid: b.id });
    if (/Cancelled|Declined|Opted out/.test(b.status)) return;
    const r = await zParseReply(msg.body);
    if (r.intent === 'stop') { patch(b.id, { status: 'Opted out' }); E().upd(s => ({ smsOptOut: { ...(s.smsOptOut || {}), [b.sid]: 1 } })); return offerNext(b, f + ' asked not to get texts from Zing, so I won’t text them again.'); }
    if (r.intent === 'no') { patch(b.id, { status: 'Declined' }); return offerNext(b, f + ' replied ' + q + ' They can’t make it.'); }
    if (r.intent === 'yes') { const offer = { time: r.time || '', price: r.price || '' }; patch(b.id, { status: 'Reply received', offer });
      return say({ text: f + ' replied ' + q + ' ' + (r.time ? 'They can do ' + r.time : 'They said yes') + (r.price ? ', about ' + r.price : '') + '. Book it?', bid: b.id, acts: [['Book it', 'book'], ['Ask for another time', 'time'], ['No thanks', 'cancel']] }); }
    patch(b.id, { status: 'Needs you' });
    const ph = (E().sup(b.sid) || {}).phone, nx = nextFor(b);
    say({ text: f + ' replied ' + q + ' I can’t tell if that’s a yes. You can call them' + (nx ? ', or I can text ' + nx.name + ' instead.' : '.'), bid: b.id,
      acts: [...(ph ? [['Call ' + f, 'call', 'tel:+' + window.HOA.waNum(ph)]] : []), ...(nx ? [['Text ' + zFirst(nx.name), 'next']] : []), ['Cancel', 'cancel']] });
  };
  const processAll = () => { if (window.ZPAGE !== 'resident') return; window.ZSMS.list().filter(th => th.bid).forEach(th => th.msgs.forEach(m => { if (m.dir === 'in' && !m.processed) handle(th, m); })); };

  R.useEffect(() => { if (window.ZPAGE !== 'resident') return; processAll(); const un = window.ZSMS.subscribe(processAll);
    const iv = setInterval(() => { processAll(); const now = Date.now();
      E().stRef.current.bookings.filter(b => b.sms && b.status === 'Waiting for reply' && b.waitUntil && now > b.waitUntil).forEach(b => { patch(b.id, { status: 'No reply' });
        const nx = nextFor(b);
        say({ text: zFirst(b.name) + ' hasn’t replied yet.' + (nx ? ' Want me to text ' + nx.name + ' instead?' : ''), bid: b.id, acts: [...(nx ? [['Text ' + zFirst(nx.name), 'next']] : []), ['Keep waiting', 'wait'], ['Cancel', 'cancel']] }); }); }, 3000);
    return () => { un(); clearInterval(iv); }; }, []);

  const act = (bid, key) => { const b = B(bid); if (!b) return; const f = zFirst(b.name), me = E().stRef.current.me;
    if (key === 'sms') return start(b);
    if (key === 'self') { patch(bid, { status: 'Requested' }); return say({ text: 'Here’s a message for ' + b.name + '. Tap below to open it in WhatsApp and send it. When they reply, mark the booking here.', wa: E().waLink(E().sup(b.sid) || { name: b.name }, b.when), bid }); }
    if (key === 'book') { const o = b.offer || {}; let when = o.time || b.when; const who = [me.name, me.unit ? 'unit ' + me.unit : ''].filter(Boolean).join(', ');
      const acc = me.access || b.access, tm = window.zStartFrom(o.time || '', b.slots, b.win);
      if (tm.moved || !o.time) when = window.zWhenLabel(tm.start); // text, card and invite all use the final start
      window.ZSMS.send(b.tid, null, 'Great, it’s booked: ' + when + '.' + (who ? ' The neighbor is ' + who + '.' : '') + (acc ? ' Access: ' + acc.replace(/^I’ll be home$/, 'they’ll be home') + (acc === 'Door code' ? ' (they’ll text it before you arrive)' : '') + '.' : '') + ' Reply here if anything changes and Zing will pass it on.');
      patch(bid, { status: 'Confirmed', when, access: acc || '', ...tm }); E().flash('Booked · ' + b.name, 'building', bid);
      return say({ text: 'Booked with ' + f + ' for ' + when + (o.price ? ', about ' + o.price : '') + '. ' + (me.name && me.unit ? 'I sent them your name and unit.' : who ? 'I sent them your ' + (me.name ? 'name' : 'unit') + '. Add your ' + (me.name ? 'unit' : 'name') + ' under your initials so providers know where to go.' : 'I let them know it’s booked. Add your name and unit under your initials so providers know who to ask for.') + ' You pay them directly after the visit. Tap below to add it to your calendar.', bid }); }
    if (key === 'time') { window.ZSMS.send(b.tid, null, 'Thanks! Is there another time that works this week? The neighbor is flexible.');
      patch(bid, { status: 'Waiting for reply', waitUntil: Date.now() + waitMs(), offer: null }); say({ text: 'I asked ' + f + ' for another time.', bid });
      return schedule(b, cfg().smsReplies === 'manual' || cfg().smsReplies === 'none' ? cfg().smsReplies : 'alt'); }
    if (key === 'wait') { patch(bid, { status: 'Waiting for reply', waitUntil: Date.now() + waitMs() }); return say({ text: 'Okay, I’ll keep waiting for ' + f + '.', bid }); }
    if (key === 'next') { const nx = nextFor(b); if (!nx) return;
      if (b.tid && /Waiting|Reply received|Needs you|No reply/.test(b.status)) window.ZSMS.send(b.tid, null, 'Thanks ' + f + ', the neighbor found another option. No need to come.');
      if (!/Declined|Opted out/.test(b.status)) patch(bid, { status: 'Cancelled' });
      return start({ ...b, id: E().uid(), sid: nx.id, name: nx.name, tid: null, offer: null, tried: [...(b.tried || [b.sid]), nx.id], ts: Date.now() }); }
    if (key === 'cancel') { if (b.tid && /Waiting|Reply received|Needs you|No reply/.test(b.status)) window.ZSMS.send(b.tid, null, 'Thanks ' + f + ', the neighbor doesn’t need the visit anymore. Sorry for the trouble!');
      patch(bid, { status: 'Cancelled' }); return say({ text: 'Cancelled. Nothing else will be sent.' }); }
  };
  return { start, act };
}

function SmsThread({ tid }){
  const [open, setOpen] = React.useState(false), th = window.ZSMS.get(tid), H = window.HOA;
  if (!th) return null;
  return <div className="smst"><button className="smsh" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? 'Hide' : 'Show'} texts with {zFirst(th.provider)} ({th.msgs.length})</button>
    {open && <div className="smsl">{th.msgs.map(m => <div key={m.id} className={'sm ' + (m.dir === 'out' ? 'me' : 'them')}><span>{m.body}</span><time>{m.dir === 'out' ? 'Zing' : zFirst(th.provider)} · {H.fmtTime(new Date(m.ts))}</time></div>)}</div>}</div>;
}

/* Supplier page: what the provider sees on their phone, with a reply box for testing */
function SmsInbox({ sid, name }){
  const [, setV] = React.useState(0), [txt, setTxt] = React.useState({}), H = window.HOA;
  React.useEffect(() => window.ZSMS.subscribe(() => setV(x => x + 1)), []);
  const ths = window.ZSMS.list().filter(t => t.sid === sid), f = zFirst(name);
  const send = (tid, v) => { v = String(v || '').trim(); if (!v) return; window.ZSMS.receive(tid, v); setTxt(o => ({ ...o, [tid]: '' })); };
  if (!ths.length) return <div className="card"><span className="lbl" style={{ marginTop: 0 }}>Texts from Zing</span><span className="meta">None yet. When a neighbor asks Zing to book {f}, the request arrives as a normal text message. {f} doesn’t need the app to answer.</span></div>;
  return <>{ths.map(t => <div key={t.id} className="card smsc">
    <span className="lbl" style={{ marginTop: 0 }}>Texts from Zing{t.phone ? ' · to ' + H.fmtPhone(t.phone) : ''}</span>
    <span className="fine" style={{ margin: '2px 0 8px' }}>What {f} sees in their messages app. Reply as {f} to test.</span>
    <div className="smsl">{t.msgs.map(m => <div key={m.id} className={'sm ' + (m.dir === 'out' ? 'them' : 'me')}><span>{m.body}</span><time>{m.dir === 'out' ? 'Zing' : f} · {H.fmtTime(new Date(m.ts))}</time></div>)}</div>
    <div className="askrow"><input value={txt[t.id] || ''} onChange={e => setTxt({ ...txt, [t.id]: e.target.value })} onKeyDown={e => e.key === 'Enter' && send(t.id, txt[t.id])} placeholder={'Reply as ' + f} aria-label={'Reply as ' + f} /><button className="sendb" aria-label="Send reply" onClick={() => send(t.id, txt[t.id])}><Ico d={I.send} s={19} /></button></div>
    <div className="sugg flat">{['Tomorrow at 10am works, $90 plus parts', 'Can’t tomorrow, Thursday at 2pm?', 'Sorry, booked this week', 'Call me', 'STOP'].map(x => <button key={x} onClick={() => send(t.id, x)}>{x}</button>)}</div>
  </div>)}</>;
}

/* AI Control panel */
function SmsAdmin({ cfg, setBot }){
  const [, setV] = React.useState(0), H = window.HOA;
  React.useEffect(() => window.ZSMS.subscribe(() => setV(x => x + 1)), []);
  const ths = window.ZSMS.list(), w = cfg.bot.smsWait || 120;
  return <div className="apanel">
    <div className="aph"><b>Texting providers</b><span className="tpill">Simulated · Twilio not connected</span></div>
    <span className="meta">When a resident books someone, Zing texts the provider from its own number, reads the reply and asks the resident before confirming. Until Twilio is connected, texts stay in this browser.</span>
    <div className="arow"><span className="lbl" style={{ marginTop: 0 }}>Simulated provider replies</span>
      <select className="asel" value={cfg.bot.smsReplies || 'mix'} onChange={e => setBot({ smsReplies: e.target.value })} aria-label="Simulated provider replies">{ZREPLIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
      <span className="meta">{cfg.bot.smsReplies === 'manual' ? 'Open the Supplier page, pick the provider, and reply as them.' : 'Replies arrive a few seconds after Zing texts. You can still reply manually from the Supplier page.'}</span></div>
    <div className="arow"><span className="lbl" style={{ marginTop: 0 }}>Wait for a reply before offering the next provider</span>
      <div className="arange"><input type="range" min="15" max="240" step="15" value={w} onChange={e => setBot({ smsWait: +e.target.value })} aria-label="Minutes to wait" /><b style={{ fontSize: 20, minWidth: 64 }}>{w < 60 ? w + ' min' : (w / 60) + ' h'}</b></div>
      <span className="meta">Used once Twilio is connected. In simulation it waits 30 seconds so you can see what happens.</span></div>
    <div className="aph" style={{ marginTop: 8 }}><b>Recent texts</b><span>{ths.length ? ths.length + (ths.length === 1 ? ' conversation' : ' conversations') : 'Book a provider in the Resident page’s Ask tab'}</span></div>
    {ths.slice(0, 12).map(t => <details key={t.id} className="aic" style={{ background: '#FBFAF7', color: 'var(--ink)' }}><summary>{t.provider} · {t.msgs.length} texts · {H.fmtTime(new Date(t.updated))}</summary>
      {t.msgs.map(m => <div key={m.id} style={{ color: 'var(--ink2)', borderTopColor: '#EEEAE2' }}><b>{m.dir === 'out' ? 'Zing' : zFirst(t.provider)}:</b> {m.body}</div>)}</details>)}
    {ths.length > 0 && <button className="slot" style={{ alignSelf: 'flex-start', marginTop: 6 }} onClick={() => { if (confirm('Delete all test texts?')) window.ZSMS.clear(); }}>Clear test texts</button>}
  </div>;
}

Object.assign(window, { useSmsBooking, SmsThread, SmsInbox, SmsAdmin, zParseKw });
