/* Zing Resident App · screens + flow wiring */
const { useState, useMemo, useEffect } = React;
const {
  ICONS, TASKS, TASK_BY_ID, PACKAGES,
  DAY_START, DAY_END,
  startToday, addBusinessDays, dateKey, fmtDayLabel, fmtDateLabel,
  fmtTime, fmtDur, busyFor, snapValid, firstFit, fits,
  P, LineIcon,
  AppBar, BottomNav, Segmented, TaskCard, GhostCard, PackageCard,
  DateNav, WeekStrip, TimelineLegend, Timeline,
} = window;

const FREQS = ["One-time", "Weekly", "Bi-weekly", "Monthly"];
const BUSINESS_DAYS = Array.from({ length: 12 }, (_, i) => addBusinessDays(startToday(), i));

/* ============================ Task detail modal ============================ */
function TaskModal({ task, inCart, onClose, onAdd }) {
  const [freq, setFreq] = useState("");
  const [opt, setOpt] = useState(task.opt ? task.opt.choices[0] : null);
  const [note, setNote] = useState("");
  const ready = freq !== "" && !inCart;

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <button className="sheet__close" onClick={onClose}><LineIcon d={P.close} w={16} /></button>
        <h3 className="sheet__title">{task.name}</h3>
        <div className="sheet__icon"><img src={ICONS + task.icon} alt="" /></div>
        <div className="sheet__price">${task.price}</div>
        <div className="sheet__dur"><LineIcon d={P.clock} w={14} /> About {fmtDur(task.dur)}</div>
        <p className="sheet__desc">{task.desc}</p>

        <div className="field">
          <label>Select frequency <span className="req">*(required)</span></label>
          <div className="selectwrap">
            <select value={freq} onChange={(e) => setFreq(e.target.value)}>
              <option value="">Select the frequency of this task</option>
              {FREQS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        {task.opt && (
          <div className="field">
            <label>{task.opt.label}</label>
            <div className="selectwrap">
              <select value={opt} onChange={(e) => setOpt(e.target.value)}>
                {task.opt.choices.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="field">
          <label>Any special instructions for this task?</label>
          <input type="text" placeholder="Make sure to do..." value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <button className="btn btn--primary btn--block" disabled={!ready}
          onClick={() => onAdd({ task, freq, opt, note })}>
          {inCart ? "Already in cart" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}

/* ============================ Package sheet ============================ */
function PackageModal({ pkg, onClose, onAdd }) {
  const tasks = pkg.tasks.map(id => TASK_BY_ID[id]);
  const dur = tasks.reduce((s, t) => s + t.dur, 0);
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <button className="sheet__close" onClick={onClose}><LineIcon d={P.close} w={16} /></button>
        <h3 className="sheet__title">{pkg.name}</h3>
        <div className="sheet__price">${pkg.price} <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-500)" }}>/ visit</span></div>
        <div className="sheet__dur"><LineIcon d={P.clock} w={14} /> About {fmtDur(dur)} per visit</div>
        <p className="sheet__desc">A curated bundle, handled in one visit. {pkg.off ? "Save up to 15% on recurring orders." : ""}</p>
        <div style={{ margin: "0 2px 18px" }}>
          {tasks.map(t => (
            <div key={t.id} className="citem">
              <div className="citem__icon"><img src={ICONS + t.icon} alt="" /></div>
              <div className="citem__main">
                <div className="citem__name">{t.name}</div>
                <div className="citem__meta">~{fmtDur(t.dur)}</div>
              </div>
              <div className="citem__price">${t.price}</div>
            </div>
          ))}
        </div>
        <button className="btn btn--primary btn--block" onClick={() => onAdd(pkg)}>Add package to cart</button>
      </div>
    </div>
  );
}

/* ============================ Home ============================ */
function Home({ mode, setMode, cart, onOpenTask, onOpenPkg, onCheckout }) {
  const cartIds = new Set(cart.map(c => c.taskId));
  const dur = cart.reduce((s, c) => s + c.dur, 0);
  return (
    <div className="scroll"><div className="pad page-anim">
      <div className="hello">Hello, Whit! <span className="wave">👋</span></div>
      <h1 className="h-title">What service would you like today?</h1>
      <div className="slotnudge"><span className="dot"></span> Only 2 slots left today!</div>

      <Segmented mode={mode} setMode={setMode} />

      {mode === "tasks" ? (
        <div className="grid">
          {TASKS.map(t => <TaskCard key={t.id} task={t} inCart={cartIds.has(t.id)} onOpen={onOpenTask} />)}
          <GhostCard icon={<LineIcon d={P.plus} w={26} />} title="Create Custom Task" sub="Tell us what you need" onClick={() => {}} />
          <GhostCard icon={<LineIcon d={P.phone} w={24} />} title="Request a Call" sub="Get a custom quote" onClick={() => {}} />
        </div>
      ) : (
        <>
          <p className="blurb">Save time, skip the guesswork. Choose a pre-built package that fits your routine, and let Zing handle the rest.</p>
          <div className="pgrid">
            {PACKAGES.map(p => <PackageCard key={p.id} pkg={p} onOpen={onOpenPkg} />)}
            <GhostCard icon={<LineIcon d={P.plus} w={26} />} title="Build Custom Package" sub="Choose your own tasks" onClick={() => setMode("tasks")} />
            <GhostCard icon={<LineIcon d={P.phone} w={24} />} title="Request a Call" sub="Get a custom quote" onClick={() => {}} />
          </div>
        </>
      )}
    </div>
    {cart.length > 0 && (
      <div className="selbar">
        <button className="selbar__btn" onClick={onCheckout}>
          <span className="selbar__count">{cart.length}</span>
          <span className="selbar__txt">{cart.length === 1 ? "item" : "items"} selected · ~{fmtDur(dur)}</span>
          <span className="selbar__cta">Book a time <LineIcon d={P.right} w={17} /></span>
        </button>
      </div>
    )}
    </div>
  );
}

/* ============================ Cart ============================ */
function Cart({ cart, onRemove, onBrowse, onCheckout }) {
  const dur = cart.reduce((s, c) => s + c.dur, 0);
  const subtotal = cart.reduce((s, c) => s + c.price, 0);

  if (cart.length === 0) {
    return (
      <div className="scroll"><div className="pad page-anim">
        <h2 className="page-title">Your cart</h2>
        <div className="empty">
          <div className="empty__icon"><LineIcon d={P.cart} w={28} /></div>
          <p>Your cart is empty.<br/>Bundle a few tasks into one visit.</p>
          <button className="btn btn--primary" onClick={onBrowse}>Browse services</button>
        </div>
      </div></div>
    );
  }

  return (
    <div className="scroll"><div className="pad page-anim" style={{ paddingBottom: 150 }}>
      <h2 className="page-title">Your cart</h2>

      <div className="estimate">
        <div className="estimate__ring"><LineIcon d={P.clock} w={34} sw={1.4} /></div>
        <div>
          <div className="estimate__big">~{fmtDur(dur)}</div>
          <div className="estimate__lbl">{cart.length} {cart.length === 1 ? "task" : "tasks"} bundled into one visit</div>
        </div>
      </div>

      <div className="card">
        <div className="card__head"><LineIcon d={P.bag} w={18} /> Your visit</div>
        {cart.map(c => (
          <div key={c.uid} className="citem">
            <div className="citem__icon"><img src={ICONS + c.icon} alt="" /></div>
            <div className="citem__main">
              <div className="citem__name">{c.name}</div>
              <div className="citem__meta">{c.freq}{c.opt ? ` · ${c.opt}` : ""} · ~{fmtDur(c.dur)}</div>
            </div>
            <div className="citem__price">${c.price}</div>
            <button className="citem__rm" onClick={() => onRemove(c.uid)} aria-label="Remove"><LineIcon d={P.trash} w={18} /></button>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="totalrow"><span>Subtotal</span><b>${subtotal}</b></div>
        <div className="totalrow"><span>Estimated time</span><b>~{fmtDur(dur)}</b></div>
        <div className="totalrow totalrow--grand"><span>Total</span><span className="amt">${subtotal}</span></div>
      </div>

      <div className="stickyfoot">
        <button className="btn btn--primary btn--block" onClick={onCheckout}>
          Choose a time <LineIcon d={P.right} w={18} />
        </button>
      </div>
    </div></div>
  );
}

/* ============================ Schedule (booking) ============================ */
function Schedule({ cart, onBack, onConfirm }) {
  const dur = cart.reduce((s, c) => s + c.dur, 0);
  const [idx, setIdx] = useState(0);
  const date = BUSINESS_DAYS[idx];
  const busy = useMemo(() => busyFor(date), [idx]);
  const [selStart, setSelStart] = useState(() => firstFit(busy, dur));

  // recompute a sensible default when the day changes
  useEffect(() => { setSelStart(firstFit(busy, dur)); }, [idx]);

  const pick = (raw) => { const s = snapValid(busy, raw, dur); if (s != null) setSelStart(s); };
  const nudge = (delta) => {
    if (selStart == null) return;
    const next = selStart + delta;
    if (fits(busy, next, dur)) setSelStart(next);
  };
  const canDown = selStart != null && fits(busy, selStart + 15, dur);
  const canUp = selStart != null && fits(busy, selStart - 15, dur);

  const weekStart = idx - (idx % 5);
  const weekDays = BUSINESS_DAYS.slice(weekStart, weekStart + 5);

  return (
    <div className="scroll"><div className="pad page-anim" style={{ paddingBottom: 150 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 14px" }}>
        <button className="datenav__btn" onClick={onBack} aria-label="Back"><LineIcon d={P.left} w={20} /></button>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--forest-800)", margin: 0 }}>Choose a time</h2>
      </div>

      <div className="estimate">
        <div className="estimate__ring"><LineIcon d={P.clock} w={34} sw={1.4} /></div>
        <div>
          <div className="estimate__big">~{fmtDur(dur)}</div>
          <div className="estimate__lbl">{cart.length} {cart.length === 1 ? "task" : "tasks"} · we'll arrive and handle it in one visit</div>
        </div>
      </div>

      <DateNav date={date}
        onPrev={() => setIdx(i => Math.max(0, i - 1))} onNext={() => setIdx(i => Math.min(BUSINESS_DAYS.length - 1, i + 1))}
        canPrev={idx > 0} canNext={idx < BUSINESS_DAYS.length - 1} />

      <WeekStrip days={weekDays} activeKey={dateKey(date)} onPick={(d) => setIdx(BUSINESS_DAYS.findIndex(x => dateKey(x) === dateKey(d)))} />

      <TimelineLegend booking />
      <div key={idx} className="slide-anim">
        <Timeline busy={busy} dur={dur} selStart={selStart} onPick={pick} showOpen />
      </div>

      {selStart != null ? (
        <div className="stepper">
          <div className="stepper__lbl">Arrival <b>{fmtTime(selStart)}</b></div>
          <div className="stepper__btns">
            <button onClick={() => nudge(-15)} disabled={!canUp} aria-label="Earlier">−</button>
            <button onClick={() => nudge(15)} disabled={!canDown} aria-label="Later">+</button>
          </div>
        </div>
      ) : (
        <div className="stepper"><div className="stepper__lbl">No open block fits this visit today — try another day.</div></div>
      )}

      <div className="stickyfoot">
        <button className="btn btn--primary btn--block" disabled={selStart == null}
          onClick={() => onConfirm({ date, start: selStart, dur })}>
          {selStart != null ? `Reserve ${fmtTime(selStart)} – ${fmtTime(selStart + dur)}` : "Pick a time to reserve"}
        </button>
      </div>
    </div></div>
  );
}

/* ============================ Confirmation ============================ */
function Confirm({ cart, booking, onDone, onViewCal }) {
  const subtotal = cart.reduce((s, c) => s + c.price, 0);
  return (
    <div className="scroll"><div className="pad">
      <div className="confirm">
        <div className="confirm__badge"><LineIcon d={P.check} w={38} sw={1.8} /></div>
        <h2>You're all set.</h2>
        <p>Your Zing visit is reserved for {fmtDayLabel(booking.date)}, {fmtDateLabel(booking.date)} from {fmtTime(booking.start)} to {fmtTime(booking.start + booking.dur)}. We'll take it from here.</p>
      </div>
      <div className="card">
        <div className="totalrow"><span>When</span><b>{fmtDayLabel(booking.date)} {fmtDateLabel(booking.date)}</b></div>
        <div className="totalrow"><span>Time</span><b>{fmtTime(booking.start)} – {fmtTime(booking.start + booking.dur)}</b></div>
        <div className="totalrow"><span>Visit length</span><b>~{fmtDur(booking.dur)}</b></div>
        <div className="totalrow"><span>Apartment</span><b>Bezel Miami · 1925</b></div>
        <div className="totalrow totalrow--grand"><span>Total</span><span className="amt">${subtotal}</span></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button className="btn btn--primary btn--block" onClick={onViewCal}>See it on the calendar</button>
        <button className="btn btn--ghost btn--block" onClick={onDone}>Back to services</button>
      </div>
    </div></div>
  );
}

/* ============================ Calendar tab (availability) ============================ */
function CalendarTab({ onOrder }) {
  const [idx, setIdx] = useState(0);
  const date = BUSINESS_DAYS[idx];
  const busy = useMemo(() => busyFor(date), [idx]);
  const weekStart = idx - (idx % 5);
  const weekDays = BUSINESS_DAYS.slice(weekStart, weekStart + 5);

  return (
    <div className="scroll"><div className="pad page-anim" style={{ paddingBottom: 150 }}>
      <h2 className="page-title">Building availability</h2>

      <DateNav date={date}
        onPrev={() => setIdx(i => Math.max(0, i - 1))} onNext={() => setIdx(i => Math.min(BUSINESS_DAYS.length - 1, i + 1))}
        canPrev={idx > 0} canNext={idx < BUSINESS_DAYS.length - 1} />

      <WeekStrip days={weekDays} activeKey={dateKey(date)} onPick={(d) => setIdx(BUSINESS_DAYS.findIndex(x => dateKey(x) === dateKey(d)))} />

      <TimelineLegend />
      <div key={idx} className="slide-anim">
        <Timeline busy={busy} dur={null} selStart={null} onPick={null} showOpen />
      </div>

      <p className="blurb" style={{ textAlign: "center", margin: "18px 4px 0" }}>Zing hosts work 8:00 AM – 6:00 PM, Monday to Friday. Open windows are first-come — add your tasks to grab one.</p>

      <div className="stickyfoot">
        <button className="btn btn--primary btn--block" onClick={onOrder}>Order a service <LineIcon d={P.right} w={18} /></button>
      </div>
    </div></div>
  );
}

/* ============================ Profile ============================ */
function Profile() {
  return (
    <div className="scroll"><div className="pad page-anim">
      <h2 className="page-title">Your profile</h2>
      <div className="card">
        <div className="card__head"><LineIcon d={P.user} w={18} /> Personal information</div>
        <label className="plabel">Full name</label>
        <input className="pinput" defaultValue="Whit" />
        <label className="plabel">Phone number</label>
        <input className="pinput" defaultValue="770 656 0139" />
        <label className="plabel">Apartment</label>
        <input className="pinput" defaultValue="Bezel Miami · 1925" />
        <label className="plabel">Pets info</label>
        <input className="pinput" placeholder="e.g. friendly dog, please keep the bedroom door closed" />
        <button className="btn btn--primary btn--block" style={{ marginTop: 4 }}>Save changes</button>
      </div>
      <div className="card">
        <div className="card__head"><LineIcon d={P.cart} w={18} /> Payment methods</div>
        <p style={{ fontSize: 14, color: "var(--ink-600)", margin: "0 0 14px" }}>You have no saved cards.</p>
        <button className="btn btn--ghost btn--block">Add new card</button>
      </div>
      <button className="btn btn--danger btn--block">Log out</button>
    </div></div>
  );
}

/* ============================ App ============================ */
function App() {
  const [tab, setTab] = useState("home");
  const [mode, setMode] = useState("tasks");
  const [cart, setCart] = useState([]);
  const [modalTask, setModalTask] = useState(null);
  const [modalPkg, setModalPkg] = useState(null);
  const [booking, setBooking] = useState(null);   // null | "schedule" | "confirm"
  const [confirmed, setConfirmed] = useState(null);

  const cartIds = new Set(cart.map(c => c.taskId));

  const addTask = ({ task, freq, opt, note }) => {
    setCart(c => [...c, { uid: Date.now() + Math.random(), taskId: task.id, name: task.name, price: task.price, dur: task.dur, icon: task.icon, freq, opt, note }]);
    setModalTask(null);
  };
  const addPkg = (pkg) => {
    const items = pkg.tasks.filter(id => !cartIds.has(id)).map(id => {
      const t = TASK_BY_ID[id];
      return { uid: Date.now() + Math.random(), taskId: t.id, name: t.name, price: t.price, dur: t.dur, icon: t.icon, freq: "Weekly", opt: t.opt ? t.opt.choices[0] : null, note: "" };
    });
    setCart(c => [...c, ...items]);
    setModalPkg(null);
    setTab("cart");
  };
  const removeItem = (uid) => setCart(c => c.filter(x => x.uid !== uid));

  const checkout = () => setBooking("schedule");
  const confirm = (b) => { setConfirmed(b); setBooking("confirm"); };
  const done = () => { setCart([]); setBooking(null); setConfirmed(null); setTab("home"); };

  let body;
  if (booking === "schedule") body = <Schedule cart={cart} onBack={() => setBooking(null)} onConfirm={confirm} />;
  else if (booking === "confirm") body = <Confirm cart={cart} booking={confirmed} onDone={done} onViewCal={() => { done(); setTab("calendar"); }} />;
  else if (tab === "home") body = <Home mode={mode} setMode={setMode} cart={cart} onOpenTask={setModalTask} onOpenPkg={setModalPkg} onCheckout={checkout} />;
  else if (tab === "calendar") body = <CalendarTab onOrder={() => setTab("home")} />;
  else if (tab === "profile") body = <Profile />;
  else body = <Cart cart={cart} onRemove={removeItem} onBrowse={() => setTab("home")} onCheckout={checkout} />;

  return (
    <div className="phone">
      <div className="phone-screen">
        <div className="app">
          <AppBar />
          {body}
          <BottomNav tab={booking ? "cart" : tab} setTab={(t) => { setBooking(null); setTab(t); }} cartCount={cart.length} />
        </div>
        {modalTask && <TaskModal task={modalTask} inCart={cartIds.has(modalTask.id)} onClose={() => setModalTask(null)} onAdd={addTask} />}
        {modalPkg && <PackageModal pkg={modalPkg} onClose={() => setModalPkg(null)} onAdd={addPkg} />}
      </div>
      <div className="phone-notch"></div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
