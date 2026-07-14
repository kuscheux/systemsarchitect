/* ============================================================
   SUPAFI-AI · curtains.js
   Motion.dev "Curtains" transition engine — blinds, doors,
   iris, iris-from-click, wipe, clip wipe, stagger wipe,
   shutter, pixels, fade, mixed. Uses window.Motion when the
   motion.dev runtime is loaded; falls back to WAAPI.
   ============================================================ */

(function () {
  const M = () => window.Motion;

  /* animate(el, keyframes, opts) — Motion if present, else WAAPI */
  function anim(el, keyframes, opts = {}) {
    if (M() && M().animate) return M().animate(el, keyframes, opts);
    // WAAPI fallback: convert Motion-style keyframes {x:[0,1]} → frames
    const frames = [];
    const keys = Object.keys(keyframes);
    const len = Math.max(...keys.map(k => (Array.isArray(keyframes[k]) ? keyframes[k].length : 1)));
    for (let i = 0; i < len; i++) {
      const f = {};
      keys.forEach(k => {
        const v = Array.isArray(keyframes[k]) ? keyframes[k][Math.min(i, keyframes[k].length - 1)] : keyframes[k];
        if (k === "x") f.transform = (f.transform || "") + ` translateX(${typeof v === "number" ? v + "px" : v})`;
        else if (k === "y") f.transform = (f.transform || "") + ` translateY(${typeof v === "number" ? v + "px" : v})`;
        else if (k === "scaleY" || k === "scaleX" || k === "scale") f.transform = (f.transform || "") + ` ${k}(${v})`;
        else f[k] = v;
      });
      frames.push(f);
    }
    const a = el.animate(frames, {
      duration: (opts.duration || 0.6) * 1000,
      delay: (typeof opts.delay === "function" ? opts.delay(el.__i || 0, el.__n || 1) : (opts.delay || 0)) * 1000,
      easing: "cubic-bezier(0.65, 0, 0.35, 1)",
      fill: "both",
    });
    return { finished: a.finished };
  }

  const stagger = (step, opts = {}) =>
    (M() && M().stagger) ? M().stagger(step, opts) : (i) => i * step + (opts.startDelay || 0);

  const EASE = [0.65, 0, 0.35, 1];
  const root = () => {
    let r = document.getElementById("curtain-root");
    if (!r) { r = document.createElement("div"); r.id = "curtain-root"; document.body.appendChild(r); }
    return r;
  };

  /* Build a curtain layer (fixed fullscreen, or scoped to an element) */
  function layer(host) {
    const el = document.createElement("div");
    el.className = "curtain-layer" + (host ? " curtain-scoped" : "");
    (host || root()).appendChild(el);
    return el;
  }
  function segs(container, n, dir = "col") {
    const out = [];
    container.classList.add(dir === "col" ? "curtain-cols" : "curtain-rows");
    for (let i = 0; i < n; i++) {
      const s = document.createElement("div");
      s.className = "curtain-seg";
      s.__i = i; s.__n = n;
      container.appendChild(s); out.push(s);
    }
    return out;
  }
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  /* Each effect: cover(layer) → Promise, reveal(layer) → Promise */
  const EFFECTS = {
    fade: {
      cover(l) { l.style.opacity = 0; l.classList.add("curtain-solid"); return anim(l, { opacity: [0, 1] }, { duration: 0.45, ease: EASE }).finished; },
      reveal(l) { return anim(l, { opacity: [1, 0] }, { duration: 0.55, ease: EASE }).finished; },
    },
    wipe: {
      cover(l) { l.classList.add("curtain-solid"); l.style.clipPath = "inset(0 100% 0 0)"; return anim(l, { clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"] }, { duration: 0.55, ease: EASE }).finished; },
      reveal(l) { return anim(l, { clipPath: ["inset(0 0% 0 0)", "inset(0 0 0 100%)"] }, { duration: 0.55, ease: EASE }).finished; },
    },
    clipWipe: {
      cover(l) { l.classList.add("curtain-solid"); l.style.clipPath = "inset(100% 0 0 0)"; return anim(l, { clipPath: ["inset(100% 0 0 0)", "inset(0% 0 0 0)"] }, { duration: 0.5, ease: EASE }).finished; },
      reveal(l) { return anim(l, { clipPath: ["inset(0% 0 0 0)", "inset(0 0 100% 0)"] }, { duration: 0.5, ease: EASE }).finished; },
    },
    blinds: {
      cover(l) {
        const s = segs(l, 8, "col");
        s.forEach(x => (x.style.transform = "scaleY(0)", x.style.transformOrigin = "top"));
        return Promise.all(s.map(x => anim(x, { scaleY: [0, 1] }, { duration: 0.45, delay: stagger(0.05), ease: EASE }).finished));
      },
      reveal(l) {
        const s = [...l.children];
        s.forEach(x => (x.style.transformOrigin = "bottom"));
        return Promise.all(s.map(x => anim(x, { scaleY: [1, 0] }, { duration: 0.45, delay: stagger(0.05), ease: EASE }).finished));
      },
    },
    shutter: {
      cover(l) {
        const s = segs(l, 7, "row");
        s.forEach(x => (x.style.transform = "scaleX(0)", x.style.transformOrigin = "left"));
        return Promise.all(s.map(x => anim(x, { scaleX: [0, 1] }, { duration: 0.4, delay: stagger(0.045), ease: EASE }).finished));
      },
      reveal(l) {
        const s = [...l.children];
        s.forEach(x => (x.style.transformOrigin = "right"));
        return Promise.all(s.map(x => anim(x, { scaleX: [1, 0] }, { duration: 0.4, delay: stagger(0.045), ease: EASE }).finished));
      },
    },
    doors: {
      cover(l) {
        const s = segs(l, 2, "col");
        s[0].style.transform = "translateX(-100%)"; s[1].style.transform = "translateX(100%)";
        return Promise.all([
          anim(s[0], { x: ["-100%", "0%"] }, { duration: 0.5, ease: EASE }).finished,
          anim(s[1], { x: ["100%", "0%"] }, { duration: 0.5, ease: EASE }).finished,
        ]);
      },
      reveal(l) {
        const s = [...l.children];
        return Promise.all([
          anim(s[0], { x: ["0%", "-100%"] }, { duration: 0.55, ease: EASE }).finished,
          anim(s[1], { x: ["0%", "100%"] }, { duration: 0.55, ease: EASE }).finished,
        ]);
      },
    },
    staggerWipe: {
      cover(l) {
        const s = segs(l, 6, "col");
        s.forEach(x => (x.style.transform = "translateY(-101%)"));
        return Promise.all(s.map(x => anim(x, { y: ["-101%", "0%"] }, { duration: 0.45, delay: stagger(0.06), ease: EASE }).finished));
      },
      reveal(l) {
        const s = [...l.children];
        return Promise.all(s.map(x => anim(x, { y: ["0%", "101%"] }, { duration: 0.45, delay: stagger(0.06), ease: EASE }).finished));
      },
    },
    iris: {
      cover(l, o = {}) {
        l.classList.add("curtain-solid");
        const x = o.x ?? "50%", y = o.y ?? "50%";
        l.style.clipPath = `circle(0% at ${x} ${y})`;
        return anim(l, { clipPath: [`circle(0% at ${x} ${y})`, `circle(150% at ${x} ${y})`] }, { duration: 0.6, ease: EASE }).finished;
      },
      reveal(l, o = {}) {
        const x = o.x ?? "50%", y = o.y ?? "50%";
        return anim(l, { clipPath: [`circle(150% at ${x} ${y})`, `circle(0% at ${x} ${y})`] }, { duration: 0.6, ease: EASE }).finished;
      },
    },
    pixels: {
      cover(l) {
        l.classList.add("curtain-grid");
        const cells = [];
        for (let i = 0; i < 96; i++) { const c = document.createElement("div"); c.className = "curtain-seg"; c.style.opacity = 0; l.appendChild(c); cells.push(c); }
        const order = cells.map((c, i) => i).sort(() => Math.random() - 0.5);
        return Promise.all(cells.map((c, i) => anim(c, { opacity: [0, 1] }, { duration: 0.18, delay: order[i] * 0.006, ease: "linear" }).finished));
      },
      reveal(l) {
        const cells = [...l.children];
        const order = cells.map((c, i) => i).sort(() => Math.random() - 0.5);
        return Promise.all(cells.map((c, i) => anim(c, { opacity: [1, 0] }, { duration: 0.18, delay: order[i] * 0.006, ease: "linear" }).finished));
      },
    },
  };
  EFFECTS.mixed = { // pick a random effect each time — "Curtains: Mixed effects"
    cover(l, o) { const k = ["blinds", "doors", "iris", "shutter", "staggerWipe", "pixels"][Math.floor(Math.random() * 6)]; l.dataset.mixed = k; return EFFECTS[k].cover(l, o); },
    reveal(l, o) { return EFFECTS[l.dataset.mixed || "fade"].reveal(l, o); },
  };

  /* Public API ------------------------------------------------ */
  const Curtains = {
    /* Full-screen transition: cover → swap() → reveal */
    async transition(effect = "fade", swap, opts = {}) {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) { swap && (await swap()); return; }
      const fx = EFFECTS[effect] || EFFECTS.fade;
      const l = layer(null);
      await fx.cover(l, opts);
      swap && (await swap());
      await wait(60);
      await fx.reveal(l, opts);
      l.remove();
    },
    /* Scoped flip inside a host element (blueprint ↔ 3D tabs) */
    async flip(host, effect = "doors", swap, opts = {}) {
      const fx = EFFECTS[effect] || EFFECTS.doors;
      const l = layer(host);
      await fx.cover(l, opts);
      swap && (await swap());
      await wait(40);
      await fx.reveal(l, opts);
      l.remove();
    },
    /* Iris-from-click helper — "Curtains: Iris from click" */
    async irisFromClick(evt, swap) {
      const x = ((evt.clientX / innerWidth) * 100).toFixed(1) + "%";
      const y = ((evt.clientY / innerHeight) * 100).toFixed(1) + "%";
      return Curtains.transition("iris", swap, { x, y });
    },
    /* Staggered entrance for a set of nodes already in the DOM */
    enter(nodes, opts = {}) {
      [...nodes].forEach((n, i) => { n.__i = i; n.__n = nodes.length; });
      return Promise.all([...nodes].map(n =>
        anim(n, { opacity: [0, 1], y: [opts.rise ?? 26, 0] }, { duration: 0.6, delay: stagger(opts.step ?? 0.07), ease: EASE }).finished));
    },
    anim, stagger,
  };
  window.Curtains = Curtains;
})();
