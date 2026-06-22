/* Zing Resident App · data + helpers + line icons
   Exposed on window for the other Babel scripts. */

const ICONS = "icons/";

/* ---- Service catalogue (matches the live Tasks menu) ---- */
const TASKS = [
  { id: "bathroom", name: "Zing Bathroom Clean (Full)", price: 35, dur: 45, icon: "bathroom.webp",
    desc: "Making bathrooms sparkle like a 5-star hotel. Toilet + sink scrub, shower & tub scrub, floors swept and mopped, mirrors wiped, surfaces disinfected and trash emptied.",
    opt: { label: "How many bathrooms?", choices: ["1 bathroom", "1.5 bathrooms", "2 bathrooms", "3 bathrooms"] } },
  { id: "floor", name: "Vacuum & Floor Magic", price: 40, dur: 40, icon: "floor_magic.webp",
    desc: "A full-apartment vacuum and mop. Floors left spotless, streak-free and quietly fresh.",
    opt: { label: "Apartment size", choices: ["Studio", "1 bedroom", "2 bedroom", "3 bedroom"] } },
  { id: "dusting", name: "Surface Dusting", price: 30, dur: 30, icon: "countertop.webp",
    desc: "Shelves, sills, tables and electronics gently dusted and wiped down throughout your space." },
  { id: "trash", name: "Trash & Recycling Run", price: 1, dur: 10, icon: "trash.webp",
    desc: "We gather, sort and take out the trash and recycling, and reline every bin." },
  { id: "balcony", name: "Balcony Refresh", price: 32, dur: 35, icon: "balcony.svg",
    desc: "Sweep, wipe and tidy your balcony — railings, floor and furniture left guest-ready." },
  { id: "windows", name: "Complete Window Cleaning", price: 12, dur: 30, icon: "window.webp",
    desc: "Interior glass and sills cleaned to a clear, streak-free shine.",
    opt: { label: "How many windows?", choices: ["Up to 3", "4–6 windows", "7–10 windows"] } },
  { id: "plants", name: "Watering Plants", price: 3, dur: 10, icon: "plants.webp",
    desc: "We water and check on your plants so everything stays lush while life is busy." },
  { id: "couch", name: "Couch & Throw Pillow Refresh", price: 3, dur: 15, icon: "couch.webp",
    desc: "Cushions fluffed, throws folded and the sofa reset to a calm, hotel-lobby tidy." },
  { id: "bed", name: "Bed Linen Refresh", price: 8, dur: 20, icon: "bed.webp",
    desc: "Fresh, crisp linens and a tightly-made bed — turned down like a suite.",
    opt: { label: "Bed size", choices: ["Twin", "Full", "Queen", "King"] } },
  { id: "dishes", name: "Dish Washing", price: 13, dur: 25, icon: "dishes.webp",
    desc: "Dishes washed, dried and put away, sink wiped down and left gleaming." },
  { id: "fridge", name: "Fridge Cleanout", price: 35, dur: 40, icon: "fridge.webp",
    desc: "Interior wiped, shelves cleaned and expired items cleared — fresh and organised." },
  { id: "oven", name: "Zing Oven Clean", price: 35, dur: 45, icon: "oven.webp",
    desc: "A deep degrease of the oven interior, racks and glass door, back to like-new." },
  { id: "spill", name: "Wine & Coffee Spill Treatment", price: 9, dur: 20, icon: "spill.webp",
    desc: "Fast, gentle treatment of fresh wine, coffee and food stains on fabric and floors." },
  { id: "laundry", name: "Zing Laundry Service", price: 15, dur: 50, icon: "laundry.webp",
    desc: "Wash and dry a load of laundry with premium detergent and fabric care.",
    opt: { label: "How many loads?", choices: ["1 load", "2 loads", "3 loads"] } },
  { id: "folding", name: "Clothes Folding", price: 16, dur: 25, icon: "folding.webp",
    desc: "Clean laundry neatly folded and stacked, hotel-housekeeping style." },
  { id: "groceries", name: "Put Away Groceries", price: 3, dur: 15, icon: "groceries.webp",
    desc: "We unpack and organise your delivery into pantry and fridge so it's ready to use." },
  { id: "deodorize", name: "Deodorizing", price: 5, dur: 10, icon: "deodorize.webp",
    desc: "A light, natural deodorizing pass leaves your space smelling clean and calm." },
];
const TASK_BY_ID = Object.fromEntries(TASKS.map(t => [t.id, t]));

