/* ============================================================
   ScopeMap — parametric SVG elevations, color-coded by scope.
   Blue=CW/glazing · Green=ACM · Gold=V-Plank · Gray=Screening · White=Entrances
   Hover highlights + labels. No approval controls.
   ============================================================ */
var MAG = window.MAG = window.MAG || {};

MAG.ScopeMap = (function () {
  var COLORS = { cw: "#4f8fe6", acm: "#56b06c", plank: "#d9a441", screen: "#98a1a5", ent: "#f2f4f3" };
  var NAMES = { cw: "Curtainwall / Glazing", acm: "ACM Panels", plank: "Wood-Grain Soffits / V-Plank", screen: "Garage Screening", ent: "Entrances / Storefront" };

  var GRADE = 14.5, TOP = 117.5;
  var LV = { L1: 15.5, L2: 26.5, L3: 36.5, L4: 46.5, L5: 60, L6: 73.5, L7: 87, R: 101.5, PH: 115.5 };

  /* ---------- svg helpers ---------- */
  var S = 6.2; /* px per foot */
  function X(ft) { return 40 + ft * S; }
  function Y(el) { return 30 + (TOP - el) * S; }
  function r(x, y, w, h, fill, o, rx) {
    return '<rect x="' + X(x).toFixed(1) + '" y="' + Y(y + h).toFixed(1) + '" width="' + (w * S).toFixed(1) + '" height="' + (h * S).toFixed(1) + '" fill="' + fill + '"' + (o != null ? ' opacity="' + o + '"' : "") + (rx ? ' rx="' + rx + '"' : "") + " />";
  }
  function mullions(x, y, w, h, gap, color, op) {
    var out = "", n = Math.max(1, Math.round(w / gap));
    for (var i = 1; i < n; i++) {
      var mx = X(x + (w / n) * i);
      out += '<line x1="' + mx.toFixed(1) + '" y1="' + Y(y + h).toFixed(1) + '" x2="' + mx.toFixed(1) + '" y2="' + Y(y).toFixed(1) + '" stroke="' + color + '" stroke-width="1" opacity="' + (op || .5) + '"/>';
    }
    return out;
  }
  function floorlines(x, w, els, color) {
    return els.map(function (el) {
      return '<line x1="' + X(x) + '" y1="' + Y(el).toFixed(1) + '" x2="' + X(x + w) + '" y2="' + Y(el).toFixed(1) + '" stroke="' + color + '" stroke-width="1.5" opacity=".8"/>';
    }).join("");
  }
  function perf(x, y, w, h) {
    return '<rect x="' + X(x).toFixed(1) + '" y="' + Y(y + h).toFixed(1) + '" width="' + (w * S).toFixed(1) + '" height="' + (h * S).toFixed(1) + '" fill="url(#perfpat)" />';
  }

  /* glazed band with mullion rhythm */
  function glazed(x, y, w, h, sys, mullGap) {
    var fill = sys === "cw" ? "rgba(79,143,230,.30)" : "rgba(79,143,230,.22)";
    return r(x, y, w, h, fill) + mullions(x, y, w, h, mullGap || 5, COLORS.cw, .55) +
      '<rect x="' + X(x).toFixed(1) + '" y="' + Y(y + h).toFixed(1) + '" width="' + (w * S).toFixed(1) + '" height="' + (h * S).toFixed(1) + '" fill="none" stroke="' + COLORS.cw + '" stroke-width="1.4"/>';
  }
  function acmBand(x, el, w, hh) {
    return r(x, el - hh / 2, w, hh, "rgba(86,176,108,.55)");
  }
  function plankBand(x, y, w, h) {
    var out = r(x, y, w, h, "rgba(217,164,65,.65)", null, 1);
    for (var i = 0; i < Math.floor(h / .5) && i < 10; i++) {
      var ly = Y(y + h) + ((i + 1) * (h * S)) / Math.min(10, Math.floor(h / .5) + 1);
      out += '<line x1="' + X(x) + '" y1="' + ly.toFixed(1) + '" x2="' + X(x + w) + '" y2="' + ly.toFixed(1) + '" stroke="rgba(10,12,11,.5)" stroke-width=".7"/>';
    }
    return out;
  }
  function entrance(x, w, hh, label) {
    var y = GRADE;
    return '<g data-sys="ent" data-note="' + (label || "Entrance system") + '">' +
      r(x, y, w, hh, "var(--bp-ent)", null, 1) +
      '<line x1="' + X(x + w / 2) + '" y1="' + Y(y + hh).toFixed(1) + '" x2="' + X(x + w / 2) + '" y2="' + Y(y).toFixed(1) + '" stroke="#0d100e" stroke-width="1.6"/>' +
      "</g>";
  }

  function gridBubbles(edges, labels) {
    return edges.map(function (ft, i) {
      var gx = X(ft);
      return '<line x1="' + gx.toFixed(1) + '" y1="' + (Y(TOP) + 2) + '" x2="' + gx.toFixed(1) + '" y2="' + Y(GRADE) + '" class="sysline" stroke-dasharray="3 6"/>' +
        '<circle cx="' + gx.toFixed(1) + '" cy="' + (Y(TOP) - 13) + '" r="13" fill="none" stroke="var(--bp-outline)"/>' +
        '<text x="' + gx.toFixed(1) + '" y="' + (Y(TOP) - 8.5) + '" text-anchor="middle" class="bp-label" font-size="12">' + labels[i] + "</text>";
    }).join("");
  }
  function levelLabels(w) {
    var els = [["L1", LV.L1], ["L2", LV.L2], ["L3", LV.L3], ["L4", LV.L4], ["L5", LV.L5], ["L6", LV.L6], ["L7", LV.L7], ["ROOF", LV.R], ["PH", LV.PH]];
    return els.map(function (p) {
      return '<line x1="' + X(0) + '" y1="' + Y(p[1]).toFixed(1) + '" x2="' + X(w) + '" y2="' + Y(p[1]).toFixed(1) + '" class="sysline"/>' +
        '<text x="' + (X(w) + 10) + '" y="' + (Y(p[1]) + 4) + '" class="bp-label" font-size="11.5">' + p[0] + " · EL " + p[1] + "′</text>";
    }).join("");
  }

  /* ---------- elevations ---------- */
  function south() {
    var W = 277.17, out = "";
    out += gridBubbles([0, 20, 50, 80, 110, 140, 170, 200, 230, 257.17, 277.17], ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "12"]);
    out += levelLabels(W);
    /* massing outline */
    out += '<rect x="' + X(0) + '" y="' + Y(103.5).toFixed(1) + '" width="' + (W * S).toFixed(1) + '" height="' + ((103.5 - GRADE) * S).toFixed(1) + '" fill="var(--bp-mass)" stroke="var(--bp-outline)" stroke-width="1.4"/>';
    /* storefront base — blue glazing */
    out += '<g data-sys="cw" data-note="ES-7525 stick — retail / lobby base">' + glazed(2, GRADE, 253, LV.L2 - GRADE - 1.4, "sf", 6) + "</g>";
    /* entrances */
    out += entrance(58, 9, 9.5, "ES-9000 retail entry");
    out += entrance(133, 11, 9.5, "ES-9000 main entry");
    out += entrance(216, 9, 9.5, "ES-46T terrace / retail doors");
    /* garage screening L2–L4 */
    out += '<g data-sys="screen" data-note="Perforated screening — parking levels 2–4">' +
      r(50, LV.L2, 207.17, LV.L5 - LV.L2 - 1.2, "rgba(152,161,165,.30)") +
      perf(50, LV.L2, 207.17, LV.L5 - LV.L2 - 1.2) +
      '<rect x="' + X(50) + '" y="' + Y(LV.L5 - 1.2).toFixed(1) + '" width="' + (207.17 * S).toFixed(1) + '" height="' + ((LV.L5 - LV.L2 - 1.2) * S).toFixed(1) + '" fill="none" stroke="#98a1a5" stroke-width="1.4"/></g>';
    /* west end CW at parking levels */
    out += '<g data-sys="cw" data-note="GW-7000 — west office bays">' + glazed(2, LV.L2, 46, LV.L5 - LV.L2 - 1.2, "cw", 5) + "</g>";
    out += '<g data-sys="cw" data-note="Stair / core glazing — east">' + glazed(259, LV.L2, 16, LV.L5 - LV.L2 - 1.2, "cw", 5) + "</g>";
    /* office levels */
    out += '<g data-sys="cw" data-note="GW-7000 unitized — office levels 5–7">' + glazed(2, LV.L5, 273.17, LV.R - LV.L5 - 1, "cw", 5) + "</g>";
    /* plank bands at balcony recesses */
    out += '<g data-sys="plank" data-note="6″ Mosaic V-Plank — balcony soffit bands">' +
      plankBand(110, LV.L5 + 1.2, 60, 1.6) + plankBand(110, LV.L6 + 1.2, 60, 1.6) + plankBand(110, LV.L7 + 1.2, 60, 1.6) +
      plankBand(20, LV.L2 - 2.6, 90, 1.6) + "</g>";
    /* ACM floor-line spandrels */
    out += '<g data-sys="acm" data-note="ACM spandrels + parapet closures">' +
      acmBand(2, LV.L5, 273.17, 2.2) + acmBand(2, LV.L6, 273.17, 2.2) + acmBand(2, LV.L7, 273.17, 2.2) +
      acmBand(0, 102.6, 277.17, 2.6) + "</g>";
    /* penthouse */
    out += '<g data-sys="acm" data-note="ACM penthouse crown + louvers">' +
      r(80, 103.5, 120, 12, "rgba(86,176,108,.4)") +
      mullions(80, 103.5, 120, 12, 3, "#56b06c", .7) +
      '<rect x="' + X(80) + '" y="' + Y(115.5).toFixed(1) + '" width="' + (120 * S).toFixed(1) + '" height="' + (12 * S).toFixed(1) + '" fill="none" stroke="#56b06c" stroke-width="1.4"/></g>';
    /* missile datum */
    out += '<line x1="' + X(0) + '" y1="' + Y(44.5).toFixed(1) + '" x2="' + X(W) + '" y2="' + Y(44.5).toFixed(1) + '" stroke="#c56a5c" stroke-width="1" stroke-dasharray="8 5" opacity=".8"/>' +
      '<text x="' + X(2) + '" y="' + (Y(44.5) - 8) + '" class="bp-label" font-size="11" fill="#c56a5c">LARGE-MISSILE GLAZING BELOW 30′ AFG · SMALL-MISSILE ABOVE</text>';
    return frame(out, W, "SOUTH ELEVATION — 277′-2″");
  }

  function north() {
    var W = 277.17, out = "";
    out += gridBubbles([0, 20, 50, 80, 110, 140, 170, 200, 230, 257.17, 277.17], ["12", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1"]);
    out += levelLabels(W);
    out += '<rect x="' + X(0) + '" y="' + Y(103.5).toFixed(1) + '" width="' + (W * S).toFixed(1) + '" height="' + ((103.5 - GRADE) * S).toFixed(1) + '" fill="var(--bp-mass)" stroke="var(--bp-outline)" stroke-width="1.4"/>';
    out += '<g data-sys="cw" data-note="ES-7525 stick — lobby / retail base">' + glazed(2, GRADE, 273.17, LV.L2 - GRADE - 1.4, "sf", 6) + "</g>";
    out += entrance(128, 12, 9.5, "ES-9000 main lobby entry");
    out += entrance(36, 9, 9.5, "ES-46T service / retail doors");
    out += '<g data-sys="cw" data-note="GW-7000 + stair glazing — parking levels">' + glazed(2, LV.L2, 200, LV.L5 - LV.L2 - 1.2, "cw", 5) + "</g>";
    out += '<g data-sys="screen" data-note="Perforated screening — east parking bays">' +
      r(204, LV.L2, 71, LV.L5 - LV.L2 - 1.2, "rgba(152,161,165,.30)") + perf(204, LV.L2, 71, LV.L5 - LV.L2 - 1.2) +
      '<rect x="' + X(204) + '" y="' + Y(LV.L5 - 1.2).toFixed(1) + '" width="' + (71 * S).toFixed(1) + '" height="' + ((LV.L5 - LV.L2 - 1.2) * S).toFixed(1) + '" fill="none" stroke="#98a1a5" stroke-width="1.4"/></g>';
    out += '<g data-sys="cw" data-note="GW-7000 unitized — office levels 5–7">' + glazed(2, LV.L5, 273.17, LV.R - LV.L5 - 1, "cw", 5) + "</g>";
    out += '<g data-sys="plank" data-note="6″ Mosaic V-Plank — 50.2 SF balcony bands">' +
      plankBand(126, LV.L5 + 1.2, 34, 1.6) + plankBand(126, LV.L6 + 1.2, 34, 1.6) + plankBand(126, LV.L7 + 1.2, 34, 1.6) +
      plankBand(238, LV.L5 + 1.2, 20, 1.6) + plankBand(238, LV.L6 + 1.2, 20, 1.6) + "</g>";
    out += '<g data-sys="acm" data-note="ACM spandrels + parapet closures">' +
      acmBand(2, LV.L5, 273.17, 2.2) + acmBand(2, LV.L6, 273.17, 2.2) + acmBand(2, LV.L7, 273.17, 2.2) + acmBand(0, 102.6, 277.17, 2.6) + "</g>";
    out += '<g data-sys="acm" data-note="ACM penthouse crown + louvers">' +
      r(77, 103.5, 120, 12, "rgba(86,176,108,.4)") + mullions(77, 103.5, 120, 12, 3, "#56b06c", .7) +
      '<rect x="' + X(77) + '" y="' + Y(115.5).toFixed(1) + '" width="' + (120 * S).toFixed(1) + '" height="' + (12 * S).toFixed(1) + '" fill="none" stroke="#56b06c" stroke-width="1.4"/></g>';
    return frame(out, W, "NORTH ELEVATION — 277′-2″");
  }

  function east() {
    var W = 171, out = "";
    out += gridBubbles([0, 58, 104.5, 124.5, 171], ["F", "E", "D", "C", "A"]);
    out += levelLabels(W);
    /* podium full width to L5 */
    out += '<rect x="' + X(0) + '" y="' + Y(LV.L5).toFixed(1) + '" width="' + (W * S).toFixed(1) + '" height="' + ((LV.L5 - GRADE) * S).toFixed(1) + '" fill="var(--bp-mass)" stroke="var(--bp-outline)" stroke-width="1.4"/>';
    /* upper block only middle */
    out += '<rect x="' + X(38) + '" y="' + Y(103.5).toFixed(1) + '" width="' + (95 * S).toFixed(1) + '" height="' + ((103.5 - LV.L5) * S).toFixed(1) + '" fill="var(--bp-mass)" stroke="var(--bp-outline)" stroke-width="1.4"/>';
    out += '<g data-sys="cw" data-note="ES-7525 stick — retail base">' + glazed(2, GRADE, 132, LV.L2 - GRADE - 1.4, "sf", 6) + "</g>";
    out += entrance(76, 10, 9.5, "ES-9000 east entry");
    out += '<g data-sys="screen" data-note="Perforated screening — 1,007.9 / 442.6 / 271.3 SF panels">' +
      r(6, LV.L2, 122, LV.L5 - LV.L2 - 1.2, "rgba(152,161,165,.30)") + perf(6, LV.L2, 122, LV.L5 - LV.L2 - 1.2) +
      '<rect x="' + X(6) + '" y="' + Y(LV.L5 - 1.2).toFixed(1) + '" width="' + (122 * S).toFixed(1) + '" height="' + ((LV.L5 - LV.L2 - 1.2) * S).toFixed(1) + '" fill="none" stroke="#98a1a5" stroke-width="1.4"/></g>';
    out += '<g data-sys="cw" data-note="GW-7000 — stair / corner glazing">' + glazed(134, LV.L2, 33, LV.L5 - LV.L2 - 1.2, "cw", 5) + "</g>";
    out += '<g data-sys="cw" data-note="GW-7000 unitized — office levels 5–7">' + glazed(40, LV.L5, 91, LV.R - LV.L5 - 1, "cw", 5) + "</g>";
    out += '<g data-sys="plank" data-note="V-Plank soffits — terrace edges (17.5 SF accents)">' +
      plankBand(134, LV.L5 - 1.6, 33, 1.5) + plankBand(40, LV.L5 + 1.2, 24, 1.5) + "</g>";
    out += '<g data-sys="acm" data-note="ACM spandrels + podium cap">' +
      acmBand(40, LV.L6, 91, 2.2) + acmBand(40, LV.L7, 91, 2.2) + acmBand(38, 102.6, 95, 2.6) + acmBand(0, LV.L5 - .4, 171, 2.4) + "</g>";
    out += '<g data-sys="acm" data-note="ACM penthouse crown">' +
      r(62, 103.5, 48, 12, "rgba(86,176,108,.4)") + mullions(62, 103.5, 48, 12, 3, "#56b06c", .7) +
      '<rect x="' + X(62) + '" y="' + Y(115.5).toFixed(1) + '" width="' + (48 * S).toFixed(1) + '" height="' + (12 * S).toFixed(1) + '" fill="none" stroke="#56b06c" stroke-width="1.4"/></g>';
    return frame(out, W, "EAST ELEVATION — 171′-0″");
  }

  function west() {
    var W = 171, out = "";
    out += gridBubbles([0, 46.5, 66.5, 113, 171], ["A", "C", "D", "E", "F"]);
    out += levelLabels(W);
    out += '<rect x="' + X(0) + '" y="' + Y(103.5).toFixed(1) + '" width="' + (W * S).toFixed(1) + '" height="' + ((103.5 - GRADE) * S).toFixed(1) + '" fill="var(--bp-mass)" stroke="var(--bp-outline)" stroke-width="1.4"/>';
    out += '<g data-sys="cw" data-note="ES-7525 stick — full storefront base">' + glazed(2, GRADE, 167, LV.L2 - GRADE - 1.4, "sf", 6) + "</g>";
    out += entrance(48, 10, 9.5, "ES-9000 west entry");
    out += entrance(118, 8, 9.5, "ES-46T outswing doors");
    out += '<g data-sys="cw" data-note="GW-7000 — L2 office + parking-level glazing">' + glazed(2, LV.L2, 167, LV.L5 - LV.L2 - 1.2, "cw", 5) + "</g>";
    out += '<g data-sys="cw" data-note="GW-7000 unitized — office levels 5–7">' + glazed(2, LV.L5, 167, LV.R - LV.L5 - 1, "cw", 5) + "</g>";
    out += '<g data-sys="plank" data-note="93.2 SF V-Plank bands — recessed balconies">' +
      plankBand(34, LV.L5 + 1.2, 104, 1.7) + plankBand(34, LV.L6 + 1.2, 104, 1.7) + plankBand(34, LV.L7 + 1.2, 104, 1.7) + "</g>";
    out += '<g data-sys="acm" data-note="ACM spandrels + parapet closures">' +
      acmBand(2, LV.L5, 167, 2.2) + acmBand(2, LV.L6, 167, 2.2) + acmBand(2, LV.L7, 167, 2.2) + acmBand(0, 102.6, 171, 2.6) + "</g>";
    out += '<g data-sys="acm" data-note="ACM penthouse crown">' +
      r(60, 103.5, 52, 12, "rgba(86,176,108,.4)") + mullions(60, 103.5, 52, 12, 3, "#56b06c", .7) +
      '<rect x="' + X(60) + '" y="' + Y(115.5).toFixed(1) + '" width="' + (52 * S).toFixed(1) + '" height="' + (12 * S).toFixed(1) + '" fill="none" stroke="#56b06c" stroke-width="1.4"/></g>';
    return frame(out, W, "WEST ELEVATION — 171′-0″");
  }

  function frame(body, wft, title) {
    var w = X(wft) + 160, h = Y(GRADE) + 44;
    return '<svg viewBox="0 0 ' + w + " " + h + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + title + '">' +
      '<defs><pattern id="perfpat" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1" fill="rgba(152,161,165,.6)"/></pattern></defs>' +
      body +
      '<line x1="' + X(0) + '" y1="' + Y(GRADE).toFixed(1) + '" x2="' + X(wft) + '" y2="' + Y(GRADE).toFixed(1) + '" stroke="var(--bp-strong)" stroke-width="2"/>' +
      '<text x="' + X(0) + '" y="' + (Y(GRADE) + 28) + '" class="bp-label" font-size="15" letter-spacing="4">' + title + "</text>" +
      "</svg>";
  }

  var VIEWS = { south: south, north: north, east: east, west: west };

  /* ---------- mount ---------- */
  function mount(stageId, tabsId, legendId, tipId) {
    var stage = document.getElementById(stageId);
    var tabs = document.getElementById(tabsId);
    var tip = document.getElementById(tipId);

    function renderLegend() {
      var host = document.getElementById(legendId);
      var det = MAG.takeoffDetail;
      host.innerHTML = Object.keys(NAMES).map(function (k) {
        return '<div class="leg-item" data-leg="' + k + '"><span class="sw" style="background:' + COLORS[k] + '"></span>' +
          '<span class="nm">' + NAMES[k] + "</span></div>";
      }).join("") +
        '<div class="note" style="margin-top:12px" data-e="scopemap.note">Hover a system to isolate it. Colors are consistent across every elevation and the 3-D model.</div>';
    }

    function show(view) {
      tabs.querySelectorAll(".vtab").forEach(function (b) { b.classList.toggle("cur", b.dataset.v === view); });
      if (view === "sheets") {
        var P = MAG.photos.packet;
        stage.innerHTML =
          '<div class="packet-grid">' + P.map(function (p, i) {
            return '<button class="packet-card" data-i="' + i + '">' +
              '<span class="pc-im"><img src="' + p.thumb + '" alt="' + p.name + '" loading="lazy"></span>' +
              '<span class="pc-bd">' +
              '<span class="pc-no">' + p.sheet + " · PDF</span>" +
              '<span class="pc-nm">' + p.name + "</span>" +
              '<span class="pc-ds">' + p.desc + "</span>" +
              '<span class="pc-open">Select to view ▸</span>' +
              "</span></button>";
          }).join("") +
          '</div>' +
          '<div class="packet-note mono">THE 5-SHEET PROPOSAL PACKET · CLICK A SHEET TO OPEN IT — ZOOM, PAN, OR OPEN THE ORIGINAL PDF</div>';
        stage.querySelectorAll(".packet-card").forEach(function (b) {
          b.addEventListener("click", function () { MAG.SheetViewer.open(+b.dataset.i); });
        });
        return;
      }
      stage.innerHTML = VIEWS[view]();
      var svg = stage.querySelector("svg");
      svg.querySelectorAll("g[data-sys]").forEach(function (g) {
        g.addEventListener("mousemove", function (ev) {
          svg.classList.add("dimmed");
          svg.querySelectorAll("g[data-sys]").forEach(function (o) { o.classList.toggle("hot", o.dataset.sys === g.dataset.sys); });
          document.querySelectorAll("#" + legendId + " .leg-item").forEach(function (li) { li.classList.toggle("hot", li.dataset.leg === g.dataset.sys); });
          var rect = stage.getBoundingClientRect();
          tip.style.left = (ev.clientX - rect.left) + "px";
          tip.style.top = (ev.clientY - rect.top) + "px";
          tip.innerHTML = "<b>" + NAMES[g.dataset.sys] + "</b> · " + (g.dataset.note || "");
          tip.classList.add("show");
        });
        g.addEventListener("mouseleave", function () {
          svg.classList.remove("dimmed");
          svg.querySelectorAll("g[data-sys]").forEach(function (o) { o.classList.remove("hot"); });
          document.querySelectorAll("#" + legendId + " .leg-item").forEach(function (li) { li.classList.remove("hot"); });
          tip.classList.remove("show");
        });
      });
    }

    tabs.innerHTML = ["south", "north", "east", "west"].map(function (v, i) {
      return '<button class="vtab' + (i === 0 ? " cur" : "") + '" data-v="' + v + '">' + v + "</button>";
    }).join("") + '<button class="vtab" data-v="sheets">Proposal PDFs</button>';
    tabs.querySelectorAll(".vtab").forEach(function (b) {
      b.addEventListener("click", function () { show(b.dataset.v); });
    });

    renderLegend();
    show("south");
  }

  return { mount: mount, COLORS: COLORS, NAMES: NAMES };
})();
