/* ============================================================
   The Human Answer - cinematic scroll engine
   Math per reference spec: exact offsets, easing curves, lerp
   factors, breakpoints. Extra layers: video wallpaper lifecycle,
   pixel-anchored nav, ask-form queue, search flash.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Queries ---------- */
  const section = document.querySelector(".cinema-scroll");
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const track = document.querySelector(".sights-track");
  const controlsBox = document.querySelector(".sights-controls");
  const prevBtn = document.querySelector(".sight-prev");
  const nextBtn = document.querySelector(".sight-next");
  const originalCards = Array.from(document.querySelectorAll(".sight-card"));
  const wallVideo = document.querySelector(".wall-video");

  /* ---------- State ---------- */
  let targetMouseX = 0, targetMouseY = 0, mouseX = 0, mouseY = 0;
  let targetScroll = 0, smoothScroll = 0;
  let initialized = false, rafPending = false;

  let sightCards = [];
  const originalSightCount = originalCards.length;
  let activeSight = originalSightCount;

  /* ---------- Helpers ---------- */
  function clamp(v, min = 0, max = 1) { return Math.min(max, Math.max(min, v)); }
  function smoothstep(e0, e1, v) {
    const x = clamp((v - e0) / (e1 - e0));
    return x * x * (3 - 2 * x);
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function segmentInOut(s, a, b, c, d) {
    const enter = smoothstep(a, b, s);
    const exit = smoothstep(c, d, s);
    return { enter: enter, exit: exit, active: enter * (1 - exit) };
  }
  function getScrollDistance() {
    return clamp(
      -section.getBoundingClientRect().top,
      0,
      section.offsetHeight - window.innerHeight
    );
  }

  /* ---------- CSS var writer (skip unchanged values) ---------- */
  const lastWritten = Object.create(null);
  function setVar(name, value) {
    const v = String(value);
    if (lastWritten[name] === v) return;
    lastWritten[name] = v;
    root.style.setProperty(name, v);
  }

  function setWallVideoPlaying(playing) {
    if (!wallVideo || wallVideo.dataset.state === "error") return;
    if (playing) {
      const p = wallVideo.play();
      if (p && typeof p.catch === "function") p.catch(function () {});
    } else {
      wallVideo.pause();
    }
  }

  /* ---------- Per-frame update ---------- */
  function update() {
    rafPending = false;
    if (!section) return;

    targetScroll = getScrollDistance();
    if (!initialized || reduceMotion.matches) {
      smoothScroll = targetScroll;
      initialized = true;
    } else {
      smoothScroll = lerp(smoothScroll, targetScroll, 0.14);
    }
    if (Math.abs(smoothScroll - targetScroll) < 0.08) smoothScroll = targetScroll;

    mouseX = lerp(mouseX, targetMouseX, 0.12);
    mouseY = lerp(mouseY, targetMouseY, 0.12);

    const frame2 = segmentInOut(smoothScroll, 560, 900, 1300, 1620);
    const frame3 = segmentInOut(smoothScroll, 1760, 2140, 2540, 2700);
    const progress = clamp(smoothScroll / 2700);
    const introExit = smoothstep(90, 650, smoothScroll);
    const sightsEnterRaw = smoothstep(2760, 3560, smoothScroll);
    const sightsEnter = Math.pow(sightsEnterRaw, 1.55);
    const sightsControlsEnter = smoothstep(3360, 3660, smoothScroll);
    const blurActive = clamp(frame2.active + frame3.active);
    const frame2Opacity = frame2.active * (1 - frame3.enter);
    const splitDrift = Math.pow(frame2.enter, 1.5);
    const panel2Opacity = frame2.active * (1 - frame2.exit);
    const panel3Opacity = frame3.active * (1 - frame3.exit);
    const backScale = 0.76 + progress * 0.2 + frame2.enter * 0.18 + frame3.enter * 0.16;
    const sharedHeroY = progress * -74;
    const sharedHeroScale = progress * 0.23;
    const sightsScreenTop = Math.min(220, Math.max(112, window.innerHeight * 0.19)) - 50;
    const sightsParentTop = window.innerHeight - (window.innerHeight - sightsScreenTop) / backScale;

    const mxOut = reduceMotion.matches ? 0 : mouseX;
    const myOut = reduceMotion.matches ? 0 : mouseY;

    setVar("--mx", mxOut.toFixed(4));
    setVar("--my", myOut.toFixed(4));

    setVar("--back-opacity", String(1 - frame2.active * 0.06));
    setVar("--back-x", (mxOut * -12).toFixed(4) + "px");
    setVar("--back-y", (myOut * -4).toFixed(4) + "px");
    setVar("--back-scale", backScale.toFixed(4));
    setVar("--four-y", (10 + progress * 10).toFixed(4) + "vh");
    setVar("--four-scale", (0.78 + progress * 0.16).toFixed(4));
    setVar("--bazaar-y", (20 - progress * 8).toFixed(4) + "vh");
    setVar("--blur-px", (blurActive * 14).toFixed(4) + "px");
    setVar("--back-brightness", (1 - blurActive * 0.255).toFixed(4));
    setVar("--bazaar-blur-px", (frame2.active * 14).toFixed(4) + "px");
    setVar("--bazaar-brightness", (1 - frame2.active * 0.255 - frame3.active * 0.06).toFixed(4));
    setVar("--bazaar-saturation", (1 + frame3.active * 0.18).toFixed(4));
    setVar("--shade-opacity", "1");
    setVar("--shade-z", frame2.active > 0.02 ? "2" : "0");
    setVar("--shade-top-alpha", (blurActive * 0.465).toFixed(4));
    setVar("--shade-mid-alpha", (blurActive * 0.42).toFixed(4));
    setVar("--shade-bottom-alpha", (blurActive * 0.51).toFixed(4));

    setVar("--title-y", (introExit * -210).toFixed(4) + "px");
    setVar("--title-scale", (1 - introExit * 0.08).toFixed(4));
    setVar("--title-opacity", (1 - introExit).toFixed(4));

    setVar("--bridge-x", "calc(-50% + " + (mxOut * 18).toFixed(4) + "px)");
    setVar("--bridge-y", (myOut * 8 + sharedHeroY - frame2.exit * 760).toFixed(4) + "px");
    setVar("--bridge-bottom", (5 - frame2.enter * 13).toFixed(4) + "vh");
    setVar("--bridge-width", (67.2 + frame2.enter * 37.8).toFixed(4) + "vw");
    setVar("--bridge-scale", (1.02 + sharedHeroScale + frame2.exit * 0.46).toFixed(4));

    setVar("--split-left-x", "calc(-50% + " + (-splitDrift * 46).toFixed(4) + "vw + " + (mxOut * 22).toFixed(4) + "px)");
    setVar("--split-left-y", (myOut * 10 + sharedHeroY - splitDrift * 180).toFixed(4) + "px");
    setVar("--split-left-scale", (1 + sharedHeroScale + frame2.enter * 0.74).toFixed(4));
    setVar("--split-right-x", "calc(-50% + " + (splitDrift * 46).toFixed(4) + "vw + " + (mxOut * 22).toFixed(4) + "px)");
    setVar("--split-right-y", (myOut * 10 + sharedHeroY - splitDrift * 180).toFixed(4) + "px");
    setVar("--split-right-scale", (1 + sharedHeroScale + frame2.enter * 0.74).toFixed(4));

    setVar("--frame2-opacity", frame2Opacity.toFixed(4));
    setVar("--frame2-x", "calc(-50% + " + (mxOut * 10).toFixed(4) + "px)");
    setVar("--frame2-y", "calc(-50% + " + (myOut * 8 - frame2.exit * 150).toFixed(4) + "px)");
    setVar("--frame2-scale", (1.06 + frame2.enter * 0.08 + frame2.exit * 0.08).toFixed(4));

    setVar("--intro-copy-y", (introExit * 90).toFixed(4) + "px");
    setVar("--intro-copy-opacity", (1 - introExit).toFixed(4));
    setVar("--panel2-opacity", panel2Opacity.toFixed(4));
    setVar("--panel2-y", "calc(-50% + " + (-frame2.exit * 86 + (1 - frame2.enter) * 58).toFixed(4) + "px)");
    setVar("--panel3-opacity", panel3Opacity.toFixed(4));
    setVar("--panel3-y", "calc(-50% + " + (-frame3.exit * 86 + (1 - frame3.enter) * 58).toFixed(4) + "px)");

    setVar("--sights-controls-opacity", sightsControlsEnter.toFixed(4));
    if (controlsBox) controlsBox.classList.toggle("is-ready", sightsControlsEnter > 0.98);
    setVar("--sights-visibility", sightsEnter > 0.01 ? "visible" : "hidden");
    setVar("--sights-y", "0px");
    setVar("--sights-enter-x", ((1 - sightsEnter) * 420).toFixed(4) + "vw");
    setVar("--sights-scale", (1 / backScale).toFixed(6));
    setVar("--sights-top", sightsParentTop.toFixed(4) + "px");
    setVar("--sights-screen-top", sightsScreenTop.toFixed(4) + "px");

    setWallVideoPlaying(!reduceMotion.matches);

    const settledScroll = Math.abs(smoothScroll - targetScroll) <= 0.08;
    const settledX = Math.abs(mouseX - targetMouseX) <= 0.001;
    const settledY = Math.abs(mouseY - targetMouseY) <= 0.001;
    if (!(settledScroll && settledX && settledY)) requestTick();
  }

  function requestTick() {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(update);
    }
  }

  /* ---------- Infinite slider ---------- */
  function setupSightSlider() {
    if (!track) return;
    track.replaceChildren();
    for (let setIndex = 0; setIndex < 3; setIndex++) {
      originalCards.forEach(function (card, cardIndex) {
        const clone = card.cloneNode(true);
        clone.dataset.sightIndex = String(setIndex * originalSightCount + cardIndex);
        track.appendChild(clone);
      });
    }
    sightCards = Array.prototype.slice.call(track.children);

    sightCards.forEach(function (card) {
      card.addEventListener("click", function () { selectSightCard(card); });
      card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectSightCard(card);
        }
      });
    });

    track.addEventListener("transitionend", normalizeSightSlider);
    activeSight = originalSightCount;
    updateSightSlider(true);
  }

  function updateSightSlider(forceJump) {
    if (!track || !sightCards.length) return;
    const cardWidth = sightCards[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0");
    root.style.setProperty("--sights-shift", (-(cardWidth + gap) * activeSight).toFixed(4) + "px");
    sightCards.forEach(function (card, index) {
      card.classList.toggle("is-active", index === activeSight);
    });
    if (forceJump) jumpSightSlider(activeSight);
  }

  function moveSightSlider(dir) {
    activeSight += dir;
    updateSightSlider(false);
  }

  function selectSightCard(card) {
    const index = Number(card.dataset.sightIndex);
    if (!Number.isFinite(index)) return;
    activeSight = index;
    updateSightSlider(false);
  }

  function jumpSightSlider(i) {
    if (!track) return;
    track.classList.add("is-jumping");
    activeSight = i;
    const cardWidth = sightCards[0] ? sightCards[0].offsetWidth : 0;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0");
    root.style.setProperty("--sights-shift", (-(cardWidth + gap) * activeSight).toFixed(4) + "px");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { track.classList.remove("is-jumping"); });
    });
  }

  function normalizeSightSlider(event) {
    if (event && event.propertyName !== "transform") return;
    if (activeSight >= originalSightCount * 2) {
      jumpSightSlider(activeSight - originalSightCount);
    } else if (activeSight < originalSightCount) {
      jumpSightSlider(activeSight + originalSightCount);
    }
  }

  /* ---------- Pixel-anchored nav ---------- */
  document.querySelectorAll("[data-scrollto]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      window.scrollTo({ top: Number(link.dataset.scrollto) || 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
    });
  });

  /* ---------- Search / ask bar ---------- */
  const FLASH_CSS = ".sight-card.is-flash{outline:3px solid #2b6cb0;outline-offset:-3px}" +
                    ".flash-status{position:fixed;left:12px;bottom:12px;z-index:60;background:#fdf1e1;color:#111411;" +
                    "border-radius:999px;padding:8px 16px;font-size:.9rem;font-weight:700;box-shadow:0 12px 30px rgba(0,0,0,.35)}";
  const flashStyle = document.createElement("style");
  flashStyle.textContent = FLASH_CSS;
  document.head.appendChild(flashStyle);

  const askForm = document.querySelector(".ask-form");
  if (askForm) {
    askForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const q = (document.getElementById("ha-search") || {}).value || "";
      const needle = q.trim().toLowerCase();
      const scrollTopNow = getScrollDistance();
      if (scrollTopNow < 3400) {
        window.scrollTo({ top: 3660, behavior: reduceMotion.matches ? "auto" : "smooth" });
      }
      setTimeout(function () {
        let hits = 0;
        sightCards.forEach(function (card) { card.classList.remove("is-flash"); });
        if (needle.length > 1) {
          sightCards.forEach(function (card) {
            const hay = (card.textContent || "").toLowerCase();
            if (hay.indexOf(needle) !== -1) { card.classList.add("is-flash"); hits++; }
          });
        }
        let status = document.querySelector(".flash-status");
        if (!status) {
          status = document.createElement("div");
          status.className = "flash-status";
          status.setAttribute("role", "status");
          document.body.appendChild(status);
        }
        status.textContent = !needle ? "The archive opens below."
          : hits ? hits + ' match' + (hits > 1 ? "es" : "") + ' for "' + q.trim() + '" \u2014 full archive is building.'
          : 'No archived answer yet for "' + q.trim() + '" \u2014 send it to Matt below.';
        clearTimeout(status._t);
        status._t = setTimeout(function () { status.remove(); }, 4200);
      }, reduceMotion.matches ? 60 : 800);
    });
  }

  /* ---------- Ask Matt + subscribe queues ---------- */
  function readQueue(key) {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) { return []; }
  }
  function writeQueue(key, items) {
    try { localStorage.setItem(key, JSON.stringify(items)); } catch (e) {}
  }

  const askNote = document.getElementById("ask-note");
  const askQueueForm = document.getElementById("ask-form");
  if (askQueueForm && askNote) {
    askQueueForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const items = readQueue("ha_ask_queue");
      items.push({
        name: (document.getElementById("q-name").value || "").trim(),
        email: (document.getElementById("q-email").value || "").trim(),
        question: (document.getElementById("q-text").value || "").trim(),
        at: new Date().toISOString(),
      });
      writeQueue("ha_ask_queue", items);
      askQueueForm.reset();
      askNote.textContent = "Question queued (" + items.length + " total) \u2014 inbox sync activates when the email provider lands.";
    });
  }

  const subNote = document.getElementById("sub-note");
  const subForm = document.getElementById("sub-form");
  if (subForm && subNote) {
    subForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const items = readQueue("ha_sub_queue");
      items.push({
        email: (document.getElementById("s-email").value || "").trim(),
        at: new Date().toISOString(),
      });
      writeQueue("ha_sub_queue", items);
      subForm.reset();
      subNote.textContent = "You're on the local list (" + items.length + ") \u2014 provider sync pending.";
    });
  }

  /* ---------- Listeners ---------- */
  window.addEventListener("scroll", function () { requestTick(); }, { passive: true });
  window.addEventListener("resize", function () { updateSightSlider(false); requestTick(); });
  window.addEventListener("pointermove", function (event) {
    targetMouseX = event.clientX / window.innerWidth - 0.5;
    targetMouseY = event.clientY / window.innerHeight - 0.5;
    requestTick();
  }, { passive: true });

  if (prevBtn) prevBtn.addEventListener("click", function () { moveSightSlider(-1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { moveSightSlider(1); });

  if (wallVideo) {
    wallVideo.addEventListener("error", function () {
      wallVideo.dataset.state = "error";
      wallVideo.style.display = "none";
    });
  }
  function applyMotionPreference() { setWallVideoPlaying(!reduceMotion.matches); }
  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", applyMotionPreference);
  }

  /* ---------- Boot ---------- */
  setupSightSlider();
  requestTick();
})();
