/* Zing Neighbors App: group deals UI (Resident → Providers → Deals) and the AI Control panel. Engine in pool.js. */
const zMoneyP = n => '$' + Number(n).toLocaleString('en-US');
const ZPSTAT = { 'Collecting': 'blue', 'Getting quotes': 'blue', 'Negotiating': 'or', 'Choose a provider': 'or', 'Need more neighbors': 'or', 'Locked in': 'ok', 'Cancelled': 'grey', 'No providers': 'grey', 'No offers': 'grey' };
const ZOSTAT = { asked: 'Asked', quoted: 'Quoted', negotiating: 'Negotiating', declined: 'Declined', 'no reply': 'No reply', 'opted out': 'Opted out', replied: 'Needs a call', chosen: 'Chosen', 'not chosen': 'Not chosen' };

function usePools(){ const [l, setL] = React.useState(() => window.ZPool.list()); React.useEffect(() => window.ZPool.subscribe(() => setL(window.ZPool.list())), []); return l; }
function usePoolEngine(getSups){
  const g = React.useRef(getSups); g.current = getSups;
  React.useEffect(() => { const run = () => { window.ZPool.process(); window.ZPool.tick(g.current()); };
    run(); const un = window.ZSMS.subscribe(() => window.ZPool.process()); const iv = setInterval(run, 3000); return () => { un(); clearInterval(iv); }; }, []);
}

function PoolOffers({ p, canPick, admin }){
  const P = window.ZPool, k = P.count(p);
  if (!p.offers.length) return null;
  return <div className="poffers">{p.offers.map(o => { const pr = P.priceFor(o, k), mn = P.minFor(o), dead = /declined|no reply|opted out|not chosen/.test(o.status);
    return <div key={o.sid} className={'poff' + (o.status === 'chosen' ? ' on' : '') + (dead ? ' dead' : '')}>
      <div className="pofft"><b>{o.name}</b><span className={'pill ' + (o.status === 'chosen' ? 'ok' : dead ? 'grey' : o.status === 'replied' ? 'or' : 'blue')}>{ZOSTAT[o.status] || o.status}</span></div>
      <span className="meta" style={{ marginTop: 0 }}>{o.recs} {o.recs === 1 ? 'recommendation' : 'recommendations'}{o.dates ? ' · ' + o.dates : ''}{o.negotiated ? ' · negotiated' : ''}</span>
      {o.tiers.length > 0 && <span className="pprice">{pr !== null ? <><b>{zMoneyP(pr)}</b> per unit at {k} units</> : <>Needs {mn - k} more {mn - k === 1 ? 'household' : 'households'} to unlock <b style={{ fontSize: 17 }}>{zMoneyP((o.tiers.find(t => t[0] === mn) || o.tiers[0])[1])}</b></>}<em>{o.tiers.map(t => zMoneyP(t[1]) + ' at ' + t[0] + '+').join(' · ')}</em></span>}
      {o.status === 'replied' && <span className="meta">They replied “{o.reply}”. Someone needs to call them.</span>}
      {(canPick || admin) && p.status !== 'Locked in' && p.status !== 'Cancelled' && <div className="chips">
        {canPick && pr !== null && !dead && <button className="slot on" onClick={() => P.choose(p.id, o.sid)}>Choose {o.name.split(' ')[0]}</button>}
        {admin && o.tiers.length > 0 && !dead && o.status !== 'negotiating' && <button className="slot" onClick={() => P.negotiateWith(p.id, o.sid)}>Ask for a better price</button>}</div>}
    </div>; })}</div>;
}

