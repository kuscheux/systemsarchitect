/* ============================================================
   CoordinationMatrix — simple Activity / Lead / Support / Status chart.
   Intentionally looks like a coordination chart, not software.
   ============================================================ */
var MAG = window.MAG = window.MAG || {};

MAG.Matrix = (function () {
  function cls(status) {
    var s = status.toLowerCase();
    if (s.indexOf("design assist") > -1) return "assist";
    if (s.indexOf("ongoing") > -1) return "ongoing";
    if (s.indexOf("future") > -1) return "future";
    return "";
  }
  function render(hostId) {
    var host = document.getElementById(hostId);
    host.innerHTML =
      '<table class="matrix-table">' +
      "<thead><tr><th>Activity</th><th>Lead</th><th>Support</th><th>Status</th></tr></thead><tbody>" +
      MAG.copy.matrix.rows.map(function (r2) {
        return "<tr>" +
          '<td class="act">' + r2.activity + "</td>" +
          '<td class="led">' + r2.lead + "</td>" +
          '<td class="sup">' + r2.support + "</td>" +
          '<td><span class="status-tag ' + cls(r2.status) + '">' + r2.status + "</span></td>" +
          "</tr>";
      }).join("") +
      "</tbody></table>";
  }
  return { render: render };
})();
