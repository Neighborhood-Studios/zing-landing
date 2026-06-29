# Zing Resident App — Scheduling Prototype

Mobile (PWA-style) booking flow for Zing cleaning. Static front-end prototype — no backend.

## Run / deploy

It's a static site. Serve the folder over HTTP and open `index.html`:

```bash
# from inside this folder
python3 -m http.server 8000
# then open http://localhost:8000
```

Or drop the whole folder onto any static host (Netlify, Vercel, Cloudflare Pages, S3, GitHub Pages). No build step.

> Open it through a server, **not** as a `file://` path — the `.jsx` files are fetched at runtime and browsers block that over `file://`.

## What's inside

- `index.html` — entry; phone frame + loads everything below
- `app.jsx` — screens & flow: Home (task/package browse → cart), Pick-a-Time booking page, Checkout (tip / entry / payment), Confirmation, Your Bookings, Profile
- `components.jsx` — shared UI: app bar, bottom nav, task cards, day timeline, day chips
- `data.jsx` — tasks, packages, durations/prices, and the deterministic "already booked" calendar data + time helpers
- `styles.css` + `tokens/` + `components/` — Zing design-system tokens (colors, type, spacing) and base styles
- `icons/` — task illustrations

## External dependencies (loaded via CDN, internet required)

- React 18 + ReactDOM (UMD) and Babel Standalone — pinned with integrity hashes in `index.html`
- Google Fonts: Newsreader + Hanken Grotesk

## Notes for productionizing

- JSX is transpiled in-browser by Babel for prototype convenience. For production, precompile the `.jsx` with a real build (Vite/esbuild) and drop the Babel CDN script.
- All availability/booking data is mock data in `data.jsx` — wire these to real endpoints. Zing hours are Mon–Fri, 8:00 AM–6:00 PM.
- Fonts are Google-Font stand-ins; swap for licensed brand fonts in `tokens/fonts.css` when available.
