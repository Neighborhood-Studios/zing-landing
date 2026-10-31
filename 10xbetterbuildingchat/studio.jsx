/* Zing Neighbors App: playback (synced across pages), Playback hook, Use Cases panel, Supplier view, AI Activity view, outcome + poll cards. */
const ZPB = 'zingN.app.pb';
const ZVIEW = { resident: 'Resident', supplier: 'Supplier', ai: 'AI Control' };
const ZORIG = { scripted: 'Scripted', sim: 'Simulated AI/tool', you: 'You', rules: 'Rules on data', ai: 'Real AI' };
const zMoney = n => '$' + Number(n).toLocaleString('en-US');

function useEngine(stepRef){
  const R = React, saved = (() => { try { return JSON.parse(localStorage.getItem(ZPB)) || {}; } catch (e) { return {}; } })();
  const [key, setKey] = R.useState(saved.key || null), [idx, setIdx] = R.useState(saved.idx || 0), [base, setBase] = R.useState(saved.base || Date.now());
  const [manual, setManual] = R.useState(saved.manual || []), [inserts, setInserts] = R.useState(saved.inserts || []), [playing, setPlaying] = R.useState(false), [speed, setSpeed] = R.useState(1), [typing, setTyping] = R.useState(null);
  const cs = key ? window.ZCASES.find(c => c.key === key) : null;
  const steps = R.useMemo(() => { if (!cs) return []; const a = cs.steps.slice(); inserts.forEach(i => a.splice(i.at, 0, ...i.steps)); return a; }, [key, inserts]);
  const at = Math.min(idx, steps.length), cur = R.useRef({}); cur.current = { key, at };
  const sim = R.useMemo(() => cs ? window.ZEngine.build(cs, steps, at, manual, base) : null, [cs, steps, at, manual, base]);
  R.useEffect(() => { try { localStorage.setItem(ZPB, JSON.stringify({ key, idx: at, base, manual, inserts })); } catch (e) {} }, [key, at, base, manual, inserts]);
  /* follow playback started on another page (Resident, Supplier, AI Control) */
  R.useEffect(() => { const h = e => { if (e.key !== ZPB || !e.newValue) return; let o; try { o = JSON.parse(e.newValue); } catch (x) { return; }
    const was = cur.current; setPlaying(false); setKey(o.key || null); setBase(o.base || Date.now()); setManual(o.manual || []); setInserts(o.inserts || []); setIdx(o.idx || 0);
    const c = o.key && window.ZCASES.find(x => x.key === o.key);
    if (c && was.key === o.key && o.idx === was.at + 1 && stepRef.current) { const a = c.steps.slice(); (o.inserts || []).forEach(i => a.splice(i.at, 0, ...i.steps)); const s = a[o.idx - 1]; if (s) stepRef.current(s); } };
    addEventListener('storage', h); return () => removeEventListener('storage', h); }, []);
  const doStep = () => { const s = steps[at]; if (!s) return; setIdx(at + 1); if (stepRef.current) stepRef.current(s); };
  R.useEffect(() => {
    if (!playing || !cs) return; if (at >= steps.length) { setPlaying(false); return; }
    const s = steps[at], w = (s.wait || 2000) / speed;
    if (s.typing && window.ZFIX.people[s.typing]) setTyping(window.ZFIX.people[s.typing][0]);
    const t = setTimeout(() => { setTyping(null); doStep(); }, w);
    return () => { clearTimeout(t); setTyping(null); };
  }, [playing, at, speed, key, steps]);
  const reset = k => { setKey(k); setIdx(0); setManual([]); setInserts([]); setBase(Math.floor(Date.now() / 60000) * 60000); setPlaying(!!k); };
  return { key, cs, steps, idx: at, sim, playing, speed, typing, setSpeed,
    select: k => reset(k), restart: () => reset(key), toggle: () => { if (at >= steps.length) reset(key); else setPlaying(p => !p); },
    next: () => { setPlaying(false); doStep(); },
    prev: () => { setPlaying(false); const j = Math.max(0, at - 1); setIdx(j); setManual(m => m.filter(x => x.at <= j)); setInserts(x => x.filter(i => i.at <= j)); },
    manual: (evs, origin) => setManual(m => [...m, { at, evs, origin: origin || 'you' }]),
    insert: st => { setInserts(x => [...x, { at, steps: st }]); setPlaying(true); } };
}

