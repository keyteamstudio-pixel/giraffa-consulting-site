/* =========================================================
   Giraffa Consulting — premium interactions
   ========================================================= */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer:fine)").matches;
  var isFile = location.protocol === "file:";
  var EASE = "cubic-bezier(.16,1,.3,1)";

  /* ---------- Nav + progress ---------- */
  var nav = document.querySelector(".nav");
  var burger = document.querySelector(".nav__burger");
  var menu = document.querySelector(".mobile-menu");
  function onScroll() {
    if (nav && !nav.classList.contains("nav--static")) nav.classList.toggle("scrolled", window.scrollY > 30);
    var p = document.querySelector(".progress");
    if (p) {
      var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
      p.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (burger) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menu.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open"); menu.classList.remove("open"); document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revs = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revs.forEach(function (el) { io.observe(el); });
  } else { revs.forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- Word-by-word split reveal ---------- */
  document.querySelectorAll(".splitw").forEach(function (el) {
    if (reduce) return;
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) { return '<span class="w"><span>' + w + "</span></span>"; }).join(" ");
  });
  if ("IntersectionObserver" in window && !reduce) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var ws = e.target.querySelectorAll(".w > span");
        ws.forEach(function (s, i) { s.style.transitionDelay = (i * 0.05) + "s"; });
        e.target.classList.add("in"); sio.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    document.querySelectorAll(".splitw").forEach(function (el) { sio.observe(el); });
  }

  /* ---------- Hero headline reveal ---------- */
  var spans = document.querySelectorAll(".hero .line > span");
  if (spans.length && !reduce) {
    spans.forEach(function (s, i) {
      s.style.transition = "transform 1s " + EASE; s.style.transitionDelay = (0.45 + i * 0.1) + "s";
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      spans.forEach(function (s) { s.style.transform = "translateY(0)"; });
    }); });
  } else { spans.forEach(function (s) { s.style.transform = "none"; }); }

  /* ---------- Stat counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count")), dur = 1500, start = null;
    function tick(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window && !reduce) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else { counters.forEach(function (el) { el.textContent = el.getAttribute("data-count"); }); }

  /* ---------- 3D tilt ---------- */
  if (!reduce && fine) {
    document.querySelectorAll(".tilt").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateX(" + (-py * 5).toFixed(2) + "deg) rotateY(" + (px * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- Custom cursor ---------- */
  if (fine && !reduce) {
    var dot = document.createElement("div"), ring = document.createElement("div");
    dot.className = "cursor-dot"; ring.className = "cursor-ring";
    document.body.appendChild(dot); document.body.appendChild(ring);
    document.body.classList.add("has-cursor");
    var mxv = innerWidth / 2, myv = innerHeight / 2, rx = mxv, ry = myv;
    document.addEventListener("mousemove", function (e) {
      mxv = e.clientX; myv = e.clientY;
      dot.style.transform = "translate(" + mxv + "px," + myv + "px) translate(-50%,-50%)";
    });
    (function loop() {
      rx += (mxv - rx) * 0.18; ry += (myv - ry) * 0.18;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
    var hotSel = "a, button, .card, .value, input, textarea, [data-magnetic]";
    document.addEventListener("mouseover", function (e) { if (e.target.closest(hotSel)) ring.classList.add("hot"); });
    document.addEventListener("mouseout", function (e) { if (e.target.closest(hotSel)) ring.classList.remove("hot"); });
    document.addEventListener("mouseleave", function () { dot.style.opacity = 0; ring.style.opacity = 0; });
    document.addEventListener("mouseenter", function () { dot.style.opacity = 1; ring.style.opacity = 1; });
  }

  /* ---------- Magnetic buttons ---------- */
  if (fine && !reduce) {
    document.querySelectorAll(".btn-primary, [data-magnetic]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = "translate(" + x * 0.25 + "px," + y * 0.35 + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- Page transition ---------- */
  if (!reduce) {
    var trans = document.createElement("div");
    trans.className = "page-trans";
    trans.innerHTML = '<img src="/logo-horizontal-light.png" alt="Giraffa Consulting" />';
    document.body.appendChild(trans);
    trans.style.transform = "translateY(0)";
    requestAnimationFrame(function () {
      trans.classList.add("show");
      setTimeout(function () {
        trans.style.transition = "transform .7s " + EASE;
        trans.style.transform = "translateY(-100%)";
        trans.classList.remove("show");
      }, 430);
    });
    if (!isFile) {
      document.addEventListener("click", function (e) {
        var a = e.target.closest("a"); if (!a) return;
        var href = a.getAttribute("href");
        if (!href || href.charAt(0) === "#" || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
        if (a.target === "_blank" || (a.hostname && a.hostname !== location.hostname)) return;
        e.preventDefault();
        trans.style.transition = "transform .6s " + EASE;
        trans.style.transform = "translateY(0)";
        trans.classList.add("show");
        setTimeout(function () { window.location.href = href; }, 560);
      });
    }
  }

  /* ---------- Horizontal scroll services ---------- */
  var hs = document.querySelector(".hscroll");
  if (hs && !reduce) {
    var track = hs.querySelector(".hscroll__track");
    var bar = hs.querySelector(".hscroll__progress i");
    var dist = 0, active = false;
    function setup() {
      active = window.innerWidth > 900;
      if (!active) { hs.style.height = ""; track.style.transform = ""; return; }
      dist = Math.max(0, track.scrollWidth - window.innerWidth);
      hs.style.height = (window.innerHeight + dist) + "px";
      update();
    }
    function update() {
      if (!active) return;
      var rect = hs.getBoundingClientRect();
      var max = hs.offsetHeight - window.innerHeight;
      var scrolled = Math.min(Math.max(-rect.top, 0), max);
      var p = max > 0 ? scrolled / max : 0;
      track.style.transform = "translateX(" + (-p * dist) + "px)";
      if (bar) bar.style.width = (p * 100) + "%";
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", setup);
    window.addEventListener("load", setup);
    setup();
    setTimeout(setup, 600);
  }

  /* ---------- Hero parallax watermark ---------- */
  var mark = document.querySelector(".hero__mark");
  if (mark && !reduce) {
    window.addEventListener("scroll", function () {
      mark.style.transform = "translateY(calc(-50% + " + (window.scrollY * 0.12) + "px))";
    }, { passive: true });
  }

  /* ---------- Contact form (mailto) ---------- */
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var subj = encodeURIComponent("Richiesta dal sito — " + (d.get("nome") || ""));
      var body = encodeURIComponent(
        "Nome: " + (d.get("nome") || "") + "\n" + "Email: " + (d.get("email") || "") + "\n" +
        "Azienda: " + (d.get("azienda") || "") + "\n\n" + (d.get("messaggio") || ""));
      window.location.href = "mailto:ciao@giraffaconsulting.it?subject=" + subj + "&body=" + body;
    });
  }

  /* ---------- Portfolio filter ---------- */
  var chips = document.querySelectorAll(".chip");
  if (chips.length) {
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        chips.forEach(function (x) { x.classList.remove("active"); });
        c.classList.add("active");
        var f = c.getAttribute("data-filter");
        document.querySelectorAll(".work").forEach(function (w) {
          var cats = w.getAttribute("data-cat") || "";
          w.classList.toggle("hide", f !== "all" && cats.indexOf(f) < 0);
        });
      });
    });
  }

  /* ---------- Hero flow-field (2D canvas) ---------- */
  var canvas = document.getElementById("hero-canvas");
  if (canvas && !reduce) { try { initField(canvas); } catch (e) {} }

  function initField(cv) {
    var ctx = cv.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W, H, mobile;
    var parts = [];
    function resize() {
      W = cv.clientWidth; H = cv.clientHeight; mobile = W < 760;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = mobile ? 46 : 130;
      parts = [];
      for (var i = 0; i < n; i++) parts.push(spawn());
      ctx.clearRect(0, 0, W, H);
    }
    function spawn() {
      return { x: Math.random() * W, y: Math.random() * H, life: 40 + Math.random() * 160,
               w: 0.5 + Math.random() * 1.4, a: 0.04 + Math.random() * 0.16, warm: Math.random() < 0.5 };
    }
    function field(x, y, t) {
      var s = 0.0016;
      return (Math.sin(x * s + t) + Math.cos(y * s - t * 0.8) + Math.sin((x + y) * s * 0.6 + t * 0.5)) * 1.3;
    }
    var t = 0, running = true;
    document.addEventListener("visibilitychange", function () { running = !document.hidden; if (running) loop(); });
    window.addEventListener("resize", resize);
    function loop() {
      if (!running) return;
      requestAnimationFrame(loop);
      t += 0.0016;
      // fade toward paper
      ctx.fillStyle = "rgba(250,246,239,0.055)";
      ctx.fillRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        var ang = field(p.x, p.y, t) * Math.PI;
        var nx = p.x + Math.cos(ang) * 1.5, ny = p.y + Math.sin(ang) * 1.5;
        ctx.beginPath();
        ctx.strokeStyle = p.warm ? "rgba(210,85,46," + p.a + ")" : "rgba(168,63,31," + (p.a * 0.7) + ")";
        ctx.lineWidth = p.w; ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
        p.x = nx; p.y = ny; p.life--;
        if (p.life < 0 || p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10) parts[i] = spawn();
      }
    }
    resize(); loop();
  }
})();
