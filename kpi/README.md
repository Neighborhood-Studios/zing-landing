# Zing — Weekly KPI Dashboard

A single static page (`index.html`) that tracks weekly margin per building, per cluster and for the
whole portfolio, reading directly from the "Weekly View Data" Google Sheet. No build step; the only
external dependency is a CDN copy of SheetJS, loaded on demand to read the workbook.

## Sections (collapsible left menu)

**Density Dashboard** — the main view.
- Four headline stats: portfolio margin, median margin per cleaner, buildings at or below 0%, clusters at or below 0%.
- A Miami street map with every building pinned and coloured by its margin, and a halo per cluster coloured by the cluster's margin.
- Buildings table (margin per cleaner, week-over-week change). Hovering a row — or a map pin — opens a card with the building's units, how many weeks ago it launched, remote access, cluster, hours and visits per week, and its last four weeks of margin.
- Clusters table: buildings, total units, cleaners (editable), cluster margin, week-over-week change.
- Week-over-week matrix: every building, then every cluster, then the portfolio, for every week in the sheet.

**Cluster analysis** — the same clusters with total units, cleaners, **units per cleaner**, hours per
week, capacity, **utilization**, revenue per week, revenue per unit, margin and week-over-week change.

**Sign-up growth** — one curve per building, or per cluster via the **View by** selector.
- Toggle between cumulative **Total sign-ups** (column C) and **New sign-ups per week** (column H).
- Chip picker selects any combination of buildings/clusters, or all of them.
- Hovering a line shows that week's total signed up, new that week, and % change week over week.
- Table below: units, total sign-ups, **% signed up**, new in the last 4 weeks, weekly average, best week.
- **Events table** — what drove sign-ups. Add an event (building, week, name, description, impact in new sign-ups) with the **Add event** button; the list filters by building. Shared across everyone viewing the page (see Shared backend below).

**Scenario planner** — launch a hypothetical building into a cluster and see where the margin lands.
- Inputs: building name, units, cluster, cleaners hired, revenue per unit, ramp curve, hours per cleaner-day, days per week.
- Four stats: expected revenue at maturity, hours the launch needs against the cluster's idle hours, cluster margin after, hours left over.
- Before/after table for every cluster, in the same columns as Cluster analysis.
- A 12-week ramp chart with a ±30% band, marking the week the scenario crosses today's margin.
- Sensitivity: revenue per unit needed to hold today's margin, to stay above 0%, and to pay for a hire, plus the cluster's current utilization.
- **Pipeline** — prospective buildings (name, units, type, management, cluster, status, lat/lng). Marking one **Launched** adds it to the portfolio and its cluster. Shared across everyone viewing the page.

**Forecasting** — turns orders already booked for a coming week into an expected week.
- Reads a separate "orders" workbook (one tab per posting, one row per order: Date, Building, Amount, Tip, Status, Type — optionally a resident/username column).
- **New bookings uplift** — calibrate a week by pulling its Wednesday list and the same week once it closed; the ratio between the two totals is that week's uplift, and the average across calibrated weeks is what the forecast multiplies booked orders by. Under each calibrated row: how many new orders came in after the Wednesday list (count + value) and how many were cancelled/refunded (count + value), matched by building + resident where that column exists, otherwise by date + amount + type. This reconciliation is approximate when an existing order's amount or date changes rather than being added or cancelled outright.
- **Biggest opportunities** — buildings under-pricing relative to the portfolio, and orders concentrated on too few days.

**Building settings** — per-building facts the sheet does not carry: **# Units**, **cleaners assigned**,
**access method** (has remote access / does not have remote access) and **day it went live**, plus a
read-only "first revenue in sheet" column. All seven buildings ship prefilled.

## Header controls

- **Cleaner salary** — one cleaner's weekly salary, default $720/wk.
- **Week** — which week the dashboard reads.
- **Range** — Selected week / Past 4 weeks / All time. Over a multi-week range each building's revenue, visits and hours become weekly averages across the weeks it reported, so margins stay comparable to the single-week view, and week-over-week compares against the preceding period of the same length.

## Formulas