function StudioPanel({ eng, persp, setPersp, follow, setFollow }){
  const last = eng.steps[eng.idx - 1], nxt = eng.steps[eng.idx], n = eng.steps.length;
  return <div className="studio">
    <span className="lbl">Use cases</span>
    <div className="uc">
      <button className={'ucd' + (!eng.key ? ' on' : '')} onClick={() => eng.select(null)}><b>Default · Explore freely</b><span>Live sheet data. Nothing scripted.</span></button>
      {window.ZCASES.filter(c => zCaseOn(c.key)).map(c => <button key={c.key} className={eng.key === c.key ? 'on' : ''} title={c.blurb} onClick={() => eng.select(c.key)}>{c.title}</button>)}
    </div>
    {eng.cs && <div className="pb">
      <span className="pbb">{eng.cs.blurb}</span>
      <div className="pbrow">
        <button onClick={eng.prev} disabled={!eng.idx} aria-label="Previous step">Prev</button>
        <button className="pp" onClick={eng.toggle}>{eng.playing ? 'Pause' : eng.idx >= n ? 'Replay' : 'Play'}</button>
        <button onClick={eng.next} disabled={eng.idx >= n} aria-label="Next step">Next</button>
        <button onClick={eng.restart}>Restart</button>
        <select value={eng.speed} onChange={e => eng.setSpeed(+e.target.value)} aria-label="Speed">{[.5, 1, 2, 4].map(x => <option key={x} value={x}>{x}×</option>)}</select>
      </div>
      <div className="bar"><i style={{ width: (n ? eng.idx / n * 100 : 0) + '%' }}></i></div>
      <div className="pbnow"><span>Step {eng.idx} of {n}</span>{last && last.view && (setPersp ? <button className={'where' + (persp !== last.view ? ' off' : '')} onClick={() => setPersp(last.view)}>{persp !== last.view ? 'Happened in ' + ZVIEW[last.view] + ' · show' : ZVIEW[last.view]}</button> : <a className={'where' + (persp !== last.view ? ' off' : '')} href={zPageHref(last.view)} style={{ textDecoration: 'none' }}>{persp !== last.view ? 'Happened in ' + ZVIEW[last.view] + ' · open' : ZVIEW[last.view]}</a>)}</div>
      <b className="pbl">{last ? last.label : 'Ready. Press Play.'}</b>
      {nxt && <span className="pbn">Next: {nxt.label}</span>}
    </div>}
    {setPersp && <><span className="lbl">View as</span>
    <div className="seg" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>{Object.entries(ZVIEW).map(([k, l]) => <button key={k} className={persp === k ? 'on' : ''} onClick={() => setPersp(k)}>{l}</button>)}</div>
    {eng.cs && <label className="fol"><input type="checkbox" checked={follow} onChange={e => setFollow(e.target.checked)} />Switch views to follow the action</label>}</>}
  </div>;
}

function OutcomeCard({ m }){
  return <div className="ocard" data-id={m.id}><small>Outcome · {m.title}<SimTag /></small>
    <div className="ost">{m.stats.map((s, i) => <div key={i}><b>{s[0]}</b><span>{s[1]}</span></div>)}</div>
    {m.notes && m.notes.map((x, i) => <p key={i}>{x}</p>)}</div>;
}
function PollCard({ m, act }){
  const tot = m.options.reduce((a, o) => a + o[1], 0) || 1;
  return <div className="b poll" data-id={m.id}><small style={{ color: 'var(--or)' }}>Neighbors AI · poll<SimTag /></small><span className="bt">{m.text}</span>
    <div className="opts">{m.options.map((o, i) => <button key={i} className={'opt' + (m.voted === i ? ' on' : '')} style={{ gridTemplateColumns: '1fr auto' }} disabled={m.voted !== undefined} onClick={() => act.vote(m.id, i)}><span><b>{o[0]}</b><span className="bar"><i style={{ width: o[1] / tot * 100 + '%' }}></i></span></span><b>{o[1]}</b></button>)}</div></div>;
}

