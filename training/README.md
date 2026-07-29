# Zing Cleaner Training — Daily Micro-Lessons

Mobile-first Duolingo-style training for Zing cleaners. One ~3-minute lesson per day (written portion + illustrative image + one quiz question), Spanish-first with an ES/EN toggle, name selection, streaks, and an admin data view.

## Pages / routes

- `index.html` → deploy at **justzingit.com/training** — the daily lesson app (mobile experience; on desktop it renders as a centered phone-width card)
- `data.html` → deploy at **justzingit.com/trainingdata** — results dashboard, password-gated (password: `justzingit`, checked client-side; move to server-side auth in production)

## Run

Static — serve the folder over HTTP (not `file://`; the `.jsx` is fetched at runtime):

```bash
python3 -m http.server 8000
```

## How it works

- **Lessons** (`lessons.js`): 10 bilingual lessons distilled from the Zing Manual de Limpieza (bathroom, kitchen, dusting, floors, windows, oven, fridge, dishes, couch refresh, laundry). Each has intro, 5–6 steps, a common-mistake callout, and one multiple-choice question with an explanation.
- **Daily rotation**: the lesson for a date = days since `TRAINING_LAUNCH` (in `lessons.js`, currently 2026-07-29) modulo 10, computed in **Miami time** (`America/New_York`) — the lesson flips at midnight Miami automatically, no cron needed. Arrows/date dots let cleaners go back to past days (never future) and complete missed lessons.
- **Names**: fixed roster in `lessons.js` (`TRAINING_NAMES`): Joceline, Lisa, Daisy, Elizabeth, Haley, Alvaro. Selecting a name shows a welcome-back splash with the current streak.
- **Streaks**: consecutive Miami-days completed, counted back from today (or yesterday if today isn't done yet).

## Data layer — WHAT CLAUDEBOT SHOULD WIRE UP

All persistence currently goes through **one localStorage key**: `zing.training.v1`, shaped:

```json
{ "<Name>": { "completions": { "YYYY-MM-DD": {
  "lessonId": "bano", "lessonTitle": "…", "answer": 1,
  "answerText": "…", "correct": true, "ts": "ISO-8601" } } } }
```

The write happens in ONE function — `recordCompletion()` in `app.jsx` — and the dashboard read happens in ONE function — `render()` in `data.html`. To go live:

1. Replace `recordCompletion()`'s localStorage write with a `POST /api/training/completions` `{name, date, lessonId, answer, answerText, correct, ts}` (keep the localStorage write as offline fallback/optimistic UI).
2. Replace the dashboard's localStorage read with `GET /api/training/completions` returning the same shape (all cleaners), so results from every device aggregate.
3. Streak math can stay client-side (it derives from completions) or move server-side.
4. Password gate on `/trainingdata` is client-side only — replace with real auth (basic auth or a session) when wiring the backend. Current password: `justzingit`.

## Editing content

- Add/replace lessons in `lessons.js` (`window.LESSONS` array) — everything is `{es, en}` pairs. 10 items rotate; add more and the rotation extends automatically.
- Roster: `window.TRAINING_NAMES`.
- Launch date: `window.TRAINING_LAUNCH`.

## Dependencies (CDN, internet required)

React 18 + ReactDOM + Babel Standalone (pinned, integrity-hashed) and Google Fonts (Newsreader + Hanken Grotesk). For production, precompile `app.jsx` and drop Babel.
