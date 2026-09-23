/* ---------- "Save GIF": replays the floor-by-floor elevation week by week and downloads it as an animated GIF ---------- */
(function(){
const $ = id => document.getElementById(id);
const btn = $("ciGif");
if (!btn) return;
const H2C = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
function lib(){
  if (window.html2canvas) return Promise.resolve();
  return new Promise((ok, no) => { const s = document.createElement("script"); s.src = H2C; s.onload = ok; s.onerror = () => no(new Error("could not load html2canvas")); document.head.appendChild(s); });
}
const wait = ms => new Promise(r => setTimeout(r, ms));
const next = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

/* -- palette: 15-bit buckets, keep the 256 most used, snap the rest to the nearest kept colour -- */
function palette(frames){
  const cnt = new Map();
  frames.forEach(d => { for (let i = 0; i < d.length; i += 4){
    const k = ((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3);
    const c = cnt.get(k); if (c){ c[0]++; c[1] += d[i]; c[2] += d[i + 1]; c[3] += d[i + 2]; } else cnt.set(k, [1, d[i], d[i + 1], d[i + 2]]);
  } });
  const top = [...cnt.entries()].sort((a, b) => b[1][0] - a[1][0]).slice(0, 256);
  const pal = new Uint8Array(768), idx = new Map();
  top.forEach(([k, c], i) => { pal[i * 3] = Math.round(c[1] / c[0]); pal[i * 3 + 1] = Math.round(c[2] / c[0]); pal[i * 3 + 2] = Math.round(c[3] / c[0]); idx.set(k, i); });
  const n = top.length;
  const nearest = (r, g, b) => { let best = 0, bd = 1e9; for (let i = 0; i < n; i++){ const dr = pal[i * 3] - r, dg = pal[i * 3 + 1] - g, db = pal[i * 3 + 2] - b, dd = dr * dr + dg * dg + db * db; if (dd < bd){ bd = dd; best = i; } } return best; };
  const cache = new Map();
  const map = d => { const out = new Uint8Array(d.length / 4); for (let i = 0, p = 0; i < d.length; i += 4, p++){
    const k = ((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3);
    let v = idx.get(k); if (v === undefined){ v = cache.get(k); if (v === undefined){ v = nearest(d[i], d[i + 1], d[i + 2]); cache.set(k, v); } }
    out[p] = v; } return out; };
  return { pal, map };
}
/* -- LZW, GIF flavour (8-bit min code size, clear at 4096) -- */
function lzw(px){
  const out = []; let cur = 0, bits = 0;
  const emit = (code, size) => { cur |= code << bits; bits += size; while (bits >= 8){ out.push(cur & 255); cur >>>= 8; bits -= 8; } };
  const CLEAR = 256, EOI = 257;
  let dict = new Map(), nxt = 258, size = 9;
  emit(CLEAR, size);
  let prefix = px[0];
  for (let i = 1; i < px.length; i++){
    const k = px[i], key = (prefix << 8) | k, f = dict.get(key);
    if (f !== undefined){ prefix = f; continue; }
    emit(prefix, size);
    if (nxt < 4096){ if (nxt > (1 << size) - 1 && size < 12) size++; dict.set(key, nxt++); }
    else { emit(CLEAR, size); dict = new Map(); nxt = 258; size = 9; }
    prefix = k;
  }
  emit(prefix, size); emit(EOI, size);
  if (bits > 0) out.push(cur & 255);
  return out;
}
function encode(w, h, frames, delays){
  const { pal, map } = palette(frames);
  const b = [];
  const u16 = v => b.push(v & 255, (v >> 8) & 255);
  const str = s => { for (let i = 0; i < s.length; i++) b.push(s.charCodeAt(i)); };
  str("GIF89a"); u16(w); u16(h); b.push(0xF7, 0, 0);
  for (let i = 0; i < 768; i++) b.push(pal[i]);
  b.push(0x21, 0xFF, 0x0B); str("NETSCAPE2.0"); b.push(3, 1, 0, 0, 0);
  frames.forEach((d, n) => {
    b.push(0x21, 0xF9, 4, 0); u16(delays[n]); b.push(0, 0);
    b.push(0x2C); u16(0); u16(0); u16(w); u16(h); b.push(0);
    b.push(8);
    const data = lzw(map(d));
    for (let i = 0; i < data.length; i += 255){ const c = Math.min(255, data.length - i); b.push(c); for (let j = 0; j < c; j++) b.push(data[i + j]); }
    b.push(0);
  });
  b.push(0x3B);
  return new Blob([new Uint8Array(b)], { type: "image/gif" });
}

async function run(){
  const tl = window.zingCartTimeline;
  const n = tl ? tl.frames() : 0;
  if (!n){ alert("Pick one building first \u2014 the replay needs a single building's floors."); return; }
  const panel = $("ciElevPanel"), elev = $("ciElev");
  const hide = ["ciWkPlay", "ciWk", "ciWkAll", "ciGif"].map($).concat([panel.querySelector(".phead p")]);
  const label = btn.textContent;
  btn.disabled = true;
  try {
    await lib();
    hide.forEach(e => e && (e.style.display = "none"));
    $("ciWkLbl").style.fontSize = "13px";
    const oldMax = elev.style.maxHeight; elev.style.maxHeight = "none";
    const frames = [], delays = []; let w = 0, h = 0;
    for (let i = 0; i < n; i++){
      tl.show(i);
      btn.textContent = "Frame " + (i + 1) + " of " + n;
      await next();
      const c = await html2canvas(panel, { scale: 1, backgroundColor: "#ffffff", logging: false });
      if (!w){ w = c.width; h = c.height; }
      const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
      const cx = cv.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, w, h); cx.drawImage(c, 0, 0);
      frames.push(cx.getImageData(0, 0, w, h).data);
      delays.push(i === 0 ? 120 : i === n - 1 ? 300 : 60);
    }
    elev.style.maxHeight = oldMax;
    btn.textContent = "Encoding\u2026";
    await wait(20);
    const blob = encode(w, h, frames, delays);
    const name = (($("ciSelBuilding") || {}).value || "building").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name + "-floor-by-floor.gif"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  } catch (e) { console.error(e); alert("GIF export failed: " + e.message); }
  finally {
    hide.forEach(e => e && (e.style.display = ""));
    $("ciWkLbl").style.fontSize = "";
    btn.disabled = false; btn.textContent = label;
    if (tl) tl.reset();
  }
}
btn.onclick = run;
})();