/* ---- Packages ---- */
const PACKAGES = [
  { id: "full", name: "Full Apartment Clean", price: 116, off: true, tasks: ["bathroom","floor","dusting","trash","bed"], icon: "couch.webp" },
  { id: "kitchen", name: "Kitchen Commander", price: 89, off: true, tasks: ["dishes","oven","fridge","countertop"], icon: "oven.webp" },
  { id: "weekly", name: "Smart Weekly Care", price: 67, off: false, tasks: ["dusting","floor","trash"], icon: "bathroom.webp" },
  { id: "biweekly", name: "Smart Bi-Weekly Care", price: 69, off: false, tasks: ["bathroom","floor","dusting"], icon: "window.webp" },
];

/* ---- Operating hours ---- */
const DAY_START = 8 * 60;   // 8:00 AM
const DAY_END   = 18 * 60;  // 6:00 PM
const HOUR_PX   = 64;       // vertical px per hour
const SNAP      = 15;       // minute snap
const px = (min) => ((min - DAY_START) / 60) * HOUR_PX;
const totalHeight = ((DAY_END - DAY_START) / 60) * HOUR_PX;

/* ---- Date helpers (Mon–Fri only) ---- */
const DAYNAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function startToday() { const d = new Date(); d.setHours(0,0,0,0);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate()+1); return d; }
function addBusinessDays(date, n) {
  const d = new Date(date); let step = n >= 0 ? 1 : -1; let left = Math.abs(n);
  while (left > 0) { d.setDate(d.getDate()+step); if (d.getDay()!==0 && d.getDay()!==6) left--; }
  return d;
}
const dateKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const fmtDayLabel = (d) => `${DAYNAMES[d.getDay()]}`;
const fmtDateLabel = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;

