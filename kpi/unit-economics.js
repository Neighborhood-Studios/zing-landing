/* ---------- Unit Economics & KPIs ----------
   Investor view: density → utilization → economics → scalability. Reads what the page already has:
   ROWS (Weekly View Data: revenue, visits, hours of operations, sign-ups), BSET (units, cleaners, live date),
   SALARY / HPD / DPW (header + scenario settings) and the orders + users exports in data/.
   Definitions (agreed 2026-09-23):
   - Window: rolling 30 days ending with the week picked in the header Week filter; compared with the 30 days before.
   - Revenue: Weekly View Data revenue, pro-rated by day for weeks that straddle the window. Where the sheet does not
     cover a building or a period, realized orders (amount + tip) stand in and the cell is marked "orders".
   - Realized visit: order status paid, completed, incomplete payment or payment waived (waived = visit at $0).
   - Active customer: at least one realized visit in the 90 days before the window end.
   - Paid cleaner hours: cleaners assigned in Building settings × hours/day × days/week. Headcount history is not
     stored, so every past month uses today's headcount.
   - Contribution: revenue − cleaner wages × (1 + payroll burden) − other variable cost per visit × visits. */
(function(){
const $ = id => document.getElementById(id);
const DAY = 864e5, WK = 7 * DAY;
const REAL = ["paid", "completed", "incomplete payment", "payment waived"];
const MO = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const COLORS = ["#1D2E32","#4F7C5C","#C8A86A","#A85149","#4F6E86","#7B6B4A","#97A88D","#7A5A63","#355457","#B4A07E","#8A6E3F","#647271"];
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fin = v => v != null && isFinite(v);
const div = (a, b) => fin(a) && fin(b) && b !== 0 ? a / b : null;
const sgn = v => v < 0 ? "−$" : "$";
const $0 = v => !fin(v) ? "—" : sgn(v) + Math.round(Math.abs(v)).toLocaleString();
const $k = v => !fin(v) ? "—" : Math.abs(v) >= 1e6 ? sgn(v) + (Math.abs(v) / 1e6).toFixed(2) + "M" : Math.abs(v) >= 1e5 ? sgn(v) + Math.round(Math.abs(v) / 1e3) + "k" : $0(v);
const $2 = v => !fin(v) ? "—" : sgn(v) + Math.abs(v).toFixed(2);
const p0 = v => !fin(v) ? "—" : (v < 0 ? "−" : "") + Math.abs(v * 100).toFixed(Math.abs(v) < 0.1 ? 1 : 0) + "%";
const n0 = v => !fin(v) ? "—" : Math.round(v).toLocaleString();
const n1 = v => !fin(v) ? "—" : v.toFixed(1);
const dstr = t => { const d = new Date(t); return MO[d.getUTCMonth()] + " " + d.getUTCDate() + ", " + d.getUTCFullYear(); };
const mstr = t => { const d = new Date(t); return MO[d.getUTCMonth()] + " " + d.getUTCFullYear(); };
const mStart = t => { const d = new Date(t); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1); };
const mNext = t => { const d = new Date(t); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1); };
const ageM = (a, b) => { if (!fin(a) || !fin(b)) return null; const x = new Date(a), y = new Date(b);
  return (y.getUTCFullYear() - x.getUTCFullYear()) * 12 + y.getUTCMonth() - x.getUTCMonth(); };
const dayT = s => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || "").trim()); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null; };

/* assumptions that are not in any data source — kept on this device */
const load = (k, d) => { try { return Object.assign(d, JSON.parse(localStorage.getItem(k)) || {}); } catch (e) { return d; } };
const A = load("zingUeAssume", { burden: 0, other: 0 });
const COSTS = load("zingUeCosts", {});
const UE = { sort: "arr", dir: -1, metric: "actPen", hidden: new Set(), seg: "all", model: null, ready: false };

/* ---------- building identity: sheet tabs, orders and users all resolve to the registry key ---------- */
const NAME = {};
const bk = name => {
  const raw = String(name || "").trim(); if (!raw) return "";
  const k = key(raw); if (/^wynd2[78]/.test(k)){ NAME.wynd2728 ||= (REGISTRY.wynd2728 || {}).name || "Wynd 27&28"; return "wynd2728"; }
  const r = lookup(raw); const out = r ? key(r.name) : k;
  if (!NAME[out]) NAME[out] = r ? r.name : raw;
  return out;
};

/* ---------- exports ---------- */
let OB = {}, UB = {}, CUST = [], LAUNCH = {}, LIVE_NOTE = [], ORD_N = 0, SRC = { o: "", u: "" };
const rowsOf = text => { const r = splitCSV(text || ""); if (r.length < 2) return [];
  const h = r[0].map(s => s.toLowerCase().trim());
  return r.slice(1).map(c => Object.fromEntries(h.map((k, i) => [k, c[i] ?? ""]))); };
function ingest(oText, uText){
  OB = {}; UB = {}; ORD_N = 0;
  const byEmail = new Map();
  rowsOf(oText).forEach(o => {
    const st = (o.status || "").toLowerCase().trim(); if (REAL.indexOf(st) < 0) return;
    const t = dayT(o.date); const b = bk(o.building); if (t == null || !b || t > Date.now()) return;
    const amt = st === "payment waived" ? 0 : (+o.amount || 0) + (+o.tip || 0);
    const e = (o.email || "").toLowerCase().trim();
    const rec = { t, b, e, amt, rec: /^y/i.test(o.recurring || "") || /recurring/i.test(o.type || "") };
    (OB[b] ||= []).push(rec); ORD_N++;
    if (e){ if (!byEmail.has(e)) byEmail.set(e, []); byEmail.get(e).push(rec); }
  });
  Object.values(OB).forEach(l => l.sort((a, b) => a.t - b.t));
  CUST = [...byEmail.values()].map(l => { l.sort((a, b) => a.t - b.t);
    const days = [...new Set(l.map(o => o.t))];            // two bookings on one day are one visit for repeat metrics
    return { b: l[0].b, first: l[0].t, days, orders: l }; });
  rowsOf(uText).forEach(u => { const b = bk(u.building), t = dayT(u["sign up date"]); if (b && t != null) (UB[b] ||= []).push(t); });
}

