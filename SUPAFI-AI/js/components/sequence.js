/* ============================================================
   SequenceDiagram — installation strategy flow, 3-floor readiness,
   fabrication process cards. Planning-level language only.
   ============================================================ */
var MAG = window.MAG = window.MAG || {};

MAG.Sequence = (function () {
  /* strategy: horizontal lit-in-order flow */
  function strategy(hostId) {
    var host = document.getElementById(hostId);
    var steps = MAG.copy.installStrategy.steps;
    host.innerHTML = steps.map(function (s, i) {
      return '<div class="seq-step" data-i="' + i + '">' +
        '<div class="box"><span class="idx">' + String(i + 1).padStart(2, "0") + '</span><span class="tx">' + s + "</span></div>" +
        (i < steps.length - 1 ? '<span class="arrow">▸</span>' : "") +
        "</div>";
    }).join("");

    /* light steps sequentially when slide activates */
    document.addEventListener("slidechange", function (e) {
      if (e.detail.id !== "s-strategy") return;
      host.querySelectorAll(".seq-step").forEach(function (el) { el.classList.remove("lit"); });
      steps.forEach(function (_, i) {
        setTimeout(function () {
          var el = host.querySelector('.seq-step[data-i="' + i + '"]');
          if (el && document.getElementById("s-strategy").classList.contains("on")) el.classList.add("lit");
        }, 350 + i * 260);
      });
    });
  }

  /* 3-floor readiness stack */
  function flow(hostId) {
    var host = document.getElementById(hostId);
    host.innerHTML = MAG.copy.installFlow.floors.map(function (f) {
      return '<div class="floor ' + f.phase + '">' +
        '<div class="lv">' + f.level.replace("Level ", "L") + "</div>" +
        '<div class="st"><span class="ph">' + label(f.phase) + '</span><span class="ds">' + f.state + '</span><span class="bar"><i></i></span></div>' +
        "</div>";
    }).join("");
    function label(p) {
      return { verify: "Verification zone", ready: "Readiness confirmation", active: "Production installation", follow: "Follow-on trades" }[p] || p;
    }
  }

  /* fabrication process cards with inline icons */
  var ICONS = {
    "Raw Material": '<svg viewBox="0 0 48 48"><path d="M8 34l16-8 16 8-16 8zM8 26l16-8 16 8M8 18l16-8 16 8"/></svg>',
    "CNC Routing": '<svg viewBox="0 0 48 48"><rect x="8" y="10" width="32" height="24" rx="2"/><path d="M24 10v10m0 0l-5 5m5-5l5 5M14 40h20"/></svg>',
    "Panel Fabrication": '<svg viewBox="0 0 48 48"><rect x="10" y="8" width="28" height="18" rx="2"/><path d="M10 32h28M10 38h18"/></svg>',
    "Quality Review": '<svg viewBox="0 0 48 48"><circle cx="21" cy="21" r="11"/><path d="M29 29l11 11M16 21l4 4 7-8"/></svg>',
    "Packaging / Delivery": '<svg viewBox="0 0 48 48"><path d="M6 30h22V16h8l6 8v6h-4"/><circle cx="14" cy="34" r="4"/><circle cx="34" cy="34" r="4"/></svg>',
    "Field Installation": '<svg viewBox="0 0 48 48"><path d="M10 40V14l14-6v32M24 40V8m0 6l14 6v20M6 40h36"/></svg>'
  };
  function fabrication(hostId) {
    var host = document.getElementById(hostId);
    var steps = MAG.copy.fabrication.steps;
    host.innerHTML = steps.map(function (s, i) {
      return '<div class="fab-card" data-fx="' + Math.min(i + 1, 5) + '">' +
        (ICONS[s] || "") +
        '<span class="fi">' + String(i + 1).padStart(2, "0") + "</span>" +
        '<span class="fn">' + s + "</span>" +
        (i < steps.length - 1 ? '<span class="farr">▸</span>' : "") +
        "</div>";
    }).join("");
  }

  return { strategy: strategy, flow: flow, fabrication: fabrication };
})();
