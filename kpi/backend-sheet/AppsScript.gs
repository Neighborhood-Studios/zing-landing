/* Zing KPI Dashboard — write-back API.
   Paste into Extensions > Apps Script on the "Weekly View Data" sheet, save,
   then Deploy > New deployment > type "Web app" > execute as "Me",
   access "Anyone" > Deploy. Copy the /exec URL into index.html.

   Tabs this expects (import the CSVs first): Settings, Clusters, Buildings,
   Events, Pipeline, PromoCalendar, OrdersSource.

   Each tab's first row is a header row; the first column of Settings and
   OrdersSource is "key" and rows are matched/updated by that key. Buildings
   is matched by "building". Clusters by "cluster". Events, Pipeline and
   PromoCalendar are append-only or replace-all lists (no natural key), so
   they're always overwritten wholesale on save. */

function doGet(e) {
  const out = {};
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tabs = ["Settings", "Clusters", "Buildings", "Events", "Pipeline", "PromoCalendar", "OrdersSource"];
  tabs.forEach(name => {
    const sh = ss.getSheetByName(name);
    out[name] = sh ? sh.getDataRange().getValues() : [];
  });
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const { tab, action, key, values, rows } = body;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(tab);
  if (!sh) return jsonError("unknown tab: " + tab);

  if (action === "upsert") {
    // values: object keyed by header name; key: the header name used to find an existing row (e.g. "building")
    const data = sh.getDataRange().getValues();
    const header = data[0];
    const keyCol = header.indexOf(key);
    if (keyCol < 0) return jsonError("key column not found: " + key);
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][keyCol]) === String(values[key])) { rowIndex = i; break; }
    }
    const rowArr = header.map(h => (h in values ? values[h] : (rowIndex >= 0 ? data[rowIndex][header.indexOf(h)] : "")));
    if (rowIndex >= 0) sh.getRange(rowIndex + 1, 1, 1, header.length).setValues([rowArr]);
    else sh.appendRow(rowArr);
  } else if (action === "replaceAll") {
    // rows: array of objects; rebuilds the tab from its existing header row down
    const header = sh.getDataRange().getValues()[0];
    sh.getRange(2, 1, Math.max(sh.getMaxRows() - 1, 1), header.length).clearContent();
    const body = rows.map(r => header.map(h => (h in r ? r[h] : "")));
    if (body.length) sh.getRange(2, 1, body.length, header.length).setValues(body);
  } else {
    return jsonError("unknown action: " + action);
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

function jsonError(msg) {
  return ContentService.createTextOutput(JSON.stringify({ ok: false, error: msg })).setMimeType(ContentService.MimeType.JSON);
}
