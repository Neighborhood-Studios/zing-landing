/* Zing Training · Ask tab — curated answers from window.QA, AI fallback grounded in window.SOPS */
const ASK_UI = {
  es:{ title:"Pregúntale al manual", sub:"Describe tu situación y te digo qué hacer según el manual",
       ph:"Ej: apliqué producto al azulejo y la mancha sigue…", send:"Preguntar", thinking:"Buscando en el manual…",
       common:"Preguntas comunes", answer:"Según el manual", sop:"Ver la tarea completa",
       office:"Escribir a la oficina", again:"Otra pregunta",
       nores:["No encontré esto en el manual.","Cuando el manual no cubre una situación, la regla es no improvisar: escribe a la oficina antes de actuar y sigue con las otras tareas del servicio."],
       err:"No pude consultar el manual en este momento. Escribe a la oficina con tu pregunta.",
       ask:"Confirma con la oficina antes de hacerlo", out:"Fuera del alcance del servicio" },
  en:{ title:"Ask the manual", sub:"Describe your situation and I'll tell you what the manual says",
       ph:"E.g. I applied product to the tile and the stain is still there…", send:"Ask", thinking:"Searching the manual…",
       common:"Common questions", answer:"According to the manual", sop:"See the full task",
       office:"Message the office", again:"Ask another",
       nores:["I couldn't find this in the manual.","When the manual doesn't cover a situation, the rule is not to improvise: message the office before acting and continue with the other service tasks."],
       err:"I couldn't reach the manual right now. Message the office with your question.",
       ask:"Confirm with the office before doing it", out:"Outside the service scope" }
};

function matchQA(q, lang) {
  const n = window.sopNorm(q);
  const terms = n.split(/\s+/).filter((t) => t.length > 3);
  if (!terms.length) return null;
  let best = null, bestN = 0;
  window.QA.forEach((item) => {
    const hay = window.sopNorm(item.kw.join(" ") + " " + item.q.es + " " + item.q.en);
    let s = 0;
    item.kw.forEach((k) => { if (n.includes(window.sopNorm(k))) s += 3; });
    terms.forEach((t) => { if (hay.includes(t)) s += 1; });
    if (s > bestN) { bestN = s; best = item; }
  });
  return bestN >= 4 ? best : null;
}

/* AI fallback. In preview this uses window.claude.complete; in production point API_HOOK
   at your own endpoint that proxies the model with the same prompt (never ship an API key). */
const API_HOOK = "/api/training/ask";
async function askAI(question, lang) {
  const ranked = window.SOPS.map((s) => ({ s, n: window.searchSops(question, lang).indexOf(s) })).filter((x) => x.n >= 0);
  const ctx = (ranked.length ? ranked.slice(0, 3).map((x) => x.s) : window.SOPS.slice(0, 4)).map((s) =>
    `### ${s.t.es} / ${s.t.en}\nObjetivo: ${s.goal.es}\nPasos: ${s.steps.map((st, i) => `${i + 1}. ${st.t.es} — ${st.d.es.join(" ")}`).join("\n")}\nErrores frecuentes: ${s.mistakes.map((m) => `${m.t.es} (${m.r.es})`).join("; ")}` +
    (s.scope ? `\nIncluye: ${s.scope.inc.es.join(", ")}\nNo incluye: ${s.scope.exc.es.join(", ")}` : "")).join("\n\n");
  const prompt = `Eres el asistente de entrenamiento de Zing, una empresa de limpieza residencial en Miami. Respondes SOLO con base en el Manual de Limpieza de Zing. Fragmentos relevantes del manual:\n\n${ctx}\n\nPregunta de la limpiadora: "${question}"\n\nReglas:\n- Responde en ${lang === "es" ? "español" : "inglés"}, en segunda persona, claro y directo, como una supervisora experimentada.\n- 3 a 5 puntos accionables, cada uno una frase o dos.\n- Si la tarea está fuera del alcance del servicio o requiere autorización, dilo explícitamente y di que escriba a la oficina.\n- No inventes productos, tiempos ni políticas que no estén en los fragmentos.\n- Si el manual no cubre la situación, dilo y recomienda escribir a la oficina.\nResponde SOLO con JSON: {"verdict":"in"|"out"|"ask"|null,"points":["…","…"]}`;
  let raw;
  if (window.claude && window.claude.complete) raw = await window.claude.complete(prompt);
  else {
    const r = await fetch(API_HOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, lang, prompt }) });
    if (!r.ok) throw new Error("hook " + r.status);
    raw = (await r.json()).text || "";
  }
  const m = String(raw).match(/\{[\s\S]*\}/);
  const parsed = m ? JSON.parse(m[0]) : null;
  if (!parsed || !Array.isArray(parsed.points)) throw new Error("shape");
  return { verdict: parsed.verdict || null, points: parsed.points, ai: true };
}

