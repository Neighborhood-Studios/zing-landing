/* Zing Neighbors App: Chat. The group thread (read by the AI) and private chats (never read by the AI).
   Voice notes, photos and videos, contacts, reactions, replies, @mentions and the member list. */
const { useState: cS, useEffect: cE, useRef: cR, useMemo: cM } = React;
const TOPIC_TAG = { suppliers: 'Suppliers', events: 'Events', problems: 'Building problem', ignore: 'Ignored' };
const REACTS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
const CI = {
  mic: <g><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" /></g>,
  clip: <path d="M20 11.5l-7.8 7.8a5 5 0 0 1-7.1-7.1l8.2-8.2a3.3 3.3 0 0 1 4.7 4.7l-8.2 8.2a1.7 1.7 0 0 1-2.4-2.4l7.4-7.4" />,
  img: <g><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.8" /><path d="M20.5 16l-5-5-9 8.5" /></g>,
  contact: <g><rect x="4" y="3.5" width="16" height="17" rx="2" /><circle cx="12" cy="10" r="2.8" /><path d="M7.5 17c.7-2 2.4-3.2 4.5-3.2s3.8 1.2 4.5 3.2" /></g>,
  back: <path d="M15 5l-7 7 7 7" />,
  reply: <path d="M10 8L5 12.5 10 17M5.5 12.5H14a5 5 0 0 1 5 5V19" />,
  copy: <g><rect x="8.5" y="8.5" width="11" height="11" rx="2" /><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" /></g>,
  lock: <g><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></g>,
  play: <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />,
  pause: <g fill="currentColor" stroke="none"><rect x="6.5" y="5" width="4" height="14" rx="1" /><rect x="13.5" y="5" width="4" height="14" rx="1" /></g>,
  trash: <path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13" />,
  down: <path d="M7 10l5 5 5-5" />,
  x: <path d="M6 6l12 12M18 6L6 18" />
};
const fmtDur = s => { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const firstName = n => String(n || '').split(' · ')[0];
const whoLabel = n => n === 'You' ? 'You' : firstName(n);
const attLabel = m => m.type === 'image' ? 'Photo' : m.type === 'video' ? 'Video' : m.type === 'voice' ? 'Voice message' + (m.dur ? ' (' + fmtDur(m.dur) + ')' : '') : m.type === 'contact' && m.contact ? 'Contact: ' + m.contact.name : '';
const preview = m => !m ? '' : m.text ? (attLabel(m) ? attLabel(m) + ' · ' : '') + m.text : attLabel(m) || m.title || m.body || '';
const squash = (a, n) => { if (!a.length) return []; const out = []; for (let i = 0; i < n; i++) { const lo = Math.floor(i * a.length / n), hi = Math.max(Math.floor((i + 1) * a.length / n), lo + 1); out.push(Math.min(1, .15 + Math.max(...a.slice(lo, hi)) * 1.6)); } return out; };

function zMembers(feed){
  const m = {};
  feed.forEach(x => { if (!x.from || x.kind || x.desk || x.from === 'You' || /^Neighbors (AI|app)$/.test(x.from)) return;
    const r = m[x.from] || (m[x.from] = { key: x.from, name: firstName(x.from), unit: String(x.from).split(' · ')[1] || '', n: 0, last: 0 });
    r.n++; r.last = Math.max(r.last, +(x.d || x.ts) || 0); });
  return Object.values(m).sort((a, b) => b.last - a.last);
}

function useMediaUrl(id){
  const [u, setU] = cS(() => window.ZMedia.cached(id));
  cE(() => { let ok = true; if (id && !u) window.ZMedia.url(id).then(x => { if (ok) setU(x); }); return () => { ok = false; }; }, [id]);
  return u;
}
const prepFile = f => new Promise(res => {
  const u = URL.createObjectURL(f);
  if (f.type.startsWith('video')) { const v = document.createElement('video'); v.preload = 'metadata'; v.onloadedmetadata = () => res({ type: 'video', blob: f, w: v.videoWidth, h: v.videoHeight, dur: v.duration }); v.onerror = () => res({ type: 'video', blob: f }); v.src = u; return; }
  const img = new Image();
  img.onload = () => { if (/gif$/i.test(f.type)) return res({ type: 'image', blob: f, w: img.width, h: img.height });
    const k = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); c.toBlob(b => res({ type: 'image', blob: b || f, w: c.width, h: c.height }), 'image/jpeg', .85); };
  img.onerror = () => res(null); img.src = u;
});

