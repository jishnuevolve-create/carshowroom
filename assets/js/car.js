/** Royal Drive — car detail page. */
(function () {
  "use strict";
  const RD = window.RD;
  const { $, $$, esc, icon, fmtPrice, fmtINR, fmtKm, ownerLabel, emiFrom, byId, carUrl, carCard, getRecent, pushRecent, track, toast, openModal, initEmi, initForms, syncUI, observeReveal, waLink } = RD;
  const CFG = window.RD_CONFIG;
  const root = $("#car-root");
  const id = new URLSearchParams(location.search).get("id");
  const car = byId(id) || (!id && window.RD_CARS[0]);

  if (!car) {
    root.removeAttribute("aria-busy");
    root.innerHTML = `<div class="empty" style="margin:40px 0"><h1 class="h2" style="margin-bottom:12px">This car has found a new home</h1><p class="muted">It may have just been sold. Here are other certified cars you'll love.</p><a class="btn btn--primary" style="margin-top:24px" href="inventory.html">Browse inventory</a></div>`;
    document.title = "Car not found | Royal Drive";
    const meta = document.createElement("meta"); meta.name = "robots"; meta.content = "noindex"; document.head.appendChild(meta);
    return;
  }

  /* SEO: title, meta, OG, schema ----------------------------------------- */
  const url = `${CFG.siteUrl}/car.html?id=${car.id}`;
  const desc = `Certified pre-owned ${car.name} — ${fmtKm(car.km)}, ${car.fuel}, ${car.transmission}, ${ownerLabel(car.owners)}. ${fmtPrice(car.price)} with 150-point inspection report and EMI from ${fmtINR(emiFrom(car.price))}/month at Royal Drive, Bengaluru.`;
  document.title = `${car.name} for ${fmtPrice(car.price)} | Royal Drive`;
  const setMeta = (sel, attr, val) => { const el = $(sel); if (el) el.setAttribute(attr, val); };
  setMeta('meta[name="description"]', "content", desc);
  setMeta('link[rel="canonical"]', "href", url);
  setMeta('meta[property="og:title"]', "content", `${car.name} · ${fmtPrice(car.price)}`);
  setMeta('meta[property="og:description"]', "content", desc);
  setMeta('meta[property="og:url"]', "content", url);
  setMeta('meta[property="og:image"]', "content", car.image.replace("w=900", "w=1200"));
  setMeta('meta[property="og:type"]', "content", "product");
  const ld = (obj) => { const s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(obj); document.head.appendChild(s); };
  ld({
    "@context": "https://schema.org", "@type": "Car", name: car.name, url, description: desc,
    image: car.gallery.map((g) => g.src), brand: { "@type": "Brand", name: car.brand }, model: car.model,
    vehicleConfiguration: car.variant, vehicleModelDate: String(car.year), bodyType: car.body, color: car.color,
    fuelType: car.fuel, vehicleTransmission: car.transmission, numberOfPreviousOwners: car.owners, seatingCapacity: car.seats,
    vehicleEngine: { "@type": "EngineSpecification", name: car.engine }, itemCondition: "https://schema.org/UsedCondition",
    mileageFromOdometer: { "@type": "QuantitativeValue", value: car.km, unitCode: "KMT" },
    offers: { "@type": "Offer", price: car.price, priceCurrency: "INR", availability: "https://schema.org/InStock", url, seller: { "@type": "AutoDealer", name: "Royal Drive", telephone: CFG.phone } },
  });
  ld({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${CFG.siteUrl}/` },
    { "@type": "ListItem", position: 2, name: "Inventory", item: `${CFG.siteUrl}/inventory.html` },
    { "@type": "ListItem", position: 3, name: car.name, item: url },
  ] });
  $("#crumb-car").textContent = `${car.brand} ${car.model}`;

  /* Render ----------------------------------------------------------------- */
  const badge = car.badge === "Just Arrived" ? `<span class="badge badge--new" style="box-shadow:none;background:var(--brand-50)">${icon("sparkle")}Just Arrived</span>` : `<span class="badge badge--certified" style="box-shadow:none;background:var(--success-50)">${icon("shield")}Certified</span>`;
  const specs = [
    ["calendar", "Year", car.year], ["gauge", "Km driven", fmtKm(car.km)], ["fuel", "Fuel", car.fuel], ["gear", "Transmission", car.transmission],
    ["user", "Ownership", ownerLabel(car.owners)], ["engine", car.fuel === "Electric" ? "Battery" : "Engine", car.engine], ["activity", "Power", car.power], ["zap", car.fuel === "Electric" ? "Range" : "Efficiency", car.efficiency],
    ["users", "Seats", car.seats], ["palette", "Colour", car.color], ["id", "Registration", car.reg], ["shield", "Insurance", car.insurance],
  ];
  const typeSeg = ["Buy", "Test Drive", "Exchange", "Finance"].map((t, i) => `<input type="radio" name="type" id="ct-${i}" value="${t}" ${i === 0 ? "checked" : ""}><label for="ct-${i}">${t}</label>`).join("");
  const err = `<span class="err">${icon("alert", "icon--sm")}<span></span></span>`;

  root.innerHTML = `
  <div class="detail__title">
    <div>
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">${badge}<span class="badge" style="box-shadow:none;background:var(--bg-soft)">${icon("clipboard")}Score ${car.score}/100</span></div>
      <h1>${car.year} ${esc(car.brand)} ${esc(car.model)}</h1>
      <p>${esc(car.variant)} · ${fmtKm(car.km)} · ${car.fuel} · ${car.transmission} · ${ownerLabel(car.owners)}</p>
    </div>
    <div class="tools">
      <button class="icon-btn tool--wish" type="button" data-wish="${car.id}" aria-pressed="false">${icon("heart")}</button>
      <button class="icon-btn tool--cmp" type="button" data-cmp="${car.id}" aria-pressed="false">${icon("compare")}</button>
      <button class="icon-btn" type="button" id="share" aria-label="Share this car">${icon("send")}</button>
    </div>
  </div>

  <div class="detail">
    <div class="detail__main">
      <div class="gallery">
        <div class="gallery__main" id="g-main" tabindex="0" aria-label="Photo gallery. Use arrow keys to browse, click to zoom.">
          <img id="g-img" src="${car.gallery[0].src}" alt="${esc(car.gallery[0].alt)}" width="1400" height="875" fetchpriority="high" draggable="false">
          <span class="hint-360">${icon("360")} Drag to look around</span>
          <button class="icon-btn gallery__nav prev" type="button" aria-label="Previous photo">${icon("chevron-left")}</button>
          <button class="icon-btn gallery__nav next" type="button" aria-label="Next photo">${icon("chevron-right")}</button>
          <div class="gallery__actions">
            <button class="btn btn--sm" type="button" id="g-360" aria-pressed="false">${icon("360")} 360° View</button>
            <button class="btn btn--sm" type="button" id="g-video">${icon("video")} Video</button>
          </div>
          <span class="gallery__count" id="g-count">1 / ${car.gallery.length}</span>
        </div>
        <div class="thumbs" role="tablist" aria-label="Photos">${car.gallery.map((g, i) => `<button type="button" role="tab" aria-label="Photo ${i + 1}" aria-current="${i === 0}" data-i="${i}"><img src="${g.thumb}" alt="" loading="lazy"></button>`).join("")}</div>
      </div>

      <section class="block"><h2>Key specifications</h2>
        <div class="spec-grid">${specs.map(([ic, l, v]) => `<div class="spec-tile">${icon(ic)}<span>${l}</span><strong>${esc(v)}</strong></div>`).join("")}</div>
      </section>

      <section class="block"><h2>Features &amp; highlights</h2>
        <ul class="feat-list">${car.features.map((f) => `<li><span class="tick">${icon("check")}</span>${esc(f)}</li>`).join("")}</ul>
      </section>

      <section class="block"><h2>Inspection report</h2>
        <div class="report">
          <div class="report__score" style="--s:${car.score}"><b>${car.score}</b></div>
          <div class="report__body"><h3>150-point inspection passed</h3><p>Inspected by Royal Drive certified technicians · ${esc(car.service)} · No accident or flood history.</p></div>
          <button class="btn btn--ghost" type="button" id="dl-report">${icon("download")} Download report</button>
          <div class="report__bars">${car.inspection.map((x) => `<div>${x.area} · <b style="color:var(--ink)">${x.score}%</b><div class="bar"><i style="width:${x.score}%"></i></div></div>`).join("")}</div>
        </div>
      </section>

      <section class="block"><h2>EMI calculator</h2>
        <div class="emi" id="car-emi">
          <div class="emi__controls">
            <input type="range" min="0" max="${car.price}" value="${car.price}" data-emi-amount hidden>
            <div><div class="slider__head"><label for="c-down">Down payment</label><span class="slider__val" data-out-down></span></div>
              <input type="range" id="c-down" min="0" max="${Math.round(car.price * 0.6)}" step="10000" value="${Math.round(car.price * 0.2 / 10000) * 10000}" data-emi-down>
              <div class="slider__scale"><span>₹0</span><span>${fmtPrice(car.price * 0.6)}</span></div></div>
            <div><div class="slider__head"><label for="c-ten">Tenure</label><span class="slider__val" data-out-tenure></span></div>
              <input type="range" id="c-ten" min="12" max="84" step="6" value="60" data-emi-tenure>
              <div class="slider__scale"><span>12 mo</span><span>84 mo</span></div></div>
            <div><div class="slider__head"><label for="c-rate">Interest rate</label><span class="slider__val" data-out-rate></span></div>
              <input type="range" id="c-rate" min="7.5" max="16" step="0.1" value="9.5" data-emi-rate>
              <div class="slider__scale"><span>7.5%</span><span>16%</span></div></div>
          </div>
          <div class="emi__result">
            <div><div class="emi__label">Monthly EMI</div><div class="emi__amount" aria-live="polite"><span data-out-emi></span> <small>/month</small></div></div>
            <div class="emi__bar" aria-hidden="true"><span class="p"></span><span class="i"></span></div>
            <dl class="emi__legend"><div><dt><i style="background:var(--brand)"></i>Loan amount</dt><dd data-out-principal></dd></div><div><dt><i style="background:#9db0ff"></i>Total interest</dt><dd data-out-interest></dd></div><div class="total"><dt>Total payable</dt><dd data-out-total></dd></div></dl>
            <button class="btn btn--primary btn--block" type="button" data-set-type="Finance">Get Pre-Approved</button>
          </div>
        </div>
      </section>
    </div>

    <aside class="sticky-card" aria-label="Price and enquiry">
      <div class="card price-card">
        <div class="muted" style="font-size:.875rem;font-weight:600">Fixed price · No hidden charges</div>
        <div class="price">${fmtPrice(car.price)}</div>
        <div class="emi-from"><span>EMI from ${fmtINR(emiFrom(car.price))}/mo</span>${icon("arrow-right", "icon--sm")}</div>
        <div class="btn-row">
          <button class="btn btn--primary" type="button" data-set-type="Test Drive">Book Test Drive</button>
          <a class="btn btn--wa" data-wa data-wa-car="${car.id}" data-track="car_sticky">${icon("whatsapp", "icon--fill")} WhatsApp</a>
        </div>
        <a class="btn btn--ghost btn--block" style="margin-top:10px" data-tel href="tel:${CFG.phone}" data-track="car_sticky">${icon("phone")} Call ${esc(CFG.phoneDisplay)}</a>
        <ul class="trust-mini">
          <li>${icon("check")} 7-day return assurance</li><li>${icon("check")} Free RC transfer &amp; paperwork</li><li>${icon("check")} Up to 2-year warranty available</li>
        </ul>
      </div>

      <div class="card enquiry-card" id="enquire">
        <div class="enquiry-card__head"><h3 style="font-size:1.25rem">Interested in this car?</h3><p>We'll confirm availability within 30 minutes.</p><div class="enquiry-card__price"><span>${esc(car.title)}</span><b>${fmtPrice(car.price)}</b></div></div>
        <form class="form-grid" data-enquiry="car" novalidate>
          <input type="hidden" name="car" value="${car.id}">
          <div class="fld full"><label for="c-name">Full name</label><input id="c-name" name="name" autocomplete="name" placeholder="Your name">${err}</div>
          <div class="fld full"><label for="c-phone">Phone number</label><div class="prefix-input"><span>+91</span><input id="c-phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="98765 43210" maxlength="12"></div>${err}</div>
          <div class="fld full"><span class="lbl" id="c-type-l">I'd like to</span><div class="seg" role="radiogroup" aria-labelledby="c-type-l">${typeSeg}</div>${err}</div>
          <div class="collapse full" data-testdrive><div><div class="form-grid">
            <div class="fld"><label for="c-date">Date</label><input id="c-date" name="date" type="date">${err}</div>
            <div class="fld"><label for="c-time">Time</label><select id="c-time" name="time"><option value="">Slot</option><option>10:00 AM</option><option>11:30 AM</option><option>1:00 PM</option><option>2:30 PM</option><option>4:00 PM</option><option>5:30 PM</option><option>7:00 PM</option></select>${err}</div>
          </div></div></div>
          <input class="hp" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">
          <label class="consent full"><input type="checkbox" name="consent" checked> <span>I agree to be contacted about this car via call, SMS or WhatsApp.</span></label>
          <span class="err full" data-err-for="consent">${icon("alert", "icon--sm")}<span></span></span>
          <div class="form-alert full" role="alert"></div>
          <button class="btn btn--primary btn--lg btn--block full" type="submit"><span class="spinner"></span><span class="btn__label">Send Enquiry</span></button>
        </form>
        ${RD.successHTML()}
      </div>
    </aside>
  </div>`;
  root.removeAttribute("aria-busy");

  /* Gallery ---------------------------------------------------------------- */
  const main = $("#g-main"), img = $("#g-img"), thumbs = $$(".thumbs button"), count = $("#g-count");
  let idx = 0, mode360 = false;
  function show(i) {
    idx = (i + car.gallery.length) % car.gallery.length;
    img.style.opacity = 0;
    setTimeout(() => { img.src = car.gallery[idx].src; img.alt = car.gallery[idx].alt; img.style.opacity = 1; }, 150);
    thumbs.forEach((t, n) => t.setAttribute("aria-current", n === idx));
    count.textContent = `${idx + 1} / ${car.gallery.length}`;
    main.classList.remove("is-zoomed");
  }
  thumbs.forEach((t) => t.addEventListener("click", () => show(+t.dataset.i)));
  $(".gallery__nav.prev").addEventListener("click", (e) => { e.stopPropagation(); show(idx - 1); });
  $(".gallery__nav.next").addEventListener("click", (e) => { e.stopPropagation(); show(idx + 1); });
  main.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") show(idx - 1); if (e.key === "ArrowRight") show(idx + 1); });
  // Click to zoom (follows cursor)
  main.addEventListener("click", (e) => {
    if (mode360 || e.target.closest("button")) return;
    const r = main.getBoundingClientRect();
    img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
    main.classList.toggle("is-zoomed");
  });
  main.addEventListener("mousemove", (e) => {
    if (!main.classList.contains("is-zoomed")) return;
    const r = main.getBoundingClientRect();
    img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
  });
  // Swipe on touch
  let sx = null;
  main.addEventListener("touchstart", (e) => { if (!mode360) sx = e.touches[0].clientX; }, { passive: true });
  main.addEventListener("touchend", (e) => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1)); sx = null; });

  /* 360° viewer: scrubs through `car.spin` frames when provided (e.g. 36 studio
     frames), otherwise lets the visitor drag-pan the hero shot. */
  const frames = car.spin || null;
  let dragX = null, pos = 50, frame = 0;
  $("#g-360").addEventListener("click", (e) => {
    e.stopPropagation();
    mode360 = !mode360;
    e.currentTarget.setAttribute("aria-pressed", mode360);
    main.classList.toggle("is-360", mode360);
    main.classList.remove("is-zoomed");
    if (mode360) { show(0); img.style.transform = frames ? "" : "scale(1.35)"; img.style.objectPosition = "50% 50%"; track("view_360", { car_id: car.id }); }
    else { img.style.transform = ""; img.style.objectPosition = ""; }
  });
  const start = (x) => { if (mode360) dragX = x; };
  const move = (x) => {
    if (!mode360 || dragX == null) return;
    const dx = x - dragX; dragX = x;
    if (frames) { frame = (frame + Math.sign(dx) + frames.length) % frames.length; img.src = frames[frame]; }
    else { pos = Math.max(0, Math.min(100, pos - dx * 0.25)); img.style.objectPosition = `${pos}% 50%`; img.style.transformOrigin = `${pos}% 50%`; }
  };
  main.addEventListener("pointerdown", (e) => start(e.clientX));
  window.addEventListener("pointermove", (e) => move(e.clientX));
  window.addEventListener("pointerup", () => (dragX = null));

  $("#g-video").addEventListener("click", (e) => {
    e.stopPropagation();
    track("video_open", { car_id: car.id });
    openModal("Video walkaround", car.video
      ? `<video src="${car.video}" controls autoplay playsinline style="width:100%;border-radius:16px"></video>`
      : `<div class="video-ph"><div>${icon("video", "icon--lg")}</div><h3>Get a live video walkaround</h3><p class="muted" style="max-width:44ch">An advisor will video-call you from the showroom floor, show every panel, start the engine and answer questions in real time.</p><a class="btn btn--wa" href="${waLink(`Hi Royal Drive, I'd like a live video walkaround of the ${car.name}.`)}" target="_blank" rel="noopener" data-track="video_modal">${icon("whatsapp", "icon--fill")} Request on WhatsApp</a></div>`);
  });

  /* Enquiry: CTA buttons preselect type and jump to the form -------------- */
  const form = $("#enquire form");
  function setType(t) {
    const radio = form.querySelector(`[name="type"][value="${t}"]`);
    if (radio) { radio.checked = true; radio.dispatchEvent(new Event("change", { bubbles: true })); }
    $("#enquire").scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => $("#c-name").focus({ preventScroll: true }), 500);
  }
  root.addEventListener("click", (e) => { const b = e.target.closest("[data-set-type]"); if (b) setType(b.dataset.setType); });
  $$(".nav__cta, .drawer .btn--primary").forEach((a) => { a.href = "#enquire"; a.addEventListener("click", (e) => { e.preventDefault(); setType("Test Drive"); }); });
  initForms(root);

  /* Inspection report download ------------------------------------------- */
  $("#dl-report").addEventListener("click", () => {
    const rows = car.inspection.map((x) => `<tr><td>${x.area}</td><td>${x.score}%</td><td>${x.score >= 95 ? "Excellent" : x.score >= 90 ? "Very good" : "Good"}</td></tr>`).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Inspection Report — ${esc(car.name)}</title>
      <style>body{font-family:Arial,sans-serif;color:#0f172a;max-width:780px;margin:40px auto;padding:0 24px}h1{font-size:24px;margin:0}table{width:100%;border-collapse:collapse;margin:16px 0}td,th{border-bottom:1px solid #e6e9ef;padding:10px;text-align:left;font-size:14px}th{background:#f7f8fa}.score{font-size:40px;font-weight:800;color:#0f9d6b}.muted{color:#64748b;font-size:13px}@media print{button{display:none}}</style></head>
      <body><p class="muted">ROYAL DRIVE · 150-POINT CERTIFIED INSPECTION</p><h1>${esc(car.name)}</h1>
      <p class="muted">Report ID RD-${car.id.toUpperCase().slice(0, 12)} · Generated ${new Date().toLocaleDateString("en-IN")}</p>
      <p class="score">${car.score}/100</p>
      <table><tr><th>Registration</th><td>${car.reg}</td><th>Odometer</th><td>${fmtKm(car.km)}</td></tr><tr><th>Fuel</th><td>${car.fuel}</td><th>Ownership</th><td>${ownerLabel(car.owners)}</td></tr><tr><th>Service history</th><td>${esc(car.service)}</td><th>Insurance</th><td>${esc(car.insurance)}</td></tr></table>
      <table><thead><tr><th>Area</th><th>Score</th><th>Condition</th></tr></thead><tbody>${rows}</tbody></table>
      <p>Accident history: <b>None found</b> · Flood damage: <b>None</b> · Odometer: <b>Verified</b> · Documents: <b>Verified (RC, insurance, PUC, NOC)</b></p>
      <p class="muted">This report reflects the vehicle's condition at the time of inspection. Royal Drive · ${esc(CFG.address.street)}, ${esc(CFG.address.city)} · ${esc(CFG.phoneDisplay)}</p>
      <button onclick="print()">Print / Save as PDF</button></body></html>`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download = `RoyalDrive-Inspection-${car.id}.html`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    track("download_report", { car_id: car.id });
    toast("Inspection report downloaded");
  });

  /* Share ------------------------------------------------------------------ */
  $("#share").addEventListener("click", async () => {
    const data = { title: car.name, text: `${car.name} — ${fmtPrice(car.price)} at Royal Drive`, url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(location.href); toast("Link copied to clipboard"); }
      track("share", { car_id: car.id });
    } catch { /* cancelled */ }
  });

  /* EMI -------------------------------------------------------------------- */
  initEmi($("#car-emi"));

  /* Similar + recently viewed -------------------------------------------- */
  const similar = window.RD_CARS.filter((c) => c.id !== car.id && (c.body === car.body || Math.abs(c.price - car.price) / car.price < 0.35))
    .sort((a, b) => (b.body === car.body) - (a.body === car.body) || Math.abs(a.price - car.price) - Math.abs(b.price - car.price)).slice(0, 8);
  if (similar.length) {
    $("#similar").hidden = false;
    $("#similar-row").innerHTML = similar.map((c) => carCard(c, { reveal: false })).join("");
    $("#sim-more").href = `inventory.html?body=${encodeURIComponent(car.body)}`;
  }
  const recent = getRecent(car.id);
  if (recent.length) { $("#recent").hidden = false; $("#recent-row").innerHTML = recent.map((c) => carCard(c, { reveal: false })).join(""); }
  pushRecent(car.id);
  syncUI(); observeReveal();

  track("view_item", { car_id: car.id, item_name: car.name, value: car.price, currency: "INR" });
})();