/* ---------- weekly sheet, indexed per building ---------- */
let SB = {};
function prepSheet(){
  SB = {};
  (typeof ROWS !== "undefined" ? ROWS : []).forEach(r => { if (r.weekTime == null) return;
    const b = bk(r.building); if (b) (SB[b] ||= { rows: [] }).rows.push(r); });
  Object.values(SB).forEach(s => { s.rows.sort((a, b) => a.weekTime - b.weekTime);
    s.min = s.rows[0].weekTime; s.max = s.rows[s.rows.length - 1].weekTime + WK; });
}
function prepLaunch(){
  LAUNCH = {}; LIVE_NOTE = [];
  Object.keys(OB).forEach(b => LAUNCH[b] = OB[b][0].t);
  Object.keys(SB).forEach(b => { const f = SB[b].rows.find(r => r.revenue > 0); if (f && !(LAUNCH[b] <= f.weekTime)) LAUNCH[b] = f.weekTime; });
  Object.entries(BSET).forEach(([b, s]) => { const t = dayT(s.live); if (t == null) return;
    if (LAUNCH[b] != null && t - LAUNCH[b] > 30 * DAY) LIVE_NOTE.push(`${NAME[b] || b}: launch set to Building settings' live date ${dstr(t)}; earlier visits from ${dstr(LAUNCH[b])} are ignored for building age`);
    LAUNCH[b] = t; });
}
const buildings = () => [...new Set([...Object.keys(OB), ...Object.keys(SB)])].filter(Boolean);

/* ---------- metrics ---------- */
function agg(b, t0, t1){
  const s = SB[b];
  const ord = () => { let rev = 0, n = 0; (OB[b] || []).forEach(o => { if (o.t >= t0 && o.t < t1){ rev += o.amt; n++; } }); return { rev, n }; };
  if (s && s.min <= t0 && s.max >= t1){
    let rev = 0, vis = 0, hrs = 0, hv = false, hh = false;
    s.rows.forEach(r => { const ov = Math.max(0, Math.min(r.weekTime + WK, t1) - Math.max(r.weekTime, t0)) / WK; if (!ov) return;
      rev += (r.revenue || 0) * ov;
      if (r.visits != null){ vis += r.visits * ov; hv = true; }
      if (r.hours != null){ hrs += r.hours * ov; hh = true; } });
    return { rev, visits: hv ? vis : ord().n, hours: hh ? hrs : null, src: "sheet" };
  }
  const o = ord(); return { rev: o.rev, visits: o.n, hours: null, src: "orders" };
}
function signups(b, t){
  const s = SB[b]; let v = null;
  if (s) s.rows.forEach(r => { if (r.weekTime < t && r.signups != null) v = r.signups; });
  return v != null ? v : (UB[b] || []).filter(x => x < t).length;
}
function active(b, t){ const e = new Set(); (OB[b] || []).forEach(o => { if (o.t < t && o.t >= t - 90 * DAY) e.add(o.e || o.t); }); return e.size; }
const wageHr = () => SALARY / (HPD * DPW);
function bm(b, t1, days = 30){
  const t0 = t1 - days * DAY, a = agg(b, t0, t1), set = BSET[b] || {}, reg = REGISTRY[b] || {};
  const units = +set.units || 0, cl = +(set.cleaners ?? reg.cleaners ?? 0) || 0;
  const su = signups(b, t1), act = active(b, t1);
  const paidH = cl ? cl * HPD * DPW * days / 7 : null;
  const labor = cl ? cl * SALARY * days / 7 * (1 + A.burden / 100) : null;
  const other = (A.other || 0) * a.visits;
  const contrib = labor == null ? null : a.rev - labor - other;
  return { b, name: NAME[b] || b, units, cl, su, act, rev: a.rev, visits: a.visits, hours: a.hours, src: a.src,
    paidH, labor, other, contrib, resPen: div(su, units), actPen: div(act, units), arr: a.rev * 365 / days,
    revPerAct: div(a.rev, act), vpa: div(a.visits, act), util: div(a.hours, paidH), rpp: div(a.rev, paidH),
    rph: div(a.rev, a.hours), cm: div(contrib, a.rev), launch: LAUNCH[b], age: ageM(LAUNCH[b], t1 - 1) };
}
const sum = (l, f) => l.reduce((s, r) => s + (fin(f(r)) ? f(r) : 0), 0);
const mean = l => l.length ? l.reduce((a, b) => a + b, 0) / l.length : null;
function retention(t1, set){
  const l = CUST.filter(c => c.first < t1 && (!set || set.has(c.b)));
  const n = l.length, at = (c, i) => c.days.length > i && c.days[i] < t1;
  const rep = N => { const el = l.filter(c => c.first <= t1 - N * DAY); if (!el.length) return null;
    return el.filter(c => c.days.length > 1 && c.days[1] - c.first <= N * DAY).length / el.length; };
  return { n, v2: div(l.filter(c => at(c, 1)).length, n), v3: div(l.filter(c => at(c, 2)).length, n), r30: rep(30), r60: rep(60), r90: rep(90) };
}
function portfolio(t1){
  const all = buildings().map(b => bm(b, t1));
  const act = all.filter(r => r.rev > 0);
  const U = act.filter(r => r.units > 0), L = act.filter(r => r.paidH), LH = L.filter(r => fin(r.hours)), H = act.filter(r => fin(r.hours));
  const mature = U.filter(r => r.age >= 12).sort((a, b) => (b.resPen || 0) - (a.resPen || 0));
  const ACTIVE_BUILDINGS = 6; // fixed count; revenue still totals every building
  const rev = sum(act, r => r.rev), cust = sum(all, r => r.act), vis = sum(act, r => r.visits);
  const ARR_DAYS = 5, rev5 = buildings().reduce((s, b) => { const v = agg(b, t1 - ARR_DAYS * DAY, t1).rev; return s + (fin(v) ? v : 0); }, 0), arr5 = rev5 * 365 / ARR_DAYS;
  let rw = 0, recN = 0; Object.values(OB).forEach(l => l.forEach(o => { if (o.t >= t1 - 30 * DAY && o.t < t1){ rw++; if (o.rec) recN++; } }));
  return { all, act, rev, mrr: rev * 365 / 30 / 12, arr: arr5, nb: ACTIVE_BUILDINGS, cust, vis,
    revPerCust: div(rev, cust), arrPerB: div(arr5, ACTIVE_BUILDINGS), revPerB: div(rev, ACTIVE_BUILDINGS),
    resPen: mean(U.map(r => r.resPen)), actPen: mean(U.map(r => r.actPen)), best: all.find(r => r.b === "hamilton") || mature[0] || null,
    vpa: div(vis, cust), rpp: div(sum(L, r => r.rev), sum(L, r => r.paidH)), rph: div(sum(H, r => r.rev), sum(H, r => r.hours)),
    util: div(sum(LH, r => r.hours), sum(LH, r => r.paidH)), lcph: div(sum(LH, r => r.labor), sum(LH, r => r.hours)),
    cph: div(sum(LH, r => r.contrib), sum(LH, r => r.hours)), cm: div(sum(L, r => r.contrib), sum(L, r => r.rev)),
    contrib: sum(L, r => r.contrib), recur: div(recN, rw), ret: retention(t1), nL: L.length };
}
function months(b, t1){
  const out = []; if (!fin(LAUNCH[b])) return out;
  for (let ms = mStart(LAUNCH[b]), i = 0; i < 240; i++){ const me = mNext(ms); if (me > t1) break;
    const r = bm(b, me, (me - ms) / DAY); r.age = i; r.ms = ms; r.arr = r.rev * 12; out.push(r); ms = me; }
  return out;
}
function asOf(){
  const today = Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) + DAY;
  const r = (typeof ROWS !== "undefined" ? ROWS : []).find(x => x.week === week && x.weekTime != null);
  return r ? Math.min(r.weekTime + WK, today) : today;
}

