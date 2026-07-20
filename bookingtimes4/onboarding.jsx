/* Zing Resident App · Onboarding
   A calm, motion-forward welcome: 4 story screens that explain Zing (dedicated
   in-building cleaner, à-la-carte tasks, live calendar), then a 5-step setup
   (building, name, apartment, phone, pets) and a finish screen.
   Exposes <Onboarding onDone={profile => …} /> on window. */
const { useState, useEffect, useRef } = React;
const { ICONS, P, LineIcon } = window;

const STORY = [
  { key: "welcome", photo: "img/lobby-cart.png", photoPos: "60% center", eyebrow: "Welcome to Zing",
    title: "An extra set of hands, right down the hall.",
    body: "The dedicated cleaning service built into your building — book anything from a sink of dishes to a full apartment reset.",
    cta: "Get started" },
  { key: "cleaner", photo: "img/finished-satisfied.png", eyebrow: "Your building's team",
    title: "A Zing cleaner who already knows your building.",
    body: "A dedicated housekeeping team works right here — no strangers from across town, no long waits. Just help that's already close by.",
    cta: "Continue" },
  { key: "tasks", illus: "icons", eyebrow: "À la carte",
    title: "Book exactly what you need.",
    body: "Pick a single task or bundle a few into one visit. You only pay for what you book — nothing you don't.",
    cta: "Continue" },
  { key: "calendar", illus: "cal", eyebrow: "Live availability",
    title: "See what's open. Slide in your time.",
    body: "We work your building Monday to Friday, 8 to 6. Watch open slots update as you go and reserve the time that fits.",
    cta: "Let's set you up" },
];

const BUILDINGS = [
  { id: "bezel", name: "Bezel Miami", addr: "Edgewater, Miami", img: "img/bld/bezel.jpg" },
  { id: "muze", name: "Muze at Met", addr: "Downtown Miami", img: "img/bld/muze.jpg" },
  { id: "worldtower", name: "Miami World Tower", addr: "Miami Worldcenter", img: "img/bld/worldtower.jpg" },
  { id: "wynd27", name: "Wynd 27", addr: "Wynwood, Miami", img: "img/bld/wynd27.jpg" },
  { id: "wynd28", name: "Wynd 28", addr: "Wynwood, Miami", img: "img/bld/wynd28.jpg" },
  { id: "paraiso", name: "Paraíso Bayviews", addr: "Edgewater, Miami", img: "img/bld/paraiso.jpg" },
  { id: "forma", name: "Forma", addr: "Miami", img: "img/bld/forma.jpg" },
  { id: "hamilton", name: "The Hamilton", addr: "Edgewater, Miami", img: "img/bld/hamilton.jpg" },
];

const OB_ICONS = ["dishes.webp", "laundry.webp", "trash.webp", "bed.webp", "oven.webp", "window.webp", "plants.webp", "couch.webp", "folding.webp"];

const fmtPhone = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 10);
  const a = d.slice(0, 3), b = d.slice(3, 6), c = d.slice(6, 10);
  if (d.length > 6) return `(${a}) ${b}-${c}`;
  if (d.length > 3) return `(${a}) ${b}`;
  if (d.length > 0) return `(${a}`;
  return "";
};

function Dots({ n, i, over }) {
  return (
    <div className={"ob-dots" + (over ? " ob-dots--over" : "")}>
      {Array.from({ length: n }).map((_, k) => <span key={k} className={"ob-dot" + (k === i ? " ob-dot--on" : "")}></span>)}
    </div>
  );
}

function IconGrid() {
  return (
    <div className="ob-icons">
      {OB_ICONS.map((ic, idx) => (
        <div key={ic} className="ob-ico" style={{ animationDelay: (idx * 0.055 + 0.1) + "s" }}>
          <img className="ob-ico__img" src={ICONS + ic} alt="" style={{ animationDelay: (idx * 0.09 + 0.7) + "s" }} />
        </div>
      ))}
    </div>
  );
}

