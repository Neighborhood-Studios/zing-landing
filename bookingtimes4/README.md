# Zing Resident App — Scheduling + Onboarding

Mobile (PWA-style) booking flow for Zing cleaning. Static front-end prototype — no backend.

## Run / deploy

Serve the folder over HTTP and open `index.html`:

```bash
# from inside this folder
python3 -m http.server 8000
# then open http://localhost:8000
```

Or drop the whole folder onto any static host (Netlify, Vercel, Cloudflare Pages, S3, GitHub Pages). No build step.

> Open it through a server, **not** as a `file://` path — the `.jsx` files are fetched at runtime and browsers block that over `file://`.

## What's inside

- `index.html` — entry; phone frame, all styles, loads everything below
- `onboarding.jsx` — first-run onboarding: 4 story screens (dedicated cleaner, à-la-carte tasks, live calendar) then setup (building, name, apartment, home type, bathrooms, phone, SMS code verify, pets) → finish
- `app.jsx` — screens & flow: Home (task/package browse → cart, floating availability bar), full-page Pick-a-Time booking, Checkout (frequency / entry / tip / payment / coupon), Confirmation, Your Bookings, Profile
- `components.jsx` — shared UI: app bar, bottom nav, task & package cards, info popup, day timeline, day chips
- `data.jsx` — tasks, packages, durations/prices, deterministic "already booked" calendar data + time helpers
- `styles.css` + `tokens/` + `components/` — Zing design-system tokens (colors, type, spacing) and base styles
- `img/`, `img/bld/`, `icons/` — onboarding photography, building logos, task icons, brand logos

## Onboarding behavior

- Shows on first load; completion is remembered in `localStorage` (`zing.onboarded`). Profile → "Replay welcome tour" re-triggers it. Append `?onboarding=1` to force it.
- The demo build is **pre-filled** (name, apartment, home type, bathrooms, phone, and the SMS verify code) so you can click Continue straight through. Clear those defaults in `onboarding.jsx` (the `useState({...})` in `Onboarding`) for a real blank flow.
- Buildings use the real logos in `img/bld/`: Bezel Miami, Muze at Met, Miami World Tower, Wynd 27, Wynd 28, Paraíso Bayviews, Forma, The Hamilton. Addresses are neighborhood-level placeholders in `onboarding.jsx` — swap for exact addresses when ready.
- What the resident enters (name, building, apartment) threads into the Home greeting, Profile, checkout recap, and Apple Pay sheet.

## Key booking behaviors

- Tasks and packages add to cart from the Home grid; count-based tasks (bathrooms, windows, loads) use an on-card +/- stepper that adjusts time & price.
- The floating bar shows a running visit total and a 5-day availability strip (green = fits, red = full), auto-tracking the earliest day that fits.
- Tapping the bar opens a dedicated Pick-a-Time page (sticky header + scrolling 8 AM–6 PM day calendar) where you drag/tap to place the visit into an open slot.
- Zing hours are Mon–Fri, 8:00 AM–6:00 PM.

## External dependencies (CDN, internet required)

- React 18 + ReactDOM (UMD) and Babel Standalone — pinned with integrity hashes in `index.html`
- Google Fonts: Newsreader + Hanken Grotesk

## Notes for productionizing

- JSX is transpiled in-browser by Babel for prototype convenience. For production, precompile the `.jsx` with a real build (Vite/esbuild) and drop the Babel CDN script.
- SMS verification is faked (pre-filled code) — wire to a real OTP provider.
- All availability/booking data is mock data in `data.jsx` — wire to real endpoints.
