/* ============================================================
   ProjectPhotoGrid — similar project experience cards.
   Name / Location / Relevant scope / Photo. Keeps all available images.
   ============================================================ */
var MAG = window.MAG = window.MAG || {};

MAG.PhotoGrid = (function () {
  function render(hostId) {
    var host = document.getElementById(hostId);
    host.innerHTML = MAG.experience.map(function (p, i) {
      return '<article class="exp-card" data-fx="' + Math.min(i + 1, 5) + '">' +
        '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy"' + (p.remote ? ' onerror="this.closest(\'.exp-card\').style.display=\'none\'"' : "") + ">" +
        '<div class="ov"></div>' +
        '<div class="tx"><div class="lc">' + p.loc + '</div><div class="nm">' + p.name + '</div><div class="sc">' + p.scope + "</div></div>" +
        "</article>";
    }).join("");
  }
  return { render: render };
})();