/* renders a sheet at the phone-screen level from inside the composer */
function Over({ children }){
  const r = cR(null), [el, setEl] = cS(null);
  cE(() => { setEl(r.current && r.current.closest('.screen')); }, []);
  return <span ref={r} style={{ display: 'none' }}>{el && ReactDOM.createPortal(children, el)}</span>;
}

function RichText({ text, names }){
  if (!text) return null;
  const list = ['AI', ...names].filter(Boolean).sort((a, b) => b.length - a.length).map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp('@(' + list.join('|') + ')(?![\\w])', 'g'), out = []; let i = 0, m;
  while ((m = re.exec(text))) { if (m.index > i) out.push(text.slice(i, m.index)); out.push(<b key={m.index} className="mn">{m[0]}</b>); i = m.index + m[0].length; }
  out.push(text.slice(i)); return out;
}

function MediaImg({ m, onOpen }){
  const u = useMediaUrl(m.media);
  return <button className="bimg" onClick={() => u && onOpen(m)} aria-label="Open photo" style={{ aspectRatio: m.w && m.h ? m.w + ' / ' + m.h : '4 / 3' }}>{u ? <img src={u} alt={m.text || 'Photo'} /> : <i></i>}</button>;
}
function MediaVid({ m }){
  const u = useMediaUrl(m.media);
  return <div className="bimg" style={{ aspectRatio: m.w && m.h ? m.w + ' / ' + m.h : '16 / 9' }}>{u ? <video src={u} controls playsInline preload="metadata"></video> : <i></i>}</div>;
}
function Voice({ m }){
  const u = useMediaUrl(m.media), a = cR(null), [p, setP] = cS(0), [on, setOn] = cS(false), [cur, setCur] = cS(0);
  const wave = m.wave && m.wave.length ? m.wave : Array.from({ length: 32 }, (_, i) => .3 + .6 * Math.abs(Math.sin(i * 1.7 + String(m.id).length)));
  const len = () => { const el = a.current; return el && isFinite(el.duration) && el.duration > 0 ? el.duration : m.dur || 1; };
  return <div className="vn">
    <button className="vnp" onClick={() => { const el = a.current; if (el) el.paused ? el.play() : el.pause(); }} aria-label={on ? 'Pause' : 'Play voice message'} disabled={!u}><Ico d={on ? CI.pause : CI.play} s={18} /></button>
    <div className="vnw" onClick={e => { const el = a.current; if (!el) return; const r = e.currentTarget.getBoundingClientRect(); el.currentTime = Math.max(0, (e.clientX - r.left) / r.width) * len(); }}>{wave.map((h, i) => <i key={i} className={i / wave.length < p ? 'on' : ''} style={{ height: Math.max(4, h * 26) + 'px' }}></i>)}</div>
    <span className="vnt">{fmtDur(on || cur ? cur : m.dur)}</span>
    {u && <audio ref={a} src={u} preload="metadata" onPlay={() => setOn(true)} onPause={() => setOn(false)} onEnded={() => { setOn(false); setP(0); setCur(0); }} onTimeUpdate={e => { setCur(e.currentTarget.currentTime); setP(e.currentTarget.currentTime / len()); }}></audio>}
  </div>;
}
function ContactCard({ m, st, act }){
  const H = window.HOA, c = m.contact || {}, dig = String(c.phone || '').replace(/\D/g, '');
  const s = dig.length >= 7 && (st.suppliers || []).find(x => x.phone && String(x.phone).replace(/\D/g, '').slice(-10) === dig.slice(-10));
  return <div className="cc">
    <div className="cct"><span className="sav sm" style={{ background: colorOf(c.name) }}>{initials(c.name)}</span><span><b>{c.name}</b><span className="meta" style={{ marginTop: 0 }}>{c.phone || 'No phone number'}</span></span></div>
    {s && <button className="ccdir" onClick={() => act.go('suppliers', s.id)}>In Providers · {s.recs} {s.recs === 1 ? 'rec' : 'recs'}</button>}
    {dig && <div className="ccb"><a href={'tel:+' + H.waNum(c.phone)}>Call</a><a href={'https://wa.me/' + H.waNum(c.phone)} target="_blank" rel="noopener">Message</a></div>}
  </div>;
}