function PoolCard({ p, st }){
  const P = window.ZPool, H = window.HOA, k = P.count(p), me = st.me, mine = p.by === 'You' || (me.name && p.by.indexOf(me.name) === 0);
  const pickAuto = window.ZCFG.get().bot.poolPick === 'auto', canPick = p.status === 'Choose a provider' && !pickAuto && (mine || p.you);
  const ch = p.chosen && p.offers.find(o => o.sid === p.chosen), chp = ch && P.priceFor(ch, k);
  const days = Array.from({ length: 5 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 3); return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); });
  return <div className="card pcard">
    <div className="item"><span><span className="lbl" style={{ marginTop: 0, color: 'var(--ok)' }}>Group deal · {p.trade}</span><b>{p.title}</b></span><span className={'pill ' + (ZPSTAT[p.status] || 'grey')}>{p.status}</span></div>
    <span className="meta">{k} {k === 1 ? 'household' : 'households'} in{p.goal ? ' · goal ' + p.goal : ''}{p.invited ? ' · ' + p.invited + ' asked about it in the group' : ''}</span>
    <div className="bar"><i style={{ width: Math.min(100, k / (p.goal || 20) * 100) + '%' }}></i></div>
    {p.status === 'Collecting' && <span className="meta">Zing asks the 3 most recommended providers for a group price once {window.ZCFG.get().bot.poolQuoteAt || 5} households are in.</span>}
    {p.status === 'Getting quotes' && <span className="meta">Zing texted {p.offers.map(o => o.name).join(', ')} for a group price.</span>}
    {p.status === 'Negotiating' && <span className="meta">Zing is negotiating with the most recommended provider, using the other quotes.</span>}
    {p.status === 'Need more neighbors' && <span className="meta" style={{ color: 'var(--warn)', fontWeight: 600 }}>The offers need more households. Invite neighbors to join, and the best price unlocks automatically.</span>}
    {p.status === 'Choose a provider' && <span className="meta" style={{ color: 'var(--warn)', fontWeight: 600 }}>{pickAuto ? 'Zing is picking the lowest price.' : canPick ? 'The offers are in. Choose one for the group.' : 'The offers are in. The organizer is choosing.'}</span>}
    <PoolOffers p={p} canPick={canPick} />
    {ch && <div className="facts"><div><span>Locked in</span>{ch.name} · {zMoneyP(chp)} per unit for {k} units</div><div><span>Typical single visit (estimate)</span>{zMoneyP(p.base)}</div></div>}
    {ch && p.you && !p.mySlot && <><span className="lbl">Pick your day</span><div className="chips">{days.map(d => <button key={d} className="slot" onClick={() => P.book(p.id, d, me.unit)}>{d}</button>)}</div></>}
    {ch && p.mySlot && <span className="meta" style={{ color: 'var(--ok)', fontWeight: 600 }}>You’re booked for {p.mySlot}. Zing sent {ch.name.split(' ')[0]} your unit number.</span>}
    {!/Locked in|Cancelled/.test(p.status) && <div className="chips" style={{ marginTop: 10 }}><button className={'slot' + (p.you ? ' on' : '')} onClick={() => P.join(p.id)}>{p.you ? 'You’re in · tap to leave' : 'Count me in'}</button></div>}
    {p.log && p.log.length > 0 && <details className="plog"><summary>What Zing did ({p.log.length})</summary>{p.log.slice().reverse().map((l, i) => <div key={i}><span>{H.fmtTime(new Date(l[0]))}</span>{l[1]}</div>)}</details>}
  </div>;
}

function StartPool({ st, onClose, preset }){
  const P = window.ZPool, trades = window.HOA.TRADES.filter(t => P.top(t, st.suppliers).length);
  const [f, setF] = React.useState({ trade: preset || trades[0] || 'AC / HVAC', need: '', goal: 20 });
  const tops = P.top(f.trade, st.suppliers);
  return <Sheet onClose={onClose}><h3>Start a group deal</h3><span className="meta">Neighbors join, then Zing asks the most recommended providers for a group price and negotiates.</span>
    <Field label="Service"><select value={f.trade} onChange={e => setF({ ...f, trade: e.target.value })}>{trades.map(t => <option key={t}>{t}</option>)}</select></Field>
    <Field label="What’s needed"><input value={f.need} onChange={e => setF({ ...f, need: e.target.value })} placeholder={P.SVC[f.trade] || 'Describe the job'} /></Field>
    <Field label="Goal (households)"><input type="number" min="3" max="200" value={f.goal} onChange={e => setF({ ...f, goal: +e.target.value || 20 })} /></Field>
    {tops.length > 0 && <p className="fine">Zing will ask {tops.map(s => s.name + ' (' + s.recs + ')').join(', ')}.</p>}
    <button className="btn" disabled={!tops.length} onClick={() => { P.create({ trade: f.trade, need: f.need.trim(), goal: f.goal, you: true, by: 'You' }); onClose(); }}>Start and count me in</button>
  </Sheet>;
}

function PoolDeals({ st }){
  const P = window.ZPool, pools = usePools(), [start, setStart] = React.useState(null);
  if (!zOn('groupBuying')) return null;
  const sugg = P.detect(st.requests, st.suppliers, window.ZCFG.get().bot.minPeople || 3);
  const shown = pools.filter(p => p.status !== 'Cancelled');
  return <>
    {sugg.slice(0, 2).map(s => <div key={s.trade} className="card" style={{ borderColor: 'var(--or)', background: '#FFF8F3' }}>
      <span className="lbl" style={{ marginTop: 0, color: 'var(--or)' }}>Shared need</span><b>{s.n} neighbors asked for {/[A-Z]{2}/.test(s.trade) ? s.trade : s.trade.toLowerCase()} help in the last month</b>
      <span className="meta" style={{ color: 'var(--ink2)', marginTop: 4 }}>If enough of you join, Zing will ask {s.top.map(x => x.name).join(', ')} for a group price and negotiate it for everyone.</span>
      <div className="chips" style={{ marginTop: 10 }}><button className="slot on" onClick={() => P.create({ trade: s.trade, you: true, by: 'You', invited: s.n, from: 'detect' })}>Start it and count me in</button></div></div>)}
    {shown.map(p => <PoolCard key={p.id} p={p} st={st} />)}
    <button className="btn ghost" onClick={() => setStart(true)}>Start a group deal</button>
    {start && <StartPool st={st} onClose={() => setStart(null)} />}
  </>;
}