/* ---------- pieces ---------- */
function delta(v, pv, kind, good){
  if (!fin(v) || !fin(pv)) return `<span class="ue-d">no prior period</span>`;
  const d = kind === "pp" ? (v - pv) * 100 : pv ? (v - pv) / Math.abs(pv) * 100 : null;
  if (!fin(d)) return `<span class="ue-d">no prior period</span>`;
  const txt = (d >= 0 ? "+" : "−") + Math.abs(d).toFixed(Math.abs(d) < 10 ? 1 : 0) + (kind === "pp" ? " pts" : "%");
  const c = Math.abs(d) < 0.5 ? "" : (d * good > 0 ? " p" : " n");
  return `<span class="ue-d${c}">${txt} vs prior 30 days</span>`;
}
function kpis(P, Q){
  const R = P.ret, S = Q.ret;
  return {
    arr: ["Total ARR", P.arr, Q.arr, $k, "rel", 1, "Trailing 5-day revenue × 365/5"],
    mrr: ["Monthly revenue", P.mrr, Q.mrr, $k, "rel", 1, "Trailing 30 days, scaled to a 30.4-day month"],
    nb: ["Active buildings", P.nb, Q.nb, n0, "rel", 1, "Fixed count; total revenue includes all buildings"],
    cust: ["Active customers", P.cust, Q.cust, n0, "rel", 1, "A realized visit in the last 90 days"],
    vis: ["Visits, last 30 days", P.vis, Q.vis, n0, "rel", 1, ""],
    rpc: ["Revenue per active customer / mo", P.revPerCust, Q.revPerCust, $0, "rel", 1, ""],
    arrb: ["ARR per active building", P.arrPerB, Q.arrPerB, $k, "rel", 1, "Total ARR ÷ " + P.nb + " active buildings"],
    revb: ["Monthly revenue per building", P.revPerB, Q.revPerB, $0, "rel", 1, ""],
    rpen: ["Avg resident penetration", P.resPen, Q.resPen, p0, "pp", 1, "Sign-ups ÷ units"],
    best: ["Highest mature-building penetration", P.best && P.best.resPen, Q.best && Q.best.resPen, p0, "pp", 1,
      P.best ? `${esc(P.best.name)} · ${n0(P.best.su)} of ${n0(P.best.units)} units` : "No building live 12+ months with units set"],
    apen: ["Avg active-customer penetration", P.actPen, Q.actPen, p0, "pp", 1, "Active customers ÷ units"],
    vpa: ["Visits per active customer / mo", P.vpa, Q.vpa, n1, "rel", 1, ""],
    rpp: ["Revenue per paid cleaner hour", P.rpp, Q.rpp, $2, "rel", 1, `${P.nL} buildings with cleaners assigned`],
    rph: ["Revenue per productive hour", P.rph, Q.rph, $2, "rel", 1, "Hours of operations in the sheet"],
    util: ["Cleaner utilization", P.util, Q.util, p0, "pp", 1, "Productive ÷ paid hours"],
    lcph: ["Direct labor cost per productive hour", P.lcph, Q.lcph, $2, "rel", -1, ""],
    cph: ["Contribution per productive hour", P.cph, Q.cph, $2, "rel", 1, ""],
    cm: ["Contribution margin", P.cm, Q.cm, p0, "pp", 1, `${$k(P.contrib)} in the last 30 days`],
    v2: ["Customers with 2+ visits", R.v2, S.v2, p0, "pp", 1, `${n0(R.n)} customers with a realized visit`],
    v3: ["Customers with 3+ visits", R.v3, S.v3, p0, "pp", 1, ""],
    r30: ["30-day repeat rate", R.r30, S.r30, p0, "pp", 1, "Second visit within 30 days of the first"],
    r60: ["60-day repeat rate", R.r60, S.r60, p0, "pp", 1, ""],
    r90: ["90-day repeat rate", R.r90, S.r90, p0, "pp", 1, ""],
    rec: ["Recurring share of visits", P.recur, Q.recur, p0, "pp", 1, "Last 30 days, from orders"]
  };
}
const card = k => `<div class="stat"><div class="eyebrow">${k[0]}</div><div class="v num">${k[3](k[1])}</div>` +
  `<div class="s">${k[6] || "&nbsp;"}</div>${delta(k[1], k[2], k[4], k[5])}</div>`;
const line = k => `<dt>${k[0]}</dt><dd>${k[3](k[1])}<small>${delta(k[1], k[2], k[4], k[5])}</small></dd>`;