function CalPreview() {
  const hours = [8, 9, 10, 11, 12, 13];
  return (
    <div className="ob-cal">
      <div className="ob-cal__hd">
        <span className="ob-cal__day">Tuesday</span>
        <div className="ob-cal__chips">
          {["M", "T", "W", "T", "F"].map((d, i) => <span key={i} className={"ob-cal__chip" + (i === 1 ? " ob-cal__chip--on" : "")}>{d}</span>)}
        </div>
      </div>
      <div className="ob-cal__grid">
        {hours.map((h) => (
          <React.Fragment key={h}>
            <div className="ob-cal__row" style={{ top: (h - 8) * 32 }}></div>
            <span className="ob-cal__hr" style={{ top: (h - 8) * 32 }}>{h > 12 ? h - 12 : h}{h >= 12 ? "p" : "a"}</span>
          </React.Fragment>
        ))}
        <div className="ob-cal__busy" style={{ top: 8, height: 22, animationDelay: ".15s" }}><span className="ob-cal__lbl">Bathroom clean</span></div>
        <div className="ob-cal__open" style={{ top: 34, height: 70, animationDelay: ".25s" }}></div>
        <div className="ob-cal__busy" style={{ top: 108, height: 40, animationDelay: ".2s" }}><span className="ob-cal__lbl">Vacuum &amp; floors</span></div>
        <div className="ob-cal__sel" style={{ top: 64, height: 32 }}><b>10:00 AM</b><span>Your visit · 1 hr</span></div>
      </div>
    </div>
  );
}

