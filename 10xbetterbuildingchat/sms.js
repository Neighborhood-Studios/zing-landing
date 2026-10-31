/* Zing Neighbors App: text messages between Zing and providers. Saved in this browser and shared across pages.
   To go live, send() posts to a Supabase function that calls Twilio, and a Twilio webhook calls receive(). Nothing else changes. */
window.ZSMS = (function(){
  var KEY = 'zingN.app.sms', n = 0;
  function all(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(o){ try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} window.dispatchEvent(new Event('zsms')); }
  function push(tid, meta, dir, body){
    var o = all(), t = o[tid] || (o[tid] = { id: tid, msgs: [], created: Date.now() });
    if (meta) Object.keys(meta).forEach(function(k){ if (meta[k] !== undefined) t[k] = meta[k]; });
    t.msgs.push({ id: 'sm' + Date.now().toString(36) + (n++), dir: dir, body: body, ts: Date.now(), processed: dir === 'out' });
    t.updated = Date.now(); save(o); return t;
  }
  return {
    KEY: KEY, live: false,
    list: function(){ var o = all(); return Object.keys(o).map(function(k){ return o[k]; }).sort(function(a, b){ return (b.updated || 0) - (a.updated || 0); }); },
    get: function(tid){ return tid ? all()[tid] || null : null; },
    latestSid: function(){ var l = this.list()[0]; return l ? l.sid : null; },
    send: function(tid, meta, body){ return push(tid, meta, 'out', body); },
    receive: function(tid, body){ return push(tid, null, 'in', body); },
    mark: function(tid, id){ var o = all(), t = o[tid]; if (!t) return; t.msgs.forEach(function(m){ if (m.id === id) m.processed = true; }); save(o); },
    clear: function(){ try { localStorage.removeItem(KEY); } catch (e) {} window.dispatchEvent(new Event('zsms')); },
    subscribe: function(fn){ var h = function(e){ if (e.type === 'storage' && e.key !== KEY) return; fn(); }; window.addEventListener('zsms', h); window.addEventListener('storage', h);
      return function(){ window.removeEventListener('zsms', h); window.removeEventListener('storage', h); }; }
  };
})();