function officeLink(question, lang, name) {
  const o = window.ZING_OFFICE || {};
  const txt = (lang === "es"
    ? `Hola, soy ${name || "una limpiadora"} de Zing. Estoy en un servicio y tengo una duda: ${question}`
    : `Hi, this is ${name || "a Zing cleaner"}. I'm on a job and I have a question: ${question}`);
  const num = (o.whatsapp || "").replace(/[^0-9]/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(txt)}`;
}

function AskTab({ lang, name }) {
  const u = ASK_UI[lang];
  const [q, setQ] = React.useState("");
  const [asked, setAsked] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [ans, setAns] = React.useState(null);

  const suggestions = React.useMemo(() => window.QA.slice(0, 6).map((i) => ({ id: i.id, t: i.q[lang] })), [lang]);

  const run = async (text) => {
    const question = (text || q).trim();
    if (!question) return;
    setAsked(question); setBusy(true); setAns(null);
    const hit = matchQA(question, lang);
    if (hit) {
      setAns({ verdict: hit.verdict, points: hit.a[lang], sop: hit.sop, curated: true });
      setBusy(false); return;
    }
    try { setAns(await askAI(question, lang)); }
    catch (e) { setAns({ verdict: "ask", points: u.nores, fallback: true }); }
    setBusy(false);
  };

  const reset = () => { setAns(null); setAsked(""); setQ(""); };
  const sop = ans && ans.sop ? window.SOPS.find((s) => s.id === ans.sop) : null;
  const [openSop, setOpenSop] = React.useState(null);
  if (openSop) return <window.SopDetail sop={openSop} lang={lang} onBack={() => setOpenSop(null)} />;

  return (
    <div className="tabpane">
      <div className="pane__hd">
        <h2>{u.title}</h2>
        <p>{u.sub}</p>
        <div className="askbox">
          <textarea value={q} rows={2} onChange={(e) => setQ(e.target.value)} placeholder={u.ph}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); run(); } }} />
          <button className="btn btn--primary askbox__go" disabled={!q.trim() || busy} onClick={() => run()}>{busy ? u.thinking : u.send}</button>
        </div>
      </div>
      <div className="pane__body">
        {!ans && !busy && (
          <>
            <div className="listlbl">{u.common}</div>
            <div className="qchips">
              {suggestions.map((s) => <button key={s.id} className="qchip" onClick={() => { setQ(s.t); run(s.t); }}>{s.t}</button>)}
            </div>
          </>
        )}
        {busy && <div className="thinking"><i></i><i></i><i></i><span>{u.thinking}</span></div>}
        {ans && (
          <div className="ansbox rise">
            <div className="ansbox__q">{asked}</div>
            {(ans.verdict === "ask" || ans.verdict === "out") &&
              <div className={"vflag " + (ans.verdict === "out" ? "vflag--out" : "vflag--ask")}>{ans.verdict === "out" ? u.out : u.ask}</div>}
            <div className="sec">{u.answer}</div>
            <ol className="anslist">{ans.points.map((p, i) => <li key={i}>{p}</li>)}</ol>
            {sop && <button className="btn btn--ghost anslink" onClick={() => setOpenSop(sop)}>{u.sop}: {sop.t[lang]} →</button>}
            <a className="btn btn--primary officebtn" href={officeLink(asked, lang, name)} target="_blank" rel="noopener">{u.office}</a>
            <button className="againbtn" onClick={reset}>{u.again}</button>
            <div className="srcline">{ans.ai ? (lang === "es" ? "Respuesta basada en el Manual de Limpieza Zing" : "Answer based on the Zing Cleaning Manual") : SOP_UI[lang].src}</div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { AskTab, ASK_UI, matchQA, askAI, officeLink });