function ChatBubble({ m, hl, ctx }){
  const out = m.from === 'You', press = cR(null), xy = cR(null);
  const start = e => { if (e.pointerType === 'mouse') return; xy.current = [e.clientX, e.clientY]; clearTimeout(press.current); press.current = setTimeout(() => ctx.openMenu(m), 450); };
  const move = e => { if (xy.current && Math.hypot(e.clientX - xy.current[0], e.clientY - xy.current[1]) > 8) clearTimeout(press.current); };
  const stop = () => clearTimeout(press.current);
  const q = m.replyTo ? ctx.byId[m.replyTo] : null, rx = ctx.rx[m.id] || {}, rxl = Object.entries(rx).filter(([, w]) => w.length);
  const media = m.type === 'image' || m.type === 'video';
  return <div data-id={m.id} className={'b' + (out ? ' out' : '') + (m.fresh ? ' fresh' : '') + (hl ? ' hl' : '') + (media ? ' media' : '') + (rxl.length ? ' hasrx' : '')}
    onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} onContextMenu={e => { e.preventDefault(); ctx.openMenu(m); }}>
    <button className="bmn" aria-label="Message options" onClick={() => ctx.openMenu(m)}><Ico d={CI.down} s={16} /></button>
    {!out && ctx.group && <small style={{ color: m.desk ? 'var(--or)' : colorOf(m.from) }}>{m.from}{m.sim && <SimTag />}</small>}
    {m.replyTo && <button className="rq" style={{ borderColor: q ? colorOf(q.from) : 'var(--line)' }} onClick={() => q && ctx.jump(q.id)}>{q ? <><b style={{ color: colorOf(q.from) }}>{whoLabel(q.from)}</b><span>{preview(q)}</span></> : <span>Original message isn’t available</span>}</button>}
    {m.type === 'image' && <MediaImg m={m} onOpen={ctx.openImg} />}
    {m.type === 'video' && <MediaVid m={m} />}
    {m.type === 'voice' && <Voice m={m} />}
    {m.type === 'contact' && <ContactCard m={m} st={ctx.st} act={ctx.act} />}
    {m.text && <span className="bt"><RichText text={m.text} names={ctx.names} /></span>}
    <time>{m.time}{out && <em>{ctx.group ? '✓✓' : '✓'}</em>}</time>
    {m.pending && <div className="chips"><span className="chip c-pending">● Sorting…</span></div>}
    {m.chips && m.chips.length > 0 && <div className="chips">{m.chips.map((c, i) => <button key={i} className={'chip c-' + c[1]} style={{ animationDelay: (m.fresh ? .5 + i * .35 : 0) + 's' }} onClick={() => ctx.act.go(c[1], c[2])}>● {c[0]}</button>)}</div>}
    {ctx.group && m.topic && window.ZCFG.get().bot.showTags && <span className={'ttag t-' + m.topic} title={m.reason || ''}>{TOPIC_TAG[m.topic]}{m.sub && m.topic !== 'ignore' ? ' · ' + m.sub : m.topic === 'ignore' && m.sub ? ' · ' + m.sub : ''}</span>}
    {rxl.length > 0 && <div className="rx">{rxl.map(([e, w]) => <button key={e} className={w.includes('You') ? 'mine' : ''} onClick={() => ctx.react(m.id, e)} aria-label={e + ' from ' + w.join(', ')}>{e}{w.length > 1 && <span>{w.length}</span>}</button>)}</div>}
  </div>;
}

function MsgMenu({ m, ctx, onClose, onReply, onDM }){
  const mine = ctx.rx[m.id] || {}, myE = Object.keys(mine).find(e => mine[e].includes('You'));
  const canDM = ctx.group && m.from !== 'You' && !m.desk && !/^Neighbors (AI|app)$/.test(m.from);
  return <Sheet onClose={onClose}>
    <div className="mmq"><b>{whoLabel(m.from)}</b><span>{preview(m) || 'Message'}</span></div>
    <div className="rxbar">{REACTS.map(e => <button key={e} className={myE === e ? 'on' : ''} aria-pressed={myE === e} aria-label={'React with ' + e} onClick={() => { ctx.react(m.id, e); onClose(); }}>{e}</button>)}</div>
    <div className="mml">
      <button onClick={() => { onReply(m); onClose(); }}><Ico d={CI.reply} s={19} />Reply</button>
      {m.text && <button onClick={() => { try { navigator.clipboard.writeText(m.text); } catch (e) {} ctx.act.toast('Copied'); onClose(); }}><Ico d={CI.copy} s={19} />Copy text</button>}
      {canDM && <button onClick={() => { onDM(m.from); onClose(); }}><Ico d={CI.lock} s={19} />Message {firstName(m.from)} privately</button>}
    </div>
  </Sheet>;
}

function Lightbox({ m, onClose }){
  const u = useMediaUrl(m.media);
  return <div className="lbx" role="dialog" aria-label="Photo">
    <div className="lbh"><span><b>{whoLabel(m.from)}</b><span>{m.time}</span></span><button className="ib" aria-label="Close" onClick={onClose}><Ico d={CI.x} /></button></div>
    {u && <img src={u} alt={m.text || 'Photo'} />}{m.text && <p className="lbc">{m.text}</p>}
  </div>;
}

