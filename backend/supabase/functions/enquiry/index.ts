// Royal Drive — lead capture Edge Function (Supabase / Deno)
//
// Deploy:   supabase functions deploy enquiry --no-verify-jwt
// Secrets:  supabase secrets set RESEND_API_KEY=... LEAD_NOTIFY_TO=sales@royaldrive.example \
//             LEAD_FROM="Royal Drive <leads@royaldrive.example>" ALLOWED_ORIGINS=https://www.royaldrive.example
//           Optional: TURNSTILE_SECRET=...  SHEETS_WEBHOOK_URL=<Apps Script /exec URL to mirror leads to a Sheet>
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by Supabase.

import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});
const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const KINDS = new Set(["enquiry", "car", "availability", "valuation", "testdrive", "newsletter"]);
const TYPES = new Set(["Buy", "Sell", "Exchange", "Finance", "Test Drive"]);
const MAX_PER_10_MIN = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function cors(origin: string | null): Record<string, string> {
  const allow = !ALLOWED.length ? "*" : origin && ALLOWED.includes(origin) ? origin : ALLOWED[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  };
}
const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const clean = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : undefined) || undefined;
const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

/** Mirrors the client-side rules — never trust the browser alone. */
function validate(p: Record<string, any>): string | null {
  if (!KINDS.has(p.kind)) return "Invalid form";
  if (p.kind === "newsletter") return EMAIL_RE.test(p.email ?? "") ? null : "Invalid email";
  const phone = String(p.phone ?? "").replace(/\D/g, "").slice(-10);
  if (!/^[6-9]\d{9}$/.test(phone)) return "Invalid phone number";
  if (p.kind !== "valuation" && (!p.name || String(p.name).trim().length < 2)) return "Name is required";
  if (p.email && !EMAIL_RE.test(p.email)) return "Invalid email";
  if (p.enquiry_type && !TYPES.has(p.enquiry_type)) return "Invalid enquiry type";
  if (p.enquiry_type === "Test Drive" && (!p.preferred_date || !p.preferred_time)) return "Test drive date and time are required";
  if (p.kind === "valuation" && (!p.brand || !p.model || !p.year || !p.km)) return "Car details are required";
  if (!p.consent) return "Consent is required";
  return null;
}

async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = Deno.env.get("TURNSTILE_SECRET");
  if (!secret) return true; // Turnstile not configured
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  return (await res.json()).success === true;
}

async function notify(lead: Record<string, any>) {
  const key = Deno.env.get("RESEND_API_KEY"), to = Deno.env.get("LEAD_NOTIFY_TO");
  if (!key || !to) return;
  const rows = Object.entries(lead)
    .filter(([k, v]) => v != null && v !== "" && !["ip_hash", "user_agent", "utm"].includes(k))
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#64748b">${k}</td><td style="padding:6px 12px"><b>${escapeHtml(String(v))}</b></td></tr>`)
    .join("");
  const subject = lead.kind === "valuation"
    ? `New valuation: ${lead.year} ${lead.brand} ${lead.model} — ${lead.phone}`
    : `New ${lead.enquiry_type ?? lead.kind} lead: ${lead.name} — ${lead.car_name ?? "general enquiry"}`;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: Deno.env.get("LEAD_FROM") ?? "Royal Drive <onboarding@resend.dev>",
      to: to.split(",").map((s) => s.trim()),
      subject,
      html: `<table>${rows}</table><p>Call within 30 minutes: <a href="tel:${lead.phone}">${lead.phone}</a></p>`,
    }),
  });
}

Deno.serve(async (req) => {
  const headers = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405, headers);

  let p: Record<string, any>;
  try { p = await req.json(); } catch { return json({ ok: false, error: "Invalid JSON" }, 400, headers); }

  // Honeypot filled → pretend success so bots learn nothing.
  if (p.hp) return json({ ok: true }, 200, headers);

  const err = validate(p);
  if (err) return json({ ok: false, error: err }, 422, headers);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "0.0.0.0";
  if (!(await verifyTurnstile(p.turnstile_token, ip))) return json({ ok: false, error: "Spam check failed" }, 403, headers);

  if (p.kind === "newsletter") {
    const { error } = await supabase.from("newsletter_subscribers")
      .upsert({ email: String(p.email).toLowerCase().trim(), source_page: clean(p.page) });
    return error ? json({ ok: false, error: "Could not subscribe" }, 500, headers) : json({ ok: true }, 200, headers);
  }

  // Per-IP rate limit (IP is stored only as a salted hash).
  const ip_hash = await sha256(ip + (Deno.env.get("SUPABASE_URL") ?? ""));
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await supabase.from("leads").select("id", { count: "exact", head: true })
    .eq("ip_hash", ip_hash).gte("created_at", since);
  if ((count ?? 0) >= MAX_PER_10_MIN) return json({ ok: false, error: "Too many requests" }, 429, headers);

  const lead = {
    kind: p.kind,
    name: clean(p.name, 120),
    phone: "+91" + String(p.phone).replace(/\D/g, "").slice(-10),
    email: clean(p.email, 160),
    enquiry_type: clean(p.enquiry_type, 20),
    car_id: clean(p.car_id, 80),
    car_name: clean(p.car_name, 160),
    car_price: Number.isFinite(+p.car_price) && p.car_price ? Math.round(+p.car_price) : null,
    budget: clean(p.budget, 40),
    preferred_date: clean(p.preferred_date, 10) ?? null,
    preferred_time: clean(p.preferred_time, 20),
    message: clean(p.message, 1000),
    brand: clean(p.brand, 60),
    model: clean(p.model, 80),
    year: p.year ? parseInt(p.year, 10) : null,
    km: p.km ? parseInt(String(p.km).replace(/\D/g, ""), 10) : null,
    consent: !!p.consent,
    page: clean(p.page, 300),
    referrer: clean(p.referrer, 300),
    utm: typeof p.utm === "object" && p.utm ? p.utm : {},
    ip_hash,
    user_agent: clean(req.headers.get("user-agent") ?? "", 300),
  };

  const { error } = await supabase.from("leads").insert(lead);
  if (error) { console.error(error); return json({ ok: false, error: "Could not save enquiry" }, 500, headers); }

  // Side effects: email the sales team, optionally mirror into Google Sheets.
  const tasks: Promise<unknown>[] = [notify(lead)];
  const sheet = Deno.env.get("SHEETS_WEBHOOK_URL");
  if (sheet) {
    const { ip_hash: _omit, ...row } = lead;
    tasks.push(fetch(sheet, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(row) }));
  }
  await Promise.allSettled(tasks);

  return json({ ok: true }, 200, headers);
});
