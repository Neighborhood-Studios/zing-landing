/* ---------- cart impact: does a hallway that has seen the cart order more? ---------- */
(function(){
const SNAP_USERS = window.ZING_CART_USERS || "Name,Email,Apt,Orders,Sign up date";
const SNAP_ORDERS = window.ZING_CART_ORDERS || "Date,Date created,Email,Status";
const PULLED = window.ZING_CART_PULLED || "";

// a clean only counts if money was owed for it: paid, completed, or completed with payment outstanding.
// cancelled, refunded, skipped, submitted, scheduled, reschedule request and payment waived are ignored.
const DONE = ["paid","completed","incomplete payment"];
const OPEN = DONE;
const ALL = "\u2014 All buildings \u2014";
const CFG_KEY = "zingCartCfg", CSV_KEY = "zingCartCsv3";
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
const f1 = n => n.toFixed(1), f2 = n => n.toFixed(2);
const DAY = 864e5;
const days = (a, b) => Math.round((new Date(b) - new Date(a)) / DAY);
const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
const median = a => { if (!a.length) return null; const x = a.slice().sort((p, q) => p - q), m = x.length >> 1;
  return x.length % 2 ? x[m] : (x[m - 1] + x[m]) / 2; };
function pearson(xs, ys){
  const n = xs.length, mx = mean(xs), my = mean(ys);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++){ const a = xs[i] - mx, b = ys[i] - my; num += a * b; dx += a * a; dy += b * b; }
  return dx && dy ? num / Math.sqrt(dx * dy) : 0;
}

function parseCsv(text){
  const rows = [];
  let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++){
    const c = text[i];
    if (q){ if (c === '"'){ if (text[i+1] === '"'){ cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === ","){ row.push(cell); cell = ""; }
    else if (c === "\n"){ row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  row.push(cell); rows.push(row);
  return rows.filter(r => r.some(v => v.trim() !== ""));
}
function objects(text){
  const rows = parseCsv(text.trim());
  if (!rows.length) return [];
  const head = rows[0].map(h => h.trim().toLowerCase());
  return rows.slice(1).map(r => { const o = {}; head.forEach((h, i) => o[h] = (r[i] || "").trim()); return o; });
}

// "3810" -> 38 · "903" -> 9 · "Apt 2906" -> 29 · "PH1" -> PH
function readApt(raw){
  const s = (raw || "").trim().replace(/^(apartment|apt\.?|unit|no\.?|#)\s*/i, "").trim();
  if (!s) return { f: null, why: "no apartment" };
  if (/^ph/i.test(s)) return { f: "PH" };
  if (!/^\d+$/.test(s)) return { f: null, why: "free text, not a bare unit number" };
  const f = s.length === 3 ? +s.slice(0, 1) : s.length === 4 ? +s.slice(0, 2) : null;
  if (f === null) return { f: null, why: s.length + "-digit value, not a unit number" };
  return { f, unit: +s.slice(-2) };
}
const internal = e => /justzingit\.com|@test\.|neighborhoodstudios\.com/.test(e);

let CFG = {}, SEL = ALL, TL = null, PLAY = null;
try { CFG = JSON.parse(localStorage.getItem(CFG_KEY)) || {}; } catch (e) {}
if (!CFG["muze at met"]) CFG["muze at met"] = { skip: "13" };
const ckey = b => b.trim().toLowerCase();

const FETCHED = {};
function toCsvUrl(u){
  const m = u.match(/spreadsheets\/d\/([\w-]+)/);
  if (!m) return u;
  const g = (u.match(/[?#&]gid=(\d+)/) || [])[1];
  return "https://docs.google.com/spreadsheets/d/" + m[1] + "/export?format=csv" + (g ? "&gid=" + g : "");
}
function zoneMsg(which, msg, cls){
  const z = $("ci" + which + "Drop");
  if (!z) return;
  z.firstChild.nodeValue = msg;
  z.classList.toggle("ok", cls === "ok");
  z.classList.toggle("bad", cls === "bad");
}
function resolve(which, snap){
  const v = ($("ci" + which + "Csv").value || "").trim();
  if (!v) return snap;
  if (!/^https?:\/\//.test(v)) return v;
  const got = FETCHED[v];
  if (got === undefined){
    FETCHED[v] = "pending";
    zoneMsg(which, "Fetching the sheet\u2026 ");
    fetch(toCsvUrl(v)).then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .then(t => {
        if (/^\s*</.test(t)) throw new Error("the sheet is not readable without signing in");
        FETCHED[v] = t;
        zoneMsg(which, "Loaded from the sheet \u00b7 " + t.trim().split("\n").length + " rows \u2014 ", "ok");
        render();
      })
      .catch(e => {
        FETCHED[v] = "ERR";
        zoneMsg(which, "Could not read that link (" + e.message + "). Publish it to the web, or drop the .csv here \u2014 ", "bad");
        render();
      });
    return snap;
  }
  return (got === "pending" || got === "ERR") ? snap : got;
}

/* Exports served next to the page (/kpi/data/users.csv, /kpi/data/orders.csv). Dropping a fresh
   export over those two files is the whole refresh procedure \u2014 no code, no redeploy of the page.
   If they are missing (or the page is opened from disk) it falls back to the baked-in cart-data.js. */
const LOCAL = { users: null, orders: null };
function pullLocalCsv(){
  [["users", "Users"], ["orders", "Orders"]].forEach(([k, W]) => {
    fetch("data/" + k + ".csv", { cache: "no-store" })
      .then(r => r.ok ? r.text() : Promise.reject(new Error("HTTP " + r.status)))
      .then(t => {
        if (/^\s*</.test(t) || t.indexOf(",") < 0) throw new Error("not a csv");
        LOCAL[k] = t;
        zoneMsg(W, "Loaded data/" + k + ".csv from the server \u00b7 " + (t.trim().split("\n").length - 1) + " rows \u2014 ", "ok");
        render();
      })
      .catch(() => {
        if (PULLED) zoneMsg(W, "No data/" + k + ".csv on the server \u00b7 using the " + PULLED + " export built into the page \u2014 ");
      });
  });
}

function sources(){
  return { users: objects(resolve("Users", LOCAL.users || SNAP_USERS)),
           orders: objects(resolve("Orders", LOCAL.orders || SNAP_ORDERS)) };
}

// the window the analysis can actually see: exposure is only visible from the first order in the
// export onwards, and nothing is known after the pull date
function windowOf(users, orders){
  const made = orders.map(o => (o["date created"] || o.date || "").trim()).filter(d => /^\d{4}-/.test(d)).sort();
  const su = users.map(u => (u["sign up date"] || "").trim()).filter(d => /^\d{4}-/.test(d)).sort();
  const start = made.length ? made[0] : (su[0] || "");
  const seen = su.length ? su[su.length - 1] : "";
  const end = PULLED && PULLED > seen ? PULLED : (seen || start);
  return { start, end, firstSignup: su[0] || "", weeks: start && end ? Math.max(0, days(start, end) / 7) : 0,
           dated: su.length, undated: users.length - su.length };
}

// what the data itself suggests for a building, before any manual override
// drop values separated from the pack by a big gap — junk unit numbers, not real floors
function trim(sorted){
  const a = sorted.slice();
  while (a.length > 2 && a[a.length - 1] > a[a.length - 2] * 1.5) a.pop();
  while (a.length > 2 && a[1] > a[0] * 1.5) a.shift();
  return a;
}
function autoCfg(rows){
  const fl = [], un = [];
  rows.forEach(r => {
    if (internal((r.email || "").toLowerCase())) return;
    const a = readApt(r.apt);
    if (typeof a.f === "number"){ fl.push(a.f); un.push(a.unit); }
  });
  if (!fl.length) return { top: 40, bot: 1, upf: 12, skip: "" };
  const uniq = x => Array.from(new Set(x)).sort((a, b) => a - b);
  const f = trim(uniq(fl)), u = trim(uniq(un.filter(n => n > 0)));
  return { top: f[f.length - 1], bot: f[0],
           upf: Math.min(40, Math.max(4, u.length ? u[u.length - 1] : 12)), skip: "" };
}
function cfgFor(name, rows){ return Object.assign(autoCfg(rows), CFG[ckey(name)] || {}); }

function analyse(name, users, orders, ok){
  const rows = users.filter(u => (u.building || "") === name);
  const c = cfgFor(name, rows);
  const skip = String(c.skip || "").split(/[,\s]+/).map(Number).filter(n => n > 0);
  const dropped = [], byEmail = {}, byName = {}, floors = {}, keys = ["PH"];
  for (let i = c.top; i >= c.bot; i--) if (skip.indexOf(i) < 0) keys.push(i);
  keys.forEach(k => floors[k] = { bldg: name, key: k, signups: 0, customers: 0, visits: 0,
    first: null, last: null, clean: null, people: [], dates: [], vis: [] });

  rows.forEach(u => {
    const email = (u.email || "").toLowerCase(), nm = u.name || email;
    if (!email) return;
    if (internal(email)){ dropped.push([nm, u.apt, "internal or test account"]); return; }
    const a = readApt(u.apt);
    if (a.f === null){ dropped.push([nm, u.apt, a.why]); return; }
    if (typeof a.f === "number"){
      if (a.f < c.bot){ dropped.push([nm, u.apt, "floor " + a.f + " is below the first residential floor"]); return; }
      if (a.f > c.top){ dropped.push([nm, u.apt, "floor " + a.f + " is above the top floor"]); return; }
      if (skip.indexOf(a.f) >= 0){ dropped.push([nm, u.apt, "floor " + a.f + " is marked as not existing"]); return; }
    }
    const rec = { name: nm, email, apt: u.apt, floor: a.f, bldg: name, orders: +u.orders || 0,
      signup: (u["sign up date"] || "").trim(), sub: /^y/i.test(u["active subscription"] || "") };
    const k = nm.trim().toLowerCase();
    if (byName[k]){
      const keep = rec.orders > byName[k].orders ? rec : byName[k], lose = keep === rec ? byName[k] : rec;
      dropped.push([lose.name, lose.apt, "duplicate resident \u2014 kept apt " + keep.apt]);
      delete byEmail[lose.email]; byName[k] = keep; byEmail[keep.email] = keep;
    } else { byName[k] = rec; byEmail[email] = rec; }
  });
  Object.values(byEmail).forEach(u => { const f = floors[u.floor]; if (f){ f.signups++; f.people.push(u); } });

  let unmatched = 0, elsewhere = 0;
  orders.forEach(o => {
    const u = byEmail[(o.email || "").toLowerCase()];
    if (!u) return;
    const ob = (o.building || "").trim();
    if (ob && ob !== name){ elsewhere++; return; }   // same resident, order placed at another building
    const f = floors[u.floor]; if (!f) return;
    const made = o["date created"] || o.date || "";
    if (made && (!u.firstOrder || made < u.firstOrder)) u.firstOrder = made;
    const st = (o.status || "").toLowerCase();
    if (ok.indexOf(st) < 0) return;
    f.visits++; u.visited = true;
    const d = o.date || "";
    if (d){ f.dates.push(d); f.vis.push({ d: d, e: u.email }); (u.dates = u.dates || []).push(d);
      if (!u.firstClean || d < u.firstClean) u.firstClean = d; }
    if (d && (!f.first || d < f.first)) f.first = d;
    if (d && (!f.last || d > f.last)) f.last = d;
    if (DONE.indexOf(st) >= 0 && d && (!f.clean || d < f.clean)) f.clean = d;
  });
  Object.values(floors).forEach(f => { f.customers = f.people.filter(p => p.visited).length; f.neighbours = f.signups - f.customers; });

  const list = keys.map(k => floors[k]);
  return { name, cfg: c, list, dropped, unmatched, elsewhere, residents: Object.keys(byEmail).length,
           raw: rows.length, headline: headline(list) };
}

function headline(list){
  const vis = list.filter(f => f.visits > 0), nev = list.filter(f => f.visits === 0);
  const sum = (a, k) => a.reduce((t, f) => t + f[k], 0);
  const A = { n: vis.length, s: sum(vis, "signups"), c: sum(vis, "customers"), nb: sum(vis, "neighbours"), v: sum(vis, "visits") };
  const B = { n: nev.length, s: sum(nev, "signups"), c: sum(nev, "customers"), nb: sum(nev, "neighbours"), v: 0 };
  const sV = A.n ? A.s / A.n : 0, sN = B.n ? B.s / B.n : 0;
  const nV = A.n ? A.nb / A.n : 0, nN = B.n ? B.nb / B.n : 0;
  return { vis, nev, A, B, sV, sN, nV, nN,
    sLift: sN > 0 ? sV / sN : null, lift: nN > 0 ? nV / nN : null,
    r: pearson(list.map(f => f.visits), list.map(f => f.neighbours)) };
}

// every unit that has ordered, in the sequence it happened on its floor
function sequence(list){
  const rows = [], gaps = [];
  let units = 0, followers = 0, after = 0;
  list.forEach(f => {
    const ord = f.people.filter(p => p.firstOrder).sort((a, b) => a.firstOrder < b.firstOrder ? -1 : 1);
    units += ord.length;
    if (!ord.length) return;
    const fol = ord.slice(1);
    followers += fol.length;
    const post = fol.filter(p => f.clean && p.firstOrder > f.clean);
    after += post.length;
    if (fol.length && f.clean){ const g = days(f.clean, fol[0].firstOrder); if (g >= 0) gaps.push(g); }
    rows.push({ bldg: f.bldg, key: f.key, n: ord.length, clean: f.clean, next: fol.length ? fol[0].firstOrder : null,
      gap: fol.length && f.clean ? days(f.clean, fol[0].firstOrder) : null, fol: fol.length, post: post.length });
  });
  const all = [];
  list.forEach(f => f.people.forEach(p => { if (p.firstOrder) all.push(p.firstOrder); }));
  if (!all.length) return { rows, units, followers, after, gaps, weeks: 0, ratio: null };
  const t0 = all.reduce((a, b) => a < b ? a : b), t1 = all.reduce((a, b) => a > b ? a : b);
  const wk = d => Math.floor(days(t0, d) / 7);
  const total = wk(t1) + 1;
  let expW = 0, unxW = 0, expE = 0, unxE = 0;
  list.forEach(f => {
    const start = f.clean ? Math.min(wk(f.clean) + 1, total) : total;
    unxW += start; expW += total - start;
    f.people.forEach(p => { if (!p.firstOrder) return;
      if (f.clean && p.firstOrder > f.clean) expE++; else unxE++; });
  });
  const expR = expW ? expE / expW : null, unxR = unxW ? unxE / unxW : null;
  return { rows, units, followers, after, gaps, weeks: total, expW, unxW, expE, unxE, expR, unxR,
           ratio: expR !== null && unxR ? expR / unxR : null };
}

/* ---- time-aware version of the dose index ----
   pool = units on the floor with no account yet, recomputed every day, so a floor that has fully
   converted leaves the denominator instead of scoring zero. EXPO days after a clean count as exposed. */
const EXPO = 7;
const ms = d => new Date(d).getTime();

function riskSet(list, win, upfOf){
  const t0 = ms(win.start), t1 = ms(win.end);
  const A = { sD: 0, sN: 0, oD: 0, oN: 0 }, B = { sD: 0, sN: 0, oD: 0, oN: 0 };
  let poolLeft = 0, servedFloors = 0;
  list.forEach(f => {
    const upf = upfOf(f);
    const vl = f.vis.filter(v => v.d >= win.start && v.d <= win.end).map(v => ({ t: ms(v.d), e: v.e }));
    if (vl.length) servedFloors++;
    const ppl = f.people.map(p => ({ e: p.email, s: p.signup ? ms(p.signup) : t0 - DAY, o: p.firstClean ? ms(p.firstClean) : Infinity }));
    poolLeft += Math.max(0, upf - ppl.length);
    for (let t = t0; t <= t1; t += DAY){
      const hotAny = vl.some(v => t >= v.t && t - v.t < EXPO * DAY);
      const S = hotAny ? A : B;
      let signed = 0, newS = 0;
      ppl.forEach(p => {
        if (p.s < t) signed++;
        if (p.s >= t && p.s < t + DAY) newS++;
      });
      S.sD += Math.max(0, upf - signed); S.sN += newS;
      ppl.forEach(p => {
        if (!(p.s < t && p.o >= t)) return;                       // signed up, has not ordered yet
        const hot = vl.some(v => v.e !== p.e && t >= v.t && t - v.t < EXPO * DAY);
        const T = hot ? A : B;
        T.oD++;
        if (p.o >= t && p.o < t + DAY) T.oN++;
      });
    }
  });
  const per = (n, d) => d > 0 ? n / (d / 7) * 100 : null;
  const o = { A, B, poolLeft, servedFloors,
    sA: per(A.sN, A.sD), sB: per(B.sN, B.sD), oA: per(A.oN, A.oD), oB: per(B.oN, B.oD) };
  o.sLift = (o.sA !== null && o.sB) ? o.sA / o.sB : null;
  o.oLift = (o.oA !== null && o.oB) ? o.oA / o.oB : null;
  return o;
}

// how long after the nearest preceding clean on the same floor each sign-up landed
function gaps(list, win){
  const b = { hot: 0, d8: 0, d15: 0, d31: 0, pre: 0, never: 0 };
  list.forEach(f => {
    const vis = f.dates.filter(d => d >= win.start && d <= win.end).map(ms).sort((a, b) => a - b);
    f.people.forEach(p => {
      if (!p.signup || p.signup < win.start || p.signup > win.end) return;
      const t = ms(p.signup);
      if (!vis.length){ b.never++; return; }
      const prior = vis.filter(v => v <= t);
      if (!prior.length){ b.pre++; return; }
      const g = Math.round((t - prior[prior.length - 1]) / DAY);
      if (g < EXPO) b.hot++; else if (g < 15) b.d8++; else if (g < 31) b.d15++; else b.d31++;
    });
  });
  return b;
}

function renderRisk(list, win, upfOf){
  const q = riskSet(list, win, upfOf), g = gaps(list, win);
  const rt = v => v === null ? "\u2014" : f2(v);
  const total = g.hot + g.d8 + g.d15 + g.d31 + g.pre + g.never;
  $("ciRiskStats").innerHTML = [
    ["Sign-ups per 100 unit-weeks, exposed", rt(q.sA),
      rt(q.sB) + " unexposed" + (q.sLift ? " \u00b7 " + f2(q.sLift) + "\u00d7" : "") + " \u00b7 pool is units with no account yet"],
    ["First orders per 100 unit-weeks, exposed", rt(q.oA),
      rt(q.oB) + " unexposed" + (q.oLift ? " \u00b7 " + f2(q.oLift) + "\u00d7" : "") + " \u00b7 pool is units signed up and not yet ordering; only cleans booked by other units count"],
    ["Sign-ups within " + EXPO + " days of a visit", g.hot + " <small style='font-size:14px;color:var(--ink-4)'>of " + total + "</small>",
      total ? f1(g.hot / total * 100) + "% of every dated sign-up inside the window" : "no dated sign-ups in the window"],
    ["Units still to sign up", q.poolLeft,
      "across " + list.length + " floors \u00b7 " + q.servedFloors + " have seen the cart inside the window"]
  ].map(([k, v, sub]) => '<div class="stat"><div class="eyebrow">' + k + '</div><div class="v num">' + v + '</div><div class="s">' + sub + '</div></div>').join("");

  const row = (label, n, dyDays, rate, lift, dim) =>
    '<tr' + (dim ? ' style="opacity:.6"' : '') + '><td class="name">' + label + '</td><td class="num">' + n +
    '</td><td class="num">' + (total ? f1(n / total * 100) + "%" : "\u2014") + '</td><td class="num">' + (dyDays === null ? "\u2014" : Math.round(dyDays)) +
    '</td><td class="num">' + (rate === null ? "\u2014" : f2(rate)) + '</td><td>' + (lift === null ? '<span style="color:var(--ink-4)">\u2014</span>' : pill(lift)) + '</td></tr>';
  $("tbCiResp").innerHTML =
    row("Within " + EXPO + " days of a cart visit", g.hot, q.A.sD, q.sA, q.sLift) +
    row("8\u201314 days after a visit", g.d8, null, null, null) +
    row("15\u201330 days after a visit", g.d15, null, null, null) +
    row("31 days or more after a visit", g.d31, null, null, null) +
    row("Before the floor's first visit", g.pre, null, null, null, true) +
    row("On floors the cart has never worked", g.never, null, null, null, true) +
    '<tr class="total"><td>Unexposed days, all of the above</td><td class="num">' + q.B.sN + '</td><td class="num">' +
      (total ? f1(q.B.sN / total * 100) + "%" : "\u2014") + '</td><td class="num">' + Math.round(q.B.sD) +
      '</td><td class="num">' + rt(q.sB) + '</td><td><span style="color:var(--ink-4)">baseline</span></td></tr>';

  $("ciRespNote").innerHTML = "Every day in the window, each floor puts <b>units per floor minus units already signed up</b> into the pool. " +
    "A day is exposed if the cart worked that floor in the previous " + EXPO + " days. Sign-ups on exposed days over exposed unit-days is the top rate; everything else is the baseline. " +
    "A floor where every unit has an account contributes nothing to either side, which is the point \u2014 it can no longer drag the number down the way the dose index does. " +
    "The first-order rate deliberately ignores a unit's own cleans, or the order being measured would be its own exposure. " +
    "The gap rows above count sign-ups by how long after the nearest earlier visit on their own floor they landed; the last two rows are sign-ups with no earlier visit to be measured against. " +
    "Cause is still not proven: cleans cluster on floors that were already ordering, and a resident who signs up because her neighbour told her about Zing looks identical here to one who saw the cart.";
}

function renderLedger(list, win, one){
  const t0 = ms(win.start), t1 = ms(win.end), span = Math.max(1, t1 - t0);
  const pc = t => ((t - t0) / span * 100);
  // top floor at the top, first residential floor at the bottom \u2014 the building's own order
  const lanes = list.filter(f => f.dates.length || f.people.some(p => p.signup >= win.start));
  const cap = one ? 60 : 30, show = lanes.slice(0, cap);
  const months = [];
  for (let d = new Date(win.start.slice(0, 7) + "-01"); d.getTime() <= t1; d.setMonth(d.getMonth() + 1)){
    const t = d.getTime();
    if (t >= t0) months.push({ t, label: d.toLocaleDateString("en-US", { month: "short" }) });
  }
  const grid = months.map(m => '<i style="position:absolute;top:0;bottom:0;width:1px;background:#ECE4D5;left:' + f1(pc(m.t)) + '%"></i>').join("");
  const dot = (t, cls, title, size, col, ring) =>
    '<i title="' + esc(title) + '" style="position:absolute;top:50%;left:' + f1(pc(t)) + '%;transform:translate(-50%,-50%);width:' + size +
    'px;height:' + size + 'px;border-radius:50%;background:' + col + (ring ? ';box-shadow:0 0 0 2px #FBF9F4,0 0 0 3.5px ' + ring : '') + '"></i>';
  $("ciLedger").innerHTML =
    '<div style="display:flex;align-items:center;gap:8px;font-size:10.5px;color:var(--ink-4);margin-bottom:4px"><span style="width:96px;flex:none"></span><span style="position:relative;flex:1;height:14px">' +
      months.map(m => '<span style="position:absolute;left:' + f1(pc(m.t)) + '%;transform:translateX(2px)">' + m.label + '</span>').join("") + '</span></div>' +
    show.map(f => {
      const vis = f.dates.filter(d => d >= win.start && d <= win.end).sort();
      const marks = vis.map(d => '<i title="Cart visit ' + d + '" style="position:absolute;top:2px;bottom:2px;left:' + f1(pc(ms(d))) +
        '%;width:2px;transform:translateX(-1px);background:#1D2E32;opacity:.55"></i>').join("") +
        f.people.map(p => {
          let s = "";
          if (p.signup && p.signup >= win.start && p.signup <= win.end)
            s += dot(ms(p.signup), "s", (p.name || "unit") + " signed up " + p.signup, 7, "#37698F");
          (p.dates || []).slice().sort().forEach((d, i) => {
            if (d < win.start || d > win.end) return;
            s += i === 0 ? dot(ms(d), "o", (p.name || "unit") + " first order, cleaned " + d, 9, "#1D2E32", "#C9D8C2")
                         : dot(ms(d), "r", (p.name || "unit") + " repeat order, cleaned " + d, 6, "#C98A2E");
          });
          return s;
        }).join("");
      return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">' +
        '<span style="width:96px;flex:none;font-size:11px;color:var(--ink-3);text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
          (one ? "Floor " + f.key : esc(f.bldg) + " \u00b7 " + f.key) + '</span>' +
        '<span style="position:relative;flex:1;height:20px;background:#FBF9F4;border:1px solid #EFE8DA;border-radius:6px">' + grid + marks + '</span></div>';
    }).join("") || '<p style="color:var(--ink-4);font-size:12px">No floor in this selection has a clean or a dated sign-up inside the window.</p>';
  $("ciLedgerLegend").innerHTML =
    '<span><i class="cdot" style="background:#37698F"></i>Sign-up \u2014 a unit on the floor opened an account</span>' +
    '<span><i class="cdot" style="background:#1D2E32;box-shadow:0 0 0 2px #FBF9F4,0 0 0 3.5px #C9D8C2"></i>That unit\u2019s first order</span>' +
    '<span><i class="cdot" style="background:#C98A2E;width:6px;height:6px"></i>Repeat order by a unit that had already booked</span>' +
    '<span><i class="cdot" style="background:#1D2E32;width:2px;height:12px;border-radius:1px;opacity:.55"></i>Cart visit \u2014 the clean itself; every order dot sits on one, the dot says which unit booked it</span>';
  $("ciLedgerNote").innerHTML = "Lanes run top floor down to the first residential floor, the same order as the elevation. Window: " + win.start + " to " + win.end + ". " +
    (lanes.length > show.length ? "Showing the first " + show.length + " of " + lanes.length + " lanes \u2014 pick a single building to see it in full. " : "") +
    "A unit's first order is drawn at the date the clean happened, so a sign-up sitting just left of a ringed dot is that resident booking straight away; a bare sign-up after a cart visit is the pattern worth counting.";
}

function render(){
  const src = sources();
  const ok = $("ciStatus").value === "all" ? OPEN : DONE;
  const names = Array.from(new Set(src.users.map(u => u.building).filter(Boolean))).sort();
  const per = names.map(n => analyse(n, src.users, src.orders, ok));

  const sel = $("ciSelBuilding");
  if (sel.dataset.names !== names.join("|")){
    sel.dataset.names = names.join("|");
    sel.innerHTML = ['<option>' + ALL + '</option>'].concat(names.map(n => '<option>' + esc(n) + '</option>')).join("");
  }
  if (names.indexOf(SEL) < 0 && SEL !== ALL) SEL = ALL;
  sel.value = SEL;
  const one = SEL === ALL ? null : per.find(p => p.name === SEL);
  const live = per.filter(p => p.headline.A.v > 0);
  const dormant = per.length - live.length;
  const active = one ? [one] : (live.length ? live : per);
  document.body.classList.toggle("ciall", !one);

  const list = active.reduce((a, p) => a.concat(p.list), []);
  const dropped = active.reduce((a, p) => a.concat(p.dropped.map(d => [p.name].concat(d))), []);
  const residents = active.reduce((t, p) => t + p.residents, 0);
  const h = headline(list);
  const totalVisits = list.reduce((t, f) => t + f.visits, 0);

  // per-building settings apply to the selected building only
  const cf = one ? one.cfg : null;
  ["ciBot","ciTop","ciSkip","ciUpf"].forEach(id => { $(id).disabled = !one; });
  if (cf){ $("ciBot").value = cf.bot; $("ciTop").value = cf.top; $("ciSkip").value = cf.skip || ""; $("ciUpf").value = cf.upf; }
  $("ciCfgNote").textContent = one
    ? "Floors " + cf.bot + "\u2013" + cf.top + (cf.skip ? ", skipping " + cf.skip : "") + ", " + cf.upf + " units per floor. " +
      (CFG[ckey(one.name)] ? "Set by the team" : "Read from the data") + " \u2014 change it and it saves for everyone."
    : "Pick a single building to adjust its floor range. Each building uses its own, read from its unit numbers unless the team has set it.";

  $("ciStats").innerHTML = [
    ["Floors the cart has visited", h.A.n + " <small style='font-size:14px;color:var(--ink-4)'>of " + list.length + "</small>",
      totalVisits + " cleans run \u00b7 " + residents + " residents placed" + (one ? "" : " across " + active.length + (active.length === 1 ? " building" : " buildings") + (dormant ? " \u00b7 " + dormant + " with no cleans yet left out" : ""))],
    ["Sign-ups per floor", f1(h.sV), "where the cart has worked \u00b7 " + f1(h.sN) + " where it never has" + (h.sLift ? " \u00b7 " + f2(h.sLift) + "\u00d7" : "")],
    ["Sign-ups that are not the customer", f1(h.nV), "per served floor \u00b7 " + f1(h.nN) + " per untouched floor" + (h.lift ? " \u00b7 " + f2(h.lift) + "\u00d7" : "")],
    ["Cleans \u2194 non-customer sign-ups", f2(h.r), Math.abs(h.r) < .2 ? "no relationship in this data yet" : Math.abs(h.r) < .45 ? "a weak relationship" : "a clear relationship"]
  ].map(([k, v, sub]) => '<div class="stat"><div class="eyebrow">' + k + '</div><div class="v num">' + v + '</div><div class="s">' + sub + '</div></div>').join("");

  renderByBuilding(per);
  if (one) renderElevation(one, h);
  renderMath(h, one ? one.name : names.length + " buildings");
  renderSequence(list, one);
  renderDose(list, h.nN, one ? one.cfg.upf : mean(per.map(p => p.cfg.upf)));
  const cfgByB = {}; per.forEach(p => cfgByB[p.name] = p.cfg);
  const upfOf = f => (cfgByB[f.bldg] || {}).upf || 12;
  const win2 = windowOf(src.users, src.orders);
  renderLedger(list, win2, one);
  renderRisk(list, win2, upfOf);
  renderFloors(list, one);

  $("tbCiDropped").innerHTML = dropped.map(d =>
    '<tr><td class="bcol">' + esc(d[0]) + '</td><td class="name">' + esc(d[1]) + '</td><td>' + esc(d[2] || "\u2014") + '</td><td>' + esc(d[3]) + '</td></tr>').join("")
    || '<tr><td colspan="4" style="color:var(--ink-4)">Nothing dropped</td></tr>';
  const away = active.reduce((t, p) => t + (p.elsewhere || 0), 0);
  $("ciNote").innerHTML = residents + " residents placed on a floor \u00b7 " + dropped.length + " rows dropped" +
    (away ? " \u00b7 " + away + " orders skipped because the order's Building column names a different building than the resident's" : "") + ". " +
    "The cohort split above is still a snapshot of today, so read it as an association: the cart reaches a floor because somebody there ordered, " +
    "which loads that comparison in favour of served floors. Sign-up dates now carry a real before-and-after \u2014 see the two panels below.";
}

function renderByBuilding(per){
  $("tbCiBy").innerHTML = per.map(p => {
    const h = p.headline, q = sequence(p.list), dead = h.A.v === 0;
    return '<tr' + (dead ? ' style="opacity:.5"' : '') + '><td class="name">' + esc(p.name) + '</td><td class="num">' + p.list.length + '</td><td class="num">' + h.A.n +
      '</td><td class="num">' + h.A.v + '</td><td class="num">' + (h.A.s + h.B.s) + '</td><td class="num">' + h.A.c +
      (dead ? '</td><td colspan="6" style="text-align:left;color:var(--ink-4)">No cleans yet \u2014 left out of the pooled comparison</td>'
            : '</td><td class="num">' + f2(h.sV) + '</td><td class="num">' + f2(h.sN) + '</td><td>' + pill(h.sLift) +
              '</td><td class="num">' + f2(h.nV) + '</td><td class="num">' + f2(h.nN) + '</td><td>' + pill(h.lift) + '</td>') +
      '<td class="num">' + q.followers + '</td><td class="num">' + q.after + '</td></tr>';
  }).join("");
  const tot = per.filter(p => p.headline.A.v > 0).reduce((t, p) => { const h = p.headline, q = sequence(p.list);
    t.f += p.list.length; t.v += h.A.n; t.cl += h.A.v; t.s += h.A.s + h.B.s; t.c += h.A.c;
    t.An += h.A.n; t.As += h.A.s; t.Anb += h.A.nb; t.Bn += h.B.n; t.Bs += h.B.s; t.Bnb += h.B.nb;
    t.fol += q.followers; t.post += q.after; return t; },
    { f:0, v:0, cl:0, s:0, c:0, An:0, As:0, Anb:0, Bn:0, Bs:0, Bnb:0, fol:0, post:0 });
  const sV = tot.An ? tot.As / tot.An : 0, sN = tot.Bn ? tot.Bs / tot.Bn : 0;
  const nV = tot.An ? tot.Anb / tot.An : 0, nN = tot.Bn ? tot.Bnb / tot.Bn : 0;
  $("tbCiByFoot").innerHTML = '<tr class="total"><td>Pooled, buildings with cleans</td><td class="num">' + tot.f + '</td><td class="num">' + tot.v +
    '</td><td class="num">' + tot.cl + '</td><td class="num">' + tot.s + '</td><td class="num">' + tot.c +
    '</td><td class="num">' + f2(sV) + '</td><td class="num">' + f2(sN) + '</td><td>' + pill(sN ? sV / sN : null) +
    '</td><td class="num">' + f2(nV) + '</td><td class="num">' + f2(nN) + '</td><td>' + pill(nN ? nV / nN : null) +
    '</td><td class="num">' + tot.fol + '</td><td class="num">' + tot.post + '</td></tr>';
}
const pill = v => v === null || !isFinite(v) ? '<span style="color:var(--ink-4)">\u2014</span>'
  : '<span class="pill ' + (v > 1.05 ? "p" : v < .95 ? "n" : "o") + '">' + f2(v) + '\u00d7</span>';

// every 7-day stop between the building's first clean and the pull date
function weekStops(p){
  const ds = [];
  p.list.forEach(f => f.dates.forEach(d => { if (!PULLED || d <= PULLED) ds.push(d); }));
  if (!ds.length) return [];
  ds.sort();
  const end = PULLED || ds[ds.length - 1], T = new Date(end).getTime();
  const stops = [];
  for (let t = new Date(ds[0]).getTime(); t < T; t += 7 * DAY) stops.push(new Date(t).toISOString().slice(0, 10));
  stops.push(end);
  return stops;
}
// the floor as it stood on a given date
function asOf(f, cut){
  let s = 0, c = 0;
  f.people.forEach(pp => {
    const ordered = pp.firstClean && pp.firstClean <= cut;
    const joined = !pp.signup || pp.signup <= cut;
    if (ordered){ s++; c++; } else if (joined) s++;
  });
  return { signups: s, customers: c, visits: f.dates.filter(d => d <= cut).length };
}

function renderElevation(p, h){
  const upf = p.cfg.upf, list = p.list;
  const stops = weekStops(p), last = stops.length - 1;
  const sl = $("ciWk"), lbl = $("ciWkLbl");
  $("ciWkWrap").style.display = stops.length > 1 ? "" : "none";
  if (stops.length > 1){
    if (TL !== null && TL > last) TL = last;
    sl.max = last; sl.value = TL === null ? last : TL;
    const at = stops[TL === null ? last : TL];
    lbl.innerHTML = (TL === null || TL === last ? "Today \u00b7 " : "Week " + (TL + 1) + " of " + (last + 1) + " \u00b7 ") +
      "the building as it stood on <b>" + at + "</b>" + (TL === null || TL === last ? "" : " \u00b7 elevation only");
    $("ciWkPlay").textContent = PLAY ? "Pause" : "Play";
  }
  const cut = stops.length ? stops[TL === null ? last : Math.min(TL, last)] : (PULLED || "9999-12-31");
  const live = TL !== null && stops.length > 1 && TL < last;
  const view = {};
  list.forEach(f => view[f.key] = live ? asOf(f, cut) : { signups: f.signups, customers: f.customers, visits: f.visits });
  const maxV = Math.max(1, ...list.map(f => f.visits));
  $("ciElev").innerHTML = '<div class="elevhd"><span>Floor</span><span>Units on the floor</span><span>Sign-ups</span><span>Cleans run</span></div>' + list.map(f => {
    const v = view[f.key], cells = [];
    for (let i = 0; i < upf; i++) cells.push('<i class="' + (i < v.customers ? "c" : i < v.signups ? "s" : "") + '"></i>');
    const w = v.visits ? Math.max(6, Math.round(v.visits / maxV * 78)) : 0;
    return '<div class="flr' + (v.visits ? " vis" : "") + (v.signups ? "" : " gap") + '" title="Floor ' + f.key + (live ? ' on ' + cut : '') + ' \u2014 ' +
      v.signups + (v.signups === 1 ? ' unit signed up, ' : ' units signed up, ') + v.customers + ' of them ' + (v.customers === 1 ? 'has' : 'have') +
      ' ordered, ' + v.visits + (v.visits === 1 ? ' clean' : ' cleans') + ' run on the floor' + (!live && f.last ? ", last on " + f.last : "") +
      '"><b>' + f.key + '</b><div class="cells">' + cells.join("") + '</div><em class="' + (v.signups ? "" : "z") + '">' +
      (v.signups || "\u2014") + '</em><div class="vbar">' +
      (w ? '<i style="width:' + w + 'px"></i><span>' + v.visits + '</span>' : '<span style="opacity:.45">\u2014</span>') + '</div></div>';
  }).join("");

  const bw = v => Math.max(3, Math.round(v / Math.max(h.sV, h.sN, h.nV, h.nN, .001) * 150));
  $("ciCohort").innerHTML =
    '<div class="ch"><span class="lb">Sign-ups per floor</span>' +
      '<div class="bar"><i class="a" style="width:' + bw(h.sV) + 'px"></i><b>' + f1(h.sV) + '</b></div><small>Cart has worked here (' + h.A.n + ')</small>' +
      '<div class="bar" style="margin-top:6px"><i class="b" style="width:' + bw(h.sN) + 'px"></i><b>' + f1(h.sN) + '</b></div><small>Cart never seen (' + h.B.n + ')</small></div>' +
    '<div class="ch"><span class="lb">Neighbour sign-ups per floor</span>' +
      '<div class="bar"><i class="a" style="width:' + bw(h.nV) + 'px"></i><b>' + f1(h.nV) + '</b></div><small>Cart has worked here</small>' +
      '<div class="bar" style="margin-top:6px"><i class="b" style="width:' + bw(h.nN) + 'px"></i><b>' + f1(h.nN) + '</b></div><small>Cart never seen</small></div>' +
    '<div class="verdict">' + (live ? "Sign-ups on <b>" + cut + "</b>: " +
      list.reduce((t, f) => t + view[f.key].signups, 0) + " units signed up, " +
      list.reduce((t, f) => t + view[f.key].customers, 0) + " of them ordering, " +
      list.reduce((t, f) => t + view[f.key].visits, 0) + " cleans run so far. The bars above and every panel below stay at today." : verdict(h)) + '</div>';

  $("ciLegend").innerHTML =
    '<span><i class="cdot" style="background:var(--forest)"></i>Unit that has ordered</span>' +
    '<span><i class="cdot" style="background:var(--sage-500)"></i>Unit that signed up but never ordered</span>' +
    '<span><i class="cdot" style="background:var(--paper-200)"></i>Unit with no sign-up (assumes ' + upf + ' units per floor)</span>' +
    '<span><b>Sign-ups</b> units on the floor with an account</span>' +
    '<span><b>Cleans run</b> jobs the cart has worked there, so one unit ordering four times counts four</span>';
}

function verdict(h){
  if (!h.A.n || !h.B.n) return "Not enough floors on one side of the comparison yet.";
  const head = h.sLift ? "Served floors hold <b>" + f2(h.sLift) + "\u00d7</b> the sign-ups of untouched ones, but that gap is mostly the customers themselves. " : "";
  if (h.lift === null) return head + "There are no non-customer sign-ups on untouched floors at all, so every neighbour who joined did so on a floor the cart has worked.";
  if (h.lift >= 1.25) return head + "Stripping the customers out, served floors still carry <b>" + f2(h.lift) + "\u00d7</b> the neighbour sign-ups. That is the number that would point at the cart.";
  if (h.lift <= 0.8) return head + "Stripping the customers out, served floors carry <b>" + f2(h.lift) + "\u00d7</b> \u2014 fewer neighbour sign-ups than untouched floors. Nothing here supports the cart as a driver.";
  return head + "Stripping the customers out, the two cohorts are level (<b>" + f2(h.lift) + "\u00d7</b>). The cart has not yet visibly moved the neighbours.";
}

function renderMath(h, label){
  const chips = (a, on) => '<div class="fchips">' + a.map(f => '<span class="fchip' + (on ? " v" : "") + '" title="' + esc(f.bldg) + '">' + f.key + '</span>').join("") + '</div>';
  const dl = o => '<dl><dt>Units signed up</dt><dd>' + o.s + '</dd><dt>\u2026 of those, units that ordered</dt><dd>' + o.c +
    '</dd><dt>\u2026 of those, never ordered</dt><dd>' + o.nb + '</dd><dt>Cleans run</dt><dd>' + o.v + '</dd></dl>';
  const step = (k, expr, out, big) => '<div class="mstep' + (big ? " big" : "") + '"><span class="k">' + k + '</span><code>' + expr + '</code><span class="out">= ' + out + '</span></div>';
  $("ciMath").innerHTML =
    '<div class="mathgrid">' +
      '<div class="mathcol"><h4>A \u00b7 Cart has worked here <span>' + h.A.n + ' floors \u00b7 ' + esc(label) + '</span></h4>' + chips(h.vis, true) + dl(h.A) + '</div>' +
      '<div class="mathcol"><h4>B \u00b7 Cart has never been <span>' + h.B.n + ' floors</span></h4>' + chips(h.nev, false) + dl(h.B) + '</div>' +
    '</div>' +
    '<div class="mathsteps">' +
      step("Sign-ups per floor, A", h.A.s + " \u00f7 " + h.A.n, f2(h.sV)) +
      step("Sign-ups per floor, B", h.B.s + " \u00f7 " + h.B.n, f2(h.sN)) +
      step("Ratio", f2(h.sV) + " \u00f7 " + f2(h.sN), h.sLift ? f2(h.sLift) + "\u00d7" : "\u2014", true) +
      step("Non-customer sign-ups, A", h.A.s + " \u2212 " + h.A.c + " = " + h.A.nb + ", \u00f7 " + h.A.n, f2(h.nV)) +
      step("Non-customer sign-ups, B", h.B.s + " \u2212 " + h.B.c + " = " + h.B.nb + ", \u00f7 " + h.B.n, f2(h.nN)) +
      step("Ratio", f2(h.nV) + " \u00f7 " + f2(h.nN), h.lift ? f2(h.lift) + "\u00d7" : "\u2014", true) +
    '</div>' +
    '<p class="mnote">The two ratios disagree, and that is the whole finding. <b>' + f2(h.sLift || 0) + '\u00d7</b> says served floors have far more sign-ups \u2014 true, but it cannot be evidence for the cart, because a floor only enters cohort A when somebody there ordered. The cart follows the sign-up; the sign-up does not follow the cart. Every clean was booked by one of the ' + h.A.c + ' units already counted in A.</p>' +
    '<p class="mnote">So the test has to look past the customer, at the neighbours who saw the cart in the hallway and signed up without ever booking. A carries <b>' + h.A.nb + '</b> of those across ' + h.A.n + ' floors (' + f2(h.nV) + ' each); B carries <b>' + h.B.nb + '</b> across ' + h.B.n + ' floors (' + f2(h.nN) + ' each).</p>';
}

function renderSequence(list, one){
  const q = sequence(list), med = median(q.gaps);
  $("ciSeqStats").innerHTML = [
    ["Units that have ordered", q.units + " <small style='font-size:14px;color:var(--ink-4)'>on " + q.rows.length + " floors</small>",
      q.followers + " of them were not the first on their floor"],
    ["Followers after a clean", q.after + " <small style='font-size:14px;color:var(--ink-4)'>of " + q.followers + "</small>",
      q.followers ? f1(q.after / q.followers * 100) + "% placed their first order once the cart had already worked the hallway" : "no follower units yet"],
    ["Typical wait", med === null ? "\u2014" : med + " <small style='font-size:14px;color:var(--ink-4)'>days</small>",
      "median gap between a floor's first clean and the next unit's first order"],
    ["First orders per floor-week", q.ratio === null ? "\u2014" : f2(q.ratio) + "\u00d7",
      q.ratio === null ? "not enough exposed weeks yet" : f2((q.expR || 0) * 100) + " per 100 exposed floor-weeks vs " + f2((q.unxR || 0) * 100) + " unexposed"]
  ].map(([k, v, sub]) => '<div class="stat"><div class="eyebrow">' + k + '</div><div class="v num">' + v + '</div><div class="s">' + sub + '</div></div>').join("");

  $("tbCiSeq").innerHTML = q.rows.slice().sort((a, b) => b.fol - a.fol || b.n - a.n).map(x =>
    '<tr><td class="bcol">' + esc(x.bldg) + '</td><td class="name">Floor ' + x.key + '</td><td class="num">' + x.n + '</td><td>' + (x.clean || "\u2014") +
    '</td><td>' + (x.next || "\u2014") + '</td><td class="num">' + (x.gap === null ? "\u2014" : (x.gap > 0 ? "+" : "") + x.gap) +
    '</td><td class="num">' + x.fol + '</td><td>' + (x.fol ? '<span class="pill ' + (x.post === x.fol ? "p" : x.post ? "o" : "n") + '">' + x.post + " / " + x.fol + '</span>' : '<span style="color:var(--ink-4)">\u2014</span>') + '</td></tr>').join("");

  $("ciSeqNote").innerHTML = "A floor's first clean is booked by its first ordering unit, so that unit is never a follower. " +
    "Followers are every later unit on the same floor. A negative gap means the next unit had already booked before the cart showed up. " +
    "The floor-week rate here counts first orders, not sign-ups: every floor contributes unexposed weeks from the study start until its first clean, " +
    "including the " + list.filter(f => !f.clean).length + " floors the cart has never reached, unexposed for all " + q.weeks + " weeks. " +
    "It cannot separate the cart from ordinary word of mouth, and " + q.followers + " follower units" + (one ? "" : " across all buildings") + " is a small base.";
}

function renderDose(list, base, upf){
  const buckets = [[0, 0, "Cart never seen"], [1, 2, "1\u20132 appearances"], [3, 5, "3\u20135 appearances"], [6, 1e9, "6+ appearances"]];
  const grp = (lo, hi) => list.filter(f => f.visits >= lo && f.visits <= hi);
  const zero = grp(0, 0);
  const bS = zero.length ? mean(zero.map(f => f.signups)) : 0;      // all sign-ups per never-visited floor
  const bN = zero.length ? mean(zero.map(f => f.neighbours)) : 0;    // neighbours only
  const rows = [];
  $("tbCiDose").innerHTML = buckets.map(([lo, hi, label]) => {
    const g = grp(lo, hi);
    if (!g.length) return "";
    const su = g.reduce((t, f) => t + f.signups, 0), nbT = g.reduce((t, f) => t + f.neighbours, 0);
    const sp = mean(g.map(f => f.signups)), nb = mean(g.map(f => f.neighbours));
    rows.push({ label, n: g.length, su, sp, nbT, nb });
    return '<tr><td class="name">' + label + '</td><td class="num">' + g.length + '</td><td class="num">' + su +
      '</td><td class="num">' + f1(sp) + '</td><td>' + (bS > 0 ? pill(sp / bS) : "\u2014") +
      '</td><td class="num">' + nbT + '</td><td class="num">' + f1(nb) +
      '</td><td>' + (bN > 0 ? pill(nb / bN) : "\u2014") +
      '</td><td class="num">' + f1(su / (g.length * upf) * 100) + '%</td></tr>';
  }).join("");
  const top = rows[rows.length - 1], z = rows[0];
  $("ciDoseNote").innerHTML = !z || !top || top === z ? "Only one group of floors in this selection." :
    "Both indexes divide a row by the never-visited row, so that row is 1.00\u00d7 by definition. " +
    "<b>All sign-ups</b> counts every account on the floor: " + z.label.toLowerCase() + " averages " + f1(z.sp) + " per floor, " +
    top.label.toLowerCase() + " averages " + f1(top.sp) + " (" + top.su + " sign-ups over " + top.n + " floors), so that index reads " +
    (bS > 0 ? f2(top.sp / bS) + "\u00d7" : "\u2014") + ". " +
    "<b>Neighbours only</b> throws away every unit that has ever booked and keeps the residents who signed up and never ordered \u2014 " +
    top.nbT + " of the " + top.su + " on those floors, " + f1(top.nb) + " per floor against " + f1(z.nb) + ", which is why it reads " +
    (bN > 0 ? f2(top.nb / bN) + "\u00d7" : "\u2014") + " and is coloured against you. " +
    "The two disagree because the cart only reaches a floor by being booked there: the more it has visited, the more of that floor's sign-ups are customers rather than bystanders. " +
    "The neighbour index is the one that would show the cart pulling in people who had not already decided to order, and today it falls as visits rise.";
}

function renderFloors(list, one){
  // building order: PH and the top floor first, first residential floor last
  $("tbCiFloors").innerHTML = list.filter(f => f.visits || f.signups).map(f => {
      const upf = (CFG[ckey(f.bldg)] || {}).upf || (one ? one.cfg.upf : 12);
      return '<tr><td class="bcol">' + esc(f.bldg) + '</td><td class="name">Floor ' + f.key + '</td><td class="num">' + f.visits +
        '</td><td>' + (f.first || "\u2014") + '</td><td>' + (f.last || "\u2014") + '</td><td class="num">' + f.customers +
        '</td><td class="num">' + f.neighbours + '</td><td class="num">' + f.signups +
        '</td><td class="num">' + f1(f.signups / upf * 100) + '%</td></tr>';
    }).join("");
}

function wireDrop(which){
  const zone = $("ci" + which + "Drop"), file = $("ci" + which + "File"), ta = $("ci" + which + "Csv");
  const take = f => {
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      ta.value = String(rd.result || "");
      zone.classList.remove("over"); zone.classList.add("ok");
      zone.firstChild.nodeValue = f.name + " \u00b7 " + ta.value.trim().split("\n").length + " rows \u2014 ";
      try { localStorage.setItem(CSV_KEY, JSON.stringify({ u: $("ciUsersCsv").value, o: $("ciOrdersCsv").value })); } catch (e) {}
      render();
    };
    rd.readAsText(f);
  };
  $("ci" + which + "Pick").onclick = () => file.click();
  file.onchange = () => take(file.files[0]);
  zone.addEventListener("dragover", e => { e.preventDefault(); zone.classList.add("over"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("over"));
  zone.addEventListener("drop", e => { e.preventDefault(); take(e.dataTransfer.files[0]); });
}
wireDrop("Users"); wireDrop("Orders");

$("ciSelBuilding").addEventListener("change", e => { SEL = e.target.value; stopPlay(); TL = null; render(); });
function stopPlay(){ if (PLAY){ clearInterval(PLAY); PLAY = null; } }
$("ciWk").addEventListener("input", e => { stopPlay(); TL = +e.target.value; render(); });
$("ciWkAll").onclick = () => { stopPlay(); TL = null; render(); };
$("ciWkPlay").onclick = () => {
  if (PLAY){ stopPlay(); render(); return; }
  const last = +$("ciWk").max;
  if (TL === null || TL >= last) TL = 0;
  PLAY = setInterval(() => {
    if (TL >= +$("ciWk").max){ stopPlay(); TL = null; render(); return; }
    TL++; render();
  }, 550);
  render();
};

/* ---- shared storage: the same Apps Script backend the rest of the dashboard uses ---- */
const API = (typeof API_URL !== "undefined") ? API_URL : null;
const canSave = () => API && typeof apiPost === "function";
function pushCfg(name, c){
  if (!canSave()) return;
  apiPost("BuildingFloors", "upsert", { key: "building", values: {
    building: name, firstFloor: c.bot, topFloor: c.top,
    skipFloors: c.skip || "", unitsPerFloor: c.upf,
    updated: new Date().toISOString().slice(0, 10) } });
}
function pushSources(){
  if (!canSave()) return;
  apiPost("Settings", "upsert", { key: "key", values: { key: "cartUsersUrl", value: $("ciUsersCsv").value.trim() } });
  apiPost("Settings", "upsert", { key: "key", values: { key: "cartOrdersUrl", value: $("ciOrdersCsv").value.trim() } });
}
function apiNote(msg, ok){
  const el = $("ciApi");
  if (!el) return;
  el.innerHTML = msg;
  el.style.color = ok === true ? "var(--forest-600)" : ok === false ? "#A8442F" : "var(--ink-3)";
}
function pullBackend(){
  if (!API){ apiNote("No <code>API_URL</code> is set in this copy of the page, so floor geometry stays in this browser only.", false); return; }
  let answered = false;
  setTimeout(() => { if (!answered) apiNote("The shared backend has not answered in 10 seconds. Either the network is blocking " +
    "<code>script.google.com</code> or the deployment is not reachable \u2014 the page is running on this browser's own saved settings meanwhile.", false); }, 10000);
  fetch(API).then(r => r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))).then(d => {
    answered = true;
    const bf = d.BuildingFloors || [];
    const st0 = (d.Settings || []).slice(1).map(r => String(r[0]).trim());
    const filled = bf.slice(1).filter(r => r[0] && (r[1] !== "" || r[2] !== "" || r[3] !== "" || r[4] !== "")).length;
    if (!bf.length)
      apiNote("Backend reachable, but it returned <b>no BuildingFloors tab</b>. Run <code>setupCartImpact</code> on the backend sheet, then redeploy the API script \u2014 see <code>backend-sheet/CART-IMPACT-BACKEND.md</code>.", false);
    else
      apiNote("Shared backend connected \u00b7 <b>BuildingFloors</b>: " + Math.max(0, bf.length - 1) + " rows, " + filled +
        " with geometry filled in \u00b7 <b>Settings</b>: " + (st0.indexOf("cartUsersUrl") >= 0 ? "cartUsersUrl \u2713" : "cartUsersUrl missing") +
        ", " + (st0.indexOf("cartOrdersUrl") >= 0 ? "cartOrdersUrl \u2713" : "cartOrdersUrl missing") +
        ". Changes to the four fields above save for everyone.", true);
    let touched = false;
    (d.BuildingFloors || []).slice(1).forEach(r => {
      if (!r[0]) return;
      const c = {};
      if (+r[1] > 0) c.bot = +r[1];
      if (+r[2] > 0) c.top = +r[2];
      if (String(r[3] || "").trim()) c.skip = String(r[3]).trim();
      if (+r[4] > 0) c.upf = +r[4];
      if (Object.keys(c).length){ CFG[ckey(r[0])] = Object.assign({}, CFG[ckey(r[0])], c); touched = true; }
    });
    const st = {};
    (d.Settings || []).slice(1).forEach(r => { if (r[0]) st[r[0]] = r[1]; });
    if (st.cartUsersUrl && !$("ciUsersCsv").value.trim()){ $("ciUsersCsv").value = st.cartUsersUrl; touched = true; }
    if (st.cartOrdersUrl && !$("ciOrdersCsv").value.trim()){ $("ciOrdersCsv").value = st.cartOrdersUrl; touched = true; }
    if (touched) render();
  }).catch(err => {
    answered = true;
    apiNote("Could not read the shared backend (" + err.message + "). The page is running on this browser's own saved settings, " +
      "so any floor geometry you change here will not reach anyone else. Check the deployment \u2014 see <code>backend-sheet/CART-IMPACT-BACKEND.md</code>, step 4.", false);
    console.warn("cart impact: backend read failed, using this device's settings", err);
  });
}
["ciBot","ciTop","ciSkip","ciUpf"].forEach(id => $(id).addEventListener("change", () => {
  if (SEL === ALL) return;
  const c = { bot: +$("ciBot").value, top: +$("ciTop").value, skip: $("ciSkip").value, upf: +$("ciUpf").value };
  CFG[ckey(SEL)] = c;
  try { localStorage.setItem(CFG_KEY, JSON.stringify(CFG)); } catch (e) {}
  pushCfg(SEL, c);
  render();
}));
$("ciStatus").addEventListener("change", render);
$("ciRun").onclick = () => {
  try { localStorage.setItem(CSV_KEY, JSON.stringify({ u: $("ciUsersCsv").value, o: $("ciOrdersCsv").value })); } catch (e) {}
  pushSources();
  render();
};
$("ciReset").onclick = () => {
  $("ciUsersCsv").value = ""; $("ciOrdersCsv").value = "";
  CFG = { "muze at met": { skip: "13" } }; SEL = ALL;
  try { localStorage.removeItem(CSV_KEY); localStorage.removeItem(CFG_KEY); } catch (e) {}
  render();
};
try { localStorage.removeItem("zingCartCsv"); } catch (e) {} // pre-sign-up-date pastes, superseded by the 2026-09-02 export
// browsers restore textarea contents on reload; an old paste sitting there would silently
// override the shipped export, so nothing counts as pasted unless it came back from storage
$("ciUsersCsv").value = ""; $("ciOrdersCsv").value = "";
try { const c = JSON.parse(localStorage.getItem(CSV_KEY) || "null");
  if (c){ $("ciUsersCsv").value = c.u || ""; $("ciOrdersCsv").value = c.o || ""; } } catch (e) {}
if (PULLED){ zoneMsg("Users", "Using the " + PULLED + " export \u00b7 drop a .csv here or paste a link below to replace it \u2014 "); zoneMsg("Orders", "Using the " + PULLED + " export \u00b7 drop a .csv here or paste a link below to replace it \u2014 "); }
render();
pullBackend();
pullLocalCsv();
})();
