/* Zing Neighbors app: Events, Building, Agent, Jobs (provider), You/settings, tab bar */
const { useState: uS2, useEffect: uE2, useRef: uR2 } = React;
const HH = window.HOA;
const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const evWhen = e => { const d = HH.parseDate(e.date); return (d ? HH.fmtDay(d) === 'Today' || HH.fmtDay(d) === 'Tomorrow' ? HH.fmtDay(d) : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date TBD') + (e.time ? ' · ' + e.time : ''); };

function AddEvent({ act, onClose }){
  const [f, setF] = uS2({ title: '', date: todayStr(), time: '', where: '' }), set = k => e => setF({ ...f, [k]: e.target.value });
  return <Sheet onClose={onClose}><h3>Add an event</h3>
    <Field label="What"><input value={f.title} onChange={set('title')} placeholder="Pool party, board meeting…" autoFocus /></Field>
    <div className="frow"><Field label="Date"><input type="date" value={f.date} onChange={set('date')} /></Field><Field label="Time"><input value={f.time} onChange={set('time')} placeholder="4 PM" /></Field></div>
    <Field label="Where"><input value={f.where} onChange={set('where')} placeholder="Pool deck" /></Field>
    <button className="btn" disabled={!f.title.trim()} onClick={() => { act.addEvent({ ...f, title: f.title.trim() }); onClose(); }}>Add event</button>
  </Sheet>;
}

function EventsScreen({ st, act, ui, top }){
  const [tab, setTab] = uS2('up'), [open, setOpen] = uS2(null), [adding, setAdding] = uS2(false), [bring, setBring] = uS2(''), file = uR2(null);
  const up = e => (e.date || todayStr()) >= todayStr();
  uE2(() => { const e = st.events.find(x => x.id === ui.target); if (e) setTab(up(e) ? 'up' : 'past'); }, [ui.target]);
  const list = st.events.filter(e => (tab === 'up') === up(e)).sort((a, b) => (tab === 'up' ? 1 : -1) * (a.date || '').localeCompare(b.date || ''));
  const sel = open && st.events.find(e => e.id === open);
  return <div className="scr">
    <Header title={top ? 'Building' : 'Events'} sub={top ? 'Maintenance, safety, events and notices' : 'Shared with neighbors on this device'} st={st} act={act} right={<button className="ib" aria-label="Add an event" onClick={() => setAdding(true)}><Ico d={I.plus} /></button>} />
    {!top && <div className="pad"><div className="seg"><button className={tab === 'up' ? 'on' : ''} onClick={() => setTab('up')}>Upcoming</button><button className={tab === 'past' ? 'on' : ''} onClick={() => setTab('past')}>Past</button></div></div>}
    <div className="list">
      {top}
      {top && <div className="seg"><button className={tab === 'up' ? 'on' : ''} onClick={() => setTab('up')}>Upcoming</button><button className={tab === 'past' ? 'on' : ''} onClick={() => setTab('past')}>Past</button></div>}
      {list.map(e => <button key={e.id} className={'card ev' + (ui.target === e.id ? ' hl' : '')} onClick={() => setOpen(e.id)}>
        <span className="ev-when">{evWhen(e)}</span><b>{e.title}{e.sim && <SimTag />}</b><span className="meta">{e.where ? e.where + ' · ' : ''}{e.going} {up(e) ? 'going' : 'went'}{st.going[e.id] ? ' (you too)' : ''} · by {e.by}</span>
        {e.photos.length > 0 && <div className="tiles row">{e.photos.slice(0, 3).map((p, i) => <img key={i} src={p.src} alt="" />)}</div>}
      </button>)}
      {!list.length && <p className="empty">{tab === 'up' ? 'Nothing planned yet. Tap + to add one, or mention it in the chat.' : 'No past events yet.'}</p>}
    </div>
    {adding && <AddEvent act={act} onClose={() => setAdding(false)} />}
    {sel && <Sheet onClose={() => setOpen(null)}>
      <span className="ev-when">{evWhen(sel)}{sel.where ? ' · ' + sel.where : ''}</span><h3 style={{ marginTop: 6 }}>{sel.title}</h3><span className="meta">{sel.going} {up(sel) ? 'going' : 'went'} · posted by {sel.by}</span>
      {sel.bring && sel.bring.length > 0 && <div className="facts">{sel.bring.map((b, i) => <div key={i}><span>{b[0]}</span>{b[1]}</div>)}</div>}
      {up(sel) && <div className="askrow"><input value={bring} onChange={e => setBring(e.target.value)} placeholder="I’ll bring…" aria-label="What you’re bringing" /><button className="sendb" aria-label="Add" onClick={() => { if (bring.trim()) { act.addBring(sel.id, bring.trim()); setBring(''); } }}><Ico d={I.check} s={19} /></button></div>}
      <div className="crow">{up(sel) && <button className={'btn' + (st.going[sel.id] ? ' ghost' : '')} onClick={() => act.toggleGoing(sel.id)}>{st.going[sel.id] ? 'Not going anymore' : 'I’m going'}</button>}<button className="btn ghost" onClick={() => file.current.click()}><Ico d={I.cam} s={17} />Add photo</button></div>
      <input ref={file} type="file" accept="image/*" hidden onChange={e => { if (e.target.files[0]) act.addPhoto(sel.id, e.target.files[0]); e.target.value = ''; }} />
      <span className="lbl">Album · {sel.photos.length} photos</span>
      {sel.photos.length ? <div className="album">{sel.photos.map((p, i) => <figure key={i}><img src={p.src} alt="" /><figcaption>{p.by}</figcaption></figure>)}</div> : <p className="fine">No photos yet.</p>}
      {(ui.canManage || sel.by.startsWith(st.me.name || 'You')) && <button className="lnk" onClick={() => { if (confirm('Delete this event?')) { act.delEvent(sel.id); setOpen(null); } }}>Delete event</button>}
    </Sheet>}
  </div>;
}

const CATS = ['Maintenance', 'Safety', 'Rules', 'Operations', 'Decisions'];
const BCATS = ['Maintenance', 'Safety', 'Events', 'Rules', 'Operations', 'Decisions'];
const FLOW = { Maintenance: ['Open', 'Scheduled', 'Fixed'], Safety: ['Flagged', 'Looking into it', 'Resolved'], Rules: ['Reminder sent', 'Cleared'], Operations: ['On calendar', 'Done'], Decisions: ['Decided'] };
const ACTIVE = /open|flagged|scheduled|calendar|reminder|looking|reported/i;
const pillCls = s => /open|flagged|needs you|reply received|no reply/i.test(s) ? 'or' : /scheduled|calendar|requested|reminder|looking|reported|waiting/i.test(s) ? 'blue' : /fixed|done|decided|cleared|resolved|confirmed/i.test(s) ? 'ok' : 'grey';

function AddItem({ act, ui, cat, onClose }){
  const cats = ui.canManage ? CATS : ['Maintenance', 'Safety', 'Rules'];
  const [f, setF] = uS2({ cat: cats.includes(cat) ? cat : 'Maintenance', title: '', detail: '' }), set = k => e => setF({ ...f, [k]: e.target.value });
  return <Sheet onClose={onClose}><h3>{ui.canManage ? 'Add to the building log' : 'Report something'}</h3>
    <Field label="Type"><select value={f.cat} onChange={set('cat')}>{cats.map(c => <option key={c}>{c}</option>)}</select></Field>
    <Field label="What’s going on"><input value={f.title} onChange={set('title')} placeholder="Garage gate stuck open" autoFocus /></Field>
    <Field label="Details (optional)"><input value={f.detail} onChange={set('detail')} placeholder="Where, since when…" /></Field>
    <button className="btn" disabled={!f.title.trim()} onClick={() => { act.addItem(f.cat, f.title.trim(), f.detail.trim()); onClose(); }}>Save</button>
  </Sheet>;
}

function BuildingScreen({ st, act, ui }){
  const [cat, setCat] = uS2('Maintenance'), [open, setOpen] = uS2(null), [adding, setAdding] = uS2(false);
  uE2(() => { const it = st.items.find(x => x.id === ui.target); if (it) setCat(it.cat); else if (st.events.some(e => e.id === ui.target)) setCat('Events'); }, [ui.target]);
  const list = st.items.filter(i => i.cat === cat);
  const upN = st.events.filter(e => (e.date || todayStr()) >= todayStr()).length;
  const chipRow = <div className="seg-scroll">{BCATS.map(c => { const n = c === 'Events' ? upN : st.items.filter(i => i.cat === c && ACTIVE.test(i.status)).length; return <button key={c} className={'fchip' + (c === cat ? ' on' : '')} onClick={() => setCat(c)}>{c}{n ? <em>{n}</em> : null}</button>; })}</div>;
  if (cat === 'Events') return <EventsScreen st={st} act={act} ui={ui} top={chipRow} />;
  const sel = open && st.items.find(i => i.id === open);
  const bk = st.bookings.filter(b => !/done|cancel|declin/i.test(b.status));
  return <div className="scr">
    <Header title="Building" sub="Maintenance, safety, events and notices" st={st} act={act} right={<button className="ib" aria-label="Report something" onClick={() => setAdding(true)}><Ico d={I.plus} /></button>} />
    <div className="list">
      {bk.length > 0 && <div className="card desk">
        <span className="lbl" style={{ marginTop: 0 }}>Your bookings</span>
        {bk.map(b => <div key={b.id} className={'drow' + (ui.target === b.id ? ' fresh' : '')}><span><b>{b.name}</b> · {b.trade}</span><span>{b.when} · {b.status}</span></div>)}
      </div>}
      {chipRow}
      {cat === 'Rules' && <p className="fine" style={{ margin: '2px 2px 0' }}>Rule complaints are counted by place. Reminders never name anyone. Three reports in one spot flags it for the board.</p>}
      {list.map(i => <button key={i.id} className={'card item' + (ui.target === i.id ? ' hl' : '') + (i.fresh ? ' fresh' : '')} onClick={() => setOpen(i.id)}>
        <div><b>{i.title}</b><span className="meta">{i.by ? 'From ' + i.by : ''}{i.ts ? ' · ' + HH.fmtDay(new Date(i.ts)) : ''}{i.reports ? ' · ' + i.reports + (i.reports === 1 ? ' report' : ' reports') : ''}</span>{i.cat === 'Rules' && i.reports >= 3 && i.status !== 'Cleared' && <span className="meta warn">Hotspot · flagged for the board</span>}{i.linked && <span className="meta warn">Happened before · linked to an earlier issue</span>}{i.sim && <SimTag />}</div>
        <span className={'pill ' + pillCls(i.status)}>{i.status}</span>
      </button>)}
      {!list.length && <p className="empty">Nothing here yet. Report something with +, or mention it in the chat.</p>}
    </div>
    {adding && <AddItem act={act} ui={ui} cat={cat} onClose={() => setAdding(false)} />}
    {sel && <Sheet onClose={() => setOpen(null)}>
      <span className="ev-when">{sel.cat}</span><h3 style={{ marginTop: 4 }}>{sel.title}</h3>
      <span className="meta">{sel.by ? 'From ' + sel.by + ' · ' : ''}{sel.ts ? HH.fmtDay(new Date(sel.ts)) : ''}{sel.reports ? ' · ' + sel.reports + (sel.reports === 1 ? ' report' : ' reports') : ''}</span>
      {sel.detail && <div className="qt">{sel.detail}</div>}
      {sel.linked && (() => { const L = st.items.find(x => x.id === sel.linked); return L && <button className="opt" style={{ gridTemplateColumns: '1fr', marginTop: 8 }} onClick={() => setOpen(L.id)}><span><b>Happened before: {L.title}</b><span className="meta">{L.status} · {HH.fmtDay(new Date(L.ts))}{L.log && L.log.length ? ' · ' + L.log[L.log.length - 1][1] : ''}</span></span></button>; })()}
      {sel.log && sel.log.length > 0 && <><span className="lbl">Timeline</span><ol className="tl">{sel.log.map(([t, x], i) => <li key={i}><span className="tld">{HH.fmtDay(new Date(t)) + ' · ' + HH.fmtTime(new Date(t))}</span>{x}</li>)}</ol></>}
      {sel.cat === 'Rules' && sel.topic && HH.RULES[sel.topic] && <p className="fine">Reminder sent: {HH.RULES[sel.topic].text}.</p>}
      {ui.canManage ? <><span className="lbl">Status</span><div className="chips">{FLOW[sel.cat].map(s => <button key={s} className={'slot' + (sel.status === s ? ' on' : '')} onClick={() => act.setItem(sel.id, { status: s })}>{s}</button>)}</div>
        <button className="lnk" onClick={() => { if (confirm('Delete this record?')) { act.delItem(sel.id); setOpen(null); } }}>Delete</button></>
        : ACTIVE.test(sel.status) && sel.cat !== 'Operations' && <button className="btn" disabled={!!st.plus[sel.id]} onClick={() => act.plusOne(sel.id)}>{st.plus[sel.id] ? 'You reported this too' : 'Me too'}</button>}
      {!ui.canManage && <p className="fine">The board updates the status. Switch your role under your initials if that’s you.</p>}
    </Sheet>}
  </div>;
}

function AgentMsg({ m, act, st }){
  const t = HH.fmtTime(new Date(m.ts));
  if (m.me) return <div className="b out"><span className="bt">{m.text}</span><time>{t}<em>✓✓</em></time></div>;
  const b = m.bid && st.bookings.find(x => x.id === m.bid);
  return <div className="b agent"><small style={{ color: 'var(--or)' }}>Assistant{m.origin === 'ai' ? ' · real AI' : m.origin === 'rules' ? ' · from memory' : m.origin === 'sim' ? '' : ''}{m.origin === 'sim' && <SimTag />}</small>
    {m.text && <span className="bt">{m.text}</span>}
    {m.feedback && <div className="chips">{[['good', 'It went great'], ['bad', 'Not great']].map(([k, l]) => <button key={k} className={'slot' + (m.picked === k ? ' on' : '')} disabled={!!m.picked} onClick={() => act.rate(m.id, k)}>{l}</button>)}</div>}
    {m.options && <div className="opts">{m.options.map((id, i) => { const s = st.suppliers.find(x => x.id === id); if (!s) return null; return <button key={id} className={'opt' + (m.picked === id ? ' on' : '')} disabled={!!m.picked} onClick={() => act.pick(m.id, id)}><span className="sav sm" style={{ background: colorOf(s.name) }}>{initials(s.name)}</span><span><b>{i + 1}. {s.name}</b><span className="meta">{s.recs} recs{s.quotes[0] ? ' · "' + s.quotes[0][1].slice(0, 50) + '"' : ''}</span></span></button>; })}</div>}
    {m.visits && <div className="opts">{m.visits.map(id => { const v = window.ZPro.visits().find(x => x.id === id); if (!v) return null; const left = v.slots - v.booked.length; return <button key={id} className={'opt' + (m.picked === id ? ' on' : '')} disabled={!!m.picked || left <= 0} onClick={() => act.bookNearby(m.id, v)}><span className="sav sm" style={{ background: colorOf(v.name) }}>{initials(v.name)}</span><span><b>{zDayLabel(v.date)} · {v.name}</b><span className="meta">{v.win} · {left > 0 ? left + ' open' : 'Full'}{v.note ? ' · ' + v.note : ''}</span></span></button>; })}</div>}
    {m.days && <div className="chips">{m.days.map(x => <button key={x} className={'slot' + (m.picked === x ? ' on' : '')} disabled={!!m.picked} onClick={() => act.pickDay(m.id, x)}>{x}</button>)}</div>}
    {m.avail && <AvailPicker m={m} act={act} />}
    {m.access && <div className="chips">{m.access.map(x => <button key={x} className={'slot' + (m.picked === x ? ' on' : '')} disabled={!!m.picked} onClick={() => act.pickAccess(m.id, x)}>{x}</button>)}</div>}
    {m.wins && <div className="chips">{m.wins.map(x => <button key={x} className={'slot' + (m.picked === x ? ' on' : '')} disabled={!!m.picked} onClick={() => act.pickWin(m.id, x)}>{x}</button>)}</div>}
    {m.catchup && <div className="chips"><button className="slot" onClick={act.openCatch}>Open catch-up</button></div>}
    {m.item && <div className="chips"><button className="slot" onClick={() => act.go('building', m.item)}>Open the issue</button></div>}
    {m.evs && m.evs.length > 0 && <div className="opts">{m.evs.map(id => { const e = st.events.find(x => x.id === id); return e && <button key={id} className="opt" style={{ gridTemplateColumns: '1fr' }} onClick={() => act.go('events', id)}><span><b>{e.title}</b><span className="meta">{evWhen(e)}{e.where ? ' · ' + e.where : ''} · {e.going} going</span></span></button>; })}</div>}
    {m.acts && <div className="chips">{m.acts.map(([l, k, href]) => href ? <a key={k} className="slot" href={href} style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>{l}</a> : <button key={k} className={'slot' + (m.picked === k ? ' on' : '')} disabled={!!m.picked} onClick={() => act.agentAct(m.id, k)}>{l}</button>)}</div>}
    {m.wa && <a className="btn wa-btn" href={m.wa} target="_blank" rel="noopener"><Ico d={I.wa} s={17} />Open in WhatsApp</a>}
    {b && <div className="bk"><span><b>{b.name}</b> · {b.when}</span><span className={'pill ' + pillCls(b.status)}>{b.status}</span>{b.tid && <SmsThread tid={b.tid} />}
      {b.status === 'Requested' && <div className="chips"><button className="slot" onClick={() => act.setBooking(b.id, 'Confirmed')}>They confirmed</button><button className="slot" onClick={() => act.setBooking(b.id, 'Cancelled')}>Cancel</button></div>}
      {b.status === 'Confirmed' && <IcsBtn b={b} me={st.me} />}
      {b.status === 'Confirmed' && <div className="chips"><button className="slot" onClick={() => act.setBooking(b.id, 'Done')}>Job’s done</button><button className="slot" onClick={() => act.setBooking(b.id, 'Cancelled')}>Cancel</button></div>}</div>}
    <time>{t}</time>
  </div>;
}

function AgentScreen({ st, act, ui }){
  const ref = useBottom(st.agent.length + (st.agentTyping ? 'T' : '') + st.bookings.map(b => b.status).join());
  const send = () => { if (ui.agentText.trim()) { act.ask(ui.agentText.trim()); ui.setAgentText(''); } };
  const idle = !st.agent.some(m => m.me), n = st.bookings.filter(b => !/done|cancel|declin/i.test(b.status)).length;
  return <div className="scr">
    <Header av={<Ico d={I.agent} s={18} />} title="Ask" sub={n ? n + (n === 1 ? ' booking in progress' : ' bookings in progress') : 'Private · answers from the group’s memory'} st={st} act={act} />
    {!st.sim && ui.role !== 'provider' && <ServiceWeek st={st} act={act} pinned />}
    <div className="wa agent-bg" ref={ref}>
      {st.aiLevel === 'quiet' && st.messages.filter(m => m.kind === 'nudge' && !m.done).map(m => <NudgeCard key={m.id} m={m} act={act} />)}
      {st.agent.map(m => m.kind === 'nudge' ? <NudgeCard key={m.id} m={m} act={act} /> : <AgentMsg key={m.id} m={m} act={act} st={st} />)}
      {st.agentTyping && <div className="b agent typing"><small style={{ color: 'var(--or)' }}>Assistant</small><span className="dots"><i></i><i></i><i></i></span></div>}
    </div>
    {idle && <div className="sugg">{['Did I miss anything?', 'Has the garage gate been fixed?', 'Any events coming up?', 'I need a plumber'].map(x => <button key={x} onClick={() => act.ask(x)}>{x}</button>)}</div>}
    <div className="cmp">
      <input value={ui.agentText} onChange={e => ui.setAgentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask about the group, or what you need" aria-label="Ask" />
      <button className="sendb" aria-label="Send" onClick={send}><Ico d={I.send} s={19} /></button>
    </div>
  </div>;
}

function JobsScreen({ st, act }){
  const me = st.suppliers.find(s => s.id === st.me.providerId);
  const jobs = me ? st.bookings.filter(b => b.sid === me.id) : [];
  return <div className="scr">
    <Header av={<Ico d={I.jobs} s={18} />} title="Jobs" sub={me ? me.name + ' · ' + me.trade : 'Pick which provider you are'} st={st} act={act} />
    <div className="list">
      {!me && <div className="card"><b>Which provider are you?</b><span className="meta">Tap your initials at the top and choose your name from the directory.</span></div>}
      {me && <div className="card"><span className="lbl" style={{ marginTop: 0 }}>Your listing</span><b>{me.recs} recommendations</b>{me.quotes[0] && <span className="quote">"{me.quotes[0][1]}"</span>}</div>}
      {jobs.map(b => <div key={b.id} className="card"><div className="item"><span><b>{b.when}</b><span className="meta">{b.by}{b.unit ? ' · unit ' + b.unit : ''}</span></span><span className={'pill ' + pillCls(b.status)}>{b.status}</span></div>
        {b.status === 'Requested' && <div className="chips"><button className="slot" onClick={() => act.setBooking(b.id, 'Confirmed')}>Confirm</button><button className="slot" onClick={() => act.setBooking(b.id, 'Declined')}>Decline</button></div>}
        {b.status === 'Confirmed' && <IcsBtn b={b} me={st.me} />}
      {b.status === 'Confirmed' && <div className="chips"><button className="slot" onClick={() => act.setBooking(b.id, 'Done')}>Mark done</button></div>}</div>)}
      {me && !jobs.length && <p className="empty">No booking requests on this device yet. Neighbors usually message you on WhatsApp.</p>}
    </div>
  </div>;
}

function MeSheet({ aiLevel, setAiLevel, st, ui, status, aiOn, install, onClose, setMe, setSheetId, refresh, resetLocal, exportData, importData, doInstall }){
  const me = st.me, file = uR2(null), [sid, setSid] = uS2(st.sheetId);
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent), standalone = window.matchMedia && matchMedia('(display-mode: standalone)').matches;
  return <Sheet onClose={onClose}>
    <h3>You</h3><span className="meta">No login. This is saved on this device only.</span>
    <div className="frow"><Field label="First name"><input value={me.name} onChange={e => setMe({ name: e.target.value })} placeholder="Alvaro" /></Field><Field label="Unit"><input value={me.unit} onChange={e => setMe({ unit: e.target.value })} placeholder="12C" /></Field></div>
    <span className="lbl">Role</span>
    <div className="chips">{Object.entries({ resident: 'Resident', board: 'Board / HOA', admin: 'Admin', provider: 'Provider' }).map(([k, l]) => <button key={k} className={'slot' + (me.role === k ? ' on' : '')} onClick={() => setMe({ role: k })}>{l}</button>)}</div>
    <p className="fine">{{ resident: 'Post, recommend, report issues, RSVP and book help.', board: 'Everything residents can do, plus update statuses and post notices and decisions in the building log.', admin: 'Board powers plus data tools: sheet connection, backup and reset.', provider: 'See and answer booking requests made to you on this device.' }[me.role]}</p>
    {me.role === 'provider' && <Field label="I am"><select value={me.providerId} onChange={e => setMe({ providerId: e.target.value })}><option value="">Choose your name</option>{st.suppliers.slice().sort((a, b) => a.name.localeCompare(b.name)).map(s => <option key={s.id} value={s.id}>{s.name} · {s.trade}</option>)}</select></Field>}
    <span className="lbl">What you want to see</span>
    <InterestsControls />
    <span className="lbl">AI in the chat</span>
    <div className="seg"><button className={aiLevel === 'quiet' ? 'on' : ''} onClick={() => setAiLevel('quiet')}>Quiet</button><button className={aiLevel !== 'quiet' ? 'on' : ''} onClick={() => setAiLevel('helpful')}>Helpful</button></div>
    <p className="fine">{aiLevel === 'quiet' ? 'The AI only works in the background and answers when you ask. Its suggestions wait for you in Ask.' : 'The AI may suggest something in the chat when it can save the group real effort, like a repeated report or an event coming together.'}</p>
    <span className="lbl">Directory</span>
    <div className="stats"><span>{status}</span><button className="slot" onClick={refresh}>Refresh</button></div>
    {ui.sheetErr && <p className="fine" style={{ color: 'var(--warn)' }}>Last try failed: {ui.sheetErr}</p>}
    {!standalone && <><span className="lbl">Put it on your home screen</span>
      {install ? <button className="btn" onClick={doInstall}>Install app</button> : <p className="fine">{ios ? 'In Safari, tap Share, then “Add to Home Screen”.' : 'In Chrome, open the menu and tap “Install app” or “Add to Home screen”.'}</p>}</>}
    {me.role === 'admin' && <><span className="lbl">Admin</span>
      <Field label="Google Sheet ID"><div className="askrow" style={{ marginTop: 0 }}><input value={sid} onChange={e => setSid(e.target.value)} /><button className="sendb" aria-label="Save sheet ID" onClick={() => setSheetId(sid.trim())}><Ico d={I.check} s={19} /></button></div></Field>
      <p className="fine">The sheet must be shared as “Anyone with the link can view”. AI: {aiOn ? 'on' : 'off (keyword rules)'}.</p>
      <div className="crow"><button className="btn ghost" onClick={exportData}>Download backup</button><button className="btn ghost" onClick={() => file.current.click()}>Restore backup</button></div>
      <input ref={file} type="file" accept="application/json" hidden onChange={e => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ''; }} />
      <button className="lnk" onClick={resetLocal}>Erase this device’s data</button></>}
  </Sheet>;
}

function Tabs({ tab, setTab, badges, provider }){
  const T = [['chat', 'Chat', I.chat], ['building', 'Building', I.bld], ['suppliers', 'Providers', I.sup], ['agent', provider ? 'Jobs' : 'Ask', provider ? I.jobs : I.agent]].filter(zTabOn(provider));
  return <nav className="tabs" style={{ gridTemplateColumns: 'repeat(' + T.length + ',1fr)' }}>{T.map(([k, l, d]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)} aria-label={l}><span className="ti"><Ico d={d} />{badges[k] ? <em>{badges[k]}</em> : null}</span>{l}</button>)}</nav>;
}

Object.assign(window, { EventsScreen, BuildingScreen, AgentScreen, JobsScreen, MeSheet, Tabs });
