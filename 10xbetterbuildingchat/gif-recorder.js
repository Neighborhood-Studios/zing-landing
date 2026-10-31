/* Zing Neighbors · GIF recorder. Open Resident.html?gif (or "Record GIFs.html").
   Plays each use case at normal speed, captures the phone every ~0.6 s with html2canvas, adds a caption strip with the
   use case and current step, and downloads one animated GIF per use case. Nothing here changes app data. */
(function(){
if (!/[?&#]gif\b/.test(location.search + location.hash)) return;
const H2C = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
const lib = () => window.html2canvas ? Promise.resolve() : new Promise((ok, no) => { const s = document.createElement("script"); s.src = H2C; s.onload = ok; s.onerror = () => no(new Error("could not load html2canvas")); document.head.appendChild(s); });
const wait = ms => new Promise(r => setTimeout(r, ms));
const BG = "#EFEBE3", CAP = 64, PAD = 18, EVERY = 600, HOLD = 3000, MAXF = 220;

function palette(frames){
  const cnt = new Map();
  frames.forEach(d => { for (let i = 0; i < d.length; i += 8){ const k = ((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3);
    const c = cnt.get(k); if (c){ c[0]++; c[1] += d[i]; c[2] += d[i + 1]; c[3] += d[i + 2]; } else cnt.set(k, [1, d[i], d[i + 1], d[i + 2]]); } });
  const top = [...cnt.entries()].sort((a, b) => b[1][0] - a[1][0]).slice(0, 256);
  const pal = new Uint8Array(768), idx = new Map(), n = top.length;
  top.forEach(([k, c], i) => { pal[i * 3] = Math.round(c[1] / c[0]); pal[i * 3 + 1] = Math.round(c[2] / c[0]); pal[i * 3 + 2] = Math.round(c[3] / c[0]); idx.set(k, i); });
  const cache = new Map();
  const near = (r, g, b) => { let best = 0, bd = 1e9; for (let i = 0; i < n; i++){ const dr = pal[i * 3] - r, dg = pal[i * 3 + 1] - g, db = pal[i * 3 + 2] - b, dd = dr * dr + dg * dg + db * db; if (dd < bd){ bd = dd; best = i; } } return best; };
  const map = d => { const out = new Uint8Array(d.length / 4); for (let i = 0, p = 0; i < d.length; i += 4, p++){ const k = ((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3);
    let v = idx.get(k); if (v === undefined){ v = cache.get(k); if (v === undefined){ v = near(d[i], d[i + 1], d[i + 2]); cache.set(k, v); } } out[p] = v; } return out; };
  return { pal, map };
}
function lzw(px){
  const out = []; let cur = 0, bits = 0;
  const emit = (code, size) => { cur |= code << bits; bits += size; while (bits >= 8){ out.push(cur & 255); cur >>>= 8; bits -= 8; } };
  let dict = new Map(), nxt = 258, size = 9; emit(256, size);
  let prefix = px[0];
  for (let i = 1; i < px.length; i++){ const k = px[i], key = (prefix << 8) | k, f = dict.get(key);
    if (f !== undefined){ prefix = f; continue; }
    emit(prefix, size);
    if (nxt < 4096){ if (nxt > (1 << size) - 1 && size < 12) size++; dict.set(key, nxt++); } else { emit(256, size); dict = new Map(); nxt = 258; size = 9; }
    prefix = k; }
  emit(prefix, size); emit(257, size); if (bits > 0) out.push(cur & 255);
  return out;
}
function encode(w, h, frames, delays){
  const { pal, map } = palette(frames), b = [];
  const u16 = v => b.push(v & 255, (v >> 8) & 255), str = s => { for (let i = 0; i < s.length; i++) b.push(s.charCodeAt(i)); };
  str("GIF89a"); u16(w); u16(h); b.push(0xF7, 0, 0); for (let i = 0; i < 768; i++) b.push(pal[i]);
  b.push(0x21, 0xFF, 0x0B); str("NETSCAPE2.0"); b.push(3, 1, 0, 0, 0);
  frames.forEach((d, n) => { b.push(0x21, 0xF9, 4, 0); u16(delays[n]); b.push(0, 0); b.push(0x2C); u16(0); u16(0); u16(w); u16(h); b.push(0); b.push(8);
    const data = lzw(map(d)); for (let i = 0; i < data.length; i += 255){ const c = Math.min(255, data.length - i); b.push(c); for (let j = 0; j < c; j++) b.push(data[i + j]); } b.push(0); });
  b.push(0x3B);
  return new Blob([new Uint8Array(b)], { type: "image/gif" });
}

const ui = document.createElement("div");
ui.style.cssText = "position:fixed;left:16px;bottom:16px;z-index:9999;width:300px;max-height:70vh;overflow:auto;background:#fff;border:1px solid #DDD6C8;border-radius:16px;box-shadow:0 18px 40px rgba(15,27,51,.18);padding:12px;font:13px/1.4 system-ui,sans-serif;color:#1B2740";
document.body.appendChild(ui);
let busy = false, stop = false;
const caseBtns = () => [...document.querySelectorAll(".uc button:not(.ucd)")];
function list(msg){
  const bs = caseBtns();
  ui.innerHTML = `<b style="font-size:14px">Record GIFs</b><div style="color:#6B7385;font-size:12px;margin:2px 0 10px">${msg || "One GIF per use case, played at normal speed. Keep this tab in front while it records."}</div>
<div style="display:flex;flex-direction:column;gap:5px">${bs.map((b, i) => `<button data-i="${i}" style="text-align:left;padding:7px 10px;border:1px solid #DDD6C8;border-radius:10px;background:#FBFAF7;cursor:pointer;font:600 12.5px system-ui">${b.textContent}</button>`).join("")}</div>
<div style="display:flex;gap:6px;margin-top:10px"><button id="gAll" style="flex:1;padding:8px;border-radius:999px;border:none;background:#1B2740;color:#fff;font:600 12.5px system-ui;cursor:pointer">Record all ${bs.length}</button>${busy ? '<button id="gStop" style="padding:8px 12px;border-radius:999px;border:1px solid #DDD6C8;background:#fff;font:600 12.5px system-ui;cursor:pointer">Stop</button>' : ""}</div>`;
  ui.querySelectorAll("[data-i]").forEach(b => b.onclick = () => go([+b.dataset.i]));
  ui.querySelector("#gAll").onclick = () => go(bs.map((_, i) => i));
  const s = ui.querySelector("#gStop"); if (s) s.onclick = () => { stop = true; };
  if (busy) ui.querySelectorAll("[data-i],#gAll").forEach(b => b.disabled = true);
}
const status = t => { let el = ui.querySelector("#gSt"); if (!el){ el = document.createElement("div"); el.id = "gSt"; el.style.cssText = "margin-top:10px;font-size:12px;color:#1B2740;background:#F2EFE8;border-radius:8px;padding:7px 9px"; ui.appendChild(el); } el.textContent = t; };

function wrapText(cx, text, x, y, maxW, lh, lines){
  const words = String(text).split(/\s+/); let line = "", n = 0;
  for (const w of words){ const t = line ? line + " " + w : w; if (cx.measureText(t).width > maxW && line){ cx.fillText(line, x, y + n * lh); line = w; if (++n >= lines - 1){ /* last line: ellipsize */ } } else line = t; }
  if (n < lines){ let l = line; while (cx.measureText(l).width > maxW && l.length > 3) l = l.slice(0, -2); if (l !== line) l = l.slice(0, -1) + "…"; cx.fillText(l, x, y + n * lh); }
}

async function grab(phone, title, step){
  const c = await html2canvas(phone, { scale: 1, backgroundColor: null, logging: false, useCORS: true });
  const W = c.width + PAD * 2, H = c.height + PAD * 2 + CAP;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const cx = cv.getContext("2d"); cx.fillStyle = BG; cx.fillRect(0, 0, W, H); cx.drawImage(c, PAD, PAD);
  cx.fillStyle = "#1B2740"; cx.font = "700 14px system-ui,sans-serif"; cx.fillText(title, PAD + 4, c.height + PAD + 24);
  cx.fillStyle = "#4A5468"; cx.font = "500 12.5px system-ui,sans-serif"; wrapText(cx, step || "", PAD + 4, c.height + PAD + 44, W - PAD * 2 - 8, 16, 2);
  return { w: W, h: H, d: cx.getImageData(0, 0, W, H).data };
}

async function recordOne(i){
  const btn = caseBtns()[i]; if (!btn) return;
  const title = btn.textContent.trim();
  btn.click(); await wait(900);
  const phone = document.querySelector(".phone");
  const frames = [], delays = []; let w = 0, h = 0, last = performance.now(), t0 = last;
  const pp = () => document.querySelector(".pb .pp");
  if (pp() && /Play/.test(pp().textContent)) pp().click();
  while (!stop){
    const f = await grab(phone, title, (document.querySelector(".pbl") || {}).textContent);
    if (!w){ w = f.w; h = f.h; } if (f.w !== w || f.h !== h) continue;
    const now = performance.now(); if (frames.length) delays.push(Math.round((now - last) / 10)); last = now;
    frames.push(f.d);
    const done = pp() && /Replay/.test(pp().textContent);
    status(title + " · frame " + frames.length + " · " + Math.round((now - t0) / 1000) + "s");
    if (done || frames.length >= MAXF) break;
    await wait(Math.max(0, EVERY - (performance.now() - now)));
  }
  delays.push(HOLD / 10);
  if (!frames.length) return;
  status(title + " · encoding " + frames.length + " frames…"); await wait(30);
  const blob = encode(w, h, frames, delays);
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = "zing-resident-" + title.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "") + ".gif";
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  status(title + " · saved " + (blob.size / 1048576).toFixed(1) + " MB");
}

async function go(ix){
  if (busy) return; busy = true; stop = false; list();
  const phone = document.querySelector(".phone"), oldZ = phone.style.getPropertyValue("--pz");
  phone.style.setProperty("--pz", "1");
  try { await lib(); for (const i of ix){ if (stop) break; await recordOne(i); await wait(800); } }
  catch (e){ console.error(e); status("Failed: " + e.message); }
  finally { phone.style.setProperty("--pz", oldZ || ""); if (!oldZ) phone.style.removeProperty("--pz"); busy = false;
    const msg = stop ? "Stopped." : "Done. Check your downloads folder."; list(msg); }
}
const boot = setInterval(() => { if (caseBtns().length){ clearInterval(boot); list(); } }, 300);
})();
