/**
 * Royal Drive — shared core.
 * Icons, formatting, analytics, navigation, motion, car cards, wishlist,
 * compare, recently-viewed, enquiry forms, EMI calculator, modals.
 * No dependencies. Exposes window.RD for page scripts.
 */
(function () {
  "use strict";
  const CFG = window.RD_CONFIG || {};
  const CARS = window.RD_CARS || [];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ Icons */
  const ICONS = {
    check: '<path d="M20 6 9 17l-5-5"/>',
    "arrow-right": '<path d="M5 12h14M13 5l7 7-7 7"/>',
    "arrow-up-right": '<path d="M7 17 17 7M8 7h9v9"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    "chevron-left": '<path d="m15 18-6-6 6-6"/>',
    "chevron-right": '<path d="m9 18 6-6-6-6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    compare: '<path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/>',
    return: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    fuel: '<path d="M3 22h12M4 9h10M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0V9.83a2 2 0 0 0-.59-1.42L18 5"/>',
    gear: '<circle cx="5" cy="6" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="12" cy="18" r="2"/><path d="M5 8v8M12 8v8M19 8v4H5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    "360": '<ellipse cx="12" cy="12" rx="10" ry="4.5"/><path d="m14 19-2-2.5 2-2.5"/><path d="M12 3v4"/>',
    video: '<path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    sparkle: '<path d="M12 3l1.9 5.8L20 10.7l-5.8 1.9L12 18.5l-1.9-5.9L4 10.7l6.1-1.9z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    engine: '<path d="M4 10h2V7h4V5h4v2h3l2 3h2v6h-2l-2 3H8l-2-3H4z"/>',
    palette: '<circle cx="12" cy="12" r="10"/><circle cx="8" cy="10" r="1.2"/><circle cx="12" cy="7.5" r="1.2"/><circle cx="16" cy="10" r="1.2"/><path d="M12 22a3 3 0 0 1 0-6h2"/>',
    id: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 9h3M15 13h3M6 16a3 3 0 0 1 6 0"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    youtube: '<path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
    crown: '<path d="M3 18 4.5 7l5 4.5L12 5l2.5 6.5 5-4.5L21 18z"/>',
  };
  const WA_PATH = '<path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.89 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41z"/>';

  function injectSprite() {
    const symbols = Object.entries(ICONS).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join("")
      + `<symbol id="i-whatsapp" viewBox="0 0 24 24">${WA_PATH}</symbol>`;
    const holder = document.createElement("div");
    holder.hidden = true;
    holder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg">${symbols}</svg>`;
    document.body.prepend(holder);
  }
  const icon = (name, cls = "") => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  /* ------------------------------------------------------------ Formatting */
  const nf = new Intl.NumberFormat("en-IN");
  const fmtNum = (n) => nf.format(Math.round(n));
  const fmtINR = (n) => "₹" + fmtNum(n);
  function fmtPrice(n) {
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(2).replace(/\.?0+$/, "")} Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(2).replace(/\.?0+$/, "")} Lakh`;
    return fmtINR(n);
  }
  const fmtKm = (km) => `${fmtNum(km)} km`;
  const ownerLabel = (n) => ["", "1st", "2nd", "3rd"][n] ? `${["", "1st", "2nd", "3rd"][n]} Owner` : `${n}th Owner`;
  function emi(principal, annualRate, months) {
    if (principal <= 0 || months <= 0) return 0;
    const r = annualRate / 12 / 100;
    if (r === 0) return principal / months;
    const f = Math.pow(1 + r, months);
    return (principal * r * f) / (f - 1);
  }
  // Default "EMI from" shown on cards: 20% down, 9.5%, 60 months.
  const emiFrom = (price) => emi(price * 0.8, 9.5, 60);

  /* ------------------------------------------------------------- Storage */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("rd:" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem("rd:" + k, JSON.stringify(v)); } catch { /* private mode */ } },
  };
  const byId = (id) => CARS.find((c) => c.id === id);

  /* ----------------------------------------------------------- Analytics */
  function initAnalytics() {
    if (CFG.ga4Id) {
      const s = document.createElement("script");
      s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${CFG.ga4Id}`;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", CFG.ga4Id);
    }
    if (CFG.metaPixelId) {
      /* eslint-disable */
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      /* eslint-enable */
      window.fbq("init", CFG.metaPixelId);
      window.fbq("track", "PageView");
    }
  }
  const PIXEL_MAP = { generate_lead: "Lead", whatsapp_click: "Contact", call_click: "Contact", view_item: "ViewContent", add_to_wishlist: "AddToWishlist", search: "Search", sign_up: "CompleteRegistration", schedule_test_drive: "Schedule" };
  function track(event, params = {}) {
    if (window.gtag) window.gtag("event", event, params);
    if (window.fbq && PIXEL_MAP[event]) window.fbq("track", PIXEL_MAP[event], params);
    if (!CFG.ga4Id && !CFG.metaPixelId) console.debug("[track]", event, params);
  }

  /* ------------------------------------------------------------- Links */
  const waLink = (text) => `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(text)}`;
  const carUrl = (c) => `car.html?id=${encodeURIComponent(c.id)}`;

  function wireLinks() {
    $$("[data-wa]").forEach((a) => {
      const id = a.dataset.waCar;
      const car = id && byId(id);
      const msg = a.dataset.wa || (car ? `Hi Royal Drive, is the ${car.name} (${fmtPrice(car.price)}) still available?` : "Hi Royal Drive, I'd like to know more about your certified cars.");
      a.href = waLink(msg); a.target = "_blank"; a.rel = "noopener";
    });
    $$("[data-tel]").forEach((a) => { a.href = `tel:${CFG.phone}`; });
    $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
  }
  function trackContactClicks() {
    // Track every call / WhatsApp click site-wide.
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a) return;
      const where = a.dataset.track || a.closest("[data-section]")?.dataset.section || "unknown";
      if (a.href.startsWith("tel:")) track("call_click", { location: where });
      else if (a.href.includes("wa.me")) track("whatsapp_click", { location: where, car_id: a.dataset.waCar || undefined });
    });
  }

  /* ----------------------------------------------------------- Nav */
  function initNav() {
    const nav = $(".nav");
    if (nav) {
      const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 12);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    const drawer = $(".drawer");
    if (!drawer) return;
    const open = () => { drawer.classList.add("is-open"); drawer.setAttribute("aria-hidden", "false"); $(".nav__toggle")?.setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden"; $("a, button", $(".drawer__panel"))?.focus(); };
    const close = () => { drawer.classList.remove("is-open"); drawer.setAttribute("aria-hidden", "true"); $(".nav__toggle")?.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; };
    $(".nav__toggle")?.addEventListener("click", open);
    $$("[data-drawer-close], .drawer__scrim, .drawer a", drawer).forEach((el) => el.addEventListener("click", close));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  /* --------------------------------------------------------- Motion */
  let revealObserver;
  function observeReveal(root = document) {
    const els = $$(".reveal:not(.is-in)", root);
    if (reduceMotion || !("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("is-in")); return; }
    revealObserver = revealObserver || new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); revealObserver.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach((el) => revealObserver.observe(el));
  }
  function initCounters() {
    const els = $$("[data-count]");
    const run = (el) => {
      const target = +el.dataset.count, suffix = el.dataset.suffix || "", dur = 1600, t0 = performance.now();
      if (reduceMotion) { el.textContent = fmtNum(target) + suffix; return; }
      const step = (t) => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = fmtNum(target * e) + suffix; if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) return els.forEach(run);
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } }), { threshold: 0.5 });
    els.forEach((el) => io.observe(el));
  }
  function observeOnce(el, cls = "is-in") {
    if (!el) return;
    if (!("IntersectionObserver" in window)) return el.classList.add(cls);
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { el.classList.add(cls); io.disconnect(); } }), { threshold: 0.35 });
    io.observe(el);
  }

  /* ---------------------------------------------------------- Toast */
  let toastTimer;
  function toast(msg, ic = "check") {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.setAttribute("aria-live", "polite"); document.body.appendChild(t); }
    t.innerHTML = `${icon(ic, "icon--sm")}<span>${esc(msg)}</span>`;
    t.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-shown"), 2400);
  }

  /* ---------------------------------------------------------- Images */
  // Graceful fallback if a remote image fails.
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (img.tagName === "IMG" && !img.dataset.failed) {
      img.dataset.failed = "1";
      img.closest("div, a, button")?.classList.add("img-fallback");
      img.style.visibility = "hidden";
    }
  }, true);

  /* ------------------------------------------------- Wishlist / Compare */
  const state = { wish: new Set(store.get("wish", [])), cmp: store.get("cmp", []).filter(byId) };
  const MAX_CMP = 3;
  const emit = () => document.dispatchEvent(new CustomEvent("rd:change"));

  function toggleWish(id) {
    const car = byId(id);
    if (state.wish.has(id)) { state.wish.delete(id); toast("Removed from your saved cars", "heart"); }
    else { state.wish.add(id); toast("Saved — find it under ♥ Saved", "heart"); track("add_to_wishlist", { car_id: id, value: car?.price, currency: "INR" }); }
    store.set("wish", [...state.wish]); syncUI(); emit();
  }
  function toggleCompare(id) {
    const i = state.cmp.indexOf(id);
    if (i > -1) state.cmp.splice(i, 1);
    else {
      if (state.cmp.length >= MAX_CMP) { toast(`You can compare up to ${MAX_CMP} cars`, "alert"); return; }
      state.cmp.push(id); track("add_to_compare", { car_id: id });
    }
    store.set("cmp", state.cmp); syncUI(); emit();
  }
  function syncUI() {
    $$("[data-wish]").forEach((b) => { const on = state.wish.has(b.dataset.wish); b.setAttribute("aria-pressed", on); b.setAttribute("aria-label", on ? "Remove from saved" : "Save car"); });
    $$("[data-cmp]").forEach((b) => { const on = state.cmp.includes(b.dataset.cmp); b.setAttribute("aria-pressed", on); b.setAttribute("aria-label", on ? "Remove from compare" : "Add to compare"); });
    $$(".nav__wish .count").forEach((c) => { c.textContent = state.wish.size || ""; c.dataset.n = state.wish.size; });
    renderTray();
  }
  document.addEventListener("click", (e) => {
    const w = e.target.closest("[data-wish]");
    if (w) { e.preventDefault(); toggleWish(w.dataset.wish); w.classList.remove("pop"); void w.offsetWidth; w.classList.add("pop"); return; }
    const c = e.target.closest("[data-cmp]");
    if (c) { e.preventDefault(); toggleCompare(c.dataset.cmp); }
  });

  function renderTray() {
    let tray = $(".compare-tray");
    if (!tray) {
      tray = document.createElement("div");
      tray.className = "compare-tray";
      tray.setAttribute("role", "region");
      tray.setAttribute("aria-label", "Compare cars");
      document.body.appendChild(tray);
      tray.addEventListener("click", (e) => {
        if (e.target.closest("[data-cmp-open]")) openCompare();
        if (e.target.closest("[data-cmp-clear]")) { state.cmp = []; store.set("cmp", []); syncUI(); emit(); }
      });
    }
    const n = state.cmp.length;
    tray.classList.toggle("is-shown", n > 0);
    document.body.classList.toggle("has-tray", n > 0);
    tray.innerHTML = `<div class="compare-tray__thumbs">${state.cmp.map((id) => `<img src="${byId(id).thumb}" alt="">`).join("")}</div>
      <div class="compare-tray__txt">${n} of ${MAX_CMP} <span>cars selected</span></div>
      <button class="compare-tray__clear" data-cmp-clear type="button">Clear</button>
      <button class="btn btn--primary btn--sm" data-cmp-open type="button" ${n < 2 ? "disabled" : ""}>${n < 2 ? "Add 1 more" : "Compare now"}</button>`;
  }

  function openCompare() {
    const list = state.cmp.map(byId).filter(Boolean);
    if (list.length < 2) return;
    track("compare_view", { car_ids: state.cmp.join(",") });
    const rows = [
      ["Price", (c) => fmtPrice(c.price), "price", "min"],
      ["EMI from", (c) => fmtINR(emiFrom(c.price)) + "/mo", "price", "min"],
      ["Year", (c) => c.year, "year", "max"],
      ["Km driven", (c) => fmtKm(c.km), "km", "min"],
      ["Fuel", (c) => c.fuel], ["Transmission", (c) => c.transmission],
      ["Ownership", (c) => ownerLabel(c.owners), "owners", "min"],
      ["Body type", (c) => c.body], ["Engine / Battery", (c) => c.engine], ["Power", (c) => c.power],
      ["Efficiency", (c) => c.efficiency], ["Seats", (c) => c.seats],
      ["Inspection score", (c) => c.score + "/100", "score", "max"],
    ];
    const best = (key, dir) => { const vals = list.map((c) => c[key]); return dir === "min" ? Math.min(...vals) : Math.max(...vals); };
    const html = `<div class="cmp-scroll"><table class="cmp-table">
      <thead><tr><th scope="row"></th>${list.map((c) => `<td><div class="cmp-car"><img src="${c.image}" alt=""><h3>${esc(c.title)}</h3><div class="muted" style="font-size:.85rem">${esc(c.variant)} · ${c.year}</div><button class="rm" type="button" data-cmp="${c.id}">Remove</button></div></td>`).join("")}</tr></thead>
      <tbody>${rows.map(([label, fn, key, dir]) => { const b = key && best(key, dir); return `<tr><th scope="row">${label}</th>${list.map((c) => `<td class="${key && c[key] === b ? "cmp-best" : ""}">${esc(fn(c))}</td>`).join("")}</tr>`; }).join("")}
      <tr><th scope="row"></th>${list.map((c) => `<td><a class="btn btn--primary btn--sm" href="${carUrl(c)}">View car</a></td>`).join("")}</tr></tbody></table></div>`;
    openModal("Compare cars", html);
    document.addEventListener("rd:change", function once() {
      document.removeEventListener("rd:change", once);
      if (state.cmp.length >= 2) openCompare(); else closeModal();
    });
  }

  /* ----------------------------------------------------------- Modal */
  let lastFocus;
  function openModal(title, html, { onOpen, size } = {}) {
    let m = $("#rd-modal");
    if (!m) {
      m = document.createElement("div");
      m.id = "rd-modal"; m.className = "modal"; m.setAttribute("aria-hidden", "true");
      m.innerHTML = `<div class="modal__scrim" data-modal-close></div><div class="modal__box" role="dialog" aria-modal="true" aria-labelledby="rd-modal-title"><div class="modal__head"><h2 id="rd-modal-title"></h2><button class="icon-btn" type="button" data-modal-close aria-label="Close">${icon("x")}</button></div><div class="modal__body"></div></div>`;
      document.body.appendChild(m);
      m.addEventListener("click", (e) => { if (e.target.closest("[data-modal-close]")) closeModal(); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && m.classList.contains("is-open")) closeModal(); });
    }
    lastFocus = document.activeElement;
    $("#rd-modal-title", m).textContent = title;
    $(".modal__body", m).innerHTML = html;
    $(".modal__box", m).classList.toggle("modal__box--sm", size === "sm");
    void m.offsetWidth; // ensure the open transition runs on first creation
    m.classList.add("is-open"); m.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    onOpen && onOpen($(".modal__body", m));
    setTimeout(() => $("[data-modal-close].icon-btn", m)?.focus(), 50);
  }
  function closeModal() {
    const m = $("#rd-modal");
    if (!m) return;
    m.classList.remove("is-open"); m.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lastFocus?.focus?.();
  }

  /* ------------------------------------------------------------ Card */
  function carCard(c, { reveal = true, delay = 0 } = {}) {
    const badge = c.badge === "Just Arrived"
      ? `<span class="badge badge--new">${icon("sparkle")}Just Arrived</span>`
      : `<span class="badge badge--certified">${icon("shield")}Certified</span>`;
    return `<article class="car-card ${reveal ? "reveal" : ""}" style="--d:${delay}s" data-id="${c.id}">
      <a class="car-card__media" href="${carUrl(c)}" tabindex="-1" aria-hidden="true">
        <img src="${c.image}" alt="" loading="lazy" decoding="async" width="900" height="590">
      </a>
      <div class="car-card__badges">${badge}</div>
      <div class="car-card__tools">
        <button class="tool tool--wish" type="button" data-wish="${c.id}" aria-pressed="false" aria-label="Save car">${icon("heart")}</button>
        <button class="tool tool--cmp" type="button" data-cmp="${c.id}" aria-pressed="false" aria-label="Add to compare" title="Compare">${icon("compare")}</button>
      </div>
      <div class="car-card__body">
        <div>
          <h3 class="car-card__title"><a href="${carUrl(c)}">${esc(c.title)}</a></h3>
          <p class="car-card__variant">${esc(c.variant)} · ${c.year}</p>
        </div>
        <div class="specs-row">
          <span class="spec-pill">${icon("gauge")}${fmtKm(c.km)}</span>
          <span class="spec-pill">${icon("fuel")}${c.fuel}</span>
          <span class="spec-pill">${icon("gear")}${c.transmission === "Automatic" ? "Auto" : "Manual"}</span>
          <span class="spec-pill">${icon("user")}${ownerLabel(c.owners)}</span>
        </div>
        <div class="car-card__foot">
          <div class="price">${fmtPrice(c.price)}<small>EMI from ${fmtINR(emiFrom(c.price))}/mo</small></div>
          <button class="btn btn--soft btn--sm" type="button" data-avail="${c.id}">Check Availability</button>
        </div>
      </div>
    </article>`;
  }
  function renderCars(container, list, opts = {}) {
    container.innerHTML = list.map((c, i) => carCard(c, { ...opts, delay: Math.min(i, 5) * 0.06 })).join("");
    syncUI(); observeReveal(container);
  }

  /** Shared filter logic for home + inventory. `f` mirrors URL params. */
  function applyFilters(list, f = {}) {
    const q = (f.q || "").trim().toLowerCase();
    const [min, max] = (f.budget || "").split("-").map((x) => (x === "" || x == null ? null : +x));
    return list.filter((c) =>
      (!f.brand || c.brand === f.brand) &&
      (!f.model || c.model === f.model) &&
      (!f.fuel || c.fuel === f.fuel) &&
      (!f.body || c.body === f.body) &&
      (!f.transmission || c.transmission === f.transmission) &&
      (!f.year || c.year >= +f.year) &&
      (min == null || c.price >= min) && (max == null || c.price <= max) &&
      (f.cat !== "luxury" || c.luxury) && (f.cat !== "budget" || c.budget) &&
      (!f.saved || state.wish.has(c.id)) &&
      (!q || `${c.name} ${c.body} ${c.fuel} ${c.color}`.toLowerCase().includes(q))
    );
  }
  const SORTS = {
    newest: (a, b) => a.added - b.added,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    "km-asc": (a, b) => a.km - b.km,
    "year-desc": (a, b) => b.year - a.year,
  };

  /* ---------------------------------------------- Quick availability modal */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-avail]");
    if (!b) return;
    const c = byId(b.dataset.avail);
    if (!c) return;
    track("check_availability_open", { car_id: c.id });
    openModal("Check availability", `
      <div style="display:grid;grid-template-columns:120px 1fr;gap:16px;align-items:center;margin-bottom:20px">
        <img src="${c.thumb.replace("w=160", "w=320")}" alt="" style="border-radius:14px;aspect-ratio:4/3;object-fit:cover">
        <div><strong style="color:var(--ink);font-size:1.0625rem">${esc(c.name)}</strong><div class="price" style="font-size:1.25rem;margin-top:4px">${fmtPrice(c.price)}</div></div>
      </div>
      ${enquiryFormHTML({ kind: "availability", car: c.id })}`,
      { size: "sm", onOpen: (root) => initForms(root) });
  });

  /* ------------------------------------------------------- Enquiry forms */
  const TYPES = ["Buy", "Sell", "Exchange", "Finance", "Test Drive"];
  function carOptions(selected) {
    return `<option value="">Help me choose</option>` + CARS.map((c) => `<option value="${c.id}" ${c.id === selected ? "selected" : ""}>${esc(`${c.year} ${c.title} ${c.variant} — ${fmtPrice(c.price)}`)}</option>`).join("");
  }
  /** Compact enquiry form used by the availability modal and car page sticky card. */
  function enquiryFormHTML({ kind = "enquiry", car = "", type = "Buy", cta = "Check Availability" } = {}) {
    const uid = "f" + Math.random().toString(36).slice(2, 7);
    return `<form class="form-grid" data-enquiry="${kind}" novalidate>
      <input type="hidden" name="car" value="${esc(car)}">
      <input type="hidden" name="type" value="${esc(type)}">
      <div class="fld full"><label for="${uid}n">Full name</label><input id="${uid}n" name="name" autocomplete="name" placeholder="Your name"><span class="err" id="${uid}n-e">${icon("alert", "icon--sm")}<span></span></span></div>
      <div class="fld full"><label for="${uid}p">Phone number</label><div class="prefix-input"><span>+91</span><input id="${uid}p" name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="98765 43210" maxlength="12"></div><span class="err">${icon("alert", "icon--sm")}<span></span></span></div>
      <input class="hp" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">
      <label class="consent full"><input type="checkbox" name="consent" checked> <span>I agree to be contacted by Royal Drive via call, SMS or WhatsApp. <a href="#">Privacy</a></span></label>
      <span class="err full" data-err-for="consent">${icon("alert", "icon--sm")}<span></span></span>
      <div class="form-alert full" role="alert"></div>
      <div class="form-actions full">
        <button class="btn btn--primary btn--block" type="submit"><span class="spinner"></span><span class="btn__label">${esc(cta)}</span></button>
        <a class="btn btn--ghost btn--block" data-wa data-wa-car="${esc(car)}" data-track="availability_modal">${icon("whatsapp", "icon--fill")} Chat on WhatsApp</a>
      </div>
      <p class="form-note full">${icon("clock", "icon--sm")} We reply within 30 minutes during showroom hours.</p>
    </form>
    ${successHTML()}`;
  }
  function successHTML(title = "Thanks! Our team will call you within 30 minutes", body = "We've received your enquiry. Keep your phone handy — a Royal Drive advisor will reach out shortly.") {
    return `<div class="success" role="status" aria-live="polite" tabindex="-1">
      <div class="success__ic"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></div>
      <h3>${title}</h3><p class="muted" data-success-body>${body}</p>
      <div style="margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <a class="btn btn--wa btn--sm" data-wa data-track="success">${icon("whatsapp", "icon--fill")} Continue on WhatsApp</a>
        <a class="btn btn--ghost btn--sm" href="inventory.html">Browse more cars</a>
      </div></div>`;
  }

  const RULES = {
    name: (v) => !v.trim() ? "Please enter your name" : v.trim().length < 2 ? "Name looks too short" : !/^[\p{L} .'-]+$/u.test(v.trim()) ? "Please use letters only" : "",
    phone: (v) => { const d = v.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, ""); return !d ? "Please enter your phone number" : !/^[6-9]\d{9}$/.test(d) ? "Enter a valid 10-digit Indian mobile number" : ""; },
    email: (v, f) => { const req = f.querySelector('[name="email"]')?.required; return !v.trim() ? (req ? "Please enter your email" : "") : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "That email doesn't look right" : ""; },
    type: (v) => !v ? "Choose what you'd like help with" : "",
    date: (v, f) => {
      if (f.querySelector('[name="type"]:checked')?.value !== "Test Drive" && f.dataset.enquiry !== "testdrive") return "";
      if (!v) return "Pick a date for your test drive";
      const d = new Date(v + "T00:00"), today = new Date(); today.setHours(0, 0, 0, 0);
      if (d < today) return "Please choose today or a future date";
      const max = new Date(today); max.setDate(max.getDate() + 60);
      return d > max ? "Bookings open up to 60 days ahead" : "";
    },
    time: (v, f) => (f.querySelector('[name="type"]:checked')?.value === "Test Drive" || f.dataset.enquiry === "testdrive") && !v ? "Pick a time slot" : "",
    message: (v) => v.length > 1000 ? "Please keep it under 1000 characters" : "",
    consent: (v, f) => f.querySelector('[name="consent"]')?.checked ? "" : "Please agree so we can contact you",
    brand: (v) => !v ? "Select your car's brand" : "",
    model: (v) => !v.trim() ? "Enter your car's model" : "",
    year: (v) => !v ? "Select the year" : "",
    km: (v) => { const n = +String(v).replace(/\D/g, ""); return !v ? "Enter km driven" : n > 500000 ? "That seems too high — please check" : ""; },
  };
  function fieldOf(form, name) { return form.querySelector(`[name="${name}"]:not([type=hidden])`); }
  function setError(form, name, msg) {
    const input = fieldOf(form, name);
    if (!input) return;
    const fld = input.closest(".fld");
    const errEl = fld ? fld.querySelector(".err") : form.querySelector(`[data-err-for="${name}"]`);
    if (fld) { fld.classList.toggle("has-error", !!msg); fld.classList.toggle("is-valid", !msg && !!input.value); }
    if (errEl) { errEl.querySelector("span").textContent = msg; errEl.style.display = msg ? "flex" : ""; if (!errEl.id) errEl.id = "e" + Math.random().toString(36).slice(2, 8); }
    if (msg) { input.setAttribute("aria-invalid", "true"); errEl && input.setAttribute("aria-describedby", errEl.id); }
    else input.removeAttribute("aria-invalid");
  }
  function validateField(form, name) {
    const rule = RULES[name];
    if (!rule) return "";
    const el = fieldOf(form, name);
    if (!el) return "";
    const v = el.type === "radio" ? (form.querySelector(`[name="${name}"]:checked`)?.value || "") : el.value;
    const msg = rule(v, form);
    setError(form, name, msg);
    return msg;
  }
  function validateForm(form) {
    const names = [...new Set($$("[name]", form).filter((el) => el.type !== "hidden").map((el) => el.name))];
    let first = null;
    names.forEach((n) => { const m = validateField(form, n); if (m && !first) first = n; });
    return first;
  }

  const startedAt = Date.now();
  function getUTM() {
    const p = new URLSearchParams(location.search);
    const utm = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"].forEach((k) => { if (p.get(k)) utm[k] = p.get(k); });
    if (Object.keys(utm).length) store.set("utm", utm);
    return store.get("utm", {});
  }

  async function postLead(payload) {
    const url = payload.kind === "newsletter" ? (CFG.newsletterEndpoint || CFG.enquiryEndpoint) : CFG.enquiryEndpoint;
    if (!url) {
      // Demo mode — keep a local log so the flow is testable without a backend.
      await new Promise((r) => setTimeout(r, 1100));
      const log = store.get("leads", []); log.push(payload); store.set("leads", log.slice(-50));
      console.info("[Royal Drive demo] lead captured locally:", payload);
      return { ok: true, demo: true };
    }
    const isAppsScript = url.includes("script.google.com");
    const res = await fetch(url, {
      method: "POST",
      // Apps Script can't answer CORS preflights, so send it as a "simple" request.
      headers: { "Content-Type": isAppsScript ? "text/plain;charset=utf-8" : "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Request failed: " + res.status);
    const data = await res.json().catch(() => ({ ok: true }));
    if (data && data.ok === false) throw new Error(data.error || "Rejected");
    return data;
  }

  function turnstileToken(form) {
    return form.querySelector('[name="cf-turnstile-response"]')?.value || "";
  }
  function loadTurnstile() {
    if (!CFG.turnstileSiteKey || window.turnstile) return;
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=rdTurnstile";
    s.async = true; s.defer = true;
    window.rdTurnstile = () => $$("form[data-enquiry]").forEach(mountTurnstile);
    document.head.appendChild(s);
  }
  function mountTurnstile(form) {
    if (!window.turnstile || form.dataset.ts) return;
    const box = document.createElement("div"); box.className = "full";
    form.querySelector(".form-actions")?.before(box);
    window.turnstile.render(box, { sitekey: CFG.turnstileSiteKey, size: "flexible", appearance: "interaction-only" });
    form.dataset.ts = "1";
  }

  /** Indicative trade-in range: approx. new price (₹ lakh) × first-year drop × yearly depreciation × usage. */
  function estimateValue(data) {
    const base = { "Maruti Suzuki": 9, Hyundai: 16, Tata: 14, Mahindra: 20, Honda: 15, Toyota: 32, Kia: 17, Skoda: 22, Volkswagen: 18, MG: 20, BMW: 75, "Mercedes-Benz": 80, Audi: 70, Volvo: 72, Jeep: 35, Lexus: 95, Porsche: 180, "Land Rover": 110, MINI: 48, Other: 14 }[data.brand] || 14;
    const age = Math.max(0, new Date().getFullYear() - (+data.year || new Date().getFullYear()));
    const km = +String(data.km).replace(/D/g, "") || 0;
    const excessKm = Math.max(0, km - Math.max(1, age) * 12000);
    let v = base * 1e5 * (age ? 0.82 * Math.pow(0.92, age - 1) : 0.88) * Math.max(0.7, 1 - excessKm / 500000);
    return [v * 0.94, v * 1.04].map((x) => Math.round(x / 5000) * 5000);
  }

  function initForms(root = document) {
    $$("form[data-enquiry]", root).forEach((form) => {
      if (form.dataset.bound) return;
      form.dataset.bound = "1";
      const blurred = new Set();
      form.addEventListener("focusout", (e) => { const n = e.target.name; if (n && RULES[n]) { blurred.add(n); validateField(form, n); } });
      form.addEventListener("input", (e) => {
        const n = e.target.name;
        if (n === "phone") e.target.value = e.target.value.replace(/[^\d ]/g, "").slice(0, 12);
        if (blurred.has(n) || e.target.closest(".has-error")) validateField(form, n);
      });
      form.addEventListener("change", (e) => {
        if (e.target.name === "type") toggleTestDrive(form);
        if (e.target.name === "consent") validateField(form, "consent");
      });
      toggleTestDrive(form);
      // min date today for date inputs
      $$('input[type="date"]', form).forEach((d) => { d.min = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10); });
      form.addEventListener("submit", (e) => onSubmit(e, form));
      mountTurnstile(form);
    });
    wireLinks();
  }
  function toggleTestDrive(form) {
    const box = form.querySelector("[data-testdrive]");
    if (!box) return;
    const on = form.querySelector('[name="type"]:checked')?.value === "Test Drive";
    box.classList.toggle("is-open", on);
    $$("input, select", box).forEach((i) => { i.tabIndex = on ? 0 : -1; });
  }

  async function onSubmit(e, form) {
    e.preventDefault();
    const alertBox = form.querySelector(".form-alert");
    alertBox?.classList.remove("is-shown");
    const firstBad = validateForm(form);
    if (firstBad) { fieldOf(form, firstBad)?.focus(); track("form_error", { form: form.dataset.enquiry, field: firstBad }); return; }

    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    // Spam traps: honeypot + minimum fill time.
    if (data.company || Date.now() - startedAt < 2500) { showSuccess(form, data); return; }

    const btn = form.querySelector('[type="submit"]');
    btn.classList.add("is-loading"); btn.disabled = true;
    const car = byId(data.car);
    const payload = {
      kind: form.dataset.enquiry,
      name: data.name?.trim(), phone: data.phone ? "+91" + data.phone.replace(/\D/g, "").slice(-10) : undefined,
      email: data.email?.trim() || undefined, car_id: data.car || undefined, car_name: car?.name, car_price: car?.price,
      budget: data.budget || undefined, enquiry_type: data.type || undefined, preferred_date: data.date || undefined, preferred_time: data.time || undefined,
      message: data.message?.trim() || undefined, consent: !!data.consent,
      brand: data.brand, model: data.model, year: data.year, km: data.km,
      page: location.pathname + location.search, referrer: document.referrer || undefined, utm: getUTM(),
      submitted_at: new Date().toISOString(), turnstile_token: turnstileToken(form) || undefined, hp: data.company || "",
    };
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
    try {
      await postLead(payload);
      track("generate_lead", { form: payload.kind, enquiry_type: payload.enquiry_type, car_id: payload.car_id, value: car?.price, currency: "INR" });
      if (payload.enquiry_type === "Test Drive") track("schedule_test_drive", { car_id: payload.car_id });
      showSuccess(form, payload);
    } catch (err) {
      console.error(err);
      if (alertBox) { alertBox.textContent = "Something went wrong sending your enquiry. Please try again, or reach us on WhatsApp — we're online now."; alertBox.classList.add("is-shown"); }
      track("form_submit_failed", { form: payload.kind });
    } finally {
      btn.classList.remove("is-loading"); btn.disabled = false;
    }
  }
  function showSuccess(form, data) {
    const ok = form.nextElementSibling?.classList.contains("success") ? form.nextElementSibling : form.parentElement.querySelector(".success");
    if (form.dataset.enquiry === "valuation" && ok) {
      const [lo, hi] = estimateValue(data);
      ok.querySelector("h3").textContent = `Estimated value: ${fmtPrice(lo)} – ${fmtPrice(hi)}`;
      ok.querySelector("[data-success-body]").textContent = "This is an indicative range. Our evaluator will call you within 30 minutes to confirm a final, guaranteed offer after a free 20-minute inspection.";
    }
    form.style.display = "none";
    form.closest(".card, .modal__body")?.querySelector(".enquiry-card__head")?.setAttribute("hidden", "");
    if (ok) { ok.classList.add("is-shown"); ok.focus({ preventScroll: false }); }
    wireLinks();
  }

  /* -------------------------------------------------------- Newsletter */
  function initNewsletter() {
    $$("form[data-newsletter]").forEach((f) => f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = f.querySelector('input[type="email"]'), msg = f.parentElement.querySelector(".subscribe-msg");
      const v = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { msg.className = "subscribe-msg bad"; msg.textContent = "Please enter a valid email address."; input.focus(); return; }
      if (f.querySelector('[name="company"]')?.value) return;
      const btn = f.querySelector("button"); btn.classList.add("is-loading");
      try {
        await postLead({ kind: "newsletter", email: v, page: location.pathname, submitted_at: new Date().toISOString() });
        msg.className = "subscribe-msg ok"; msg.textContent = "You're in! Expect new arrivals every Friday."; f.reset();
        track("sign_up", { method: "newsletter" });
      } catch { msg.className = "subscribe-msg bad"; msg.textContent = "Couldn't subscribe right now — please try again."; }
      btn.classList.remove("is-loading");
    }));
  }

  /* ------------------------------------------------------------- EMI */
  function initEmi(root) {
    if (!root) return;
    const amt = $("[data-emi-amount]", root), ten = $("[data-emi-tenure]", root), rate = $("[data-emi-rate]", root), down = $("[data-emi-down]", root);
    const paint = (r) => r && r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min)) * 100 + "%");
    const update = () => {
      [amt, ten, rate, down].forEach(paint);
      const price = +amt.value, dp = down ? +down.value : 0, P = Math.max(0, price - dp), n = +ten.value, r = +rate.value;
      const m = emi(P, r, n), total = m * n, interest = total - P;
      const set = (sel, txt) => { const el = $(sel, root); if (el) el.textContent = txt; };
      set("[data-out-amount]", fmtPrice(price));
      set("[data-out-down]", fmtPrice(dp));
      set("[data-out-tenure]", `${n} months`);
      set("[data-out-rate]", `${r.toFixed(1)}%`);
      set("[data-out-emi]", fmtINR(m));
      set("[data-out-principal]", fmtINR(P));
      set("[data-out-interest]", fmtINR(interest));
      set("[data-out-total]", fmtINR(total));
      const bp = $(".emi__bar .p", root), bi = $(".emi__bar .i", root);
      if (bp && total) { bp.style.width = (P / total) * 100 + "%"; bi.style.width = (interest / total) * 100 + "%"; }
    };
    [amt, ten, rate, down].forEach((r) => r && r.addEventListener("input", update));
    let tracked = false;
    root.addEventListener("change", () => { if (!tracked) { track("emi_calculator_used"); tracked = true; } });
    update();
    return { setPrice(p) { amt.max = Math.max(+amt.max, p); amt.value = p; if (down) { down.max = Math.round(p * 0.6); down.value = Math.round(p * 0.2 / 10000) * 10000; } update(); } };
  }

  /* ---------------------------------------------------------- Recent */
  function pushRecent(id) {
    const list = store.get("recent", []).filter((x) => x !== id);
    list.unshift(id); store.set("recent", list.slice(0, 8));
  }
  const getRecent = (exclude) => store.get("recent", []).filter((id) => id !== exclude).map(byId).filter(Boolean);

  /* ----------------------------------------------------------- Hours */
  function initOpenStatus() {
    const els = $$("[data-open-status]");
    if (!els.length || !CFG.hours) return;
    // Evaluate in showroom time (IST)
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
    const toMin = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
    const slot = CFG.hours.find((h) => h.days.includes(day));
    const open = slot && mins >= toMin(slot.open) && mins < toMin(slot.close);
    els.forEach((el) => { el.textContent = open ? `Open now · until ${slot.close}` : "Closed now · enquire anytime"; el.classList.toggle("closed", !open); });
  }

  /* ----------------------------------------------------------- Maps */
  function initMaps() {
    const els = $$("[data-map]");
    if (!els.length) return;
    const load = (el) => {
      const q = encodeURIComponent(CFG.address?.mapQuery || "Bengaluru");
      el.innerHTML = `<iframe title="Royal Drive showroom location" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${q}&z=14&output=embed"></iframe>`;
    };
    if (!("IntersectionObserver" in window)) return els.forEach(load);
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { load(en.target); io.unobserve(en.target); } }), { rootMargin: "200px" });
    els.forEach((el) => io.observe(el));
  }

  /* -------------------------------------------------------- Bootstrap */
  injectSprite();
  initAnalytics();
  document.addEventListener("DOMContentLoaded", () => {
    initNav(); wireLinks(); trackContactClicks(); observeReveal(); initCounters(); initForms(); initNewsletter(); initOpenStatus(); initMaps(); loadTurnstile(); syncUI();
  });

  window.RD = {
    $, $$, esc, icon, fmtPrice, fmtINR, fmtNum, fmtKm, ownerLabel, emi, emiFrom, store, byId, carUrl, waLink, track, toast,
    carCard, renderCars, observeReveal, observeOnce, initEmi, initForms, carOptions, enquiryFormHTML, successHTML,
    pushRecent, getRecent, openModal, closeModal, syncUI, state, TYPES, applyFilters, SORTS,
  };
})();
