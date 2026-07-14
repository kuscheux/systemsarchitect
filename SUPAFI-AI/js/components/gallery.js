/* ============================================================
   MaterialGallery — design-assist review gallery + modal.
   Review only: no Approve / Select Final / Submit / Signoff.
   ============================================================ */
var MAG = window.MAG = window.MAG || {};

MAG.MaterialGallery = (function () {
  function swatchStyle(opt) {
    if (opt.thumb) return 'style="background-image:url(\'' + opt.thumb + '\');background-color:' + opt.hex + '"';
    return 'style="background-color:' + opt.hex + '"';
  }

  function render(hostId) {
    var host = document.getElementById(hostId);
    host.innerHTML = MAG.materialAreas.map(function (area, ai) {
      return '<div class="mat-area" data-fx="' + Math.min(ai + 1, 5) + '">' +
        "<h4>" + area.title + "</h4>" +
        '<div class="use">' + area.use + "</div>" +
        '<div class="swatches">' + area.options.map(function (o, oi) {
          return '<button class="swatch" data-area="' + ai + '" data-opt="' + oi + '" ' + swatchStyle(o) + ' aria-label="' + o.name + '">' +
            (o.perf ? '<span class="perf-dots"></span>' : "") +
            (o.glass ? '<span class="gl-sheen"></span>' : "") +
            "</button>";
        }).join("") + "</div>" +
        '<div class="mat-status">' + MAG.materialStatus + "</div>" +
        "</div>";
    }).join("");

    host.querySelectorAll(".swatch").forEach(function (b) {
      b.addEventListener("click", function () {
        openModal(+b.dataset.area, +b.dataset.opt);
      });
    });
  }

  function openModal(ai, oi) {
    var area = MAG.materialAreas[ai], opt = area.options[oi];
    var m = document.getElementById("mat-modal");
    var bigStyle = opt.thumb
      ? "background-image:url('" + opt.thumb + "');background-color:" + opt.hex
      : "background-color:" + opt.hex;
    m.innerHTML =
      '<button class="mat-close" aria-label="Close">×</button>' +
      '<div class="mat-dialog">' +
      '<div class="big" style="' + bigStyle + '">' +
      (opt.perf ? '<span class="perf-dots"></span>' : "") +
      (opt.glass ? '<span class="gl-sheen"></span>' : "") +
      "</div>" +
      '<div class="info">' +
      '<span class="area">' + area.title + "</span>" +
      "<h3>" + opt.name + "</h3>" +
      '<p class="desc">' + area.blurb + "</p>" +
      '<p class="locn"><b>Potential use location:</b><br>' + area.use + " · " + area.sysTag + "</p>" +
      '<span class="status-pill">' + MAG.materialStatus + "</span>" +
      "</div></div>";
    m.classList.add("open");
    m.querySelector(".mat-close").onclick = close;
    m.onclick = function (e) { if (e.target === m) close(); };
    function close() { m.classList.remove("open"); }
  }

  return { render: render };
})();
