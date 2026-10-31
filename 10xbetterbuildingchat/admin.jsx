/* AI Control: module switches, bot behavior, use-case playback and AI activity. */
const { useState: aS, useEffect: aE, useRef: aR } = React;

function ASwitch({ on, onChange, label }){
  return <button className={'asw' + (on ? ' on' : '')} role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}><i></i></button>;
}
function ASeg({ value, options, onChange }){
  return <div className="aseg" style={{ gridTemplateColumns: 'repeat(' + options.length + ',1fr)' }}>{options.map(([v, l]) => <button key={v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>{l}</button>)}</div>;
}
const BOT_ROWS = [
  ['trigger', 'When the bot reads the chat', [['every', 'Every message'], ['tagged', 'Only @AI'], ['off', 'Off']],
    { every: 'Reads every message and quietly files recommendations, issues and plans.', tagged: 'Ignores messages unless someone writes @AI or taps ✦.', off: 'Reads nothing. The chat works like a normal group.' }],
  ['publicPosts', 'Where it can speak', [['never', 'Private only'], ['reminders', 'Reminders in group'], ['suggestions', 'Suggestions in group']],
    { never: 'Never posts in the group. Answers and suggestions go only to the person involved.', reminders: 'May post rule reminders in the group. Everything else stays private.', suggestions: 'May post reminders and offers of help in the group, when they save real effort.' }],
  ['proactive', 'Suggestions it starts on its own', [['helpful', 'Helpful'], ['quiet', 'Quiet'], ['off', 'Off']],
    { helpful: 'Suggests when it saves real effort, like a group service or a missing reservation.', quiet: 'Suggestions wait in the Ask tab. Nothing appears in the chat.', off: 'No suggestions at all. It only answers when asked.' }]
];

const DTOPICS = [['suppliers', 'Suppliers and services', 'Recommendations, requests for a provider, warnings, prices, shared contacts.'], ['events', 'Events', 'Get-togethers, parties, meetings and plans neighbors are making.'], ['problems', 'Building and community problems', 'Broken things in common areas, safety, rule issues, building notices and board decisions.']];
const DLABEL = { suppliers: 'Suppliers', events: 'Events', problems: 'Building problem', ignore: 'Ignored', skipped: 'Not read' };
const DSAMPLES = ['Anyone know a good plumber?', 'Joe Rivera fixed our leak in an hour, highly recommend', 'Avoid FixIt Pros, they never showed up', 'The gym AC is broken again', 'Water will be shut off Tuesday 9 to 12', 'Pool party Saturday at 4, everyone welcome!', 'Did you see the debate last night?', 'Good morning neighbors ☀️', 'Go Heat!'];
function Detection({ cfg, setBot, sups }){
  const [log, setLog] = aS(() => window.ZLog.list()), [q, setQ] = aS(''), [res, setRes] = aS(null), [busy, setBusy] = aS(false);
  aE(() => window.ZLog.subscribe(() => setLog(window.ZLog.list())), []);
  const test = async t => { t = String(t == null ? q : t).trim(); if (!t) return; setQ(t); setBusy(true);
    const r = await window.HOAI.sort(t, 'Test', { suppliers: sups, items: [], messages: [], feed: [] }, {}), d = zDetect(r); setRes({ ...r, ...d, text: t }); setBusy(false); };
  const recent = log.slice(0, 100), cnt = k => recent.filter(x => x.topic === k).length, det = cfg.bot.detect;
  const desc = a => [a.type, a.trade && a.trade !== 'Other' ? a.trade : '', a.title || a.name || ''].filter(Boolean).join(' · ');
  return <div className="apanel">
    <div className="aph"><b>What the bot pays attention to</b><span>Group chat only. Private chats are never read.</span></div>
    {DTOPICS.map(([k, n, d]) => <div key={k} className={'amod' + (det[k] ? '' : ' off')} style={{ gridTemplateColumns: 'auto minmax(0,1fr) auto' }}><span className={'tdot t-' + k}></span><div className="amt"><b>{n}</b><span>{d}</span></div><ASwitch on={det[k]} label={n} onChange={v => setBot({ detect: { ...det, [k]: v } })} /></div>)}
    <div className="amod" style={{ gridTemplateColumns: 'auto minmax(0,1fr)' }}><span className="tdot t-ignore"></span><div className="amt"><b>Always ignored</b><span>Chit-chat, greetings and thanks, jokes, sports, weather, and politics. These are never filed, answered or remembered.</span></div></div>
    <div className="amod" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}><div className="amt"><b>Show topic tags in the chat</b><span>For testing. Adds a small tag under each new message showing what the bot decided.</span></div><ASwitch on={cfg.bot.showTags} label="Show topic tags" onChange={v => setBot({ showTags: v })} /></div>
    <span className="lbl">Try a message</span>
    <div className="askrow" style={{ marginTop: 0 }}><input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && test()} placeholder="Type a message the way a neighbor would" aria-label="Test message" /><button className="sendb" aria-label="Test" onClick={() => test()}><Ico d={I.send} s={19} /></button></div>
    <div className="sugg flat">{DSAMPLES.map(x => <button key={x} onClick={() => test(x)}>{x}</button>)}</div>
    {busy && <p className="fine">Reading…</p>}
    {res && !busy && <div className="dres"><div className="dresh"><span className={'tpill t-' + res.topic}>{DLABEL[res.topic]}</span>{res.sub && <span className="meta" style={{ margin: 0 }}>{res.sub}</span>}<span className="meta" style={{ margin: '0 0 0 auto' }}>{res.ai ? 'Real AI' : 'Keyword rules'}</span></div>
      <b>{res.reason}</b>{res.off && <span className="meta">The {DLABEL[res.off].toLowerCase()} topic is switched off, so this is ignored.</span>}
      {res.actions.length > 0 ? <ul>{res.actions.map((x, i) => <li key={i}>Would file: {desc(x)}</li>)}</ul> : <span className="meta">Nothing would be filed.</span>}</div>}
    <div className="aph" style={{ marginTop: 14 }}><b>Recent messages</b><span>{recent.length ? cnt('suppliers') + ' suppliers · ' + cnt('events') + ' events · ' + cnt('problems') + ' problems · ' + cnt('ignore') + ' ignored' : 'Post in the Resident chat to see them here'}</span></div>
    {log.slice(0, 40).map(x => <div key={x.id + x.ts} className="drow2"><span className={'tpill t-' + x.topic}>{DLABEL[x.topic] || x.topic}</span><div><b>{String(x.from).split(' · ')[0]}: </b>{x.text}<span className="meta" style={{ margin: 0 }}>{[x.sub, x.reason, x.actions && x.actions.length ? 'filed ' + x.actions.join(', ') : '', x.ai === false ? 'keyword rules' : x.ai ? 'AI' : ''].filter(Boolean).join(' · ')}</span></div><span className="meta" style={{ margin: 0, whiteSpace: 'nowrap' }}>{window.HOA.fmtTime(new Date(x.ts))}</span></div>)}
    {log.length > 0 && <button className="slot" style={{ alignSelf: 'flex-start', marginTop: 6 }} onClick={() => window.ZLog.clear()}>Clear the list</button>}
  </div>;
}

