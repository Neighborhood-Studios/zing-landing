/* Zing Onboarding v2 · app
   Vía 1 "Cómo Operamos" (ops.js) + Vía 2 "Manual de Limpieza" (sops.js + quiz.js).
   Al completar los 26 módulos se desbloquean, en la misma URL:
   · Hoy — lección diaria (lessons.js)   · Tareas — buscador de SOPs (sops.jsx)
   · Preguntar — Pregúntale al manual (ask.jsx + qa.js)
   Identidad y progreso vía store.js (localStorage + Google Sheets). */

const { useState, useEffect, useRef, useMemo } = React;
const LOGO = "icons/zing-logo.svg";
const LESSONS = window.LESSONS, T_UI = window.T_UI, LAUNCH = window.TRAINING_LAUNCH;

/* ---- fechas en hora de Miami (lección diaria) ---- */
const miamiToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
const dParse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const dayDiff = (a, b) => Math.round((dParse(a) - dParse(b)) / 86400000);
const addDays = (s, n) => { const d = dParse(s); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const fmtDate = (s, lang) => dParse(s).toLocaleDateString(lang === "es" ? "es-US" : "en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
/* Fecha (Miami) en que la persona se certificó = último módulo del onboarding aprobado. */
const miamiDate = iso => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date(iso));
const startDateFor = rec => {
  if (rec && rec.dailyStart) return rec.dailyStart;
  let last = null;
  MODULES.forEach(m => { const d = rec && rec.done[m.id]; if (d && d.ts && (!last || d.ts > last)) last = d.ts; });
  return last ? miamiDate(last) : miamiToday();
};
const DAILY_WINDOW = 10;
const streakFor = rec => {
  const c = (rec && rec.lessons) || {};
  let s = 0, d = miamiToday();
  if (!c[d]) d = addDays(d, -1);
  while (c[d]) { s++; d = addDays(d, -1); }
  return s;
};

const MODULES = [].concat(
  window.OPS.map((c, i) => ({
    kind: "ops", track: "ops", id: c.id, n: i + 1, t: c.t, icon: c.icon,
    mins: c.mins, lead: c.lead, blocks: c.blocks, quiz: c.quiz
  })),
  window.SOPS.map((s, i) => ({
    kind: "task", track: "tasks", id: s.id, n: i + 1, t: s.t.es, icon: s.icon,
    mins: 4, sop: s, quiz: window.TASK_QUIZ[s.id] || []
  }))
);
const OPS_N = window.OPS.length;
const TASKS_N = window.SOPS.length;
const TOTAL = MODULES.length; /* módulos del onboarding inicial → certificado */

/* Vías adicionales (tracks.js): educación continua, no cuentan para el certificado. */
const EXTRA = window.EXTRA_TRACKS || [];
const EXTRA_MODULES = [].concat.apply([], EXTRA.map(tr => (tr.modules || []).map((c, i) => ({
  kind: "ops", track: tr.key, id: c.id, n: i + 1, t: c.t, icon: c.icon,
  mins: c.mins || 4, lead: c.lead, blocks: c.blocks || [], quiz: c.quiz || []
}))));
const ALL_MODULES = MODULES.concat(EXTRA_MODULES);

/* ---- Programa diario: una lección por día, en este orden ----
   Parte 3 Seguridad e Higiene → Parte 4 Profesionalismo → Parte 5 → las 10 lecciones del Manual → Parte 1 → Parte 2.
   Cada módulo se convierte en una lección de un día con UNA pregunta de su quiz. Al terminar, vuelve a empezar. */
const modToDaily = (m, part) => ({
  kind: "module", id: "m:" + m.id, mod: m, part: part, emoji: m.kind === "ops" ? m.icon : null, icon: m.kind === "ops" ? null : m.icon,
  t: { es: m.t, en: m.t },
  qs: (m.quiz || []).map(q => ({ es: q.q, en: q.q, opts: q.opts.map(o => ({ es: o, en: o })), correct: q.a, why: { es: q.why, en: q.why } }))
});
const TRACKS = [
  { key: "ops", icon: "🔑", label: "Parte 1 · Cómo Operamos", blurb: "Qué pasa antes, durante y después de cada visita." },
  { key: "tasks", icon: "🧼", label: "Parte 2 · Manual de Limpieza", blurb: "Cómo se ejecuta cada tarea, paso a paso." }
];
const DAILY = [].concat(
  EXTRA_MODULES.map(m => modToDaily(m, (EXTRA.find(tr => tr.key === m.track) || {}).label || "")),
  LESSONS.map(l => ({ kind: "lesson", id: "l:" + l.id, lesson: l, part: "Manual de Limpieza", icon: l.icon, t: l.t, qs: [l.q] })),
  MODULES.map(m => modToDaily(m, m.track === "ops" ? TRACKS[0].label : TRACKS[1].label))
).filter(it => it.qs.length);
const dailyFor = (rec, dateStr) => {
  const d = dayDiff(dateStr, startDateFor(rec));
  if (d < 0) return null;
  const it = DAILY[d % DAILY.length];
  return Object.assign({}, it, { dayN: d + 1, q: it.qs[Math.floor(d / DAILY.length) % it.qs.length] });
};

const doneCount = (rec, track) =>
  ALL_MODULES.filter(m => (!track ? m.track === "ops" || m.track === "tasks" : m.track === track) && rec.done[m.id]).length;

const firstName = n => String(n || "").trim().split(/\s+/)[0] || "";

/* ───────────────────────── pantallas de entrada ───────────────────────── */

function Welcome({ onStart, onResume }) {
  return (
    <div className="screen">
      <div className="hero">
        <img className="hero__logo" src={LOGO} alt="Zing" />
        <div className="hero__body">
          <div className="hero__eyebrow rise">Equipo de limpieza</div>
          <h1 className="rise" style={{ animationDelay: ".06s" }}>Bienvenida<br />a Zing</h1>
          <p className="rise" style={{ animationDelay: ".12s" }}>
            Este es tu entrenamiento. Primero cómo operamos en cada visita, después cómo se hace cada tarea.
            Puedes salir y volver: tu progreso se guarda con tu número de teléfono.
          </p>
          <div className="hero__facts rise" style={{ animationDelay: ".18s" }}>
            <div className="fact"><b>{TOTAL}</b><span>módulos cortos</span></div>
            <div className="fact"><b>7</b><span>días para terminar</span></div>
            <div className="fact"><b>4</b><span>módulos al día</span></div>
          </div>
          <div className="hero__cta rise" style={{ animationDelay: ".24s" }}>
            <button className="btn btn--primary" onClick={onStart}>Comenzar mi entrenamiento</button>
            <button className="link" onClick={onResume}>Ya empecé — continuar donde quedé</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignUp({ onBack, onDone }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const ok = name.trim().length > 1 && Store.normPhone(phone).length === 10;
  function go() {
    if (!ok) { setErr("Escribe tu nombre completo y un teléfono de 10 dígitos."); return; }
    setErr(""); setBusy(true);
    const rec = Store.signIn(name, phone);
    Store.hydrate(rec.phone).then(srv => { setBusy(false); onDone(srv || rec); });
  }
  return (
    <div className="screen">
      <div className="form">
        <div className="backrow"><button className="arrow" onClick={onBack}>←</button></div>
        <h2>Empecemos con tus datos</h2>
        <p>Tu teléfono es tu llave: con él guardamos tu progreso y con él vuelves a entrar.</p>
        <div className="field">
          <label htmlFor="nm">Nombre y apellido</label>
          <input id="nm" value={name} onChange={e => setName(e.target.value)} placeholder="María Rodríguez" autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="ph">Teléfono</label>
          <input id="ph" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(305) 555-0100" inputMode="tel" autoComplete="tel" />
        </div>
        {err ? <div className="err">{err}</div> : null}
        <div className="form__foot">
          <button className="btn btn--primary" disabled={busy} onClick={go}>{busy ? "Un momento…" : "Comenzar"}</button>
        </div>
      </div>
    </div>
  );
}

function ResumeIn({ onBack, onDone }) {
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  function go() {
    setErr(""); setBusy(true);
    const local = Store.resume(phone);
    Store.hydrate(phone).then(srv => {
      setBusy(false);
      const rec = srv || local;
      if (!rec) { setErr("No encontramos ese número. Revísalo o comienza un registro nuevo."); return; }
      Store.resume(rec.phone);
      onDone(rec);
    });
  }
  return (
    <div className="screen">
      <div className="form">
        <div className="backrow"><button className="arrow" onClick={onBack}>←</button></div>
        <h2>Continuar mi entrenamiento</h2>
        <p>Escribe el teléfono con el que te registraste.</p>
        <div className="field">
          <label htmlFor="ph2">Teléfono</label>
          <input id="ph2" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(305) 555-0100" inputMode="tel" autoComplete="tel" />
        </div>
        {err ? <div className="err">{err}</div> : null}
        <div className="form__foot">
          <button className="btn btn--primary" disabled={busy} onClick={go}>{busy ? "Buscando…" : "Entrar"}</button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── inicio / progreso ───────────────────────────── */

function Ring({ pct }) {
  const r = 38, c = 2 * Math.PI * r;
  return (
    <div className="ring">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(247,243,234,.18)" strokeWidth="7" />
        <circle cx="44" cy="44" r={r} fill="none" stroke="#C9D8C2" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} style={{ transition: "stroke-dashoffset .8s cubic-bezier(.22,.9,.3,1)" }} />
      </svg>
      <div className="ring__t">{pct + "%"}</div>
    </div>
  );
}

const UNLOCKS = [
  { ic: "◎", t: "Lección del día", d: "3 minutos, una pregunta, todos los días" },
  { ic: "⌕", t: "Manual de tareas", d: "Busca cualquier tarea mientras trabajas" },
  { ic: "✎", t: "Pregúntale al manual", d: "Describe tu situación y te dice qué hacer" }
];

function TrackList({ tr, rec, nextMod, onOpen, collapsible }) {
  const list = ALL_MODULES.filter(m => m.track === tr.key);
  const d = doneCount(rec, tr.key);
  const [open, setOpen] = useState(!collapsible);
  const show = !collapsible || open;
  return (
    <div>
      {collapsible ? (
        <button className={"trackhd" + (open ? " trackhd--open" : "")} onClick={() => setOpen(o => !o)} aria-expanded={open}>
          <span className="trackhd__ic">{tr.icon || "▤"}</span>
          <span className="trackhd__txt">
            <h4>{tr.label}</h4>
            <i>{list.length ? (d === list.length ? "Completado · " + list.length + " módulos" : d + " de " + list.length + " módulos") : tr.blurb}</i>
          </span>
          <span className="trackhd__chev">{open ? "▴" : "▾"}</span>
        </button>
      ) : (
        <div className="tracklbl">
          <h4>{tr.label}</h4>
          <span>{list.length ? d + "/" + list.length : ""}</span>
        </div>
      )}
      {!show ? null : list.length ? (
        <div className="mlist">
          {list.map(m => {
            const isDone = !!rec.done[m.id];
            const isNext = nextMod && nextMod.id === m.id;
            return (
              <button key={m.id} className={"mrow" + (isDone ? " mrow--done" : "") + (isNext ? " mrow--next" : "")} onClick={() => onOpen(m.id)}>
                <span className="mrow__ic">
                  {m.kind === "ops" ? <em style={{ fontStyle: "normal" }}>{m.icon}</em> : <img src={m.icon} alt="" />}
                </span>
                <span className="mrow__txt">
                  <b>{m.t}</b>
                  <i>{isDone ? "Completado" : m.mins + " min · " + m.quiz.length + (m.quiz.length === 1 ? " pregunta" : " preguntas")}</i>
                </span>
                <span className={"tick" + (isDone ? " tick--on" : "")}>{isDone ? "✓" : m.n}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="soon"><b>Contenido en preparación</b><span>{tr.blurb}</span></div>
      )}
    </div>
  );
}

function Home({ rec, onOpen, onOut, onCert, onToday, graduated }) {
  const done = doneCount(rec);
  const pct = Math.round((done / TOTAL) * 100);
  const day = Store.dayOfPlan(rec);
  const nextMod = MODULES.find(m => !rec.done[m.id]) || EXTRA_MODULES.find(m => !rec.done[m.id]) || null;
  const left = TOTAL - done;
  const daysLeft = Math.max(1, Store.PLAN_DAYS - day + 1);
  const badges = [
    { on: done >= 1, ic: "🌱", t: "Primer módulo" },
    { on: doneCount(rec, "ops") === OPS_N, ic: "🔑", t: "Cómo Operamos" },
    { on: done >= Math.ceil(TOTAL / 2), ic: "⛰", t: "Mitad del camino" },
    { on: doneCount(rec, "tasks") === TASKS_N, ic: "🧼", t: "Manual completo" },
    { on: done === TOTAL, ic: "🏅", t: "Certificada" }
  ];
  /* estado del entrenamiento diario (solo tras certificarse) */
  const today = miamiToday();
  const lessons = rec.lessons || {};
  const streak = streakFor(rec);
  const lessonsDone = Object.keys(lessons).length;
  const todayLesson = dailyFor(rec, today);
  const todayDone = !!lessons[today];
  const winStart = addDays(today, -(DAILY_WINDOW - 1));
  const winDays = Array.from({ length: DAILY_WINDOW }, (_, i) => addDays(winStart, i)).filter(ds => dayDiff(ds, startDateFor(rec)) >= 0);
  const cycleDone = winDays.filter(ds => lessons[ds]).length;
  const allTracks = TRACKS.concat(EXTRA);

  return (
    <div className={"screen" + (graduated ? " screen--tabbed" : "")}>
      <div className="home">
        <div className="topbar">
          <img src={LOGO} alt="Zing" />
          <span className="who">{Store.prettyPhone(rec.phone)}</span>
        </div>
        <div className="hello">{"Hola, " + firstName(rec.name)}</div>

        {graduated ? (
          <div className="pcard">
            <div className="pcard__top">
              <span className="pcard__lbl">Entrenamiento diario</span>
              <span className="daychip">{"🏅 Certificada"}</span>
            </div>
            <div className="pcard__mid">
              <Ring pct={winDays.length ? Math.round((cycleDone / winDays.length) * 100) : 0} />
              <div className="pcard__txt">
                <div className="pcard__big"><b>{streak}</b><i>{streak === 1 ? "día seguido" : "días seguidos"}</i></div>
                <em>{"🔥 " + lessonsDone + (lessonsDone === 1 ? " lección completada" : " lecciones completadas")}</em>
                <span>{todayDone ? "La lección de hoy ya está hecha. Mañana hay otra." : "La lección de hoy toma 3 minutos."}</span>
              </div>
            </div>
            <div className="segs">
              {winDays.map(ds => <i key={ds} className={lessons[ds] ? "on" : ""}></i>)}
            </div>
          </div>
        ) : (
          <div className="pcard">
            <div className="pcard__top">
              <span className="pcard__lbl">Mi progreso</span>
              <span className="daychip">{"🗓 Día " + day + " de " + Store.PLAN_DAYS}</span>
            </div>
            <div className="pcard__mid">
              <Ring pct={pct} />
              <div className="pcard__txt">
                <div className="pcard__big"><b>{done}</b><i>{"/ " + TOTAL}</i></div>
                <em>módulos completados</em>
                <span>{"Faltan " + left + " · quedan " + daysLeft + (daysLeft === 1 ? " día" : " días")}</span>
              </div>
            </div>
            <div className="segs">
              {MODULES.map((m, i) => (
                <React.Fragment key={m.id}>
                  {i === OPS_N ? <i className="sep"></i> : null}
                  <i className={rec.done[m.id] ? "on" : ""}></i>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {graduated ? (
          <div className="nextcard">
            <div className="nextcard__lbl">{todayDone ? "Lección de hoy · completada" : "Lección de hoy"}</div>
            <h3>{todayLesson ? todayLesson.t.es : ""}</h3>
            <button className="btn btn--primary" onClick={onToday}>{todayDone ? "Repasar la lección de hoy" : "Ver la lección de hoy · 3 min"}</button>
          </div>
        ) : nextMod ? (
          <div className="nextcard">
            <div className="nextcard__lbl">{done === 0 ? "Empieza aquí" : "Continúa aquí"}</div>
            <h3>{nextMod.t}</h3>
            <button className="btn btn--primary" onClick={() => onOpen(nextMod.id)}>
              {(done === 0 ? "Comenzar" : "Continuar") + " · " + nextMod.mins + " min"}
            </button>
          </div>
        ) : null}

        {graduated ? <div className="tracklbl" style={{ marginBottom: 4 }}><h4>Mi entrenamiento</h4></div> : null}
        {(graduated ? allTracks : TRACKS).map(tr => (
          <TrackList key={tr.key} tr={tr} rec={rec} nextMod={graduated ? null : nextMod} onOpen={onOpen} collapsible={graduated} />
        ))}

        <div className="tracklbl"><h4>Logros</h4></div>
        <div className="badges">
          {badges.map(b => (
            <div key={b.t} className={"badge" + (b.on ? "" : " badge--off")}><em>{b.ic}</em>{b.t}</div>
          ))}
        </div>

        {!graduated ? (
          <div className="lockcard">
            <div className="lockcard__lbl"><span>🔒</span>Se desbloquea al terminar</div>
            <p>{"Completa los " + TOTAL + " módulos y esta misma página se convierte en tu herramienta de trabajo diaria."}</p>
            <div className="locklist">
              {UNLOCKS.map(u => (
                <div key={u.t} className="lockrow"><em>{u.ic}</em><span><b>{u.t}</b><i>{u.d}</i></span></div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="homefoot">
          {graduated ? <button className="btn btn--ghost" onClick={onCert}>Ver mi certificado</button> : null}
          <button className="link" onClick={onOut}>Salir de mi sesión</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── lector de módulo ─────────────────────────── */

function Blocks({ blocks, checks, toggle }) {
  let ci = 0;
  return blocks.map((b, i) => {
    if (b.k === "h") return <div key={i} className="sub">{b.text}</div>;
    if (b.k === "p") return <p key={i} className="blk">{b.text}</p>;
    if (b.k === "say") return <div key={i} className="blk say">{b.text}</div>;
    if (b.k === "note") return <div key={i} className="blk note">{b.text}</div>;
    if (b.k === "rule") return (
      <div key={i} className={"blk rule rule--" + b.tone}>
        <b>{b.title}</b>
        <ul>{b.items.map((x, j) => <li key={j}>{x}</li>)}</ul>
      </div>
    );
    if (b.k === "check") {
      const base = ci; ci += b.items.length;
      return (
        <div key={i} className="blk ckl">
          {b.items.map((x, j) => {
            const key = base + j, on = !!checks[key];
            return (
              <button key={j} className={"ck" + (on ? " ck--on" : "")} onClick={() => toggle(key)}>
                <span className="ck__box">✓</span><span>{x}</span>
              </button>
            );
          })}
        </div>
      );
    }
    return null;
  });
}

function TaskBody({ sop }) {
  const s = sop;
  return (
    <div>
      <div className="figure"><img src={s.icon} alt="" /></div>
      <div className="eyebrow">{s.cat.es}</div>
      <h2>{s.t.es}</h2>
      <div className="timechip">{"⏱ " + (s.time ? s.time.es : "Ritmo constante")}</div>
      <div className="sub">Objetivo</div>
      <p>{s.goal.es}</p>
      {s.tools ? (<div><div className="sub">Equipo necesario</div><ul className="bullets">{s.tools.es.map((x, i) => <li key={i}>{x}</li>)}</ul></div>) : null}
      {s.flow ? (<div><div className="sub">Flujo correcto</div><ol className="flowlist">{s.flow.es.map((x, i) => <li key={i}>{x}</li>)}</ol></div>) : null}
      {s.steps ? (
        <div>
          <div className="sub">Paso a paso</div>
          {s.steps.map((st, i) => (
            <div key={i} className="sstep">
              <div className="sstep__hd"><span className="sstep__n">{i + 1}</span><b>{st.t.es}</b></div>
              <ul className="bullets">{st.d.es.map((x, j) => <li key={j}>{x}</li>)}</ul>
            </div>
          ))}
        </div>
      ) : null}
      {s.mistakes ? (
        <div>
          <div className="sub">Errores frecuentes</div>
          {s.mistakes.map((m, i) => (
            <div key={i} className="mist"><b>{m.t.es}</b><span>{m.r.es}</span></div>
          ))}
        </div>
      ) : null}
      {s.check ? (<div><div className="sub">Revisión final</div><ul className="bullets">{s.check.es.map((x, i) => <li key={i}>{x}</li>)}</ul></div>) : null}
      {s.scope ? (
        <div>
          <div className="sub">Alcance del servicio</div>
          <div className="scope">
            {s.scope.inc ? <div className="scope__col"><div className="scope__h scope__h--in">Incluye</div><ul>{s.scope.inc.es.map((x, i) => <li key={i}>{x}</li>)}</ul></div> : null}
            {s.scope.exc ? <div className="scope__col"><div className="scope__h scope__h--out">No incluye</div><ul>{s.scope.exc.es.map((x, i) => <li key={i}>{x}</li>)}</ul></div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Module({ mod, onExit, onPass }) {
  const [phase, setPhase] = useState("read");
  const [checks, setChecks] = useState({});
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(null);
  const [wrong, setWrong] = useState(0);
  const bodyRef = useRef(null);
  const q = mod.quiz[qi];
  const total = mod.quiz.length;
  const pct = phase === "read" ? 12 : Math.round(((qi + (picked === q.a ? 1 : 0)) / total) * 88) + 12;

  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = 0; }, [phase, qi]);

  function pick(i) {
    if (picked === q.a) return;
    setPicked(i);
    if (i !== q.a) setWrong(w => w + 1);
  }
  function next() {
    if (qi + 1 < total) { setQi(qi + 1); setPicked(null); }
    else onPass({ wrong: wrong, questions: total, attempts: 1 });
  }

  return (
    <div className="screen">
      <div className="read">
        <div className="read__hd">
          <button className="arrow" onClick={phase === "read" ? onExit : () => setPhase("read")}>←</button>
          <div className="pbar"><i style={{ width: pct + "%" }}></i></div>
          <span className="read__step">{phase === "read" ? "Lectura" : (qi + 1) + "/" + total}</span>
        </div>
        <div className="read__body" ref={bodyRef}>
          {phase === "read" ? (
            mod.kind === "ops" ? (
              <div>
                <div className="figure"><em>{mod.icon}</em></div>
                <div className="eyebrow">{"Parte 1 · Módulo " + mod.n + " de " + OPS_N}</div>
                <h2>{mod.t}</h2>
                <p className="lead">{mod.lead}</p>
                <Blocks blocks={mod.blocks} checks={checks} toggle={k => setChecks(c => Object.assign({}, c, { [k]: !c[k] }))} />
              </div>
            ) : <TaskBody sop={mod.sop} />
          ) : (
            <div className="qwrap">
              <div className="qnum">{"Pregunta " + (qi + 1) + " de " + total}</div>
              <div className="qtext">{q.q}</div>
              <div className="opts">
                {q.opts.map((o, i) => {
                  let cls = "opt";
                  if (picked !== null) {
                    if (i === picked && i !== q.a) cls += " opt--wrong";
                    else if (picked === q.a && i === q.a) cls += " opt--right";
                    else cls += " opt--dim";
                  }
                  return (
                    <button key={i} className={cls} onClick={() => pick(i)}>
                      <span className="opt__k">{"ABC"[i]}</span>{o}
                    </button>
                  );
                })}
              </div>
              {picked !== null ? (
                <div className={"verdict verdict--" + (picked === q.a ? "ok" : "no")}>
                  <b>{picked === q.a ? "Correcto" : "Todavía no"}</b>
                  {picked === q.a ? q.why : "Vuelve a leer y elige otra opción."}
                </div>
              ) : null}
              <div className="qdots">
                {mod.quiz.map((_, i) => <span key={i} className={"qdot" + (i < qi || (i === qi && picked === q.a) ? " qdot--on" : "")}></span>)}
              </div>
            </div>
          )}
        </div>
        <div className="read__foot">
          {phase === "read" ? (
            <button className="btn btn--primary" onClick={() => setPhase("quiz")}>
              {total + " " + (total === 1 ? "pregunta" : "preguntas") + " para terminar →"}
            </button>
          ) : (
            <button className="btn btn--primary" disabled={picked !== q.a} onClick={next}>
              {qi + 1 < total ? "Siguiente pregunta" : "Terminar módulo"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── celebración y certificado ───────────────────────── */

function Confetti() {
  const cols = ["#C9D8C2", "#C8A86A", "#5F7A63", "#DCE6D4", "#284043"];
  return (
    <div className="confetti">
      {Array.from({ length: 26 }).map((_, i) => (
        <i key={i} style={{
          left: (i * 3.9 + (i % 3) * 4) % 100 + "%",
          background: cols[i % cols.length],
          animationDelay: (i % 9) * 0.13 + "s"
        }}></i>
      ))}
    </div>
  );
}

function Done({ rec, mod, onNext, onHome }) {
  const done = doneCount(rec);
  const nextMod = MODULES.find(m => !rec.done[m.id]);
  const core = mod.track === "ops" || mod.track === "tasks";
  const trackDone = core && doneCount(rec, mod.track) === (mod.track === "ops" ? OPS_N : TASKS_N);
  return (
    <div className="screen">
      <Confetti />
      <div className="fin">
        <div className="fin__badge">{trackDone ? "🏅" : "✓"}</div>
        <h2>{trackDone ? (mod.track === "ops" ? "Terminaste Cómo Operamos" : "Terminaste el Manual de Limpieza") : "Módulo completado"}</h2>
        <p>{trackDone
          ? (mod.track === "ops" ? "Ya sabes cómo se ve una visita Zing completa. Ahora vamos tarea por tarea." : "Conoces cada tarea del servicio, paso a paso.")
          : mod.t}</p>
        <div className="fin__stat">{"📈 " + done + " de " + TOTAL + " módulos completados"}</div>
        {nextMod ? (
          <button className="btn btn--primary" onClick={onNext}>{"Siguiente: " + nextMod.t}</button>
        ) : core ? (
          <button className="btn btn--primary" onClick={onHome}>Ver mi certificado</button>
        ) : (
          <button className="btn btn--primary" onClick={onHome}>Volver a mi entrenamiento</button>
        )}
        <button className="link" onClick={onHome} style={{ marginTop: 6 }}>Volver a mi progreso</button>
      </div>
    </div>
  );
}

function Certificate({ rec, onHome }) {
  const d = new Date(rec.lastAt || Date.now());
  const fecha = d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="screen">
      <div className="cert">
        <img src={LOGO} alt="Zing" />
        <div className="cert__seal">🏅</div>
        <h2>Entrenamiento completado</h2>
        <div className="cert__name">{rec.name}</div>
        <div className="cert__rule"></div>
        <p>Completó los {TOTAL} módulos del onboarding Zing: cómo operamos en cada visita y el Manual de Limpieza completo.</p>
        <p style={{ color: "#8FA391", fontSize: 12.5 }}>{fecha}</p>
        <button className="btn" onClick={onHome}>Volver a mi progreso</button>
      </div>
    </div>
  );
}

/* ───────────────────────── Hoy · lección diaria ───────────────────────── */

function LangToggle({ lang, setLang, float }) {
  return (
    <div className={"lang" + (float ? " lang--float" : "")}>
      <button className={lang === "es" ? "on" : ""} onClick={() => setLang("es")}>ES</button>
      <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
    </div>
  );
}

function Today({ rec, lang, setLang, viewDate, setViewDate, onStart }) {
  const t = T_UI[lang];
  const today = miamiToday();
  const done = rec.lessons || {};
  const start = startDateFor(rec);
  const lesson = dailyFor(rec, viewDate);
  const isDone = !!done[viewDate];
  const dayN = dayDiff(viewDate, start) + 1;
  /* últimos 10 días: para ponerse al día con lo pendiente */
  const winStart = addDays(today, -(DAILY_WINDOW - 1));
  const move = n => {
    const nd = addDays(viewDate, n);
    if (dayDiff(nd, start) < 0 || dayDiff(nd, today) > 0) return;
    setViewDate(nd);
  };
  return (
    <div className="screen screen--tabbed" key="today">
      <div className="home">
        <div className="topbar">
          <img src={LOGO} alt="Zing" />
          <LangToggle lang={lang} setLang={setLang} />
        </div>
        <div className="hello">{(lang === "es" ? "Hola, " : "Hi, ") + firstName(rec.name)}</div>
        <span className="streakchip">{"🔥 " + streakFor(rec) + " " + t.streak}</span>
        <div className="datebar">
          <div>
            <h2>{viewDate === today ? t.today : fmtDate(viewDate, lang).split(",")[0]}</h2>
            <div className="dsub">{fmtDate(viewDate, lang) + " · " + t.day + " " + dayN}</div>
          </div>
          <div className="arrows">
            <button className="arrow" disabled={dayDiff(viewDate, start) <= 0} onClick={() => move(-1)} aria-label="prev">←</button>
            <button className="arrow" disabled={dayDiff(viewDate, today) >= 0} onClick={() => move(1)} aria-label="next">→</button>
          </div>
        </div>
        {lesson ? (
          <div className="lcard rise" key={viewDate}>
            {isDone ? <span className="lcard__done pop">✓</span> : null}
            <span className="lcard__tag">{t.lesson + " · " + lesson.part}</span>
            {lesson.icon ? <img className="lcard__icon" src={lesson.icon} alt="" /> : <div className="lcard__emoji">{lesson.emoji}</div>}
            <h3>{lesson.t[lang]}</h3>
            <div className="lcard__meta"><span>{"⏱ 3 " + t.minutes}</span><span>·</span><span>{isDone ? t.completed : t.pending}</span></div>
            <button className="btn btn--primary" onClick={onStart}>{isDone ? t.review : t.start}</button>
          </div>
        ) : null}
        <div className="days">
          {Array.from({ length: DAILY_WINDOW }, (_, i) => addDays(winStart, i)).map(ds => {
            const before = dayDiff(ds, start) < 0;
            const dd = !!done[ds];
            return (
              <button key={ds} className={"dayp" + (dd ? " dayp--done" : "") + (ds === viewDate ? " dayp--cur" : "")}
                style={{ opacity: before ? .35 : 1 }} disabled={before} onClick={() => setViewDate(ds)}>{dd ? "✓" : ds.slice(8).replace(/^0/, "")}</button>
            );
          })}
        </div>
        <div className="progresslbl">{t.progress + ": " + Object.keys(done).length + (lang === "es" ? " lecciones completadas" : " lessons completed")}</div>
      </div>
    </div>
  );
}

function Lesson({ rec, lang, viewDate, onExit, onDone }) {
  const t = T_UI[lang];
  const lesson = dailyFor(rec, viewDate);
  const [phase, setPhase] = useState("read");
  const [sel, setSel] = useState(null);
  const [checked, setChecked] = useState(false);
  const [checks, setChecks] = useState({});
  const bodyRef = useRef(null);
  const q = lesson.q;
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = 0; }, [phase]);
  function check() {
    setChecked(true);
    const correct = sel === q.correct;
    onDone(lesson, sel, correct, correct ? 1300 : 2600);
  }
  return (
    <div className="screen">
      <div className="read">
        <div className="read__hd">
          <button className="arrow" onClick={phase === "read" ? onExit : () => setPhase("read")}>←</button>
          <div className="pbar"><i style={{ width: phase === "read" ? "45%" : "85%" }}></i></div>
          <span className="read__step">{phase === "read" ? t.lesson : t.quizT}</span>
        </div>
        <div className="read__body" ref={bodyRef}>
          {phase === "read" ? (
            lesson.kind === "lesson" ? (
              <div>
                <div className="figure"><img src={lesson.icon} alt="" /></div>
                <div className="eyebrow">{t.lesson + " · " + t.day + " " + lesson.dayN + " · " + lesson.part}</div>
                <h2>{lesson.t[lang]}</h2>
                <div className="sub">{t.objective}</div>
                <p>{lesson.lesson.intro[lang]}</p>
                <div className="sub">{t.stepsT}</div>
                <div>
                  {lesson.lesson.steps.map((s, i) => (
                    <div className="step" key={i}><span className="step__n">{i + 1}</span><span>{s[lang]}</span></div>
                  ))}
                </div>
                <div className="sub">{t.tipT}</div>
                <div className="tipbox"><b>{"⚠ " + t.tipT}</b>{lesson.lesson.tip[lang]}</div>
              </div>
            ) : lesson.mod.kind === "ops" ? (
              <div>
                <div className="figure"><em>{lesson.mod.icon}</em></div>
                <div className="eyebrow">{t.lesson + " · " + t.day + " " + lesson.dayN + " · " + lesson.part}</div>
                <h2>{lesson.mod.t}</h2>
                <p className="lead">{lesson.mod.lead}</p>
                <Blocks blocks={lesson.mod.blocks} checks={checks} toggle={k => setChecks(c => Object.assign({}, c, { [k]: !c[k] }))} />
              </div>
            ) : (
              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>{t.lesson + " · " + t.day + " " + lesson.dayN + " · " + lesson.part}</div>
                <TaskBody sop={lesson.mod.sop} />
              </div>
            )
          ) : (
            <div className="qwrap">
              <div className="qnum">{t.quizT}</div>
              <div className="qtext">{q[lang]}</div>
              <div className="opts">
                {q.opts.map((o, i) => {
                  let cls = "opt";
                  if (checked) { if (i === q.correct) cls += " opt--right"; else if (i === sel) cls += " opt--wrong"; else cls += " opt--dim"; }
                  else if (i === sel) cls += " opt--sel";
                  return (
                    <button key={i} className={cls} disabled={checked} onClick={() => setSel(i)}>
                      <span className="opt__k">{String.fromCharCode(65 + i)}</span>{o[lang]}
                    </button>
                  );
                })}
              </div>
              {checked ? (
                <div className={"verdict " + (sel === q.correct ? "verdict--ok" : "verdict--no")}>
                  <b>{sel === q.correct ? "✓ " + t.correct : t.incorrect}</b>{q.why[lang]}
                </div>
              ) : null}
            </div>
          )}
        </div>
        <div className="read__foot">
          {phase === "read" ? (
            <button className="btn btn--primary" onClick={() => setPhase("quiz")}>{t.continueT}</button>
          ) : (
            <button className="btn btn--primary" disabled={sel === null || checked} onClick={check}>{t.check}</button>
          )}
        </div>
      </div>
    </div>
  );
}

function LessonDone({ rec, lang, onBack }) {
  const t = T_UI[lang];
  return (
    <div className="screen">
      <Confetti />
      <div className="fin">
        <div className="fin__ringwrap"><span className="fin__ring"></span><div className="fin__badge">🎉</div></div>
        <h2>{t.done}</h2>
        <p>{t.doneSub}</p>
        <span className="streakchip pop" style={{ animationDelay: ".4s", fontSize: 15, padding: "10px 18px", marginTop: 18 }}>{"🔥 " + streakFor(rec) + " " + t.streak}</span>
        <div style={{ width: "100%", maxWidth: 300 }}>
          <button className="btn btn--primary" onClick={onBack}>{t.another}</button>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: "home", ic: "▤", es: "Mi entrenamiento", en: "My training" },
  { id: "today", ic: "◎", es: "Hoy", en: "Today" },
  { id: "sops", ic: "⌕", es: "Tareas", en: "Tasks" },
  { id: "ask", ic: "✎", es: "Preguntar", en: "Ask" }
];

/* ─────────────────────────────────── app ─────────────────────────────────── */

function App() {
  const [rec, setRec] = useState(() => {
    const p = Store.activePhone();
    return p ? Store.get(p) : null;
  });
  const [view, setView] = useState(() => (Store.activePhone() && Store.get(Store.activePhone()) ? "home" : "welcome"));
  const [modId, setModId] = useState(null);
  const mod = ALL_MODULES.find(m => m.id === modId) || null;
  const [tab, setTab] = useState("home");
  const [lang, setLang] = useState(() => { try { return localStorage.getItem("zing.onboarding.lang") || "es"; } catch (e) { return "es"; } });
  const [viewDate, setViewDate] = useState(miamiToday);
  useEffect(() => { try { localStorage.setItem("zing.onboarding.lang", lang); } catch (e) {} }, [lang]);
  const graduated = !!rec && doneCount(rec) === TOTAL;

  /* Al abrir, si hay sesión activa, sincroniza con la hoja en segundo plano. */
  useEffect(() => {
    if (!rec) return;
    Store.hydrate(rec.phone).then(srv => { if (srv) setRec(Object.assign({}, srv)); });
  }, []);

  function enter(r) { setRec(r); setView("home"); }
  function open(id) { setModId(id); setView("module"); }

  function pass(info) {
    const updated = Store.complete(rec.phone, mod, info);
    setRec(Object.assign({}, updated));
    if (doneCount(rec) < TOTAL && doneCount(updated) === TOTAL) Store.certify(rec.phone, TOTAL);
    setView("done");
  }
  function nextModule() {
    const n = MODULES.find(m => !rec.done[m.id]);
    if (n) open(n.id); else setView("cert");
  }
  function lessonDone(lesson, answer, correct, delay) {
    const updated = Store.lesson(rec.phone, viewDate, lesson, answer, correct);
    if (updated) setRec(Object.assign({}, updated));
    setTimeout(() => setView("lessonDone"), delay);
  }
  function goTab(id) { setTab(id); setView("home"); }
  function signOut() { Store.signOut(); setRec(null); setTab("home"); setView("welcome"); }

  let body, tabbed = false;
  if (view === "welcome") body = <Welcome onStart={() => setView("signup")} onResume={() => setView("resume")} />;
  else if (view === "signup") body = <SignUp onBack={() => setView("welcome")} onDone={enter} />;
  else if (view === "resume") body = <ResumeIn onBack={() => setView("welcome")} onDone={enter} />;
  else if (view === "module" && mod) body = <Module mod={mod} onExit={() => setView("home")} onPass={pass} />;
  else if (view === "done" && mod) body = <Done rec={rec} mod={mod} onNext={nextModule} onHome={() => setView(doneCount(rec) === TOTAL && (mod.track === "ops" || mod.track === "tasks") ? "cert" : "home")} />;
  else if (view === "cert") body = <Certificate rec={rec} onHome={() => setView("home")} />;
  else if (view === "lesson") body = <Lesson rec={rec} lang={lang} viewDate={viewDate} onExit={() => setView("home")} onDone={lessonDone} />;
  else if (view === "lessonDone") body = <LessonDone rec={rec} lang={lang} onBack={() => setView("home")} />;
  else {
    tabbed = graduated;
    if (graduated && tab === "today") body = <Today rec={rec} lang={lang} setLang={setLang} viewDate={viewDate} setViewDate={setViewDate} onStart={() => setView("lesson")} />;
    else if (graduated && tab === "sops") body = <div className="screen screen--tabbed" key="sops"><window.SopsTab lang={lang} /></div>;
    else if (graduated && tab === "ask") body = <div className="screen screen--tabbed" key="ask"><window.AskTab lang={lang} name={firstName(rec.name)} /></div>;
    else body = <Home rec={rec} onOpen={open} onCert={() => setView("cert")} onOut={signOut} onToday={() => goTab("today")} graduated={graduated} />;
  }

  return (
    <div className="shell"><div className="app">
      {body}
      {tabbed && (tab === "sops" || tab === "ask") ? <LangToggle lang={lang} setLang={setLang} float /> : null}
      {tabbed ? (
        <nav className="tabbar">
          {TABS.map(tb => (
            <button key={tb.id} className={"tabbtn" + (tab === tb.id ? " tabbtn--on" : "")} onClick={() => goTab(tb.id)}>
              <em>{tb.ic}</em>{lang === "es" ? tb.es : tb.en}
            </button>
          ))}
        </nav>
      ) : null}
    </div></div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
