/* Zing Neighbors App: provider profiles (built by chatting), the onboarding chat, and announced visits
   ("I'll be in the building Tuesday morning"). Shared across pages via localStorage; becomes Supabase tables later. */
window.ZPro = (function(){
  var KEY = 'zingN.app.providers', n = 0;
  function all(){ try { var o = JSON.parse(localStorage.getItem(KEY)) || {}; o.profiles = o.profiles || {}; o.chats = o.chats || {}; o.visits = o.visits || []; return o; } catch (e) { return { profiles: {}, chats: {}, visits: [] }; } }
  function save(o){ try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} window.dispatchEvent(new Event('zpro')); }
  function id(p){ return p + Date.now().toString(36) + (n++); }
  function AREAS(){ return [{ name: 'Coconut Grove', residents: 500, alias: /\b(coconut )?grove\b/i, buildings: [window.HOA.GROUP.name] }]; }
  function covers(v, b){ return !b || v.building === b || AREAS().some(function(a){ return a.name === v.building && a.buildings.indexOf(b) >= 0; }); }
  function ymd(d){ return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  return {
    BUILDINGS: function(){ return [{ name: window.HOA.GROUP.name, coi: true, note: 'Asks for a certificate of insurance (COI) for work in common areas' }]; },
    AREAS: AREAS,
    areaOf: function(b){ var a = AREAS().find(function(x){ return x.buildings.indexOf(b) >= 0; }); return a ? a.name : null; },
    reach: function(place){ var a = AREAS().find(function(x){ return x.name === place; }); return a ? a.residents : null; },
    ymd: ymd,
    profile: function(sid){ return all().profiles[sid] || null; },
    profiles: function(){ return all().profiles; },
    patch: function(sid, p){ var o = all(); o.profiles[sid] = Object.assign({ sid: sid, created: Date.now() }, o.profiles[sid] || {}, p, { updated: Date.now() }); save(o); return o.profiles[sid]; },
    chat: function(sid){ return all().chats[sid] || []; },
    say: function(sid, m){ var o = all(); (o.chats[sid] = o.chats[sid] || []).push(Object.assign({ id: id('pc'), ts: Date.now() }, m)); save(o); },
    markChat: function(sid, mid, p){ var o = all(); (o.chats[sid] || []).forEach(function(m){ if (m.id === mid) Object.assign(m, p); }); save(o); },
    reset: function(sid){ var o = all(); delete o.profiles[sid]; delete o.chats[sid]; o.visits = o.visits.filter(function(v){ return v.sid !== sid; }); save(o); },
    visits: function(){ return all().visits; },
    upcoming: function(building, days){ var t = ymd(new Date()), e = new Date(); e.setDate(e.getDate() + (days || 7)); var end = ymd(e);
      return all().visits.filter(function(v){ return v.status !== 'Cancelled' && v.date >= t && v.date <= end && covers(v, building); }).sort(function(a, b){ return (a.date + a.win).localeCompare(b.date + b.win); }); },
    nearby: function(building, trade, days){ return this.upcoming(building, days).filter(function(v){ return v.trade === trade && v.booked.length < v.slots; }); },
    seedDemo: function(sups){ var o = all(); if (o.seeded || !sups || sups.length < 5) return; var A = AREAS()[0], wins = ['Morning', 'Afternoon', 'All day'], plan = [['Plumber', [1, 2, 3]], ['AC / HVAC', [1, 3, 4]], ['Handyman', [2, 3, 5]]];
      plan.forEach(function(pl, pi){ sups.filter(function(s){ return s.trade === pl[0] && !s.warnings && !/^unnamed|\(via/i.test(s.name); }).sort(function(a, b){ return b.recs - a.recs; }).slice(0, 3).forEach(function(s, i){ var x = new Date(); x.setDate(x.getDate() + pl[1][i]);
        o.visits.push({ id: id('pv'), sid: s.id, name: s.name, trade: s.trade, phone: s.phone || '', coi: false, building: A.name, date: ymd(x), win: wins[(i + pi) % 3], slots: 2 + (i % 2), note: i === 0 ? 'No trip fee' : '', booked: [], status: 'Open', ts: Date.now(), demo: true }); }); });
      o.seeded = true; save(o); },
    addVisit: function(v){ var o = all(), x = Object.assign({ id: id('pv'), booked: [], status: 'Open', ts: Date.now() }, v); o.visits.push(x); save(o); return x; },
    cancelVisit: function(vid){ var o = all(); o.visits.forEach(function(v){ if (v.id === vid) v.status = 'Cancelled'; }); save(o); },
    bookVisit: function(vid, b){ var o = all(), v = o.visits.find(function(x){ return x.id === vid; }); if (!v || v.booked.length >= v.slots) return null;
      v.booked.push(Object.assign({ id: id('vb'), ts: Date.now() }, b)); if (v.booked.length >= v.slots) v.status = 'Full'; save(o); return v; },
    subscribe: function(fn){ var h = function(e){ if (e.type === 'storage' && e.key !== KEY) return; fn(); }; window.addEventListener('zpro', h); window.addEventListener('storage', h);
      return function(){ window.removeEventListener('zpro', h); window.removeEventListener('storage', h); }; },
    clear: function(){ try { localStorage.removeItem(KEY); } catch (e) {} window.dispatchEvent(new Event('zpro')); }
  };
})();