function Admin(){
  const C = window.ZCFG, [cfg, setCfg] = aS(C.get());
  aE(() => C.subscribe(() => setCfg(C.get())), []);
  const save = c => { C.set(c); setCfg(C.get()); };
  const setMod = (id, p) => save({ ...cfg, mods: { ...cfg.mods, [id]: { ...cfg.mods[id], ...p } } });
  const setBot = p => save({ ...cfg, bot: { ...cfg.bot, ...p } });
  const preset = all => save({ ...cfg, mods: Object.fromEntries(C.MODULES.map(m => [m.id, { ...cfg.mods[m.id], on: all || cfg.mods[m.id].phase === 'MVP' }])) });
  const [sheet, setSheet] = aS(() => window.HOASheet.cached());
  aE(() => { window.HOASheet.load(window.HOA.GROUP.sheetId).then(setSheet).catch(() => {}); }, []);
  const stepRef = aR(null), eng = window.useEngine(stepRef);
  const real = { suppliers: sheet ? sheet.suppliers : [], requests: sheet ? sheet.requests : [] };
  const realRef = aR(real); realRef.current = real; window.usePoolEngine(() => realRef.current.suppliers);
  const areas = [...new Set(C.MODULES.map(m => m.area))];
  const onN = C.MODULES.filter(m => cfg.mods[m.id].on).length, mvp = C.MODULES.filter(m => cfg.mods[m.id].phase === 'MVP');
  return <div className="adm">
    <section className="acol">
      <header className="ahd"><span className="eyebrow">AI Control</span><h1>What the bot does, and which parts are on.</h1>
        <p>Changes apply right away on the Resident and Supplier pages, including tabs open in other windows. Saved in this browser.</p></header>
      <div className="apanel">
        <div className="aph"><b>Bot behavior</b><span>Applies to the live chat</span></div>
        {BOT_ROWS.map(([k, label, opts, desc]) => <div key={k} className="arow"><span className="lbl" style={{ marginTop: 0 }}>{label}</span><ASeg value={cfg.bot[k]} options={opts} onChange={v => setBot({ [k]: v })} /><span className="meta">{desc[cfg.bot[k]]}</span></div>)}
        <div className="arow"><span className="lbl" style={{ marginTop: 0 }}>Group opportunity threshold</span>
          <div className="arange"><input type="range" min="2" max="20" value={cfg.bot.minPeople} onChange={e => setBot({ minPeople: +e.target.value })} aria-label="Neighbors needed" /><b>{cfg.bot.minPeople}</b></div>
          <span className="meta">Neighbors asking for the same kind of help before the AI flags a group opportunity.</span></div>
        <p className="fine" style={{ margin: '4px 0 0' }}>Use cases are scripted, so they play the same way whatever these are set to.</p>
      </div>
      <Detection cfg={cfg} setBot={setBot} sups={real.suppliers} />
      <PoolAdmin cfg={cfg} setBot={setBot} sups={real.suppliers} requests={real.requests} />
      <SmsAdmin cfg={cfg} setBot={setBot} />
      <div className="apanel">
        <div className="aph"><b>Modules</b><span>{onN} of {C.MODULES.length} on · {mvp.length} marked MVP</span></div>
        <div className="apre"><button className="slot" onClick={() => preset(false)}>Show MVP only</button><button className="slot" onClick={() => preset(true)}>Turn everything on</button><button className="slot" onClick={() => { if (confirm('Reset all modules and bot settings to the defaults?')) save(C.defaults()); }}>Reset</button></div>
        {areas.map(a => <div key={a}><span className="lbl">{a}</span>
          {C.MODULES.filter(m => m.area === a).map(m => { const s = cfg.mods[m.id]; return <div key={m.id} className={'amod' + (s.on ? '' : ' off')}>
            <div className="amt"><b>{m.name}{m.cases && <em>Use case</em>}</b><span>{m.desc}</span></div>
            <select value={s.phase} onChange={e => setMod(m.id, { phase: e.target.value })} aria-label={'Phase for ' + m.name} className={'aph-' + s.phase.replace(/\W/g, '')}>{C.PHASES.map(p => <option key={p}>{p}</option>)}</select>
            <ASwitch on={s.on} onChange={v => setMod(m.id, { on: v })} label={m.name} /></div>; })}</div>)}
      </div>
    </section>
    <section className="acol">
      <div className="apanel"><StudioPanel eng={eng} persp="ai" /></div>
      <AIActivity sim={eng.sim} eng={eng} real={real} act={{}} />
    </section>
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<Admin />);
