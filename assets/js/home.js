/** Royal Drive — home page. */
(function () {
  "use strict";
  const { $, $$, esc, icon, renderCars, carCard, applyFilters, SORTS, carOptions, getRecent, observeOnce, initEmi, track, observeReveal, syncUI } = window.RD;
  const CARS = window.RD_CARS;
  const uniq = (arr) => [...new Set(arr)].sort();

  /* Categories ------------------------------------------------------------ */
  const catHref = (k) => (k === "luxury" || k === "budget") ? `inventory.html?cat=${k}` : k === "Electric" ? "inventory.html?fuel=Electric" : `inventory.html?body=${k}`;
  const catCount = (k) => applyFilters(CARS, k === "luxury" || k === "budget" ? { cat: k } : k === "Electric" ? { fuel: k } : { body: k }).length;
  $("#cats").innerHTML = window.RD_CATEGORIES.map((c, i) => `
    <a class="cat reveal" style="--d:${i * 0.05}s" href="${catHref(c.key)}">
      <span class="cat__go">${icon("arrow-up-right", "icon--sm")}</span>
      <h3>${esc(c.label)}</h3><p>${esc(c.note)}</p><p class="cat__n">${catCount(c.key)} cars</p>
      <div class="cat__img"><img src="${c.img}" alt="" loading="lazy" width="600" height="400"></div>
    </a>`).join("");

  // Hero float card reflects live data
  const heroCar = window.RD.byId("audi-rs7-sportback-2021");
  if (heroCar) $("[data-hero-emi]").textContent = `EMI from ${window.RD.fmtPrice(window.RD.emiFrom(heroCar.price)).replace(" Lakh", " L")}/mo`;

  /* Quick search ---------------------------------------------------------- */
  const qsBrand = $("#qs-brand"), qsModel = $("#qs-model");
  qsBrand.insertAdjacentHTML("beforeend", uniq(CARS.map((c) => c.brand)).map((b) => `<option>${esc(b)}</option>`).join(""));
  const fillModels = () => {
    const models = uniq(CARS.filter((c) => !qsBrand.value || c.brand === qsBrand.value).map((c) => c.model));
    qsModel.innerHTML = `<option value="">Any model</option>` + models.map((m) => `<option>${esc(m)}</option>`).join("");
  };
  qsBrand.addEventListener("change", fillModels);
  fillModels();
  $("#quick-search").addEventListener("submit", (e) => {
    // Drop empty params for clean, shareable URLs.
    e.preventDefault();
    const p = new URLSearchParams();
    new FormData(e.target).forEach((v, k) => v && p.set(k, v));
    track("search", { search_term: p.toString() || "all" });
    location.href = "inventory.html" + (p.toString() ? "?" + p : "");
  });

  /* Featured + filter chips ---------------------------------------------- */
  const grid = $("#feat-grid"), selects = $$("#feat-filters [data-filter]"), reset = $("#feat-reset"), more = $("#feat-more");
  $("#f-brand").insertAdjacentHTML("beforeend", uniq(CARS.map((c) => c.brand)).map((b) => `<option>${esc(b)}</option>`).join(""));
  const current = () => Object.fromEntries(selects.map((s) => [s.dataset.filter, s.value]).filter(([, v]) => v));
  let first = true;
  function renderFeatured() {
    const f = current();
    const list = applyFilters(CARS, f).sort(SORTS.newest).slice(0, 6);
    selects.forEach((s) => s.parentElement.classList.toggle("is-set", !!s.value));
    reset.hidden = !Object.keys(f).length;
    const qs = new URLSearchParams(f).toString();
    more.href = "inventory.html" + (qs ? "?" + qs : "");
    const paint = () => {
      if (!list.length) {
        grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><h3>No cars match those filters — yet.</h3><p class="muted">New stock arrives every week. Tell us what you want and we'll find it for you.</p><div style="margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="btn btn--ghost btn--sm" type="button" data-reset>Clear filters</button><a class="btn btn--primary btn--sm" href="#enquiry">Request a car</a></div></div>`;
        return;
      }
      renderCars(grid, list, { reveal: first });
      if (!first) $$(".car-card", grid).forEach((el, i) => { el.style.animation = `fadeUp .45s ${i * 0.04}s both`; });
      first = false;
    };
    const old = $$(".car-card", grid);
    if (!old.length || first) return paint();
    old.forEach((el) => el.classList.add("is-hiding"));
    setTimeout(paint, 220);
  }
  selects.forEach((s) => s.addEventListener("change", () => { renderFeatured(); track("filter_used", { filter: s.dataset.filter, value: s.value, location: "home" }); }));
  const clear = () => { selects.forEach((s) => (s.value = "")); renderFeatured(); };
  reset.addEventListener("click", clear);
  grid.addEventListener("click", (e) => e.target.closest("[data-reset]") && clear());
  renderFeatured();

  /* Recently viewed ------------------------------------------------------- */
  const recent = getRecent();
  if (recent.length) {
    $("#recent").hidden = false;
    $("#recent-row").innerHTML = recent.map((c) => carCard(c, { reveal: false })).join("");
    syncUI();
  }

  /* Steps timeline, EMI --------------------------------------------------- */
  observeOnce($("#steps"));
  initEmi($("#emi"));

  /* Forms: populate selects + prefill from URL ---------------------------- */
  const yearSel = $("[data-years]");
  const thisYear = new Date().getFullYear();
  for (let y = thisYear; y >= thisYear - 15; y--) yearSel.insertAdjacentHTML("beforeend", `<option>${y}</option>`);

  const params = new URLSearchParams(location.search);
  const carSel = $("[data-car-select]");
  carSel.innerHTML = carOptions(params.get("car") || "");
  const type = params.get("type");
  if (type) {
    const radio = $(`#enquiry-form [name="type"][value="${CSS.escape(type)}"]`);
    if (radio) { radio.checked = true; radio.dispatchEvent(new Event("change", { bubbles: true })); }
  }
  // Also react to in-page CTA links like "?type=Finance#enquiry" when already on this page.
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href*="type="][href*="#enquiry"]');
    if (!a) return;
    const t = new URL(a.href, location.href).searchParams.get("type");
    const radio = t && $(`#enquiry-form [name="type"][value="${CSS.escape(t)}"]`);
    if (radio) { radio.checked = true; radio.dispatchEvent(new Event("change", { bubbles: true })); }
    if (new URL(a.href, location.href).pathname === location.pathname) {
      e.preventDefault();
      $("#enquiry").scrollIntoView({ behavior: "smooth" });
      setTimeout(() => $("#e-name").focus({ preventScroll: true }), 600);
    }
  });

  observeReveal();
})();
