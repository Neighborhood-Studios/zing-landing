# Zing Resident App — Scheduling Prototype

Mobile (PWA-style) booking flow for Zing cleaning. Static front-end prototype — no backend.

## Run / deploy

Static site — serve the folder over HTTP and open `index.html`:

```bash
# from inside this folder
python3 -m http.server 8000
# then open http://localhost:8000
```

Or drop the whole folder onto any static host (Netlify, Vercel, Cloudflare Pages, S3, GitHub Pages). No build step.

> Open it through a server, **not** as a `file://` path — the `.jsx` files are fetched at runtime and browsers block that over `file://`.

## What's inside

- `index.html` — entry; phone frame + loads everything below
- `app.jsx` — screens & flow: Home (task/package browse → cart, floating availability bar), full-page Pick-a-Time booking screen, Checkout (frequency / entry / tip / payment / coupon), Confirmation, Your Bookings, Profile
- `components.jsx` — shared UI: app bar, bottom nav, task & package cards, info popup, day timeline, day chips
- `data.jsx` — tasks, packages, durations/prices, deterministic "already booked" calendar data + time helpers
- `styles.css` + `tokens/` + `components/` — Zing design-system tokens (colors, type, spacing) and base styles
- `icons/` — task illustrations

## Key behaviors

- Tasks and packages add to cart from the Home grid; count-based tasks (bathrooms, windows, loads) use an on-card +/- stepper that adjusts time & price.
- The floating bar shows a running visit total and a 5-day availability strip (green = fits, red = full). It auto-tracks the earliest day that fits: adding tasks pushes forward past full days, removing pulls back to a sooner opening.
- Tapping the bar opens a dedicated Pick-a-Time page (sticky header + scrolling 8 AM–6 PM day calendar) where you drag/tap to place the visit into an open slot.
- Zing hours are Mon–Fri, 8:00 AM–6:00 PM.

## External dependencies (loaded via CDN, internet required)

- React 18 + ReactDOM (UMD) and Babel Standalone — pinned with integrity hashes in `index.html`
- Google Fonts: Newsreader + Hanken Grotesk

## Notes for productionizing

- JSX is transpiled in-browser by Babel for prototype convenience. For production, precompile the `.jsx` with a real build (Vite/esbuild) and drop the Babel CDN script.
- All availability/booking data is mock data in `data.jsx` — wire to real endpoints.
- Fonts are Google-Font stand-ins; swap for licensed brand fonts in `tokens/fonts.css` when available.
