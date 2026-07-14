/* ============================================================
   SUPAFI-AI · app.js
   The experience conductor. Not slides — one continuous
   scroll spine (the timeline stepper) with curtain-grade
   transitions, blueprint ↔ 3D flips, scroll-driven model
   assembly, the material lab, and presentation mode.
   ============================================================ */

(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const on = (el, ev, fn) => el && el.addEventListener(ev, fn);
  const fmt = (n) => n.toLocaleString(undefined, { maximumFractionDigits: 1 });

  const App = (window.App = {});
  let currentChapter = null;
  let modelChapterHost = null;

  /* ================= ROLE GATE ================= */
  function roleGate() {
    const grid = $("#role-grid");
    grid.innerHTML = SUPAFI.ROLES.map((r, i) => `
      <button class="role-card" data-role="${r.id}" style="--i:${i}">
        <span class="role-ico">${r.icon}</span>
        <span class="role-name">${r.name}</span>
        <span class="role-desc">${r.desc}</span>
        <span class="role-perms">${Object.entries(r.perms).filter(([, v]) => v).map(([k]) => k.replace(/([A-Z])/g, " $1").toLowerCase()).join(" · ") || "view only"}</span>
      </button>`).join("") + `
      <div class="role-card role-locked" style="--i:${SUPAFI.ROLES.length}">
        <span class="role-ico">🔒</span><span class="role-name">Concrete · MEP · Roofing…</span>
        <span class="role-desc">Every trade gets a seat. Glazing & cladding went first.</span>
      </div>`;
    Curtains.enter($$(".role-card"), { step: 0.06, rise: 30 });
    $$(".role-card[data-role]").forEach(c =>
      on(c, "click", async (e) => {
        CRM.setRole(SUPAFI.ROLES.find(r => r.id === c.dataset.role));
        $("#hdr-role").textContent = CRM.role.name;
        await Curtains.irisFromClick(e, () => {
          $("#gate").classList.add("hidden");
          $("#app").classList.remove("hidden");
          boot();
        });
      }));
  }

  /* ================= STEPPER RAIL ================= */
  function buildStepper() {
    const rail = $("#stepper");
    rail.innerHTML = `<div class="step-progress"><span id="step-fill"></span></div>` +
      SUPAFI.CHAPTERS.map(c => `
        <button class="step" data-target="${c.id}">
          <span class="step-num">${c.num}</span>
          <span class="step-dot"></span>
          <span class="step-label">${c.label}</span>
        </button>`).join("");
    $$(".step", rail).forEach(s =>
      on(s, "click", async () => {
        const ch = SUPAFI.CHAPTERS.find(c => c.id === s.dataset.target);
        await Curtains.transition(ch.curtain, () => {
          document.getElementById(ch.id).scrollIntoView({ behavior: "instant", block: "start" });
        });
      }));
    /* progress fill + active state */
    const spine = $("#chapters");
    const update = () => {
      const max = spine.scrollHeight - innerHeight;
      const k = Math.min(1, Math.max(0, scrollY / max));
      $("#step-fill").style.height = (k * 100).toFixed(2) + "%";
    };
    addEventListener("scroll", update, { passive: true }); update();
    const io = new IntersectionObserver((ents) => {
      ents.forEach(e => {
        if (!e.isIntersecting) return;
        currentChapter = e.target.id;
        $$(".step", rail).forEach(s => s.classList.toggle("active", s.dataset.target === e.target.id));
        chapterEnter(e.target.id);
      });
    }, { rootMargin: "-42% 0px -42% 0px" });
    $$(".chapter").forEach(c => io.observe(c));
  }

  /* ================= CHAPTER CONTENT ================= */
  function headerHtml(ch, kicker) {
    return `<header class="ch-head">
      <span class="ch-kicker">${ch.num} — ${kicker}</span>
      <h2 class="ch-title">${ch.title}</h2>
    </header>`;
  }

  function buildChapters() {
    const C = Object.fromEntries(SUPAFI.CHAPTERS.map(c => [c.id, c]));

    /* 01 · MAP */
    $("#ch-map").innerHTML = `
      <div class="map-stage"><div id="map"></div>
        <div class="map-card glass-panel">
          ${headerHtml(C["ch-map"], "Project pinned")}
          <p class="lede">Magnolia drops onto the same living map as every delivered 1CG project —
          but amber means <b>pending</b>. The pin is the project: CRM, takeoff, model and
          presentation all hang off it.</p>
          <div class="fact-grid">${SUPAFI.MAGNOLIA.facts.map(f => `<div class="fact"><span>${f.k}</span><b>${f.v}</b></div>`).join("")}</div>
          <div class="map-cta"><span class="pulse-chip">● PENDING AWARD</span><span>${SUPAFI.MAGNOLIA.location}</span></div>
        </div>
      </div>`;

    /* 02 · INTAKE */
    $("#ch-intake").innerHTML = `
      <div class="ch-inner">
        ${headerHtml(C["ch-intake"], "Single source intake")}
        <p class="lede">Eight elevation studies hit the platform and became vectors — every band, panel
        and datum re-drawn from the extracted geometry. Hover a system; the whole platform answers.</p>
        <div class="bp-strip" id="bp-strip"></div>
        <div class="dropzone" id="dropzone">
          <b>Drop more sheets & detail photos</b>
          <span>PDF crops, head/sill details, field shots — everything joins the single source.</span>
          <input type="file" id="file-in" accept="image/*" multiple hidden>
        </div>
      </div>`;

    /* 03 · TAKEOFF */
    $("#ch-takeoff").innerHTML = `
      <div class="ch-inner wide">
        ${headerHtml(C["ch-takeoff"], "Auto-extracted quantities")}
        <div class="stage-host" data-flip="staggerWipe" id="host-takeoff">
          <div class="pane pane-bp active"></div>
          <div class="pane pane-model"></div>
          <div class="flip-tabs"><button class="on" data-pane="bp">Blueprint</button><button data-pane="model">3D</button></div>
        </div>
        <div class="takeoff-rows" id="takeoff-rows"></div>
        <p class="fineprint">Quantities auto-extracted from the A5 elevation set. Verify against contract documents before bid day.</p>
      </div>`;

    /* 04 · MODEL */
    $("#ch-model").innerHTML = `
      <div class="model-track">
        <div class="model-sticky">
          <div class="model-hud">
            ${headerHtml(C["ch-model"], "Parametric assembly")}
            <div class="hud-level"><span>BUILDING TO</span><b id="hud-level">LEVEL P1</b><i id="hud-el">EL 14'-6"</i></div>
            <div class="hud-btns">
              <button id="btn-xray" class="hud-btn">Takeoff X-Ray</button>
              <button id="btn-missile" class="hud-btn">Missile Zones</button>
              <button id="btn-spin" class="hud-btn on">Auto-orbit</button>
            </div>
            <div class="hud-hint">drag to orbit · scroll page to build · click a system to inspect</div>
          </div>
          <div class="model-host" id="host-model"></div>
          <div class="sys-chip" id="sys-chip"></div>
        </div>
      </div>`;

    /* 05 · MATERIALS */
    $("#ch-materials").innerHTML = `
      <div class="ch-inner wide">
        ${headerHtml(C["ch-materials"], "Lumabuilt live finishes")}
        <div class="mat-layout">
          <div class="stage-host" data-flip="shutter" id="host-materials">
            <div class="pane pane-model active"></div>
            <div class="pane pane-bp"></div>
            <div class="flip-tabs"><button data-pane="bp">Blueprint</button><button class="on" data-pane="model">3D</button></div>
          </div>
          <aside class="mat-panel glass-panel">
            <div class="mat-sys" id="mat-sys"></div>
            <div class="mat-groups" id="mat-groups"></div>
            <div class="swatches" id="swatches"></div>
            <div class="mat-current" id="mat-current"></div>
            <a class="mat-link" href="https://lumabuilt.com/colors-finishes/?tab=Woodgrains" target="_blank" rel="noreferrer">lumabuilt.com colors & finishes ↗</a>
          </aside>
        </div>
      </div>`;

    /* 06 · SCOPE */
    $("#ch-scope").innerHTML = `
      <div class="ch-inner wide">
        ${headerHtml(C["ch-scope"], "Window types & ratings")}
        <div class="scope-layout">
          <div class="stage-host" data-flip="iris" id="host-scope">
            <div class="pane pane-bp active"></div>
            <div class="pane pane-model"></div>
            <div class="flip-tabs"><button class="on" data-pane="bp">Blueprint</button><button data-pane="model">3D</button></div>
          </div>
          <div class="type-grid" id="type-grid"></div>
        </div>
      </div>`;

    /* 07 · CRM */
    $("#ch-crm").innerHTML = `
      <div class="ch-inner wide">
        ${headerHtml(C["ch-crm"], "Pipeline · pending award")}
        <div class="pl-track" id="crm-status"></div>
        <div class="crm-grid">
          <section class="glass-panel"><h3>Deal</h3><div id="crm-facts"></div></section>
          <section class="glass-panel"><h3>Contacts</h3><div id="crm-contacts"></div>
            <p class="fineprint">Connect HubSpot / Salesforce / Supabase later — this deal object is the schema.</p></section>
          <section class="glass-panel act-panel"><h3>Activity</h3><div id="crm-activity"></div></section>
          <section class="glass-panel"><h3>Field notes</h3>
            <div id="crm-notes"></div>
            <form id="note-form"><input id="note-in" placeholder="Add a note (role-gated)…" autocomplete="off"><button>Add</button></form>
          </section>
          <section class="glass-panel photos-panel"><h3>Detail photos — single source</h3>
            <div class="photo-grid" id="photo-grid"></div>
            <button class="hud-btn" id="btn-more-photos">+ Upload details</button>
          </section>
        </div>
      </div>`;

    /* 08 · PRESENT */
    $("#ch-present").innerHTML = `
      <div class="ch-inner center">
        ${headerHtml(C["ch-present"], "Glazier-grade deliverable")}
        <p class="lede">Everything above compiles into one client-facing package: the pin, the model,
        the takeoff, the finishes, the schedule of types. One company. One package.</p>
        <button class="present-btn" id="btn-present">Open presentation</button>
        <span class="fineprint">Print → PDF straight from the presentation view.</span>
      </div>`;
  }

  /* ---------- populate dynamic pieces ---------- */
  function populate() {
    /* blueprints strip */
    const strip = $("#bp-strip");
    [["east", "1 · EAST ELEVATION"], ["west", "2 · WEST ELEVATION"], ["south", "3 · SOUTH — GARAGE"]].forEach(([v, cap]) => {
      const card = document.createElement("figure");
      card.className = "bp-card";
      card.appendChild(Blueprint.render(v));
      const c = document.createElement("figcaption"); c.textContent = cap; card.appendChild(c);
      strip.appendChild(card);
    });
    /* takeoff rows */
    const rows = $("#takeoff-rows");
    rows.innerHTML = Object.values(SUPAFI.SYSTEMS).map(s => {
      const tot = SUPAFI.totalFor(s.key);
      if (!tot) return "";
      const brk = SUPAFI.TAKEOFF.filter(t => t.sys === s.key)
        .map(t => `${t.elev}: ${t.items.map(i => `${i.qty > 1 ? i.qty + "× " : ""}${fmt(i.sf)} sf${i.est ? "*" : ""}`).join(" · ")}`).join("  |  ");
      return `<div class="t-row" data-sys="${s.key}">
        <span class="t-swatch" style="--c:${s.color}"></span>
        <div class="t-meta"><b>${s.name}</b><span>${s.vendor} — ${s.note}</span><i>${brk}</i></div>
        <div class="t-num" data-count="${tot.toFixed(1)}">0<small> sf</small></div>
      </div>`;
    }).join("");
    $$(".t-row").forEach(r => {
      on(r, "pointerenter", () => Model3D.highlight(r.dataset.sys));
      on(r, "pointerleave", () => Model3D.highlight(null));
    });
    /* blueprint panes for flip hosts */
    $(".pane-bp", $("#host-takeoff")).appendChild(Blueprint.render("east"));
    $(".pane-bp", $("#host-materials")).appendChild(Blueprint.render("west"));
    $(".pane-bp", $("#host-scope")).appendChild(Blueprint.render("south"));
    /* types */
    $("#type-grid").innerHTML = SUPAFI.TYPES.map((t, i) => `
      <article class="type-card" style="--i:${i}" data-sys="${t.sysRef}">
        <header><b class="type-tag">${t.tag}</b><span class="type-rating ${/missile/i.test(t.rating) ? "hot" : ""}">${t.rating}</span></header>
        <h4>${t.name}</h4><p>${t.zone}</p><footer>${t.bod}</footer>
      </article>`).join("");
    $$(".type-card").forEach(c => {
      on(c, "pointerenter", () => Model3D.highlight(c.dataset.sys));
      on(c, "pointerleave", () => Model3D.highlight(null));
    });
    /* material lab */
    buildMaterialLab();
  }

  /* ---------- material lab ---------- */
  let matSys = "plank", matGroup = "Woodgrains";
  function buildMaterialLab() {
    const finishable = Object.values(SUPAFI.SYSTEMS).filter(s => s.finishable);
    $("#mat-sys").innerHTML = finishable.map(s =>
      `<button class="chip ${s.key === matSys ? "on" : ""}" data-sys="${s.key}">${s.name}</button>`).join("");
    const groups = [...new Set(SUPAFI.FINISHES.map(f => f.group))];
    $("#mat-groups").innerHTML = groups.map(g =>
      `<button class="chip ghost ${g === matGroup ? "on" : ""}" data-group="${g}">${g}</button>`).join("");
    renderSwatches();
    on($("#mat-sys"), "click", (e) => {
      const b = e.target.closest("[data-sys]"); if (!b) return;
      matSys = b.dataset.sys;
      $$("#mat-sys .chip").forEach(c => c.classList.toggle("on", c === b));
      renderSwatches();
    });
    on($("#mat-groups"), "click", (e) => {
      const b = e.target.closest("[data-group]"); if (!b) return;
      matGroup = b.dataset.group;
      $$("#mat-groups .chip").forEach(c => c.classList.toggle("on", c === b));
      renderSwatches();
    });
  }
  function renderSwatches() {
    const sel = CRM.state.finishes[matSys] || SUPAFI.SYSTEMS[matSys].defaultFinish;
    $("#swatches").innerHTML = SUPAFI.FINISHES.filter(f => f.group === matGroup).map(f => `
      <button class="swatch ${f.id === sel ? "on" : ""}" data-id="${f.id}" title="${f.name}">
        <img src="${f.thumb}" alt="" loading="lazy" onerror="this.remove()">
        <span class="sw-fill" style="background:${f.hex}"></span>
        <span class="sw-name">${f.name}${f.v ? " · " + f.v : ""}</span>
      </button>`).join("");
    updateCurrent();
    $$("#swatches .swatch").forEach(s =>
      on(s, "click", () => {
        if (!CRM.can("changeFinishes")) { flashChip("Finish changes are role-gated — ask a PM/estimator."); return; }
        const f = SUPAFI.finishById(s.dataset.id);
        Model3D.setFinish(matSys, f);
        CRM.setFinish(matSys, f.id);
        $$("#swatches .swatch").forEach(x => x.classList.toggle("on", x === s));
        updateCurrent();
        CRM.addActivity("🎨", `${SUPAFI.SYSTEMS[matSys].name} → ${f.name}`);
      }));
  }
  function updateCurrent() {
    const id = CRM.state.finishes[matSys] || SUPAFI.SYSTEMS[matSys].defaultFinish;
    const f = SUPAFI.finishById(id);
    $("#mat-current").innerHTML = `<span class="sw-fill big" style="background:${f.hex}"></span>
      <div><b>${SUPAFI.SYSTEMS[matSys].name}</b><span>${f.name} — Lumabuilt ${f.group}${f.v ? " · " + f.v + " variance" : ""}</span></div>`;
  }
  function applySavedFinishes() {
    Object.values(SUPAFI.SYSTEMS).filter(s => s.finishable).forEach(s => {
      const f = SUPAFI.finishById(CRM.state.finishes[s.key] || s.defaultFinish);
      Model3D.setFinish(s.key, f);
    });
  }

  /* ---------- flip hosts (blueprint ↔ 3D) ---------- */
  const MODEL_PRESET = { "host-takeoff": "front", "host-materials": "plank", "host-scope": "screen" };
  function bindFlips() {
    $$(".stage-host").forEach(host => {
      on($(".flip-tabs", host), "click", (e) => {
        const btn = e.target.closest("[data-pane]"); if (!btn || btn.classList.contains("on")) return;
        const effect = host.dataset.flip;
        Curtains.flip(host, effect, () => {
          $$(".flip-tabs button", host).forEach(b => b.classList.toggle("on", b === btn));
          $$(".pane", host).forEach(p => p.classList.toggle("active", p.classList.contains("pane-" + btn.dataset.pane)));
          if (btn.dataset.pane === "model") {
            Model3D.mount($(".pane-model", host), MODEL_PRESET[host.id] || "hero");
            Model3D.resize();
          }
        });
      });
    });
  }

  /* ---------- chapter enter choreography ---------- */
  const entered = new Set();
  function chapterEnter(id) {
    if (id === "ch-map") { SupafiMap.resize(); if (!entered.has(id)) setTimeout(() => SupafiMap.flyToMagnolia(), 700); }
    if (id === "ch-model") { Model3D.mount($("#host-model"), entered.has(id) ? undefined : "assembly"); Model3D.resize(); }
    if (id === "ch-materials") {
      const pane = $("#host-materials .pane-model");
      if (pane.classList.contains("active")) { Model3D.mount(pane, "plank"); Model3D.resize(); }
    }
    if (id === "ch-scope" && !entered.has(id)) Curtains.enter($$(".type-card"), { step: 0.05, rise: 34 });
    if (id === "ch-takeoff" && !entered.has(id)) runCounters();
    if (id === "ch-crm") CRM.renderAll();
    if (!entered.has(id) && id !== "ch-map") {
      const head = $("#" + id + " .ch-head");
      head && Curtains.enter([head], { rise: 20 });
    }
    entered.add(id);
  }

  function runCounters() {
    $$(".t-num").forEach(n => {
      const target = parseFloat(n.dataset.count);
      const t0 = performance.now();
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / 1400);
        const e = 1 - Math.pow(1 - k, 3);
        n.firstChild.textContent = fmt(target * e);
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ---------- scroll-driven model assembly ---------- */
  function bindAssembly() {
    const track = $("#ch-model");
    const levels = SUPAFI.LEVELS.filter(l => l.rel >= 0);
    const drive = (k) => {
      Model3D.assemble(0.06 + k * 0.94);
      const h = (0.06 + k * 0.94) * 100;
      const lv = [...levels].reverse().find(l => l.rel <= h) || levels[0];
      $("#hud-level").textContent = lv.name.split("—")[0].trim().toUpperCase();
      $("#hud-el").textContent = "EL " + Math.floor(lv.el) + "'-" + (lv.el % 1 ? "6\"" : "0\"");
    };
    if (window.Motion && Motion.scroll) {
      Motion.scroll((p) => drive(typeof p === "number" ? p : p.y.progress), { target: track, offset: ["start end", "end start"] });
    } else {
      addEventListener("scroll", () => {
        const r = track.getBoundingClientRect();
        const k = Math.min(1, Math.max(0, (innerHeight - r.top) / (r.height + innerHeight)));
        drive(k);
      }, { passive: true });
    }
  }

  /* ---------- HUD / selection ---------- */
  function bindHud() {
    on($("#btn-xray"), "click", () => { const v = !Model3D.isXray(); Model3D.xray(v); $("#btn-xray").classList.toggle("on", v); });
    on($("#btn-missile"), "click", function () { this.classList.toggle("on"); Model3D.missile(this.classList.contains("on")); });
    on($("#btn-spin"), "click", function () { this.classList.toggle("on"); Model3D.setAutoRotate(this.classList.contains("on")); });
    Model3D.onSelect((sys) => {
      const s = SUPAFI.SYSTEMS[sys];
      if (!s) return flashChip("Structure / site element");
      const tot = SUPAFI.totalFor(sys);
      flashChip(`<b>${s.name}</b> — ${s.vendor}${tot ? ` · ${fmt(tot)} sf in takeoff` : ""}`);
      Model3D.highlight(sys); setTimeout(() => Model3D.highlight(null), 1600);
    });
    document.addEventListener("sys-hover", (e) => {
      const s = SUPAFI.SYSTEMS[e.detail];
      if (s) flashChip(`<b>${s.name}</b> · ${fmt(SUPAFI.totalFor(e.detail) || 0)} sf`);
    });
  }
  let chipT = null;
  function flashChip(html) {
    const chip = $("#sys-chip") || $("#global-chip");
    if (!chip) return;
    chip.innerHTML = html; chip.classList.add("show");
    clearTimeout(chipT); chipT = setTimeout(() => chip.classList.remove("show"), 2200);
  }

  /* ---------- uploads / lightbox ---------- */
  function bindUploads() {
    const dz = $("#dropzone"), fi = $("#file-in");
    on(dz, "click", () => fi.click());
    on(fi, "change", () => { CRM.addPhotos([...fi.files]); flashChip("Added to single source ✓"); fi.value = ""; });
    ["dragover", "dragenter"].forEach(ev => on(dz, ev, (e) => { e.preventDefault(); dz.classList.add("hot"); }));
    ["dragleave", "drop"].forEach(ev => on(dz, ev, (e) => { e.preventDefault(); dz.classList.remove("hot"); }));
    on(dz, "drop", (e) => CRM.addPhotos([...e.dataTransfer.files]));
    on($("#btn-more-photos"), "click", () => fi.click());
  }
  App.lightbox = async (src) => {
    await Curtains.transition("pixels", () => {
      $("#lightbox img").src = src;
      $("#lightbox").classList.add("open");
    });
  };
  function bindLightbox() {
    on($("#lightbox"), "click", () => Curtains.transition("pixels", () => $("#lightbox").classList.remove("open")));
  }

  /* ---------- presentation mode ---------- */
  function buildPresentation() {
    const st = CRM.state;
    const fins = Object.values(SUPAFI.SYSTEMS).filter(s => s.finishable).map(s => {
      const f = SUPAFI.finishById(st.finishes[s.key] || s.defaultFinish);
      return `<div class="pr-finish"><span class="sw-fill" style="background:${f.hex}"></span><div><b>${s.name}</b><span>${f.name} — Lumabuilt</span></div></div>`;
    }).join("");
    const rows = Object.values(SUPAFI.SYSTEMS).map(s => {
      const t = SUPAFI.totalFor(s.key);
      return t ? `<tr><td>${s.name}</td><td>${s.vendor}</td><td class="num">${fmt(t)} sf</td></tr>` : "";
    }).join("");
    $("#presentation").innerHTML = `
      <button class="pr-close" id="pr-close">✕ Close</button>
      <article class="pr-doc">
        <header class="pr-cover">
          <span class="pr-brand">SUPAFI-AI · 1CG GLAZING & CLADDING</span>
          <h1>MAGNOLIA</h1>
          <p>${SUPAFI.MAGNOLIA.market} — ${SUPAFI.MAGNOLIA.location}</p>
          <span class="pulse-chip">● PENDING AWARD · BID DUE ${new Date(st.bidDue).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        </header>
        <img class="pr-hero" id="pr-hero" alt="Magnolia 3D model">
        <section class="pr-sec"><h2>Scope of work — one company, one package</h2>
          <table class="pr-table"><thead><tr><th>System</th><th>Basis of design</th><th>Takeoff</th></tr></thead><tbody>${rows}</tbody></table>
          <p class="fineprint">* estimated glazing areas pending curtain wall shop drawings. Auto-extracted from A5 elevation set ${new Date().toLocaleDateString()}.</p>
        </section>
        <section class="pr-sec"><h2>Selected finishes</h2><div class="pr-finishes">${fins}</div></section>
        <section class="pr-sec"><h2>Schedule of types</h2>
          <table class="pr-table"><thead><tr><th>Tag</th><th>System</th><th>Rating</th><th>Zone</th></tr></thead>
          <tbody>${SUPAFI.TYPES.map(t => `<tr><td><b>${t.tag}</b></td><td>${t.name}</td><td>${t.rating}</td><td>${t.zone}</td></tr>`).join("")}</tbody></table>
        </section>
        <footer class="pr-foot">
          <span>Prepared by ${CRM.role ? CRM.role.name : "1CG"} · ${new Date().toLocaleDateString()}</span>
          <button class="present-btn small" onclick="print()">Print / Save PDF</button>
        </footer>
      </article>`;
    on($("#pr-close"), "click", () => Curtains.transition("wipe", () => $("#presentation").classList.remove("open")));
  }
  function bindPresent() {
    on($("#btn-present"), "click", async () => {
      if (CRM.role && !CRM.can("present")) return flashChip("Presentation is role-gated for field accounts.");
      Model3D.mount($("#host-model"), "hero");
      await new Promise(r => setTimeout(r, 350));
      const snap = Model3D.snapshot();
      buildPresentation();
      $("#pr-hero").src = snap;
      Curtains.transition("wipe", () => $("#presentation").classList.add("open"));
      CRM.addActivity("📤", "Client presentation generated");
    });
  }

  /* ---------- notes ---------- */
  function bindNotes() {
    on($("#note-form"), "submit", (e) => {
      e.preventDefault();
      if (!CRM.can("editCrm")) return flashChip("Notes are PM/Admin only in this role.");
      CRM.addNote($("#note-in").value); $("#note-in").value = "";
    });
  }

  /* ================= BOOT ================= */
  function boot() {
    buildStepper();
    SupafiMap.init("map", (e) => Curtains.irisFromClick(e, () =>
      document.getElementById("ch-crm").scrollIntoView({ behavior: "instant" })));
    SupafiMap.overview();
    Model3D.init();
    applySavedFinishes();
    Model3D.assemble(0.06);
    bindFlips(); bindHud(); bindAssembly(); bindUploads(); bindLightbox(); bindPresent(); bindNotes();
    CRM.renderAll();
    $("#hdr-status").textContent = CRM.state.status.toUpperCase();
    /* keyboard spine */
    addEventListener("keydown", (e) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const ids = SUPAFI.CHAPTERS.map(c => c.id);
      const i = Math.max(0, ids.indexOf(currentChapter));
      const next = ids[Math.min(ids.length - 1, Math.max(0, i + (e.key === "ArrowDown" ? 1 : -1)))];
      if (next && next !== currentChapter) document.getElementById(next).scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    CRM.load();
    buildChapters(); populate();
    roleGate();
  });
})();