function SupplierApp({ sim, real, pick, setPick, act }){
  const [rid, setRid] = React.useState(''), [claimed, setClaimed] = React.useState({});
  if (!sim) return <SupplierHome real={real} act={act} />;
  const rel = Object.values(sim.suppliers).filter(x => x.inbox.length || x.openings.length || x.id === sim.focus);
  const s = sim.suppliers[pick && rel.some(x => x.id === pick) ? pick : sim.focus] || rel[0];
  if (!s) return <div className="scr"><Header title="Supplier view" /><div className="list"><p className="empty">No supplier is involved in this use case.</p></div></div>;
  const jobs = sim.opps.filter(o => o.chosen === s.id), inbox = s.inbox.slice().reverse(), byDay = {};
  s.calendar.forEach(c => { (byDay[c.day] = byDay[c.day] || []).push(c); });
  return <div className="scr">
    <Header av={initials(s.biz || s.name)} title={s.biz || s.name} sub={s.trade + (s.claimed ? ' · Claimed profile' : ' · Not claimed yet')} />
    {rel.length > 1 && <div className="pad" style={{ paddingBottom: 8 }}><div className="seg-scroll">{rel.map(x => <button key={x.id} className={'fchip' + (x.id === s.id ? ' on' : '')} onClick={() => setPick(x.id)}>{x.biz || x.name}{x.inbox.some(m => m.actions && !m.done) ? <em>!</em> : null}</button>)}</div></div>}
    <div className="list">
      {!s.claimed && <div className="card desk"><span className="lbl" style={{ marginTop: 0 }}>Invitation</span><span className="nb2">Hi {s.name.split(' ')[0]}, you’ve been recommended by {s.recs} residents of {window.HOA.GROUP.name}. Claim your free profile to see and manage service opportunities.</span><button className="btn" style={{ marginTop: 10 }} onClick={() => act.claim(s.id)}>Claim free profile</button></div>}
      {jobs.map(o => { const n = window.ZEngine.count(o), f = o.offers.find(x => x.sid === s.id), p = window.ZEngine.priceFor(f, n);
        return <div key={o.id} className="card" style={{ borderColor: 'var(--ok)' }}><span className="lbl" style={{ marginTop: 0, color: 'var(--ok)' }}>Group job</span><b>{o.title}</b><span className="meta">{n} units · {p ? zMoney(p) + ' per unit' : 'price pending'} · {o.status}</span>
          <span className="meta">{o.filled} of {n} appointments booked</span><div className="bar"><i style={{ width: (n ? o.filled / n * 100 : 0) + '%' }}></i></div>
          {o.week && <div className="facts">{o.week.map((w, i) => <div key={i}><span>{w[0]}</span>{w[1]} · {w[2]} units</div>)}</div>}</div>; })}
      {s.openings.length > 0 && <div className="card"><span className="lbl" style={{ marginTop: 0 }}>Your availability</span>{s.openings.map(o => <div key={o.id} className="item" style={{ marginTop: 6 }}><span><b>{o.day} · {o.where}</b><span className="meta">{o.note || 'Already in the area'}</span></span><span className={'pill ' + (o.left ? 'ok' : 'grey')}>{o.left} of {o.total} open</span></div>)}</div>}
      {Object.keys(byDay).length > 0 && <div className="card"><span className="lbl" style={{ marginTop: 0 }}>Calendar</span>{Object.entries(byDay).map(([d, l]) => <div key={d}><b style={{ fontSize: 14 }}>{d}</b>{l.map((c, i) => <span key={i} className="meta">{c.time} · Unit {c.unit} · {c.what}</span>)}</div>)}<span className="fine" style={{ margin: '6px 0 0' }}>You see unit numbers only. Names stay private.</span></div>}
      <span className="lbl">Messages from Zing</span>
      {!inbox.length && <p className="empty">Nothing yet.</p>}
      {inbox.map(m => <div key={m.id} className="card" style={m.from === 'supplier' ? { background: '#F1F7F3', borderColor: '#CFE6DA' } : null}>
        <span className="lbl" style={{ marginTop: 0 }}>{m.from === 'supplier' ? 'You replied' : 'Zing · ' + (m.via || 'message')}{m.from === 'ai' && <SimTag />}</span><span style={{ fontSize: 14.5 }}>{m.text}</span>
        {m.actions && (m.done ? <span className="meta" style={{ color: 'var(--ok)', fontWeight: 600, marginTop: 6 }}>Sent: {m.done}</span> : <div className="chips" style={{ marginTop: 8 }}>{m.actions.map(([l, k]) => <button key={k} className="slot on" onClick={() => act.nudge(m.id, k)}>{l}</button>)}</div>)}</div>)}
      <ZRep s={s} />
      {s.claimed && <button className="btn ghost" onClick={() => act.addOpening(s.id)}>Add availability</button>}
      <ZFee />
    </div></div>;
}
function ZRep({ s }){
  return <div className="card"><span className="lbl" style={{ marginTop: 0 }}>Your reputation</span><b>{s.recs} neighbor {s.recs === 1 ? 'recommendation' : 'recommendations'}</b>{s.jobs > 0 && <span className="meta">{s.jobs} jobs coordinated through Zing</span>}
    {s.quotes.slice(0, 2).map((q, i) => <span key={i} className="quote">"{q[1]}" · {String(q[0]).split(' ·')[0]}</span>)}
    <span className="fine" style={{ margin: '8px 0 0' }}>Earned only from what neighbors say. Paying never changes it.</span></div>;
}
function ZFee(){ return <div className="card" style={{ background: '#FBFAF7' }}><span className="lbl" style={{ marginTop: 0 }}>How Zing could earn · illustrative, not billed</span><span className="meta">A small fee per extra appointment filled, a share of completed group jobs, or route tools. Paid by providers, never by residents.</span></div>; }

