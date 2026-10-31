/* Zing Neighbors App: sign up, join or create a group, import, invite. Ends in Resident.html. */
const { useState: oS, useEffect: oE } = React;
const OB_STEP = 'zingN.app.ob';

function Ob({ title, sub, back, children, foot }){
  return <div className="scr"><div className="obhd">{back ? <button className="obback" onClick={back} aria-label="Back"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg></button> : <span></span>}<span className="obmark">Neighbors</span><span></span></div>
    <div className="list obbody">{title && <h2 className="obt">{title}</h2>}{sub && <p className="obs">{sub}</p>}{children}</div>{foot && <div className="obfoot">{foot}</div>}</div>;
}
function Choice({ on, title, sub, onClick }){ return <button className={'card obch' + (on ? ' on' : '')} onClick={onClick}><b>{title}</b>{sub && <span className="meta">{sub}</span>}</button>; }

function Onboarding(){
  const Z = window.ZGroup, T = Z.TYPES, saved = (() => { try { return JSON.parse(sessionStorage.getItem(OB_STEP)) || {}; } catch (e) { return {}; } })();
  const q = new URLSearchParams(location.search).get('j'), inv = q ? Z.find(q) : null;
  const [f, setF] = oS(Object.assign({ step: 'welcome', hist: [], phone: '', code: '', name: '', unit: '', type: '', gname: '', addr: '', role: '', existing: '', target: inv ? inv.code : null, joinQ: '', search: '' }, saved));
  const [toast, setToast] = oS('');
  oE(() => { try { sessionStorage.setItem(OB_STEP, JSON.stringify(f)); } catch (e) {} }, [f]);
  oE(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2200); return () => clearTimeout(t); }, [toast]);
  const set = p => setF(x => ({ ...x, ...p }));
  const go = step => setF(x => ({ ...x, step, hist: [...x.hist, x.step] }));
  const back = () => setF(x => ({ ...x, step: x.hist[x.hist.length - 1] || 'welcome', hist: x.hist.slice(0, -1) }));
  window.zObReset = () => { sessionStorage.removeItem(OB_STEP); setF({ step: 'welcome', hist: [], phone: '', code: '', name: '', unit: '', type: '', gname: '', addr: '', role: '', existing: '', target: null, joinQ: '', search: '' }); };
  const fmt = p => { const d = String(p).replace(/\D/g, '').slice(0, 10); return d.length < 4 ? d : d.length < 7 ? '(' + d.slice(0, 3) + ') ' + d.slice(3) : '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6); };
  const target = f.target ? Z.find(f.target) : null, G = Z.get();
  const me = { name: f.name.trim(), unit: f.unit.trim(), phone: f.phone };
  const toApp = role => { // hand the profile to the Resident app
    try { const k = 'zingN.app.v1', s = JSON.parse(localStorage.getItem(k)) || {}; s.me = { ...(s.me || { role: 'resident', providerId: '' }), name: me.name, unit: me.unit, phone: me.phone, role: role || (s.me && s.me.role) || 'resident' }; localStorage.setItem(k, JSON.stringify(s)); } catch (e) {}
    sessionStorage.removeItem(OB_STEP); location.href = 'Resident.html'; };
  const join = g => { const auto = Z.wasImported(g, f.phone), rec = { code: g.code, name: me.name, unit: me.unit, phone: f.phone, ts: Date.now() };
    if (auto) { Z.patch({ joined: { ...rec, status: 'member', via: 'imported' }, members: [...(Z.get().members || []), { ...rec, status: 'member' }] }); go('in'); }
    else { Z.patch({ joined: { ...rec, status: 'pending' }, pending: [...(Z.get().pending || []).filter(p => !(p.code === g.code && Z.digits(p.phone) === Z.digits(f.phone))), rec] }); go('pending'); } };
  const create = () => { const g = { id: 'g' + Date.now().toString(36), name: f.gname.trim(), type: f.type, address: f.addr.trim(), code: Z.code(f.gname), members: 1, created: Date.now() };
    Z.patch({ group: g, me: { ...me, admin: true, role: f.role }, existing: f.existing, importLater: f.existing && f.existing !== 'none' }); set({ target: g.code });
    go(f.existing && f.existing !== 'none' ? 'importAsk' : 'invite'); };
  const ty = T[f.type] || T.Multifamily, digits = f.phone.replace(/\D/g, '');

  const S = {
    welcome: <Ob foot={<><button className="btn" onClick={() => go('phone')}>Get started</button><span className="fine" style={{ textAlign: 'center' }}>{inv ? 'You were invited to ' + inv.name + '.' : 'Free for neighbors. No passwords.'}</span></>}>
      <div className="obhero"><span className="eyebrow">Neighbors</span><h2>Your building’s group chat, with a memory.</h2><p className="obs">Recommendations, building issues and plans, saved and easy to find. Only for the people who live here.</p></div></Ob>,
    phone: <Ob back={back} title="What’s your phone number?" sub="We’ll text you a code. Your number is never shown to other members unless you share it."
      foot={<button className="btn" disabled={digits.length < 10} onClick={() => go('code')}>Text me a code</button>}>
      <label className="fld"><span>Mobile number</span><div className="obtel"><span>+1</span><input inputMode="tel" autoComplete="tel" value={fmt(f.phone)} onChange={e => set({ phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="(305) 555-0123" autoFocus /></div></label>
      <p className="fine">Prototype: no text is sent. Try 305 555 0142, a number that was in the imported WhatsApp chat, to see automatic joining.</p></Ob>,
    code: <Ob back={back} title="Enter the code" sub={'Sent to +1 ' + fmt(f.phone) + '.'} foot={<button className="btn" disabled={f.code.length < 6} onClick={() => go('name')}>Continue</button>}>
      <input className="obcode" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={f.code} onChange={e => set({ code: e.target.value.replace(/\D/g, '') })} placeholder="••••••" aria-label="6-digit code" autoFocus />
      <p className="fine">Prototype: any 6 digits work. <button className="lnk" onClick={() => setToast('Code sent again')}>Send again</button></p></Ob>,
    name: <Ob back={back} title="What should neighbors call you?" sub="Your first name is enough. It shows next to your messages." foot={<button className="btn" disabled={!f.name.trim()} onClick={() => go(target ? 'joinPreview' : 'choice')}>Continue</button>}>
      <label className="fld"><span>Name</span><input value={f.name} onChange={e => set({ name: e.target.value })} placeholder="Liz" autoComplete="given-name" autoFocus /></label></Ob>,
    choice: <Ob back={back} title={'Hi ' + (f.name.split(' ')[0] || 'there') + '. Where do you want to go?'}>
      <Choice title="I have an invite link or code" sub="A neighbor or your building sent it." onClick={() => go('joinCode')} />
      <Choice title="Find my building or neighborhood" sub="Search groups already on Zing." onClick={() => go('search')} />
      <Choice title="Start a new group" sub="For your HOA, apartment building or neighborhood." onClick={() => go('type')} /></Ob>,
    joinCode: <Ob back={back} title="Paste the link or code" foot={<button className="btn" disabled={!f.joinQ.trim()} onClick={() => { const g = Z.find(f.joinQ); if (!g) return setToast('No group found for that code'); set({ target: g.code }); go('joinPreview'); }}>Find the group</button>}>
      <label className="fld"><span>Invite link or code</span><input value={f.joinQ} onChange={e => set({ joinQ: e.target.value })} placeholder="ROXY-2210" autoFocus /></label>
      <p className="fine">Demo codes: {Z.DEMO.map(g => g.code).join(', ')}{G.group ? ', ' + G.group.code : ''}</p></Ob>,
    search: <Ob back={back} title="Find your group">
      <label className="srch"><Ico d={I.search} s={18} /><input value={f.search} onChange={e => set({ search: e.target.value })} placeholder="Building name or neighborhood" aria-label="Search groups" autoFocus /></label>
      {Z.search(f.search).map(g => <button key={g.code} className="card obrow" onClick={() => { set({ target: g.code }); go('joinPreview'); }}><span><b>{g.name}</b><span className="meta">{(T[g.type] || {}).label} · {g.address} · {g.members} members</span></span></button>)}
      <button className="lnk" style={{ marginTop: 6 }} onClick={() => go('type')}>Not here? Start a new group</button></Ob>,
    joinPreview: target && <Ob back={back} title={'Join ' + target.name} foot={<button className="btn" disabled={!f.unit.trim()} onClick={() => join(target)}>Join the group</button>}>
      <div className="card"><span className="lbl" style={{ marginTop: 0 }}>{(T[target.type] || {}).label}</span><b style={{ fontSize: 17 }}>{target.name}</b><span className="meta">{target.address} · {target.members} members</span></div>
      <label className="fld"><span>{(T[target.type] || T.Multifamily).unit === 'Street' ? 'Your street' : 'Your unit'}</span><input value={f.unit} onChange={e => set({ unit: e.target.value })} placeholder={(T[target.type] || {}).unit === 'Street' ? 'Kumquat Ave' : '4B'} autoFocus /></label>
      <p className="fine">If your number was in the group’s old WhatsApp chat you’re in right away. Otherwise an admin approves you, usually within a day.</p></Ob>,
    in: target && <Ob title="You’re in." sub={'Welcome to ' + target.name + '. Your number was in the group’s WhatsApp chat, so no approval was needed.'} foot={<button className="btn" onClick={() => toApp()}>Open the group</button>}>
      <div className="card"><b>Help everyone move over</b><span className="meta">Anyone in the group can invite neighbors.</span></div><InvitePanel group={target} me={me} toast={setToast} /></Ob>,
    pending: target && <Ob title="Request sent" sub={'An admin of ' + target.name + ' will approve you. We’ll text you when you’re in.'} foot={<><button className="btn" onClick={() => { const j = Z.get().joined; if (j && j.status === 'member') toApp(); else setToast('Still waiting for an admin'); }}>Check again</button><button className="lnk" onClick={back}>Change unit</button></>}>
      <div className="card"><span className="lbl" style={{ marginTop: 0 }}>Why approval?</span><span className="meta">Your number wasn’t in the group’s old WhatsApp chat. A quick check keeps the group to people who live here.</span></div></Ob>,
    type: <Ob back={back} title="What kind of community?" sub="This sets up the right categories and who issues go to." foot={<button className="btn" disabled={!f.type} onClick={() => go('details')}>Continue</button>}>
      {Object.entries(T).map(([k, t]) => <Choice key={k} on={f.type === k} title={t.label} sub={t.who} onClick={() => set({ type: k })} />)}</Ob>,
    details: <Ob back={back} title={'About your ' + ty.noun} foot={<button className="btn" disabled={!f.gname.trim() || !f.addr.trim() || !f.unit.trim()} onClick={() => go('role')}>Continue</button>}>
      <label className="fld"><span>Group name</span><input value={f.gname} onChange={e => set({ gname: e.target.value })} placeholder={f.type === 'Neighborhood' ? 'North Grove Neighbors' : f.type === 'HOA' ? 'Bayview Towers HOA' : 'Alexan Roxy Neighbors'} autoFocus /></label>
      <label className="fld"><span>{f.type === 'Neighborhood' ? 'Neighborhood and city' : 'Address'}</span><input value={f.addr} onChange={e => set({ addr: e.target.value })} placeholder={f.type === 'Neighborhood' ? 'Coconut Grove, Miami' : '2627 S Bayshore Dr, Miami'} /></label>
      <label className="fld"><span>{ty.unit === 'Street' ? 'Your street' : 'Your unit'}</span><input value={f.unit} onChange={e => set({ unit: e.target.value })} placeholder={ty.unit === 'Street' ? 'Kumquat Ave' : '4B'} /></label>
      <p className="fine">The area is also how providers let the group know when they’ll be nearby.</p></Ob>,
    role: <Ob back={back} title="What’s your role?" sub="You’ll be the group’s first admin. You can add more admins later." foot={<button className="btn" disabled={!f.role} onClick={() => go('existing')}>Continue</button>}>
      {(f.type === 'HOA' ? [['board', 'Board member'], ['manager', 'Management company'], ['resident', 'Owner organizing it']] : f.type === 'Multifamily' ? [['manager', 'Property manager or leasing office'], ['resident', 'Resident organizing it']] : [['resident', 'Neighbor organizing it'], ['board', 'Neighborhood association']])
        .map(([k, l]) => <Choice key={k} on={f.role === k} title={l} onClick={() => set({ role: k })} />)}</Ob>,
    existing: <Ob back={back} title="Do you already have a group chat?" sub="Moving it to Zing keeps everything neighbors already shared." foot={<button className="btn" disabled={!f.existing} onClick={create}>Create the group</button>}>
      {[['whatsapp', 'WhatsApp', 'You can bring in its history'], ['imessage', 'iMessage', 'Limited: no export on iPhone'], ['facebook', 'Facebook or Nextdoor', 'Invite people with a link'], ['none', 'No, this is new', '']].map(([k, l, s]) => <Choice key={k} on={f.existing === k} title={l} sub={s} onClick={() => set({ existing: k })} />)}</Ob>,
    importAsk: <Ob title="Bring in your old chat?" sub="Zing reads it once and fills the directory with the providers neighbors already recommended. Members of the old chat can then join without approval."
      foot={<><button className="btn" onClick={() => go('import')}>Import now</button><button className="btn ghost" onClick={() => { Z.patch({ importLater: true }); go('invite'); }}>Later</button><span className="fine" style={{ textAlign: 'center' }}>If you choose later, we’ll remind you in the app.</span></>}>
      <div className="card"><span className="lbl" style={{ marginTop: 0 }}>What you’ll need</span><span className="meta">{f.existing === 'whatsapp' ? 'Your phone, and a minute to export the chat from WhatsApp.' : 'Screenshots of the conversation, or a Mac export of the history.'}</span></div></Ob>,
    import: <Ob back={back} title="Import your chat"><ImportPanel onDone={() => { setToast('Imported'); go('invite'); }} /></Ob>,
    invite: G.group && <Ob title="Invite your neighbors" sub="Anyone in the group can invite. Post the message in your old chat first, that’s where most people will come from." foot={<button className="btn" onClick={() => toApp(f.role === 'resident' ? 'admin' : f.role === 'manager' ? 'admin' : f.role)}>Go to the group</button>}>
      {G.imported && <div className="card" style={{ borderColor: 'var(--ok)' }}><b>{G.imported.recs.length} recommendations and {G.imported.members.length} members imported</b><span className="meta">Those members join without approval.</span></div>}
      <InvitePanel group={G.group} me={me} toast={setToast} /></Ob>
  };
  return <>{S[f.step] || S.welcome}{toast && <button className="toast" onClick={() => setToast('')}><Ico d={I.check} s={16} />{toast}</button>}</>;
}

function OnboardStage(){
  const g = useGroup(), Z = window.ZGroup, pend = g.pending || [];
  return <div className="stage">
    <aside className="intro">
      <span className="eyebrow">Zing Neighbors · Onboarding</span>
      <h1 style={{ fontSize: 30 }}>Joining or starting a group.</h1>
      <ul className="try"><li>Phone number and a texted code. No passwords.</li><li>Join with a link or code, find a group, or start one: HOA, apartment building or neighborhood.</li><li>Numbers from an imported WhatsApp chat join automatically. Everyone else waits for an admin.</li><li>Importing is optional at sign-up. Choosing “Later” leaves a reminder in the app.</li><li>Any member can invite with a link, a ready-made WhatsApp message, a text or a lobby QR code.</li></ul>
      <span className="lbl">Prototype controls</span>
      <div className="ctas">
        <button className="btn ghost" onClick={() => window.zObReset && window.zObReset()}>Start over</button>
        <a className="btn ghost" href={'Onboarding.html?j=' + Z.DEMO[1].code} onClick={() => sessionStorage.removeItem(OB_STEP)}>Open an invite link</a>
        {pend.length > 0 && <button className="btn ghost" onClick={() => { const j = Z.get().joined; Z.patch({ pending: [], members: [...(Z.get().members || []), ...pend], joined: j ? { ...j, status: 'member' } : j }); }}>Admin approves ({pend.length})</button>}
        <button className="btn ghost" onClick={() => { if (confirm('Clear the saved group, joins and import from this browser?')) { Z.reset(); window.zObReset && window.zObReset(); } }}>Clear group data</button>
      </div>
    </aside>
    <div className="phone"><div className="screen"><Onboarding /></div></div>
  </div>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<OnboardStage />);
