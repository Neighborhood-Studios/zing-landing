/* Zing Training · SOPs tab — keyword search over window.SOPS + full procedure view */
const SOP_UI = {
  es:{ title:"Manual de tareas", sub:"Busca la tarea que estás haciendo", ph:"Buscar: baño, grasa, ventanas…",
       none:"Sin resultados. Prueba con otra palabra: baño, cocina, piso, ropa, horno.", all:"Todas las tareas",
       goal:"Cómo se ve terminado", tools:"Equipo necesario", flow:"Flujo correcto", steps:"Paso a paso",
       mistakes:"Errores frecuentes", check:"Revisión final", scope:"Alcance del servicio",
       inc:"Incluye", exc:"No incluye", time:"Tiempo", res:"Resultado", src:"Manual de Limpieza Zing", back:"Volver" },
  en:{ title:"Task manual", sub:"Find the task you're working on", ph:"Search: bathroom, grease, windows…",
       none:"No results. Try another word: bathroom, kitchen, floor, laundry, oven.", all:"All tasks",
       goal:"What done looks like", tools:"Equipment needed", flow:"Correct flow", steps:"Step by step",
       mistakes:"Common mistakes", check:"Final check", scope:"Service scope",
       inc:"Included", exc:"Not included", time:"Time", res:"Result", src:"Zing Cleaning Manual", back:"Back" }
};

const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function scoreSop(sop, q, lang) {
  const terms = norm(q).split(/\s+/).filter((t) => t.length > 2);
  if (!terms.length) return 0;
  const hay = norm([sop.t.es, sop.t.en, sop.kw.join(" "), sop.goal.es, sop.goal.en].join(" "));
  const title = norm(sop.t[lang] + " " + sop.t.es + " " + sop.t.en);
  let s = 0;
  terms.forEach((t) => { if (title.includes(t)) s += 6; else if (hay.includes(t)) s += 2; });
  return s;
}
window.searchSops = (q, lang) => {
  const hits = window.SOPS.map((s) => ({ s, n: scoreSop(s, q, lang) })).filter((x) => x.n > 0);
  hits.sort((a, b) => b.n - a.n);
  return hits.map((x) => x.s);
};

function SopDetail({ sop, lang, onBack }) {
  const u = SOP_UI[lang];
  return (
    <div className="sopd">
      <div className="sopd__hd">
        <button className="arrow" onClick={onBack} aria-label={u.back}>←</button>
        <span className="sopd__cat">{sop.cat[lang]}</span>
      </div>
      <div className="sopd__body">
        <div className="sopd__hero"><img src={sop.icon} alt="" /></div>
        <h2>{sop.t[lang]}</h2>
        <div className="sopd__time">⏱ {sop.time[lang]}</div>
        <div className="sec">{u.goal}</div>
        <p>{sop.goal[lang]}</p>
        {sop.flow && <><div className="sec">{u.flow}</div>
          <ol className="flowlist">{sop.flow[lang].map((f, i) => <li key={i}>{f}</li>)}</ol></>}
        <div className="sec">{u.tools}</div>
        <ul className="bullets">{sop.tools[lang].map((x, i) => <li key={i}>{x}</li>)}</ul>
        <div className="sec">{u.steps}</div>
        {sop.steps.map((st, i) => (
          <div className="sstep" key={i}>
            <div className="sstep__hd"><span className="step__n">{i + 1}</span><b>{st.t[lang]}</b></div>
            <ul className="bullets">{st.d[lang].map((d, j) => <li key={j}>{d}</li>)}</ul>
          </div>
        ))}
        <div className="sec">{u.mistakes}</div>
        {sop.mistakes.map((m, i) => (
          <div className="mist" key={i}><b>{m.t[lang]}</b><span>{m.r[lang]}</span></div>
        ))}
        {sop.check && <><div className="sec">{u.check}</div>
          <ul className="checks">{sop.check[lang].map((c, i) => <li key={i}>{c}</li>)}</ul></>}
        {sop.scope && <><div className="sec">{u.scope}</div>
          <div className="scope">
            <div className="scope__col"><span className="scope__h scope__h--in">✓ {u.inc}</span>
              <ul>{sop.scope.inc[lang].map((x, i) => <li key={i}>{x}</li>)}</ul></div>
            <div className="scope__col"><span className="scope__h scope__h--out">✕ {u.exc}</span>
              <ul>{sop.scope.exc[lang].map((x, i) => <li key={i}>{x}</li>)}</ul></div>
          </div></>}
        <div className="srcline">{u.src}</div>
      </div>
    </div>
  );
}

function SopsTab({ lang }) {
  const u = SOP_UI[lang];
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(null);
  const list = q.trim() ? window.searchSops(q, lang) : window.SOPS;
  if (open) return <SopDetail sop={open} lang={lang} onBack={() => setOpen(null)} />;
  return (
    <div className="tabpane">
      <div className="pane__hd">
        <h2>{u.title}</h2>
        <p>{u.sub}</p>
        <div className="search">
          <span className="search__i">⌕</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={u.ph} />
          {q && <button className="search__x" onClick={() => setQ("")} aria-label="clear">✕</button>}
        </div>
      </div>
      <div className="pane__body">
        <div className="listlbl">{q.trim() ? `${list.length} ${list.length === 1 ? (lang === "es" ? "resultado" : "result") : (lang === "es" ? "resultados" : "results")}` : u.all}</div>
        {list.length === 0 && <p className="empty">{u.none}</p>}
        <div className="soplist">
          {list.map((s, i) => (
            <button className="sopitem" key={s.id} style={{ animationDelay: Math.min(i * .03, .3) + "s" }} onClick={() => setOpen(s)}>
              <img src={s.icon} alt="" />
              <span className="sopitem__txt"><b>{s.t[lang]}</b><i>{s.cat[lang]} · {s.steps.length} {lang === "es" ? "pasos" : "steps"}</i></span>
              <span className="sopitem__go">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SopsTab, SopDetail, SOP_UI, sopNorm: norm });
