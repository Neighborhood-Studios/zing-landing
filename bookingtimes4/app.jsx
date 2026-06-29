/* Zing Resident App · hero task grid + floating availability bar that opens a
   dedicated full-page time picker.
   Tabs: Home · Your bookings · Profile.
   Home = browse tasks/packages (2-col grid, toggle) and add to cart; a compact
   bar hovers above the nav showing the running total + 5-day availability
   (green/red dot + tint). Tapping it opens a chrome-less booking page (back
   button only) to place the visit on the calendar and reserve. */
const { useState, useMemo, useEffect } = React;
const {
  ICONS, TASKS, TASK_BY_ID, PACKAGES,
  startToday, addBusinessDays, fmtDayLabel, fmtDateLabel,
  fmtTime, fmtDur, busyFor, snapValid, firstFit, fits,
  P, LineIcon,
  AppBar, BottomNav, Segmented, TaskCard, GhostCard, PackageCard,
  DayChips, TimelineLegend, Timeline,
} = window;

const FREQS = ["One-time", "Weekly", "Bi-weekly", "Monthly"];
const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEK = 5;
const BUSINESS_DAYS = Array.from({ length: 45 }, (_, i) => addBusinessDays(startToday(), i));
const FIVE = BUSINESS_DAYS.slice(0, 5);
const monthLabel = (a, b) => a.getMonth() === b.getMonth()
  ? `${MONTHS_FULL[a.getMonth()]} ${a.getFullYear()}`
  : `${MONTHS[a.getMonth()]} – ${MONTHS[b.getMonth()]} ${b.getFullYear()}`;
const titleOf = (items) => items.length === 1 ? items[0].name : `${items[0].name} + ${items.length - 1} more`;

/* ============================ Package detail sheet ============================ */
function PackageModal({ pkg, added, onClose, onAdd }) {
  const tasks = pkg.tasks.map(id => TASK_BY_ID[id]);
  const dur = tasks.reduce((s, t) => s + t.dur, 0);
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <button className="sheet__close" onClick={onClose}><LineIcon d={P.close} w={16} /></button>
        <h3 className="sheet__title">{pkg.name}</h3>
        <div className="sheet__price">${pkg.price} <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-500)" }}>/ visit</span></div>
        <div className="sheet__dur"><LineIcon d={P.clock} w={14} /> About {fmtDur(dur)} per visit</div>
        <p className="sheet__desc">A curated bundle handled in one visit.{pkg.off ? " Save up to 15% on recurring orders." : ""}</p>
        <div style={{ margin: "2px 2px 18px" }}>
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
        <button className="btn btn--primary btn--block" onClick={() => onAdd(pkg)}>
          {added ? "Remove from cart" : "Add package to cart"}
        </button>
      </div>
    </div>
  );
}

/* ============================ Floating availability bar ============================ */
function FloatingBar({ cart, dayIdx, setDayIdx, onOpen }) {
  const dur = cart.reduce((s, c) => s + c.dur, 0);
  const date = FIVE[dayIdx];
  const active = dur > 0;
  return (
    <div className="fbar" onClick={onOpen}>
      <div className="fbar__head">
        <div className="fbar__total">
          <div className="fbar__ic"><LineIcon d={P.clock} w={17} /></div>
          <div style={{ minWidth: 0 }}>
            <div className="fbar__big">{active ? `~${fmtDur(dur)}` : "No tasks yet"}</div>
            <div className="fbar__sub">{active ? `${cart.length} ${cart.length === 1 ? "task" : "tasks"} · tap to pick a time` : "Add tasks to build a visit"}</div>
          </div>
        </div>
        <div className="fbar__day"><b>{fmtDayLabel(date)}</b><span>{fmtDateLabel(date)}</span></div>
      </div>
      <DayChips days={FIVE} idx={dayIdx} onPick={(i) => { setDayIdx(i); onOpen(); }} dur={dur} />
    </div>
  );
}

