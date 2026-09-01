/* Zing Onboarding · capa de datos
   Guarda el progreso por número de teléfono. localStorage es la fuente inmediata;
   si SHEET_ENDPOINT está configurado, cada evento se envía además a Google Sheets.

   ── PARA CONECTAR EL BACKEND (Google Sheets) ────────────────────────────────
   Hoja: docs.google.com/spreadsheets/d/1G82iDUI6C1gynZmwjOc6IwXCwOF0Ds1_wTjPAa4Nb9U
   1. En la hoja: Extensiones → Apps Script. Pega el archivo apps-script.gs
      de esta misma carpeta y ejecuta la función setup() una vez.
   2. Implementar → Nueva implementación → App web → Acceso: cualquier persona.
   3. Pega la URL /exec en SHEET_ENDPOINT abajo. Nada más cambia en la app.
   Escritura con mode:'no-cors' (fire-and-forget): si falla, el progreso local
   nunca se pierde. Lectura con GET ?phone= para recuperar el progreso cuando
   la persona entra desde otro dispositivo.                                    */

window.SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbxd9Y6R3lrr5vrt3zovMkqP86V1MH-6Iz-aNPPmCdTVtPyqhkMQ9J71KZlhtbana0qK/exec";

(function () {
  var KEY = "zing.onboarding.v1";
  var ACTIVE = "zing.onboarding.active";
  var PLAN_DAYS = 7;

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || { cleaners: {} }; }
    catch (e) { return { cleaners: {} }; }
  }
  function write(db) { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }

  function normPhone(s) { return String(s || "").replace(/\D/g, "").slice(-10); }
  function prettyPhone(s) {
    var d = normPhone(s);
    return d.length === 10 ? "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6) : d;
  }

  function push(row) {
    if (!window.SHEET_ENDPOINT) return;
    try {
      fetch(window.SHEET_ENDPOINT, {
        method: "POST", mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(row)
      });
    } catch (e) {}
  }

  var Store = {
    PLAN_DAYS: PLAN_DAYS,
    normPhone: normPhone,
    prettyPhone: prettyPhone,

    all: function () { return read().cleaners; },

    get: function (phone) { return read().cleaners[normPhone(phone)] || null; },

    /* Crea la sesión o recupera la existente si el teléfono ya está registrado. */
    signIn: function (name, phone) {
      var db = read(), p = normPhone(phone), now = new Date().toISOString();
      var rec = db.cleaners[p];
      if (!rec) {
        rec = { name: String(name || "").trim(), phone: p, startedAt: now, lastAt: now, done: {} };
        db.cleaners[p] = rec;
        push({ event: "signup", phone: p, name: rec.name, ts: now });
      } else {
        if (name && String(name).trim()) rec.name = String(name).trim();
        rec.lastAt = now;
      }
      write(db);
      localStorage.setItem(ACTIVE, p);
      return rec;
    },

    resume: function (phone) {
      var rec = this.get(phone);
      if (!rec) return null;
      localStorage.setItem(ACTIVE, normPhone(phone));
      var db = read();
      db.cleaners[rec.phone].lastAt = new Date().toISOString();
      write(db);
      return db.cleaners[rec.phone];
    },

    activePhone: function () { return localStorage.getItem(ACTIVE) || null; },
    signOut: function () { localStorage.removeItem(ACTIVE); },

    /* Trae el progreso de la hoja y lo mezcla con el local (el servidor solo
       agrega módulos que falten aquí). Si el dispositivo no conoce a la persona
       pero la hoja sí, crea el registro local. Resuelve null si no hay backend,
       no hay red o la persona no existe en la hoja. */
    hydrate: function (phone) {
      var p = normPhone(phone);
      if (!window.SHEET_ENDPOINT || p.length !== 10) return Promise.resolve(null);
      var url = window.SHEET_ENDPOINT + (window.SHEET_ENDPOINT.indexOf("?") > -1 ? "&" : "?") + "phone=" + p;
      return fetch(url, { method: "GET", redirect: "follow" })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j || !j.ok || !j.found || !j.cleaner) return null;
          var srv = j.cleaner, db = read(), rec = db.cleaners[p];
          if (!rec) {
            rec = { name: srv.name || "", phone: p, startedAt: srv.startedAt || new Date().toISOString(),
                    lastAt: new Date().toISOString(), done: {} };
            db.cleaners[p] = rec;
          }
          if (!rec.name && srv.name) rec.name = srv.name;
          Object.keys(srv.done || {}).forEach(function (id) {
            if (!rec.done[id]) rec.done[id] = srv.done[id];
          });
          write(db);
          return rec;
        })
        .catch(function () { return null; });
    },

    /* Registra un módulo aprobado. */
    complete: function (phone, mod, info) {
      var db = read(), p = normPhone(phone), rec = db.cleaners[p];
      if (!rec) return null;
      var now = new Date().toISOString();
      var prev = rec.done[mod.id];
      rec.done[mod.id] = {
        track: mod.track, title: mod.t, ts: now,
        attempts: (prev ? prev.attempts : 0) + (info.attempts || 1),
        wrong: info.wrong || 0, questions: info.questions || 0
      };
      rec.lastAt = now;
      write(db);
      push({
        event: "module_complete", phone: p, name: rec.name, moduleId: mod.id,
        track: mod.track, title: mod.t, attempts: rec.done[mod.id].attempts,
        wrong: info.wrong || 0, questions: info.questions || 0,
        totalDone: Object.keys(rec.done).length, ts: now
      });
      return rec;
    },

    certify: function (phone, total) {
      var rec = this.get(phone); if (!rec) return;
      push({ event: "certified", phone: rec.phone, name: rec.name, modules: total, ts: new Date().toISOString() });
    },

    /* Días transcurridos desde el registro (1 = hoy mismo). */
    dayOfPlan: function (rec) {
      if (!rec || !rec.startedAt) return 1;
      var a = new Date(rec.startedAt), b = new Date();
      var d = Math.floor((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
                          Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000);
      return Math.max(1, d + 1);
    }
  };

  window.Store = Store;
})();
