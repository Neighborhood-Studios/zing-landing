/* Zing Neighbors (Chat-GPT version): AI cards in the chat + five scripted demo scenarios.
   Anything a scenario creates carries sim:true and shows a "Simulated" tag. Private answers, catch-up and Ask run on real app data. */
const ZDAY = 864e5;
const zYmd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const zOk = s => !s.warnings && !/^unnamed|\(via/i.test(s.name);
const zTop = (view, trade, n = 3) => view.suppliers.filter(s => s.trade === trade && zOk(s)).sort((a, b) => b.recs - a.recs).slice(0, n);
const ZH = {}; // live handlers for nudge buttons, keyed by message id + action

function SimTag(){ return <span className="simtag" title="Scripted demo content. Not from the real group.">Simulated</span>; }

function zWhy(s){
  const H = window.HOA, q = s.quotes && s.quotes[0], bits = [];
  bits.push(s.recs + (s.recs === 1 ? ' neighbor recommends' : ' neighbors recommend'));
  if (q) bits.push('"' + (q[1].length > 60 ? q[1].slice(0, 58) + '…' : q[1]) + '" ' + String(q[0]).split(' ·')[0] + (q[2] ? ', ' + (x => /^(Today|Yesterday)$/.test(x) ? x.toLowerCase() : x)(H.fmtDay(new Date(q[2]))) : ''));
  if (s.price) bits.push('Price notes: ' + s.price);
  return bits;
}

function PrivCard({ m, st, act }){
  return <div className="b priv" data-id={m.id}>
    <small className="privh"><Ico d={I.agent} s={14} />Only you can see this{m.sim && <SimTag />}</small>
    {m.loading ? <span className="dots"><i></i><i></i><i></i></span> : <>
      <span className="bt">{m.lead || m.answer}</span>
      {m.picks && <div className="opts">{m.picks.map(id => { const s = st.suppliers.find(x => x.id === id); if (!s) return null;
        return <button key={id} className="opt" onClick={() => act.go('suppliers', id)}><span className="sav sm" style={{ background: colorOf(s.name) }}>{initials(s.name)}</span><span><b>{s.name}</b>{zWhy(s).map((w, i) => <span key={i} className="meta">{w}</span>)}</span></button>; })}</div>}
      {m.cites && m.cites.length > 0 && <div className="opts">{m.cites.map(id => { const x = st.feed.find(y => y.id === id); return x && <button key={id} className="opt" style={{ gridTemplateColumns: '1fr' }} onClick={() => act.go('chat', id)}><span><b>{x.from}</b><span className="meta">{x.text.slice(0, 80)}</span></span></button>; })}</div>}
      <span className="pfoot">Your message is still in the group, so neighbors can answer too.</span></>}
  </div>;
}

function NudgeCard({ m, act }){
  return <div className="nudge" data-id={m.id}>
    <div className="nh"><Ico d={I.agent} s={15} /><b>{m.title || 'Neighbors AI'}</b>{m.sim && <SimTag />}</div>
    {m.body && <span className="nb">{m.body}</span>}
    {m.draft && <div className="qt">{m.draft}</div>}
    {m.why && <details className="why"><summary>Why am I seeing this?</summary><ul>{m.why.map((w, i) => <li key={i}>{w}</li>)}</ul></details>}
    {m.done ? <span className="ndone"><Ico d={I.check} s={14} />{m.done}</span>
      : m.actions && <div className="chips">{m.actions.map(([l, k], i) => <button key={k} className={'slot' + (i === 0 ? ' on' : '')} onClick={() => act.nudge(m.id, k)}>{l}</button>)}</div>}
    <span className="nfoot">{m.scope || 'Only you can see this'}</span>
  </div>;
}

function EvCard({ m, st, act }){
  const e = st.events.find(x => x.id === m.eid); if (!e) return null;
  return <div className="b evc" data-id={m.id}>
    <small style={{ color: 'var(--blue)' }}>Event from the chat{m.sim && <SimTag />}</small>
    <span className="ev-when">{evWhen(e)}</span><b style={{ display: 'block', fontSize: 15.5 }}>{e.title}</b>
    <span className="meta">{e.where ? e.where + ' · ' : ''}{e.going} going · organized by {e.by.split(' ·')[0]}</span>
    {e.bring && e.bring.length > 0 && <span className="meta">Bringing: {e.bring.map(b => b[1].toLowerCase() + ' (' + b[0].split(' ·')[0] + ')').join(', ')}</span>}
    <div className="chips"><button className={'slot' + (st.going[e.id] ? ' on' : '')} onClick={() => act.toggleGoing(e.id)}>{st.going[e.id] ? 'You’re going' : 'I’m going'}</button><button className="slot" onClick={() => act.go('events', e.id)}>Details</button></div>
  </div>;
}

function zCatchUp(view, since){
  const H = window.HOA, now = Date.now(), t0 = new Date(); t0.setHours(0, 0, 0, 0);
  const myName = view.me.name || 'You';
  const attn = view.items.filter(i => /Safety|Maintenance/.test(i.cat) && !/fixed|resolved|done/i.test(i.status) && (i.ts >= since || (i.log || []).some(l => l[0] >= since))).sort((a, b) => (b.reports || 1) - (a.reports || 1));
  const evs = view.events.filter(e => { const d = H.parseDate(e.date); return d && d >= t0 && d - now < 8 * ZDAY; });
  const asked = [...new Set(view.localReqs.filter(r => String(r.who).startsWith(myName)).map(r => r.trade))];
  const recIds = [...new Set(view.localRecs.filter(r => r.ts >= since).map(r => r.sid))];
  const recs = recIds.map(id => view.suppliers.find(s => s.id === id)).filter(Boolean).sort((a, b) => asked.includes(b.trade) - asked.includes(a.trade));
  const nudges = view.messages.filter(m => m.kind === 'nudge' && !m.done && m.ts >= since);
  const outs = view.messages.filter(m => m.kind === 'outcome' && m.ts >= since);
  const casual = view.feed.filter(m => +m.d >= since && !m.kind && !(m.chips && m.chips.length) && m.from !== 'You').length;
  const Iv = window.ZInterests ? window.ZInterests.get() : null;
  if (Iv && !window.ZInterests.all(Iv)) { const skip = (attn.filter(i => !Iv[i.cat === 'Safety' ? 'safety' : 'building']).length) + (Iv.events ? 0 : evs.length) + (Iv.providers ? 0 : recs.length);
    return { attn: attn.filter(i => Iv[i.cat === 'Safety' ? 'safety' : 'building']), evs: Iv.events ? evs : [], recs: Iv.providers ? recs : [], asked, nudges, casual: Iv.chat ? casual : 0, outs, skip, filtered: true }; }
  return { attn, evs, recs, asked, nudges, casual, outs };
}

function CatchUpSheet({ view, since, act, onClose }){
  const H = window.HOA, c = zCatchUp(view, since), go = (t, id) => { onClose(); act.go(t, id); };
  const empty = !c.attn.length && !c.evs.length && !c.recs.length && !c.nudges.length && !c.outs.length;
  return <Sheet onClose={onClose}>
    <h3>While you were away</h3><span className="meta">Since {(x => /^(Today|Yesterday)$/.test(x) ? x.toLowerCase() : x)(H.fmtDay(new Date(since)))} · put together for you · only you see this</span>
    {empty && <p className="fine">You’re all caught up. Nothing needs you.</p>}
    {(c.attn.length > 0 || c.nudges.length > 0) && <><span className="lbl">Needs attention</span><div className="opts">
      {c.attn.map(i => <button key={i.id} className="opt" style={{ gridTemplateColumns: '1fr' }} onClick={() => go('building', i.id)}><span><b>{i.title}</b><span className="meta">{i.cat} · {i.status}{i.reports > 1 ? ' · ' + i.reports + ' neighbors reported it' : ''}{i.linked ? ' · happened before' : ''}</span></span></button>)}
      {c.nudges.map(m => <button key={m.id} className="opt" style={{ gridTemplateColumns: '1fr' }} onClick={() => go('chat', m.id)}><span><b>{m.title}</b><span className="meta">Waiting for your answer</span></span></button>)}</div></>}
    {c.evs.length > 0 && <><span className="lbl">Coming up</span><div className="opts">{c.evs.map(e => <button key={e.id} className="opt" style={{ gridTemplateColumns: '1fr' }} onClick={() => go('events', e.id)}><span><b>{e.title}</b><span className="meta">{evWhen(e)}{e.where ? ' · ' + e.where : ''} · {e.going} going{view.going[e.id] ? ', you too' : ''}</span></span></button>)}</div></>}
    {c.recs.length > 0 && <><span className="lbl">New recommendations</span><div className="opts">{c.recs.slice(0, 4).map(s => <button key={s.id} className="opt" onClick={() => go('suppliers', s.id)}><span className="sav sm" style={{ background: colorOf(s.name) }}>{initials(s.name)}</span><span><b>{s.name} · {s.trade}</b><span className="meta">{c.asked.includes(s.trade) ? 'You asked about this. ' : ''}{s.quotes[0] ? '"' + s.quotes[0][1].slice(0, 60) + '"' : ''}</span></span></button>)}</div></>}
    {c.outs.length > 0 && <><span className="lbl">Done for the group</span><div className="opts">{c.outs.map(m => <button key={m.id} className="opt" style={{ gridTemplateColumns: '1fr' }} onClick={() => go('chat', m.id)}><span><b>{m.title}</b><span className="meta">{m.stats.map(s => s[0] + ' ' + s[1]).join(' · ')}</span></span></button>)}</div></>}
    {c.casual > 0 && <><span className="lbl">Skipped for you</span><p className="fine" style={{ margin: 0 }}>{c.casual} casual {c.casual === 1 ? 'message' : 'messages'}: chit-chat, jokes and thank-yous. Nothing to act on.</p><button className="lnk" style={{ color: 'var(--ink2)' }} onClick={() => go('chat')}>Read them anyway</button></>}
    {c.filtered && <p className="fine" style={{ margin: '4px 0 0' }}>Filtered to what you follow{c.skip ? ': ' + c.skip + (c.skip === 1 ? ' item' : ' items') + ' on other topics left out.' : '.'}</p>}
    <span className="lbl">What you want to see</span><InterestsControls />
    <button className="btn" onClick={() => { act.doneCatch(); onClose(); }}>I’m caught up</button>
  </Sheet>;
}

const ZSCEN = [
  { k: 'plumber', t: 'The plumber', d: 'Ask neighbors, get a private answer from the group’s memory' },
  { k: 'gate', t: 'The broken gate', d: 'Two reports become one tracked issue, reported and followed up' },
  { k: 'halloween', t: 'The Halloween gathering', d: 'Casual chat turns into an event with RSVPs' },
  { k: 'catchup', t: 'Back after 3 days', d: 'A personal catch-up that skips the noise' },
  { k: 'pests', t: 'Teaming up on pest control', d: 'Same problem in 3 units becomes a group deal' }
];

function ZScenarios(c){
  const seq = steps => steps.reduce((t, [d, f]) => { t += d; setTimeout(f, t); return t; }, 0);
  const now = () => Date.now();
  const on = (mid, k, f) => { ZH[mid + ':' + k] = f; };
  const sup = (trade, fallback) => { const t = zTop(c.view(), trade, 1)[0]; if (t) return t;
    const id = c.uid(); c.upd(s => ({ localSups: [...s.localSups, { id, name: fallback, biz: '', trade, recs: 0, phone: '', local: true, sim: true, firstD: now() }] })); return { id, name: fallback, recs: 0 }; };
  const rec = (sid, who, quote) => c.upd(s => ({ localRecs: [...s.localRecs, { sid, who, quote, ts: now(), sim: true }] }));
  const item = (id, patch) => c.upd(s => ({ items: s.items.map(i => i.id === id ? { ...i, fresh: true, ...(typeof patch === 'function' ? patch(i) : patch) } : i) }));
  const log = (id, text) => item(id, i => ({ log: [...(i.log || []), [now(), text]] }));

  const run = {
    plumber(){
      c.go('chat');
      const p = sup('Plumber', 'Jose Ramirez');
      c.send('Does anybody know a good plumber who doesn’t charge a fortune? Kitchen faucet has been leaking for two days and the last guy wanted $300 just to look at it.', { ai: true, sim: true });
      seq([[4200, () => { c.post({ from: 'Mike · 9A', text: 'We used ' + p.name.split(' ')[0] + ' last month for our sink. Around $120 and he was in and out in an hour.', chips: [['Remembered · ' + p.name + ' · ~$120 reported', 'suppliers', p.id]] }); rec(p.id, 'Mike · 9A', 'Fixed our sink last month, around $120, quick'); }],
        [3200, () => { c.post({ from: 'Ana · 11F', text: '+1 for ' + p.name.split(' ')[0] + '. Fixed our shower valve, fair price.', chips: [['Remembered · ' + p.name + ' · another recommendation', 'suppliers', p.id]] }); rec(p.id, 'Ana · 11F', 'Fixed our shower valve, fair price'); c.bump(['suppliers']); }]]);
    },
    gate(){
      c.go('chat');
      const g0 = c.uid(), g1 = c.uid(), past = now() - 76 * ZDAY;
      c.upd(s => ({ items: [{ id: g0, cat: 'Maintenance', title: 'Garage gate stuck open', by: 'Building manager', status: 'Fixed', reports: 2, ts: past, sim: true, log: [[past, 'Reported by 2 neighbors in the chat'], [past + 3 * ZDAY, 'Fixed. Access Pro replaced the motor sensor.']] }, ...s.items] }));
      seq([[600, () => { const t = now() - 20 * 3600e3; c.post({ ts: t, from: 'Carlos · 2C', text: 'Heads up, the garage gate is stuck open again. Been like that since this morning.', chips: [['Maintenance · new issue', 'building', g1], ['Linked · same gate was fixed in August', 'building', g0]] });
          c.upd(s => ({ items: [{ id: g1, cat: 'Maintenance', title: 'Garage gate stuck open', detail: 'The garage gate is stuck open again.', by: 'Carlos · 2C', reports: 1, status: 'Open', ts: t, linked: g0, sim: true, fresh: true, log: [[t, 'Carlos · 2C reported it in the chat']] }, ...s.items] })); c.bump(['building']); }],
        [2600, () => { c.post({ from: 'Ana · 11F', text: 'Still open tonight. Anyone can walk right into the garage.', chips: [['Same issue · 2 reports', 'building', g1]] }); item(g1, i => ({ reports: 2, log: [...i.log, [now(), 'Ana · 11F reported it too']] })); }],
        [2400, () => { const mid = c.post({ kind: 'nudge', title: 'The garage gate has 2 reports', body: 'Carlos and Ana reported it in the last day, and the same gate was fixed in August. Want me to draft one report for management?',
          why: ['Two separate messages about the same gate within 24 hours', 'The issue log shows the same problem in August, fixed by replacing the motor sensor', 'Nobody in the chat has said management knows'], actions: [['Draft the report', 'draft'], ['Not now', 'no']] });
          on(mid, 'no', () => c.setMsg(mid, { done: 'Okay. I’ll keep tracking it quietly.' }));
          on(mid, 'draft', () => { c.setMsg(mid, { body: 'Here’s a draft. Nothing is sent until you tap Send.', draft: 'Hi, the garage gate has been stuck open since yesterday morning. Two residents reported it in our group (units 2C and 11F). The same problem was fixed in August by replacing the motor sensor. Could you let us know when it will be repaired? Thank you.', actions: [['Send to management', 'send'], ['Not now', 'no']] });
            on(mid, 'send', () => { c.setMsg(mid, { done: 'Sent to management (simulated). I’ll check with Carlos on Wednesday.' }); item(g1, i => ({ status: 'Reported to management', log: [...i.log, [now(), 'Report sent to management, approved by you']] }));
              seq([[2200, () => { const fid = c.post({ kind: 'nudge', title: 'Follow-up · Wednesday', body: '“Hi Carlos, is the garage gate fixed?”', scope: 'Preview of a private message to Carlos. Pick his answer to see what happens.', actions: [['He says it’s fixed', 'fixed'], ['Still broken', 'still']] });
                on(fid, 'fixed', () => { c.setMsg(fid, { done: 'Issue closed. Carlos and Ana get a heads-up.' }); item(g1, i => ({ status: 'Fixed', log: [...i.log, [now(), 'Carlos confirmed it’s fixed. Closed.']] })); });
                on(fid, 'still', () => { c.setMsg(fid, { done: 'Still open. I sent management a reminder with the original report.' }); log(g1, 'Still broken on Wednesday. Reminder sent to management.'); }); }]]); }); }); }]]);
    },
    halloween(){
      c.go('chat');
      const d = new Date(new Date().getFullYear(), 9, 31); if (d < new Date(Date.now() - ZDAY)) d.setFullYear(d.getFullYear() + 1);
      seq([[500, () => c.post({ from: 'Priya · 6D', text: 'Should we do something for Halloween this year? The kids loved trick-or-treating in the hallways last time.' })],
        [1800, () => c.post({ from: 'Tom · 6A', text: 'Yes! Lobby on the 31st? I can bring candy and a speaker.' })],
        [1800, () => c.post({ from: 'Priya · 6D', text: '6pm works for us. I can do decorations.' })],
        [1600, () => c.post({ from: 'Liz · 4B', text: 'Count us in, we have 2 kids.' })],
        [2000, () => { const mid = c.post({ kind: 'nudge', title: 'Halloween is coming together', body: 'Priya and Tom are planning it for Oct 31, 6 PM, in the lobby. Want me to turn it into an event so neighbors can RSVP and say what they’re bringing?',
          why: ['Date, time and place all came up in the last 4 messages', '3 households said they’re in', 'Bringing so far: candy and a speaker (Tom), decorations (Priya)'], scope: 'Visible to Priya, Tom and you, the people planning it', actions: [['Create the event', 'make'], ['Not now', 'no']] });
          on(mid, 'no', () => c.setMsg(mid, { done: 'Okay. The chat stays as is.' }));
          on(mid, 'make', () => { const eid = c.uid(); c.upd(s => ({ events: [{ id: eid, title: 'Halloween in the lobby', date: zYmd(d), time: '6 PM', where: 'Lobby', by: 'Priya · 6D', going: 3, bring: [['Tom · 6A', 'Candy and a speaker'], ['Priya · 6D', 'Decorations']], photos: [], ts: now(), sim: true, fresh: true }, ...s.events] }));
            c.setMsg(mid, { done: 'Event created and shared in the chat.' }); c.bump(['building']);
            seq([[700, () => c.post({ kind: 'evcard', eid })], [3200, () => { c.post({ from: 'Mei · 7A', text: 'We’ll bring pizza for everyone!', chips: [['Event · Mei is bringing pizza', 'events', eid]] }); c.upd(s => ({ events: s.events.map(e => e.id === eid ? { ...e, going: e.going + 1, bring: [...e.bring, ['Mei · 7A', 'Pizza']] } : e) })); }]]); }); }]]);
    },
    catchup(){
      c.go('chat');
      const t = h => now() - h * 3600e3, w = c.uid();
      [[70, 'Rosa · 3B', 'Did anyone else catch that sunset tonight?'], [69, 'Dan · 8E', 'Who keeps taking the pool chairs up to their balcony'], [68.5, 'Mike · 9A', 'haha not guilty this time'], [40, 'Priya · 6D', 'Thank you to whoever brought my package up!'], [20, 'Tom · 6A', 'Anyone watching the game later?']].forEach(([h, f, x]) => c.post({ ts: t(h), from: f, text: x }));
      c.post({ ts: t(50), from: 'Dan · 8E', text: 'Water pressure is really low this morning, barely a trickle.', chips: [['Maintenance · new issue', 'building', w]] });
      c.post({ ts: t(49), from: 'Ana · 11F', text: 'Same on 11. Shower is useless.', chips: [['Same issue · 2 reports', 'building', w]] });
      c.post({ ts: t(46), from: 'Mike · 9A', text: '9th floor too.', chips: [['Same issue · 3 reports', 'building', w]] });
      c.upd(s => ({ lastSeen: t(72), items: [{ id: w, cat: 'Maintenance', title: 'Low water pressure, floors 8 to 11', by: 'Dan · 8E', reports: 3, status: 'Open', ts: t(50), sim: true, log: [[t(50), 'Dan · 8E reported it'], [t(49), 'Ana · 11F, same problem'], [t(46), 'Mike · 9A, same problem. Linked as one issue, likely the booster pump.']] }, ...s.items] }));
      setTimeout(c.openCatch, 500);
    },
    pests(){
      c.go('chat');
      const p = sup('Pest control', 'Coastal Pest Co.'), pn = p.name, gid = c.uid();
      seq([[500, () => c.post({ from: 'Rosa · 3B', text: 'Anyone else seeing roaches lately? Third time this month in our kitchen.' })],
        [1800, () => c.post({ from: 'Dan · 8E', text: 'Yes! We had our unit sprayed in June and they’re back.' })],
        [1800, () => c.post({ from: 'Mei · 7A', text: 'Same here. Was about to call someone.' })],
        [2000, () => { const mid = c.post({ kind: 'nudge', title: '3 neighbors have the same pest problem', body: 'Rosa, Dan and Mei mentioned roaches this week. Treating one unit at a time often doesn’t hold when neighbors have the same problem, and companies usually give a better rate for several units. Want me to ask them privately if they’d like to team up? Nobody’s name is shared until they say yes.',
          why: ['3 separate messages about roaches, from floors 3, 7 and 8', 'Dan’s unit was treated in June and the problem came back', pn + ' is in the directory' + (p.recs ? ' with ' + p.recs + (p.recs === 1 ? ' recommendation' : ' recommendations') : '')], actions: [['Ask them privately', 'ask'], ['Not now', 'no']] });
          on(mid, 'no', () => c.setMsg(mid, { done: 'Okay. I won’t bring it up again this week.' }));
          on(mid, 'ask', () => { c.setMsg(mid, { done: 'Asked Rosa, Dan and Mei privately.' });
            seq([[2000, () => { c.upd(s => ({ groupDeals: [{ id: gid, title: 'Pest control for the building', provider: pn, pid: p.id, goal: 6, units: ['You', 'Rosa · 3B', 'Dan · 8E'], status: 'Collecting interest', sim: true }, ...(s.groupDeals || [])] })); c.bump(['suppliers']);
                const m2 = c.post({ kind: 'nudge', title: 'Rosa and Dan are in', body: 'With you that’s 3 units. I started a group deal so other neighbors can join. At 6 units I’ll draft a quote request to ' + pn + '. You approve it before anyone is contacted.', actions: [['See the group deal', 'see']] });
                on(m2, 'see', () => c.go('suppliers', 'deals')); }],
              [4500, () => { c.upd(s => ({ groupDeals: (s.groupDeals || []).map(g => g.id === gid ? { ...g, units: [...g.units, 'Mei · 7A', 'Liz · 4B', 'Tom · 6A'] } : g) }));
                const m3 = c.post({ kind: 'nudge', title: '6 units are in', body: 'Mei, Liz and Tom joined. Here’s the quote request for ' + pn + ':', draft: 'Hi, we’re 6 units in the same building looking for pest control treatment together. Could you send us a building rate for 6 units and your availability? Thanks.', actions: [['Approve and send', 'send'], ['Not yet', 'no']] });
                on(m3, 'no', () => c.setMsg(m3, { done: 'Okay. It’s saved in Deals for when you’re ready.' }));
                on(m3, 'send', () => { c.setMsg(m3, { done: 'Quote requested (simulated). Everyone in the deal sees the price before deciding.' }); c.upd(s => ({ groupDeals: (s.groupDeals || []).map(g => g.id === gid ? { ...g, status: 'Quote requested from ' + pn } : g) })); }); }]]); }); }]]);
    }
  };
  return {
    run: k => run[k] && run[k](),
    nudge: (mid, k) => { const f = ZH[mid + ':' + k]; if (f) f(); else c.setMsg(mid, { done: 'This demo step expired after a reload. Run the scenario again.' }); }
  };
}

Object.assign(window, { SimTag, PrivCard, NudgeCard, EvCard, CatchUpSheet, ZScenarios, ZSCEN, zTop, zOk });