function PoolAdmin({ cfg, setBot, sups, requests }){
  const P = window.ZPool, pools = usePools(), b = cfg.bot;
  const sugg = P.detect(requests, sups, b.minPeople || 3);
  return <div className="apanel">
    <div className="aph"><b>Group deals</b><span>Pool demand, get quotes, negotiate</span></div>
    <div className="amod" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}><div className="amt"><b>Ask for quotes automatically</b><span>Text the 3 most recommended providers once {b.poolQuoteAt || 5} households are in.</span></div><ASwitch on={b.poolAutoQuote !== false} label="Ask for quotes automatically" onChange={v => setBot({ poolAutoQuote: v })} /></div>
    <div className="arow"><span className="lbl" style={{ marginTop: 0 }}>Households before asking for quotes</span><div className="arange"><input type="range" min="2" max="30" value={b.poolQuoteAt || 5} onChange={e => setBot({ poolQuoteAt: +e.target.value })} aria-label="Households before asking" /><b>{b.poolQuoteAt || 5}</b></div></div>
    <div className="amod" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}><div className="amt"><b>Negotiate automatically</b><span>When the quotes are in, text the most recommended provider with the best competing price and ask them to beat it.</span></div><ASwitch on={b.poolNegotiate !== false} label="Negotiate automatically" onChange={v => setBot({ poolNegotiate: v })} /></div>
    <div className="arow"><span className="lbl" style={{ marginTop: 0 }}>Who picks the provider</span><ASeg value={b.poolPick || 'organizer'} options={[['organizer', 'The organizer'], ['auto', 'Lowest price, automatically']]} onChange={v => setBot({ poolPick: v })} /></div>
    {sugg.length > 0 && <><span className="lbl">Shared needs found in requests</span>{sugg.map(s => <div key={s.trade} className="amod" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}><div className="amt"><b>{s.n} requests for {s.trade}</b><span>Would ask {s.top.map(x => x.name + ' (' + x.recs + ')').join(', ')}</span></div><button className="slot" onClick={() => P.create({ trade: s.trade, invited: s.n, from: 'detect', by: 'Neighbors AI' })}>Start</button></div>)}</>}
    <span className="lbl">Active deals</span>
    {!pools.length && <p className="fine">None yet. Start one from a shared need, or from Providers → Deals on the Resident page.</p>}
    {pools.map(p => { const k = P.count(p); return <div key={p.id} className="pad-adm">
      <div className="aiot" style={{ color: 'var(--ink)' }}><b>{p.title} · {k} in</b><span className={'pill ' + (ZPSTAT[p.status] || 'grey')}>{p.status}</span></div>
      <div className="chips">
        {!/Locked in|Cancelled/.test(p.status) && <><button className="slot" onClick={() => P.addOthers(p.id, 1)}>+1 neighbor</button><button className="slot" onClick={() => P.addOthers(p.id, 5)}>+5 neighbors</button></>}
        {p.status === 'Collecting' && <button className="slot" onClick={() => P.askQuotes(p.id, sups)}>Ask for quotes now</button>}
        {p.status === 'Choose a provider' && <button className="slot" onClick={() => P.autoChoose(p.id)}>Pick the lowest price</button>}
        {!/Locked in|Cancelled/.test(p.status) && <button className="slot" onClick={() => { if (confirm('Cancel this group deal? Providers who were asked get a short thank-you text.')) P.cancel(p.id); }}>Cancel</button>}
      </div>
      <span className="fine" style={{ margin: 0 }}>Neighbors joining here is simulated for testing.</span>
      <PoolOffers p={p} canPick={p.status === 'Choose a provider'} admin />
      {p.log && p.log.length > 0 && <details className="plog"><summary>Log ({p.log.length})</summary>{p.log.slice().reverse().map((l, i) => <div key={i}><span>{window.HOA.fmtTime(new Date(l[0]))}</span>{l[1]}</div>)}</details>}
    </div>; })}
    {pools.length > 0 && <button className="slot" style={{ alignSelf: 'flex-start' }} onClick={() => { if (confirm('Delete all test group deals?')) P.clear(); }}>Clear test deals</button>}
  </div>;
}

Object.assign(window, { usePoolEngine, PoolDeals, PoolAdmin, PoolCard });