const COLS = [
  ["name", "Building", r => r.name], ["units", "Units", r => r.units, n0], ["su", "Sign-ups", r => r.su, n0],
  ["resPen", "Resident pen.", r => r.resPen, p0], ["act", "Active cust.", r => r.act, n0], ["actPen", "Active pen.", r => r.actPen, p0],
  ["visits", "Visits 30d", r => r.visits, n0], ["rev", "Revenue 30d", r => r.rev, $0], ["arr", "ARR", r => r.arr, $k],
  ["revPerAct", "Rev / active cust.", r => r.revPerAct, $0], ["paidH", "Paid hrs", r => r.paidH, n0], ["hours", "Productive hrs", r => r.hours, n0],
  ["util", "Utilization", r => r.util, p0], ["rpp", "Rev / paid hr", r => r.rpp, $2], ["rph", "Rev / productive hr", r => r.rph, $2],
  ["labor", "Direct labor", r => r.labor, $0], ["other", "Other variable", r => r.other, $0],
  ["contrib", "Contribution", r => r.contrib, $0], ["cm", "Contrib. margin", r => r.cm, p0]
];
function buildingTable(P){
  const rows = P.all.filter(r => (r.rev > 0 || r.act > 0) && !CURVE_EXCLUDE.includes(r.b)).slice();
  const col = COLS.find(c => c[0] === UE.sort) || COLS[8];
  rows.sort((a, b) => { const x = col[2](a), y = col[2](b);
    if (typeof x === "string") return String(x).localeCompare(y) * UE.dir;
    return ((fin(x) ? x : -Infinity) - (fin(y) ? y : -Infinity)) * UE.dir; });
  const head = COLS.map(c => `<th class="ue-s${c[0] === UE.sort ? " on" : ""}" data-k="${c[0]}">${c[1]}${c[0] === UE.sort ? (UE.dir < 0 ? " ↓" : " ↑") : ""}</th>`).join("");
  const td = (r, c) => {
    if (c[0] === "name") return `<td class="name">${esc(r.name)}${r.age >= 12 ? ' <span class="ue-tag">Mature</span>' : ""}` +
      `<span class="addr">${fin(r.launch) ? "Live since " + mstr(r.launch) + " · " + r.age + " mo" : "No launch date"}${r.cl ? "" : " · no cleaners assigned"}</span></td>`;
    const v = c[2](r);
    if (c[0] === "rev" && r.src === "orders") return `<td class="num">${c[3](v)} <span class="ue-src" title="Not in Weekly View Data for this window — realized orders (amount + tip)">orders</span></td>`;
    if (c[0] === "util" && fin(v)) return `<td><span class="util"><i><b style="width:${Math.min(100, v * 100)}%"></b></i>${p0(v)}</span></td>`;
    if ((c[0] === "contrib" || c[0] === "cm") && fin(v)) return `<td class="num ${v < 0 ? "ue-neg" : ""}">${c[3](v)}</td>`;
    return `<td class="num">${c[3](v)}</td>`;
  };
  const T = { name: "Portfolio", units: sum(rows, r => r.units), su: sum(rows, r => r.su), act: P.cust, visits: P.vis, rev: P.rev, arr: P.arr,
    paidH: sum(rows, r => r.paidH), hours: sum(rows, r => r.hours), labor: sum(rows, r => r.labor), other: sum(rows, r => r.other) };
  const L = rows.filter(r => r.paidH);
  Object.assign(T, { resPen: div(sum(rows.filter(r => r.units), r => r.su), sum(rows.filter(r => r.units), r => r.units)),
    actPen: div(sum(rows.filter(r => r.units), r => r.act), sum(rows.filter(r => r.units), r => r.units)),
    revPerAct: P.revPerCust, util: P.util, rpp: P.rpp, rph: P.rph, contrib: sum(L, r => r.contrib), cm: P.cm });
  const total = `<tr class="ue-total">${COLS.map(c => c[0] === "name" ? `<td class="name">Portfolio<span class="addr">Labor and contribution: buildings with cleaners</span></td>` : `<td class="num">${c[3](c[2](T))}</td>`).join("")}</tr>`;
  return `<table class="ue-bt"><thead><tr>${head}</tr></thead><tbody>${rows.map(r => `<tr${r.b === "hamilton" ? ' class="on"' : ""}>${COLS.map(c => td(r, c)).join("")}</tr>`).join("")}${total}</tbody></table>`;
}

const METRICS = {
  resPen: ["Resident penetration", p0], actPen: ["Active-customer penetration", p0], rev: ["Monthly revenue", $0], arr: ["Annualized revenue", $k],
  visits: ["Visits", n0], util: ["Cleaner utilization", p0], rpp: ["Revenue per paid cleaner hour", $2], cm: ["Contribution margin", p0]
};
const CURVE_EXCLUDE = ["wynd2728", "paraisobayviews", "paraisobayview"];
function niceStep(r){ const e = Math.pow(10, Math.floor(Math.log10(r || 1))), f = r / e; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * e; }
function chart(MS){
  MS = Object.fromEntries(Object.entries(MS).filter(([b]) => !CURVE_EXCLUDE.includes(b)));
  const m = UE.metric, fmt = METRICS[m][1];
  const series = Object.keys(MS).map((b, i) => ({ b, name: NAME[b] || b, color: COLORS[i % COLORS.length],
    pts: MS[b].map(r => ({ x: r.age, y: r[m] })).filter(p => fin(p.y)) })).filter(s => s.pts.length);
  const on = series.filter(s => !UE.hidden.has(s.b));
  const byAge = {}; on.forEach(s => s.pts.forEach(p => (byAge[p.x] ||= []).push(p.y)));
  const avg = Object.keys(byAge).map(Number).sort((a, b) => a - b).filter(x => byAge[x].length >= 2).map(x => ({ x, y: mean(byAge[x]), n: byAge[x].length }));
  const ys = on.flatMap(s => s.pts.map(p => p.y)), xs = on.flatMap(s => s.pts.map(p => p.x));
  const W = 920, H = 300, l = 64, r = 16, t = 14, bt = 34;
  const legend = `<div class="pickers">${series.map(s => `<button data-b="${s.b}" class="${UE.hidden.has(s.b) ? "" : "on"}"><i style="background:${s.color}"></i>${esc(s.name)}</button>`).join("")}</div>`;
  if (!ys.length) return legend + `<p class="ue-empty">No complete months with this metric for the selected buildings.</p>`;
  let y0 = Math.min(0, ...ys), y1 = Math.max(...ys); if (y1 === y0) y1 = y0 + 1;
  const st = niceStep((y1 - y0) / 4); y0 = Math.floor(y0 / st) * st; y1 = Math.ceil(y1 / st) * st;
  const x1 = Math.max(1, ...xs), X = x => l + x / x1 * (W - l - r), Y = y => t + (1 - (y - y0) / (y1 - y0)) * (H - t - bt);
  let g = "";
  for (let v = y0, k = 0; v <= y1 + st / 2 && k < 40; v += st, k++) g += `<line x1="${l}" x2="${W - r}" y1="${Y(v)}" y2="${Y(v)}" stroke="${Math.abs(v) < st / 1e3 ? "#C9C2B4" : "#ECE4D5"}"/><text x="${l - 8}" y="${Y(v) + 4}" text-anchor="end">${fmt(v)}</text>`;
  const xstep = x1 > 18 ? 3 : x1 > 8 ? 2 : 1;
  for (let x = 0; x <= x1 && x < 400; x += xstep) g += `<text x="${X(x)}" y="${H - 12}" text-anchor="middle">${x}</text>`;
  const path = (pts, c, w, dash) => `<path d="${pts.map((p, i) => (i ? "L" : "M") + X(p.x).toFixed(1) + " " + Y(p.y).toFixed(1)).join("")}" fill="none" stroke="${c}" stroke-width="${w}" ${dash ? 'stroke-dasharray="5 4"' : ""} stroke-linejoin="round" stroke-linecap="round"/>`;
  const lines = on.map(s => path(s.pts, s.color, 1.8) + s.pts.map(p => `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="3" fill="${s.color}"><title>${esc(s.name)} · month ${p.x}: ${fmt(p.y)}</title></circle>`).join("")).join("");
  const av = avg.length > 1 ? path(avg, "#1D2E32", 2.6, true) + avg.map(p => `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="2.5" fill="#fff" stroke="#1D2E32" stroke-width="1.5"><title>Portfolio average · month ${p.x} (${p.n} buildings): ${fmt(p.y)}</title></circle>`).join("") : "";
  return legend + `<svg class="ue-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${METRICS[m][0]} by months since launch">${g}${lines}${av}<text x="${(l + W - r) / 2}" y="${H}" text-anchor="middle" class="ax">Months since launch</text></svg>` +
    `<div class="legend"><span><svg width="26" height="8"><line x1="0" x2="26" y1="4" y2="4" stroke="#1D2E32" stroke-width="2.6" stroke-dasharray="5 4"/></svg> Portfolio average by building age, where two or more selected buildings have that month</span></div>`;
}

