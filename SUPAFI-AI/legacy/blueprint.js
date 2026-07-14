/* ============================================================
   SUPAFI-AI · blueprint.js
   Vector elevations regenerated from the extracted drawing
   data — same takeoff language as the A5 sheets (magenta
   scope, yellow Mosaic V Plank, teal perf screening, red
   missile datum). Fully interactive: hover a system, it
   answers back.
   ============================================================ */

(function () {
  const NS = "http://www.w3.org/2000/svg";
  const S = 6; // px per foot
  const M = { l: 70, r: 190, t: 90, b: 60 };
  const W = SUPAFI.OVERALL.width;
  const H = SUPAFI.OVERALL.height;
  const gx = (ft) => M.l + ft * S;
  const gy = (ft) => M.t + (H - ft) * S; // rel-feet → svg y (ground = rel 0)

  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const txt = (parent, x, y, str, cls, anchor = "start") => {
    const t = el("text", { x, y, class: cls, "text-anchor": anchor }, parent);
    t.textContent = str; return t;
  };

  /* Glass panel with mullion grid */
  function glass(parent, x0, y0, x1, y1, sys, cols = 0, rows = 0) {
    const g = el("g", { class: "bp-glass", "data-sys": sys }, parent);
    el("rect", { x: gx(x0), y: gy(y1), width: (x1 - x0) * S, height: (y1 - y0) * S, class: "bp-glass-fill" }, g);
    const c = cols || Math.max(2, Math.round((x1 - x0) / 5));
    const r = rows || Math.max(1, Math.round((y1 - y0) / 6));
    for (let i = 1; i < c; i++) el("line", { x1: gx(x0 + (i * (x1 - x0)) / c), y1: gy(y0), x2: gx(x0 + (i * (x1 - x0)) / c), y2: gy(y1), class: "bp-mullion" }, g);
    for (let i = 1; i < r; i++) el("line", { x1: gx(x0), y1: gy(y0 + (i * (y1 - y0)) / r), x2: gx(x1), y2: gy(y0 + (i * (y1 - y0)) / r), class: "bp-mullion" }, g);
    el("rect", { x: gx(x0), y: gy(y1), width: (x1 - x0) * S, height: (y1 - y0) * S, class: "bp-glass-frame" }, g);
    return g;
  }
  const band = (parent, x0, y0, x1, h, cls, sys) =>
    el("rect", { x: gx(x0), y: gy(y0 + h), width: (x1 - x0) * S, height: h * S, class: cls, "data-sys": sys }, parent);

  function railing(parent, x0, x1, y) {
    const g = el("g", { class: "bp-rail" }, parent);
    el("line", { x1: gx(x0), y1: gy(y + 3.5), x2: gx(x1), y2: gy(y + 3.5), class: "bp-rail-top" }, g);
    for (let x = x0; x <= x1; x += 1.2) el("line", { x1: gx(x), y1: gy(y), x2: gx(x), y2: gy(y + 3.5), class: "bp-rail-post" }, g);
  }
  function callout(parent, x, y, lines, cls) {
    lines.forEach((s, i) => txt(parent, gx(x), gy(y) + i * 15, s, cls, "middle"));
  }
  function scopeBox(parent, x0, y0, x1, y1) {
    el("rect", { x: gx(x0), y: gy(y1), width: (x1 - x0) * S, height: (y1 - y0) * S, rx: 10, class: "bp-scope-box" }, parent);
  }

  function frame(svg, title) {
    // column grid bubbles + drop lines
    SUPAFI.GRIDS.forEach((g) => {
      el("line", { x1: gx(g.x), y1: M.t - 26, x2: gx(g.x), y2: gy(0) + 18, class: "bp-gridline" }, svg);
      el("circle", { cx: gx(g.x), cy: M.t - 40, r: 13, class: "bp-bubble" }, svg);
      txt(svg, gx(g.x), M.t - 35.5, g.id, "bp-bubble-txt", "middle");
    });
    // dims
    el("line", { x1: gx(0), y1: M.t - 68, x2: gx(W), y2: M.t - 68, class: "bp-dim" }, svg);
    txt(svg, gx(W / 2), M.t - 74, "171' - 0\"", "bp-dim-txt", "middle");
    // level lines + labels (right margin)
    SUPAFI.LEVELS.filter(l => l.rel >= 0).forEach((l) => {
      el("line", { x1: gx(0) - 14, y1: gy(l.rel), x2: gx(W) + 14, y2: gy(l.rel), class: "bp-levelline" }, svg);
      txt(svg, gx(W) + 24, gy(l.rel) - 3, l.name.replace("Level ", "LEVEL "), "bp-level-txt");
      txt(svg, gx(W) + 24, gy(l.rel) + 11, "EL " + Math.floor(l.el) + "' - " + (l.el % 1 ? "6\"" : "0\""), "bp-level-el");
    });
    // missile datum — red dashed at rel 30
    el("line", { x1: gx(0) - 40, y1: gy(30), x2: gx(60), y2: gy(30), class: "bp-missile" }, svg);
    txt(svg, gx(0) - 46, gy(58), "SMALL MISSILE-RATED GLAZING · 56'-0\"", "bp-zone-txt bp-vert-u");
    txt(svg, gx(0) - 46, gy(14), "LARGE MISSILE-RATED · 30'-0\"", "bp-zone-txt bp-vert-l");
    // ground
    el("line", { x1: gx(-4), y1: gy(0), x2: gx(W + 4), y2: gy(0), class: "bp-ground" }, svg);
    // title block
    txt(svg, M.l, gy(0) + 40, title, "bp-title");
    txt(svg, M.l, gy(0) + 56, 'SCALE 3/32" = 1\'-0" · SUPAFI-AI VECTOR REGEN', "bp-sub");
  }

  /* ---- East / West elevation (tower B–E + garage wing E–F) ---- */
  function towerElevation(svg, mirror) {
    const g = el("g", {}, svg);
    if (mirror) g.setAttribute("transform", `translate(${2 * gx(W / 2)},0) scale(-1,1)`);

    /* L1 storefront (large missile) */
    glass(g, 2, 0, 111, 14, "glassLM", 22, 2);
    band(g, -2, 14.2, 50, 2.6, "bp-spandrel", "spandrel"); // signage canopy L
    band(g, 62, 14.2, 113, 2.6, "bp-spandrel", "spandrel"); // signage canopy R
    txt(g, gx(24), gy(15) - 1, "SIGNAGE", "bp-signage", "middle");
    txt(g, gx(88), gy(15) - 1, "SIGNAGE", "bp-signage", "middle");

    /* Lower office band 17–44.5 with plank fascias (large→small missile split at 30) */
    glass(g, 2, 17, 111, 29.5, "glassLM", 20, 2);
    glass(g, 2, 31.5, 111, 43, "glassSM", 20, 2);
    railing(g, 6, 108, 31.5);
    band(g, 20, 17.2, 92, 1.6, "bp-plank", "plank");
    callout(g, 56, 24.5, ['6" Mosaic V Plank', "116.7 sf"], "bp-plank-txt");
    band(g, 20, 31.7, 92, 1.6, "bp-plank", "plank");
    callout(g, 56, 38, ['6" Mosaic V Plank', "116.7 sf"], "bp-plank-txt");
    band(g, -2, 44.6, 113, 2.8, "bp-spandrel", "spandrel");

    /* Upper office floors 47.5–86 · two bays B–C / D–E, recessed core C–D */
    [[47.5, 58], [61, 71.5], [74.5, 85]].forEach(([f0, f1], i) => {
      glass(g, 2, f0, 44.5, f1 - 1.2, "glassSM", 8, 2);
      glass(g, 68.5, f0, 111, f1 - 1.2, "glassSM", 8, 2);
      railing(g, 4, 43, f0); railing(g, 70, 109, f0);
      band(g, 4, f1 - 1.4, 44.5, 1.5, "bp-plank", "plank");
      band(g, 68.5, f1 - 1.4, 111, 1.5, "bp-plank", "plank");
      callout(g, 24, f1 - 6, ['6" Mosaic V Plank', "93.2 sf"], "bp-plank-txt");
      callout(g, 90, f1 - 6, ['6" Mosaic V Plank', "93.2 sf"], "bp-plank-txt");
      band(g, -2, f1, 113, 2.6, "bp-spandrel", "spandrel");
      if (i < 2) { glass(g, 46, f0 - 3, 67, f1, "glassSM", 4, 3); }
    });

    /* Roof + penthouse */
    band(g, -3, 86, 114, 2.2, "bp-spandrel", "spandrel");
    el("rect", { x: gx(38), y: gy(100), width: 34 * S, height: 12 * S, class: "bp-ph", "data-sys": "penthouse" }, g);
    for (let x = 39.5; x < 71; x += 2) el("line", { x1: gx(x), y1: gy(100), x2: gx(x), y2: gy(88), class: "bp-ph-seam" }, g);
    callout(g, 55, 104.5, ['6" Mosaic V Plank · 17.5 sf × 3'], "bp-plank-txt");

    /* Garage wing E–F */
    glass(g, 114, 0, 170, 12.5, "glassLM", 10, 2);
    el("rect", { x: gx(114), y: gy(44.5), width: 56 * S, height: 30 * S, class: "bp-screen", "data-sys": "screen" }, g);
    for (let x = 118; x < 170; x += 6.5) el("line", { x1: gx(x), y1: gy(44.5), x2: gx(x), y2: gy(14.5), class: "bp-screen-seam" }, g);
    el("rect", { x: gx(114), y: gy(44.5), width: 56 * S, height: 30 * S, class: "bp-screen-frame" }, g);
    callout(g, 142, 30, ["Perf Garage Screening", "518.9 sf"], "bp-screen-txt");
    band(g, 113, 44.7, 171, 2.4, "bp-spandrel", "spandrel");
    band(g, 113, 12.7, 171, 2.0, "bp-spandrel", "spandrel");
    railing(g, 115, 169, 47.2);

    /* dashed scope boxes, per the sheets */
    scopeBox(g, 3, 44, 46, 87);
    scopeBox(g, 19, -1.5, 68, 40);
    scopeBox(g, 118, -1.5, 146, 36);
  }

  /* ---- South garage elevation ---- */
  function garageElevation(svg) {
    const g = el("g", {}, svg);
    /* tower rising behind */
    glass(g, 40, 46, 150, 84, "glassSM", 18, 5);
    band(g, 38, 84.2, 152, 2.4, "bp-spandrel", "spandrel");
    el("rect", { x: gx(78), y: gy(98), width: 30 * S, height: 11 * S, class: "bp-ph", "data-sys": "penthouse" }, g);
    /* screening field with the four extracted panels */
    const panels = [
      { x0: 6, x1: 62, sf: "2,498.3 sf" },
      { x0: 64, x1: 106, sf: "1,007.9 sf" },
      { x0: 108, x1: 126, sf: "271.3 sf" },
      { x0: 128, x1: 154, sf: "442.6 sf" },
    ];
    panels.forEach(p => {
      el("rect", { x: gx(p.x0), y: gy(44.5), width: (p.x1 - p.x0) * S, height: 32 * S, class: "bp-screen", "data-sys": "screen" }, g);
      for (let x = p.x0 + 3; x < p.x1; x += 5.5) el("line", { x1: gx(x), y1: gy(44.5), x2: gx(x), y2: gy(12.5), class: "bp-screen-seam" }, g);
      el("rect", { x: gx(p.x0), y: gy(44.5), width: (p.x1 - p.x0) * S, height: 32 * S, class: "bp-screen-frame" }, g);
      callout(g, (p.x0 + p.x1) / 2, 29, ["Perf Garage Screening", p.sf], "bp-screen-txt");
    });
    band(g, 4, 44.7, 156, 2.6, "bp-spandrel", "spandrel");
    band(g, 4, 9.7, 156, 2.4, "bp-spandrel", "spandrel");
    txt(g, gx(34), gy(11) - 2, "DO NOT ENTER", "bp-signage", "middle");
    txt(g, gx(64), gy(11) - 2, "PARKING", "bp-signage", "middle");
    /* entry portal + masonry base */
    el("rect", { x: gx(40), y: gy(9), width: 34 * S, height: 9 * S, class: "bp-portal" }, g);
    el("rect", { x: gx(4), y: gy(9), width: 34 * S, height: 9 * S, class: "bp-masonry" }, g);
    el("rect", { x: gx(76), y: gy(9), width: 80 * S, height: 9 * S, class: "bp-masonry" }, g);
    railing(g, 6, 154, 47.2);
    scopeBox(g, 10, -1.5, 46, 40); scopeBox(g, 118, -1.5, 152, 42);
  }

  window.Blueprint = {
    render(view = "east") {
      const svg = el("svg", { viewBox: "0 0 1350 780", class: "bp", role: "img", "data-view": view });
      el("rect", { x: 0, y: 0, width: 1350, height: 780, class: "bp-paper" }, svg);
      if (view === "south") garageElevation(svg); else towerElevation(svg, view === "west");
      frame(svg, view === "south" ? "3  SOUTH ELEVATION — GARAGE" : view === "west" ? "2  WEST ELEVATION" : "1  EAST ELEVATION");
      /* hover intelligence */
      svg.addEventListener("pointerover", (e) => {
        const s = e.target.closest("[data-sys]"); if (!s) return;
        svg.querySelectorAll("[data-sys]").forEach(n => n.classList.toggle("bp-dim-sys", n.dataset.sys !== s.dataset.sys));
        svg.dispatchEvent(new CustomEvent("sys-hover", { detail: s.dataset.sys, bubbles: true }));
      });
      svg.addEventListener("pointerleave", () => {
        svg.querySelectorAll(".bp-dim-sys").forEach(n => n.classList.remove("bp-dim-sys"));
        svg.dispatchEvent(new CustomEvent("sys-hover", { detail: null, bubbles: true }));
      });
      return svg;
    },
  };
})();
