/* Zing Neighbors App: invite, WhatsApp import and join approvals. Used by Onboarding.html and inside the Resident app. */
const { useState: gS, useEffect: gE } = React;
function useGroup(){ const [, s] = gS(0); gE(() => window.ZGroup.subscribe(() => s(x => x + 1)), []); return window.ZGroup.get(); }

function QR({ text }){
  const [svg, setSvg] = gS('');
  gE(() => { let ok = true; const go = () => { try { const q = window.qrcode(0, 'M'); q.addData(text); q.make(); if (ok) setSvg(q.createSvgTag({ cellSize: 4, margin: 2, scalable: true })); } catch (e) {} };
    if (window.qrcode) go(); else { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'; s.onload = go; document.head.appendChild(s); }
    return () => { ok = false; }; }, [text]);
  return <div className="obqr" dangerouslySetInnerHTML={{ __html: svg }}></div>;
}

function InvitePanel({ group, me, toast }){
  const Z = window.ZGroup, link = Z.link(group), [poster, setPoster] = gS(false);
  const copy = (t, what) => { try { navigator.clipboard.writeText(t); } catch (e) {} if (toast) toast(what + ' copied'); };
  const share = async () => { if (navigator.share) { try { await navigator.share({ title: group.name, text: Z.smsMsg(group, me), url: link }); } catch (e) {} } else copy(link, 'Link'); };
  return <div className="obinv">
    <div className="card"><span className="lbl" style={{ marginTop: 0 }}>Invite link</span><b className="oblink">{link.replace(/^https?:\/\//, '')}</b>
      <span className="meta">Opens the group directly. People join with their phone number, no app download needed. Code: <b>{group.code}</b></span>
      <div className="crow"><button className="btn" onClick={share}>Share link</button><button className="btn ghost" onClick={() => copy(link, 'Link')}>Copy</button></div></div>
    <div className="card"><span className="lbl" style={{ marginTop: 0 }}>Post in your old WhatsApp group</span><div className="qt">{Z.moveMsg(group, me)}</div>
      <div className="crow"><a className="btn" href={'https://wa.me/?text=' + encodeURIComponent(Z.moveMsg(group, me))} target="_blank" rel="noopener"><Ico d={I.wa} s={17} />Open WhatsApp</a><button className="btn ghost" onClick={() => copy(Z.moveMsg(group, me), 'Message')}>Copy</button></div></div>
    <div className="card"><span className="lbl" style={{ marginTop: 0 }}>Text a neighbor</span><span className="meta">{Z.smsMsg(group, me)}</span>
      <div className="crow"><a className="btn ghost" href={'sms:?&body=' + encodeURIComponent(Z.smsMsg(group, me))}>Open Messages</a></div></div>
    <button className="card obrow" onClick={() => setPoster(!poster)}><span><b>QR code for the lobby or mailroom</b><span className="meta">Print it and put it where neighbors pass by.</span></span><span className="pill grey">{poster ? 'Hide' : 'Show'}</span></button>
    {poster && <div className="card obposter"><span className="eyebrow">Neighbors</span><b>{group.name}</b><QR text={link} /><span className="meta">Scan to join with your phone number · code {group.code}</span><button className="btn ghost" onClick={() => window.print()}>Print</button></div>}
  </div>;
}

function ImportPanel({ onDone, compact }){
  const Z = window.ZGroup, [src, setSrc] = gS('whatsapp'), [res, setRes] = gS(null), [err, setErr] = gS(''), [busy, setBusy] = gS(false);
  const pick = async f => { if (!f) return; setErr(''); setBusy(true);
    try { const t = await Z.readExport(f), r = Z.parseWhatsApp(t); if (!r.msgs) throw new Error('That file doesn’t look like a WhatsApp chat export.'); setRes(r); }
    catch (e) { setErr(e.message || 'Could not read that file.'); } setBusy(false); };
  const keep = () => { const o = Z.get(); Z.patch({ imported: { at: Date.now(), members: res.members, recs: res.recs, trades: res.trades, issues: res.issues, events: res.events, msgs: res.msgs, from: res.from, to: res.to }, importLater: false });
    if (onDone) onDone(res); };
  return <div className="obimp">
    {!compact && <div className="seg" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>{[['whatsapp', 'WhatsApp'], ['imessage', 'iMessage'], ['other', 'Other']].map(([k, l]) => <button key={k} className={src === k ? 'on' : ''} onClick={() => setSrc(k)}>{l}</button>)}</div>}
    {src === 'whatsapp' && !res && <>
      <ol className="obsteps"><li>Open the group in WhatsApp and tap its name at the top.</li><li>Scroll down and tap <b>Export chat</b>. Choose <b>Without media</b>.</li><li>Save the file, then upload it here. A .zip or .txt both work.</li></ol>
      <label className="btn obup">{busy ? 'Reading…' : 'Upload the export'}<input type="file" accept=".txt,.zip,text/plain,application/zip" hidden onChange={e => pick(e.target.files[0])} /></label>
      {err && <p className="fine" style={{ color: 'var(--warn)' }}>{err}</p>}
      <p className="fine">The chat file stays private. Zing keeps only what it finds: providers neighbors recommended, past building issues and events, and the members list so they can join straight away. The full messages aren’t published, and the file is deleted after it’s read.</p></>}
    {src === 'whatsapp' && res && <div className="card">
      <span className="lbl" style={{ marginTop: 0 }}>Found in your chat{res.from ? ' · ' + res.from + ' to ' + res.to : ''}</span>
      <div className="obstats"><div><b>{res.msgs.toLocaleString()}</b><span>messages read</span></div><div><b>{res.members.length}</b><span>members</span></div><div><b>{res.recs.length}</b><span>recommendations</span></div><div><b>{res.issues}</b><span>building issues</span></div></div>
      {Object.keys(res.trades).length > 0 && <span className="meta">Providers: {Object.entries(res.trades).sort((a, b) => b[1] - a[1]).map(([t, n]) => t + ' (' + n + ')').join(', ')}</span>}
      <span className="meta" style={{ marginTop: 6 }}>The {res.members.length} members can join without waiting for approval. Nobody is added until they accept an invite.</span>
      <div className="crow"><button className="btn" onClick={keep}>Keep this</button><button className="btn ghost" onClick={() => setRes(null)}>Different file</button></div></div>}
    {src === 'imessage' && <div className="card"><b>iMessage has no export on iPhone</b><span className="meta">Two options: upload screenshots of the conversation and Zing reads the recommendations from them, or skip for now. On a Mac, third-party tools can export the full history as text, which you can upload here.</span>
      <div className="crow"><label className="btn ghost">Upload screenshots<input type="file" accept="image/*" multiple hidden onChange={e => e.target.files.length && setErr(e.target.files.length + ' screenshots saved. Zing will read them once AI is connected.')} /></label></div>{err && <p className="fine">{err}</p>}</div>}
    {src === 'other' && <div className="card"><b>Facebook, Nextdoor, email lists</b><span className="meta">There’s no clean export for these yet. Invite people with the link instead. Recommendations they post in Zing are saved from day one.</span></div>}
  </div>;
}

function PendingPanel({ group }){
  const Z = window.ZGroup, g = useGroup(), list = (g.pending || []).filter(p => p.code === group.code);
  if (!list.length) return null;
  const decide = (p, ok) => Z.patch({ pending: (Z.get().pending || []).filter(x => x !== p && !(x.phone === p.phone && x.code === p.code)), members: ok ? [...(Z.get().members || []), { ...p, status: 'member', joined: Date.now() }] : Z.get().members || [] });
  return <><span className="lbl">Waiting to join ({list.length})</span>{list.map((p, i) => <div key={i} className="mrow"><span className="sav sm" style={{ background: colorOf(p.name) }}>{initials(p.name)}</span><span><b>{p.name}</b><span className="meta">{p.unit || 'No unit given'} · {window.HOA.fmtPhone ? window.HOA.fmtPhone(p.phone) : p.phone} · not in the imported chat</span></span>
    <span className="chips" style={{ marginLeft: 'auto' }}><button className="slot on" onClick={() => decide(p, true)}>Approve</button><button className="slot" onClick={() => decide(p, false)}>Decline</button></span></div>)}</>;
}

function ImportReminder({ onOpen }){
  const g = useGroup();
  if (!g.group || !g.importLater || !g.me || !g.me.admin) return null;
  return <button className="cub" onClick={onOpen}><span>Bring in your {g.existing === 'imessage' ? 'iMessage' : 'WhatsApp'} history so the directory starts full.</span><b>Import</b></button>;
}

Object.assign(window, { useGroup, QR, InvitePanel, ImportPanel, PendingPanel, ImportReminder });