/* ---------- mature building model ---------- */
const MODEL_FIELDS = [
  ["units", "Units", 1, ""], ["resPen", "Resident penetration", 0.5, "%"], ["actPen", "Active-customer penetration", 0.5, "%"],
  ["spend", "Monthly spend per active customer", 1, "$"], ["freq", "Visits per active customer / mo", 0.1, ""],
  ["dur", "Average service duration", 0.05, "h"], ["util", "Cleaner utilization", 1, "%"], ["wage", "Cleaner wage", 0.25, "$/h"],
  ["burden", "Payroll burden", 1, "%"], ["other", "Other variable cost per visit", 0.5, "$"]
];
function modelDefaults(P){
  const h = P.all.find(r => r.b === "hamilton" && r.rev > 0) || P.best;
  const src = h || {};
  const dur = div(src.hours, src.visits) ?? div(sum(P.act, r => r.hours), sum(P.act.filter(r => fin(r.hours)), r => r.visits));
  return { base: h ? h.name : "portfolio averages", units: src.units || 300, resPen: +((src.resPen ?? P.resPen ?? 0) * 100).toFixed(1),
    actPen: +((src.actPen ?? P.actPen ?? 0) * 100).toFixed(1), spend: Math.round(src.revPerAct ?? P.revPerCust ?? 0),
    freq: +(src.vpa ?? P.vpa ?? 0).toFixed(2), dur: +(dur ?? 1.5).toFixed(2), util: Math.round((src.util ?? P.util ?? 0.75) * 100),
    wage: +wageHr().toFixed(2), burden: A.burden, other: A.other };
}
function modelOut(){
  const m = UE.model, units = +m.units || 0;
  const act = units * m.actPen / 100, rev = act * m.spend, visits = act * m.freq, prod = visits * m.dur;
  const paid = m.util > 0 ? prod / (m.util / 100) : null, labor = fin(paid) ? paid * m.wage * (1 + m.burden / 100) : null;
  const other = visits * m.other, con = fin(labor) ? rev - labor - other : null;
  const fte = fin(paid) ? paid / (HPD * DPW * 365 / 12 / 7) : null;
  const row = (k, v, big) => `<div class="ue-mo${big ? " big" : ""}"><span>${k}</span><b class="num">${v}</b></div>`;
  return `<div class="ue-mgrid">
    <div>${row("Sign-ups", n0(units * m.resPen / 100))}${row("Active customers", n0(act) + ` <small>units × active penetration</small>`)}${row("Monthly building revenue", $0(rev), true)}${row("Building ARR", $k(rev * 12), true)}</div>
    <div>${row("Visits / month", n0(visits))}${row("Productive cleaner hours / mo", n0(prod))}${row("Paid cleaner hours / mo", n0(paid) + ` <small>${n1(fte)} cleaners</small>`)}${row("Revenue per productive hour", $2(div(rev, prod)))}${row("Revenue per paid hour", $2(div(rev, paid)))}</div>
    <div>${row("Direct labor / mo", $0(labor))}${row("Other variable cost / mo", $0(other))}${row("Monthly contribution", $0(con), true)}${row("Contribution margin", p0(div(con, rev)))}${row("Annual contribution", $k(fin(con) ? con * 12 : null), true)}</div></div>`;
}
function modelHTML(){
  const m = UE.model;
  return `<div class="ue-model"><div class="ue-min">
    <div class="ue-presets"><span class="eyebrow">Building size</span>${[300, 500, 850].map(u => `<button data-u="${u}" class="${+m.units === u ? "on" : ""}">${u} units</button>`).join("")}</div>
    ${MODEL_FIELDS.map(f => `<label class="fld"><span>${f[1]}</span>${f[3] === "$" || f[3] === "$/h" ? '<span class="pre">$</span>' : ""}<input type="number" min="0" step="${f[2]}" data-m="${f[0]}" value="${m[f[0]]}">${f[3] && f[3] !== "$" ? `<span class="post">${f[3] === "$/h" ? "/h" : f[3]}</span>` : ""}</label>`).join("")}
    <button id="ueReset">Reset to ${esc(m.base)} actuals</button></div><div id="ueMout">${modelOut()}</div></div>`;
}

