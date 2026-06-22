/* Zing Resident App · shared components (chrome, cards, timeline) */
const { useState, useRef } = React;
const {
  ICONS, TASKS, PACKAGES, DAY_START, DAY_END, HOUR_PX, px, totalHeight,
  fmtDayLabel, fmtDateLabel, fmtTime, fmtTimeShort, fmtDur,
  openWindows, P, LineIcon,
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
function BottomNav({ tab, setTab, cartCount }) {
  const items = [
    { id: "home", label: "Home", d: P.home },
    { id: "calendar", label: "Calendar", d: P.cal },
    { id: "profile", label: "Profile", d: P.user },
    { id: "cart", label: "Cart", d: P.cart },
  ];
  return (
    <nav className="bnav">
      {items.map(it => (
        <button key={it.id} className={tab === it.id ? "on" : ""} onClick={() => setTab(it.id)}>
          <LineIcon d={it.d} w={23} />
          <span>{it.label}</span>
          {it.id === "cart" && cartCount > 0 && <i className="badge">{cartCount}</i>}
        </button>
      ))}
    </nav>
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

/* ---------------- Task card ---------------- */
function TaskCard({ task, inCart, onOpen }) {
  return (
    <div className={"tcard" + (inCart ? " in-cart" : "")} onClick={() => onOpen(task)}>
      {inCart && <span className="tcard__check"><LineIcon d={P.check} w={14} sw={2} /></span>}
      <div className="tcard__icon"><img src={ICONS + task.icon} alt="" /></div>
      <div className="tcard__name">{task.name}</div>
      <div className="tcard__dur">~{fmtDur(task.dur)}</div>
      <div className="tcard__price">${task.price}</div>
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
function Timeline({ busy, dur, selStart, onPick, showOpen }) {
  const trackRef = useRef(null);
  const hours = [];
  for (let h = DAY_START / 60; h <= DAY_END / 60; h++) hours.push(h);

  const handleTap = (e) => {
    if (!onPick) return;
    const rect = trackRef.current.getBoundingClientRect();
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    const minutes = DAY_START + (y / HOUR_PX) * 60;
    onPick(minutes);
  };

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

        {/* selected proposed block */}
        {selStart != null && dur != null && (
          <div className="tl-sel" style={{ top: px(selStart), height: px(selStart + dur) - px(selStart) - 3 }}>
            <span className="tl-sel__grip tl-sel__grip--top"></span>
            <div className="tl-sel__time">{fmtTime(selStart)} – {fmtTime(selStart + dur)}</div>
            <div className="tl-sel__dur">Your Zing visit · {fmtDur(dur)}</div>
            <span className="tl-sel__grip tl-sel__grip--bot"></span>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, {
  AppBar, BottomNav, Segmented, TaskCard, GhostCard, PackageCard,
  DateNav, WeekStrip, TimelineLegend, Timeline,
});