/* ============================ Dedicated booking page ============================ */
function BookingPage({ cart, dayIdx, setDayIdx, onBack, onReserve }) {
  const dur = cart.reduce((s, c) => s + c.dur, 0);
  const date = BUSINESS_DAYS[dayIdx];
  const busy = useMemo(() => busyFor(date), [dayIdx]);
  const [selStart, setSelStart] = useState(null);
  const [weekStart, setWeekStart] = useState(Math.floor(dayIdx / WEEK) * WEEK);
  const active = dur > 0;

  useEffect(() => {
    if (dur === 0) { setSelStart(null); return; }
    setSelStart(prev => (prev != null && fits(busy, prev, dur)) ? prev : firstFit(busy, dur));
  }, [dur, dayIdx]);

  const weekDays = BUSINESS_DAYS.slice(weekStart, weekStart + WEEK);
  const localSel = dayIdx - weekStart;
  const goWeek = (delta) => {
    const ns = weekStart + delta * WEEK;
    if (ns < 0 || ns >= BUSINESS_DAYS.length) return;
    setWeekStart(ns);
    setDayIdx(Math.min(BUSINESS_DAYS.length - 1, ns + (dayIdx % WEEK)));
  };

  const pick = (raw) => { const s = snapStart(busy, raw, dur); if (s != null) setSelStart(s); };
  const nudge = (d) => { if (selStart == null) return; const n = selStart + d; if (fits(busy, n, dur)) setSelStart(n); };

  return (
    <div className="scroll bookpage page-anim"><div className="pad" style={{ paddingBottom: 120 }}>
      <div className="subhead">
        <button className="back" onClick={onBack}><LineIcon d={P.left} w={20} /></button>
        <h2>Pick your time</h2>
      </div>

      <div className="visitbar" style={{ marginTop: 0 }}>
        <div className="visitbar__ring"><LineIcon d={P.clock} w={30} sw={1.4} /></div>
        <div className="visitbar__t">
          <div className="visitbar__big">{active ? `~${fmtDur(dur)}` : "No tasks yet"}</div>
          <div className="visitbar__sub">{active ? `${cart.length} ${cart.length === 1 ? "task" : "tasks"} · one visit` : "Add tasks on the home screen"}</div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="weeknav">
          <button className="weeknav__arrow" onClick={() => goWeek(-1)} disabled={weekStart === 0} aria-label="Previous week"><LineIcon d={P.left} w={18} /></button>
          <div className="weeknav__label">
            <b>{monthLabel(weekDays[0], weekDays[weekDays.length - 1])}</b>
            <span>{weekStart === 0 ? "This week" : `${MONTHS[weekDays[0].getMonth()]} ${weekDays[0].getDate()} – ${MONTHS[weekDays[weekDays.length-1].getMonth()]} ${weekDays[weekDays.length-1].getDate()}`}</span>
          </div>
          <button className="weeknav__arrow" onClick={() => goWeek(1)} disabled={weekStart + WEEK >= BUSINESS_DAYS.length} aria-label="Next week"><LineIcon d={P.right} w={18} /></button>
        </div>
        <DayChips days={weekDays} idx={localSel} onPick={(i) => setDayIdx(weekStart + i)} dur={dur} variant="page" />
      </div>

      <div style={{ marginTop: 16 }}>
        <TimelineLegend booking={active} />
        {active && <div className="pickcue"><LineIcon d={P.clock} w={15} /> Tap an open slot or drag your visit to set a time</div>}
        {!active && <div className="bookhint">Add a task on the home screen to reserve — you can still preview open slots below.</div>}
        <div key={dayIdx} className="slide-anim">
          <Timeline busy={busy} dur={active ? dur : null} selStart={active ? selStart : null} onPick={active ? pick : null} onDragStart={active ? pick : null} showOpen />
        </div>
        {active && selStart == null && (
          <div className="stepper"><div className="stepper__lbl">No open block fits this visit — try another day (red = full).</div></div>
        )}
      </div>
    </div>

    <div className="stickyfoot stickyfoot--page">
      <button className="btn btn--primary btn--block" disabled={active && selStart == null}
        onClick={() => active ? onReserve({ date, start: selStart, dur }) : onBack()}>
        {active
          ? (selStart != null ? `Continue – ${fmtTime(selStart)} to ${fmtTime(selStart + dur)}` : "Pick a time on the calendar")
          : "Add a task to reserve"}
      </button>
    </div>
    </div>
  );
}

