/* Zing Resident App · shared components (chrome, cards, timeline) */
const { useState, useRef } = React;
const {
  ICONS, TASKS, PACKAGES, DAY_START, DAY_END, HOUR_PX, px, totalHeight,
  fmtDayLabel, fmtDateLabel, fmtTime, fmtTimeShort, fmtDur,
  openWindows, busyFor, firstFit, startToday, P, LineIcon,
} = window;

/* ---------------- App bar (co-brand + Text us) ---------------- */
function AppBar() {
  return (
    <header className="appbar">
      <div className="cobrand">
        <img className="zing" src="icons/zing-logo.svg" alt="Zing" />
        <div className="divider"></div>
        <img className="bezel" src="icons/bezel.webp" alt="Bezel Miami" />
      </div>
      <button className="textus">Text us</button>
    </header>
  );
}

/* ---------------- Bottom navigation ---------------- */
function BottomNav({ tab, setTab }) {
  const items = [
    { id: "home", label: "Home", d: P.home },
    { id: "bookings", label: "Your bookings", d: P.cal },
    { id: "profile", label: "Profile", d: P.user },
  ];
  return (
    <nav className="bnav">
      {items.map(it => (
        <button key={it.id} className={tab === it.id ? "on" : ""} onClick={() => setTab(it.id)}>
          <LineIcon d={it.d} w={23} />
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ---------------- Compact swipeable date strip (arrows + chips) ---------------- */
function DateStrip({ days, idx, setIdx }) {
  const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const trackRef = useRef(null);
  React.useEffect(() => {
    const el = trackRef.current; if (!el) return;
    const chip = el.children[idx];
    if (chip) el.scrollTo({ left: chip.offsetLeft - el.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
  }, [idx]);
  return (
    <div className="datestrip">
      <button className="datestrip__arrow" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0} aria-label="Previous day">
        <LineIcon d={P.left} w={18} />
      </button>
      <div className="datestrip__track" ref={trackRef}>
        {days.map((d, i) => (
          <div key={i} className={"dchip" + (i === idx ? " dchip--on" : "")} onClick={() => setIdx(i)}>
            <span>{DOW[d.getDay()]}</span>
            <b>{d.getDate()}</b>
          </div>
        ))}
      </div>
      <button className="datestrip__arrow" onClick={() => setIdx(Math.min(days.length - 1, idx + 1))} disabled={idx === days.length - 1} aria-label="Next day">
        <LineIcon d={P.right} w={18} />
      </button>
    </div>
  );
}

/* ---------------- Tasks / Packages segmented ---------------- */
function Segmented({ mode, setMode }) {
  return (
    <div className="seg" role="tablist">
      <button role="tab" aria-selected={mode === "tasks"} onClick={() => setMode("tasks")}>
        <span className="gi"><LineIcon d={P.spark} w={20} /></span> Tasks
      </button>
      <button role="tab" aria-selected={mode === "packages"} onClick={() => setMode("packages")}>
        <span className="gi"><LineIcon d={P.bag} w={19} /></span> Packages
      </button>
    </div>
  );
}

/* ---------------- Task card (with on-card stepper for count-based tasks) ---------------- */
function TaskCard({ task, item, onToggle, onStep }) {
  const inCart = !!item;
  const stepped = inCart && task.steps;
  const price = stepped ? task.steps[item.stepIdx].price : task.price;
  const dur = stepped ? task.steps[item.stepIdx].dur : task.dur;
  return (
    <div className={"tcard" + (inCart ? " in-cart" : "")}
      onClick={() => { if (inCart && task.steps) return; onToggle(task); }}>
      {inCart && <span className="tcard__check" onClick={(e) => { e.stopPropagation(); onToggle(task); }}><LineIcon d={inCart && task.steps ? P.close : P.check} w={14} sw={2} /></span>}
      <div className={"tcard__icon" + (/\.png$/.test(task.icon) ? " tcard__icon--photo" : "")}><img src={ICONS + task.icon} alt="" /></div>
      <div className="tcard__name">{task.name}</div>
      {stepped ? (
        <div className="qstep" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onStep(task, -1)} disabled={item.stepIdx === 0} aria-label="Fewer">−</button>
          <span className="qstep__lbl">{task.steps[item.stepIdx].label}</span>
          <button onClick={() => onStep(task, 1)} disabled={item.stepIdx === task.steps.length - 1} aria-label="More">+</button>
        </div>
      ) : null}
      <div className="tcard__dur">~{fmtDur(dur)}</div>
      <div className="tcard__price">${price}</div>
    </div>
  );
}

function GhostCard({ icon, title, sub, onClick }) {
  return (
    <div className="tcard tcard--ghost" onClick={onClick}>
      <div className="tcard__plus">{icon}</div>
      <div className="tcard__name">{title}</div>
      <div className="tcard__sub">{sub}</div>
    </div>
  );
}

/* ---------------- Package card ---------------- */
function PackageCard({ pkg, onOpen }) {
  return (
    <div className="pcard" onClick={() => onOpen(pkg)}>
      <div className="pcard__icon"><img src={ICONS + pkg.icon} alt="" /></div>
      <div className="pcard__name">{pkg.name}</div>
      <div className="pcard__starting">Starting at</div>
      <div className="pcard__price">${pkg.price} <small>/ visit</small></div>
      {pkg.off && <div className="pcard__off">Up to 15% off for Weekly,<br/>Bi-Weekly, Monthly orders</div>}
    </div>
  );
}

/* ---------------- Date navigator ---------------- */
function DateNav({ date, onPrev, onNext, canPrev, canNext }) {
  return (
    <div className="datenav">
      <button className="datenav__btn" onClick={onPrev} disabled={!canPrev} aria-label="Previous day">
        <LineIcon d={P.left} w={20} />
      </button>
      <div className="datenav__label">
        <div className="datenav__day">{fmtDayLabel(date)}</div>
        <div className="datenav__date">{fmtDateLabel(date)}</div>
      </div>
      <button className="datenav__btn" onClick={onNext} disabled={!canNext} aria-label="Next day">
        <LineIcon d={P.right} w={20} />
      </button>
    </div>
  );
}

/* ---------------- Week strip (5 business days) ---------------- */
function WeekStrip({ days, activeKey, onPick, freeness }) {
  const DOW = ["S","M","T","W","T","F","S"];
  return (
    <div className="weekstrip">
      {days.map(d => {
        const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        return (
          <div key={k} className={"wchip" + (k === activeKey ? " wchip--on" : "")} onClick={() => onPick(d)}>
            <span>{DOW[d.getDay()]}</span>
            <b>{d.getDate()}</b>
            <i className="wchip__free"></i>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Day chips (rounded, availability dot left of label) ---------------- */
function DayChips({ days, idx, onPick, dur, variant }) {
  const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const todayKey = startToday().toDateString();
  return (
    <div className={"fdays" + (variant === "page" ? " fdays--page" : "")}>
      {days.map((d, i) => {
        let cls = "fchip";
        if (dur > 0) cls += firstFit(busyFor(d), dur) != null ? " fchip--free" : " fchip--full";
        if (i === idx) cls += " fchip--on";
        return (
          <div key={i} className={cls} onClick={(e) => { e.stopPropagation(); onPick(i); }}>
            <div className="fchip__top">
              <i className="fchip__dot"></i>
              <span className="fchip__dow">{d.toDateString() === todayKey ? "Today" : DOW[d.getDay()]}</span>
            </div>
            <b className="fchip__num">{d.getDate()}</b>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Timeline legend ---------------- */
function TimelineLegend({ booking }) {
  return (
    <div className="tlhint">
      <i><span className="sw sw--free"></span> Open</i>
      <i><span className="sw sw--busy"></span> Booked</i>
      {booking && <i><span className="sw sw--sel"></span> Your visit</i>}
    </div>
  );
}

/* ---------------- The day timeline ---------------- */
function Timeline({ busy, dur, selStart, onPick, onDragStart, showOpen }) {
  const trackRef = useRef(null);
  const dragRef = useRef(null);
  const hours = [];
  for (let h = DAY_START / 60; h <= DAY_END / 60; h++) hours.push(h);

  const handleTap = (e) => {
    if (!onPick) return;
    const rect = trackRef.current.getBoundingClientRect();
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    const minutes = DAY_START + (y / HOUR_PX) * 60;
    onPick(minutes);
  };

  const selDown = (e) => {
    if (!onDragStart) return;
    e.stopPropagation();
    const rect = trackRef.current.getBoundingClientRect();
    const py = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    dragRef.current = { grab: py - px(selStart) };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
  };
  const selMove = (e) => {
    if (!dragRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const py = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    const startMin = DAY_START + ((py - dragRef.current.grab) / HOUR_PX) * 60;
    onDragStart(startMin);
  };
  const selUp = () => { dragRef.current = null; };

  return (
    <div className="timeline">
      <div className="tl-gutter" style={{ height: totalHeight }}>
        {hours.map(h => (
          <div key={h} className="hr" style={{ top: px(h * 60) }}>{fmtTimeShort(h * 60)}</div>
        ))}
      </div>
      <div className="tl-track" ref={trackRef} style={{ height: totalHeight }} onClick={handleTap}>
        {/* hour + half-hour grid */}
        {hours.map(h => (
          <div key={"g" + h} className="tl-grid" style={{ top: px(h * 60) }}></div>
        ))}
        {hours.slice(0, -1).map(h => (
          <div key={"gh" + h} className="tl-grid tl-grid--half" style={{ top: px(h * 60 + 30) }}></div>
        ))}

        {/* open windows (skip slivers too short to be useful) */}
        {showOpen && openWindows(busy).filter(w => w.end - w.start >= 30).map((w, i) => {
          const h = px(w.end) - px(w.start);
          const covered = selStart != null && dur != null && selStart < w.end && selStart + dur > w.start;
          return (
            <div key={"o" + i} className="tl-open" style={{ top: px(w.start), height: h - 3 }}>
              {h >= 26 && !covered && <span className="tl-open__lbl">Open · {fmtDur(w.end - w.start)}</span>}
            </div>
          );
        })}

        {/* busy blocks */}
        {busy.map((b, i) => (
          <div key={"b" + i} className="tl-busy" style={{ top: px(b.start), height: px(b.end) - px(b.start) - 3 }}>
            <span className="tl-busy__lbl">{b.label}</span>
            {px(b.end) - px(b.start) > 34 && <span className="tl-busy__sub">{fmtTimeShort(b.start)}–{fmtTimeShort(b.end)} · {b.unit}</span>}
          </div>
        ))}

        {/* selected proposed block — draggable */}
        {selStart != null && dur != null && (
          <div className={"tl-sel" + (onDragStart ? " tl-sel--drag" : "")} style={{ top: px(selStart), height: px(selStart + dur) - px(selStart) - 3 }}
            onPointerDown={selDown} onPointerMove={selMove} onPointerUp={selUp} onPointerCancel={selUp}>
            <span className="tl-sel__grip tl-sel__grip--top"></span>
            <div className="tl-sel__time">{fmtTime(selStart)} – {fmtTime(selStart + dur)}</div>
            <div className="tl-sel__dur">{onDragStart ? "Click or drag \u00b7 " : ""}{fmtDur(dur)}</div>
            <span className="tl-sel__grip tl-sel__grip--bot"></span>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, {
  AppBar, BottomNav, DateStrip, DayChips, Segmented, TaskCard, GhostCard, PackageCard,
  DateNav, WeekStrip, TimelineLegend, Timeline,
});
