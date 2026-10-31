/* Zing Neighbors App: resident availability (option A, no calendar connection) and calendar invites.
   The resident taps every time window that works; Zing only offers the provider those. Once a booking is confirmed
   the resident gets an .ics invite that opens in Google, Apple or Outlook calendar. Later this invite is also sent by text/email. */
const ZWIN = ['Morning', 'Afternoon', 'Evening'];
const ZWIN_H = { Morning: [9, 12], Afternoon: [13, 17], Evening: [17, 20], 'Any time': [10, 12], 'All day': [9, 17] };
const ZACCESS = ['I’ll be home', 'Door code', 'Front desk lets them in', 'Key with the concierge'];
const zPast = (i, w) => i === 0 && new Date().getHours() >= (ZWIN_H[w] || [0, 24])[1];
const zDayAt = i => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d; };
const zAvDays = n => Array.from({ length: n || 6 }, (_, i) => { const d = zDayAt(i); return { i, label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), wd: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-US', { weekday: 'short' }), dn: d.getDate() }; });

/* "this afternoon, tomorrow morning or evening, Thu, Nov 5 any time"; cap = capitalise the first letter */
function zAvText(slots, cap){
  let out;
  if (slots === 'any' || !slots || !slots.length) out = 'any time in the next few days';
  else { const by = {}; slots.forEach(s => { (by[s.i] = by[s.i] || []).push(s.win); });
    const L = zAvDays(7);
    out = Object.keys(by).sort((a, b) => a - b).map(i => { const w = ZWIN.filter(x => by[i].includes(x)), n = +i;
      if (n === 0) return w.length === 3 ? 'today any time' : w.map(x => x === 'Morning' ? 'this morning' : x === 'Afternoon' ? 'this afternoon' : 'this evening').join(' or ');
      return (n === 1 ? 'tomorrow' : L[n].label) + ' ' + (w.length === 3 ? 'any time' : w.map(x => x.toLowerCase()).join(' or ')); }).join(', '); }
  return cap ? out.charAt(0).toUpperCase() + out.slice(1) : out;
}
/* earliest start still ahead among the resident's slots: today's window starts at the next full hour if it has begun */
function zNextStart(slots){
  const now = new Date(), nh = now.getHours() + 1;
  const list = slots && slots !== 'any' ? slots.slice().sort((a, b) => a.i - b.i || ZWIN.indexOf(a.win) - ZWIN.indexOf(b.win)) : [{ i: 1, win: 'Morning' }];
  for (const s of list){ const [h0, h1] = ZWIN_H[s.win] || [9, 12], h = s.i === 0 ? Math.max(h0, nh) : h0; if (h >= h1) continue;
    const d = zDayAt(s.i); d.setHours(h, 0, 0, 0); if (+d > +now) return { ms: +d, slot: s }; }
  const d = zDayAt(1); d.setHours(10, 0, 0, 0); return { ms: +d, slot: null };
}
/* "Today at 4 PM", "Tomorrow at 5 PM", "Sat, Oct 31 at 9:30 AM" */
function zWhenLabel(ms){
  const d = new Date(ms), m = new Date(ms); m.setHours(0, 0, 0, 0); const i = Math.round((m - zDayAt(0)) / 864e5);
  const day = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return day + ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: d.getMinutes() ? '2-digit' : undefined });
}
const zFirstFuture = slots => slots && slots !== 'any' ? slots.slice().sort((a, b) => a.i - b.i || ZWIN.indexOf(a.win) - ZWIN.indexOf(b.win)).find(s => !zPast(s.i, s.win)) || null : null;

/* best guess at the confirmed start time: the provider's reply first, then the resident's first window */
function zStartFrom(text, slots, fallbackWin){
  const t = String(text || '').toLowerCase(), L = zAvDays(7);
  let day = null;
  if (/\btoday|tonight\b/.test(t)) day = 0; else if (/\btomorrow\b/.test(t)) day = 1;
  else { const wd = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'], m = t.match(/\b(sun|mon|tue|wed|thu|fri|sat)[a-z]*/);
    if (m){ const want = wd.indexOf(m[1]); for (let i = 0; i < 8; i++) if (zDayAt(i).getDay() === want){ day = i; break; } } }
  const first = zFirstFuture(slots);
  if (day == null) day = first ? first.i : 1;
  let h = null, mi = 0; const hm = t.match(/\b(\d{1,2})(?::(\d\d))?\s?(am|pm)\b/);
  if (hm){ h = +hm[1] % 12 + (hm[3] === 'pm' ? 12 : 0); mi = +(hm[2] || 0); }
  if (h == null){ const w = first && first.i === day ? first.win : fallbackWin || 'Morning'; h = (ZWIN_H[w] || ZWIN_H.Morning)[0]; }
  let s = zDayAt(day); s.setHours(h, mi, 0, 0);
  let moved = false;
  if (+s <= Date.now()){ // never a past start: the next selected slot still ahead, else tomorrow at the same hour
    moved = true; const nx = slots && slots !== 'any' ? zNextStart(slots) : null;
    if (nx && nx.slot) s = new Date(nx.ms); else { s = zDayAt(1); s.setHours(h, mi, 0, 0); } }
  return { start: +s, end: +s + 2 * 3600e3, exact: !!hm && !moved, moved };
}

