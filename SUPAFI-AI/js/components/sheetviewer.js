/* ============================================================
   SheetViewer — full-screen interactive viewer for the proposal
   packet. Wheel / pinch zoom, drag pan, double-click zoom,
   prev/next sheets, open the original PDF.
   ============================================================ */
var MAG = window.MAG = window.MAG || {};

MAG.SheetViewer = (function () {
  var idx = 0, scale = 1, tx = 0, ty = 0, built = false;
  var wrap, img, capEl, pdfBtn, cntEl;

  function build() {
    if (built) return;
    built = true;
    var el = document.createElement("div");
    el.id = "sheet-viewer";
    el.innerHTML =
      '<div class="sv-top">' +
      '<div class="sv-cap"><span class="sv-sheetno" id="sv-sheetno"></span><span id="sv-cap"></span></div>' +
      '<div class="sv-actions">' +
      '<a class="chip" id="sv-pdf" href="#" target="_blank" rel="noopener">⤓&nbsp; Open original PDF</a>' +
      '<button class="chip" id="sv-fit">⛶&nbsp; Fit</button>' +
      '<button class="chip" id="sv-close">✕&nbsp; Close</button>' +
      "</div></div>" +
      '<div class="sv-stage" id="sv-stage"><img id="sv-img" alt="Proposal sheet" draggable="false"></div>' +
      '<button class="sv-arr prev" id="sv-prev" aria-label="Previous sheet">‹</button>' +
      '<button class="sv-arr next" id="sv-next" aria-label="Next sheet">›</button>' +
      '<div class="sv-count" id="sv-count"></div>' +
      '<div class="sv-hint">Scroll to zoom · drag to pan · double-click to toggle</div>';
    document.body.appendChild(el);

    wrap = document.getElementById("sv-stage");
    img = document.getElementById("sv-img");
    capEl = document.getElementById("sv-cap");
    pdfBtn = document.getElementById("sv-pdf");
    cntEl = document.getElementById("sv-count");

    document.getElementById("sv-close").addEventListener("click", close);
    document.getElementById("sv-fit").addEventListener("click", fit);
    document.getElementById("sv-prev").addEventListener("click", function () { show(idx - 1); });
    document.getElementById("sv-next").addEventListener("click", function () { show(idx + 1); });
    el.addEventListener("click", function (e) { if (e.target === wrap) close(); });

    /* zoom */
    wrap.addEventListener("wheel", function (e) {
      e.preventDefault(); e.stopPropagation();
      var r = wrap.getBoundingClientRect();
      var mx = e.clientX - r.left - r.width / 2, my = e.clientY - r.top - r.height / 2;
      var prev = scale;
      scale = Math.max(1, Math.min(8, scale * (1 - e.deltaY * .0016)));
      var k = scale / prev;
      tx = mx + (tx - mx) * k; ty = my + (ty - my) * k;
      if (scale === 1) { tx = 0; ty = 0; }
      apply();
    }, { passive: false });

    /* pan */
    var down = false, px = 0, py = 0;
    wrap.addEventListener("pointerdown", function (e) { down = true; px = e.clientX; py = e.clientY; wrap.classList.add("grabbing"); });
    addEventListener("pointermove", function (e) {
      if (!down) return;
      tx += e.clientX - px; ty += e.clientY - py;
      px = e.clientX; py = e.clientY;
      apply();
    });
    addEventListener("pointerup", function () { down = false; wrap.classList.remove("grabbing"); });

    wrap.addEventListener("dblclick", function (e) {
      if (scale > 1.05) { fit(); }
      else {
        var r = wrap.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2, my = e.clientY - r.top - r.height / 2;
        scale = 3; tx = -mx * 2; ty = -my * 2; apply();
      }
    });

    addEventListener("keydown", function (e) {
      if (!el.classList.contains("open")) return;
      if (e.key === "Escape") { e.stopPropagation(); close(); }
      else if (e.key === "ArrowRight") { e.stopPropagation(); show(idx + 1); }
      else if (e.key === "ArrowLeft") { e.stopPropagation(); show(idx - 1); }
    }, true);

    /* touch pinch */
    var pinch = null;
    wrap.addEventListener("touchstart", function (e) {
      if (e.touches.length === 2) pinch = dist(e);
    }, { passive: true });
    wrap.addEventListener("touchmove", function (e) {
      if (pinch && e.touches.length === 2) {
        var d = dist(e);
        scale = Math.max(1, Math.min(8, scale * d / pinch));
        pinch = d; apply();
      }
    }, { passive: true });
    wrap.addEventListener("touchend", function () { pinch = null; });
    function dist(e) { var a = e.touches[0], b = e.touches[1]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
  }

  function apply() {
    img.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + scale + ")";
  }
  function fit() { scale = 1; tx = 0; ty = 0; apply(); }

  function show(i) {
    var P = MAG.photos.packet;
    idx = (i + P.length) % P.length;
    var p = P[idx];
    img.src = p.img;
    document.getElementById("sv-sheetno").textContent = p.sheet;
    capEl.textContent = p.name + " — " + p.desc;
    pdfBtn.href = p.pdf;
    cntEl.textContent = (idx + 1) + " / " + P.length;
    fit();
  }

  function open(i) {
    build();
    document.getElementById("sheet-viewer").classList.add("open");
    show(i || 0);
  }
  function close() {
    var el = document.getElementById("sheet-viewer");
    if (el) el.classList.remove("open");
  }
  function isOpen() {
    var el = document.getElementById("sheet-viewer");
    return !!(el && el.classList.contains("open"));
  }

  return { open: open, close: close, isOpen: isOpen };
})();
