/* Zing Neighbors app: reads the "Neighborhood Directory" Google Sheet (Providers + Mentions tabs) that the Claude in Chrome bot fills from the WhatsApp group. Read-only. Last good copy is cached in this browser. */
window.HOASheet = (() => {
const H = window.HOA, CACHE = 'zingN.sheet.v1';
const parseCsv = t => {
  const rows = []; let r = [], f = '', q = false;
  for (let i = 0; i < t.length; i++) { const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true; else if (c === ',') { r.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; r.push(f); rows.push(r); r = []; f = ''; }
    else f += c; }
  if (f || r.length) { r.push(f); rows.push(r); }
  const h = (rows.shift() || []).map(x => x.trim());
  return rows.filter(x => x.some(Boolean)).map(x => Object.fromEntries(h.map((k, i) => [k, (x[i] || '').trim()])));
};
const url = (id, tab) => 'https://docs.google.com/spreadsheets/d/' + id + '/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent(tab) + '&_=' + Date.now();
const get = u => fetch(u, { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); });

function build(P, M){
  const sup = P.filter(p => p.provider_name).map((p, i) => ({
    id: p.provider_id || 'p' + i, name: p.provider_name, biz: p.business_name || '', trade: H.normTrade(p.category), recs: parseInt(p.times_recommended, 10) || 0,
    phone: H.phones(p.phone)[0] || '', other: p.other_contact || '', services: p.services || '', bestFor: p.best_for || '', price: p.price_notes || '', warnings: p.warnings || '',
    firstD: H.parseDate(p.first_mentioned), lastD: H.parseDate(p.last_mentioned), byList: [...new Set((p.recommended_by || '').split(',').map(x => H.mask(x.trim())).filter(x => x && x !== 'A neighbor'))],
    quotes: [], sheet: true }));
  const find = m => { const ph = H.phones(m.phone).map(H.digits).filter(d => d.length >= 7), nm = (m.provider_name || '').toLowerCase().trim();
    return sup.find(s => (ph.length && ph.some(d => H.digits(s.phone).endsWith(d.slice(-10)))) || (nm && s.name.toLowerCase() === nm)); };
  const ms = M.filter(m => m.date).map(m => ({ ...m, d: H.parseDate(m.date, m.time) })).filter(m => m.d).sort((a, b) => a.d - b.d);
  const reqs = {}, feed = [];
  ms.forEach(m => {
    const who = H.mask(m.recommended_by), s = m.type === 'question' ? null : find(m), chips = [];
    if (m.type === 'question'){ const tr = H.normTrade(m.category); reqs[(m.mention_id || '').toUpperCase()] = { id: m.mention_id, who, text: m.quote || 'Asked for a ' + tr.toLowerCase(), trade: tr, d: m.d, answers: [] }; chips.push(['Request · ' + tr, 'suppliers', 'req:' + m.mention_id]); }
    if (s){ if (m.type === 'recommend' && m.quote) s.quotes.push([who, m.quote, m.d]);
      chips.push([(m.type === 'warning' ? 'Warning · ' : '') + s.name + ' · ' + s.trade, 'suppliers', s.id]); }
    const rr = /Reply to (M\d+)/i.exec(m.job_notes || ''); if (rr && reqs[rr[1].toUpperCase()]) reqs[rr[1].toUpperCase()].answers.push({ who, sid: s ? s.id : null, name: m.provider_name || '', d: m.d });
    const text = m.quote || (m.type === 'question' ? 'Asked for a ' + (m.category || 'recommendation').toLowerCase() : m.type === 'shared-without-comment' ? 'Shared a contact: ' + (m.provider_name || '') : m.provider_name ? 'Recommended ' + m.provider_name : '');
    if (text) feed.push({ id: 's' + (m.mention_id || feed.length), from: who, text, d: m.d, ts: +m.d, chips, sheet: true });
  });
  sup.forEach(s => { s.quotes.reverse(); if (!s.recs) s.recs = Math.max(1, s.quotes.length); });
  return { suppliers: sup, feed, requests: Object.values(reqs).sort((a, b) => b.d - a.d) };
}
const revive = o => { const D = x => x ? new Date(x) : null; o.suppliers.forEach(s => { s.firstD = D(s.firstD); s.lastD = D(s.lastD); s.quotes.forEach(q => q[2] = D(q[2])); }); o.feed.forEach(f => f.d = D(f.d)); o.requests.forEach(r => { r.d = D(r.d); r.answers.forEach(a => a.d = D(a.d)); }); return o; };
function cached(){ try { const t = localStorage.getItem(CACHE); if (t) { const o = JSON.parse(t); return { ...revive(o.data), at: new Date(o.at), live: false, cached: true }; } } catch (e) {} return null; }
async function load(id){
  const [pt, mt] = await Promise.all([get(url(id, 'Providers')), get(url(id, 'Mentions')).catch(() => '')]);
  const data = build(parseCsv(pt), mt ? parseCsv(mt) : []);
  if (!data.suppliers.length) throw new Error('No providers in the sheet');
  try { localStorage.setItem(CACHE, JSON.stringify({ at: Date.now(), data })); } catch (e) {}
  return { ...data, at: new Date(), live: true };
}
return { load, cached };
})();