function MediaPreview({ pick, onClose, onSend }){
  const [cap, setCap] = cS('');
  return <Sheet onClose={onClose}>
    <h3>{pick.length === 1 ? (pick[0].v ? 'Send video' : 'Send photo') : 'Send ' + pick.length + ' items'}</h3>
    <div className={'mpg' + (pick.length === 1 ? ' one' : '')}>{pick.map((p, i) => p.v ? <video key={i} src={p.u} muted playsInline controls={pick.length === 1}></video> : <img key={i} src={p.u} alt="" />)}</div>
    <div className="askrow"><input value={cap} onChange={e => setCap(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSend(cap)} placeholder="Add a caption" aria-label="Caption" autoFocus /><button className="sendb" aria-label="Send" onClick={() => onSend(cap)}><Ico d={I.send} s={19} /></button></div>
  </Sheet>;
}

function ContactShare({ sups, onClose, onSend, toast }){
  const [f, setF] = cS({ name: '', phone: '' }), can = 'contacts' in navigator && 'ContactsManager' in window;
  const fromPhone = async () => { try { const r = await navigator.contacts.select(['name', 'tel'], { multiple: false }); if (r && r[0]) setF({ name: (r[0].name || [''])[0] || '', phone: (r[0].tel || [''])[0] || '' }); } catch (e) { toast('Couldn’t open your contacts.'); } };
  const q = f.name.trim().toLowerCase(), match = q.length >= 2 ? sups.filter(s => s.phone && s.name.toLowerCase().includes(q)).slice(0, 3) : [];
  return <Sheet onClose={onClose}>
    <h3>Share a contact</h3>
    {can ? <button className="btn ghost" onClick={fromPhone}><Ico d={CI.contact} s={18} />Choose from your phone</button>
      : <span className="meta">This browser can’t open your phone’s contacts (Android Chrome can). Type the contact in instead.</span>}
    <Field label="Name"><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
    {match.length > 0 && <div className="sugg flat">{match.map(s => <button key={s.id} onClick={() => setF({ name: s.name, phone: s.phone })}>{s.name} · {s.trade}</button>)}</div>}
    <Field label="Phone"><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} inputMode="tel" placeholder="(305) 555-0100" /></Field>
    <button className="btn" disabled={!f.name.trim()} onClick={() => onSend({ name: f.name.trim(), phone: f.phone.trim() })}>Send contact</button>
  </Sheet>;
}

function useRecorder(onDone, toast){
  const [rec, setRec] = cS(null), [, tick] = cS(0), r = cR(null);
  cE(() => { if (!rec) return; const iv = setInterval(() => tick(x => x + 1), 250); return () => clearInterval(iv); }, [rec]);
  cE(() => () => { if (r.current) { r.current.send = false; try { r.current.mr.stop(); } catch (e) {} } }, []);
  const start = async () => {
    if (!navigator.mediaDevices || !window.MediaRecorder) return toast('Voice messages aren’t supported in this browser.');
    let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { return toast('Microphone access is blocked. Allow it in your browser to record.'); }
    const mr = new MediaRecorder(stream), o = { mr, chunks: [], levels: [], t0: Date.now(), send: false, dur: 0 };
    try { const ac = new (window.AudioContext || window.webkitAudioContext)(), an = ac.createAnalyser(), buf = new Uint8Array(256); an.fftSize = 256; ac.createMediaStreamSource(stream).connect(an); o.ac = ac;
      o.iv = setInterval(() => { an.getByteTimeDomainData(buf); let p = 0; for (const v of buf) p = Math.max(p, Math.abs(v - 128)); o.levels.push(p / 128); }, 100); } catch (e) {}
    mr.ondataavailable = e => { if (e.data.size) o.chunks.push(e.data); };
    mr.onstop = async () => { clearInterval(o.iv); stream.getTracks().forEach(t => t.stop()); if (o.ac) o.ac.close().catch(() => {});
      if (!o.send || !o.chunks.length || o.dur < .6) return;
      const blob = new Blob(o.chunks, { type: mr.mimeType || 'audio/webm' }), id = await window.ZMedia.put(blob);
      onDone({ type: 'voice', media: id, mime: blob.type, dur: Math.round(o.dur * 10) / 10, wave: squash(o.levels, 32) }); };
    mr.start(); r.current = o; setRec(o);
  };
  const stop = send => { const o = r.current; if (!o) return; o.send = send; o.dur = (Date.now() - o.t0) / 1000; r.current = null; setRec(null); try { o.mr.stop(); } catch (e) {} };
  return { rec, start, stop, secs: rec ? (Date.now() - rec.t0) / 1000 : 0 };
}

