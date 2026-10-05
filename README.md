# Royal Drive — Certified Pre-Owned Luxury Car Showroom

**Drive Premium. Pay Smart.** A fast, accessible, mobile-first website for a certified pre-owned premium car showroom. Plain HTML/CSS/JS with no build step and no framework, so it can be hosted on any static host (Netlify, Vercel, Cloudflare Pages, S3, cPanel).

## Run locally

```bash
node scripts/serve.js
```

Open http://localhost:5173. Opening `index.html` directly also works. The local server is only needed so the map and fetch behave like production.

## Pages

| Page | What's on it |
|---|---|
| `index.html` | Sticky glass navbar · centered hero with quick search · glass trust-stats bar with animated counters · category tiles · *Handpicked for You* grid with filter chips · recently viewed · Why Choose Us · Sell/Exchange instant quote · 4-step timeline · EMI calculator + finance partners · testimonials · enquiry form + map · newsletter + Visit Us · footer |
| `inventory.html` | All cars, with search, sort, brand/model/price/fuel/year/body/transmission filters and Luxury/Budget/Saved chips. Filters sync to the URL, so filtered views can be shared (e.g. `?body=SUV&budget=3000000-5000000`) |
| `car.html?id=…` | Gallery with thumbnails, swipe, click-to-zoom, a 360° viewer and a video walkaround · key specs grid · features · inspection score with a downloadable report · EMI calculator with down payment · price card and a sticky enquiry card (car auto-filled) · Similar Cars · Recently viewed |

## Features across the site

- **Check Availability**: every car card opens a short form (name and phone) in a modal, with WhatsApp as an alternative. It takes two taps from discovery to lead.
- **Compare up to 3 cars**: a floating tray opens a side-by-side table. The best value in each row is highlighted.
- **Wishlist (♥ Saved)** and **recently viewed** are saved in `localStorage`.
- **Mobile**: floating WhatsApp and call buttons, plus a sticky bottom bar with "Enquire Now".
- **Forms**: validation runs inline when a field loses focus and again on submit (Indian mobile numbers, email, test-drive date within 60 days). They show clear error messages and a loading spinner. On success they show *"Thanks! Our team will call you within 30 minutes"*, plus a WhatsApp follow-up button. Each form has a consent checkbox. Spam protection uses a honeypot field, a minimum time to fill the form, and optional Cloudflare Turnstile.
- **Instant quote**: the sell form shows an indicative price range on screen and also captures the lead.

## Configuration

Edit **`assets/js/config.js`**. It holds the phone number, WhatsApp number, address, opening hours, lead endpoint, Turnstile key, GA4 ID and Meta Pixel ID.
Edit **`assets/js/data.js`** to change the inventory. Each car is one object. In production, load the same shape from your DMS or from Supabase.

> **Images:** car photos are Unsplash placeholders and do not show the exact variant listed. Replace each car's `img` with your own studio photos. To use a real 360° view, add `spin: [url1, url2, …]` (24–36 frames) to a car. The viewer will then scrub through the frames instead of panning. To add a walkaround video, set `video: "…mp4"`.

## Lead capture backend

Leave `enquiryEndpoint` empty to run in **demo mode**. Submissions are then saved to `localStorage["rd:leads"]` and logged to the console. To go live, pick one of these options:

### Option A: Supabase (database + email) *(recommended)*
1. Run `backend/supabase/schema.sql`. It creates the `leads` and `newsletter_subscribers` tables with RLS enabled.
2. Deploy the function:
   ```bash
   supabase functions deploy enquiry --no-verify-jwt
   ```
3. Set the function's secrets:
   ```bash
   supabase secrets set RESEND_API_KEY=… LEAD_NOTIFY_TO=sales@yourdomain ALLOWED_ORIGINS=https://yourdomain
   ```
   Optional secrets: `TURNSTILE_SECRET`, and `SHEETS_WEBHOOK_URL` to also copy each lead into Google Sheets.
4. Set `enquiryEndpoint` to `https://<project>.supabase.co/functions/v1/enquiry`.

The function validates input on the server, checks the honeypot and Turnstile, limits each IP to 5 submissions per 10 minutes (it stores only a hash of the IP), saves the lead and emails the sales team through Resend.

### Option B: Google Sheets only (no server)
Paste `backend/google-apps-script/Code.gs` into the Apps Script editor of a Google Sheet. Set `NOTIFY_EMAIL` as a script property and deploy it as a web app that anyone can access. Put the `/exec` URL in `enquiryEndpoint`. Each lead is added as a row and the script sends an email.

## Analytics

Set `ga4Id` and/or `metaPixelId` in `config.js`. All tracking goes through one `RD.track()` helper, which sends each event to both GA4 and Meta Pixel.

| Event (GA4) | Meta Pixel | Fired when |
|---|---|---|
| `generate_lead` | Lead | Any form submitted successfully |
| `schedule_test_drive` | Schedule | Test-drive enquiry submitted |
| `whatsapp_click` | Contact | Any wa.me link clicked (includes `location`) |
| `call_click` | Contact | Any tel: link clicked |
| `view_item` | ViewContent | Car detail page viewed |
| `add_to_wishlist` | AddToWishlist | Car saved |
| `search` | Search | Hero search or inventory search used |
| `sign_up` | CompleteRegistration | Newsletter subscription |
| `add_to_compare`, `compare_view`, `filter_used`, `check_availability_open`, `download_report`, `view_360`, `video_open`, `emi_calculator_used`, `form_error` | — | Engagement and funnel diagnostics |

UTM parameters, gclid and fbclid are kept for the visitor's session history and sent with every lead.

## SEO and performance

- Every page has a unique title, meta description, canonical URL, Open Graph and Twitter tags.
- Structured data: `AutoDealer` (with opening hours and rating) on the home page, `ItemList` on the inventory page, and `Car` + `Offer` + `BreadcrumbList` on each car page.
- Run `node scripts/build-seo.js` to regenerate `sitemap.xml` (with image entries) and `robots.txt` from the inventory.
- The hero image is preloaded with `fetchpriority="high"` and a responsive `srcset`. All other images are lazy-loaded with explicit width and height to avoid layout shift. The map iframe loads only when it scrolls into view. Fonts use `display=swap`. There is no JavaScript framework. Each page loads about 70–90 KB of unminified JS, roughly 20 KB after gzip.
- Accessibility: skip link, landmarks, labelled form controls, `aria-invalid` and `aria-describedby` on errors, visible focus rings, keyboard-operable gallery and modals, and support for `prefers-reduced-motion`.
- Car pages are rendered on the client. Google indexes them, but for best results you can prerender `/cars/<id>.html` at deploy time with the same template (or move to Astro/Next.js and reuse this CSS).

## Structure

```
index.html  inventory.html  car.html  sitemap.xml  robots.txt
assets/css/styles.css      design tokens + all components
assets/js/config.js        business settings
assets/js/data.js          inventory
assets/js/core.js          shared: icons, cards, wishlist, compare, forms, EMI, analytics, modals
assets/js/home.js | inventory.js | car.js   page logic
assets/img/                logo + favicon
backend/supabase/          schema.sql + functions/enquiry (Edge Function)
backend/google-apps-script/Code.gs
scripts/serve.js | build-seo.js
```

## Before launch

Replace the placeholder phone number, address, email, social links, bank partner names and testimonials with real ones. Add a privacy policy page and link it from the consent checkboxes. Update `siteUrl` in `config.js` and the canonical and `og:` URLs in the HTML.
