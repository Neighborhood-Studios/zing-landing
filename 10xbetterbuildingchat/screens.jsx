/* Zing Neighbors app: shared pieces, Chat and Suppliers */
const { useState: useS, useEffect: useE, useRef: useR } = React;

const Ico = ({ d, s = 22 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const I = {
  chat: <path d="M4 5h16v11H8l-4 4z" />,
  sup: <g><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .8 3 2.8 3 6" /></g>,
  ev: <g><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></g>,
  bld: <g><path d="M5 21V5a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 15 5v16" /><path d="M15 10h3.5A1.5 1.5 0 0 1 20 11.5V21M3 21h18M8.5 8h3M8.5 12h3M8.5 16h3" /></g>,
  agent: <g><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" /><path d="M18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z" /></g>,
  plus: <path d="M12 5v14M5 12h14" />,
  send: <path d="M4 12l16-8-6 16-2-6z" />,
  search: <g><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></g>,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  wa: <g><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z" /><path d="M9 9.5c.3 2 2.5 4.2 4.5 4.5l1-1.2 1.5.7c-.2 1-1 1.6-2 1.5-3-.3-5.7-3-6-6-.1-1 .5-1.8 1.5-2l.7 1.5z" /></g>,
  cam: <g><path d="M4 8h3l2-2.5h6L17 8h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></g>,
  user: <g><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20.5c.8-3.8 3.9-6 7.5-6s6.7 2.2 7.5 6" /></g>,
  jobs: <g><rect x="3.5" y="7" width="17" height="13" rx="2" /><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3.5 12.5h17" /></g>
};
const COLORS = ['#2B59C3', '#B4471A', '#2F7D5B', '#7B3FA8', '#A32626', '#0E7C86', '#8A6E1F', '#C2185B'];
const colorOf = n => { let h = 0; for (const c of String(n)) h = (h * 31 + c.charCodeAt(0)) % 997; return COLORS[h % COLORS.length]; };
const initials = n => String(n || '?').replace(/[^A-Za-zÀ-ÿ ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

function Header({ title, sub, av, right, st, act }){
  const me = st && st.me;
  return <div className="hd">{av && <span className="hav">{av}</span>}<div className="hd-t"><b>{title}</b>{sub && <span>{sub}</span>}</div>{right}
    {act && <button className="meb" aria-label="You and settings" onClick={act.openMe}>{me && me.name ? initials(me.name) : <Ico d={I.user} s={18} />}</button>}</div>;
}
function Sheet({ onClose, children }){
  return <div className="sheet-bg" onClick={onClose}><div className="sheet" onClick={e => e.stopPropagation()}><span className="grab"></span>{children}</div></div>;
}
function Field({ label, children }){ return <label className="fld"><span>{label}</span>{children}</label>; }
function useBottom(dep){ const r = useR(null); useE(() => { const el = r.current; if (el) el.scrollTo({ top: el.scrollHeight }); }, [dep]); return r; }

function Bubble({ m, go, hl }){
  const out = m.from === 'You';
  return <div data-id={m.id} className={'b' + (out ? ' out' : '') + (m.fresh ? ' fresh' : '') + (hl ? ' hl' : '')}>
    {!out && <small style={{ color: m.desk ? 'var(--or)' : colorOf(m.from) }}>{m.from}{m.sim && <SimTag />}</small>}
    {m.text && <span className="bt">{m.text}</span>}
    <time>{m.time}{out && <em>✓✓</em>}</time>
    {m.pending && <div className="chips"><span className="chip c-pending">● Sorting…</span></div>}
    {m.chips && m.chips.length > 0 && <div className="chips">{m.chips.map((c, i) => <button key={i} className={'chip c-' + c[1]} style={{ animationDelay: (m.fresh ? .5 + i * .35 : 0) + 's' }} onClick={() => go(c[1], c[2])}>● {c[0]}</button>)}</div>}
  </div>;
}

/* ChatScreen lives in chat.jsx */

function SupplierSheet({ s, st, act, ui, onClose }){
  const H = window.HOA, [rec, setRec] = useS(null), first = s.name.split(' ')[0], wa = s.phone ? 'https://wa.me/' + H.waNum(s.phone) + '?text=' + encodeURIComponent('Hi ' + first + '! I got your number from my neighbors in the ' + H.GROUP.name + ' group.') : null;
  return <Sheet onClose={onClose}>
    <div className="sh-top"><span className="sav lg" style={{ background: colorOf(s.name) }}>{initials(s.name)}</span><div><h3>{s.name}</h3><span className="meta">{s.biz ? s.biz + ' · ' : ''}{s.trade}{s.firstD ? ' · first mentioned ' + H.ago(new Date(s.firstD)) : ''}</span></div></div>
    <div className="stats"><div><b>{s.recs}</b><span>{s.recs === 1 ? 'recommendation' : 'recommendations'}</span></div>{s.lastD && <span>last {H.ago(new Date(s.lastD))}</span>}</div>
    {s.warnings && <div className="warnb"><b>Heads up from neighbors</b>{s.warnings}</div>}
    {(s.services || s.bestFor || s.price) && <div className="facts">{s.services && <div><span>Does</span>{s.services}</div>}{s.bestFor && <div><span>Best for</span>{s.bestFor}</div>}{s.price && <div><span>Price notes</span>{s.price}</div>}</div>}
    {s.phone && <div className="crow"><a className="btn" href={'tel:+' + H.waNum(s.phone)}><Ico d={I.phone} s={17} />Call</a><a className="btn ghost" href={wa} target="_blank" rel="noopener"><Ico d={I.wa} s={17} />WhatsApp</a></div>}
    {!s.phone && s.other && <p className="fine">Contact: {s.other}</p>}
    <span className="lbl">What neighbors said</span>
    {s.quotes.length ? s.quotes.slice(0, 8).map((x, i) => <div key={i} className="qt">"{x[1]}"<small>{x[0]}{x[2] ? ' · ' + H.fmtDay(new Date(x[2])) : ''}</small></div>) : <p className="fine">{s.byList && s.byList.length ? 'Recommended by ' + s.byList.join(', ') + '.' : 'No quotes saved yet.'}</p>}
    {rec === null ? <div className="crow"><button className="btn ghost" onClick={() => setRec('')}>I recommend {first}</button>{ui.role !== 'provider' && <button className="btn" onClick={() => { onClose(); act.bookFrom(s.id); }}>Book</button>}</div>
      : <div className="askrow"><input value={rec} onChange={e => setRec(e.target.value)} placeholder={'What did ' + first + ' do for you?'} autoFocus /><button className="sendb" aria-label="Save" onClick={() => { act.recommend(s.id, rec.trim()); setRec(null); }}><Ico d={I.check} s={19} /></button></div>}
  </Sheet>;
}

function AddProvider({ act, onClose, trade }){
  const H = window.HOA, [f, setF] = useS({ name: '', trade: trade && trade !== 'All' ? trade : 'Handyman', phone: '', quote: '' }), set = k => e => setF({ ...f, [k]: e.target.value });
  return <Sheet onClose={onClose}><h3>Add a provider</h3><span className="meta">Saved on this device. Recommend them in the group too so the bot adds them to the shared directory.</span>
    <Field label="Name"><input value={f.name} onChange={set('name')} autoFocus /></Field>
    <Field label="Category"><select value={f.trade} onChange={set('trade')}>{H.TRADES.map(t => <option key={t}>{t}</option>)}</select></Field>
    <Field label="Phone"><input value={f.phone} onChange={set('phone')} inputMode="tel" placeholder="(305) 555-0100" /></Field>
    <Field label="Why you recommend them"><input value={f.quote} onChange={set('quote')} /></Field>
    <button className="btn" disabled={!f.name.trim()} onClick={() => { act.addProvider({ ...f, name: f.name.trim() }); onClose(); }}>Add provider</button>
  </Sheet>;
}

function SuppliersScreen({ st, act, ui }){
  const H = window.HOA, [mode, setMode] = useS('dir'), [q, setQ] = useS(''), [tr, setTr] = useS('All'), [open, setOpen] = useS(null), [adding, setAdding] = useS(false), [rq, setRq] = useS(null);
  useE(() => { const t = ui.target; if (!t) return; if (t === 'deals') { setMode('deals'); return; } if (String(t).startsWith('req:')) { setMode('req'); setRq(t.slice(4)); } else if (st.suppliers.some(s => s.id === t)) { setMode('dir'); setTr('All'); setQ(''); } else if (H.TRADES.includes(t)) { setMode('dir'); setTr(t); setQ(''); } }, [ui.target]);
  const used = H.TRADES.filter(t => st.suppliers.some(s => s.trade === t));
  const list = st.suppliers.filter(s => (tr === 'All' || s.trade === tr) && (!q || (s.name + ' ' + s.trade + ' ' + s.biz + ' ' + (s.services || '')).toLowerCase().includes(q.toLowerCase()))).sort((a, b) => !!a.warnings - !!b.warnings || b.recs - a.recs);
  const sel = open && st.suppliers.find(s => s.id === open);
  const reqSel = rq && st.requests.find(r => r.id === rq);
  const openReqs = st.requests.filter(r => !r.answers.length).length;
  const deals = (() => { const ok = st.suppliers.filter(x => !x.warnings && !/^unnamed|\(via/i.test(x.name)), out = [];
    const tl = t => /[A-Z]{2}/.test(t) ? t : t.toLowerCase(), pl = t => /[A-Z]{2}/.test(t) ? t + ' providers' : /^\w+$/.test(t) ? t.toLowerCase() + 's' : t.toLowerCase() + ' providers';
    ok.filter(x => x.recs >= 5).sort((a, b) => b.recs - a.recs).slice(0, 2).forEach(x => out.push({ id: 'p:' + x.id, kind: 'Shared provider', title: x.recs + ' neighbors already use ' + x.name, body: 'You already trust ' + x.name + ' for ' + tl(x.trade) + ' work. If enough residents sign up, we’ll reach out and negotiate a group rate for everyone, say once 20 residents join.' }));
    H.TRADES.forEach(t => { const g = ok.filter(x => x.trade === t).sort((a, b) => b.recs - a.recs); if (g.length >= 3) out.push({ id: 't:' + t, kind: 'Compare and save', title: g.length + ' ' + pl(t) + ' work for this building', body: 'We can ask the top two, ' + g[0].name + ' and ' + g[1].name + ', for better prices and handle the negotiating. Let us know if you’re interested.' }); });
    return out.slice(0, 4); })();
  return <div className="scr">
    <Header title="Providers" sub={st.suppliers.length + ' recommended in the group'} st={st} act={act} right={<button className="ib" aria-label="Add a provider" onClick={() => setAdding(true)}><Ico d={I.plus} /></button>} />
    <div className="pad">
      <div className="seg" style={{ gridTemplateColumns: 'repeat(' + (1 + zOn('requests') + zOn('deals')) + ',1fr)' }}><button className={mode === 'dir' ? 'on' : ''} onClick={() => setMode('dir')}>Directory</button>{zOn('requests') && <button className={mode === 'req' ? 'on' : ''} onClick={() => setMode('req')}>Requests{openReqs ? ' · ' + openReqs : ''}</button>}{zOn('deals') && <button className={mode === 'deals' ? 'on' : ''} onClick={() => setMode('deals')}>Deals</button>}</div>
      {mode === 'dir' && <><label className="srch"><Ico d={I.search} s={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search plumber, AC, cleaner…" aria-label="Search providers" /></label>
      <div className="seg-scroll">{['All', ...used].map(t => <button key={t} className={'fchip' + (t === tr ? ' on' : '')} onClick={() => setTr(t)}>{t}</button>)}</div></>}
    </div>
    {mode === 'deals' ? <div className="list">
      <div className="card desk"><span className="lbl" style={{ marginTop: 0 }}>Group deals</span><span style={{ display: 'block', font: "400 16px/1.45 'Libre Caslon Text',serif", marginTop: 4 }}>We look at who your neighbors already trust and work with them directly to get the building better prices on services.</span></div>
      {!st.sim && <PoolDeals st={st} />}
      {(st.groupDeals || []).map(g => { const inn = g.units.includes('You'); return <div key={g.id} className="card" style={{ borderColor: 'var(--ok)' }}>
        <span className="lbl" style={{ marginTop: 0, color: 'var(--ok)' }}>Started from the chat<SimTag /></span><b>{g.title}</b>
        <span className="meta">{g.units.length} of {g.goal} units · {g.status}</span><div className="bar"><i style={{ width: Math.min(100, g.units.length / g.goal * 100) + '%' }}></i></div>
        {g.note && <span className="meta" style={{ color: 'var(--ok)', fontWeight: 600 }}>{g.note}</span>}<span className="meta dim">{g.units.length} {g.units.length === 1 ? 'household' : 'households'} in so far. Nobody sees who joined. Provider: {g.provider}.</span>
        <div className="chips" style={{ marginTop: 10 }}><button className={'slot' + (inn ? ' on' : '')} onClick={() => act.joinGroupDeal(g.id)}>{inn ? 'You’re in · tap to leave' : 'I’m interested'}</button></div></div>; })}

    </div> : mode === 'dir' ? <div className="list">
      {(tr !== 'All' || H.tradeOf(q)) && <NearbyVisits st={st} act={act} trade={tr !== 'All' ? tr : H.tradeOf(q)} />}
      {list.map(s => <button key={s.id} className={'card sup' + (ui.target === s.id ? ' hl' : '')} onClick={() => setOpen(s.id)}>
        <span className="sav" style={{ background: colorOf(s.name) }}>{initials(s.name)}</span>
        <span><b>{s.name}{s.biz ? ' · ' + s.biz : ''}</b><span className="meta">{s.trade} · <strong>{s.recs} {s.recs === 1 ? 'rec' : 'recs'}</strong>{s.local ? ' · added here' : ''}</span>{s.warnings ? <span className="meta warn">Has a warning from neighbors</span> : s.quotes[0] ? <span className="quote">"{short2(s.quotes[0][1])}"</span> : null}</span>
      </button>)}
      {!list.length && <p className="empty">{st.sheet ? 'Nobody in the group has mentioned one yet.' : 'Loading the directory…'}</p>}
    </div> : <div className="list">
      {st.requests.map(r => <button key={r.id} className={'card' + (ui.target === 'req:' + r.id ? ' hl' : '')} onClick={() => setRq(r.id)}>
        <div className="item"><span><span className="ev-when">{r.trade}</span><b>"{short2(r.text)}"</b><span className="meta">{r.who} · {H.fmtDay(r.d)}</span></span><span className={'pill ' + (r.answers.length ? 'ok' : 'or')}>{r.answers.length ? plural2(r.answers.length, 'reply', 'replies') : 'Open'}</span></div>
      </button>)}
      {!st.requests.length && <p className="empty">No requests yet. When someone asks the group for a recommendation, it shows up here.</p>}
    </div>}
    {sel && <SupplierSheet s={sel} st={st} act={act} ui={ui} onClose={() => setOpen(null)} />}
    {adding && <AddProvider act={act} trade={tr} onClose={() => setAdding(false)} />}
    {reqSel && <Sheet onClose={() => setRq(null)}>
      <span className="ev-when">{reqSel.trade} · {H.fmtDay(reqSel.d)}</span><h3 style={{ marginTop: 4 }}>"{reqSel.text}"</h3><span className="meta">Asked by {reqSel.who}</span>
      <span className="lbl">{reqSel.answers.length ? 'Neighbors suggested' : 'No replies yet'}</span>
      {reqSel.answers.map((a, i) => { const s = a.sid && st.suppliers.find(x => x.id === a.sid); return <button key={i} className="opt" onClick={() => { if (s) { setRq(null); setMode('dir'); setOpen(s.id); } }}><span className="sav sm" style={{ background: colorOf(a.name || '?') }}>{initials(a.name)}</span><span><b>{a.name || 'A provider'}</b><span className="meta">from {a.who}</span></span></button>; })}
      {(() => { const picks = st.suppliers.filter(s => s.trade === reqSel.trade && !s.warnings && !reqSel.answers.some(a => a.sid === s.id)).sort((a, b) => b.recs - a.recs).slice(0, 3); return picks.length ? <><span className="lbl">Also recommended for {reqSel.trade.toLowerCase()}</span>{picks.map(s => <button key={s.id} className="opt" onClick={() => { setRq(null); setMode('dir'); setOpen(s.id); }}><span className="sav sm" style={{ background: colorOf(s.name) }}>{initials(s.name)}</span><span><b>{s.name}</b><span className="meta">{s.recs} recs</span></span></button>)}</> : null; })()}
    </Sheet>}
  </div>;
}
const short2 = t => (t || '').length > 90 ? t.slice(0, 88) + '…' : (t || '');
const plural2 = (n, a, b) => n + ' ' + (n === 1 ? a : b);

Object.assign(window, { Ico, I, Header, Sheet, Field, Bubble, SuppliersScreen, colorOf, initials, useBottom });
