/* ============================================================
   FullscreenSlide builders — 14 full-viewport sections.
   Copy is the client-approved language from the build spec;
   fields marked data-e are editable via the internal edit mode.
   ============================================================ */
var MAG = window.MAG = window.MAG || {};

MAG.Slides = (function () {
  var C = function () { return MAG.copy; };

  function kicker(num, label) {
    return '<div class="kicker" data-fx><span class="num">' + num + "</span> " + label + "</div>";
  }

  /* ---------- 01 cover ---------- */
  function cover() {
    return '<section class="slide" id="s-cover" data-title="Cover">' +
      '<div class="hero-img" style="background-image:url(\'' + MAG.photos.hero + '\')"></div>' +
      '<div class="hero-shade"></div>' +
      '<div class="slide-inner">' +
      '<div class="cover-sub" data-fx data-e="cover.sub">' + MAG.project.subtitle + "</div>" +
      '<h1 class="display" data-fx="1" data-e="cover.name">Magnolia<br>Landing</h1>' +
      '<div class="cover-loc" data-fx="2" data-e="cover.city">' + MAG.project.city + "</div>" +
      '<p class="cover-tag" data-fx="3" data-e="cover.tag">Glazing. Cladding. Screening. <b>One coordinated package.</b></p>' +
      "</div></section>";
  }

  /* ---------- 02 overview ---------- */
  function overview() {
    var team = MAG.team.map(function (t, i) {
      return '<div class="team-cell' + (i === MAG.team.length - 1 ? " hl" : "") + '">' +
        '<div class="r">' + t.role + '</div><div class="n">' + t.name + '</div><div class="l">' + t.loc + "</div></div>";
    }).join("");
    return '<section class="slide" id="s-overview" data-title="Project Overview">' +
      '<div class="slide-inner">' + kicker("02", "Project Overview") +
      '<div class="split">' +
      "<div>" +
      '<h2 class="title" data-fx="1">One coordinated<br>exterior package.</h2>' +
      '<p class="lede" data-fx="2" data-e="overview.body">' + C().overview.body + "</p>" +
      '<div class="ov-bullets" data-fx="3">' + C().overview.bullets.map(function (b) {
        return '<div class="b"><i>▸</i><span>' + b + "</span></div>";
      }).join("") + "</div>" +
      "</div>" +
      '<div data-fx="2"><div class="map-card">' +
      '<div class="map-fallback"><span class="mono small" style="letter-spacing:.2em">CHARLESTON, SC</span></div>' +
      '<div id="mini-map"></div>' +
      '<div class="map-pin-abs"><span class="pin-wrap"><span class="pin-ring"></span><span class="pin-core"></span></span></div>' +
      '<div class="map-tag"><b>MAGNOLIA LANDING</b> · ' + MAG.project.address + "</div>" +
      "</div></div>" +
      "</div>" +
      '<div class="team-strip" data-fx="4">' + team + "</div>" +
      "</div></section>";
  }

  /* ---------- 03 scope map ---------- */
  function scopeMap() {
    return '<section class="slide" id="s-scopemap" data-title="Exterior Scope Map">' +
      '<div class="slide-inner">' + kicker("03", "Exterior Scope Map") +
      '<div class="split" style="grid-template-columns:1fr;gap:0">' +
      '<p class="lede" data-fx="1" data-e="scopemap.body" style="margin-bottom:16px">' + C().scopeMap.body + "</p></div>" +
      '<div class="view-tabs" id="scope-tabs" data-fx="2"></div>' +
      '<div class="scope-layout" data-fx="3">' +
      '<div class="scope-stage" id="scope-stage"><div class="scope-tip" id="scope-tip"></div></div>' +
      '<div class="legend" id="scope-legend"></div>' +
      "</div></div></section>";
  }

  /* ---------- 04 scope summary ---------- */
  function scopeSummary() {
    var m = MAG.scopeSummary;
    return '<section class="slide" id="s-summary" data-title="Scope Summary">' +
      '<div class="slide-inner">' + kicker("04", "Scope Summary") +
      '<h2 class="title" data-fx="1" data-e="summary.heading">' + m.heading + "</h2>" +
      '<div class="metric-grid">' + m.metrics.map(function (x, i) {
        return '<div class="metric' + (x.value.indexOf("14,700") > -1 ? " gold" : "") + '" data-fx="' + Math.min(i + 1, 5) + '">' +
          '<div class="lb">' + x.label + '</div><div class="vl" data-e="summary.m' + i + '">' + x.value + '</div><div class="sb">' + x.sub + "</div></div>";
      }).join("") + "</div>" +
      '<div class="note" style="margin-top:26px" data-fx="5" data-e="summary.note">' + m.note + "</div>" +
      "</div></section>";
  }

  /* ---------- 05 system components ---------- */
  function systems() {
    return '<section class="slide" id="s-systems" data-title="System Components">' +
      '<div class="slide-inner">' + kicker("05", "System Components") +
      '<p class="lede" data-fx="1" data-e="systems.body">' + C().systems.body + "</p>" +
      '<div class="sys-grid">' + MAG.systems.map(function (s, i) {
        return '<article class="sys-card" data-sysi="' + i + '" data-fx="' + Math.min(i + 1, 5) + '" role="button" tabindex="0" style="cursor:pointer">' +
          '<div class="im" style="background-image:url(\'' + s.img + '\')"></div>' +
          '<div class="bd">' +
          '<div class="tg"><span class="sw" style="background:' + s.scopeColor + '"></span><span style="color:var(--ink-3)">' + s.tag + "</span></div>" +
          '<div class="nm">' + s.name + '</div>' +
          '<div class="wh">' + s.where + "</div>" +
          '<div class="mk">' + s.maker + ' · <span style="color:var(--sage)">specs ▸</span></div>' +
          "</div></article>";
      }).join("") + "</div>" +
      '<div class="note" style="margin-top:16px" data-fx="5" data-e="systems.specnote">' + MAG.specNote + "</div>" +
      "</div></section>";
  }

  /* system spec modal (reuses #mat-modal) */
  function openSpecModal(i) {
    var s = MAG.systems[i];
    var m = document.getElementById("mat-modal");
    m.innerHTML =
      '<button class="mat-close" aria-label="Close">×</button>' +
      '<div class="mat-dialog">' +
      '<div class="big" style="background-image:url(\'' + s.img + '\');background-color:var(--paper)"></div>' +
      '<div class="info">' +
      '<span class="area">' + s.scopeName + " · " + s.maker + "</span>" +
      "<h3>" + s.tag + "</h3>" +
      '<p class="desc" style="font-size:13px;line-height:1.7">' + s.specs.map(function (x) { return "▸ " + x; }).join("<br>") + "</p>" +
      (s.url ? '<a class="chip" style="text-decoration:none;align-self:flex-start" href="' + s.url + '" target="_blank" rel="noopener">⤓&nbsp; Manufacturer datasheet</a>' : "") +
      '<span class="status-pill">Basis of design — verify against approved shop drawings</span>' +
      "</div></div>";
    m.classList.add("open");
    m.querySelector(".mat-close").onclick = function () { m.classList.remove("open"); };
    m.onclick = function (e) { if (e.target === m) m.classList.remove("open"); };
  }

  /* ---------- 06 building model (3D) ---------- */
  function model() {
    return '<section class="slide" id="s-model" data-title="Building Model">' +
      '<div class="slide-inner" style="max-width:1560px">' + kicker("06", "Building Model — System Views") +
      '<div class="model-wrap" data-fx="1">' +
      '<div id="model-stage">' +
      '<div class="model-hud"><span>MAGNOLIA LANDING · <b id="model-view-name">OVERVIEW</b></span></div>' +
      '<div class="model-hint">Drag to orbit · scroll to zoom</div>' +
      '<img id="model-print-img" alt="Model view">' +
      "</div>" +
      '<div class="model-side">' +
      '<div class="mtabs" id="model-tabs"></div>' +
      '<div class="product-card" id="model-card"></div>' +
      "</div></div>" +
      "</div></section>";
  }

  /* ---------- 07 materials ---------- */
  function materials() {
    return '<section class="slide" id="s-materials" data-title="Design Assist / Material Review">' +
      '<div class="slide-inner">' + kicker("07", "Design Assist / Material Review") +
      '<p class="lede" data-fx="1" data-e="materials.body">' + C().materials.body + "</p>" +
      '<div class="mat-areas" id="mat-areas"></div>' +
      '<div class="note" style="margin-top:18px" data-fx="5">Review gallery only — final selections are coordinated with the project team during design assist.</div>' +
      "</div></section>";
  }

  /* ---------- 08 installation strategy ---------- */
  function strategy() {
    return '<section class="slide" id="s-strategy" data-title="Installation Strategy">' +
      '<div class="slide-inner">' + kicker("08", "Installation Strategy") +
      '<div class="strategy-cols">' +
      "<div>" +
      '<h2 class="title" data-fx="1">Sequenced with the<br>structure — not against it.</h2>' +
      '<p class="lede" data-fx="2" data-e="strategy.main">' + C().installStrategy.main + "</p>" +
      "</div>" +
      '<p class="lede" data-fx="3" style="font-size:clamp(13px,1.1vw,16px)" data-e="strategy.support">' + C().installStrategy.support + "</p>" +
      "</div>" +
      '<div class="seq-flow" id="seq-strategy" data-fx="4"></div>' +
      '<div class="note" style="margin-top:22px" data-fx="5" data-e="strategy.safe">' + C().installStrategy.safe + "</div>" +
      "</div></section>";
  }

  /* ---------- 09 typical installation flow ---------- */
  function flow() {
    return '<section class="slide" id="s-flow" data-title="Typical Installation Flow">' +
      '<div class="slide-inner">' + kicker("09", "Typical Installation Flow") +
      '<div class="flow-layout">' +
      "<div>" +
      '<h2 class="title" data-fx="1">Three-floor<br>readiness.</h2>' +
      '<p class="lede" data-fx="2" data-e="flow.body">' + C().installFlow.body + "</p>" +
      '<div class="note" style="margin-top:18px" data-fx="3" data-e="flow.note">' + C().installFlow.note + "</div>" +
      "</div>" +
      '<div class="floor-stack" id="floor-stack" data-fx="2"></div>' +
      "</div></div></section>";
  }

  /* ---------- 10 fabrication ---------- */
  function fabrication() {
    return '<section class="slide" id="s-fab" data-title="Fabrication Process">' +
      '<div class="slide-inner">' + kicker("10", "Fabrication Process") +
      '<p class="lede" data-fx="1" data-e="fab.body">' + C().fabrication.body + "</p>" +
      '<div class="fab-flow" id="fab-flow"></div>' +
      '<div class="note" style="margin-top:24px" data-fx="5" data-e="fab.es">' + C().fabrication.es + "</div>" +
      "</div></section>";
  }

  /* ---------- 11 coordination matrix ---------- */
  function matrix() {
    return '<section class="slide" id="s-matrix" data-title="Coordination Matrix">' +
      '<div class="slide-inner">' + kicker("11", "Project Coordination Matrix") +
      '<p class="lede" data-fx="1" data-e="matrix.body">' + C().matrix.body + "</p>" +
      '<div id="matrix-host" data-fx="2" data-scroll style="max-height:58vh;overflow:auto"></div>' +
      "</div></section>";
  }

  /* ---------- 12 experience ---------- */
  function experience() {
    return '<section class="slide" id="s-exp" data-title="Similar Project Experience">' +
      '<div class="slide-inner">' + kicker("12", "Similar Project Experience") +
      '<p class="lede" data-fx="1" data-e="exp.body">' + C().experience.body + "</p>" +
      '<div class="exp-grid" id="exp-grid"></div>' +
      "</div></section>";
  }

  /* ---------- 13 quality ---------- */
  function quality() {
    return '<section class="slide" id="s-quality" data-title="Quality / Closeout">' +
      '<div class="slide-inner">' + kicker("13", "Quality / Closeout") +
      '<div class="q-layout">' +
      "<div>" +
      '<h2 class="title" data-fx="1">Managed from shop<br>drawings to punch.</h2>' +
      '<p class="lede" data-fx="2" data-e="quality.body">' + C().quality.body + "</p>" +
      '<div class="q-list" data-fx="3">' + C().quality.bullets.map(function (b) {
        return '<div class="q-item"><span class="ck">✓</span><span>' + b + "</span></div>";
      }).join("") + "</div>" +
      "</div>" +
      '<div class="q-img" data-fx="3"><img src="' + MAG.photos.details.unitized + '" alt="Curtainwall installation detail"></div>' +
      "</div></div></section>";
  }

  /* ---------- 14 closing ---------- */
  function closing() {
    return '<section class="slide" id="s-closing" data-title="Closing">' +
      '<div class="closing-img" style="background-image:url(\'' + MAG.photos.closing + '\')"></div>' +
      '<div class="closing-shade"></div>' +
      '<div class="slide-inner">' +
      '<div class="cl-name" data-fx data-e="closing.name">' + C().closing.name + "</div>" +
      '<p class="cl-body" data-fx="2" data-e="closing.body">' + C().closing.body + "</p>" +
      '<div class="cl-line" data-fx="3" data-e="closing.line">' + C().closing.line + "</div>" +
      '<div class="cl-brand" data-fx="4"><img src="../public/logo/1cg-line.svg" alt="1CG" onerror="this.style.display=\'none\'"><span class="mono small" style="letter-spacing:.3em">1CG · GLAZING &amp; CLADDING</span></div>' +
      "</div></section>";
  }

  /* ---------- mini map (lazy) ---------- */
  var mapDone = false;
  function initMiniMap() {
    if (mapDone || !window.maplibregl) return;
    mapDone = true;
    try {
      var map = new maplibregl.Map({
        container: "mini-map",
        style: "https://tiles.openfreemap.org/styles/positron",
        center: MAG.project.coordinates,
        zoom: 13.6,
        pitch: 48,
        bearing: -14,
        interactive: false,
        attributionControl: false
      });
      map.on("load", function () {
        try {
          var layers = map.getStyle().layers, labelId;
          for (var i = 0; i < layers.length; i++) {
            if (layers[i].type === "symbol" && layers[i].layout && layers[i].layout["text-field"]) { labelId = layers[i].id; break; }
          }
          map.addLayer({
            id: "m3d", source: "openmaptiles", "source-layer": "building", type: "fill-extrusion", minzoom: 13,
            paint: {
              "fill-extrusion-color": "#2c332d",
              "fill-extrusion-height": ["get", "render_height"],
              "fill-extrusion-base": ["get", "render_min_height"],
              "fill-extrusion-opacity": .75
            }
          }, labelId);
        } catch (e) {}
        setInterval(function () { map.easeTo({ bearing: map.getBearing() + 8, duration: 6000, easing: function (t) { return t; } }); }, 6000);
      });
    } catch (e) { mapDone = false; }
  }

  /* ---------- build ---------- */
  function build() {
    var deck = document.getElementById("deck");
    deck.innerHTML = [
      cover(), overview(), scopeMap(), scopeSummary(), systems(), model(),
      materials(), strategy(), flow(), fabrication(), matrix(), experience(), quality(), closing()
    ].join("");

    MAG.ScopeMap.mount("scope-stage", "scope-tabs", "scope-legend", "scope-tip");
    MAG.MaterialGallery.render("mat-areas");
    MAG.Sequence.strategy("seq-strategy");
    MAG.Sequence.flow("floor-stack");
    MAG.Sequence.fabrication("fab-flow");
    MAG.Matrix.render("matrix-host");
    MAG.PhotoGrid.render("exp-grid");

    document.querySelectorAll(".sys-card[data-sysi]").forEach(function (c) {
      c.addEventListener("click", function () { openSpecModal(+c.dataset.sysi); });
      c.addEventListener("keydown", function (e) { if (e.key === "Enter") openSpecModal(+c.dataset.sysi); });
    });

    document.addEventListener("slidechange", function (e) {
      if (e.detail.id === "s-overview") initMiniMap();
      if (e.detail.id === "s-model" && MAG.Model) MAG.Model.ensure();
    });
  }

  return { build: build };
})();