function Onboarding({ onDone }) {
  const SETUP = ["building", "name", "apt", "hometype", "baths", "phone", "verify", "pets"];
  const STEPS = ["welcome", "cleaner", "tasks", "calendar", ...SETUP, "done"];
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState("f");
  const [data, setData] = useState({ building: "bezel", name: "Whit", apt: "1925", hometype: "1 Bedroom", baths: "1 Bathroom", phone: "(305) 555-1212", code: "248913", pets: "" });
  const inputRef = useRef(null);

  const key = STEPS[step];
  const isStory = step <= 3;
  const isSetup = SETUP.includes(key);
  const q = isSetup ? key : null;
  const setupIdx = SETUP.indexOf(key);

  const go = (d) => { setDir(d > 0 ? "f" : "b"); setStep((s) => Math.max(0, Math.min(STEPS.length - 1, s + d))); };
  const jumpTo = (i) => { setDir(i > step ? "f" : "b"); setStep(i); };
  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  useEffect(() => {
    if (["name", "apt", "phone", "pets"].includes(key)) {
      const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 380);
      return () => clearTimeout(t);
    }
  }, [key]);

  const valid = q === "name" ? !!data.name.trim()
    : q === "apt" ? !!data.apt.trim()
    : q === "hometype" ? !!data.hometype
    : q === "baths" ? !!data.baths
    : q === "phone" ? data.phone.replace(/\D/g, "").length >= 10
    : q === "verify" ? (data.code || "").length === 6
    : true;
  const onEnter = (e) => { if (e.key === "Enter" && valid) go(1); };

  const bld = BUILDINGS.find((b) => b.id === data.building) || BUILDINGS[0];
  const first = data.name.trim().split(/\s+/)[0];

  let inner;
  if (isStory) {
    const s = STORY[step];
    const foot = (over) => (
      <div className={"ob-foot" + (over ? " ob-foot--over" : "") + " ob-anim"} style={{ animationDelay: ".28s" }}>
        <Dots n={STORY.length} i={step} over={over} />
        <button className="btn btn--primary btn--block" onClick={() => go(1)}>{s.cta}</button>
      </div>
    );
    if (s.photo) {
      inner = (
        <div className="ob-media--full">
          <img className="ob-photo" src={s.photo} alt="" style={{ objectPosition: s.photoPos || "center" }} />
          <div className="ob-photo-shade"></div>
          <img className="ob-logo" src="img/zing-logo-cream.svg" alt="Zing" />
          <button className="ob-skip" onClick={() => jumpTo(4)}>Skip</button>
          <div className="ob-over">
            <div className="ob-copy--over">
              <div className="ob-eyebrow ob-anim" style={{ animationDelay: ".05s" }}>{s.eyebrow}</div>
              <h1 className="ob-title ob-anim" style={{ animationDelay: ".12s" }}>{s.title}</h1>
              <p className="ob-body ob-anim" style={{ animationDelay: ".2s" }}>{s.body}</p>
            </div>
            {foot(true)}
          </div>
        </div>
      );
    } else {
      inner = (
        <>
          <img className="ob-logo ob-logo--dark" src="icons/zing-logo.svg" alt="Zing" />
          <button className="ob-skip ob-skip--dark" onClick={() => jumpTo(4)}>Skip</button>
          <div className="ob-illus">{s.illus === "icons" ? <IconGrid /> : <CalPreview />}</div>
          <div className="ob-copy">
            <div className="ob-eyebrow ob-anim" style={{ animationDelay: ".05s" }}>{s.eyebrow}</div>
            <h1 className="ob-title ob-anim" style={{ animationDelay: ".12s" }}>{s.title}</h1>
            <p className="ob-body ob-anim" style={{ animationDelay: ".2s" }}>{s.body}</p>
          </div>
          {foot(false)}
        </>
      );
    }
  } else if (isSetup) {
    let qbody;
    if (q === "building") {
      qbody = (
        <>
          <h1 className="ob-qtitle ob-anim" style={{ animationDelay: ".05s" }}>Where do you call home?</h1>
          <p className="ob-qsub ob-anim" style={{ animationDelay: ".12s" }}>Zing lives inside your building. Choose yours to get started.</p>
          <div className="ob-blds ob-anim" style={{ animationDelay: ".18s" }}>
            {BUILDINGS.map((b) => (
              <button key={b.id} className={"ob-bld" + (data.building === b.id ? " ob-bld--on" : "")} onClick={() => set("building", b.id)}>
                <img className="ob-bld__img" src={b.img} alt="" />
                <div className="ob-bld__main"><div className="ob-bld__name">{b.name}</div><div className="ob-bld__addr">{b.addr}</div></div>
                <span className="ob-bld__tick">{data.building === b.id && <LineIcon d={P.check} w={13} sw={2.4} />}</span>
              </button>
            ))}
          </div>
        </>
      );
    } else if (q === "name") {
      qbody = (
        <>
          <h1 className="ob-qtitle ob-anim" style={{ animationDelay: ".05s" }}>What should we call you?</h1>
          <p className="ob-qsub ob-anim" style={{ animationDelay: ".12s" }}>So your Zing cleaner can greet you by name.</p>
          <input ref={inputRef} className="ob-input ob-anim" style={{ animationDelay: ".18s" }} type="text" placeholder="Your name"
            value={data.name} onChange={(e) => set("name", e.target.value)} onKeyDown={onEnter} />
        </>
      );
    } else if (q === "apt") {
      qbody = (
        <>
          <h1 className="ob-qtitle ob-anim" style={{ animationDelay: ".05s" }}>Which apartment are we cleaning?</h1>
          <p className="ob-qsub ob-anim" style={{ animationDelay: ".12s" }}>We'll only ever visit this unit at {bld.name}.</p>
          <input ref={inputRef} className="ob-input ob-anim" style={{ animationDelay: ".18s" }} type="text" inputMode="numeric" placeholder="e.g. 1925"
            value={data.apt} onChange={(e) => set("apt", e.target.value)} onKeyDown={onEnter} />
        </>
      );
    } else if (q === "hometype") {
      const opts = ["Studio", "1 Bedroom", "2 Bedrooms", "3+ Bedrooms"];
      qbody = (
        <>
          <h1 className="ob-qtitle ob-anim" style={{ animationDelay: ".05s" }}>What type of home do you have?</h1>
          <p className="ob-qsub ob-anim" style={{ animationDelay: ".12s" }}>This helps us give you accurate pricing for each clean.</p>
          <div className="ob-opts ob-anim" style={{ animationDelay: ".18s" }}>
            {opts.map((o) => <button key={o} className={"ob-opt" + (data.hometype === o ? " ob-opt--on" : "")} onClick={() => set("hometype", o)}>{o}</button>)}
          </div>
        </>
      );
    } else if (q === "baths") {
      const opts = ["1 Bathroom", "1.5 Bathrooms", "2 Bathrooms", "3 Bathrooms"];
      qbody = (
        <>
          <h1 className="ob-qtitle ob-anim" style={{ animationDelay: ".05s" }}>How many bathrooms does your place have?</h1>
          <p className="ob-qsub ob-anim" style={{ animationDelay: ".12s" }}>This helps us give you accurate pricing for each clean.</p>
          <div className="ob-opts ob-anim" style={{ animationDelay: ".18s" }}>
            {opts.map((o) => <button key={o} className={"ob-opt" + (data.baths === o ? " ob-opt--on" : "")} onClick={() => set("baths", o)}>{o}</button>)}
          </div>
        </>
      );
    } else if (q === "phone") {
      qbody = (
        <>
          <h1 className="ob-qtitle ob-anim" style={{ animationDelay: ".05s" }}>Where should we text you?</h1>
          <p className="ob-qsub ob-anim" style={{ animationDelay: ".12s" }}>For visit confirmations and arrival updates — nothing else.</p>
          <input ref={inputRef} className="ob-input ob-anim" style={{ animationDelay: ".18s" }} type="tel" inputMode="tel" placeholder="(305) 000-0000"
            value={data.phone} onChange={(e) => set("phone", fmtPhone(e.target.value))} onKeyDown={onEnter} />
        </>
      );
    } else if (q === "verify") {
      const digits = (data.code || "").split("");
      qbody = (
        <>
          <h1 className="ob-qtitle ob-anim" style={{ animationDelay: ".05s" }}>Verify your number.</h1>
          <p className="ob-qsub ob-anim" style={{ animationDelay: ".12s" }}>We texted a 6-digit code to {data.phone || "your phone"}.</p>
          <div className="ob-code ob-anim" style={{ animationDelay: ".18s" }}>
            {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className={"ob-code__box" + (digits[i] ? " ob-code__box--on" : "")}>{digits[i] || ""}</div>)}
          </div>
          <div className="ob-code__hint ob-anim" style={{ animationDelay: ".24s" }}><LineIcon d={P.check} w={14} sw={2.2} /> Autofilled from Messages</div>
        </>
      );
    } else if (q === "pets") {
      qbody = (
        <>
          <h1 className="ob-qtitle ob-anim" style={{ animationDelay: ".05s" }}>Anyone furry we should know about?</h1>
          <p className="ob-qsub ob-anim" style={{ animationDelay: ".12s" }}>Helps your cleaner arrive prepared. Totally optional.</p>
          <input ref={inputRef} className="ob-input ob-anim" style={{ animationDelay: ".18s" }} type="text" placeholder="e.g. friendly dog, shy cat…"
            value={data.pets} onChange={(e) => set("pets", e.target.value)} onKeyDown={onEnter} />
        </>
      );
    }
    inner = (
      <>
        <div className="ob-setup">
          <div className="ob-setup__top">
            <button className="ob-back" onClick={() => go(-1)} aria-label="Back"><LineIcon d={P.left} w={20} /></button>
            <div className="ob-prog">
              {SETUP.map((_, k) => <span key={k} className={"ob-prog__seg" + (k <= setupIdx ? " ob-prog__seg--on" : "")}><i></i></span>)}
            </div>
            <span className="ob-stepn">{setupIdx + 1}/{SETUP.length}</span>
          </div>
          <div className="ob-setup__q">{qbody}</div>
        </div>
        <div className="ob-foot">
          {q === "pets" && <button className="btn btn--ghost btn--block" onClick={() => { set("pets", ""); go(1); }}>I don't have any pets</button>}
          <button className="btn btn--primary btn--block" disabled={!valid} onClick={() => go(1)}>{q === "pets" ? "Finish" : "Continue"}</button>
        </div>
      </>
    );
  } else {
    inner = (
      <>
        <div className="ob-done">
          <div className="ob-badge-wrap">
            <span className="ob-done__ring"></span>
            <div className="ob-done__badge"><LineIcon d={P.check} w={42} sw={1.8} /></div>
          </div>
          <h1 className="ob-title" style={{ marginTop: 22 }}>You're all set{first ? `, ${first}` : ""}.</h1>
          <p className="ob-body" style={{ maxWidth: 288 }}>Your Zing cleaner at {bld.name} is ready when you are. Let's book your first visit.</p>
        </div>
        <div className="ob-foot">
          <button className="btn btn--primary btn--block" onClick={() => onDone(data)}>Book your first clean</button>
        </div>
      </>
    );
  }

  return (
    <div className="ob">
      <div className="ob__stage">
        <div className="ob-screen" data-dir={dir} key={key}>{inner}</div>
      </div>
    </div>
  );
}

Object.assign(window, { Onboarding });