function ZOrigin({ o }){ return <span className={'og og-' + o}>{ZORIG[o] || o}</span>; }

function AIActivity({ sim, eng, real, act }){
  const H = window.HOA, E = window.ZEngine;
  if (!sim) { const req = {}; (real.requests || []).forEach(r => { (req[r.trade] = req[r.trade] || []).push(r); });
    const live = [...Object.entries(req).filter(([t, l]) => t !== 'Other' && l.length >= window.ZCFG.get().bot.minPeople).map(([t, l]) => ({ t: l.length + ' requests for ' + t, d: 'Possible group service. Latest from ' + l[0].who + '.' })),
      ...real.suppliers.filter(s => s.recs >= 5 && window.zOk(s)).slice(0, 4).map(s => ({ t: s.recs + ' neighbors use ' + s.name, d: 'Possible group rate with a trusted ' + s.trade + ' provider.' }))];
    return <div className="aiv"><div className="aih"><b>AI activity</b><span>Development view · not shown to residents</span></div>
      <div className="aib"><p className="fine">Default mode. These are detected by rules on the live directory sheet. Nothing is contacted. Pick a use case to watch a full coordination flow.</p>
        {live.map((x, i) => <div key={i} className="aio"><div className="aiot"><b>{x.t}</b><ZOrigin o="rules" /></div><span className="meta">{x.d}</span></div>)}
        {!live.length && <p className="empty">Nothing detected yet.</p>}</div></div>; }
  const P = sim.people, ppl = Object.keys(sim.dm).filter(r => r !== sim.you || true);
  const man = evs => eng.manual(evs);
  return <div className="aiv">
    <div className="aih"><b>AI activity · {eng.cs.title}</b><span>Development view · not shown to residents</span></div>
    <div className="aib">
      <div className="legend">{Object.keys(ZORIG).map(k => <ZOrigin key={k} o={k} />)}</div>
      <span className="lbl">Opportunities ({sim.opps.length})</span>
      {!sim.opps.length && <p className="fine">Nothing detected yet. Keep playing.</p>}
      {sim.opps.slice().reverse().map(o => { const n = E.count(o);
        return <div key={o.id} className="aio">
          <div className="aiot"><b>{o.title}</b><span className="pill blue">{o.status}</span></div>
          <div className="aim"><span>Confidence <b>{Math.round(o.confidence * 100)}%</b></span><span>{o.kind === 'group' ? <>In <b>{n}</b>{o.goal ? ' of ' + o.goal : ''}{o.declined.length ? ' · ' + o.declined.length + ' declined' : ''}</> : <>Candidates <b>{(o.candidates || []).length}</b></>}</span></div>
          {o.kind === 'group' && <div className="aictl"><span>Change demand</span>{[-5, -1, 1, 5].map(d => <button key={d} className="slot" onClick={() => man([{ t: 'OPP_UPDATE', id: o.id, add: { extra: d } }])}>{d > 0 ? '+' + d : d}</button>)}</div>}
          <div className="aig"><span>Why</span><ul>{o.evidence.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
          {o.factors && <div className="aif">{o.factors.map(([k, v]) => <div key={k}><span>{k}</span>{v}</div>)}</div>}
          <div className="aig"><span>Value</span>{o.value}</div>
          <div className="aig"><span>Outreach allowed</span>{o.permitted}</div>
          {o.requirements && o.requirements.length > 0 && <div className="aig"><span>Requirements</span>{o.requirements.map((r, i) => <div key={i}>{r[0]}: {r[1]}</div>)}</div>}
          <div className="aig"><span>Suggested next action</span>{o.next}</div>
          {o.flow && o.status === 'Detected' && <button className="btn" style={{ marginTop: 8 }} onClick={() => { man([{ t: 'OPP_UPDATE', id: o.id, patch: { status: 'Coordinating' } }]); eng.insert(window.ZFLOWS[o.flow]); }}>Start coordination</button>}
          {o.offers.length > 0 && <div className="aig"><span>Offers at {n} units</span>{o.offers.map(f => { const sp = sim.suppliers[f.sid], pr = E.priceFor(f, n), rej = f.status === 'rejected';
            return <div key={f.sid} className={'aiofr' + (o.chosen === f.sid ? ' on' : '') + (rej ? ' rej' : '')}>
              <div><b>{sp.biz || sp.name}</b> · {pr ? zMoney(pr) + '/unit' : 'needs ' + E.minFor(f) + '+ units'} · {sp.recs} recs{f.dates ? ' · ' + f.dates : ''}{f.note ? ' · ' + f.note : ''}<span className="meta">{f.tiers.map(t => zMoney(t[1]) + ' at ' + t[0] + '+').join(' · ')}{rej ? ' · rejected' : o.chosen === f.sid ? ' · selected' : ''}</span></div>
              {!rej && <div className="chips">{o.chosen !== f.sid && <button className="slot" onClick={() => man([{ t: 'OFFER_SELECTED', id: o.id, sid: f.sid }])}>Select</button>}
                <button className="slot" onClick={() => man([{ t: 'SUPPLIER_MSG', sid: f.sid, from: 'ai', via: 'SMS', text: 'Could you do any better for the group?' }, { t: 'SUPPLIER_MSG', sid: f.sid, from: 'supplier', text: 'For the group, we can take $10 off each tier. (Simulated reply)' }, { t: 'OFFER_UPDATE', id: o.id, sid: f.sid, patch: { tiers: f.tiers.map(([m, v]) => [m, v - 10]), note: 'Renegotiated' } }])}>Ask for better price</button>
                {o.chosen === f.sid && <button className="slot" onClick={() => man([{ t: 'SUPPLIER_MSG', sid: f.sid, from: 'ai', via: 'SMS', text: 'Could you do the following week instead?' }, { t: 'SUPPLIER_MSG', sid: f.sid, from: 'supplier', text: 'Yes, the following week works too. (Simulated reply)' }, { t: 'OFFER_UPDATE', id: o.id, sid: f.sid, patch: { dates: 'Moved to the following week' } }])}>Ask for another date</button>}
                <button className="slot" onClick={() => man([{ t: 'OFFER_UPDATE', id: o.id, sid: f.sid, patch: { status: 'rejected' } }])}>Reject</button></div>}
            </div>; })}</div>}
        </div>; })}
      {ppl.length > 0 && <><span className="lbl">Private conversations ({ppl.length})</span>
        {ppl.map(r => <details key={r} className="aic"><summary>{E.who(sim, r)}{r === sim.you ? ' (you)' : ''} · {sim.dm[r].length}</summary>{sim.dm[r].map(m => <div key={m.id} className={m.me ? 'me' : ''}><b>{m.me ? P[r][0] : 'AI'}</b> {m.text}{m.done ? ' → ' + m.done : ''} <ZOrigin o={m.origin} /></div>)}</details>)}</>}
      {Object.values(sim.suppliers).some(s => s.inbox.length) && <><span className="lbl">Supplier messages</span>
        {Object.values(sim.suppliers).filter(s => s.inbox.length).map(s => <details key={s.id} className="aic"><summary>{s.biz || s.name} · {s.inbox.length}</summary>{s.inbox.map(m => <div key={m.id} className={m.from === 'supplier' ? 'me' : ''}><b>{m.from === 'supplier' ? s.name.split(' ')[0] : 'AI'}</b> {m.text}{m.done ? ' → ' + m.done : ''} <ZOrigin o={m.origin} /></div>)}</details>)}</>}
      {sim.outcomes.length > 0 && <><span className="lbl">Outcomes</span>{sim.outcomes.map((o, i) => <div key={i} className="aio"><b>{o.title}</b><span className="meta">{o.stats.map(s => s[0] + ' ' + s[1]).join(' · ')}</span></div>)}</>}
      {sim.memory.length > 0 && <><span className="lbl">Community memory updates</span>{sim.memory.map((m, i) => <div key={i} className="aig" style={{ marginTop: 4 }}>{m.text}<span className="meta">Source: {m.source}</span></div>)}</>}
      <span className="lbl">Event log</span>
      <div className="alog">{sim.log.slice().reverse().map(l => <div key={l.n}><span className="ls">{l.step < 0 ? 'setup' : 'step ' + (l.step + 1)}</span><code>{l.type}</code><ZOrigin o={l.origin} /><span className="lt">{l.text}</span></div>)}</div>
    </div></div>;
}

/* answers in Ask while a use case is loaded: rules over the scenario's memory, or the real model when available */
async function zAnswerSim(text, sim, V){
  const E = window.ZEngine, t = text.toLowerCase(), opps = sim.opps;
  const sup = Object.values(sim.suppliers).find(s => t.includes((s.biz || s.name).toLowerCase().split(' ')[0]) || t.includes(s.name.toLowerCase().split(' ')[0]));
  if (/why/.test(t) && (sup || /recommend|suggest|pick|choose/.test(t))) { const s = sup || (opps.find(o => o.chosen) && sim.suppliers[opps.find(o => o.chosen).chosen]);
    if (s) return { text: 'I suggested ' + (s.biz || s.name) + ' because ' + s.recs + ' neighbors recommend them' + (s.quotes[0] ? ', for example ' + s.quotes[0][0].split(' ·')[0] + ': "' + s.quotes[0][1] + '"' : '') + '. ' + (s.jobs ? s.jobs + ' jobs went through Zing. ' : '') + 'Recommendations come only from neighbors. Nobody pays to rank higher.', origin: 'rules' }; }
  const o = opps.slice().reverse().find(x => x.offers.length);
  if (o && /cost|price|cheap|offer|save|how much/.test(t)) { const n = E.count(o); return { text: o.title + ': ' + n + ' units in. ' + o.offers.map(f => (sim.suppliers[f.sid].biz || sim.suppliers[f.sid].name) + ' ' + (E.priceFor(f, n) ? '$' + E.priceFor(f, n) : 'needs ' + E.minFor(f) + '+') + (f.status === 'rejected' ? ' (rejected)' : '')).join(', ') + '.', origin: 'rules' }; }
  if (o && /other|different|someone else|another provider/.test(t)) { const rest = o.offers.filter(f => f.sid !== o.chosen && f.status !== 'rejected'); return { text: rest.length ? 'Other options: ' + rest.map(f => sim.suppliers[f.sid].biz || sim.suppliers[f.sid].name).join(', ') + '. You can switch in AI Activity, or tell me which one.' : 'There are no other offers right now. I can ask another recommended provider to quote.', origin: 'rules' }; }
  const it = sim.items.find(i => i.title.toLowerCase().split(/\W+/).some(w => w.length > 4 && t.includes(w)));
  if (it) { const lg = it.log[it.log.length - 1]; return { text: it.title + ': ' + it.status + '.' + (it.reports > 1 ? ' ' + it.reports + ' neighbors reported it.' : '') + (lg ? ' Latest: ' + lg[1] : ''), origin: 'rules' }; }
  if (/event|party|weekend|coming up/.test(t)) return { text: sim.events.length ? sim.events.map(e => e.title + ', ' + e.time + ', ' + e.where + ', ' + e.going + ' going').join('. ') : 'No events yet.', origin: 'rules' };
  if (window.HOAI && window.HOAI.on()) { const r = await window.HOAI.ask(text, V); return { text: r.answer + ' (Real AI. It can read this scenario but can’t change it.)', origin: 'ai' }; }
  return { text: 'I can answer from this use case’s memory: providers, offers, issues and events. Try “Why did you pick CoolBreeze?” or “What does it cost?”', origin: 'rules' };
}

function zSimAct(eng, V, extra){
  const sim = eng.sim, man = (evs, o) => eng.manual(evs, o), no = () => extra.flash('Not available during a use case. Switch to Default to try it.', 'chat');
  return {
    send: async (text, opt = {}) => { man([{ t: 'MESSAGE_POSTED', from: sim.you, text, ...(opt.att || {}), replyTo: opt.replyTo }]);
      if (opt.ai) { const r = await extra.privAnswer(text, V); man([{ t: 'MESSAGE_POSTED', from: 'ai', kind: 'priv', lead: r.lead, answer: r.answer, picks: r.picks, cites: r.cites }], window.HOAI.on() && !r.picks ? 'ai' : 'rules'); } },
    ask: async text => { man([{ t: 'RESIDENT_REPLY', from: sim.you, text }]); const r = await zAnswerSim(text, sim, V); man([{ t: 'AI_DM', to: sim.you, text: r.text }], r.origin); },
    nudge: (mid, k) => man([{ t: 'CHOICE', target: mid, k }]),
    vote: (mid, i) => man([{ t: 'POLL_VOTE', id: mid, opt: i, you: true }]),
    toggleGoing: id => man([{ t: 'RSVP', id }]),
    joinGroupDeal: id => man([{ t: 'JOIN_TOGGLE', id }]),
    addBring: (id, what) => man([{ t: 'EVENT_UPDATE', id, who: sim.you, bring: what }]),
    claim: sid => man([{ t: 'SUPPLIER_UPDATE', sid, patch: { claimed: true } }]),
    addOpening: sid => man([{ t: 'OPENING_SET', sid, opening: { id: 'u' + Date.now(), day: 'Next Friday', where: 'Building A', total: 2, left: 2, note: 'Added by you' } }]),
    doneCatch: () => man([{ t: 'SET', patch: { lastSeen: null } }]),
    joinDeal: no, addItem: no, setItem: no, delItem: no, plusOne: no, addEvent: no, delEvent: no, addPhoto: no, recommend: no, addProvider: no, bookFrom: no, setBooking: no, pick: no, bookNearby: no, pickDay: no, pickWin: no, rate: no
  };
}

Object.assign(window, { useEngine, StudioPanel, SupplierApp, AIActivity, OutcomeCard, PollCard, zSimAct, zAnswerSim });