- **Margin per single cleaner** (per building) = (weekly revenue − one cleaner's weekly salary) ÷ that salary.
- **Cluster margin** = (Σ revenue of the cluster's buildings − cleaners in the cluster × salary) ÷ (cleaners in the cluster × salary).
- **Portfolio margin** = (Σ revenue of all buildings − all cluster cleaners × salary) ÷ (all cluster cleaners × salary).
- **Units per cleaner** = total units in the cluster ÷ cleaners assigned to it.
- **Capacity** = cleaners × hours per cleaner-day (6.5) × days per week (6). **Utilization** = hours of operation ÷ capacity.
- **Scenario revenue** = units × revenue per unit per week, defaulting to the cluster's own current revenue per unit.
- **Scenario hours** = (scenario revenue ÷ cluster average order value) × cluster average visit duration.

Cleaner salary, cleaners per cluster (Downtown 2, Edgewater 3 by default), the capacity assumptions,
logged events, the pipeline, the promo calendar and everything in Building settings are typed into the
page and saved to the shared backend below (with a localStorage copy kept as an instant/offline
fallback). They are not read from the "Weekly View Data" sheet.

## Data source

Google Sheet: `Weekly View Data`
`https://docs.google.com/spreadsheets/d/1MQ_8TZRAiwgvJjancyrZz27rFVAHRXxbdEoLl5shM9Y/`

Rules the page follows:

- **One tab per building. The tab name is the building name.** Current tabs: Hamilton, Forma, Bezel,
  Miami World Tower, Muze at Met, Paraiso Bayviews, Wynd2728.
- Inside a tab, **one row per week**, keyed on the `Week Start` column. Columns read: `Revenue`,
  `Total Sign Ups`, `New Sign Ups`, `Total Visits`, `Total Hours of Operations`, `Avg Visit Duration`,
  `AOV`. Everything else is ignored.
- Tab names are matched loosely against the building registry inside the page ("Bezel" finds "Bezel
  Miami", "MWT" finds "Miami World Tower"). A tab that matches nothing is listed under the map as
  "not on the map".
- The sheet must be shared as **anyone with the link can view** (or published to the web). The page
  fetches the whole workbook as xlsx; if that is blocked it falls back to fetching each tab as CSV.

The URL is prefilled and remembered, so the dashboard re-reads the sheet on every visit. Uploading
the same workbook as `.xlsx` works offline.

## Known limits

- **Hours of operation and visit durations are logged by cleaners themselves**, so utilization and the
  hours a scenario needs are indicative rather than exact. Every view that uses them says so.
- **The ramp curve rests on very few launches.** Measured from the sheet, those launches reached
  near-mature revenue within a week or two, so the measured curve is almost flat and reads as a best
  case; the planner therefore defaults to a conventional 12-week ramp and shows a ±30% band.
- **% signed up** is total sign-ups ÷ units. It is not penetration — penetration (unique units
  actually serviced) is a separate metric and is not in the page yet.
- Nothing here separates a launch effect from seasonality.

## Shared backend

Editable settings (salary, cluster cleaner counts, building settings, events, pipeline, promo calendar,
the orders sheet URL) are stored in a **separate Google Sheet** with one tab per data set — `Settings`,
`Clusters`, `Buildings`, `Events`, `Pipeline`, `PromoCalendar`, `OrdersSource` — fronted by a small Apps
Script web app so every visitor reads and writes the same data instead of it living in their own
browser. See `backend-sheet/` for the tab templates (CSV, importable via File → Import → Insert new
sheet) and `backend-sheet/AppsScript.gs` (paste into Extensions → Apps Script on that sheet, then
Deploy → New deployment → Web app → execute as Me → access Anyone, and put the resulting `/exec` URL
into `API_URL` near the top of `index.html`'s script).

If the fetch to `API_URL` fails (deployment not set up yet, network blocked), the page silently falls
back to whatever is in localStorage so it still works standalone.

## Adding a building

Add its tab to the sheet, then add one line to the `SAMPLE` array near the top of the script in
`index.html`: name, address, latitude, longitude, cluster, cleaners. Without that line the page has no
coordinates for it and it cannot be drawn on the map. Fill in its units, cleaners, access method and
live date under Building settings.

## Publishing

Static file, no build step. Drop `index.html` into the `zing-landing` repo at `/kpi/index.html` so it
serves at `justzingit.com/kpi/`. Internal tool — it should not be linked from any resident-facing page.
