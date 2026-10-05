/**
 * Royal Drive — site configuration.
 * Everything a showroom owner needs to change lives here.
 */
window.RD_CONFIG = {
  brand: "Royal Drive",
  siteUrl: "https://www.royaldrive.example", // used for canonical/OG/schema
  phone: "+919876543210",
  phoneDisplay: "+91 98765 43210",
  whatsapp: "919876543210", // international format, no "+"
  email: "sales@royaldrive.example",
  address: {
    street: "42, Outer Ring Road, Bellandur",
    city: "Bengaluru",
    region: "Karnataka",
    postal: "560103",
    country: "IN",
    mapQuery: "Bellandur Outer Ring Road Bengaluru",
  },
  hours: [
    // 0 = Sunday … 6 = Saturday, 24h "HH:MM"
    { days: [1, 2, 3, 4, 5, 6], open: "09:30", close: "20:00", label: "Mon – Sat" },
    { days: [0], open: "10:30", close: "18:00", label: "Sunday" },
  ],

  /**
   * Lead capture endpoint. Leave empty to run in demo mode (submissions are
   * stored in localStorage and logged to the console).
   *  - Supabase Edge Function:  https://<project>.supabase.co/functions/v1/enquiry
   *  - Google Apps Script:      https://script.google.com/macros/s/<id>/exec
   * See /backend for both implementations.
   */
  enquiryEndpoint: "",
  newsletterEndpoint: "", // same function handles { kind: "newsletter" }

  /** Optional Cloudflare Turnstile site key for spam protection (invisible). */
  turnstileSiteKey: "",

  /** Analytics — leave blank to disable. */
  ga4Id: "",      // e.g. "G-XXXXXXXXXX"
  metaPixelId: "", // e.g. "123456789012345"
};