/* ============================ Faux Apple Pay sheet ============================ */
const FACE_ID = "M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2";
function ApplePaySheet({ amount, onCancel, onDone }) {
  const [stage, setStage] = useState("auth");
  useEffect(() => { const t = setTimeout(() => setStage("ok"), 1700); return () => clearTimeout(t); }, []);
  useEffect(() => { if (stage === "ok") { const t = setTimeout(onDone, 950); return () => clearTimeout(t); } }, [stage]);
  return (
    <div className="ap-scrim" onClick={onCancel}>
      <div className="ap-sheet" onClick={(e) => e.stopPropagation()}>
        <span className="ap-side"></span>
        <div className="ap-grab"></div>
        <div className="ap-head"><b>Apple Pay</b><button className="ap-x" onClick={onCancel}>✕</button></div>
        <div className="ap-row">
          <div className="ap-row__ic">ZING</div>
          <div className="ap-row__main"><div className="ap-row__t">Zing · Bezel Miami</div><div className="ap-row__s">Apartment 1925</div></div>
        </div>
        <div className="ap-row">
          <div className="ap-row__ic" style={{ background: "linear-gradient(135deg,#1a1a2e,#39507a)" }}>VISA</div>
          <div className="ap-row__main"><div className="ap-row__t">Visa  ····  4242</div><div className="ap-row__s">Default Card</div></div>
          <span className="ap-row__chev">›</span>
        </div>
        <div className="ap-row ap-row--total">
          <div className="ap-row__main"><div className="ap-row__t">Pay Zing</div></div>
          <div className="ap-amt">${amount.toFixed(2)}</div>
        </div>
        <div className="ap-foot">
          <div className={"ap-face" + (stage === "ok" ? " ap-face--ok" : "")}>
            {stage === "ok"
              ? <LineIcon d={P.check} w={26} sw={2.4} />
              : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={FACE_ID} /><path d="M9 10v1.2M15 10v1.2M12 10v2.6l-1 .8M9.6 15.2c.7.6 1.5.9 2.4.9s1.7-.3 2.4-.9" /></svg>}
          </div>
          <div className="ap-cta">{stage === "ok" ? "Done" : "Double-Click to Pay"}</div>
        </div>
      </div>
    </div>
  );
}

/* ============================ Checkout ============================ */
const ENTRY_OPTS = ["I'll be home", "The door's unlocked — come on in", "Use the Zing Access Station"];
const FREQ_SUB = { "One-time": "", "Weekly": "Save 15%", "Bi-weekly": "Save 10%", "Monthly": "Save 5%" };
const FREQ_OFF = { "One-time": 0, "Weekly": 0.15, "Bi-weekly": 0.10, "Monthly": 0.05 };

