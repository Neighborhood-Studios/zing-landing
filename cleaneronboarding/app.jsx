/* Zing Onboarding · app
   Vía 1 "Cómo Operamos" (ops.js) + Vía 2 "Manual de Limpieza" (sops.js + quiz.js).
   Identidad y progreso vía store.js (localStorage + Google Sheets opcional). */

const { useState, useEffect, useRef } = React;
const LOGO = "icons/zing-logo.svg";

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
const TOTAL = MODULES.length;

const TRACKS = [
  { key: "ops", label: "Parte 1 · Cómo Operamos", blurb: "Qué pasa antes, durante y después de cada visita." },
  { key: "tasks", label: "Parte 2 · Manual de Limpieza", blurb: "Cómo se ejecuta cada tarea, paso a paso." }
];

const doneCount = (rec, track) =>
  MODULES.filter(m => (!track || m.track === track) && rec.done[m.id]).length;

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

function Home({ rec, onOpen, onOut, onCert }) {
  const done = doneCount(rec);
  const pct = Math.round((done / TOTAL) * 100);
  const day = Store.dayOfPlan(rec);
  const nextMod = MODULES.find(m => !rec.done[m.id]);
  const left = TOTAL - done;
  const daysLeft = Math.max(1, Store.PLAN_DAYS - day + 1);
  const badges = [
    { on: done >= 1, ic: "🌱", t: "Primer módulo" },
    { on: doneCount(rec, "ops") === OPS_N, ic: "🔑", t: "Cómo Operamos" },
    { on: done >= Math.ceil(TOTAL / 2), ic: "⛰", t: "Mitad del camino" },
    { on: doneCount(rec, "tasks") === TASKS_N, ic: "🧼", t: "Manual completo" },
    { on: done === TOTAL, ic: "🏅", t: "Certificada" }
  ];
  return (
    <div className="screen">
      <div className="home">
        <div className="topbar">
          <img src={LOGO} alt="Zing" />
          <span className="who">{Store.prettyPhone(rec.phone)}</span>
        </div>
        <div className="hello">{"Hola, " + firstName(rec.name)}</div>

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
              <span>{done === TOTAL
                ? "Terminaste todo el entrenamiento."
                : "Faltan " + left + " · quedan " + daysLeft + (daysLeft === 1 ? " día" : " días")}</span>
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

        {nextMod ? (
          <div className="nextcard">
            <div className="nextcard__lbl">{done === 0 ? "Empieza aquí" : "Continúa aquí"}</div>
            <h3>{nextMod.t}</h3>
            <button className="btn btn--primary" onClick={() => onOpen(nextMod.id)}>
              {(done === 0 ? "Comenzar" : "Continuar") + " · " + nextMod.mins + " min"}
            </button>
          </div>
        ) : (
          <div className="nextcard">
            <div className="nextcard__lbl">Completado</div>
            <h3>Tu certificado está listo</h3>
            <button className="btn btn--primary" onClick={onCert}>Ver mi certificado</button>
          </div>
        )}

        {TRACKS.map(tr => {
          const list = MODULES.filter(m => m.track === tr.key);
          const d = doneCount(rec, tr.key);
          return (
            <div key={tr.key}>
              <div className="tracklbl">
                <h4>{tr.label}</h4>
                <span>{d + "/" + list.length}</span>
              </div>
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
            </div>
          );
        })}

        <div className="tracklbl"><h4>Logros</h4></div>
        <div className="badges">
          {badges.map(b => (
            <div key={b.t} className={"badge" + (b.on ? "" : " badge--off")}><em>{b.ic}</em>{b.t}</div>
          ))}
        </div>

        <div className="homefoot"><button className="link" onClick={onOut}>Salir de mi sesión</button></div>
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
  const trackDone = doneCount(rec, mod.track) === (mod.track === "ops" ? OPS_N : TASKS_N);
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
        ) : (
          <button className="btn btn--primary" onClick={onHome}>Ver mi certificado</button>
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

/* ─────────────────────────────────── app ─────────────────────────────────── */

function App() {
  const [rec, setRec] = useState(() => {
    const p = Store.activePhone();
    return p ? Store.get(p) : null;
  });
  const [view, setView] = useState(() => (Store.activePhone() && Store.get(Store.activePhone()) ? "home" : "welcome"));
  const [modId, setModId] = useState(null);
  const mod = MODULES.find(m => m.id === modId) || null;

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
    if (doneCount(updated) === TOTAL) Store.certify(rec.phone, TOTAL);
    setView("done");
  }
  function nextModule() {
    const n = MODULES.find(m => !rec.done[m.id]);
    if (n) open(n.id); else setView("cert");
  }

  if (view === "welcome") return <Welcome onStart={() => setView("signup")} onResume={() => setView("resume")} />;
  if (view === "signup") return <SignUp onBack={() => setView("welcome")} onDone={enter} />;
  if (view === "resume") return <ResumeIn onBack={() => setView("welcome")} onDone={enter} />;
  if (view === "module" && mod) return <Module mod={mod} onExit={() => setView("home")} onPass={pass} />;
  if (view === "done" && mod) return <Done rec={rec} mod={mod} onNext={nextModule} onHome={() => setView(doneCount(rec) === TOTAL ? "cert" : "home")} />;
  if (view === "cert") return <Certificate rec={rec} onHome={() => setView("home")} />;
  return <Home rec={rec} onOpen={open} onCert={() => setView("cert")} onOut={() => { Store.signOut(); setRec(null); setView("welcome"); }} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="shell"><div className="app"><App /></div></div>
);
