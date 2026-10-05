/* ANAPARN — parallax / 3D / pop-up motion
 * No libraries: CSS 3D transforms + one requestAnimationFrame loop.
 *
 * 1) Hero: a 3D "scene" (perspective + preserve-3d) full of floating tiles at
 *    different Z depths. Mouse tilts the whole scene; scrolling pushes every
 *    tile toward the camera (fly-through parallax).
 * 2) .layer[data-depth]   → 2D text layers that move by mouse/scroll at different rates.
 * 3) .layer-scroll[data-speed] → classic scroll parallax (About section).
 * 4) .reveal → 3D pop-up when scrolled into view (IntersectionObserver).
 * 5) .tilt   → card tilts toward the pointer, children pop out on translateZ.
 * 6) Modal   → 3D flip-in pop-up for any [data-project].
 */
(() => {
  const img = (seed, w, h, gray) =>
    `https://picsum.photos/seed/${seed}/${w}/${h}${gray ? "?grayscale" : ""}`;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // deterministic random so the layout is the same on every load
  let s = 7;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;

  /* ---------------- Data (replace with your real work) ---------------- */
  const heroFeatures = [
    { t: "Travel Video", y: "2024", x: -0.36, yy: -0.18, z: -250, seed: "travel" },
    { t: "Documentary", y: "2024", x: -0.24, yy: 0.12, z: 80, seed: "doc" },
    { t: "Portrait", y: "2024", x: -0.3, yy: 0.33, z: -600, seed: "portrait", photo: true },
    { t: "Short Film", y: "2025", x: 0.22, yy: -0.05, z: -150, seed: "shortfilm" },
    { t: "City Life", y: "2024", x: 0.35, yy: -0.2, z: 60, seed: "citylife" },
    { t: "People", y: "2024", x: 0.46, yy: 0.0, z: -350, seed: "people" },
    { t: "Nature", y: "2024", x: 0.33, yy: 0.33, z: -80, seed: "nature", photo: true },
  ];

  const categories = [
    { n: "01", t: "Video Editing", tags: "Narrative · Documentary · Event · Short Film", seed: "edit" },
    { n: "02", t: "Videography", tags: "Field Recording · Cinematic · Behind the Scene", seed: "videography" },
    { n: "03", t: "Photography", tags: "Portrait · Travel · Event · Documentary", seed: "photography" },
    { n: "04", t: "Visual Creation", tags: "Graphic · Motion · Installation · Experimental", seed: "visual" },
  ];

  const featured = [
    { t: "Bangkok Night Stories", m: "9:16 Video · 2024", seed: "bkk", video: true },
    { t: "A Day in Chiang Mai", m: "9:16 Video · 2024", seed: "cnx" },
    { t: "Faces of People", m: "Portrait Photo · 2024", seed: "faces" },
    { t: "The Silent Land", m: "9:16 Video · 2025", seed: "silent" },
    { t: "Urban Flow", m: "Photo Series · 2024", seed: "urban" },
  ];

  /* ---------------- Build hero tiles ---------------- */
  const scene = document.getElementById("scene");
  const portrait = document.getElementById("portrait");
  const tiles = [];
  const W = () => innerWidth, H = () => innerHeight;

  function addTile({ x, y, z, w, h, src, feature, data }) {
    const el = document.createElement("div");
    el.className = "tile" + (feature ? " feature" : "");
    el.style.width = w + "px";
    el.style.height = h + "px";
    el.style.marginLeft = -w / 2 + "px";
    el.style.marginTop = -h / 2 + "px";
    el.innerHTML = `<img loading="lazy" src="${src}" alt="">`;
    if (feature) {
      el.innerHTML +=
        (data.photo ? "" : `<span class="play"></span>`) +
        `<span class="label">${data.photo ? "Photo" : "9:16"}<b>${data.t}</b>${data.y}</span>`;
      el.dataset.project = JSON.stringify({ t: data.t, m: `${data.photo ? "Photo" : "9:16 Video"} · ${data.y}`, img: src });
    } else {
      // far-away tiles are slightly blurred = depth of field
      if (z < -900) el.style.filter = "blur(2px)";
    }
    scene.appendChild(el);
    tiles.push({ el, x, y, z, ry: (x / W()) * -40, phase: rand() * 6.28, amp: 4 + rand() * 8 });
  }

  function buildHero() {
    const count = W() < 700 ? 26 : 54;
    for (let i = 0; i < count; i++) {
      let x = (rand() * 2 - 1) * W() * 0.75;
      const y = (rand() * 2 - 1) * H() * 0.62;
      let z = -1700 + rand() * 1900;
      // keep the face area clear for tiles that sit in front of it
      if (Math.abs(x) < W() * 0.16 && z > -700) x = Math.sign(x || 1) * (W() * 0.16 + rand() * W() * 0.3);
      // tiles over the left text column are pushed back so the copy stays readable
      if (x < -W() * 0.36 && z > -800) z -= 900;
      const portraitShape = rand() > 0.5;
      const w = 60 + rand() * 90;
      const h = portraitShape ? w * 1.4 : w * 0.7;
      addTile({ x, y, z, w, h, src: img("tile" + i, Math.round(w * 2), Math.round(h * 2), true) });
    }
    heroFeatures.forEach((f) => {
      const w = W() < 700 ? 80 : 120;
      addTile({
        x: f.x * W(), y: f.yy * H(), z: f.z, w, h: w * 16 / 9,
        src: img("hero-" + f.seed, 360, 640), feature: true, data: f,
      });
    });
  }

  /* ---------------- Work categories ---------------- */
  document.querySelectorAll(".cat").forEach((el) => {
    const c = categories[+el.dataset.cat];
    el.dataset.project = JSON.stringify({ t: c.t, m: c.tags, img: img("cat-main-" + c.seed, 540, 960) });
    el.innerHTML = `
      <div class="cat-bg"><img loading="lazy" src="${img("cat-bg-" + c.seed, 900, 1200, true)}" alt=""></div>
      <div class="cat-inner">
        <div class="cat-num">${c.n}</div>
        <div class="cat-main"><img loading="lazy" src="${img("cat-main-" + c.seed, 360, 640)}" alt=""><span class="play"></span></div>
        <div class="cat-text"><h3>${c.t}</h3><p>${c.tags}</p></div>
        <div class="cat-thumbs">
          ${[0, 1, 2].map((i) => `<div style="--i:${i}"><img loading="lazy" src="${img(`cat-${c.seed}-${i}`, 200, 400)}" alt=""></div>`).join("")}
        </div>
        <div class="cat-link">View Projects <span class="arrow"></span></div>
      </div>`;
  });

  document.getElementById("featured").innerHTML = featured
    .map((f, i) => {
      const src = img("feat-" + f.seed, 240, 426);
      const data = JSON.stringify({ t: f.t, m: f.m, img: img("feat-" + f.seed, 540, 960), n: i + 1 }).replace(/"/g, "&quot;");
      return `<div class="feat reveal" style="--d:${i + 1}" data-project="${data}">
        <div class="feat-img"><img loading="lazy" src="${src}" alt="">${f.video ? '<span class="play"></span>' : ""}</div>
        <div class="feat-info"><small>0${i + 1}</small>${f.t}<span>${f.m}</span></div>
      </div>`;
    })
    .join("");

  /* ---------------- Input state ---------------- */
  const mouse = { tx: 0, ty: 0, x: 0, y: 0, moved: false };
  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    mouse.tx = (e.clientX / W()) * 2 - 1;
    mouse.ty = (e.clientY / H()) * 2 - 1;
    mouse.moved = true;
  });

  const hero = document.querySelector(".hero");
  const layers = [...document.querySelectorAll(".layer")].map((el) => ({ el, d: +el.dataset.depth }));
  const scrollLayers = [...document.querySelectorAll(".layer-scroll")].map((el) => ({ el, s: +el.dataset.speed }));
  let heroP = 0;

  /* ---------------- Main loop ---------------- */
  function frame(time) {
    const t = time / 1000;

    // no mouse (touch / idle) → gentle automatic sway so the scene stays alive
    if (!mouse.moved) { mouse.tx = Math.sin(t * 0.4) * 0.35; mouse.ty = Math.cos(t * 0.3) * 0.2; }
    mouse.x = lerp(mouse.x, mouse.tx, 0.06);
    mouse.y = lerp(mouse.y, mouse.ty, 0.06);

    const r = hero.getBoundingClientRect();
    const target = clamp(-r.top / (r.height - H()), 0, 1);
    heroP = lerp(heroP, target, 0.12); // smoothed scroll progress

    document.body.classList.toggle("past-hero", r.bottom < H() * 0.6);

    if (r.bottom > 0) {
      // 1) whole scene tilts with the mouse
      scene.style.transform =
        `rotateX(${-mouse.y * 6}deg) rotateY(${mouse.x * 10}deg) translate3d(${-mouse.x * 30}px, ${-mouse.y * 20}px, 0)`;

      // 2) every tile flies toward the camera as you scroll
      const push = heroP * 2400;
      for (const tl of tiles) {
        const z = tl.z + push;
        let o = 1;
        if (z > 500) o = 1 - (z - 500) / 450;          // fade as it passes the camera
        else if (z < -1100) o = 0.35 + (z + 1700) / 1700; // atmospheric fog
        o = clamp(o, 0, 1);
        if (o <= 0) { tl.el.style.visibility = "hidden"; continue; }
        tl.el.style.visibility = "visible";
        tl.el.style.opacity = o;
        const bob = reduced ? 0 : Math.sin(t * 0.8 + tl.phase) * tl.amp;
        tl.el.style.transform = `translate3d(${tl.x}px, ${tl.y + bob}px, ${z}px) rotateY(${tl.ry}deg)`;
      }

      // 3) portrait slides forward and dissolves
      portrait.style.transform = `translate3d(0, ${heroP * -60}px, ${-180 + heroP * 700}px) scale(${1 + heroP * 0.15})`;
      portrait.style.opacity = clamp(1 - heroP * 1.6, 0, 1);

      // 4) 2D text layers: different depth = different speed
      for (const l of layers) {
        l.el.style.transform = `translate3d(${mouse.x * l.d * -40}px, ${mouse.y * l.d * -30 - heroP * l.d * 400}px, 0)`;
        l.el.style.opacity = clamp(1 - heroP * 2, 0, 1);
      }
    }

    // 5) scroll parallax layers
    for (const l of scrollLayers) {
      const sec = l.el.parentElement.getBoundingClientRect();
      if (sec.bottom < 0 || sec.top > H()) continue;
      const offset = sec.top + sec.height / 2 - H() / 2;
      l.el.style.transform = `translate3d(0, ${offset * l.s}px, 0)`;
    }

    requestAnimationFrame(frame);
  }

  /* ---------------- Pop-up reveal ---------------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }),
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------------- Active side-nav ---------------- */
  const navLinks = document.querySelectorAll("[data-nav]");
  const navIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("active", a.dataset.nav === e.target.dataset.section));
    }),
    { rootMargin: "-45% 0px -45% 0px" }
  );
  document.querySelectorAll("[data-section]").forEach((s) => navIO.observe(s));

  /* ---------------- 3D tilt cards ---------------- */
  document.querySelectorAll(".tilt").forEach((card) => {
    const inner = () => card.querySelector(".cat-inner");
    card.addEventListener("pointermove", (e) => {
      const b = card.getBoundingClientRect();
      const px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
      card.style.setProperty("--ry", `${(px - 0.5) * 16}deg`);
      card.style.setProperty("--rx", `${(0.5 - py) * 12}deg`);
      card.style.setProperty("--mx", `${px * 100}%`);
      card.style.setProperty("--my", `${py * 100}%`);
      inner()?.style.setProperty("transition", "transform .15s linear");
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--rx", "0deg");
      inner()?.style.removeProperty("transition");
    });
  });

  /* ---------------- Modal pop-up ---------------- */
  const modal = document.getElementById("modal");
  document.addEventListener("click", (e) => {
    const p = e.target.closest("[data-project]");
    if (p) {
      const d = JSON.parse(p.dataset.project);
      document.getElementById("modal-img").src = d.img;
      document.getElementById("modal-title").textContent = d.t;
      document.getElementById("modal-meta").textContent = d.m;
      document.getElementById("modal-num").textContent = d.n ? `Project 0${d.n}` : "Project";
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      return;
    }
    if (e.target.closest("[data-close]")) closeModal();
  });
  const closeModal = () => { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); };
  addEventListener("keydown", (e) => e.key === "Escape" && closeModal());

  buildHero();
  requestAnimationFrame(frame);
})();