function zIcs({ title, start, end, desc, loc }){
  const f = t => new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const esc = s => String(s || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Zing Neighbors//EN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    'UID:' + start + '-' + Math.random().toString(36).slice(2) + '@zing', 'DTSTAMP:' + f(Date.now()), 'DTSTART:' + f(start), 'DTEND:' + f(end),
    'SUMMARY:' + esc(title), 'DESCRIPTION:' + esc(desc), loc ? 'LOCATION:' + esc(loc) : '', 'BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(title), 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR']
    .filter(Boolean).join('\r\n');
}
function zBookingIcs(b, me){
  const H = window.HOA, s = (window.zSupById && window.zSupById(b.sid)) || {};
  return zIcs({ title: b.name + (b.trade ? ' · ' + b.trade : ''), start: b.start, end: b.end || b.start + 2 * 3600e3,
    desc: ['Booked through Zing Neighbors.', b.need ? 'What you need: ' + b.need : '', s.phone ? 'Phone: ' + H.fmtPhone(s.phone) : '', b.access ? 'Access: ' + b.access : '', b.exact ? '' : 'Time is approximate. Check the texts with ' + b.name.split(' ')[0] + '.'].filter(Boolean).join('\n'),
    loc: [H.GROUP.name, me && me.unit ? 'Unit ' + me.unit : ''].filter(Boolean).join(', ') });
}
function zDownloadIcs(b, me){
  const blob = new Blob([zBookingIcs(b, me)], { type: 'text/calendar' }), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'zing-' + String(b.name).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.ics';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function IcsBtn({ b, me }){
  if (!b || !b.start) return null;
  const d = new Date(b.start);
  return <button className="btn ghost icsb" onClick={() => zDownloadIcs(b, me)}><Ico d={I.check} s={15} /><span>{'Add to calendar · ' + d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + (b.exact ? '' : ' (approx.)')}</span></button>;
}

function AvailPicker({ m, act }){
  const [sel, setSel] = React.useState([]), done = !!m.picked, L = zAvDays(7).filter(d => d.i > 0 || ZWIN.some(w => !zPast(0, w)) || (done && m.picked !== 'any' && m.picked.some(s => s.i === 0))).slice(0, 6);
  const has = (i, w) => (done && m.picked !== 'any' ? m.picked : sel).some(s => s.i === i && s.win === w);
  const tog = (i, w) => { if (done || zPast(i, w)) return; setSel(x => has(i, w) ? x.filter(s => !(s.i === i && s.win === w)) : [...x, { i, win: w, label: zAvDays(7)[i].label }]); };
  const day = i => { if (done) return; const ok = ZWIN.filter(w => !zPast(i, w)), all = ok.every(w => has(i, w)), lab = zAvDays(7)[i].label; setSel(x => all ? x.filter(s => s.i !== i) : [...x.filter(s => s.i !== i), ...ok.map(w => ({ i, win: w, label: lab }))]); };
  return <div className="avp">
    <div className="avg"><span></span>{ZWIN.map(w => <span key={w} className="avh">{w}</span>)}
      {L.map(d => <React.Fragment key={d.i}><button className="avd" disabled={done} onClick={() => day(d.i)}><b>{d.wd}</b>{d.i > 1 && <em>{d.dn}</em>}</button>
        {ZWIN.map(w => <button key={w} className={'avc' + (has(d.i, w) ? ' on' : '')} disabled={done || zPast(d.i, w)} aria-pressed={has(d.i, w)} aria-label={d.label + ' ' + w} onClick={() => tog(d.i, w)}>{has(d.i, w) && <Ico d={I.check} s={14} />}</button>)}</React.Fragment>)}</div>
    {!done && <div className="chips"><button className="slot on" disabled={!sel.length} onClick={() => act.pickAvail(m.id, sel)}>{sel.length ? 'These work (' + sel.length + ')' : 'Tap the times that work'}</button><button className="slot" onClick={() => act.pickAvail(m.id, 'any')}>Any time works</button></div>}
  </div>;
}

Object.assign(window, { zNextStart, zWhenLabel, zFirstFuture, zPast, ZACCESS, ZWIN_H, zAvText, zStartFrom, zIcs, zDownloadIcs, IcsBtn, AvailPicker });
