/** Royal Drive — inventory listing with URL-synced filters. */
(function () {
  "use strict";
  const { $, $$, esc, renderCars, applyFilters, SORTS, track, fmtPrice } = window.RD;
  const CARS = window.RD_CARS;
  const uniq = (a) => [...new Set(a)].sort();

  const grid = $("#inv-grid"), count = $("#inv-count"), q = $("#inv-q"), sort = $("#inv-sort"), reset = $("#inv-reset");
  const selects = $$("#inv-filters [data-filter]"), chips = $$("#inv-filters [data-chip]");
  const brandSel = $("#i-brand"), modelSel = $("#i-model");

  brandSel.insertAdjacentHTML("beforeend", uniq(CARS.map((c) => c.brand)).map((b) => `<option>${esc(b)}</option>`).join(""));
  function fillModels(keep) {
    const models = uniq(CARS.filter((c) => !brandSel.value || c.brand === brandSel.value).map((c) => c.model));
    modelSel.innerHTML = `<option value="">All models</option>` + models.map((m) => `<option>${esc(m)}</option>`).join("");
    if (keep && models.includes(keep)) modelSel.value = keep;
  }

  /* State <-> URL ---------------------------------------------------------- */
  function readURL() {
    const p = new URLSearchParams(location.search);
    brandSel.value = p.get("brand") || "";
    fillModels(p.get("model"));
    selects.forEach((s) => { if (s !== brandSel && s !== modelSel) s.value = p.get(s.dataset.filter) || ""; });
    // Support a budget value from the hero that isn't in this list.
    const b = p.get("budget");
    if (b && ![...$("#i-budget").options].some((o) => o.value === b)) $("#i-budget").insertAdjacentHTML("beforeend", `<option value="${esc(b)}" selected>Custom budget</option>`);
    chips.forEach((c) => c.setAttribute("aria-pressed", p.get(c.dataset.chip) === c.dataset.value));
    q.value = p.get("q") || "";
    sort.value = p.get("sort") || "newest";
  }
  function state() {
    const f = {};
    selects.forEach((s) => s.value && (f[s.dataset.filter] = s.value));
    chips.forEach((c) => c.getAttribute("aria-pressed") === "true" && (f[c.dataset.chip] = c.dataset.value));
    if (q.value.trim()) f.q = q.value.trim();
    return f;
  }
  function writeURL(f) {
    const p = new URLSearchParams(f);
    if (sort.value !== "newest") p.set("sort", sort.value);
    history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : ""));
  }

  /* Render ----------------------------------------------------------------- */
  let firstPaint = true;
  function render() {
    const f = state();
    const list = applyFilters(CARS, f).sort(SORTS[sort.value] || SORTS.newest);
    writeURL(f);
    selects.forEach((s) => s.parentElement.classList.toggle("is-set", !!s.value));
    const active = Object.keys(f).length;
    reset.hidden = !active;
    count.textContent = `${list.length} ${list.length === 1 ? "car" : "cars"} available${active ? " matching your filters" : ""}`;
    const paint = () => {
      if (!list.length) {
        grid.innerHTML = f.saved
          ? `<div class="empty" style="grid-column:1/-1"><h3>No saved cars yet</h3><p class="muted">Tap the ♥ on any car to save it here for later.</p><button class="btn btn--ghost btn--sm" style="margin-top:20px" type="button" data-clear>Show all cars</button></div>`
          : `<div class="empty" style="grid-column:1/-1"><h3>No exact matches right now</h3><p class="muted">Try widening your filters — or let us find it for you within 7 days.</p><div style="margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="btn btn--ghost btn--sm" type="button" data-clear>Clear filters</button><a class="btn btn--primary btn--sm" href="index.html#enquiry">Request this car</a></div></div>`;
        return;
      }
      renderCars(grid, list, { reveal: firstPaint });
      if (!firstPaint) $$(".car-card", grid).forEach((el, i) => (el.style.animation = `fadeUp .45s ${Math.min(i, 8) * 0.035}s both`));
      firstPaint = false;
    };
    const old = $$(".car-card", grid);
    if (firstPaint || !old.length) return paint();
    old.forEach((el) => el.classList.add("is-hiding"));
    setTimeout(paint, 200);
  }

  /* ItemList schema for SEO ---------------------------------------------- */
  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org", "@type": "ItemList", name: "Royal Drive certified pre-owned inventory",
    itemListElement: CARS.map((c, i) => ({ "@type": "ListItem", position: i + 1, url: `${window.RD_CONFIG.siteUrl}/car.html?id=${c.id}`, name: c.name })),
  });
  document.head.appendChild(ld);

  /* Events ---------------------------------------------------------------- */
  brandSel.addEventListener("change", () => { fillModels(); render(); });
  selects.forEach((s) => s !== brandSel && s.addEventListener("change", () => { render(); track("filter_used", { filter: s.dataset.filter, value: s.value, location: "inventory" }); }));
  chips.forEach((c) => c.addEventListener("click", () => {
    const on = c.getAttribute("aria-pressed") !== "true";
    chips.filter((o) => o.dataset.chip === c.dataset.chip).forEach((o) => o.setAttribute("aria-pressed", "false"));
    c.setAttribute("aria-pressed", on);
    render();
  }));
  let t;
  q.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { render(); q.value && track("search", { search_term: q.value }); }, 250); });
  sort.addEventListener("change", render);
  const clearAll = () => { selects.forEach((s) => (s.value = "")); fillModels(); chips.forEach((c) => c.setAttribute("aria-pressed", "false")); q.value = ""; render(); };
  reset.addEventListener("click", clearAll);
  grid.addEventListener("click", (e) => e.target.closest("[data-clear]") && clearAll());
  // Keep the "Saved" view in sync when hearts are toggled.
  document.addEventListener("rd:change", () => { if (state().saved) render(); });

  readURL();
  render();
  const min = Math.min(...CARS.map((c) => c.price));
  $("#inv-lead").textContent = `${CARS.length} certified cars from ${fmtPrice(min)}. Every car is 150-point inspected, document-verified and backed by 7-day return assurance.`;
})();
