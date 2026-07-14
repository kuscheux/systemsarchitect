/* ============================================================
   MAGNOLIA — photo + drawing asset registry (all local unless noted)
   ============================================================ */
var MAG = window.MAG = window.MAG || {};

MAG.photos = {
  hero: "assets/hero-axon.jpg",
  closing: "assets/closing-axon.jpg",
  schedule: "assets/schedule-gantt.jpg",
  legend: "assets/legend-esw.jpg",
  details: {
    unitized: "assets/detail-unitized.jpg",
    storefront: "assets/detail-storefront.jpg",
    screening: "assets/detail-screening.jpg",
    plank: "assets/detail-plank.jpg",
    entrance: "assets/detail-entrance.jpg"
  },
  sheets: [
    { id: "s-window", name: "Window Takeoff — South",  img: "assets/elev-south-window.jpg" },
    { id: "n-window", name: "Window Takeoff — North",  img: "assets/elev-north-window.jpg" },
    { id: "e-window", name: "Window Takeoff — East",   img: "assets/elev-east-window.jpg" },
    { id: "w-window", name: "Window Takeoff — West",   img: "assets/elev-west-window.jpg" },
    { id: "sw-window",name: "Window Takeoff — SW",     img: "assets/elev-sw-window.jpg" },
    { id: "s-acm",    name: "ACM / Soffit — South",    img: "assets/elev-south-acm.jpg" },
    { id: "n-acm",    name: "ACM / Soffit — North",    img: "assets/elev-north-acm.jpg" },
    { id: "e-acm",    name: "ACM / Soffit — East",     img: "assets/elev-east-acm.jpg" },
    { id: "w-acm",    name: "ACM / Soffit — West",     img: "assets/elev-west-acm.jpg" }
  ],

  /* the proposal packet itself — full sheets + original PDFs */
  packet: [
    { sheet: "A0.21", name: "Preliminary Schedule",            desc: "SE axonometric + unitized CW installation schedule",
      img: "assets/sheets/sheet-2.jpg", thumb: "assets/sheets/thumb-2.jpg", pdf: "assets/pdf/A0.21-preliminary-schedule.pdf" },
    { sheet: "A4.01", name: "Window Takeoff — East / West",    desc: "ES-7525 stick + GW-7000 unitized zones, missile ratings",
      img: "assets/sheets/sheet-3.jpg", thumb: "assets/sheets/thumb-3.jpg", pdf: "assets/pdf/A4.01-window-takeoff-east-west.pdf" },
    { sheet: "A4.02", name: "Window Takeoff — North / South",  desc: "277′-2″ elevations, grids 1–12, glazing zones",
      img: "assets/sheets/sheet-4.jpg", thumb: "assets/sheets/thumb-4.jpg", pdf: "assets/pdf/A4.02-window-takeoff-north-south.pdf" },
    { sheet: "A4.01", name: "ACM / MP / Soffit — East / West", desc: "Plank bands, perf screening + soffit quantities",
      img: "assets/sheets/sheet-5.jpg", thumb: "assets/sheets/thumb-5.jpg", pdf: "assets/pdf/A4.01-acm-soffit-takeoff-east-west.pdf" },
    { sheet: "A4.02", name: "ACM / MP / Soffit — North / South", desc: "V-Plank runs + primary garage screening band",
      img: "assets/sheets/sheet-6.jpg", thumb: "assets/sheets/thumb-6.jpg", pdf: "assets/pdf/A4.02-acm-soffit-takeoff-north-south.pdf" }
  ]
};
