/* ============================================================
   SUPAFI-AI · crm.js
   Deal engine for the Magnolia pin — role-based access,
   pipeline status, contacts, activity, notes, detail photos.
   Persists to localStorage so the project remembers you.
   ============================================================ */

(function () {
  const KEY = "supafi.magnolia.v1";
  let state = null;
  let role = null;

  function load() {
    try { state = JSON.parse(localStorage.getItem(KEY)); } catch (e) { state = null; }
    if (!state) state = JSON.parse(JSON.stringify(SUPAFI.CRM_SEED));
    return state;
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* photo quota — drop oldest */ state.photos.shift(); try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} } };
  const fmt$ = (n) => "$" + n.toLocaleString();
  const fmtT = (t) => new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const STATUSES = ["lead", "bidding", "pending", "awarded", "in-production", "field", "closeout"];

  window.CRM = {
    load, save,
    get state() { return state || load(); },
    setRole(r) { role = r; document.body.dataset.role = r.id; },
    get role() { return role; },
    can(perm) { return !!(role && role.perms[perm]); },

    addActivity(icon, text) {
      state.activity.unshift({ t: Date.now(), icon, text });
      save(); this.renderActivity();
    },
    addNote(text) {
      if (!text.trim()) return;
      state.notes.unshift(text.trim()); save(); this.renderNotes();
      this.addActivity("📝", "Note added by " + (role ? role.name : "user"));
    },
    setStatus(s) {
      if (!STATUSES.includes(s)) return;
      state.status = s; save();
      this.addActivity("⚡", "Status moved to " + s.toUpperCase());
      this.renderStatus();
    },
    setFinish(sysKey, finishId) {
      state.finishes[sysKey] = finishId; save();
    },

    /* ---------- renderers ---------- */
    renderStatus() {
      const wrap = document.getElementById("crm-status");
      if (!wrap) return;
      wrap.innerHTML = STATUSES.map(s => {
        const idx = STATUSES.indexOf(state.status);
        const me = STATUSES.indexOf(s);
        const cls = me < idx ? "done" : me === idx ? "now" : "";
        return `<button class="pl-stage ${cls}" data-status="${s}" ${this.can("editCrm") ? "" : "disabled"}>
          <span class="pl-dot"></span><span class="pl-label">${s.replace("-", " ")}</span></button>`;
      }).join('<span class="pl-line"></span>');
      wrap.querySelectorAll("[data-status]").forEach(b =>
        b.addEventListener("click", () => this.can("editCrm") && this.setStatus(b.dataset.status)));
      const badge = document.getElementById("hdr-status");
      if (badge) { badge.textContent = state.status.toUpperCase(); badge.dataset.s = state.status; }
    },
    renderContacts() {
      const wrap = document.getElementById("crm-contacts");
      if (!wrap) return;
      wrap.innerHTML = state.contacts.map((c, i) => `
        <div class="contact-card">
          <div class="contact-ava">${esc(c.name).split(" ").map(w => w[0]).slice(0, 2).join("")}</div>
          <div class="contact-meta"><b>${esc(c.name)}</b><span>${esc(c.role)} · ${esc(c.org)}</span>
          <span class="contact-links">${esc(c.email)}${c.phone && c.phone !== "—" ? " · " + esc(c.phone) : ""}</span></div>
        </div>`).join("");
    },
    renderActivity() {
      const wrap = document.getElementById("crm-activity");
      if (!wrap) return;
      wrap.innerHTML = state.activity.slice(0, 14).map(a => `
        <div class="act-row"><span class="act-ico">${a.icon}</span>
          <span class="act-txt">${esc(a.text)}</span><span class="act-t">${fmtT(a.t)}</span></div>`).join("");
    },
    renderNotes() {
      const wrap = document.getElementById("crm-notes");
      if (!wrap) return;
      wrap.innerHTML = state.notes.map(n => `<div class="note">${esc(n)}</div>`).join("");
    },
    renderFacts() {
      const bid = document.getElementById("crm-facts");
      if (!bid) return;
      bid.innerHTML = `
        <div class="fact"><span>Package value</span><b>${fmt$(state.value)}</b></div>
        <div class="fact"><span>Bid due</span><b>${new Date(state.bidDue).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</b></div>
        <div class="fact"><span>Win probability</span><b>${Math.round(SUPAFI.MAGNOLIA.probability * 100)}%</b></div>
        <div class="fact"><span>Package</span><b>Glazing + Cladding</b></div>`;
    },
    renderPhotos() {
      const grid = document.getElementById("photo-grid");
      if (!grid) return;
      const shots = state.photos;
      grid.innerHTML = shots.length
        ? shots.map((p, i) => `<figure class="shot" data-i="${i}"><img src="${p.src}" alt=""><figcaption>${esc(p.name)}</figcaption></figure>`).join("")
        : `<div class="shot-empty">No detail photos yet — drop the elevation sheets, head details, or field shots here. Every upload joins the single source.</div>`;
      grid.querySelectorAll(".shot").forEach(f => f.addEventListener("click", () => window.App && App.lightbox(shots[+f.dataset.i].src)));
    },
    async addPhotos(files) {
      if (!this.can("uploadPhotos")) return;
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        const src = await compress(file, 1100, 0.82);
        state.photos.unshift({ name: file.name, t: Date.now(), src });
      }
      save(); this.renderPhotos();
      this.addActivity("📸", files.length + " detail photo" + (files.length > 1 ? "s" : "") + " added to single source");
    },
    renderAll() {
      load();
      this.renderStatus(); this.renderContacts(); this.renderActivity();
      this.renderNotes(); this.renderFacts(); this.renderPhotos();
    },
  };

  function compress(file, maxW, q) {
    return new Promise((res) => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, maxW / img.width);
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        res(cv.toDataURL("image/jpeg", q));
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  }
})();