function Composer({ st, ui, act, mem, ai, onSend, reply, clearReply, placeholder }){
  const [menu, setMenu] = cS(false), [pick, setPick] = cS(null), [contact, setContact] = cS(false);
  const inp = cR(null), fileRef = cR(null), camRef = cR(null);
  const R = useRecorder(att => onSend('', { att }), act.toast);
  const val = ui.composer, mq = /(^|\s)@([^\s@]*)$/.exec(val), aiOk = ai && zOn('askAI');
  const cands = mq ? [...(aiOk ? [{ key: '@AI', name: 'AI', label: 'Neighbors AI', sub: 'Answers you privately', ai: true }] : []), ...mem.map(x => ({ key: x.key, name: x.name, label: x.name, sub: x.unit ? 'Unit ' + x.unit : '' }))]
    .filter(x => x.name.toLowerCase().startsWith(mq[2].toLowerCase())).slice(0, 6) : [];
  const insert = x => { ui.setComposer(val.slice(0, val.length - mq[2].length) + x.name + ' '); if (inp.current) inp.current.focus(); };
  const send = () => { const t = val.trim(); if (!t) return; onSend(t, {}); ui.setComposer(''); };
  const files = e => { const f = [...e.target.files].slice(0, 10); e.target.value = ''; setMenu(false); if (f.length) setPick(f.map(x => ({ f: x, u: URL.createObjectURL(x), v: x.type.startsWith('video') }))); };
  const sendPick = async cap => { const p = pick; setPick(null);
    for (let i = 0; i < p.length; i++) { const x = await prepFile(p[i].f); if (!x) continue;
      if (x.blob.size > 60e6) { act.toast('That video is too large for this prototype (60 MB max).'); continue; }
      const id = await window.ZMedia.put(x.blob); onSend(i === 0 ? cap.trim() : '', { att: { type: x.type, media: id, mime: x.blob.type, w: x.w, h: x.h, dur: x.dur } }); } };
  if (R.rec) return <div className="cwrap"><div className="cmp rec">
    <button className="ib" aria-label="Cancel recording" onClick={() => R.stop(false)}><Ico d={CI.trash} s={20} /></button>
    <span className="recdot"></span><span className="rect">{fmtDur(R.secs)}</span><span className="rech">Recording. Tap send when you’re done.</span>
    <button className="sendb" aria-label="Send voice message" onClick={() => R.stop(true)}><Ico d={I.send} s={19} /></button></div></div>;
  return <div className="cwrap">
    {reply && <div className="rbar"><div className="rq" style={{ borderColor: colorOf(reply.from) }}><b style={{ color: colorOf(reply.from) }}>Replying to {reply.from === 'You' ? 'yourself' : firstName(reply.from)}</b><span>{preview(reply)}</span></div><button className="ib" aria-label="Cancel reply" onClick={clearReply}><Ico d={CI.x} s={18} /></button></div>}
    {cands.length > 0 && <div className="msug" role="listbox" aria-label="Mention someone">{cands.map(x => <button key={x.key} role="option" onClick={() => insert(x)}><span className="sav sm" style={{ background: x.ai ? 'var(--navy)' : colorOf(x.key) }}>{x.ai ? <Ico d={I.agent} s={15} /> : initials(x.name)}</span><span><b>{x.label}</b>{x.sub && <span className="meta">{x.sub}</span>}</span></button>)}</div>}
    {aiOk && ui.aiAsk && <div className="aihint"><Ico d={I.agent} s={14} />Neighbors see your message. The AI answers you privately.</div>}
    {menu && <><div className="amask" onClick={() => setMenu(false)}></div><div className="amenu">
      <button onClick={() => fileRef.current.click()}><span className="ai" style={{ background: '#7B3FA8' }}><Ico d={CI.img} s={18} /></span>Photos and videos</button>
      <button onClick={() => camRef.current.click()}><span className="ai" style={{ background: '#C2185B' }}><Ico d={I.cam} s={18} /></span>Camera</button>
      <button onClick={() => { setMenu(false); setContact(true); }}><span className="ai" style={{ background: '#2B59C3' }}><Ico d={CI.contact} s={18} /></span>Contact</button></div></>}
    <input ref={fileRef} type="file" accept="image/*,video/*" multiple hidden onChange={files} />
    <input ref={camRef} type="file" accept="image/*,video/*" capture="environment" hidden onChange={files} />
    <div className="cmp">
      {aiOk && <button className={'aitog' + (ui.aiAsk ? ' on' : '')} aria-pressed={ui.aiAsk} aria-label="Also ask the AI privately" title="Also ask the AI privately" onClick={() => ui.setAiAsk(!ui.aiAsk)}><Ico d={I.agent} s={19} /></button>}
      <button className={'ib clipb' + (menu ? ' on' : '')} aria-label="Attach" aria-expanded={menu} onClick={() => setMenu(!menu)}><Ico d={CI.clip} s={20} /></button>
      <input ref={inp} value={val} onChange={e => ui.setComposer(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (cands.length) insert(cands[0]); else send(); } if (e.key === 'Escape') setMenu(false); }} placeholder={aiOk && ui.aiAsk ? 'Ask neighbors, and the AI privately…' : placeholder} aria-label="Message" />
      {val.trim() ? <button className="sendb" aria-label="Send" onClick={send}><Ico d={I.send} s={19} /></button> : <button className="sendb" aria-label="Record a voice message" onClick={R.start}><Ico d={CI.mic} s={20} /></button>}
    </div>
    {pick && <Over><MediaPreview pick={pick} onClose={() => setPick(null)} onSend={sendPick} /></Over>}
    {contact && <Over><ContactShare sups={st.suppliers || []} toast={act.toast} onClose={() => setContact(false)} onSend={c => { setContact(false); onSend('', { att: { type: 'contact', contact: c } }); }} /></Over>}
  </div>;
}

