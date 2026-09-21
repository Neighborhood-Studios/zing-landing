/* Zing booking stations — shared config layer.
   One Google Sheet (tab "Stations", one row per station) is the source of truth.
   Kiosks call ZingKiosk.fetchStation(slug) on load (they reload at the top of every hour);
   the admin page (ui_kits/internal-tools/kiosk-admin) reads and writes the same rows.
   ENDPOINT is the Apps Script web-app URL ending in /exec — see kiosk-shared/README.md. */
window.ZingKiosk = (function () {
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbw2VCOJTyxY76XejL45aS36YNUntUvV0OfH4nq1mJ_5J4x72ckBcDlwVI67rvQEHawfyg/exec';

  var STATIONS = [
    { slug: 'muze-bookings',       building: 'Muze at Met',  cleaner: 'Daisy',     spots: [0,1,1,3,3], booked: 25 },
    { slug: 'hamilton-bookings',   building: 'The Hamilton', cleaner: 'Liza',      spots: [0,0,0,0,1], booked: 83 },
    { slug: 'bezel-bookings2',     building: 'Bezel Miami',  cleaner: 'Elizabeth', spots: [1,2,3,4,5], booked: 18 },
    { slug: 'alexanroxy-bookings', building: 'Alexan Roxy',  cleaner: 'Liza',      spots: [2,3,4,4,5], booked: 18 },
    { slug: 'wynd27-bookings',     building: 'Wynd 27',      cleaner: 'Liza',      spots: [2,3,4,4,5], booked: 18 },
    { slug: 'wynd2728-bookings',   building: 'Wynd 27|28',   cleaner: 'Elizabeth', spots: [0,2,1,2,0], booked: 18 }
  ];

  // Catalogue shown on the "Popular in your building" screen and in the admin dropdowns.
  var TASKS = [
    { id: 'bathroom',  name: 'Bathroom refresh',   note: 'sink, toilet, shower & mirror', icon: 'bathroom.webp' },
    { id: 'bed',       name: 'Make the bed',       note: 'hotel-style, your way',        icon: 'bed.webp' },
    { id: 'dishes',    name: 'Dishes done',        note: 'washed, dried, put away',      icon: 'dishes.webp' },
    { id: 'laundry',   name: 'Laundry & fold',     note: 'wash, dry, fold, stack',       icon: 'laundry.webp' },
    { id: 'folding',   name: 'Clothes folding',    note: 'neatly folded & stacked',      icon: 'folding.webp' },
    { id: 'trash',     name: 'Trash run',          note: 'bins out, liners in',          icon: 'trash.webp' },
    { id: 'floor',     name: 'Floor magic',        note: 'vacuum & mop',                 icon: 'floor_magic.webp' },
    { id: 'fridge',    name: 'Fridge cleanout',    note: 'shelves wiped, expired out',   icon: 'fridge.webp' },
    { id: 'oven',      name: 'Oven clean',         note: 'deep degrease, racks & glass', icon: 'oven.webp' },
    { id: 'counters',  name: 'Kitchen counters',   note: 'wiped & sanitized',            icon: 'countertop.webp' },
    { id: 'plants',    name: 'Water the plants',   note: 'checked & watered',            icon: 'plants.webp' },
    { id: 'windows',   name: 'Window cleaning',    note: 'streak-free glass & sills',    icon: 'window.webp' },
    { id: 'balcony',   name: 'Balcony refresh',    note: 'railings, floor & furniture',  icon: 'balcony.webp' },
    { id: 'couch',     name: 'Couch refresh',      note: 'cushions fluffed, throws folded', icon: 'couch.webp' },
    { id: 'groceries', name: 'Put away groceries', note: 'pantry & fridge organised',    icon: 'groceries.webp' },
    { id: 'spill',     name: 'Spill treatment',    note: 'wine, coffee & food stains',   icon: 'spill.webp' },
    { id: 'declutter', name: 'Declutter',          note: 'surfaces cleared & tidy',      icon: 'declutter.webp' },
    { id: 'deodorize', name: 'Deodorizing',        note: 'light, natural refresh',       icon: 'deodorize.webp' }
  ];
  var PACKAGES = [
    { id: 'full',     name: 'Full apartment clean', items: 'bathroom · floors · dusting · trash · bed' },
    { id: 'kitchen',  name: 'Kitchen commander',    items: 'dishes · oven · fridge · counters' },
    { id: 'weekly',   name: 'Smart weekly care',    items: 'dusting · floors · trash' },
    { id: 'biweekly', name: 'Smart bi-weekly care', items: 'bathroom · floors · dusting' },
    { id: 'linens',   name: 'Fresh linens',         items: 'strip · wash · fold · make the bed' },
    { id: 'reset',    name: 'Weekly reset',         items: 'bathroom · kitchen · floors · bed' }
  ];
  var SCREENS = [
    { id: 'main',    label: 'Live schedule',     hint: 'cleaner, this-week availability, QR' },
    { id: 'popular', label: 'Popular in your building', hint: 'most-booked tasks + favorite packages' },
    { id: 'stats',   label: 'By the numbers',    hint: 'visits, residents, hours saved, rating' },
    { id: 'app',     label: 'The Zing app',      hint: 'self-running booking demo' }
  ];

  // Column order in the sheet. Booleans are TRUE/FALSE, lists are pipe-separated ids.
  var COLUMNS = ['slug','building','cleaner_name','cleaner_status','mon','tue','wed','thu','fri',
    'residents_booked','most_requested','avg_clean_time','stat_visits','stat_residents','stat_hours','rating',
    'popular_tasks','popular_packages','show_main','show_popular','show_stats','show_app',
    'dur_main','dur_popular','dur_stats','dur_app','updated_at','updated_by'];

  function defaults(slug) {
    var st = STATIONS.filter(function (s) { return s.slug === slug; })[0] || { slug: slug, building: slug, cleaner: '', spots: [3,3,3,3,3], booked: 25 };
    return {
      slug: st.slug, building: st.building,
      cleaner_name: st.cleaner, cleaner_status: 'Live in the building',
      mon: st.spots[0], tue: st.spots[1], wed: st.spots[2], thu: st.spots[3], fri: st.spots[4],
      residents_booked: st.booked, most_requested: 'Bathroom refresh', avg_clean_time: '45 min',
      stat_visits: '1,240', stat_residents: '186', stat_hours: '2,100', rating: '4.9',
      popular_tasks: ['bathroom','bed','dishes','laundry','trash','floor'],
      popular_packages: ['reset','kitchen','linens'],
      show_main: true, show_popular: true, show_stats: true, show_app: true,
      dur_main: 30, dur_popular: 15, dur_stats: 15, dur_app: 33,
      updated_at: '', updated_by: ''
    };
  }

  function toBool(v) { if (typeof v === 'boolean') return v; var s = String(v == null ? '' : v).trim().toLowerCase(); return s === 'true' || s === 'yes' || s === '1' || s === 'on'; }
  function toInt(v, d) { var n = parseInt(v, 10); return isNaN(n) ? d : n; }
  function toList(v) { if (Array.isArray(v)) return v; return String(v || '').split('|').map(function (x) { return x.trim(); }).filter(Boolean); }

  // Sheet row (strings) → typed config, filled from defaults where blank.
  function normalize(row, slug) {
    var d = defaults((row && row.slug) || slug), out = {};
    COLUMNS.forEach(function (k) {
      var v = row ? row[k] : undefined, has = v !== undefined && v !== null && String(v) !== '';
      if (/^show_/.test(k)) out[k] = has ? toBool(v) : d[k];
      else if (/^dur_/.test(k) || /^(mon|tue|wed|thu|fri|residents_booked)$/.test(k)) out[k] = has ? toInt(v, d[k]) : d[k];
      else if (/^popular_/.test(k)) out[k] = has ? toList(v) : d[k];
      else out[k] = has ? String(v) : d[k];
    });
    return out;
  }
  // Typed config → flat row for the sheet.
  function serialize(cfg) {
    var row = {};
    COLUMNS.forEach(function (k) {
      var v = cfg[k];
      row[k] = Array.isArray(v) ? v.join('|') : (typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : (v == null ? '' : v));
    });
    return row;
  }

  function cacheKey(slug) { return 'zing.kiosk.' + slug; }
  function withTimeout(p, ms) { return Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, ms); })]); }

  // Kiosk side: sheet → cache → defaults. Never throws.
  function fetchStation(slug) {
    if (!ENDPOINT) return Promise.resolve(normalize(null, slug));
    return withTimeout(fetch(ENDPOINT + '?station=' + encodeURIComponent(slug), { redirect: 'follow' }).then(function (r) { return r.json(); }), 6000)
      .then(function (j) {
        if (!j || !j.ok || !j.row) throw new Error('no row');
        var cfg = normalize(j.row, slug);
        try { localStorage.setItem(cacheKey(slug), JSON.stringify(cfg)); } catch (e) {}
        return cfg;
      })
      .catch(function () {
        try { var c = localStorage.getItem(cacheKey(slug)); if (c) return normalize(JSON.parse(c), slug); } catch (e) {}
        return normalize(null, slug);
      });
  }
  // Admin side: every row, keyed by slug (stations missing from the sheet come back as defaults).
  function fetchAll() {
    var base = {}; STATIONS.forEach(function (s) { base[s.slug] = normalize(null, s.slug); });
    if (!ENDPOINT) return Promise.resolve({ rows: base, live: false });
    return withTimeout(fetch(ENDPOINT + '?all=1', { redirect: 'follow' }).then(function (r) { return r.json(); }), 8000)
      .then(function (j) {
        (j && j.rows || []).forEach(function (r) { if (r && r.slug) base[r.slug] = normalize(r, r.slug); });
        return { rows: base, live: true };
      })
      .catch(function () { return { rows: base, live: false }; });
  }
  // Admin side: upsert one station. text/plain avoids a CORS preflight Apps Script can't answer;
  // the response is opaque, so callers re-fetch to confirm.
  function save(cfg, by) {
    if (!ENDPOINT) return Promise.reject(new Error('ENDPOINT not set in kiosk-config.js'));
    var row = serialize(cfg); row.updated_by = by || ''; row.updated_at = '';
    return fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'upsert', row: row }) });
  }

  function task(id) { return TASKS.filter(function (t) { return t.id === id; })[0]; }
  function pkg(id) { return PACKAGES.filter(function (p) { return p.id === id; })[0]; }

  return { ENDPOINT: ENDPOINT, STATIONS: STATIONS, TASKS: TASKS, PACKAGES: PACKAGES, SCREENS: SCREENS, COLUMNS: COLUMNS,
    defaults: defaults, normalize: normalize, serialize: serialize, fetchStation: fetchStation, fetchAll: fetchAll, save: save, task: task, pkg: pkg };
})();
