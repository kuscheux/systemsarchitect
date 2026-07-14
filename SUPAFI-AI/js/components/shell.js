/* ============================================================
   PresentationShell — full-viewport swipe deck
   wheel / trackpad / touch / arrows / dots / hash, restrained motion,
   edit mode (contenteditable → localStorage) + version panel, print prep.
   ============================================================ */
var MAG = window.MAG = window.MAG || {};

MAG.Shell = (function () {
  var deck, slides = [], cur = 0, locked = false, hintShown = true;
  var LS_EDITS = "magnolia.edits.v1", LS_STAMP = "magnolia.lastEdited.v1";

  /* ---------- navigation ---------- */
  function go(i, instant) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (i === cur && !instant) return;
    cur = i;
    var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    deck.style.transition = (instant || reduced) ? "none" : "";
    deck.style.transform = "translateY(-" + (i * 100) + "dvh)";
    if (instant) requestAnimationFrame(function () { deck.style.transition = ""; });

    slides.forEach(function (s, k) { s.classList.toggle("on", k === i); });
    document.querySelectorAll("#dots button").forEach(function (d, k) { d.classList.toggle("cur", k === i); });
    var prog = document.getElementById("progress");
    if (prog) prog.style.width = ((i + 1) / slides.length * 100) + "%";
    var c = document.getElementById("counter");
    if (c) c.innerHTML = "<b>" + String(i + 1).padStart(2, "0") + "</b> / " + String(slides.length).padStart(2, "0");
    if (history.replaceState) history.replaceState(null, "", "#" + (i + 1));
    if (i > 0 && hintShown) { hintShown = false; var h = document.getElementById("hint"); if (h) h.classList.add("hide"); }

    lock();
    document.dispatchEvent(new CustomEvent("slidechange", { detail: { index: i, id: slides[i].id } }));
  }
  function next() { go(cur + 1); }
  function prev() { go(cur - 1); }
  function lock() { locked = true; setTimeout(function () { locked = false; }, 860); }

  /* nested scrollables shouldn't advance the deck mid-scroll */
  function scrollableAncestorTakes(el, dy) {
    while (el && el !== document.body) {
      if (el.hasAttribute && el.hasAttribute("data-scroll")) {
        var canDown = el.scrollTop + el.clientHeight < el.scrollHeight - 2;
        var canUp = el.scrollTop > 2;
        if ((dy > 0 && canDown) || (dy < 0 && canUp)) return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  function bind() {
    var acc = 0, accT = 0;
    addEventListener("wheel", function (e) {
      if (document.body.classList.contains("editing")) return;
      if (document.getElementById("ver-panel").classList.contains("open")) return;
      if (document.getElementById("mat-modal") && document.getElementById("mat-modal").classList.contains("open")) return;
      if (MAG.SheetViewer && MAG.SheetViewer.isOpen()) return;
      if (e.target.closest && e.target.closest("#model-stage")) return; /* orbit/zoom owns the wheel */
      if (scrollableAncestorTakes(e.target, e.deltaY)) return;
      e.preventDefault();
      if (locked) return;
      var now = Date.now();
      if (now - accT > 300) acc = 0;
      accT = now; acc += e.deltaY;
      if (acc > 90) { acc = 0; next(); }
      else if (acc < -90) { acc = 0; prev(); }
    }, { passive: false });

    var ty = null, tx = null;
    addEventListener("touchstart", function (e) { ty = e.touches[0].clientY; tx = e.touches[0].clientX; }, { passive: true });
    addEventListener("touchend", function (e) {
      if (ty === null || locked) return;
      if (MAG.SheetViewer && MAG.SheetViewer.isOpen()) { ty = null; return; }
      if (e.target.closest && e.target.closest("#model-stage")) { ty = null; return; }
      var dy = ty - e.changedTouches[0].clientY;
      var dx = tx - e.changedTouches[0].clientX;
      if (Math.abs(dy) > 64 && Math.abs(dy) > Math.abs(dx) * 1.2) {
        if (scrollableAncestorTakes(e.target, dy)) { ty = null; return; }
        dy > 0 ? next() : prev();
      }
      ty = null;
    }, { passive: true });

    addEventListener("keydown", function (e) {
      if (document.body.classList.contains("editing") && e.key !== "Escape") return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); next(); }
      else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); prev(); }
      else if (e.key === "ArrowRight") { next(); }
      else if (e.key === "ArrowLeft") { prev(); }
      else if (e.key === "Home") { go(0); }
      else if (e.key === "End") { go(slides.length - 1); }
      else if (e.key === "Escape") {
        if (MAG.SheetViewer) MAG.SheetViewer.close();
        closeVersions();
        var m = document.getElementById("mat-modal"); if (m) m.classList.remove("open");
        if (document.body.classList.contains("editing")) toggleEdit();
      }
    });

    addEventListener("resize", function () { go(cur, true); });
  }

  function buildDots() {
    var host = document.getElementById("dots");
    host.innerHTML = "";
    slides.forEach(function (s, i) {
      var b = document.createElement("button");
      b.setAttribute("aria-label", s.dataset.title || ("Section " + (i + 1)));
      b.innerHTML = "<i></i><span>" + String(i + 1).padStart(2, "0") + " · " + (s.dataset.title || "") + "</span>";
      b.addEventListener("click", function () { go(i); });
      host.appendChild(b);
    });
  }

  /* ---------- edit mode ---------- */
  function edits() { try { return JSON.parse(localStorage.getItem(LS_EDITS) || "{}"); } catch (e) { return {}; } }
  function applyEdits() {
    var map = edits();
    Object.keys(map).forEach(function (k) {
      var el = document.querySelector('[data-e="' + k + '"]');
      if (el) el.innerHTML = map[k];
    });
    stampLabel();
  }
  function stampLabel() {
    var el = document.getElementById("last-edited");
    var t = localStorage.getItem(LS_STAMP);
    el.textContent = t ? ("LAST EDITED · " + new Date(+t).toLocaleString()) : "";
  }
  function toggleEdit() {
    var on = document.body.classList.toggle("editing");
    var btn = document.getElementById("edit-btn");
    btn.classList.toggle("editing-on", on);
    btn.innerHTML = on ? "✓&nbsp; Done editing" : "✎&nbsp; Edit";
    document.querySelectorAll("[data-e]").forEach(function (el) {
      el.contentEditable = on ? "true" : "false";
      if (on) {
        el.addEventListener("blur", saveField);
      } else {
        el.removeEventListener("blur", saveField);
      }
    });
  }
  function saveField(ev) {
    var el = ev.currentTarget, k = el.getAttribute("data-e");
    var map = edits(); map[k] = el.innerHTML;
    localStorage.setItem(LS_EDITS, JSON.stringify(map));
    localStorage.setItem(LS_STAMP, String(Date.now()));
    stampLabel();
  }
  function resetEdits() {
    localStorage.removeItem(LS_EDITS);
    localStorage.removeItem(LS_STAMP);
    location.reload();
  }

  /* ---------- theme ---------- */
  function themeLabel() {
    var btn = document.getElementById("theme-btn");
    if (!btn) return;
    var light = document.documentElement.dataset.theme === "light";
    btn.innerHTML = light ? "◑&nbsp; Dark" : "◐&nbsp; Light";
  }
  function toggleTheme() {
    var next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("magnolia.theme", next); } catch (e) {}
    themeLabel();
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
  }

  /* ---------- versions ---------- */
  function openVersions() {
    document.getElementById("ver-panel").classList.add("open");
    document.getElementById("ver-scrim").classList.add("open");
  }
  function closeVersions() {
    document.getElementById("ver-panel").classList.remove("open");
    document.getElementById("ver-scrim").classList.remove("open");
  }
  function buildVersions() {
    var host = document.getElementById("ver-list");
    host.innerHTML = MAG.versions.map(function (v, i) {
      return '<div class="ver-row' + (i === 0 ? " cur" : "") + '"><span class="vv">v' + v.v + '</span><span class="vl2">' + v.label + "</span></div>";
    }).join("");
  }

  /* ---------- boot ---------- */
  function init() {
    deck = document.getElementById("deck");
    slides = Array.prototype.slice.call(deck.querySelectorAll(".slide"));
    buildDots();
    buildVersions();
    bind();
    applyEdits();

    var tb = document.getElementById("theme-btn");
    if (tb) { tb.addEventListener("click", toggleTheme); themeLabel(); }
    document.getElementById("edit-btn").addEventListener("click", toggleEdit);
    document.getElementById("ver-btn").addEventListener("click", openVersions);
    document.getElementById("ver-close").addEventListener("click", closeVersions);
    document.getElementById("ver-scrim").addEventListener("click", closeVersions);
    document.getElementById("ver-reset").addEventListener("click", resetEdits);
    document.getElementById("print-btn").addEventListener("click", function () {
      document.dispatchEvent(new CustomEvent("beforedeckprint"));
      setTimeout(function () { print(); }, 120);
    });

    var h = parseInt((location.hash || "").replace(/[^0-9]/g, ""), 10);
    go(isNaN(h) ? 0 : h - 1, true);
    setTimeout(function () { slides[cur] && slides[cur].classList.add("on"); }, 60);
  }

  return { init: init, go: go, next: next, prev: prev, current: function () { return cur; } };
})();
