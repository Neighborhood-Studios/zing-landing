/* Zing Training · daily lesson app */
const { useState, useEffect, useMemo } = React;
const LESSONS = window.LESSONS, NAMES = window.TRAINING_NAMES, UI = window.T_UI, LAUNCH = window.TRAINING_LAUNCH;

/* ---- Miami-time date helpers ---- */
const miamiToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date()); // YYYY-MM-DD
const dParse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const dayDiff = (a, b) => Math.round((dParse(a) - dParse(b)) / 86400000);
const addDays = (s, n) => { const d = dParse(s); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const fmtDate = (s, lang) => dParse(s).toLocaleDateString(lang === "es" ? "es-US" : "en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
const lessonIdxFor = (dateStr) => { const d = dayDiff(dateStr, LAUNCH); return d < 0 ? -1 : d % LESSONS.length; };

/* ---- storage (swap for real API — see README) ---- */
const DB_KEY = "zing.training.v1";
const loadDB = () => { try { return JSON.parse(localStorage.getItem(DB_KEY)) || {}; } catch (e) { return {}; } };
const saveDB = (db) => { try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) {} };
const recordCompletion = (name, dateStr, lesson, answerIdx, correct) => {
  const db = loadDB();
  db[name] = db[name] || { completions: {} };
  if (!db[name].completions[dateStr]) {
    db[name].completions[dateStr] = { lessonId: lesson.id, lessonTitle: lesson.t.es, answer: answerIdx, answerText: lesson.q.opts[answerIdx].es, correct, ts: new Date().toISOString() };
    saveDB(db);
  }
  return db;
};
const streakFor = (name, db) => {
  const c = (db[name] || {}).completions || {};
  let s = 0, d = miamiToday();
  if (!c[d]) d = addDays(d, -1); // today not done yet — streak counts up to yesterday
  while (c[d]) { s++; d = addDays(d, -1); }
  return s;
};

const F = ["#5F7A63", "#C99B4A", "#1F3A34", "#B2542F", "#DFE8DC"];
function Confetti() {
  const bits = useMemo(() => Array.from({ length: 26 }).map((_, i) => ({ l: Math.random() * 100, d: Math.random() * .9, c: F[i % F.length], r: .7 + Math.random() * .7 })), []);
  return <div className="confetti">{bits.map((b, i) => <i key={i} style={{ left: b.l + "%", background: b.c, animationDelay: b.d + "s", transform: `scale(${b.r})` }}></i>)}</div>;
}

function LangToggle({ lang, setLang }) {
  return (
    <div className="lang">
      <button className={lang === "es" ? "on" : ""} onClick={() => setLang("es")}>ES</button>
      <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
    </div>
  );
}

function App() {
  const [lang, setLang] = useState(() => { try { return localStorage.getItem("zing.training.lang") || "es"; } catch (e) { return "es"; } });
  const t = UI[lang];
  const [name, setName] = useState(() => { try { return localStorage.getItem("zing.training.name") || null; } catch (e) { return null; } });
  const [splash, setSplash] = useState(false);
  const [splashOut, setSplashOut] = useState(false);
  const today = miamiToday();
  const [viewDate, setViewDate] = useState(today);
  const [screen, setScreen] = useState("home"); // home | lesson | quiz | done
  const [dir, setDir] = useState("f");
  const [db, setDb] = useState(loadDB);
  const [sel, setSel] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => { try { localStorage.setItem("zing.training.lang", lang); } catch (e) {} }, [lang]);

  const li = lessonIdxFor(viewDate);
  const lesson = li >= 0 ? LESSONS[li] : null;
  const completions = ((db[name] || {}).completions) || {};
  const doneToday = !!completions[viewDate];
  const streak = name ? streakFor(name, db) : 0;
  const dayNumber = Math.min(dayDiff(viewDate, LAUNCH), LESSONS.length - 1) + 1;

  const pickName = (n) => {
    setName(n); try { localStorage.setItem("zing.training.name", n); } catch (e) {}
    setSplash(true); setSplashOut(false);
    setTimeout(() => setSplashOut(true), 1700);
    setTimeout(() => setSplash(false), 2250);
  };
  const switchName = () => { setName(null); try { localStorage.removeItem("zing.training.name"); } catch (e) {} setScreen("home"); };
  const nav = (s, d) => { setDir(d || "f"); setScreen(s); };
  const startLesson = () => { setSel(null); setChecked(false); nav("lesson", "f"); };
  const check = () => {
    setChecked(true);
    const correct = sel === lesson.q.correct;
    setDb(recordCompletion(name, viewDate, lesson, sel, correct));
    setTimeout(() => nav("done", "f"), correct ? 1300 : 2600);
  };
  const moveDay = (n) => {
    const nd = addDays(viewDate, n);
    if (dayDiff(nd, LAUNCH) < 0 || dayDiff(nd, today) > 0) return;
    setViewDate(nd); setScreen("home");
  };

  let body;
  if (!name) {
    body = (
      <div className="screen"><div className="wel">
        <img className="wel__logo" src="icons/zing-logo.svg" alt="Zing" />
        <h1 className="rise">{t.welcome}</h1>
        <p className="wel__sub rise" style={{ animationDelay: ".08s" }}>{t.welcomeSub}</p>
        <div className="names">
          {NAMES.map((n, i) => <button key={n} className="name" style={{ animationDelay: (.12 + i * .05) + "s" }} onClick={() => pickName(n)}>{n}</button>)}
        </div>
      </div></div>
    );
  } else if (screen === "home") {
    body = (
      <div className={"screen" + (dir === "b" ? " screen--back" : "")}><div className="home">
        <div className="top"><img src="icons/zing-logo.svg" alt="Zing" /></div>
        <div className="hello">{lang === "es" ? `Hola, ${name}` : `Hi, ${name}`}</div>
        <span className="streakchip">🔥 {streak} {t.streak}</span>
        <div className="datebar">
          <div>
            <h2>{dayDiff(viewDate, today) === 0 ? t.today : fmtDate(viewDate, lang).split(",")[0]}</h2>
            <div className="sub">{fmtDate(viewDate, lang)} · {t.day} {dayNumber}</div>
          </div>
          <div className="arrows">
            <button className="arrow" disabled={dayDiff(viewDate, LAUNCH) <= 0} onClick={() => moveDay(-1)} aria-label="prev">←</button>
            <button className="arrow" disabled={dayDiff(viewDate, today) >= 0} onClick={() => moveDay(1)} aria-label="next">→</button>
          </div>
        </div>
        {lesson && (
          <div className="lcard rise" style={{ animationDelay: ".1s" }} key={viewDate}>
            {doneToday && <span className="lcard__done pop">✓</span>}
            <span className="lcard__tag">{t.lesson}</span>
            <img className="lcard__icon" src={lesson.icon} alt="" />
            <h3>{lesson.t[lang]}</h3>
            <div className="lcard__meta"><span>⏱ 3 {t.minutes}</span><span>·</span><span>{doneToday ? t.completed : t.pending}</span></div>
            <button className="btn btn--primary" onClick={startLesson}>{doneToday ? t.review : t.start}</button>
          </div>
        )}
        <div className="days">
          {LESSONS.map((_, i) => {
            const dstr = addDays(LAUNCH, i);
            const isFuture = dayDiff(dstr, today) > 0;
            const isDone = !!completions[dstr];
            return <span key={i} className={"dayp" + (isDone ? " dayp--done" : "") + (dstr === viewDate ? " dayp--today" : "")} style={{ opacity: isFuture ? .35 : 1 }} onClick={() => !isFuture && setViewDate(dstr)}>{isDone ? "✓" : i + 1}</span>;
          })}
        </div>
        <div className="progresslbl">{t.progress}: {Object.keys(completions).length}/{LESSONS.length}</div>
        <div className="switch"><button onClick={switchName}>{t.change}</button></div>
      </div></div>
    );
  } else if (screen === "lesson") {
    body = (
      <div className="screen"><div className="les">
        <div className="les__hd">
          <button className="arrow" onClick={() => nav("home", "b")}>←</button>
          <div className="pbar"><i style={{ width: "45%" }}></i></div>
        </div>
        <div className="les__body">
          <h2 className="rise">{lesson.t[lang]}</h2>
          <div className="figure rise" style={{ animationDelay: ".08s" }}><img src={lesson.icon} alt="" /></div>
          <div className="sec">{t.objective}</div>
          <p className="rise" style={{ animationDelay: ".12s" }}>{lesson.intro[lang]}</p>
          <div className="sec">{t.stepsT}</div>
          <div>
            {lesson.steps.map((s, i) => (
              <div className="step rise" key={i} style={{ animationDelay: (.16 + i * .05) + "s" }}>
                <span className="step__n">{i + 1}</span><span>{s[lang]}</span>
              </div>
            ))}
          </div>
          <div className="sec">{t.tipT}</div>
          <div className="tipbox rise"><b>⚠ {t.tipT}</b>{lesson.tip[lang]}</div>
        </div>
        <div className="les__foot"><button className="btn btn--primary" onClick={() => nav("quiz", "f")}>{t.continueT}</button></div>
      </div></div>
    );
  } else if (screen === "quiz") {
    const q = lesson.q;
    body = (
      <div className="screen"><div className="les">
        <div className="les__hd">
          <button className="arrow" onClick={() => nav("lesson", "b")}>←</button>
          <div className="pbar"><i style={{ width: "85%" }}></i></div>
        </div>
        <div className="les__body">
          <div className="sec" style={{ marginTop: 8 }}>{t.quizT}</div>
          <h2 className="rise">{q[lang]}</h2>
          <div style={{ marginTop: 20 }}>
            {q.opts.map((o, i) => {
              let cls = "opt";
              if (checked) { if (i === q.correct) cls += " opt--right"; else if (i === sel) cls += " opt--wrong"; }
              else if (i === sel) cls += " opt--sel";
              return <button key={i} className={cls + " rise"} style={{ animationDelay: (.1 + i * .06) + "s" }} disabled={checked} onClick={() => setSel(i)}>
                <span className="opt__k">{String.fromCharCode(65 + i)}</span>{o[lang]}
              </button>;
            })}
          </div>
          {checked && (
            <div className={"verdict " + (sel === q.correct ? "verdict--ok" : "verdict--no")}>
              <b>{sel === q.correct ? "✓ " + t.correct : t.incorrect}</b>{q.why[lang]}
            </div>
          )}
        </div>
        <div className="les__foot"><button className="btn btn--primary" disabled={sel == null || checked} onClick={check}>{t.check}</button></div>
      </div></div>
    );
  } else {
    body = (
      <div className="screen"><div className="fin">
        <Confetti />
        <div className="fin__ringwrap"><span className="fin__ring"></span><div className="fin__badge">🎉</div></div>
        <h2>{t.done}</h2>
        <p>{t.doneSub}</p>
        <span className="streakchip pop" style={{ animationDelay: ".4s" }}>🔥 {streakFor(name, loadDB())} {t.streak}</span>
        <div style={{ width: "100%", maxWidth: 300, marginTop: 28 }}>
          <button className="btn btn--primary" onClick={() => nav("home", "b")}>{t.another}</button>
        </div>
      </div></div>
    );
  }

  const female = name && name !== "Alvaro";
  return (
    <div className="shell"><div className="app">
      <LangToggle lang={lang} setLang={setLang} />
      {body}
      {splash && name && (
        <div className={"splash" + (splashOut ? " splash--out" : "")}>
          <h2>{female ? t.welcomeBack : t.welcomeBackM}, {name}{lang === "es" ? " 🧽" : "! 🧽"}</h2>
          <div className="flame">🔥</div>
          <div className="streakN">{streakFor(name, db)} {t.streak}</div>
        </div>
      )}
    </div></div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
