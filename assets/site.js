// FitAI Coach site interactions: nav, reveals, pointer glow, magnetic CTAs,
// count-ups, calorie calculator, chat demo, and lazy 3D.
(() => {
  const doc = document.documentElement;
  doc.classList.add("js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Nav
  const nav = document.querySelector(".nav");
  const onScroll = () => nav && nav.classList.toggle("scrolled", scrollY > 12);
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });
  const burger = document.querySelector(".burger");
  if (burger) burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });

  // Reveal on scroll, staggered inside [data-stagger]
  document.querySelectorAll("[data-stagger]").forEach((g) => {
    [...g.children].forEach((c, i) => { c.classList.add("reveal"); c.style.setProperty("--d", i * 70 + "ms"); });
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // Card pointer glow
  document.addEventListener("pointermove", (e) => {
    const c = e.target.closest && e.target.closest(".card");
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", e.clientX - r.left + "px");
    c.style.setProperty("--my", e.clientY - r.top + "px");
  }, { passive: true });

  // Cursor ambient glow + magnetic primary buttons (desktop only)
  if (fine && !reduce) {
    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);
    addEventListener("pointermove", (e) => { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; }, { passive: true });
    document.querySelectorAll(".btn-primary").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.setProperty("--bx", (e.clientX - r.left - r.width / 2) * 0.18 + "px");
        b.style.setProperty("--by", (e.clientY - r.top - r.height / 2) * 0.25 + "px");
      });
      b.addEventListener("pointerleave", () => { b.style.setProperty("--bx", "0px"); b.style.setProperty("--by", "0px"); });
    });
  }

  // Count-up numbers
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      const el = e.target, end = parseFloat(el.dataset.count), suffix = el.dataset.suffix || "";
      if (reduce) { el.textContent = end + suffix; return; }
      const t0 = performance.now(), dur = 1400;
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1), k = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * k) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((el) => cio.observe(el));

  // Calorie calculator (same formulas as the app: Mifflin-St Jeor)
  const calc = document.querySelector("[data-calc]");
  if (calc) {
    const st = { sex: "female" };
    const $ = (s) => calc.querySelector(s);
    calc.querySelectorAll("[data-sex]").forEach((b) => b.addEventListener("click", () => {
      st.sex = b.dataset.sex;
      calc.querySelectorAll("[data-sex]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      run();
    }));
    const ACT = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725 };
    function run() {
      const age = +$("#c-age").value, h = +$("#c-h").value, w = +$("#c-w").value;
      const act = $("#c-act").value, goal = $("#c-goal").value;
      if (!(age >= 16 && age <= 90 && h >= 120 && h <= 230 && w >= 30 && w <= 250)) {
        $("#c-kcal").textContent = "–"; return;
      }
      const bmr = 10 * w + 6.25 * h - 5 * age + (st.sex === "male" ? 5 : -161);
      const tdee = bmr * ACT[act];
      let kcal = goal === "lose" ? tdee - 450 : goal === "muscle" ? tdee + 250 : tdee;
      kcal = Math.max(st.sex === "male" ? 1500 : 1200, Math.round(kcal / 10) * 10);
      const p = Math.round(w * (goal === "fit" ? 1.4 : 1.8));
      const f = Math.round((kcal * 0.27) / 9);
      const c = Math.max(50, Math.round((kcal - p * 4 - f * 9) / 4));
      $("#c-kcal").textContent = kcal.toLocaleString("en-MY");
      $("#c-tdee").textContent = Math.round(tdee).toLocaleString("en-MY");
      $("#c-p").textContent = p + "g"; $("#c-c").textContent = c + "g"; $("#c-f").textContent = f + "g";
    }
    calc.addEventListener("input", run);
    run();
  }

  // Chat demo: type the coach reply when it scrolls into view
  const demo = document.querySelector("[data-chat-demo]");
  if (demo) {
    const reply = demo.querySelector("[data-reply]");
    const full = reply.getAttribute("data-reply");
    const dio = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      dio.disconnect();
      if (reduce) { reply.textContent = full; return; }
      setTimeout(() => {
        reply.textContent = "";
        let i = 0;
        const step = () => { reply.textContent = full.slice(0, i += 3); if (i < full.length) setTimeout(step, 16); };
        step();
      }, 1100);
    }, { threshold: 0.5 });
    dio.observe(demo);
  }

  // Lazy 3D: only download three.js where it will actually render.
  const host = document.querySelector("[data-hero-scene]");
  if (host && !reduce) {
    const lite = host.getAttribute("data-hero-scene") === "lite";
    const small = matchMedia("(max-width: 760px)").matches;
    if (!(lite && small)) {
      const go = () => import("/assets/scene.js").catch(() => {});
      ("requestIdleCallback" in window) ? requestIdleCallback(go, { timeout: 1200 }) : setTimeout(go, 300);
    }
  }

  const y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
