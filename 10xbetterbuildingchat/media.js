/* Zing Neighbors App: photos, videos and voice notes saved in this browser (IndexedDB). Messages keep only the media id.
   Swap put/url for Supabase Storage later; nothing else needs to change. */
window.ZMedia = (function(){
  var DB = 'zingN.media', ST = 'blobs', dbp = null, urls = {};
  function db(){ return dbp || (dbp = new Promise(function(res, rej){ var r = indexedDB.open(DB, 1); r.onupgradeneeded = function(){ r.result.createObjectStore(ST); }; r.onsuccess = function(){ res(r.result); }; r.onerror = function(){ rej(r.error); }; })); }
  function tx(mode, fn){ return db().then(function(d){ return new Promise(function(res, rej){ var t = d.transaction(ST, mode), q = fn(t.objectStore(ST)); t.oncomplete = function(){ res(q && q.result); }; t.onerror = function(){ rej(t.error); }; }); }); }
  return {
    put: function(blob){ var id = 'md' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); urls[id] = URL.createObjectURL(blob);
      return tx('readwrite', function(s){ return s.put(blob, id); }).then(function(){ return id; }, function(){ return id; }); },
    cached: function(id){ return id ? urls[id] || null : null; },
    url: function(id){ if (!id) return Promise.resolve(null); if (urls[id]) return Promise.resolve(urls[id]);
      return tx('readonly', function(s){ return s.get(id); }).then(function(b){ return b ? (urls[id] = URL.createObjectURL(b)) : null; }, function(){ return null; }); },
    clear: function(){ return tx('readwrite', function(s){ return s.clear(); }).catch(function(){}); }
  };
})();