/* ---------- payback ---------- */
function paybackHTML(MS){
  const rows = Object.keys(MS).filter(b => MS[b].length).map(b => {
    const ms = MS[b], c = COSTS[b] || {}, launchC = +c.launch || 0, mkt = +c.mkt || 0, has = c.launch !== undefined && c.launch !== "";
    const pos = ms.find(r => fin(r.contrib) && r.contrib > 0);
    const pre = pos ? ms.filter(r => r.age < pos.age) : ms;
    const early = sum(pre, r => Math.min(0, r.contrib ?? 0));
    const idle = sum(pre.filter(r => fin(r.hours) && r.paidH), r => Math.max(0, r.paidH - r.hours) * wageHr() * (1 + A.burden / 100));
    let cum = 0, rec = null, be = null;
    ms.forEach(r => { cum += r.contrib ?? 0; if (rec == null && pos && r.age >= pos.age && cum >= 0) rec = r.age; if (be == null && has && cum - launchC - mkt >= 0) be = r.age; });
    const noLabor = !ms.some(r => fin(r.contrib));
    const inp = (f, v) => `<input class="cin ue-cost" type="number" min="0" step="100" data-b="${b}" data-f="${f}" value="${v ?? ""}" placeholder="—">`;
    return `<tr><td class="name">${esc(NAME[b] || b)}<span class="addr">Live ${mstr(LAUNCH[b])} · ${ms.length} complete months</span></td>
      <td>${inp("launch", c.launch)}</td><td>${inp("mkt", c.mkt)}</td>
      <td class="num">${noLabor ? "—" : $0(idle)}</td><td class="num">${noLabor ? "—" : $0(-early)}</td>
      <td class="num">${has ? $0(launchC + mkt - early) : '<span class="ue-miss">needs launch cost</span>'}</td>
      <td class="num">${noLabor ? '<span class="ue-miss">no cleaners assigned</span>' : pos ? "Month " + pos.age : "Not yet"}</td>
      <td class="num">${noLabor ? "—" : rec != null ? "Month " + rec : "Not yet"}</td>
      <td class="num">${!has ? '<span class="ue-miss">needs launch cost</span>' : be != null ? "Month " + be + ` <small>(${be} mo payback)</small>` : "Not yet"}</td>
      <td class="num ${cum < 0 ? "ue-neg" : ""}">${noLabor ? "—" : $0(cum)}</td></tr>`;
  }).join("");
  return `<table class="ue-pb"><thead><tr><th>Building</th><th>Launch / acquisition cost</th><th>Activation / marketing</th><th>Underutilized labor, pre-positive</th><th>Early operating losses</th><th>Total investment</th><th>Contribution-positive</th><th>Early losses recovered</th><th>Cumulative break-even</th><th>Cumulative contribution</th></tr></thead><tbody>${rows}</tbody></table>`;
}

/* ---------- cohorts ---------- */
function cohortHTML(t1, P){
  const mat = new Set(P.all.filter(r => r.age >= 12).map(r => r.b));
  const set = UE.seg === "mature" ? mat : UE.seg === "newer" ? new Set(buildings().filter(b => !mat.has(b))) : null;
  const l = CUST.filter(c => c.first < t1 && (!set || set.has(c.b)));
  const g = new Map(); l.forEach(c => { const k = mStart(c.first); if (!g.has(k)) g.set(k, []); g.get(k).push(c); });
  const rep = (cs, N) => { const el = cs.filter(c => c.first <= t1 - N * DAY); return el.length ? el.filter(c => c.days.length > 1 && c.days[1] - c.first <= N * DAY).length / el.length : null; };
  const line = (label, cs) => { const n = cs.length, at = i => cs.filter(c => c.days.length > i && c.days[i] < t1).length / n;
    const ov = cs.reduce((a, c) => a + c.orders.filter(o => o.t < t1).length, 0), rv = cs.reduce((a, c) => a + c.orders.filter(o => o.t < t1).reduce((s, o) => s + o.amt, 0), 0);
    return `<td class="num">${n0(n)}</td><td class="num">${p0(at(1))}</td><td class="num">${p0(at(2))}</td><td class="num">${p0(rep(cs, 30))}</td><td class="num">${p0(rep(cs, 60))}</td><td class="num">${p0(rep(cs, 90))}</td><td class="num">${n1(ov / n)}</td><td class="num">${$0(rv / n)}</td>`; };
  const body = [...g.keys()].sort((a, b) => b - a).map(k => `<tr><td class="name">${mstr(k)}</td>${line("", g.get(k))}</tr>`).join("");
  const seg = `<div class="pickers ue-seg">${[["all", "All buildings"], ["mature", "Mature (12+ months live)"], ["newer", "Newer"]].map(s => `<button data-s="${s[0]}" class="${UE.seg === s[0] ? "on" : ""}">${s[1]}</button>`).join("")}</div>`;
  return seg + (l.length ? `<div class="scrollx"><table><thead><tr><th>First visit</th><th>Customers</th><th>Visit #2</th><th>Visit #3</th><th>30-day repeat</th><th>60-day repeat</th><th>90-day repeat</th><th>Visits / customer</th><th>Revenue / customer</th></tr></thead><tbody>${body}<tr class="ue-total"><td class="name">All cohorts</td>${line("", l)}</tr></tbody></table></div>` : `<p class="ue-empty">No customers in this segment.</p>`);
}

