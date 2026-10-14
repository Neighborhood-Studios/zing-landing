/* Zing Bot Training · app
   Copia de zing-onboarding-v2 para entrenar al bot de WhatsApp de las limpiadoras.
   · Sin onboarding ni registro: abre directo en el panel del entrenamiento diario, todo desbloqueado.
   · Cada vía, módulo, lección y tarea tiene su propia URL: justzingit.com/bottraining/<vía>/<módulo>
     (ej. /bottraining/comooperamos/bienvenidaazing). En preview se usa #/<vía>/<módulo>.
   · El progreso se guarda solo en este dispositivo (localStorage), no en la hoja. */

const { useState, useEffect, useRef } = React;
const LOGO = "icons/zing-logo.svg";
const LESSONS = window.LESSONS, T_UI = window.T_UI, LAUNCH = window.TRAINING_LAUNCH;
const PUBLIC = "https://www.justzingit.com/bottraining";

/* ---- rutas ---- */
const PATH_MODE = /\/bottraining(\/|$)/i.test(location.pathname);
const BASE = PATH_MODE ? location.pathname.match(/^(.*?\/bottraining)/i)[1] : "";
const readRoute = () => (PATH_MODE ? location.pathname.slice(BASE.length) : location.hash.replace(/^#/, ""))
  .split("/").map(s => decodeURIComponent(s)).filter(Boolean);
const hrefFor = p => (PATH_MODE ? BASE + "/" + p : "#/" + p);
const publicUrl = p => PUBLIC + (p ? "/" + p : "");
const slug = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

/* ---- fechas en hora de Miami ---- */
const miamiToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
const dParse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const dayDiff = (a, b) => Math.round((dParse(a) - dParse(b)) / 86400000);
const addDays = (s, n) => { const d = dParse(s); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const fmtDate = (s, lang) => dParse(s).toLocaleDateString(lang === "es" ? "es-US" : "en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
const isDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s || "");
const DAILY_WINDOW = 10;

/* ---- progreso local ---- */
const KEY = "zing.bottraining.v1";
const loadRec = () => {
  let r = null;
  try { r = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  r = r || {};
  r.done = r.done || {}; r.lessons = r.lessons || {};
  if (!isDate(r.dailyStart)) r.dailyStart = isDate(LAUNCH) && dayDiff(miamiToday(), LAUNCH) >= 0 ? LAUNCH : miamiToday();
  return r;
};
const saveRec = r => { try { localStorage.setItem(KEY, JSON.stringify(r)); } catch (e) {} };
const startDateFor = rec => rec.dailyStart;
const streakFor = rec => {
  const c = rec.lessons || {};
  let s = 0, d = miamiToday();
  if (!c[d]) d = addDays(d, -1);
  while (c[d]) { s++; d = addDays(d, -1); }
  return s;
};

/* ---- contenido ---- */
const TRACKS = [
  { key: "ops", icon: "🔑", label: "Parte 1 · Cómo Operamos", blurb: "Qué pasa antes, durante y después de cada visita." },
  { key: "essentials", icon: "🧴", label: "Productos esenciales", blurb: "Los 5 productos que más daño hacen si se usan mal." },
  { key: "tasks", icon: "🧼", label: "Parte 2 · Manual de Limpieza", blurb: "Cómo se ejecuta cada tarea, paso a paso." }
];
const EXTRA = window.EXTRA_TRACKS || [];
const ALL_TRACKS = TRACKS.concat(EXTRA).map(tr => Object.assign({}, tr, { slug: slug(tr.label.split("·").pop()) }));
const trackOf = key => ALL_TRACKS.find(t => t.key === key) || {};

const opsMod = (c, i, track) => ({
  kind: "ops", track: track, id: c.id, n: i + 1, t: c.t, icon: c.icon, img: c.img,
  mins: c.mins || 4, lead: c.lead, blocks: c.blocks || [], quiz: c.quiz || []
});
const ALL_MODULES = [].concat(
  window.OPS.map((c, i) => opsMod(c, i, "ops")),
  ((window.PRODUCTS_TRACK || {}).modules || []).filter(c => c.core).map((c, i) => opsMod(c, i, "essentials")),
  window.SOPS.map((s, i) => ({ kind: "task", track: "tasks", id: s.id, n: i + 1, t: s.t.es, icon: s.icon, mins: 4, sop: s, quiz: window.TASK_QUIZ[s.id] || [] })),
  [].concat.apply([], EXTRA.map(tr => (tr.modules || []).filter(c => !c.core).map((c, i) => opsMod(c, i, tr.key))))
);
/* URL única por módulo: <vía>/<título sin acentos ni espacios> */
(() => {
  const seen = {};
  ALL_MODULES.forEach(m => {
    const base = trackOf(m.track).slug + "/" + (slug(m.t) || slug(m.id));
    let p = base, k = 2;
    while (seen[p]) p = base + k++;
    seen[p] = 1; m.path = p;
  });
})();
const SOP_PATH = {};
window.SOPS.forEach(s => { SOP_PATH[s.id] = "tareas/" + (slug(s.t.es) || slug(s.id)); });

/* Programa diario: una lección por día, mismo orden que v2. */
const modToDaily = (m, part) => ({
  kind: "module", id: "m:" + m.id, mod: m, part: part, emoji: m.kind === "ops" ? m.icon : null, icon: m.kind === "ops" ? null : m.icon,
  t: { es: m.t, en: m.t },
  qs: (m.quiz || []).map(q => ({ es: q.q, en: q.q, opts: q.opts.map(o => ({ es: o, en: o })), correct: q.a, why: { es: q.why, en: q.why } }))
});
const CORE = ["ops", "essentials", "tasks"];
const DAILY = [].concat(
  ALL_MODULES.filter(m => CORE.indexOf(m.track) < 0).map(m => modToDaily(m, trackOf(m.track).label || "")),
  LESSONS.map(l => ({ kind: "lesson", id: "l:" + l.id, lesson: l, part: "Manual de Limpieza", icon: l.icon, t: l.t, qs: [l.q] })),
  ALL_MODULES.filter(m => CORE.indexOf(m.track) >= 0).map(m => modToDaily(m, trackOf(m.track).label || ""))
).filter(it => it.qs.length);
const dailyFor = (rec, dateStr) => {
  const d = dayDiff(dateStr, startDateFor(rec));
  if (d < 0) return null;
  const it = DAILY[d % DAILY.length];
  return Object.assign({}, it, { dayN: d + 1, q: it.qs[Math.floor(d / DAILY.length) % it.qs.length] });
};
const doneIn = (rec, key) => ALL_MODULES.filter(m => m.track === key && rec.done[m.id]).length;

/* ───────────────────────── piezas comunes ───────────────────────── */

function Link({ to, go, className, children, style }) {
  return <a className={className} style={style} href={hrefFor(to)} onClick={e => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); go(to); }}>{children}</a>;
}

function UrlChip({ path }) {
  const [ok, setOk] = useState(false);
  const url = publicUrl(path);
  const copy = () => { try { navigator.clipboard.writeText(url); setOk(true); setTimeout(() => setOk(false), 1400); } catch (e) {} };
  return <div className="urlchip"><span style={{ flex: 1, minWidth: 0 }}>{url.replace(/^https:\/\/www\./, "")}</span><button onClick={copy}>{ok ? "Copiado" : "Copiar"}</button></div>;
}

function LangToggle({ lang, setLang, float }) {
  return (
    <div className={"lang" + (float ? " lang--float" : "")}>
      <button className={lang === "es" ? "on" : ""} onClick={() => setLang("es")}>ES</button>
      <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
    </div>
  );
}

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

/* ───────────────────────── panel (inicio) ───────────────────────── */

function TrackList({ tr, rec, go, initialOpen }) {
  const list = ALL_MODULES.filter(m => m.track === tr.key);
  const d = doneIn(rec, tr.key);
  const [open, setOpen] = useState(!!initialOpen);
  return (
    <div id={tr.slug}>
      <button className={"trackhd" + (open ? " trackhd--open" : "")} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="trackhd__ic">{tr.icon || "▤"}</span>
        <span className="trackhd__txt">
          <h4>{tr.label}</h4>
          <i>{list.length ? (d === list.length ? "Completado · " + list.length + " módulos" : d + " de " + list.length + " módulos") : tr.blurb}</i>
        </span>
        <span className="trackhd__chev">{open ? "▴" : "▾"}</span>
      </button>
      {!open ? null : list.length ? (
        <div className="mlist">
          {list.map(m => {
            const isDone = !!rec.done[m.id];
            return (
              <Link key={m.id} to={m.path} go={go} className={"mrow" + (isDone ? " mrow--done" : "")}>
                <span className="mrow__ic">
                  {m.img ? <img className="mrow__photo" src={m.img} alt="" /> : m.kind === "ops" ? <em style={{ fontStyle: "normal" }}>{m.icon}</em> : <img src={m.icon} alt="" />}
                </span>
                <span className="mrow__txt">
                  <b>{m.t}</b>
                  <i>{isDone ? "Completado" : m.mins + " min · " + m.quiz.length + (m.quiz.length === 1 ? " pregunta" : " preguntas")}</i>
                </span>
                <span className={"tick" + (isDone ? " tick--on" : "")}>{isDone ? "✓" : m.n}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="soon"><b>Contenido en preparación</b><span>{tr.blurb}</span></div>
      )}
    </div>
  );
}

function Home({ rec, go, openTrack }) {
  const today = miamiToday();
  const lessons = rec.lessons || {};
  const streak = streakFor(rec);
  const lessonsDone = Object.keys(lessons).length;
  const todayLesson = dailyFor(rec, today);
  const todayDone = !!lessons[today];
  const winStart = addDays(today, -(DAILY_WINDOW - 1));
  const winDays = Array.from({ length: DAILY_WINDOW }, (_, i) => addDays(winStart, i)).filter(ds => dayDiff(ds, startDateFor(rec)) >= 0);
  const cycleDone = winDays.filter(ds => lessons[ds]).length;
  const bodyRef = useRef(null);
  useEffect(() => {
    if (!openTrack || !bodyRef.current) return;
    const el = bodyRef.current.querySelector("#" + openTrack);
    if (el) bodyRef.current.scrollTop = el.offsetTop - 16;
  }, [openTrack]);
  return (
    <div className="screen screen--tabbed">
      <div className="home" ref={bodyRef}>
        <div className="topbar">
          <img src={LOGO} alt="Zing" />
          <Link to="indice" go={go} className="who">Índice de URLs</Link>
        </div>
        <div className="hello">Entrenamiento diario</div>
        <div className="pcard">
          <div className="pcard__top">
            <span className="pcard__lbl">Mi racha</span>
            <span className="daychip">{"🗓 " + fmtDate(today, "es").split(",")[0]}</span>
          </div>
          <div className="pcard__mid">
            <Ring pct={winDays.length ? Math.round((cycleDone / winDays.length) * 100) : 0} />
            <div className="pcard__txt">
              <div className="pcard__big"><b>{streak}</b><i>{streak === 1 ? "día seguido" : "días seguidos"}</i></div>
              <em>{"🔥 " + lessonsDone + (lessonsDone === 1 ? " lección completada" : " lecciones completadas")}</em>
              <span>{todayDone ? "La lección de hoy ya está hecha. Mañana hay otra." : "La lección de hoy toma 3 minutos."}</span>
            </div>
          </div>
          <div className="segs">{winDays.map(ds => <i key={ds} className={lessons[ds] ? "on" : ""}></i>)}</div>
        </div>
        <div className="nextcard">
          <div className="nextcard__lbl">{todayDone ? "Lección de hoy · completada" : "Lección de hoy"}</div>
          <h3>{todayLesson ? todayLesson.t.es : ""}</h3>
          <button className="btn btn--primary" onClick={() => go("hoy")}>{todayDone ? "Repasar la lección de hoy" : "Ver la lección de hoy · 3 min"}</button>
        </div>
        <div className="tracklbl" style={{ marginBottom: 4 }}><h4>Todo el entrenamiento</h4><span>{ALL_MODULES.length + " módulos"}</span></div>
        {ALL_TRACKS.map(tr => <TrackList key={tr.key + (openTrack === tr.slug ? ":o" : "")} tr={tr} rec={rec} go={go} initialOpen={openTrack === tr.slug} />)}
      </div>
    </div>
  );
}

/* Índice: todas las URLs, para cargarlas al bot. */
function Index({ go }) {
  const [ok, setOk] = useState(false);
  const groups = [
    { h: "Secciones", rows: [["Panel del entrenamiento diario", ""], ["Lección de hoy", "hoy"], ["Manual de tareas (buscador)", "tareas"], ["Pregúntale al manual", "preguntar"]] },
    { h: "Manual de tareas", rows: window.SOPS.map(s => [s.t.es, SOP_PATH[s.id]]) }
  ].concat(ALL_TRACKS.map(tr => ({ h: tr.label, rows: [["Toda la vía · " + tr.label, tr.slug]].concat(ALL_MODULES.filter(m => m.track === tr.key).map(m => [m.t, m.path])) })));
  const copyAll = () => {
    const txt = groups.map(g => "## " + g.h + "\n" + g.rows.map(r => r[0] + " — " + publicUrl(r[1])).join("\n")).join("\n\n");
    try { navigator.clipboard.writeText(txt); setOk(true); setTimeout(() => setOk(false), 1600); } catch (e) {}
  };
  return (
    <div className="screen screen--tabbed">
      <div className="tabpane">
        <div className="pane__hd">
          <h2>Índice de URLs</h2>
          <p>Cada sección, módulo y tarea tiene su propio enlace. El bot puede responder con cualquiera de estos.</p>
          <button className="btn btn--light" style={{ marginTop: 14, padding: 12 }} onClick={copyAll}>{ok ? "Copiado" : "Copiar todas las URLs"}</button>
        </div>
        <div className="pane__body">
          {groups.map(g => (
            <div className="idxgrp" key={g.h}>
              <h4>{g.h}</h4>
              {g.rows.map(r => <Link key={r[1]} to={r[1]} go={go} className="idxrow"><b>{r[0]}</b><i>{publicUrl(r[1]).replace(/^https:\/\/www\./, "")}</i></Link>)}
            </div>
          ))}
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
            return <button key={j} className={"ck" + (on ? " ck--on" : "")} onClick={() => toggle(key)}><span className="ck__box">✓</span><span>{x}</span></button>;
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
      {s.mistakes ? (<div><div className="sub">Errores frecuentes</div>{s.mistakes.map((m, i) => <div key={i} className="mist"><b>{m.t.es}</b><span>{m.r.es}</span></div>)}</div>) : null}
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

function ProductFigure({ mod }) {
  const [zoom, setZoom] = useState(false);
  useEffect(() => { if (!zoom) return; const k = e => { if (e.key === "Escape") setZoom(false); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [zoom]);
  if (!mod.img) return <div className="figure"><em>{mod.icon}</em></div>;
  return (
    <div>
      <button type="button" className="figure figure--photo" onClick={() => setZoom(true)} aria-label="Ver la etiqueta en grande">
        <img src={mod.img} alt="" />
        <span className="figure__hint">Toca para ver la etiqueta</span>
      </button>
      {zoom && (
        <div className="zoom" onClick={() => setZoom(false)} role="dialog" aria-label={mod.t}>
          <button type="button" className="zoom__close" aria-label="Cerrar">✕</button>
          <div className="zoom__scroll"><img src={mod.img.replace(/\.webp$/, "") + ".webp"} alt={mod.t} onClick={e => e.stopPropagation()} /></div>
          <div className="zoom__cap">{mod.t}<small>Pellizca para acercar · toca afuera para cerrar</small></div>
        </div>
      )}
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
  function pick(i) { if (picked === q.a) return; setPicked(i); if (i !== q.a) setWrong(w => w + 1); }
  function next() { if (qi + 1 < total) { setQi(qi + 1); setPicked(null); } else onPass({ wrong: wrong, questions: total }); }
  const tr = trackOf(mod.track);
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
            <div>
              {mod.kind === "ops" ? (
                <div>
                  <ProductFigure mod={mod} />
                  <div className="eyebrow">{tr.label + " · Módulo " + mod.n + " de " + ALL_MODULES.filter(m => m.track === mod.track).length}</div>
                  <h2>{mod.t}</h2>
                  <p className="lead">{mod.lead}</p>
                  <Blocks blocks={mod.blocks} checks={checks} toggle={k => setChecks(c => Object.assign({}, c, { [k]: !c[k] }))} />
                </div>
              ) : <TaskBody sop={mod.sop} />}
              <UrlChip path={mod.path} />
            </div>
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
                  return <button key={i} className={cls} onClick={() => pick(i)}><span className="opt__k">{"ABC"[i]}</span>{o}</button>;
                })}
              </div>
              {picked !== null ? (
                <div className={"verdict verdict--" + (picked === q.a ? "ok" : "no")}>
                  <b>{picked === q.a ? "Correcto" : "Todavía no"}</b>
                  {picked === q.a ? q.why : "Vuelve a leer y elige otra opción."}
                </div>
              ) : null}
              <div className="qdots">{mod.quiz.map((_, i) => <span key={i} className={"qdot" + (i < qi || (i === qi && picked === q.a) ? " qdot--on" : "")}></span>)}</div>
            </div>
          )}
        </div>
        <div className="read__foot">
          {phase === "read" ? (
            total ? <button className="btn btn--primary" onClick={() => setPhase("quiz")}>{total + " " + (total === 1 ? "pregunta" : "preguntas") + " para terminar →"}</button>
              : <button className="btn btn--primary" onClick={onExit}>Volver</button>
          ) : (
            <button className="btn btn--primary" disabled={picked !== q.a} onClick={next}>{qi + 1 < total ? "Siguiente pregunta" : "Terminar módulo"}</button>
          )}
        </div>
      </div>
    </div>
  );
}

function Confetti() {
  const cols = ["#C9D8C2", "#C8A86A", "#5F7A63", "#DCE6D4", "#284043"];
  return (
    <div className="confetti">
      {Array.from({ length: 26 }).map((_, i) => <i key={i} style={{ left: (i * 3.9 + (i % 3) * 4) % 100 + "%", background: cols[i % cols.length], animationDelay: (i % 9) * 0.13 + "s" }}></i>)}
    </div>
  );
}

function Done({ rec, mod, onNext, onHome }) {
  const list = ALL_MODULES.filter(m => m.track === mod.track);
  const i = list.indexOf(mod);
  const next = list[i + 1] || null;
  const trackDone = doneIn(rec, mod.track) === list.length;
  return (
    <div className="screen">
      <Confetti />
      <div className="fin">
        <div className="fin__badge">{trackDone ? "🏅" : "✓"}</div>
        <h2>{trackDone ? "Terminaste " + trackOf(mod.track).label.split("·").pop().trim() : "Módulo completado"}</h2>
        <p>{mod.t}</p>
        <div className="fin__stat">{"📈 " + doneIn(rec, mod.track) + " de " + list.length + " módulos de esta vía"}</div>
        {next ? <button className="btn btn--primary" onClick={() => onNext(next)}>{"Siguiente: " + next.t}</button>
          : <button className="btn btn--primary" onClick={onHome}>Volver al entrenamiento</button>}
        <button className="link" onClick={onHome} style={{ marginTop: 6 }}>Volver al panel</button>
      </div>
    </div>
  );
}

/* ───────────────────────── Hoy · lección diaria ───────────────────────── */

function Today({ rec, lang, setLang, viewDate, setViewDate, onStart }) {
  const t = T_UI[lang];
  const today = miamiToday();
  const done = rec.lessons || {};
  const start = startDateFor(rec);
  const lesson = dailyFor(rec, viewDate);
  const isDone = !!done[viewDate];
  const dayN = dayDiff(viewDate, start) + 1;
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
        <div className="hello">{lang === "es" ? "Lección del día" : "Today's lesson"}</div>
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
  function check() { setChecked(true); const correct = sel === q.correct; onDone(lesson, sel, correct, correct ? 1300 : 2600); }
  const eyebrow = t.lesson + " · " + t.day + " " + lesson.dayN + " · " + lesson.part;
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
                <div className="eyebrow">{eyebrow}</div>
                <h2>{lesson.t[lang]}</h2>
                <div className="sub">{t.objective}</div>
                <p>{lesson.lesson.intro[lang]}</p>
                <div className="sub">{t.stepsT}</div>
                <div>{lesson.lesson.steps.map((s, i) => <div className="step" key={i}><span className="step__n">{i + 1}</span><span>{s[lang]}</span></div>)}</div>
                <div className="sub">{t.tipT}</div>
                <div className="tipbox"><b>{"⚠ " + t.tipT}</b>{lesson.lesson.tip[lang]}</div>
              </div>
            ) : lesson.mod.kind === "ops" ? (
              <div>
                <ProductFigure mod={lesson.mod} />
                <div className="eyebrow">{eyebrow}</div>
                <h2>{lesson.mod.t}</h2>
                <p className="lead">{lesson.mod.lead}</p>
                <Blocks blocks={lesson.mod.blocks} checks={checks} toggle={k => setChecks(c => Object.assign({}, c, { [k]: !c[k] }))} />
                <UrlChip path={lesson.mod.path} />
              </div>
            ) : (
              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>{eyebrow}</div>
                <TaskBody sop={lesson.mod.sop} />
                <UrlChip path={lesson.mod.path} />
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
                  return <button key={i} className={cls} disabled={checked} onClick={() => setSel(i)}><span className="opt__k">{String.fromCharCode(65 + i)}</span>{o[lang]}</button>;
                })}
              </div>
              {checked ? <div className={"verdict " + (sel === q.correct ? "verdict--ok" : "verdict--no")}><b>{sel === q.correct ? "✓ " + t.correct : t.incorrect}</b>{q.why[lang]}</div> : null}
            </div>
          )}
        </div>
        <div className="read__foot">
          {phase === "read" ? <button className="btn btn--primary" onClick={() => setPhase("quiz")}>{t.continueT}</button>
            : <button className="btn btn--primary" disabled={sel === null || checked} onClick={check}>{t.check}</button>}
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
        <div style={{ width: "100%", maxWidth: 300 }}><button className="btn btn--primary" onClick={onBack}>{t.another}</button></div>
      </div>
    </div>
  );
}