function MembersSheet({ st, mem, onClose, openDM, invite }){
  const H = window.HOA, [q, setQ] = cS(''), [inv, setInv] = cS(!!invite), g = window.ZGroup.get();
  const grp = window.ZGroup.current();
  if (inv) return <Sheet onClose={onClose}><h3>Invite neighbors</h3><span className="meta">Anyone in the group can invite.</span><InvitePanel group={grp} me={st.me} /><button className="btn ghost" onClick={() => setInv(false)}>Back to members</button></Sheet>;
  const dms = Object.entries(st.dms || {}).filter(([, l]) => l.length).sort((a, b) => b[1][b[1].length - 1].ts - a[1][a[1].length - 1].ts);
  const list = mem.filter(x => !q || x.key.toLowerCase().includes(q.toLowerCase())).slice(0, 300);
  return <Sheet onClose={onClose}>
    <h3>{H.GROUP.name}</h3><span className="meta">{mem.length + 1} members</span>
    <button className="btn" onClick={() => setInv(true)}>Invite neighbors</button>
    {(st.me.role === 'admin' || st.me.role === 'board' || (g.me && g.me.admin)) && <PendingPanel group={grp} />}
    {dms.length > 0 && <><span className="lbl">Your private chats</span>{dms.map(([k, l]) => <button key={k} className="mrow" onClick={() => openDM(k)}><span className="sav sm" style={{ background: colorOf(k) }}>{initials(firstName(k))}</span><span><b>{firstName(k)}</b><span className="meta">{l[l.length - 1].from === 'You' ? 'You: ' : ''}{preview(l[l.length - 1])}</span></span><Ico d={CI.lock} s={16} /></button>)}</>}
    <span className="lbl">Members</span>
    <label className="srch"><Ico d={I.search} s={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search members" aria-label="Search members" /></label>
    <div className="mrow"><span className="sav sm" style={{ background: 'var(--navy)' }}>{st.me.name ? initials(st.me.name) : <Ico d={I.user} s={16} />}</span><span><b>You</b><span className="meta">{st.me.unit ? 'Unit ' + st.me.unit : 'Add your unit under your initials'}</span></span><span></span></div>
    {list.map(x => <div key={x.key} className="mrow"><span className="sav sm" style={{ background: colorOf(x.key) }}>{initials(x.name)}</span><span><b>{x.name}</b><span className="meta">{(x.unit ? 'Unit ' + x.unit + ' · ' : '') + (x.last ? 'active ' + H.ago(new Date(x.last)) : x.n + ' messages')}</span></span><button className="slot" onClick={() => openDM(x.key)}>Message</button></div>)}
    {!list.length && <p className="empty">Nobody matches “{q}”.</p>}
    <p className="fine">Private chats are only between you and that neighbor. Neighbors AI doesn’t read them or remember anything from them.</p>
  </Sheet>;
}

function useThreadScroll(ref){
  return id => { const el = ref.current; if (!el) return; const t = el.querySelector('[data-id="' + id + '"]'); if (!t) return; el.scrollTo({ top: t.offsetTop - 90, behavior: 'smooth' }); t.classList.add('hl'); setTimeout(() => t.classList.remove('hl'), 1600); };
}

function GroupChat({ st, act, ui }){
  const H = window.HOA, [more, setMore] = cS(150), [menuM, setMenuM] = cS(null), [reply, setReply] = cS(null), [info, setInfo] = cS(false), [view, setView] = cS(null), [imp, setImp] = cS(false), [zi, setZi] = cS(false), [openF, setOpenF] = cS({}), [menu, setMenu] = cS(false);
  const ZIv = useInterests();
  const mem = cM(() => zMembers(st.feed), [st.feed]);
  const byId = cM(() => { const o = {}; st.feed.forEach(m => { o[m.id] = m; }); return o; }, [st.feed]);
  const list = st.feed.slice(-more);
  const ref = useBottom((st.typing || '') + st.feed.length + '|' + st.messages.reduce((a, m) => a + (m.chips ? m.chips.length : 0) + (m.done ? 1 : 0) + (m.loading ? 0 : 1) + (m.draft ? 1 : 0), 0));
  const jump = useThreadScroll(ref);
  cE(() => { const el = ref.current; if (!ui.target || !el) return; if (!list.some(m => m.id === ui.target)) setMore(st.feed.length); setTimeout(() => { const t = el.querySelector('[data-id="' + ui.target + '"]'); if (t) el.scrollTo({ top: t.offsetTop - 90, behavior: 'smooth' }); }, 50); }, [ui.target]);
  const ctx = { act, st, byId, names: mem.map(x => x.name), rx: st.reactions || {}, openMenu: setMenuM, react: act.react, jump: id => { if (!list.some(m => m.id === id)) setMore(st.feed.length); setTimeout(() => jump(id), 30); }, group: true, openImg: setView };
  const openDM = k => { setInfo(false); ui.setComposer(''); ui.setDm(k); };
  let last = '';
  return <div className="scr lchat">
    <div className="lhd">
      <button className={'lcirc' + (ZI_TOPICS.some(([k]) => !ZIv[k]) ? ' dot' : '')} aria-label="Menu" onClick={() => setMenu(true)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 8h16M4 16h16" /></svg></button>
      <button className="lhd-c" onClick={() => setInfo(true)} aria-label="Group info and members"><span className="lav">{H.GROUP.short}</span><span className="lnm">{H.GROUP.name}</span></button>
      <button className="lpill" onClick={() => setInfo('invite')}>Invite</button>
    </div>
    {menu && <Sheet onClose={() => setMenu(false)}><h3>{H.GROUP.name}</h3><span className="meta">{ui.loading ? 'Updating…' : (mem.length + 1) + ' members'}</span>
      <div className="lmenu">
        {zOn('catchup') && <button onClick={() => { setMenu(false); act.openCatch(); }}><Ico d={I.agent} s={19} /><span><b>Catch up</b><em>What you missed, filtered to what you follow</em></span></button>}
        <button onClick={() => { setMenu(false); setZi(true); }}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4" /></svg><span><b>What you want to see</b><em>{ZI_TOPICS.every(([k]) => ZIv[k]) ? 'Everything' : ZI_TOPICS.filter(([k]) => ZIv[k]).map(t => t[1]).join(', ')}</em></span></button>
        <button onClick={() => { setMenu(false); setInfo(true); }}><Ico d={I.sup} s={19} /><span><b>Members</b><em>See everyone and message privately</em></span></button>
        <button onClick={() => { setMenu(false); act.openMe(); }}><Ico d={I.user} s={19} /><span><b>You</b><em>Name, unit and settings</em></span></button>
      </div></Sheet>}
    {zi && <InterestsSheet onClose={() => setZi(false)} />}
    <div className="wa" ref={ref}>
      {st.lastSeen && zOn('catchup') && <button className="cub" onClick={act.openCatch}><span>Welcome back. You’ve been away since {(x => /^(Today|Yesterday)$/.test(x) ? x.toLowerCase() : x)(H.fmtDay(new Date(st.lastSeen)))}.</span><b>See what you missed</b></button>}
      <ImportReminder onOpen={() => setImp(true)} />
      {imp && <Sheet onClose={() => setImp(false)}><h3>Import your old chat</h3><ImportPanel onDone={() => { setImp(false); act.toast('Imported. Old members can now join without approval.'); }} /></Sheet>}
      {st.feed.length > more && <button className="day" onClick={() => setMore(m => m + 150)}>Show earlier messages</button>}
      <div className="sys">The AI reads along quietly and remembers recommendations, issues and plans. Tap ✦ when you want its help. Its answers are only shown to you.</div>
      {ui.sheetErr && !st.sheet && <div className="sys">Couldn’t load the directory sheet. Check the connection, then tap your initials → Refresh.</div>}
      {zFold(list, ZIv, st.me.name, openF).map(it => { if (it.fold) return <FoldLine key={'f' + it.key} f={it} onShow={() => setOpenF(o => { const n = { ...o }; it.ids.forEach(id => { n[id] = 1; }); return n; })} />;
        const m = it.m, d = H.fmtDay(m.d), sep = d !== last; last = d; return <React.Fragment key={m.id}>{sep && <span className="day">{d}</span>}{m.kind === 'priv' ? <PrivCard m={m} st={st} act={act} /> : m.kind === 'nudge' ? (st.aiLevel === 'quiet' ? null : <NudgeCard m={m} act={act} />) : m.kind === 'evcard' ? <EvCard m={m} st={st} act={act} /> : m.kind === 'outcome' ? <OutcomeCard m={m} /> : m.kind === 'poll' ? <PollCard m={m} act={act} /> : <ChatBubble m={m} hl={ui.target === m.id} ctx={ctx} />}</React.Fragment>; })}
      {st.typing && <div className="b typing"><small style={{ color: colorOf(st.typing) }}>{st.typing} is typing</small><span className="dots"><i></i><i></i><i></i></span></div>}
    </div>
    <Composer st={st} ui={ui} act={act} mem={mem} ai={true} reply={reply} clearReply={() => setReply(null)} placeholder="Message the group"
      onSend={(t, o) => { act.send(t, { ai: ui.aiAsk, replyTo: reply ? reply.id : undefined, ...o }); setReply(null); ui.setAiAsk(false); }} />
    {menuM && <MsgMenu m={menuM} ctx={ctx} onClose={() => setMenuM(null)} onReply={setReply} onDM={openDM} />}
    {info && <MembersSheet st={st} mem={mem} onClose={() => setInfo(false)} openDM={openDM} invite={info === 'invite'} />}
    {view && <Lightbox m={view} onClose={() => setView(null)} />}
  </div>;
}

function DMScreen({ st, act, ui }){
  const H = window.HOA, k = ui.dm, [menuM, setMenuM] = cS(null), [reply, setReply] = cS(null), [view, setView] = cS(null);
  const raw = (st.dms || {})[k] || [], list = raw.map(m => ({ ...m, d: new Date(m.ts), time: H.fmtTime(new Date(m.ts)) }));
  const byId = {}; list.forEach(m => { byId[m.id] = m; });
  const ref = useBottom(list.length), jump = useThreadScroll(ref), unit = String(k).split(' · ')[1];
  const ctx = { act, st, byId, names: [], rx: st.reactions || {}, openMenu: setMenuM, react: act.react, jump, group: false, openImg: setView };
  let last = '';
  return <div className="scr">
    <div className="hd"><button className="ib" aria-label="Back to the group" onClick={() => { ui.setComposer(''); ui.setDm(null); }}><Ico d={CI.back} /></button>
      <span className="hav" style={{ background: colorOf(k) }}>{initials(firstName(k))}</span>
      <div className="hd-t"><b>{firstName(k)}</b><span>Private chat{unit ? ' · Unit ' + unit : ''}</span></div></div>
    <ImportReminder onOpen={() => setImp(true)} />
    {imp && <Sheet onClose={() => setImp(false)}><h3>Import your old chat</h3><ImportPanel onDone={() => { setImp(false); act.toast('Imported. Old members can now join without approval.'); }} /></Sheet>}
    <div className="wa" ref={ref}>
      <div className="sys lockd"><Ico d={CI.lock} s={13} />Private chat. Neighbors AI doesn’t read or remember anything here.</div>
      {!list.length && <div className="sys">Say hi to {firstName(k)}. In this prototype, private messages are saved on this device until accounts are connected.</div>}
      {list.map(m => { const d = H.fmtDay(m.d), sep = d !== last; last = d; return <React.Fragment key={m.id}>{sep && <span className="day">{d}</span>}<ChatBubble m={m} ctx={ctx} /></React.Fragment>; })}
    </div>
    <Composer st={st} ui={ui} act={act} mem={[]} ai={false} reply={reply} clearReply={() => setReply(null)} placeholder={'Message ' + firstName(k)}
      onSend={(t, o) => { act.sendDM(k, t, { replyTo: reply ? reply.id : undefined, ...o }); setReply(null); }} />
    {menuM && <MsgMenu m={menuM} ctx={ctx} onClose={() => setMenuM(null)} onReply={setReply} onDM={() => {}} />}
    {view && <Lightbox m={view} onClose={() => setView(null)} />}
  </div>;
}

function ChatScreen(props){ return props.ui.dm ? <DMScreen key={props.ui.dm} {...props} /> : <GroupChat {...props} />; }

Object.assign(window, { ChatScreen, ChatBubble, Composer, MembersSheet, DMScreen, zMembers });
