/* Zing Neighbors App: "What you want to see". Each person picks the chat topics they follow.
   Topics they turn off fold into one line in the chat and are left out of their catch-up (later: notifications too).
   Your own messages, messages that mention you, and the AI's cards always show. Saved per device (zingN.app.interests). */
const ZI_TOPICS = [
  ['providers', 'Providers', 'Recommendations, prices, who to call'],
  ['safety', 'Safety', 'Break-ins, suspicious activity, security'],
  ['building', 'Building and maintenance', 'Repairs, outages, rules, notices'],
  ['events', 'Events', 'Plans, parties, meetings'],
  ['chat', 'Chit-chat', 'Jokes, thank-yous, everything else']
];
const ZI_ALL = { providers: true, safety: true, building: true, events: true, chat: true };
const ZI_PRESETS = [['Everything', ZI_ALL], ['Skip the chit-chat', { ...ZI_ALL, chat: false }], ['Only providers', { providers: true }], ['Only safety', { safety: true }]];
window.ZInterests = (function(){
  const KEY = 'zingN.app.interests';
  const get = () => { try { return { ...ZI_ALL, ...(JSON.parse(localStorage.getItem(KEY)) || {}) }; } catch (e) { return { ...ZI_ALL }; } };
  const set = v => { const o = {}; ZI_TOPICS.forEach(([k]) => { o[k] = !!v[k]; }); try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} window.dispatchEvent(new Event('zinterests')); };
  const subscribe = fn => { const h = e => { if (e.type === 'storage' && e.key !== KEY) return; fn(); }; addEventListener('zinterests', h); addEventListener('storage', h); return () => { removeEventListener('zinterests', h); removeEventListener('storage', h); }; };
  const all = v => ZI_TOPICS.every(([k]) => v[k]);
  return { KEY, get, set, subscribe, all };
})();
function useInterests(){ const [, s] = React.useState(0); React.useEffect(() => window.ZInterests.subscribe(() => s(x => x + 1)), []); return window.ZInterests.get(); }

const ZI_SAFE = /suspicious|stolen|theft|break.?in|propped|stranger|trespass|followed|someone tried|broken into|package(s)? (stolen|missing|taken)|police|security/i;
const ZI_EVENT = /\b(party|potluck|meeting|bbq|gathering|cleanup|halloween|christmas|game night|rsvp)\b/i;
/* which of the five topics a feed message belongs to */
function zTopicOf(m){
  const ch = (m.chips || []).map(c => c[1] + '|' + c[0]).join(' ');
  if (m.topic === 'suppliers' || /suppliers\|/.test(ch)) return 'providers';
  if (m.topic === 'events' || /events\|/.test(ch)) return 'events';
  if (m.topic === 'problems' || /building\|/.test(ch)) return /Safety/i.test(ch) || /safety/i.test(m.sub || '') || ZI_SAFE.test(m.text || '') ? 'safety' : 'building';
  if (m.topic === 'ignore') return 'chat';
  const t = m.text || '';
  if (ZI_SAFE.test(t)) return 'safety';
  if (ZI_EVENT.test(t)) return 'events';
  return 'chat';
}
function zShows(m, I, myName){
  if (window.ZInterests.all(I) || m.kind || m.from === 'You') return true;
  const f = String(myName || '').split(' ')[0];
  if (f && new RegExp('@' + f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(m.text || '')) return true;
  return !!I[zTopicOf(m)];
}
/* messages to render, with hidden runs folded into one line each */
function zFold(list, I, myName, open){
  const out = []; let run = null;
  list.forEach(m => { if (zShows(m, I, myName) || (open && open[m.id])) { run = null; out.push({ m }); return; }
    if (!run){ run = { fold: true, key: m.id, ids: [], topics: {} }; out.push(run); } run.ids.push(m.id); const t = zTopicOf(m); run.topics[t] = (run.topics[t] || 0) + 1; });
  return out;
}

function InterestsControls(){
  const I = useInterests(), Z = window.ZInterests, same = p => ZI_TOPICS.every(([k]) => !!p[k] === !!I[k]);
  return <>
    <div className="seg-scroll wrap zi-pre">{ZI_PRESETS.map(([l, p]) => <button key={l} className={'fchip' + (same(p) ? ' on' : '')} onClick={() => Z.set(p)}>{l}</button>)}</div>
    <div className="zi-tog">{ZI_TOPICS.map(([k, l, d]) => <label key={k}><span><b>{l}</b><em>{d}</em></span><input type="checkbox" checked={!!I[k]} onChange={() => Z.set({ ...I, [k]: !I[k] })} /><i></i></label>)}</div>
    <p className="fine">Topics you turn off fold into one line in the chat and are left out of your catch-up. Your own messages, messages that mention you and the AI’s answers always show.</p>
  </>;
}
function InterestsSheet({ onClose }){ return <Sheet onClose={onClose}><h3>What you want to see</h3><span className="meta">Only changes your view. Neighbors still see everything.</span><InterestsControls /><button className="btn" onClick={onClose}>Done</button></Sheet>; }
function InterestsBtn({ onOpen }){
  const I = useInterests(), on = ZI_TOPICS.filter(([k]) => I[k]).length, all = on === ZI_TOPICS.length;
  return <button className={'zi-btn' + (all ? '' : ' on')} onClick={onOpen} aria-label={all ? 'Choose what you want to see' : 'Showing ' + on + ' of ' + ZI_TOPICS.length + ' topics. Change'} title="What you want to see">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4" /></svg>{!all && <em>{on}</em>}</button>;
}
function FoldLine({ f, onShow }){
  const label = Object.entries(f.topics).map(([k, n]) => (ZI_TOPICS.find(t => t[0] === k) || [k, k])[1].toLowerCase() + (n > 1 ? ' ×' + n : '')).join(', ');
  return <button className="zi-fold" onClick={onShow}><span>{f.ids.length} {f.ids.length === 1 ? 'message' : 'messages'} you don’t follow · {label}</span><b>Show</b></button>;
}

Object.assign(window, { ZI_TOPICS, ZI_PRESETS, useInterests, zTopicOf, zShows, zFold, InterestsControls, InterestsSheet, InterestsBtn, FoldLine });