/* ---- Time formatting ---- */
function fmtTime(min) {
  let h = Math.floor(min/60), m = min % 60;
  const ap = h >= 12 ? "PM" : "AM"; let hh = h % 12; if (hh === 0) hh = 12;
  return m === 0 ? `${hh}:00 ${ap}` : `${hh}:${String(m).padStart(2,"0")} ${ap}`;
}
function fmtTimeShort(min) {
  let h = Math.floor(min/60), m = min % 60; const ap = h >= 12 ? "p" : "a"; let hh = h%12; if(hh===0) hh=12;
  return m === 0 ? `${hh}${ap}` : `${hh}:${String(m).padStart(2,"0")}${ap}`;
}
function fmtDur(min) {
  const h = Math.floor(min/60), m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

/* ---- Deterministic "already booked" blocks per day ---- */
function seeded(n) { let x = Math.sin(n) * 10000; return x - Math.floor(x); }
const BUSY_LABELS = ["Booked","Reserved","In service","Held"];
const BUSY_UNITS = ["Apt 1102","Apt 0908","Apt 1417","Apt 2003","Apt 0711","Apt 1925","Penthouse B","Apt 1208"];
function busyFor(d) {
  const seed = d.getFullYear()*1000 + d.getMonth()*40 + d.getDate();
  const count = 2 + Math.floor(seeded(seed) * 3); // 2–4 blocks
  const blocks = [];
  let cursor = DAY_START + Math.floor(seeded(seed*2) * 6) * SNAP; // small initial offset
  for (let i = 0; i < count; i++) {
    const gap = (1 + Math.floor(seeded(seed*7 + i*3) * 5)) * SNAP;      // 15–75 min gap
    const len = (2 + Math.floor(seeded(seed*11 + i*5) * 5)) * SNAP;     // 30–90 min
    const start = cursor + gap;
    const end = start + len;
    if (end > DAY_END - 15) break;
    blocks.push({ start, end,
      label: BUSY_LABELS[Math.floor(seeded(seed*13 + i) * BUSY_LABELS.length)],
      unit: BUSY_UNITS[Math.floor(seeded(seed*17 + i) * BUSY_UNITS.length)] });
    cursor = end;
  }
  return blocks;
}

/* ---- Open windows = gaps between busy blocks within hours ---- */
function openWindows(busy) {
  const sorted = [...busy].sort((a,b)=>a.start-b.start);
  const wins = []; let cursor = DAY_START;
  for (const b of sorted) { if (b.start - cursor >= SNAP) wins.push({ start: cursor, end: b.start }); cursor = Math.max(cursor, b.end); }
  if (DAY_END - cursor >= SNAP) wins.push({ start: cursor, end: DAY_END });
  return wins;
}

/* ---- Find first valid start for a duration on a day ---- */
function firstFit(busy, dur) {
  for (const w of openWindows(busy)) { if (w.end - w.start >= dur) return w.start; }
  return null;
}
/* ---- Is a [start, start+dur) block valid (in hours, no overlap)? ---- */
function fits(busy, start, dur) {
  if (start < DAY_START || start + dur > DAY_END) return false;
  return !busy.some(b => start < b.end && start + dur > b.start);
}
/* ---- Snap an arbitrary minute to a valid start near it ---- */
function snapValid(busy, raw, dur) {
  let start = Math.round((raw - dur/2) / SNAP) * SNAP;
  start = Math.max(DAY_START, Math.min(start, DAY_END - dur));
  if (fits(busy, start, dur)) return start;
  // search outward for nearest fitting start
  for (let step = SNAP; step <= DAY_END - DAY_START; step += SNAP) {
    if (fits(busy, start - step, dur)) return start - step;
    if (fits(busy, start + step, dur)) return start + step;
  }
  return firstFit(busy, dur);
}

/* ---------------- Line icons (UI chrome) ---------------- */
const P = {
  home: "M3 11l9-8 9 8M5 9.5V20h14V9.5",
  cal: "M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 9.5h16M8 3.5v3M16 3.5v3",
  user: "M4.5 20a7.5 7.5 0 0 1 15 0M12 11.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5",
  cart: "M3 4h2.2l1.9 11.2a1.5 1.5 0 0 0 1.48 1.25h8.32a1.5 1.5 0 0 0 1.47-1.2L20.5 7H6.2M9.5 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2M17 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2",
  left: "M15 5l-7 7 7 7",
  right: "M9 5l7 7-7 7",
  close: "M6 6l12 12M18 6L6 18",
  check: "M5 12.5l4.5 4.5L19 7",
  clock: "M12 7.5v5l3 2M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18",
  plus: "M12 5v14M5 12h14",
  phone: "M6.5 3.5h3l1.2 4-2 1.4a12 12 0 0 0 4.9 4.9l1.4-2 4 1.2v3a1.6 1.6 0 0 1-1.7 1.6A15.5 15.5 0 0 1 4.9 5.2 1.6 1.6 0 0 1 6.5 3.5",
  trash: "M5 7h14M9 7V5h6v2M7 7l.8 12.2A1 1 0 0 0 8.8 20h6.4a1 1 0 0 0 1-0.8L17 7M10 11v5M14 11v5",
  refresh: "M4 11a8 8 0 0 1 13.5-4.5L20 9M20 4v5h-5M20 13a8 8 0 0 1-13.5 4.5L4 15M4 20v-5h5",
  spark: "M12 3l1.6 5L19 9.6 13.6 11 12 16l-1.6-5L5 9.6 10.4 8z",
  edit: "M4 20h4l10-10-4-4L4 16zM14 6l4 4",
  bag: "M6 8h12l-1 12H7zM9 8V6a3 3 0 0 1 6 0v2",
};
function LineIcon({ d, w = 22, sw = 1.6, style }) {
  return React.createElement("svg", { width: w, height: w, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round", style },
    React.createElement("path", { d }));
}

Object.assign(window, {
  ICONS, TASKS, TASK_BY_ID, PACKAGES,
  DAY_START, DAY_END, HOUR_PX, SNAP, px, totalHeight,
  startToday, addBusinessDays, dateKey, fmtDayLabel, fmtDateLabel,
  fmtTime, fmtTimeShort, fmtDur,
  busyFor, openWindows, firstFit, fits, snapValid,
  P, LineIcon,
});
