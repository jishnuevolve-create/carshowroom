/**
 * Royal Drive — Google Sheets lead capture (no-server option).
 *
 * Setup
 *  1. Create a Google Sheet. Extensions → Apps Script → paste this file.
 *  2. Project Settings → Script properties: NOTIFY_EMAIL = sales@royaldrive.example
 *  3. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone.
 *  4. Put the /exec URL in assets/js/config.js → enquiryEndpoint.
 *
 * The site posts JSON as text/plain (a "simple" request), so no CORS preflight is needed.
 */

const LEAD_COLUMNS = [
  "submitted_at", "kind", "enquiry_type", "name", "phone", "email", "car_id", "car_name", "car_price", "budget",
  "preferred_date", "preferred_time", "message", "brand", "model", "year", "km", "consent", "page", "referrer", "utm",
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function doPost(e) {
  try {
    const p = JSON.parse(e.postData.contents || "{}");
    if (p.hp) return respond({ ok: true }); // honeypot

    if (p.kind === "newsletter") {
      if (!EMAIL_RE.test(p.email || "")) return respond({ ok: false, error: "Invalid email" });
      sheet_("Newsletter", ["submitted_at", "email", "page"]).appendRow([new Date(), p.email, p.page || ""]);
      return respond({ ok: true });
    }

    const phone = String(p.phone || "").replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(phone)) return respond({ ok: false, error: "Invalid phone" });
    if (p.kind !== "valuation" && (!p.name || String(p.name).trim().length < 2)) return respond({ ok: false, error: "Name required" });
    if (!p.consent) return respond({ ok: false, error: "Consent required" });

    // Rate limit: max 3 submissions per phone number per 10 minutes.
    const cache = CacheService.getScriptCache();
    const key = "rl_" + phone;
    const n = Number(cache.get(key) || 0);
    if (n >= 3) return respond({ ok: false, error: "Too many requests" });
    cache.put(key, String(n + 1), 600);

    p.phone = "+91" + phone;
    p.submitted_at = new Date();
    p.utm = p.utm ? JSON.stringify(p.utm) : "";
    const row = LEAD_COLUMNS.map((c) => (p[c] === undefined || p[c] === null ? "" : p[c]));
    sheet_("Leads", LEAD_COLUMNS).appendRow(row);

    const to = PropertiesService.getScriptProperties().getProperty("NOTIFY_EMAIL");
    if (to) {
      const subject = p.kind === "valuation"
        ? "New valuation: " + [p.year, p.brand, p.model].join(" ") + " — " + p.phone
        : "New " + (p.enquiry_type || p.kind) + " lead: " + p.name + " — " + (p.car_name || "general enquiry");
      const body = LEAD_COLUMNS.filter((c) => row[LEAD_COLUMNS.indexOf(c)] !== "")
        .map((c) => c + ": " + row[LEAD_COLUMNS.indexOf(c)]).join("\n");
      MailApp.sendEmail(to, subject, body + "\n\nCall within 30 minutes: " + p.phone);
    }
    return respond({ ok: true });
  } catch (err) {
    console.error(err);
    return respond({ ok: false, error: "Server error" });
  }
}

function sheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(headers); sh.setFrozenRows(1); }
  return sh;
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