const TABS = [
  { id: "", ic: "▤", es: "Panel", en: "Home" },
  { id: "hoy", ic: "◎", es: "Hoy", en: "Today" },
  { id: "tareas", ic: "⌕", es: "Tareas", en: "Tasks" },
  { id: "preguntar", ic: "✎", es: "Preguntar", en: "Ask" }
];

/* ─────────────────────────────────── app ─────────────────────────────────── */

function App() {
  const [rec, setRec] = useState(loadRec);
  const [route, setRoute] = useState(readRoute);
  const [flash, setFlash] = useState(null); /* pantalla de celebración tras terminar, ligada a la ruta actual */
  const [lang, setLang] = useState(() => { try { return localStorage.getItem("zing.bottraining.lang") || "es"; } catch (e) { return "es"; } });
  useEffect(() => { try { localStorage.setItem("zing.bottraining.lang", lang); } catch (e) {} }, [lang]);
  useEffect(() => { saveRec(rec); }, [rec]);
  useEffect(() => {
    const on = () => { setRoute(readRoute()); setFlash(null); };
    window.addEventListener(PATH_MODE ? "popstate" : "hashchange", on);
    return () => window.removeEventListener(PATH_MODE ? "popstate" : "hashchange", on);
  }, []);
  const go = (p, replace) => {
    setFlash(null);
    if (PATH_MODE) { history[replace ? "replaceState" : "pushState"](null, "", BASE + "/" + p); setRoute(readRoute()); }
    else if (replace) { history.replaceState(null, "", "#/" + p); setRoute(readRoute()); }
    else location.hash = "/" + p;
  };

  const [a, b, c] = route;
  const today = miamiToday();
  const validDate = d => isDate(d) && dayDiff(d, startDateFor(rec)) >= 0 && dayDiff(d, today) <= 0;

  let body, tab = null, title = "Entrenamiento diario";
  if (a === "hoy") {
    const viewDate = validDate(b) ? b : today;
    const wantsLesson = b === "leccion" || c === "leccion";
    if (wantsLesson && flash === "lesson") body = <LessonDone rec={rec} lang={lang} onBack={() => go("hoy")} />;
    else if (wantsLesson && dailyFor(rec, viewDate)) {
      title = dailyFor(rec, viewDate).t.es;
      body = <Lesson key={viewDate} rec={rec} lang={lang} viewDate={viewDate} onExit={() => go("hoy/" + viewDate)}
        onDone={(lesson, answer, correct, delay) => {
          setRec(r => Object.assign({}, r, { lessons: Object.assign({}, r.lessons, { [viewDate]: { lessonId: lesson.id, title: lesson.t.es, answer, correct, ts: new Date().toISOString() } }) }));
          setTimeout(() => setFlash("lesson"), delay);
        }} />;
    } else {
      tab = "hoy"; title = "Lección del día";
      body = <Today rec={rec} lang={lang} setLang={setLang} viewDate={viewDate} setViewDate={d => go("hoy/" + d, true)} onStart={() => go("hoy/" + viewDate + "/leccion")} />;
    }
  } else if (a === "tareas") {
    tab = "tareas";
    const sop = b ? window.SOPS.find(s => SOP_PATH[s.id] === "tareas/" + b) : null;
    title = sop ? sop.t.es : "Manual de tareas";
    body = <div className="screen screen--tabbed" key={"sops" + (b || "")}><window.SopsTab lang={lang} open={sop} onOpen={s => go(SOP_PATH[s.id])} onBack={() => go("tareas")} hrefFor={s => hrefFor(SOP_PATH[s.id])} /></div>;
  } else if (a === "preguntar") {
    tab = "preguntar"; title = "Pregúntale al manual";
    body = <div className="screen screen--tabbed" key="ask"><window.AskTab lang={lang} name="" /></div>;
  } else if (a === "indice") {
    title = "Índice de URLs";
    body = <Index go={go} />;
  } else {
    const tr = a ? ALL_TRACKS.find(t => t.slug === a) : null;
    const mod = tr && b ? ALL_MODULES.find(m => m.path === a + "/" + b) : null;
    if (mod) {
      title = mod.t;
      body = flash === "module"
        ? <Done rec={rec} mod={mod} onNext={n => go(n.path)} onHome={() => go(tr.slug)} />
        : <Module key={mod.id} mod={mod} onExit={() => go(tr.slug)} onPass={info => {
            setRec(r => Object.assign({}, r, { done: Object.assign({}, r.done, { [mod.id]: { track: mod.track, title: mod.t, ts: new Date().toISOString(), wrong: info.wrong, questions: info.questions } }) }));
            setFlash("module");
          }} />;
    } else {
      tab = "";
      if (tr) title = tr.label;
      body = <Home rec={rec} go={go} openTrack={tr ? tr.slug : null} />;
    }
  }
  useEffect(() => { document.title = "Zing · " + title; }, [title]);

  return (
    <div className="shell"><div className="app">
      {body}
      {tab === "tareas" || tab === "preguntar" ? <LangToggle lang={lang} setLang={setLang} float /> : null}
      {tab !== null || a === "indice" ? (
        <nav className="tabbar">
          {TABS.map(tb => (
            <a key={tb.id} href={hrefFor(tb.id)} className={"tabbtn" + (tab === tb.id ? " tabbtn--on" : "")} style={{ textDecoration: "none" }}
              onClick={e => { e.preventDefault(); go(tb.id); }}>
              <em>{tb.ic}</em>{lang === "es" ? tb.es : tb.en}
            </a>
          ))}
        </nav>
      ) : null}
    </div></div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
