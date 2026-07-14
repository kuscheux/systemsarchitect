/* ============================================================
   SUPAFI-AI · model3d.js
   Parametric Three.js model of Magnolia generated from the
   same data that drives the blueprints. One renderer, many
   stages — chapters "claim" the canvas as you scroll.
   Modes: realistic · takeoff x-ray · missile zones · assembly.
   ============================================================ */

(function () {
  const O = SUPAFI.OVERALL;
  let renderer, scene, camera, canvasHost = null;
  let groups = {}, meshes = [], contextGrp, zonesGrp;
  let xrayOn = false, autoRotate = true, assembling = 1;
  let selectCb = null;

  /* ---------- utils ---------- */
  const shade = (hex, f) => {
    const c = parseInt(hex.slice(1), 16);
    const ch = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
    return (ch((c >> 16) & 255) << 16) | (ch((c >> 8) & 255) << 8) | ch(c & 255);
  };
  function woodTexture(hex) {
    const cv = document.createElement("canvas"); cv.width = 256; cv.height = 512;
    const g = cv.getContext("2d");
    g.fillStyle = hex; g.fillRect(0, 0, 256, 512);
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * 256, w = 1 + Math.random() * 3.5, a = 0.04 + Math.random() * 0.14;
      g.fillStyle = Math.random() > 0.42 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a * 0.7})`;
      g.fillRect(x, 0, w, 512);
    }
    for (let i = 0; i < 26; i++) { // plank joints
      g.fillStyle = "rgba(0,0,0,0.28)"; g.fillRect(i * 10.2, 0, 1, 512);
    }
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 1); t.anisotropy = 4;
    return t;
  }
  function perfTextures(hex) {
    const mk = (bg, dot) => {
      const cv = document.createElement("canvas"); cv.width = cv.height = 128;
      const g = cv.getContext("2d"); g.fillStyle = bg; g.fillRect(0, 0, 128, 128);
      g.fillStyle = dot;
      for (let y = 6; y < 128; y += 12) for (let x = 6 + ((y / 12) % 2) * 6; x < 128; x += 12) {
        g.beginPath(); g.arc(x, y, 3.4, 0, 7); g.fill();
      }
      const t = new THREE.CanvasTexture(cv);
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 6);
      return t;
    };
    return { map: mk(hex, "#" + shade(hex, 0.55).toString(16).padStart(6, "0")), alpha: mk("#ffffff", "#333333") };
  }
  function seamTexture(hex) {
    const cv = document.createElement("canvas"); cv.width = cv.height = 128;
    const g = cv.getContext("2d"); g.fillStyle = hex; g.fillRect(0, 0, 128, 128);
    g.fillStyle = `rgba(0,0,0,.3)`;
    for (let x = 0; x < 128; x += 16) g.fillRect(x, 0, 3, 128);
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 1);
    return t;
  }

  /* ---------- materials ---------- */
  const MATS = {};
  function buildMaterials() {
    MATS.glassSM = new THREE.MeshPhysicalMaterial({ color: 0xa9c9e6, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    MATS.glassLM = new THREE.MeshPhysicalMaterial({ color: 0x86aed2, roughness: 0.06, metalness: 0.15, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
    MATS.mullion = new THREE.MeshStandardMaterial({ color: 0x2f343a, roughness: 0.4, metalness: 0.7 });
    MATS.spandrel = new THREE.MeshStandardMaterial({ color: 0x453626, roughness: 0.35, metalness: 0.65 });
    MATS.plank = new THREE.MeshStandardMaterial({ map: woodTexture("#9a6b42"), roughness: 0.55, metalness: 0.15 });
    const p = perfTextures("#2e3236");
    MATS.screen = new THREE.MeshStandardMaterial({ map: p.map, alphaMap: p.alpha, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.55 });
    MATS.penthouse = new THREE.MeshStandardMaterial({ map: seamTexture("#3b2f26"), roughness: 0.45, metalness: 0.6 });
    MATS.concrete = new THREE.MeshStandardMaterial({ color: 0xd2d5d1, roughness: 0.9, metalness: 0 });
    MATS.masonry = new THREE.MeshStandardMaterial({ color: 0xe3d9c2, roughness: 0.95 });
    MATS.rail = new THREE.MeshStandardMaterial({ color: 0x6b7278, roughness: 0.35, metalness: 0.8 });
  }
  const XRAY = {
    glassSM: () => new THREE.MeshBasicMaterial({ color: 0xdcebf8, transparent: true, opacity: 0.4 }),
    glassLM: () => new THREE.MeshBasicMaterial({ color: 0xc3d9ef, transparent: true, opacity: 0.45 }),
    mullion: () => new THREE.MeshBasicMaterial({ color: 0xe020e8 }),
    spandrel: () => new THREE.MeshBasicMaterial({ color: 0xe020e8 }),
    plank: () => new THREE.MeshBasicMaterial({ color: 0xf0ec00 }),
    screen: () => new THREE.MeshBasicMaterial({ color: 0x2fbfb2, transparent: true, opacity: 0.85, side: THREE.DoubleSide }),
    penthouse: () => new THREE.MeshBasicMaterial({ color: 0xc924d1 }),
    concrete: () => new THREE.MeshBasicMaterial({ color: 0xf4f5f6, transparent: true, opacity: 0.6 }),
    masonry: () => new THREE.MeshBasicMaterial({ color: 0xefe9da }),
    rail: () => new THREE.MeshBasicMaterial({ color: 0x9aa2a8 }),
  };

  function box(w, h, d, x, y, z, matKey, sys, grp) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), MATS[matKey]);
    m.position.set(x + w / 2, y + h / 2, z + d / 2);
    m.castShadow = m.receiveShadow = true;
    m.userData = { sys: sys || matKey, matKey, h: y + h, baseY: y + h / 2 };
    (groups[grp || "misc"] = groups[grp || "misc"] || new THREE.Group()).add(m);
    meshes.push(m);
    return m;
  }

  /* ---------- the Magnolia parametric build ---------- */
  function buildBuilding() {
    const D = O.depth;
    /* Tower L1 storefront + canopies */
    box(111, 14.6, D - 2, 1, 0, 1, "glassLM", "glassLM", "glass");
    box(52, 2.6, 7, -2, 14.6, D, "spandrel", "spandrel", "spandrel");
    box(51, 2.6, 7, 62, 14.6, D, "spandrel", "spandrel", "spandrel");
    /* Floor bands + glass floors */
    const floors = [
      { y0: 17, y1: 29.5, sys: "glassLM" },
      { y0: 31.5, y1: 43, sys: "glassSM" },
      { y0: 45, y1: 56.5, sys: "glassSM" },
      { y0: 58.5, y1: 70, sys: "glassSM" },
      { y0: 72, y1: 84, sys: "glassSM" },
    ];
    [15, 29.5, 43, 56.5, 70, 84].forEach(y =>
      box(113.8, 2.1, D + 0.8, -0.4, y, -0.4, "spandrel", "spandrel", "spandrel"));
    floors.forEach(f => box(112, f.y1 - f.y0, D - 1, 0.5, f.y0, 0.5, f.sys, f.sys, "glass"));
    /* Mullions (front + back faces) */
    const mullGeo = new THREE.BoxGeometry(0.35, 1, 0.35);
    const count = Math.floor(113 / 5.65) + 1;
    floors.forEach(f => {
      const h = f.y1 - f.y0;
      for (let i = 0; i <= count; i++) {
        const x = i * 5.65;
        [D - 0.35, 0].forEach(z => {
          const m = new THREE.Mesh(mullGeo, MATS.mullion);
          m.scale.y = h; m.position.set(x + 0.2, f.y0 + h / 2, z + 0.18);
          m.userData = { sys: "spandrel", matKey: "mullion", h: f.y1, baseY: f.y0 + h / 2 };
          (groups.mullions = groups.mullions || new THREE.Group()).add(m); meshes.push(m);
        });
      }
    });
    /* Plank fascia bands — lower (116.7 sf) + upper bays (93.2 sf) */
    [[20, 92, 17.2], [20, 92, 31.7]].forEach(([x0, x1, y]) => {
      box(x1 - x0, 1.7, 1.1, x0, y, D + 0.1, "plank", "plank", "plank");
      box(x1 - x0, 1.7, 1.1, x0, y, -1.2, "plank", "plank", "plank");
    });
    [56.6, 70.1, 83.6].forEach(y => {
      [[4, 44.5], [68.5, 111]].forEach(([x0, x1]) => {
        box(x1 - x0, 1.6, 1.1, x0, y, D + 0.1, "plank", "plank", "plank");
        box(x1 - x0, 1.6, 1.1, x0, y, -1.2, "plank", "plank", "plank");
      });
    });
    /* Railings at office terraces */
    const postGeo = new THREE.BoxGeometry(0.14, 3.4, 0.14);
    [31.5, 45, 58.5, 72].forEach(y => {
      [[4, 43], [69, 109]].forEach(([x0, x1]) => {
        box(x1 - x0, 0.22, 0.22, x0, y + 3.3, D + 0.9, "rail", "rail", "rails");
        for (let x = x0; x <= x1; x += 1.35) {
          const p = new THREE.Mesh(postGeo, MATS.rail);
          p.position.set(x, y + 1.7, D + 1);
          p.userData = { sys: "rail", matKey: "rail", h: y + 3.4, baseY: y + 1.7 };
          (groups.rails = groups.rails || new THREE.Group()).add(p); meshes.push(p);
        }
      });
    });
    /* Penthouse + roof cap */
    box(34, 14, 34, 38, 86, 18, "penthouse", "penthouse", "penthouse");
    box(116, 1.6, D + 4, -1.5, 84.6, -2, "spandrel", "spandrel", "spandrel");
    /* Garage wing */
    box(56, 12.5, D - 4, 114, 0, 2, "glassLM", "glassLM", "glass");
    box(57.5, 32, D - 6, 113.4, 12.5, 3, "concrete", "concrete", "structure");
    box(56.5, 2.2, D + 0.6, 113.6, 12.6, -0.3, "spandrel", "spandrel", "spandrel");
    box(57.8, 2.4, D + 0.8, 113.4, 44.6, -0.4, "spandrel", "spandrel", "spandrel");
    /* Perf screens — front, back, end */
    box(56, 30, 0.4, 114, 14.6, D + 0.4, "screen", "screen", "screen");
    box(56, 30, 0.4, 114, 14.6, -0.8, "screen", "screen", "screen");
    box(0.4, 30, D - 4, 171.2, 14.6, 2, "screen", "screen", "screen");
    /* Wing terrace */
    box(54, 0.2, 0.2, 115, 47.6, D + 0.6, "rail", "rail", "rails");
    box(18, 7.5, 22, 150, 46.8, 8, "masonry", "masonry", "structure");
    /* Ground + context */
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.MeshStandardMaterial({ color: 0xe8ebe7, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.set(85, -0.01, 35); ground.receiveShadow = true;
    scene.add(ground);
    contextGrp = new THREE.Group();
    [[-90, 34, 60, 40], [-160, 22, -40, 50], [230, 46, -20, 55], [300, 28, 90, 45], [60, 18, -140, 70], [200, 24, 170, 60]].forEach(([x, h, z, w]) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w * 0.8), new THREE.MeshStandardMaterial({ color: 0xd7dbd8, roughness: 0.95, transparent: true, opacity: 0.85 }));
      b.position.set(x, h / 2, z); b.castShadow = b.receiveShadow = true; contextGrp.add(b);
    });
    scene.add(contextGrp);
    /* Missile zone overlays */
    zonesGrp = new THREE.Group(); zonesGrp.visible = false;
    const zl = new THREE.Mesh(new THREE.BoxGeometry(178, 30, O.depth + 14), new THREE.MeshBasicMaterial({ color: 0xe0301e, transparent: true, opacity: 0.13, depthWrite: false }));
    zl.position.set(85.5, 15, 35);
    const zs = new THREE.Mesh(new THREE.BoxGeometry(120, 56, O.depth + 14), new THREE.MeshBasicMaterial({ color: 0xf5a300, transparent: true, opacity: 0.1, depthWrite: false }));
    zs.position.set(56.5, 58, 35);
    zonesGrp.add(zl, zs); scene.add(zonesGrp);
    Object.values(groups).forEach(g => scene.add(g));
  }

  /* ---------- camera rig ---------- */
  const rig = { az: -0.6, el: 0.35, r: 265, target: new THREE.Vector3(85, 38, 35) };
  let tw = null;
  const PRESETS = {
    hero: { az: -0.6, el: 0.35, r: 265, target: [85, 38, 35] },
    front: { az: 0.02, el: 0.16, r: 225, target: [85, 42, 35] },
    corner: { az: 0.85, el: 0.3, r: 250, target: [85, 40, 35] },
    assembly: { az: -0.95, el: 0.42, r: 300, target: [85, 34, 35] },
    plank: { az: 0.12, el: 0.1, r: 95, target: [26, 58, 70] },
    screen: { az: 0.55, el: 0.14, r: 120, target: [142, 28, 70] },
    aerial: { az: -0.4, el: 1.05, r: 320, target: [85, 20, 35] },
  };
  function applyRig() {
    camera.position.set(
      rig.target.x + rig.r * Math.cos(rig.el) * Math.sin(rig.az),
      rig.target.y + rig.r * Math.sin(rig.el),
      rig.target.z + rig.r * Math.cos(rig.el) * Math.cos(rig.az),
    );
    camera.lookAt(rig.target);
  }
  function preset(name, dur = 1.4) {
    const p = PRESETS[name]; if (!p) return;
    const from = { az: rig.az, el: rig.el, r: rig.r, t: rig.target.clone() };
    const to = { az: p.az, el: p.el, r: p.r, t: new THREE.Vector3(...p.target) };
    const t0 = performance.now();
    tw = (now) => {
      let k = Math.min(1, (now - t0) / (dur * 1000));
      k = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      rig.az = from.az + (to.az - from.az) * k;
      rig.el = from.el + (to.el - from.el) * k;
      rig.r = from.r + (to.r - from.r) * k;
      rig.target.lerpVectors(from.t, to.t, k);
      if (k >= 1) tw = null;
    };
  }

  /* ---------- interaction ---------- */
  let dragging = false, px = 0, py = 0, interacted = 0;
  function bindInput(el) {
    el.addEventListener("pointerdown", (e) => { dragging = true; px = e.clientX; py = e.clientY; interacted = performance.now(); });
    addEventListener("pointerup", () => (dragging = false));
    addEventListener("pointermove", (e) => {
      if (!dragging) return;
      rig.az -= (e.clientX - px) * 0.006; rig.el = Math.min(1.35, Math.max(0.05, rig.el + (e.clientY - py) * 0.004));
      px = e.clientX; py = e.clientY; interacted = performance.now(); tw = null;
    });
    el.addEventListener("wheel", (e) => { e.preventDefault(); rig.r = Math.min(620, Math.max(45, rig.r * (1 + e.deltaY * 0.001))); interacted = performance.now(); }, { passive: false });
    const ray = new THREE.Raycaster(), v2 = new THREE.Vector2();
    el.addEventListener("click", (e) => {
      const b = el.getBoundingClientRect();
      v2.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
      ray.setFromCamera(v2, camera);
      const hit = ray.intersectObjects(meshes, false)[0];
      if (hit && selectCb) selectCb(hit.object.userData.sys, e);
    });
  }

  /* ---------- public API ---------- */
  window.Model3D = {
    init() {
      if (renderer || !window.THREE) return;
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0xeef1ee, 700, 1400);
      camera = new THREE.PerspectiveCamera(42, 1, 1, 3000);
      const hemi = new THREE.HemisphereLight(0xffffff, 0xd8dcd4, 0.95); scene.add(hemi);
      const sun = new THREE.DirectionalLight(0xfff3e0, 1.15);
      sun.position.set(-180, 260, 220); sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -260; sun.shadow.camera.right = 260;
      sun.shadow.camera.top = 260; sun.shadow.camera.bottom = -160;
      scene.add(sun);
      buildMaterials(); buildBuilding(); applyRig(); bindInput(renderer.domElement);
      const loop = (now) => {
        requestAnimationFrame(loop);
        if (tw) tw(now);
        else if (autoRotate && now - interacted > 2600) rig.az += 0.0012;
        applyRig();
        if (canvasHost) renderer.render(scene, camera);
      };
      requestAnimationFrame(loop);
      addEventListener("resize", () => this.resize());
    },
    mount(host, presetName) {
      this.init();
      if (!renderer) return;
      if (canvasHost !== host) { host.appendChild(renderer.domElement); canvasHost = host; this.resize(); }
      if (presetName) preset(presetName);
    },
    resize() {
      if (!canvasHost) return;
      const w = canvasHost.clientWidth || 800, h = canvasHost.clientHeight || 520;
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    },
    preset,
    setAutoRotate(v) { autoRotate = v; },
    onSelect(cb) { selectCb = cb; },
    assemble(t) {
      assembling = t;
      if (!renderer) return;
      const lim = t * 112;
      meshes.forEach(m => {
        const k = Math.min(1, Math.max(0, (lim - m.userData.h) / 9 + 1));
        m.visible = k > 0.02;
        m.position.y = m.userData.baseY + (1 - k) * 14;
        if (m.material.transparent !== true) m.material.transparent = false;
      });
    },
    xray(on) {
      if (!renderer) return;
      xrayOn = on;
      meshes.forEach(m => {
        if (on) { m.userData.realMat = m.material; m.material = (m.userData.xm = m.userData.xm || XRAY[m.userData.matKey]()); }
        else if (m.userData.realMat) m.material = m.userData.realMat;
      });
      scene.fog = on ? null : new THREE.Fog(0xeef1ee, 700, 1400);
      contextGrp.visible = !on;
      document.dispatchEvent(new CustomEvent("xray", { detail: on }));
    },
    isXray: () => xrayOn,
    missile(on) { zonesGrp.visible = on; },
    highlight(sys) {
      meshes.forEach(m => {
        const mat = m.material;
        if (!mat) return;
        const match = sys && m.userData.sys === sys;
        if (mat.emissive) mat.emissive.setHex(match ? 0x664400 : 0x000000);
        mat.opacity !== undefined && mat.transparent && (mat.opacity = m.userData.sys === "glassSM" || m.userData.sys === "glassLM" ? (sys && !match ? 0.25 : 0.5) : mat.opacity);
      });
    },
    setFinish(sysKey, finish) {
      if (!renderer) return;
      if (sysKey === "plank") { MATS.plank.map = woodTexture(finish.hex); MATS.plank.map.needsUpdate = true; MATS.plank.needsUpdate = true; }
      else if (sysKey === "screen") { const p = perfTextures(finish.hex); MATS.screen.map = p.map; MATS.screen.alphaMap = p.alpha; MATS.screen.needsUpdate = true; }
      else if (sysKey === "spandrel") { MATS.spandrel.color.setHex(parseInt(finish.hex.slice(1), 16)); }
      else if (sysKey === "penthouse") { MATS.penthouse.map = seamTexture(finish.hex); MATS.penthouse.needsUpdate = true; }
    },
    snapshot() { if (!renderer) return ""; renderer.render(scene, camera); return renderer.domElement.toDataURL("image/png"); },
  };
})();