/* ---------- page ---------- */
function renderAll(){
  const root = $("viewUnit"); if (!root) return;
  if (!UE.ready){ root.innerHTML = `<section class="panel"><div class="phead"><h2>Unit Economics &amp; KPIs</h2><p>Loading the orders and users exports…</p></div></section>`; return; }
  prepSheet(); prepLaunch();
  const t1 = asOf(), P = portfolio(t1), Q = portfolio(t1 - 30 * DAY), K = kpis(P, Q);
  const MS = {}; buildings().forEach(b => { const m = months(b, t1); if (m.length) MS[b] = m; });
  if (!UE.model) UE.model = load("zingUeModel", modelDefaults(P));
  const sheetOn = Object.keys(SB).length > 0;
  const group = (h, ids) => `<div class="ue-g"><h3 class="eyebrow">${h}</h3><dl>${ids.map(i => line(K[i])).join("")}</dl></div>`;
  root.innerHTML = `
<section class="panel ue-intro"><div class="phead"><h2>Unit Economics &amp; KPIs</h2><p>Rolling 30 days to ${dstr(t1 - DAY)}, set by the Week filter · compared with the 30 days before</p></div>
<div class="ue-assume"><label class="fld">Payroll burden<input type="number" min="0" step="1" id="ueBurden" value="${A.burden}"><span class="post">% of wages</span></label>
<label class="fld">Other variable cost<span class="pre">$</span><input type="number" min="0" step="0.5" id="ueOther" value="${A.other}"><span class="post">/ visit</span></label>
<span class="ue-note">Neither is in the data yet. Both feed every contribution figure on this page.</span>
${sheetOn ? "" : '<span class="ue-warn">Weekly View Data is not loaded, so revenue, visits and hours come from the orders export and utilization is blank.</span>'}</div></section>
<section class="ue-hero">${["arr", "arrb", "cust", "best", "util", "rpp", "cm", "v2"].map(k => card(K[k])).join("")}</section>
<section class="panel"><div class="phead"><h2>All KPIs</h2><p>Portfolio → building → labor → retention</p></div><div class="ue-groups">
${group("Portfolio", ["arr", "mrr", "nb", "cust", "vis", "rpc"])}${group("Building economics", ["arrb", "revb", "rpen", "best", "apen", "vpa"])}
${group("Labor economics", ["rpp", "rph", "util", "lcph", "cph", "cm"])}${group("Retention", ["v2", "v3", "r30", "r60", "r90", "rec"])}</div></section>
<section class="panel"><div class="phead"><h2>Building unit economics</h2><p>Last 30 days, one row per building · click a column to sort · The Hamilton highlighted as the mature benchmark</p></div>
<div class="scrollx">${buildingTable(P)}</div></section>
<section class="panel"><div class="phead"><h2>Building maturity curve</h2><p>Complete calendar months only · month 0 is the launch month</p>
<label class="fld" style="margin-left:auto">Metric<select id="ueMetric">${Object.entries(METRICS).map(([k, v]) => `<option value="${k}"${k === UE.metric ? " selected" : ""}>${v[0]}</option>`).join("")}</select></label></div>
<div class="ue-cw" id="ueChart">${chart(MS)}</div></section>
<section class="panel"><div class="phead"><h2>Mature building economics</h2><p>Prefilled with ${esc(UE.model.base)}'s last 30 days · edit any input</p></div><div id="ueModel">${modelHTML()}</div></section>
<section class="panel"><div class="phead"><h2>Building acquisition &amp; payback</h2><p>Monthly contribution since launch · launch and marketing costs are not in the data, type them in to get payback</p></div>
<div class="scrollx" id="uePay">${paybackHTML(MS)}</div></section>
<section class="panel"><div class="phead"><h2>Cohorts &amp; repeat behavior</h2><p>Customers grouped by the month of their first realized visit · repeat rates count only customers old enough to have had the chance</p></div>
<div id="ueCoh">${cohortHTML(t1, P)}</div></section>
<section class="panel"><div class="phead"><h2>Definitions &amp; data gaps</h2></div><div class="ue-defs">
<div><h3 class="eyebrow">How it is calculated</h3><ul>
<li><b>Revenue</b> is Weekly View Data revenue, pro-rated by day. Where the sheet does not cover a building or period, realized orders (amount + tip) are used and marked <span class="ue-src">orders</span>.</li>
<li><b>Realized visit</b>: status paid, completed, incomplete payment or payment waived. Waived visits count as visits at $0. Scheduled and future bookings are excluded.</li>
<li><b>Active customer</b>: a realized visit in the 90 days before the window end. <b>Sign-ups</b> come from the sheet's total sign-ups, else the users export.</li>
<li><b>Paid hours</b> = cleaners assigned × ${HPD} h × ${DPW} days. <b>Productive hours</b> = the sheet's hours of operations, logged by cleaners. <b>Utilization</b> = productive ÷ paid.</li>
<li><b>Contribution</b> = revenue − wages × (1 + burden) − other variable cost × visits, at ${$0(SALARY)} per cleaner-week (${$2(wageHr())}/h). This is contribution, not gross margin: no rent, software or overhead.</li>
<li><b>Mature</b> = 12+ months since launch. Launch = Building settings' live date; the first realized visit only where no live date is set.</li></ul></div>
<div><h3 class="eyebrow">Not in the data yet</h3><ul>
<li>Payroll burden and other variable costs (supplies, card fees). Set above; currently ${A.burden}% and ${$2(A.other)}/visit.</li>
<li>Launch / acquisition and activation / marketing cost per building, so payback is blank until entered.</li>
<li>Headcount history. Past months use today's cleaners, which understates early-month utilization losses where headcount changed.</li>
<li>Actual paid hours per cleaner and which cleaner worked which building. Shared cleaners are split as entered in Building settings.</li>
${LIVE_NOTE.map(n => `<li>Live date mismatch: ${esc(n)}.</li>`).join("")}
<li>Orders export: ${n0(ORD_N)} realized visits (${SRC.o}).</li></ul></div></div></section>`;
  wire(t1, P, MS);
}
function wire(t1, P, MS){
  const root = $("viewUnit");
  root.querySelectorAll("th.ue-s").forEach(th => th.onclick = () => { const k = th.dataset.k;
    if (UE.sort === k) UE.dir *= -1; else { UE.sort = k; UE.dir = k === "name" ? 1 : -1; } renderAll(); });
  const wireChart = () => $("ueChart").querySelectorAll(".pickers button").forEach(b => b.onclick = () => {
    UE.hidden.has(b.dataset.b) ? UE.hidden.delete(b.dataset.b) : UE.hidden.add(b.dataset.b); $("ueChart").innerHTML = chart(MS); wireChart(); });
  wireChart();
  $("ueMetric").onchange = e => { UE.metric = e.target.value; $("ueChart").innerHTML = chart(MS); wireChart(); };
  const saveA = () => { localStorage.setItem("zingUeAssume", JSON.stringify(A)); renderAll(); };
  $("ueBurden").onchange = e => { A.burden = +e.target.value || 0; if (UE.model) UE.model.burden = A.burden; saveA(); };
  $("ueOther").onchange = e => { A.other = +e.target.value || 0; if (UE.model) UE.model.other = A.other; saveA(); };
  const wireModel = () => {
    const box = $("ueModel"), save = () => localStorage.setItem("zingUeModel", JSON.stringify(UE.model));
    box.querySelectorAll("input[data-m]").forEach(i => i.oninput = () => { UE.model[i.dataset.m] = +i.value || 0; save(); $("ueMout").innerHTML = modelOut();
      box.querySelectorAll(".ue-presets button").forEach(b => b.classList.toggle("on", +b.dataset.u === +UE.model.units)); });
    box.querySelectorAll(".ue-presets button").forEach(b => b.onclick = () => { UE.model.units = +b.dataset.u; save(); box.innerHTML = modelHTML(); wireModel(); });
    $("ueReset").onclick = () => { localStorage.removeItem("zingUeModel"); UE.model = modelDefaults(P); box.innerHTML = modelHTML(); wireModel(); };
  };
  wireModel();
  const wirePay = () => $("uePay").querySelectorAll("input.ue-cost").forEach(i => i.onchange = () => {
    const c = COSTS[i.dataset.b] ||= {}; if (i.value === "") delete c[i.dataset.f]; else c[i.dataset.f] = +i.value;
    localStorage.setItem("zingUeCosts", JSON.stringify(COSTS)); $("uePay").innerHTML = paybackHTML(MS); wirePay(); });
  wirePay();
  const wireCoh = () => $("ueCoh").querySelectorAll(".ue-seg button").forEach(b => b.onclick = () => { UE.seg = b.dataset.s; $("ueCoh").innerHTML = cohortHTML(t1, P); wireCoh(); });
  wireCoh();
}

const visible = () => { const v = $("viewUnit"); return v && v.classList.contains("on"); };
let queued = false, lastSig = "";
// the page calls render() from observers as well as on real changes; only redraw when an input moved
const sig = () => [week, typeof ROWS !== "undefined" ? ROWS.length : 0, typeof ROWS !== "undefined" ? ROWS.reduce((a, r) => a + (r.revenue || 0), 0) : 0,
  SALARY, HPD, DPW, JSON.stringify(BSET), UE.ready].join("|");
