# Zing — Edgewater building landing page

Property-facing landing page for the Edgewater cluster. Sells the amenity to building management:
what Zing is, who is already running it in Edgewater, per-task pricing, vetting and insurance, what
the building provides and gets, a 15-day launch timeline, an FAQ, and a request form.

## What ships

```
edgewater/
  index.html            the page — self-contained (fonts, CSS, photography inlined)
  assets/buildings/     partner building logos, loaded at runtime
  assets/icons/         illustrated task icons, loaded at runtime
```

`index.html` carries everything except the building logos and task icons, which are referenced by
path at runtime. **Keep `assets/` next to `index.html`** — without it the logo row and the pricing
rows render as broken images.

Static, no build step, no install, no external requests except the form post (below).

## Where it goes

`zing-landing` repo, at `/edgewater/`, serving at **justzingit.com/edgewater** (bare domain — the
rest of the site links bare, and the design system specifies no `www.`).

New path. Does not replace an existing page.

## Family

None of the three page families. Single-purpose property-facing page — not a welcome page, not a
booking kiosk, not a bookingtimes flow. Copy the folder in as-is.

## The form is live

Submissions POST to a Google Apps Script web app that appends a row to the leads sheet:

```
https://script.google.com/macros/s/AKfycbyQ0_ABcxMIXC_AqBExL9zcvHAakkuIcKYmR4A_kXXw2FvS4wbiu3BPwy2q2E2bnvt9/exec
```

Fields sent: `name`, `building`, `email`, `phone`, `page` (always `edgewater`). The request is
`mode: no-cors`, so the page cannot read the response — it shows the thank-you state either way. If
the sheet stops receiving rows, the page will not report it. Send a test lead after deploying.

To move the endpoint, edit `endpoint` in the logic class of the source DC and re-export.

## Page order

Hero → Caroline Alday quote (The Hamilton) → Edgewater proof band → How we work → Prices →
Residents actually use it (Sarah + metrics) → Who is in the building → No cost to the building
(+ 15-day timeline) → FAQ → Request form.

The order is deliberate: proof and neighborhood scarcity come before the pitch, objections are
answered before the ask, and the form is last.

## Numbers on the page — confirm before publishing

- **5** Edgewater buildings live, **2,000+** units serviced.
- **2** buildings Zing can take on in Edgewater this quarter. This is the page's main urgency lever.
- **30–40%** resident adoption · **60%** single-chore visits · **75%** had no cleaning help before.
- Prices: $1 trash, $3 plants, $35 full bathroom. $69 vs $250 in Sarah's card. $89 average visit
  (FAQ only).
- **15 days** from property visit to launch.

## Also confirm

- **Caroline Alday's quote** is approved wording, attributed to The Hamilton.
- **Modera Edgewater** is listed as live in the logo row. Remove it if that is not accurate yet.
- **The Hamilton and Modera Edgewater have no logo file** and render as serif wordmarks. Send
  transparent SVG or PNG to fix.

## Known limits

- `wynd2728.svg` in the photo library is an empty shell — its embedded raster was stripped, so it
  renders invisible under the `filter: brightness(0)` treatment. This page uses `wynd2728.png`.
  `wynd27.svg` and `thehamilton.svg` have the same defect.
- Mobile is handled in two tiers (grids collapse under 980px, type and gutters tighten under 700px),
  plus a fixed bottom CTA bar on phones. Desktop relies on the sticky header CTA.
