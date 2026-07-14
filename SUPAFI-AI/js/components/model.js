/* ============================================================
   MAG.Model — detailed parametric Three.js model of Magnolia Landing.
   Real geometry from the takeoff set: 277'-2" × 171'-0", grade→100'
   + penthouse to 115'-6". System view tabs isolate each envelope
   system with a camera preset + product card.
   ============================================================ */
var MAG = window.MAG = window.MAG || {};

MAG.Model = (function () {
  var inited = false, renderer, scene, camera, root, stage;
  var sysGroups = {};        /* sys key → [mesh] */
  var baseMats = {}, xrayMats = {}, ghostMat;
  var curView = "ov", interacting = false, lastInteract = 0;

  /* ---------- levels (relative to grade) ---------- */
  var LV = { L1: 1, L2: 12, L2O: 18, L3: 22, L4: 32, L5: 45.5, L6: 59, L7: 72.5, R: 87, PH: 101 };
  var LEN = 277.17, DEP = 171;
  var HX = LEN / 2, HZ = DEP / 2;      /* half extents: x ±138.6, z ±85.5 (north = -z, south = +z) */

  /* ---------- orbit rig ---------- */
  var rig = { az: 0.55, el: 0.34, r: 480, tx: 0, ty: 34, tz: 0 };
  var tween = null;
  function applyRig() {
    var ce = Math.cos(rig.el), x = rig.tx + rig.r * ce * Math.cos(rig.az),
        z = rig.tz + rig.r * ce * Math.sin(rig.az), y = rig.ty + rig.r * Math.sin(rig.el);
    camera.position.set(x, y, z);
    camera.lookAt(rig.tx, rig.ty, rig.tz);
  }
  function tweenTo(target, ms) {
    var from = { az: rig.az, el: rig.el, r: rig.r, tx: rig.tx, ty: rig.ty, tz: rig.tz };
    var t0 = performance.now();
    tween = function (now) {
      var t = Math.min(1, (now - t0) / (ms || 1400));
      var e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      Object.keys(from).forEach(function (k) { rig[k] = from[k] + (target[k] - from[k]) * e; });
      applyRig();
      if (t >= 1) tween = null;
    };
  }

  /* ---------- canvas textures ---------- */
  function canvasTex(w, h, draw, rx, ry) {
    var c = document.createElement("canvas"); c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (rx) t.repeat.set(rx, ry || rx);
    return t;
  }
  function woodTex() {
    return canvasTex(256, 256, function (g, w, h) {
      g.fillStyle = "#b58a5c"; g.fillRect(0, 0, w, h);
      for (var y = 0; y < h; y += 10) {
        g.fillStyle = "rgba(90,55,25," + (0.12 + Math.random() * .22) + ")";
        g.fillRect(0, y, w, 3 + Math.random() * 3);
        g.fillStyle = "rgba(255,225,180," + (0.05 + Math.random() * .08) + ")";
        g.fillRect(0, y + 6, w, 1.5);
      }
      for (var i = 0; i < 26; i++) {
        g.strokeStyle = "rgba(80,50,22," + (0.08 + Math.random() * .12) + ")";
        g.lineWidth = .8 + Math.random() * 1.4;
        g.beginPath();
        var yy = Math.random() * h;
        g.moveTo(0, yy); g.bezierCurveTo(w * .3, yy + 8, w * .6, yy - 8, w, yy + 4);
        g.stroke();
      }
    }, 3, 1);
  }
  function perfAlpha() {
    return canvasTex(128, 128, function (g, w, h) {
      g.fillStyle = "#fff"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#000";
      for (var y = 8; y < h; y += 16) for (var x = 8; x < w; x += 16) {
        g.beginPath(); g.arc(x + ((y / 16) % 2 ? 8 : 0), y, 5, 0, 7); g.fill();
      }
    }, 6, 3);
  }
  function pavTex() {
    return canvasTex(128, 128, function (g, w, h) {
      g.fillStyle = "#8e938c"; g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(40,45,40,.45)"; g.lineWidth = 2;
      for (var i = 0; i <= 4; i++) {
        g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke();
        g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.stroke();
      }
    }, 10, 10);
  }

  /* ---------- materials ---------- */
  function makeMats() {
    baseMats = {
      glass:   new THREE.MeshStandardMaterial({ color: 0xaccfc9, metalness: .9, roughness: .12, transparent: true, opacity: .78, envMapIntensity: 1 }),
      glassSf: new THREE.MeshStandardMaterial({ color: 0xc4d8d2, metalness: .85, roughness: .1, transparent: true, opacity: .66 }),
      spandrel:new THREE.MeshStandardMaterial({ color: 0x3c4a44, metalness: .55, roughness: .4 }),
      frame:   new THREE.MeshStandardMaterial({ color: 0x37423a, metalness: .45, roughness: .5 }),
      acm:     new THREE.MeshStandardMaterial({ color: 0x49564c, metalness: .62, roughness: .32 }),
      screen:  new THREE.MeshStandardMaterial({ color: 0x606c64, metalness: .5, roughness: .55, alphaMap: perfAlpha(), transparent: true, side: THREE.DoubleSide, alphaTest: .4 }),
      plank:   new THREE.MeshStandardMaterial({ map: woodTex(), metalness: .15, roughness: .6 }),
      white:   new THREE.MeshStandardMaterial({ color: 0xe9eae2, metalness: .3, roughness: .35 }),
      slab:    new THREE.MeshStandardMaterial({ color: 0x272e28, metalness: .2, roughness: .8 }),
      pavers:  new THREE.MeshStandardMaterial({ map: pavTex(), metalness: .1, roughness: .9 }),
      ground:  new THREE.MeshStandardMaterial({ color: 0x141813, roughness: 1 }),
      asphalt: new THREE.MeshStandardMaterial({ color: 0x1b1f1b, roughness: .95 }),
      green:   new THREE.MeshStandardMaterial({ color: 0x6f8f4e, roughness: .9 }),
      canopy:  new THREE.MeshStandardMaterial({ color: 0x2c3830, metalness: .5, roughness: .45 }),
      context: new THREE.MeshStandardMaterial({ color: 0x1d221d, roughness: .95 })
    };
    ghostMat = new THREE.MeshBasicMaterial({ color: 0x2a3b31, transparent: true, opacity: .055, depthWrite: false });
    var mk = function (hex, op) { return new THREE.MeshBasicMaterial({ color: hex, transparent: op < 1, opacity: op, side: THREE.DoubleSide }); };
    xrayMats = {
      cw: mk(0x4f8fe6, .82), sf: mk(0x4f8fe6, .6), ent: mk(0xf2f4f3, .95),
      acm: mk(0x56b06c, .9), screen: mk(0x98a1a5, .85), plank: mk(0xd9a441, .95),
      neutral: mk(0x1c221d, .25)
    };
  }

  /* ---------- helpers ---------- */
  function box(w, h, d, mat, x, y, z, sys, noShadow) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y + h / 2, z);
    if (!noShadow) { m.castShadow = true; m.receiveShadow = true; }
    tag(m, sys, mat);
    root.add(m);
    return m;
  }
  function tag(mesh, sys, mat) {
    mesh.userData.sys = sys || "neutral";
    mesh.userData.baseMat = mat;
    (sysGroups[mesh.userData.sys] = sysGroups[mesh.userData.sys] || []).push(mesh);
  }
  /* instanced fins along an axis */
  function fins(count, gap, w, h, d, mat, x0, y0, z0, dx, dz, sys) {
    var im = new THREE.InstancedMesh(new THREE.BoxGeometry(w, h, d), mat, count);
    var m4 = new THREE.Matrix4();
    for (var i = 0; i < count; i++) {
      m4.makeTranslation(x0 + dx * gap * i, y0 + h / 2, z0 + dz * gap * i);
      im.setMatrixAt(i, m4);
    }
    im.castShadow = true; im.receiveShadow = true;
    tag(im, sys, mat);
    root.add(im);
    return im;
  }

  /* glazed band: glass pane + vertical fins + head/sill frames.
     face: "s" | "n" | "e" | "w"; x/z = start coordinate along face */
  function band(face, from, to, y0, y1, opts) {
    opts = opts || {};
    var sys = opts.sys || "cw";
    var glassMat = opts.storefront ? baseMats.glassSf : baseMats.glass;
    var h = y1 - y0, len = to - from, t = .8;
    var g, finCount = Math.max(1, Math.round(len / (opts.gap || 5)));
    var finGap = len / finCount;
    if (face === "s" || face === "n") {
      var z = face === "s" ? HZ - (opts.inset || 0) : -HZ + (opts.inset || 0);
      g = box(len, h, t, glassMat, from + len / 2, y0, z, sys);
      fins(finCount + 1, finGap, .38, h, 1.5, baseMats.frame, from, y0, z, 1, 0, sys);
      box(len, .9, 1.6, baseMats.frame, from + len / 2, y1 - .9, z, sys);
      box(len, .9, 1.6, baseMats.frame, from + len / 2, y0, z, sys);
    } else {
      var x = face === "e" ? HX - (opts.inset || 0) : -HX + (opts.inset || 0);
      g = box(t, h, len, glassMat, x, y0, from + len / 2, sys);
      fins(finCount + 1, finGap, 1.5, h, .38, baseMats.frame, x, y0, from, 0, 1, sys);
      box(1.6, .9, len, baseMats.frame, x, y1 - .9, from + len / 2, sys);
      box(1.6, .9, len, baseMats.frame, x, y0, from + len / 2, sys);
    }
    return g;
  }
  /* ACM spandrel belt on a face */
  function belt(face, from, to, y, hh, inset) {
    var len = to - from;
    if (face === "s" || face === "n") {
      var z = face === "s" ? HZ - (inset || 0) : -HZ + (inset || 0);
      box(len, hh, 1.9, baseMats.acm, from + len / 2, y - hh / 2, z, "acm");
    } else {
      var x = face === "e" ? HX - (inset || 0) : -HX + (inset || 0);
      box(1.9, hh, len, baseMats.acm, x, y - hh / 2, from + len / 2, "acm");
    }
  }
  /* perforated screening panels along a face, one per structural bay */
  function screening(face, from, to, y0, y1, inset) {
    var len = to - from, bays = Math.max(1, Math.round(len / 30));
    var bw = len / bays, h = y1 - y0;
    for (var i = 0; i < bays; i++) {
      var cx = from + bw * i + bw / 2;
      var tilt = (i % 2 ? 1 : -1) * .015;
      var m;
      if (face === "s" || face === "n") {
        var z = face === "s" ? HZ - (inset || 0) : -HZ + (inset || 0);
        m = box(bw - 1.6, h, .5, baseMats.screen, cx, y0, z, "screen");
        m.rotation.y = tilt;
        fins(2, bw - 1.6, .7, h, 1.2, baseMats.frame, cx - (bw - 1.6) / 2, y0, z, 1, 0, "screen");
      } else {
        var x = face === "e" ? HX - (inset || 0) : -HX + (inset || 0);
        m = box(.5, h, bw - 1.6, baseMats.screen, x, y0, cx, "screen");
        m.rotation.y = tilt;
        fins(2, bw - 1.6, 1.2, h, .7, baseMats.frame, x, y0, cx - (bw - 1.6) / 2, 0, 1, "screen");
      }
    }
    /* mid belts */
    belt(face, from, to, (y0 + y1) / 2 + 1, 1.2, (inset || 0) - .2);
  }
  /* entrance portal (ES-9000 pair) */
  function entrance(face, at, w, opts) {
    opts = opts || {};
    var h = opts.h || 10.5, y0 = 0;
    var z = face === "s" ? HZ + .35 : -HZ - .35;
    /* white surround */
    box(w + 3, 1.4, 2.4, baseMats.white, at, h, z, "ent");
    box(1.4, h, 2.4, baseMats.white, at - w / 2 - 1, y0, z, "ent");
    box(1.4, h, 2.4, baseMats.white, at + w / 2 + 1, y0, z, "ent");
    /* door leaves */
    var leaves = opts.leaves || 2, lw = w / leaves;
    for (var i = 0; i < leaves; i++) {
      box(lw - .5, h - 1.2, .35, baseMats.glassSf, at - w / 2 + lw * i + lw / 2, y0, z, "ent");
      box(.22, h - 1.6, .5, baseMats.white, at - w / 2 + lw * i + lw - .35, y0 + .4, z + .3, "ent");
    }
    /* canopy blade */
    box(w + 8, .9, 7, baseMats.canopy, at, h + 2.2, z - (face === "s" ? 2.6 : -2.6), "ent");
  }

  /* ---------- build ---------- */
  function build() {
    root = new THREE.Group();
    scene.add(root);

    /* site */
    var g = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), baseMats.ground);
    g.rotation.x = -Math.PI / 2; g.receiveShadow = true; tag(g, "neutral", baseMats.ground); root.add(g);
    var road = box(760, .12, 34, baseMats.asphalt, 0, 0, HZ + 42, "neutral"); road.receiveShadow = true;
    box(34, .12, 500, baseMats.asphalt, HX + 44, .01, 0, "neutral");
    box(760, .16, 12, baseMats.pavers, 0, 0, HZ + 14, "neutral");
    /* context massing */
    [[-330, 60, -220, 24], [-180, 90, -260, 38], [120, 70, -240, 30], [320, 80, -180, 46], [-320, 76, 200, 20], [60, 110, 230, 34], [300, 90, 210, 26]].forEach(function (b) {
      box(b[1], b[3], b[1] * .8, baseMats.context, b[0], 0, b[2], "neutral");
    });

    /* ================= PODIUM (grade → L5) ================= */
    var stF = 12;
    /* L1 storefront ES-7525 — all faces */
    band("s", -HX + 2, -12, 0, stF, { storefront: true, sys: "sf", gap: 6, inset: 1.2 });
    band("s", 24, HX - 26, 0, stF, { storefront: true, sys: "sf", gap: 6, inset: 1.2 });
    band("n", -HX + 2, -20, 0, stF, { storefront: true, sys: "sf", gap: 6, inset: 1.2 });
    band("n", 16, HX - 2, 0, stF, { storefront: true, sys: "sf", gap: 6, inset: 1.2 });
    band("w", -HZ + 2, HZ - 2, 0, stF, { storefront: true, sys: "sf", gap: 6, inset: 1.2 });
    band("e", -HZ + 2, -14, 0, stF, { storefront: true, sys: "sf", gap: 6, inset: 1.2 });
    band("e", 12, HZ - 30, 0, stF, { storefront: true, sys: "sf", gap: 6, inset: 1.2 });
    /* entrances */
    entrance("s", 6, 12, { leaves: 3 });          /* main south lobby */
    entrance("s", -92, 8, {});                    /* retail pair */
    entrance("s", 96, 8, {});                     /* ES-46T terrace doors */
    entrance("n", -4, 12, { leaves: 3 });         /* north lobby */
    /* SE arcade columns */
    for (var i = 0; i < 5; i++) {
      var cyl = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, stF, 14), baseMats.frame);
      cyl.position.set(HX - 22 + 0 * i, stF / 2, HZ - 4 - i * 15);
      cyl.castShadow = true; tag(cyl, "neutral", baseMats.frame); root.add(cyl);
    }
    /* continuous canopy + landscaped band */
    box(LEN - 40, 1.1, 9, baseMats.canopy, -8, stF + .4, HZ - 2.5, "acm");
    box(150, 1.6, 7, baseMats.green, -20, stF + 1.6, HZ - 3.2, "neutral", true);
    box(60, 1.6, 7, baseMats.green, HX - 52, stF + 1.6, HZ - 3.2, "neutral", true);

    /* podium slabs L2/L3/L4 + cap at L5 */
    [LV.L2, LV.L3, LV.L4].forEach(function (y) {
      box(LEN, 1.3, DEP, baseMats.slab, 0, y - 1.3, 0, "neutral");
    });
    box(LEN + 2.4, 2.4, DEP + 2.4, baseMats.acm, 0, LV.L5 - 2.4, 0, "acm");

    /* parking levels — south face: screening grids 3–10 */
    screening("s", -HX + 46, HX - 20, LV.L2, LV.L5 - 2.6, .6);
    band("s", -HX + 2, -HX + 44, LV.L2, LV.L5 - 2.6, { gap: 5, inset: .8 });          /* west office bays */
    band("s", HX - 18, HX - 2, LV.L2, LV.L5 - 2.6, { gap: 5, inset: .8 });            /* east stair glazing */
    /* east face: screening + corner glass */
    screening("e", -HZ + 26, HZ - 16, LV.L2, LV.L5 - 2.6, .6);
    band("e", -HZ + 2, -HZ + 24, LV.L2, LV.L5 - 2.6, { gap: 5, inset: .8 });
    band("e", HZ - 14, HZ - 2, LV.L2, LV.L5 - 2.6, { gap: 5, inset: .8 });
    /* north face: glass with east screening segment */
    band("n", -HX + 2, 62, LV.L2, LV.L5 - 2.6, { gap: 5, inset: .8 });
    screening("n", 66, HX - 4, LV.L2, LV.L5 - 2.6, .6);
    /* west face: L2 office full glass */
    band("w", -HZ + 2, HZ - 2, LV.L2, LV.L5 - 2.6, { gap: 5, inset: .8 });

    /* ================= OFFICE LEVELS (L5–L7) ================= */
    /* plate strips forming the courtyard ring:
       courtyard x[-75,45] z[-45,25] · SE terrace notch x[80,HX] z[10,HZ] */
    var floors = [[LV.L5, LV.L6], [LV.L6, LV.L7], [LV.L7, LV.R]];
    function slabRect(x0, x1, z0, z1, y) {
      box(x1 - x0, 1.35, z1 - z0, baseMats.slab, (x0 + x1) / 2, y - 1.35, (z0 + z1) / 2, "neutral");
    }
    floors.forEach(function (f, fi) {
      var y0 = f[0], y1 = f[1];
      var lastFloor = fi === 2;
      /* east step: top floor pulls off the far east bay */
      var eEdge = lastFloor ? HX - 24 : HX;
      /* slabs */
      slabRect(-HX, eEdge, -HZ, -45, y0);                    /* north strip */
      slabRect(-HX, -75, -45, 25, y0);                       /* west strip */
      slabRect(45, eEdge, -45, 25, y0);                      /* east strip */
      slabRect(-HX, 80, 25, HZ, y0);                         /* south strip (minus SE notch) */
      if (!lastFloor) slabRect(80, eEdge, 25, 10 + 15, y0);  /* SE sliver to notch line */

      /* perimeter glazing GW-7000 with balcony recesses on south + west */
      var yg0 = y0 + .0, yg1 = y1 - 2.3;
      /* north face full */
      band("n", -HX + 2, eEdge - 2, yg0, yg1, { gap: 5, inset: .8 });
      /* west face with center recess */
      band("w", -HZ + 2, -22, yg0, yg1, { gap: 5, inset: .8 });
      band("w", -22, 22, yg0, yg1, { gap: 5, inset: 7 });    /* recessed balcony glass */
      band("w", 22, HZ - 2, yg0, yg1, { gap: 5, inset: .8 });
      /* south face with center recess */
      band("s", -HX + 2, -32, yg0, yg1, { gap: 5, inset: .8 });
      band("s", -32, 30, yg0, yg1, { gap: 5, inset: 7 });    /* recessed balcony glass */
      band("s", 32, (lastFloor ? 78 : 78), yg0, yg1, { gap: 5, inset: .8 });
      /* east face */
      band("e", -HZ + 2, 8, yg0, yg1, { gap: 5, inset: lastFloor ? 24.8 : .8 });
      /* courtyard walls */
      var cy0 = yg0, cy1 = yg1;
      box(120, cy1 - cy0, .7, baseMats.glass, -15, cy0, -45 + .4, "cw");
      box(120, cy1 - cy0, .7, baseMats.glass, -15, cy0, 25 - .4, "cw");
      box(.7, cy1 - cy0, 70, baseMats.glass, -75 + .4, cy0, -10, "cw");
      box(.7, cy1 - cy0, 70, baseMats.glass, 45 - .4, cy0, -10, "cw");

      /* balcony soffit planks + railings (south + west recesses) */
      box(62, .55, 6.4, baseMats.plank, -1, y1 - 2.9, HZ - 3.6, "plank");
      box(6.4, .55, 44, baseMats.plank, -HX + 3.6, y1 - 2.9, 0, "plank");
      /* gold accent fins at recess edges */
      fins(2, 62, .8, y1 - y0 - 2.3, .8, baseMats.plank, -32, y0, HZ - 1.2, 1, 0, "plank");
      /* railings */
      box(62, 3.4, .25, baseMats.frame, -1, y0 + .1, HZ - 1.1, "cw");
      box(.25, 3.4, 44, baseMats.frame, -HX + 1.1, y0 + .1, 0, "cw");

      /* ACM spandrel belts at slab edge */
      belt("n", -HX, eEdge, y0 + 2.3, 2.3, -.1);
      belt("s", -HX, 80, y0 + 2.3, 2.3, -.1);
      belt("w", -HZ, HZ, y0 + 2.3, 2.3, -.1);
      belt("e", -HZ, 10, y0 + 2.3, 2.3, lastFloor ? 23.9 : -.1);

      /* SE terraces: railing + pavers on notch roof */
      if (fi === 0) {
        box(58.6, .25, 75.5, baseMats.pavers, HX - 29.3, LV.L5, HZ - 37.75, "neutral");
        box(58.6, 3.2, .3, baseMats.frame, HX - 29.3, LV.L5 + .2, HZ - .5, "cw");
        box(.3, 3.2, 75.5, baseMats.frame, HX - .5, LV.L5 + .2, HZ - 37.75, "cw");
        [[-16, -18], [-40, -30], [-24, -58]].forEach(function (p) {
          box(9, 1.8, 9, baseMats.green, HX + p[0], LV.L5 + .25, HZ + p[1], "neutral", true);
          tree(HX + p[0], LV.L5 + 2, HZ + p[1], 4.5);
        });
      }
      if (lastFloor) { /* L7 east step terrace on L6 roof */
        box(23, .25, 128, baseMats.pavers, HX - 12.2, LV.L7, -HZ + 66, "neutral");
        box(.3, 3.2, 128, baseMats.frame, HX - .6, LV.L7 + .2, -HZ + 66, "cw");
      }
    });

    /* ================= ROOF + PENTHOUSE ================= */
    box(LEN, .3, DEP, baseMats.pavers, 0, LV.R, 0, "neutral");
    /* courtyard floor garden at L5 */
    box(118, .3, 68, baseMats.pavers, -15, LV.L5 + .05, -10, "neutral");
    [[-52, -30], [-20, 8], [16, -26], [30, 4], [-58, 6]].forEach(function (p) {
      box(12, 1.6, 12, baseMats.green, p[0], LV.L5 + .3, p[1], "neutral", true);
      tree(p[0], LV.L5 + 1.8, p[1], 5.5);
    });
    /* skylight monitor */
    box(34, 3.6, 12, baseMats.white, 4, LV.L5 + .3, -38, "neutral");
    box(32, 1.2, 10, baseMats.glassSf, 4, LV.L5 + 3.9, -38, "cw");
    /* parapets */
    [[0, -HZ + .8, LEN, "x"], [0, HZ - .8, LEN, "x"], [-HX + .8, 0, DEP, "z"], [HX - .8, 0, DEP, "z"]].forEach(function (p) {
      var m = p[3] === "x" ? box(p[2], 2.6, 1.4, baseMats.acm, p[0], LV.R, p[1], "acm") : box(1.4, 2.6, p[2], baseMats.acm, p[0], LV.R, p[1], "acm");
    });
    /* courtyard parapet */
    box(122, 2.6, 1.2, baseMats.acm, -15, LV.R, -46.2, "acm");
    box(122, 2.6, 1.2, baseMats.acm, -15, LV.R, 26.2, "acm");
    box(1.2, 2.6, 72, baseMats.acm, -76.2, LV.R, -10, "acm");
    box(1.2, 2.6, 72, baseMats.acm, 46.2, LV.R, -10, "acm");

    /* penthouse (ACM louvered) */
    var phx0 = -45, phx1 = 45, phz0 = -70, phz1 = -30, phH = LV.PH - LV.R;
    box(phx1 - phx0, phH, phz1 - phz0, baseMats.acm, (phx0 + phx1) / 2, LV.R, (phz0 + phz1) / 2, "acm");
    fins(30, (phx1 - phx0) / 30, .5, phH - 2, 1.6, baseMats.frame, phx0 + 1.5, LV.R + 1, phz1 + .3, 1, 0, "acm");
    fins(30, (phx1 - phx0) / 30, .5, phH - 2, 1.6, baseMats.frame, phx0 + 1.5, LV.R + 1, phz0 - .3, 1, 0, "acm");
    fins(14, (phz1 - phz0) / 14, 1.6, phH - 2, .5, baseMats.frame, phx1 + .3, LV.R + 1, phz0 + 1.5, 0, 1, "acm");
    fins(14, (phz1 - phz0) / 14, 1.6, phH - 2, .5, baseMats.frame, phx0 - .3, LV.R + 1, phz0 + 1.5, 0, 1, "acm");
    box(phx1 - phx0 + 3, 1.6, phz1 - phz0 + 3, baseMats.acm, (phx0 + phx1) / 2, LV.PH, (phz0 + phz1) / 2, "acm");

    /* street trees south */
    for (var tx = -120; tx <= 120; tx += 40) tree(tx, 0, HZ + 22, 7);
  }

  function tree(x, y, z, s) {
    var trunk = new THREE.Mesh(new THREE.CylinderGeometry(.35 * s / 5, .45 * s / 5, s * .8, 8),
      new THREE.MeshStandardMaterial({ color: 0x4a3b28, roughness: .9 }));
    trunk.position.set(x, y + s * .4, z); trunk.castShadow = true;
    var crown = new THREE.Mesh(new THREE.SphereGeometry(s * .62, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0x51683f, roughness: .95 }));
    crown.position.set(x, y + s * 1.15, z); crown.castShadow = true;
    crown.scale.y = .86;
    tag(trunk, "neutral", trunk.material); tag(crown, "neutral", crown.material);
    root.add(trunk); root.add(crown);
  }

  /* ---------- theme ---------- */
  function applyTheme() {
    if (!scene) return;
    var light = document.documentElement.dataset.theme === "light";
    scene.fog.color.set(light ? 0xdfe4da : 0x0b0e0c);
    baseMats.ground.color.set(light ? 0xcfd3c6 : 0x141813);
    baseMats.asphalt.color.set(light ? 0x9aa19a : 0x1b1f1b);
    baseMats.context.color.set(light ? 0xd7d9cd : 0x1d221d);
    ghostMat.color.set(light ? 0x8a958c : 0x2a3b31);
    ghostMat.opacity = light ? 0.12 : 0.055;
  }
  document.addEventListener("themechange", applyTheme);

  /* ---------- missile-zone overlay (X-Ray view) ---------- */
  var missileGroup;
  function missileOverlay(on) {
    if (!missileGroup) {
      missileGroup = new THREE.Group();
      var lm = new THREE.Mesh(new THREE.BoxGeometry(LEN + 10, 30 - 1, DEP + 10),
        new THREE.MeshBasicMaterial({ color: 0xc56a5c, transparent: true, opacity: .1, depthWrite: false }));
      lm.position.y = 1 + 29 / 2;
      var sm = new THREE.Mesh(new THREE.BoxGeometry(LEN + 10, 86 - 30, DEP + 10),
        new THREE.MeshBasicMaterial({ color: 0x5c9ec5, transparent: true, opacity: .07, depthWrite: false }));
      sm.position.y = 30 + 56 / 2;
      var ln = new THREE.Mesh(new THREE.BoxGeometry(LEN + 12, .4, DEP + 12),
        new THREE.MeshBasicMaterial({ color: 0xc56a5c }));
      ln.position.y = 30;
      missileGroup.add(lm); missileGroup.add(sm); missileGroup.add(ln);
      scene.add(missileGroup);
    }
    missileGroup.visible = !!on;
  }

  /* ---------- views ---------- */
  var VIEWS = {
    ov:  { name: "Overview",             keep: null, cam: { az: 0.78, el: 0.3, r: 430, tx: 0, ty: 36, tz: 0 },
           card: { tag: "Magnolia Landing", title: "Full envelope package", img: "assets/hero-axon.jpg",
                   items: ["277′-2″ × 171′-0″ overall", "Grade → 100′-0″ + penthouse to 115′-6″", "Curtainwall · entrances · ACM · screening · soffits"] } },
    cw:  { name: "Curtainwall — GW-7000", keep: ["cw", "plank"], cam: { az: 0.58, el: 0.16, r: 300, tx: -20, ty: 64, tz: 10 },
           card: { tag: "GW-7000 · Unitized", title: "Curtainwall system", img: "assets/detail-unitized.jpg",
                   items: ["7″ frame · 3½″ sightline · pre-glazed", "+100 / −140 PSF · water 15 PSF", "U 0.37 · large + small missile · Miami-Dade"] } },
    sf:  { name: "Storefront — ES-7525",  keep: ["sf", "ent"], cam: { az: 1.08, el: 0.07, r: 200, tx: 20, ty: 10, tz: 40 },
           card: { tag: "ES-7525 · Stick", title: "Base / retail storefront", img: "assets/detail-storefront.jpg",
                   items: ["7½″ mullion · 2½″ sightline · stick-built", "+100 / −100 PSF · water 20 PSF · U 0.37", "Impact + blast rated · GSA 2 / DoD Medium"] } },
    ent: { name: "Entrances — ES-9000 / ES-46T", keep: ["ent"], cam: { az: 1.38, el: 0.05, r: 110, tx: 6, ty: 8, tz: 60 },
           card: { tag: "ES-9000 / ES-46T", title: "Entrance systems", img: "assets/detail-entrance.jpg",
                   items: ["ES-9000: 5″ frame · 2¼″ leaf · ±120 PSF", "Doubles to 101″×120″ · 144″ H w/ transom", "ES-46T terrace door: 4½″ frame · U 0.44"] } },
    acm: { name: "ACM Panels",            keep: ["acm"], cam: { az: 2.35, el: 0.34, r: 360, tx: 0, ty: 52, tz: 0 },
           card: { tag: "Routed ACM / MCM", title: "Architectural metal panels", img: "assets/elev-west-acm.jpg",
                   items: ["Dual skins · PE or FR mineral core", "Custom green PVDF / Kynar finish", "Routed rainscreen · single-source with 1CG"] } },
    scr: { name: "Garage Screening",      keep: ["screen"], cam: { az: 0.72, el: 0.13, r: 280, tx: 30, ty: 30, tz: 30 },
           card: { tag: "Perforated metal", title: "Garage screening", img: "assets/detail-screening.jpg",
                   items: ["≈ 12,000 SF planning quantity", "Parking levels 2–4, south + east", "Openness per ventilation reqs"] } },
    plk: { name: "V-Plank Soffits",       keep: ["plank"], cam: { az: 1.25, el: 0.05, r: 150, tx: -10, ty: 58, tz: 55 },
           card: { tag: "6″ Mosaic V-Plank", title: "Wood-grain soffits", img: "assets/detail-plank.jpg",
                   items: ["≈ 2,600–2,700 SF cladding/soffit", "Balcony soffits + canopy bands", "Grain pending design assist"] } },
    xry: { name: "Scope X-Ray",           keep: "xray", cam: { az: 0.95, el: 0.4, r: 430, tx: 0, ty: 34, tz: 0 },
           card: { tag: "Scope legend", title: "Color-coded scope", img: "assets/legend-esw.jpg",
                   items: ["Blue — curtainwall / glazing", "Green — ACM · Gold — V-Plank", "Gray — screening · White — entrances"] } }
  };

  function setView(key) {
    curView = key;
    var v = VIEWS[key];
    if (renderer) {
      /* materials */
      Object.keys(sysGroups).forEach(function (sys) {
        sysGroups[sys].forEach(function (m) {
          if (v.keep === "xray") {
            m.material = xrayMats[sys] || xrayMats.neutral;
          } else if (!v.keep) {
            m.material = m.userData.baseMat;
          } else {
            m.material = (v.keep.indexOf(sys) > -1) ? m.userData.baseMat : ghostMat;
          }
        });
      });
      missileOverlay(key === "xry");
      tweenTo(v.cam, 1500);
    }
    /* hud + tabs + card */
    var nm = document.getElementById("model-view-name");
    if (nm) nm.textContent = v.name.toUpperCase();
    document.querySelectorAll("#model-tabs .mtab").forEach(function (b) { b.classList.toggle("cur", b.dataset.v === key); });
    var card = document.getElementById("model-card");
    if (card) {
      card.innerHTML =
        '<div class="pim" style="background-image:url(\'' + v.card.img + '\')"></div>' +
        '<div class="pbd"><div class="pt">' + v.card.tag + '</div><div class="pn">' + v.card.title + "</div>" +
        '<ul class="pd">' + v.card.items.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div>";
    }
  }

  function buildTabs() {
    var host = document.getElementById("model-tabs");
    var sw = { ov: "#7fa08c", cw: "#4f8fe6", sf: "#4f8fe6", ent: "#f2f4f3", acm: "#56b06c", scr: "#98a1a5", plk: "#d9a441", xry: "#c56a5c" };
    host.innerHTML = Object.keys(VIEWS).map(function (k) {
      var v = VIEWS[k];
      return '<button class="mtab" data-v="' + k + '"><span class="sw" style="background:' + sw[k] + '"></span>' +
        '<span><span class="t">' + v.name + '</span><br><span class="s">' + v.card.tag + "</span></span></button>";
    }).join("");
    host.querySelectorAll(".mtab").forEach(function (b) {
      b.addEventListener("click", function () { setView(b.dataset.v); });
    });
  }

  /* ---------- interaction ---------- */
  function bindOrbit() {
    var down = false, px = 0, py = 0;
    stage.addEventListener("pointerdown", function (e) { down = true; px = e.clientX; py = e.clientY; interacting = true; });
    addEventListener("pointermove", function (e) {
      if (!down) return;
      rig.az += (e.clientX - px) * .0056;
      rig.el = Math.max(.02, Math.min(1.35, rig.el + (e.clientY - py) * .004));
      px = e.clientX; py = e.clientY;
      tween = null; lastInteract = Date.now(); applyRig();
    });
    addEventListener("pointerup", function () { down = false; setTimeout(function () { interacting = false; }, 100); });
    stage.addEventListener("wheel", function (e) {
      e.preventDefault();
      rig.r = Math.max(60, Math.min(900, rig.r * (1 + e.deltaY * .0011)));
      tween = null; lastInteract = Date.now(); applyRig();
    }, { passive: false });
  }

  /* ---------- init / loop ---------- */
  function ensure() {
    if (inited) { resize(); return; }
    stage = document.getElementById("model-stage");
    if (!window.THREE) {
      /* offline fallback: keep tabs + product cards, show the drawing axon */
      inited = true;
      stage.insertAdjacentHTML("beforeend",
        '<div style="position:absolute;inset:0;background:#f0eee6 url(assets/hero-axon.jpg) center/contain no-repeat"></div>' +
        '<div style="position:absolute;left:14px;bottom:12px;font-family:var(--font-m);font-size:10px;letter-spacing:.14em;color:#3a423c;background:rgba(240,238,230,.85);padding:6px 10px;border-radius:5px">3-D RUNTIME UNAVAILABLE — SHOWING TAKEOFF AXONOMETRIC</div>');
      buildTabs();
      setView("ov");
      return;
    }
    inited = true;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stage.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0b0e0c, 700, 1500);
    camera = new THREE.PerspectiveCamera(38, 1, 1, 3000);

    var amb = new THREE.HemisphereLight(0xcfe4da, 0x0e120f, .85); scene.add(amb);
    var sun = new THREE.DirectionalLight(0xffeecf, 1.35);
    sun.position.set(-260, 340, 190);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -260; sun.shadow.camera.right = 260;
    sun.shadow.camera.top = 260; sun.shadow.camera.bottom = -260;
    sun.shadow.camera.far = 1100;
    sun.shadow.bias = -0.0004;
    scene.add(sun);
    var fill = new THREE.DirectionalLight(0x9fc0e8, .35); fill.position.set(220, 140, -240); scene.add(fill);

    makeMats();
    build();
    buildTabs();
    bindOrbit();
    resize();
    new ResizeObserver(resize).observe(stage);

    rig.r = 720; applyRig();
    applyTheme();
    setView("ov");

    (function loop(now) {
      requestAnimationFrame(loop);
      if (tween) tween(now || performance.now());
      else if (curView === "ov" && !interacting && Date.now() - lastInteract > 4000) {
        rig.az += .0009; applyRig();
      }
      renderer.render(scene, camera);
    })();

    document.addEventListener("beforedeckprint", function () {
      try {
        renderer.render(scene, camera);
        var img = document.getElementById("model-print-img");
        if (img) img.src = renderer.domElement.toDataURL("image/png");
      } catch (e) {}
    });
  }

  function resize() {
    if (!renderer || !stage) return;
    var w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  return { ensure: ensure, setView: setView };
})();