const refresh = force => { if (!visible() || queued) return; const s = sig(); if (force !== true && s === lastSig) return; lastSig = s; queued = true; setTimeout(() => { queued = false; try { renderAll(); } catch (e) { console.error("unit economics:", e); } }, 0); };
const baseRender = window.render;
if (typeof baseRender === "function") window.render = function(){ const out = baseRender.apply(this, arguments); refresh(); return out; };
window.zingUnitEconomics = { render: () => refresh(true) };

const text = (p, fb, tag) => fetch(p, { cache: "no-store" }).then(r => r.ok ? r.text() : Promise.reject())
  .then(t => { if (/^\s*</.test(t) || t.indexOf(",") < 0) throw 0; SRC[tag] = "data/" + p.split("/").pop() + " from the server"; return t; })
  .catch(() => { SRC[tag] = "baked-in snapshot " + (window.ZING_CART_PULLED || ""); return fb || ""; });
Promise.all([text("data/orders.csv", window.ZING_CART_ORDERS, "o"), text("data/users.csv", window.ZING_CART_USERS, "u")])
  .then(([o, u]) => { ingest(o, u); UE.ready = true; refresh(true); });

const css = document.createElement("style");
css.textContent = `
.ue-intro .phead{flex-wrap:wrap}
.ue-assume{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;padding:10px 14px;background:var(--paper-50)}
.ue-note{font-size:11px;color:var(--ink-4)}
.ue-warn{flex:1 1 100%;font-size:11.5px;color:var(--neg);background:var(--neg-bg);padding:6px 9px;border-radius:8px}
.ue-hero{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.ue-hero .stat{padding:14px 16px}
.ue-hero .stat .v{font-size:34px}
.ue-hero .stat .s{min-height:15px}
.ue-d{display:block;font-size:11px;margin-top:6px;color:var(--ink-4);font-variant-numeric:tabular-nums;font-weight:600}
.ue-d.p{color:var(--pos)}.ue-d.n{color:var(--neg)}
.ue-groups{display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}
.ue-g{padding:14px 16px;min-width:0}.ue-g+.ue-g{border-left:1px solid var(--line)}
.ue-g h3{margin:0 0 10px}
.ue-g dl{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px 12px;margin:0;font-size:12px;align-items:baseline}
.ue-g dt{color:var(--ink-3)}
.ue-g dd{margin:0;text-align:right;font-weight:700;font-size:14px;font-variant-numeric:tabular-nums}
.ue-g dd small .ue-d{margin-top:1px;font-size:10px;font-weight:500}
th.ue-s{cursor:pointer;user-select:none}th.ue-s:hover,th.ue-s.on{color:var(--ink)}
.ue-bt td.name{min-width:190px}
.ue-tag{display:inline-block;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;color:var(--forest);background:var(--sage-100);border:1px solid var(--sage-300);border-radius:999px;padding:1px 7px;margin-left:6px;vertical-align:1px}
.ue-src{font-size:9.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8A6E3F;background:#F4ECDC;border-radius:4px;padding:1px 5px}
.ue-neg{color:var(--neg)}
.ue-miss{font-size:11px;color:var(--ink-4);font-style:italic}
tr.ue-total td{border-top:1px solid var(--line-strong);font-weight:700;background:var(--paper-50)}
.ue-cw{padding:12px 14px 0}
.ue-cw .pickers{margin-bottom:8px}
svg.ue-chart{display:block;width:100%;height:auto}
svg.ue-chart text{font:500 10.5px "Hanken Grotesk",sans-serif;fill:#8A9492;font-variant-numeric:tabular-nums}
svg.ue-chart text.ax{font-size:10px;letter-spacing:.1em;text-transform:uppercase;font-weight:600}
.ue-cw .legend{margin:6px -14px 0}
.ue-empty{padding:20px 14px;color:var(--ink-4);font-size:12px;margin:0}
.ue-model{display:grid;grid-template-columns:330px minmax(0,1fr)}
.ue-min{display:flex;flex-direction:column;gap:8px;padding:14px 16px;border-right:1px solid var(--line);background:var(--paper-50)}
.ue-min label.fld{justify-content:space-between;white-space:normal}
.ue-min label.fld > span:first-child{flex:1}
.ue-min #ueReset{margin-top:6px;align-self:flex-start}
.ue-presets{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:6px}
.ue-presets .eyebrow{flex:1 1 100%}
.ue-presets button{border-radius:999px;padding:5px 12px;background:#fff}
.ue-presets button.on{background:var(--forest);color:var(--paper-50);border-color:var(--forest)}
.ue-mgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}
.ue-mgrid > div{padding:14px 16px;display:flex;flex-direction:column;gap:10px;min-width:0}
.ue-mgrid > div+div{border-left:1px solid var(--line)}
.ue-mo{display:flex;justify-content:space-between;align-items:baseline;gap:10px;font-size:12px;color:var(--ink-3);padding-bottom:9px;border-bottom:1px solid var(--line)}
.ue-mo:last-child{border-bottom:none}
.ue-mo b{font-size:15px;color:var(--ink);text-align:right}
.ue-mo b small{display:block;font-size:10.5px;font-weight:500;color:var(--ink-4)}
.ue-mo.big b{font:400 26px/1.1 "Newsreader",serif}
.ue-pb input.cin{width:96px}
.ue-pb td small{color:var(--ink-4);font-weight:500}
.ue-seg{padding:12px 14px;border-bottom:1px solid var(--line)}
.ue-defs{display:grid;grid-template-columns:1fr 1fr}
.ue-defs > div{padding:14px 16px}.ue-defs > div+div{border-left:1px solid var(--line)}
.ue-defs h3{margin:0 0 8px}
.ue-defs ul{margin:0;padding-left:18px;font-size:12.5px;line-height:1.6;color:var(--ink-2);display:flex;flex-direction:column;gap:4px}
@media(max-width:1180px){.ue-groups{grid-template-columns:repeat(2,minmax(0,1fr))}.ue-g:nth-child(3){border-left:none}.ue-g:nth-child(n+3){border-top:1px solid var(--line)}.ue-model{grid-template-columns:1fr}.ue-min{border-right:none;border-bottom:1px solid var(--line)}}
@media(max-width:1080px){.ue-hero{grid-template-columns:repeat(2,minmax(0,1fr))}.ue-mgrid,.ue-defs{grid-template-columns:1fr}.ue-mgrid > div+div,.ue-defs > div+div{border-left:none;border-top:1px solid var(--line)}}`;
document.head.appendChild(css);
})();