function Checkout({ cart, booking, freq, setFreq, onBack, onPlaceOrder }) {
  const subtotal = cart.reduce((s, c) => s + c.price, 0);
  const [tip, setTip] = useState({ mode: "pct", pct: 18 });
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(null);
  const [entry, setEntry] = useState("");
  const [notes, setNotes] = useState("");
  const [pay, setPay] = useState("apple");
  const [card, setCard] = useState({ num: "", exp: "", cvc: "", zip: "" });
  const [apOpen, setApOpen] = useState(false);

  const tipAmt = tip.mode === "pct" ? Math.round(subtotal * tip.pct) / 100
    : tip.mode === "custom" ? (parseFloat(tip.custom) || 0) : 0;
  const planOff = Math.round(subtotal * FREQ_OFF[freq] * 100) / 100;
  const discount = applied ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const total = Math.max(0, subtotal - planOff - discount + tipAmt);

  const cardOk = card.num.replace(/\s/g, "").length >= 12 && card.exp.length >= 4 && card.cvc.length >= 3;
  const ready = entry !== "" && (pay === "apple" || cardOk);

  const place = () => onPlaceOrder({ tip: tipAmt, discount, total, freq, entry, notes, pay: pay === "apple" ? "Apple Pay" : "Visa ····4242" });

  return (
    <div className="scroll bookpage page-anim"><div className="pad" style={{ paddingTop: 4, paddingBottom: 40 }}>
      <div className="subhead">
        <button className="back" onClick={onBack}><LineIcon d={P.left} w={20} /></button>
        <h2>Last step</h2>
      </div>

      <div className="recap">
        <div className="recap__ic"><LineIcon d={P.cal} w={18} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="recap__t">{fmtDayLabel(booking.date)}, {fmtDateLabel(booking.date)} · {fmtTime(booking.start)}–{fmtTime(booking.start + booking.dur)}</div>
          <div className="recap__s">{cart.length} {cart.length === 1 ? "task" : "tasks"} · ~{fmtDur(booking.dur)} · Bezel Miami 1925</div>
        </div>
      </div>

      {/* Frequency */}
      <div className="card card--active">
        <div className="secttl"><LineIcon d={P.refresh} w={17} /> How often?</div>
        <div className="freqgrid">
          {FREQS.map(f => (
            <button key={f} className={freq === f ? "freqgrid__on" : ""} onClick={() => setFreq(f)}>
              {f}{FREQ_SUB[f] ? <span className="freqgrid__sub">{FREQ_SUB[f]}</span> : null}
            </button>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className={"card" + (tip.mode !== "none" && (tip.mode === "pct" || tipAmt > 0) ? " card--active" : "")}>
        <div className="secttl"><LineIcon d={P.spark} w={17} /> Add a tip for your Zing cleaner</div>
        <div className="tiprow">
          {[15, 18, 20].map(p => (
            <button key={p} className={"tipbtn" + (tip.mode === "pct" && tip.pct === p ? " tipbtn--on" : "")}
              onClick={() => setTip({ mode: "pct", pct: p })}>
              {p}%<small>${(Math.round(subtotal * p) / 100).toFixed(2)}</small>
            </button>
          ))}
        </div>
        <div className="tipcustom">
          <div className="tipcustom__wrap">
            <span>$</span>
            <input type="text" inputMode="decimal" placeholder="Add a custom amount" value={tip.mode === "custom" ? (tip.custom || "") : ""}
              onChange={(e) => setTip({ mode: "custom", custom: e.target.value.replace(/[^0-9.]/g, "") })} />
          </div>
        </div>
        <button className={"notip" + (tip.mode === "none" ? " notip--on" : "")} onClick={() => setTip({ mode: "none" })}>No tip</button>
      </div>

      {/* Entry details */}
      <div className={"card" + (entry ? " card--active" : "")}>
        <div className="secttl"><LineIcon d={P.home} w={17} /> How will we get in?</div>
        <div className="field" style={{ marginBottom: 12 }}>
          <div className="selectwrap">
            <select value={entry} onChange={(e) => setEntry(e.target.value)}>
              <option value="">Select an option…</option>
              {ENTRY_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Any entry or special instructions?</label>
          <input type="text" placeholder="Knock before entering, friendly dog inside…" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      {/* Coupon */}
      <div className={"card" + (applied ? " card--active" : "")}>
        <div className="secttl"><LineIcon d={P.bag} w={17} /> Have a coupon code?</div>
        <div className="coupon">
          <input type="text" placeholder="Enter coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} />
          <button disabled={!coupon.trim()} onClick={() => setApplied(coupon.trim())}>Apply</button>
        </div>
        {applied && <div className="coupon__ok"><LineIcon d={P.check} w={15} sw={2} /> “{applied}” applied · 10% off</div>}
      </div>

      {/* Payment */}
      <div className="card card--active">
        <div className="secttl"><LineIcon d={P.cart} w={17} /> Payment</div>
        <div className="paymethod">
          <div className={"payopt" + (pay === "apple" ? " payopt--on" : "")} onClick={() => setPay("apple")}>
            <div className="payopt__radio"></div>
            <div className="payopt__label">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.13-2.5.77-3.1.77-.62 0-1.65-.75-2.7-.73-1.4.02-2.67.8-3.38 2.05-1.44 2.5-.37 6.2 1.04 8.23.69 1 1.5 2.1 2.57 2.06 1.03-.04 1.42-.66 2.67-.66 1.24 0 1.6.66 2.69.64 1.11-.02 1.81-1 2.49-2 .78-1.15 1.1-2.26 1.12-2.32-.02-.01-2.15-.83-2.17-3.25zM15.5 6.3c.56-.7.95-1.62.84-2.55-.81.03-1.8.54-2.39 1.23-.52.6-.98 1.58-.86 2.48.9.07 1.83-.46 2.41-1.16z" /></svg>
              Apple Pay
            </div>
            <span className="payopt__hint">Fastest</span>
          </div>
          <div className={"payopt" + (pay === "card" ? " payopt--on" : "")} onClick={() => setPay("card")}>
            <div className="payopt__radio"></div>
            <div className="payopt__label">Credit or debit card</div>
          </div>
        </div>
        {pay === "card" && (
          <div className="cardform">
            <input className="full" placeholder="Card number" inputMode="numeric" value={card.num} onChange={(e) => setCard({ ...card, num: e.target.value })} />
            <input placeholder="MM / YY" inputMode="numeric" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} />
            <input placeholder="CVC" inputMode="numeric" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} />
            <input className="full" placeholder="Billing ZIP" inputMode="numeric" value={card.zip} onChange={(e) => setCard({ ...card, zip: e.target.value })} />
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="card">
        <div className="totalrow"><span>Subtotal</span><b>${subtotal.toFixed(2)}</b></div>
        {planOff > 0 && <div className="totalrow"><span>{freq} plan ({Math.round(FREQ_OFF[freq]*100)}% off)</span><b style={{ color: "var(--success-600)" }}>−${planOff.toFixed(2)}</b></div>}
        {discount > 0 && <div className="totalrow"><span>Coupon</span><b style={{ color: "var(--success-600)" }}>−${discount.toFixed(2)}</b></div>}
        <div className="totalrow"><span>Tip{tip.mode === "pct" ? ` (${tip.pct}%)` : ""}</span><b>${tipAmt.toFixed(2)}</b></div>
        <div className="totalrow totalrow--grand"><span>Total</span><span className="amt">${total.toFixed(2)}</span></div>
      </div>

      {pay === "apple" ? (
        <button className="applebtn" disabled={!ready} style={!ready ? { opacity: .45 } : null} onClick={() => ready && setApOpen(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.13-2.5.77-3.1.77-.62 0-1.65-.75-2.7-.73-1.4.02-2.67.8-3.38 2.05-1.44 2.5-.37 6.2 1.04 8.23.69 1 1.5 2.1 2.57 2.06 1.03-.04 1.42-.66 2.67-.66 1.24 0 1.6.66 2.69.64 1.11-.02 1.81-1 2.49-2 .78-1.15 1.1-2.26 1.12-2.32-.02-.01-2.15-.83-2.17-3.25zM15.5 6.3c.56-.7.95-1.62.84-2.55-.81.03-1.8.54-2.39 1.23-.52.6-.98 1.58-.86 2.48.9.07 1.83-.46 2.41-1.16z" /></svg>
          Pay
        </button>
      ) : (
        <button className="btn btn--primary btn--block" disabled={!ready} onClick={place}>Place order · ${total.toFixed(2)}</button>
      )}
      <div style={{ textAlign: "center", fontSize: 11.5, color: "var(--ink-500)", marginTop: 12, lineHeight: 1.5 }}>
        You won't be charged until your visit is complete. We'll text you to confirm timing.
      </div>
    </div>

    {apOpen && <ApplePaySheet amount={total} onCancel={() => setApOpen(false)} onDone={() => { setApOpen(false); place(); }} />}
    </div>
  );
}

/* ============================ Home (hero grid + floating bar) ============================ */
function Home({ cart, dayIdx, setDayIdx, onTaskClick, onStep, onOpenPkg, onOpenBooking }) {
  const [mode, setMode] = useState("tasks");
  const itemBy = Object.fromEntries(cart.map(c => [c.taskId, c]));

  return (
    <>
      <div className="scroll"><div className="pad page-anim" style={{ paddingBottom: 222 }}>
        <div className="hero">
          <div className="hi">Hello, Whit <span className="wave">👋</span></div>
          <h1>Book your clean.</h1>
        </div>

        <Segmented mode={mode} setMode={setMode} />

        {mode === "tasks" ? (
          <div className="grid">
            {TASKS.map(t => <TaskCard key={t.id} task={t} item={itemBy[t.id]} onToggle={onTaskClick} onStep={onStep} />)}
            <GhostCard icon={<LineIcon d={P.plus} w={26} />} title="Create Custom Task" sub="Tell us what you need" onClick={() => {}} />
            <GhostCard icon={<LineIcon d={P.phone} w={24} />} title="Request a Call" sub="Get a custom quote" onClick={() => {}} />
          </div>
        ) : (
          <>
            <p className="blurb">Save time, skip the guesswork. Choose a pre-built bundle that fits your routine and let Zing handle the rest.</p>
            <div className="pgrid">
              {PACKAGES.map(p => <PackageCard key={p.id} pkg={p} onOpen={onOpenPkg} />)}
              <GhostCard icon={<LineIcon d={P.plus} w={26} />} title="Build Custom Package" sub="Choose your own tasks" onClick={() => setMode("tasks")} />
              <GhostCard icon={<LineIcon d={P.phone} w={24} />} title="Request a Call" sub="Get a custom quote" onClick={() => {}} />
            </div>
          </>
        )}
      </div></div>

      <FloatingBar cart={cart} dayIdx={dayIdx} setDayIdx={setDayIdx} onOpen={onOpenBooking} />
    </>
  );
}

/* ============================ Your bookings ============================ */
function bookingRow(b, done) {
  const d = b.date;
  return (
    <div key={b.id} className={"upcoming" + (done ? " upcoming--done" : "")}>
      <div className="upcoming__date"><b>{d.getDate()}</b><span>{MONTHS[d.getMonth()]}</span></div>
      <div className="upcoming__main">
        <div className="upcoming__t">{b.title}</div>
        <div className="upcoming__s">{fmtDayLabel(d)} · {fmtTime(b.start)} – {fmtTime(b.start + b.dur)}</div>
      </div>
      <span className={"vtag" + (done ? " vtag--done" : "")}>{done ? "Done" : b.freq === "One-time" ? "Booked" : b.freq}</span>
    </div>
  );
}

function Bookings({ bookings, onBrowse }) {
  const subs = bookings.filter(b => b.freq !== "One-time");
  const completed = [
    { id: "c1", title: "Vacuum & Floor Magic", date: addBusinessDays(startToday(), -6), start: 600, dur: 40, freq: "One-time" },
    { id: "c2", title: "Zing Bathroom Clean (Full) + 1 more", date: addBusinessDays(startToday(), -11), start: 540, dur: 75, freq: "Weekly" },
  ];
  return (
    <div className="scroll"><div className="pad page-anim">
      <h2 className="page-title">Your bookings</h2>
      <div className="card">
        <div className="card__head"><LineIcon d={P.cal} w={18} /> Upcoming visits</div>
        {bookings.length ? bookings.map(b => bookingRow(b, false)) : (
          <div className="visitcard">
            <div className="visitcard__ico"><LineIcon d={P.cal} w={24} /></div>
            <p>No upcoming visits.</p>
            <a onClick={onBrowse}>Book a clean →</a>
          </div>
        )}
      </div>
      <div className="card">
        <div className="card__head"><LineIcon d={P.refresh} w={18} /> Subscriptions</div>
        {subs.length ? subs.map(b => (
          <div key={b.id} className="upcoming">
            <div className="upcoming__date"><LineIcon d={P.refresh} w={22} /></div>
            <div className="upcoming__main">
              <div className="upcoming__t">{b.title}</div>
              <div className="upcoming__s">{b.freq} · next {fmtDayLabel(b.date)} {fmtDateLabel(b.date)}</div>
            </div>
            <span className="vtag">{b.freq}</span>
          </div>
        )) : (
          <div className="visitcard">
            <div className="visitcard__ico"><LineIcon d={P.refresh} w={24} /></div>
            <p>No recurring services yet.</p>
            <a onClick={onBrowse}>Set up a routine →</a>
          </div>
        )}
      </div>
      <div className="card">
        <div className="card__head"><LineIcon d={P.check} w={18} /> Completed visits</div>
        {completed.map(b => bookingRow(b, true))}
      </div>
    </div></div>
  );
}

/* ============================ Confirmation ============================ */
function Confirm({ booking, onDone }) {
  const subtotal = booking.items.reduce((s, c) => s + c.price, 0);
  return (
    <div className="scroll"><div className="pad">
      <div className="confirm">
        <div className="confirm__badge"><LineIcon d={P.check} w={38} sw={1.8} /></div>
        <h2>You're all set.</h2>
        <p>Your Zing visit is reserved for {fmtDayLabel(booking.date)}, {fmtDateLabel(booking.date)} from {fmtTime(booking.start)} to {fmtTime(booking.start + booking.dur)}. We'll take it from here.</p>
      </div>
      <div className="card">
        <div className="card__head"><LineIcon d={P.bag} w={18} /> Your visit</div>
        {booking.items.map(c => (
          <div key={c.uid} className="citem">
            <div className="citem__icon"><img src={ICONS + c.icon} alt="" /></div>
            <div className="citem__main">
              <div className="citem__name">{c.name}</div>
              <div className="citem__meta">{c.opt ? `${c.opt} · ` : ""}~{fmtDur(c.dur)}</div>
            </div>
            <div className="citem__price">${c.price}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="totalrow"><span>When</span><b>{fmtDayLabel(booking.date)} {fmtDateLabel(booking.date)}</b></div>
        <div className="totalrow"><span>Time</span><b>{fmtTime(booking.start)} – {fmtTime(booking.start + booking.dur)}</b></div>
        <div className="totalrow"><span>Frequency</span><b>{booking.freq}</b></div>
        <div className="totalrow"><span>Apartment</span><b>Bezel Miami · 1925</b></div>
        <div className="totalrow totalrow--grand"><span>Total</span><span className="amt">${subtotal}</span></div>
      </div>
      <button className="btn btn--primary btn--block" onClick={onDone}>Book another clean</button>
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
  const [view, setView] = useState("app");        // "app" | "booking" | "checkout"
  const [dayIdx, setDayIdx] = useState(0);
  const [cart, setCart] = useState([]);
  const [freq, setFreq] = useState("One-time");
  const [pending, setPending] = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [modalPkg, setModalPkg] = useState(null);

  const cartIds = new Set(cart.map(c => c.taskId));
  const mkItem = (t, stepIdx = 0) => {
    const s = t.steps ? t.steps[stepIdx] : null;
    return { uid: t.id, taskId: t.id, name: t.name, price: s ? s.price : t.price, dur: s ? s.dur : t.dur, icon: t.icon, stepIdx, opt: s ? s.label : null, note: "" };
  };

  const onTaskClick = (task) => {
    if (cartIds.has(task.id)) { setCart(c => c.filter(x => x.taskId !== task.id)); return; }
    setCart(c => [...c, mkItem(task)]);
  };
  const stepItem = (task, delta) => setCart(c => c.map(x => {
    if (x.taskId !== task.id) return x;
    const i = Math.max(0, Math.min(task.steps.length - 1, x.stepIdx + delta));
    const s = task.steps[i];
    return { ...x, stepIdx: i, dur: s.dur, price: s.price, opt: s.label };
  }));

  const togglePkg = (pkg) => {
    const allIn = pkg.tasks.every(id => cartIds.has(id));
    if (allIn) setCart(c => c.filter(x => !pkg.tasks.includes(x.taskId)));
    else setCart(c => [...c, ...pkg.tasks.filter(id => !cartIds.has(id)).map(id => mkItem(TASK_BY_ID[id]))]);
    setModalPkg(null);
  };

  const reserve = (b) => { setPending(b); setView("checkout"); };
  const placeOrder = (extra) => {
    const booking = { id: "b" + Date.now(), ...pending, items: cart, freq, title: titleOf(cart), ...extra };
    setBookings(list => [booking, ...list]);
    setConfirmed(booking);
    setPending(null);
    setView("app");
  };
  const done = () => { setCart([]); setFreq("One-time"); setConfirmed(null); setPending(null); setView("app"); setTab("bookings"); };
  const goTab = (t) => { setConfirmed(null); setView("app"); setTab(t); };

  const chromeless = (view === "booking" || view === "checkout") && !confirmed;

  let body;
  if (confirmed) body = <Confirm booking={confirmed} onDone={done} />;
  else if (view === "checkout") body = <Checkout cart={cart} booking={pending} freq={freq} setFreq={setFreq} onBack={() => setView("booking")} onPlaceOrder={placeOrder} />;
  else if (view === "booking") body = <BookingPage cart={cart} dayIdx={dayIdx} setDayIdx={setDayIdx} onBack={() => setView("app")} onReserve={reserve} />;
  else if (tab === "bookings") body = <Bookings bookings={bookings} onBrowse={() => goTab("home")} />;
  else if (tab === "profile") body = <Profile />;
  else body = <Home cart={cart} dayIdx={dayIdx} setDayIdx={setDayIdx} onTaskClick={onTaskClick} onStep={stepItem} onOpenPkg={setModalPkg} onOpenBooking={() => setView("booking")} />;

  return (
    <div className="phone">
      <div className="phone-screen">
        <div className="app">
          {!chromeless && <AppBar />}
          {body}
          {!chromeless && <BottomNav tab={confirmed ? "bookings" : tab} setTab={goTab} />}
        </div>
        {modalPkg && <PackageModal pkg={modalPkg} added={modalPkg.tasks.every(id => cartIds.has(id))} onClose={() => setModalPkg(null)} onAdd={togglePkg} />}
      </div>
      <div className="phone-notch"></div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
