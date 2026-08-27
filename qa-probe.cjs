const fs = require("fs");
const path = require("path");
process.env.PW_PATH = require("child_process").execSync("npm root -g").toString().trim()
  + "/@playwright/mcp/node_modules/playwright";
const { chromium } = require(process.env.PW_PATH);

const SITE = process.env.SITE_URL || "file:///Users/bobby/human-answer/index.html";
const QA = "/Users/bobby/human-answer/qa";
fs.mkdirSync(QA, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function scrubAndRead(page, scrollY, shotName) {
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await sleep(1400); // allow smoothing loop to settle
  const data = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const v = {};
    ["--back-scale","--blur-px","--back-brightness","--shade-mid-alpha",
     "--title-y","--title-opacity","--intro-copy-opacity",
     "--panel2-opacity","--panel2-y","--panel3-opacity","--panel3-y",
     "--split-left-x","--split-right-x","--frame2-opacity",
     "--sights-enter-x","--sights-visibility","--sights-controls-opacity",
     "--sights-shift","--bridge-width","--bazaar-saturation","--mx"]
      .forEach(n => v[n] = cs.getPropertyValue(n).trim());
    const slider = document.querySelector(".sights-slider");
    const controls = document.querySelector(".sights-controls");
    const cards = document.querySelectorAll(".sight-card").length;
    const track = document.querySelector(".sights-track");
    v._cardCount = cards;
    v._sliderVisible = slider ? getComputedStyle(slider).visibility : "?";
    v._controlsReady = controls ? controls.classList.contains("is-ready") : false;
    v._trackTransform = track ? getComputedStyle(track).transform : "?";
    v._docOverflowX = document.documentElement.scrollWidth > window.innerWidth;
    return v;
  });
  if (shotName) await page.screenshot({ path: path.join(QA, shotName) });
  return data;
}

(async () => {
  const report = { console_errors: [], page_errors: [], checks: {} };
  const browser = await chromium.launch({ args: ["--no-sandbox"] });

  // ---------- Desktop pass ----------
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on("console", m => { if (m.type() === "error") report.console_errors.push(m.text().slice(0, 200)); });
  page.on("pageerror", e => report.page_errors.push(String(e).slice(0, 200)));

  await page.goto(SITE, { waitUntil: "load", timeout: 90000 });
  try {
    await page.waitForFunction(
      () => Array.from(document.images).every(i => i.complete),
      { timeout: 75000 }
    );
    report.checks.images_loaded = true;
    report.checks.ogg_font_active = await page.evaluate(() =>
      document.fonts.check("24px 'Ogg Medium'"));
  } catch { report.checks.images_loaded = false; }

  report.checks.stage0_hero = await scrubAndRead(page, 60, "stage0-hero-v2.png");

  // Frame 2
  report.checks.stage_frame2 = await scrubAndRead(page, 1150, "stage-frame2-v2.png");

  // Frame 3
  report.checks.stage_frame3 = await scrubAndRead(page, 2100, "stage-frame3-column.png");

  // Sights
  report.checks.stage_sights = await scrubAndRead(page, 3760, "stage-sights-v2.png");

  // ---- Slider engine test ----
  const before = (await page.evaluate(() =>
    getComputedStyle(document.querySelector(".sights-track")).transform)).match(/matrix\(([^)]+)\)/)?.[1];
  await page.click(".sight-next"); await sleep(800);
  await page.click(".sight-next"); await sleep(900);
  const afterNext = (await page.evaluate(() =>
    getComputedStyle(document.querySelector(".sights-track")).transform)).match(/matrix\(([^)]+)\)/)?.[1];
  await page.click(".sight-prev"); await sleep(900);
  const afterPrev = (await page.evaluate(() =>
    getComputedStyle(document.querySelector(".sights-track")).transform)).match(/matrix\(([^)]+)\)/)?.[1];
  report.slider = { before, after_next_x2: afterNext, after_prev_x1: afterPrev,
                    tx_moved_forward: parseFloat(afterNext.split(",")[4]) < parseFloat(before.split(",")[4]),
                    tx_returned: Math.abs(parseFloat(afterPrev.split(",")[4]) - parseFloat(before.split(",")[4])) < 1 };

  // ---- Ask/search form test ----
  await page.evaluate(() => window.scrollTo(0, 60));
  await sleep(600);
  await page.fill("#ha-search", "story");
  await page.press("#ha-search", "Enter");
  await sleep(1700);
  report.search_status = await page.evaluate(() => {
    const el = document.querySelector(".flash-status");
    return el ? el.textContent : null;
  });

  // ---- Queue forms ----
  await page.fill("#q-name", "Bobby"); await page.fill("#q-email", "t@example.com");
  await page.fill("#q-text", "What does lived experience actually change?");
  await page.click('#ask-form button[type="submit"]');
  await page.fill("#s-email", "t@example.com");
  await page.click('#sub-form button[type="submit"]');
  report.queue_notes = await page.evaluate(() => ({
    ask: document.getElementById("ask-note")?.textContent || null,
    sub: document.getElementById("sub-note")?.textContent || null,
  }));
  await page.screenshot({ path: path.join(QA, "after-rail-forms.png"), fullPage: false });
  const railH = await page.evaluate(() => document.querySelector(".after-rail").getBoundingClientRect());
  report.after_rail_h = railH.height;


  // ---------- Wallpaper removal check on home ----------
  report.wallpaper_removed = await page.evaluate(() => ({
    video_tags: document.querySelectorAll("video").length,
    sky_imgs: document.querySelectorAll(".sky-img").length,
    world_bg: getComputedStyle(document.querySelector(".world")).backgroundColor,
    figma_sky_url_present: document.body.innerHTML.includes("16b5007d9c93971e26ffe4e0e3e37946f6bd538c"),
  }));

  await ctx.close();

  // ---------- Reduced motion pass ----------
  const rmCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const rmp = await rmCtx.newPage();
  await rmp.goto(SITE, { waitUntil: "load", timeout: 90000 });
  await rmp.evaluate(() => window.scrollTo(0, 1200));
  await sleep(700);
  report.reduced_motion = await rmp.evaluate(() => ({
    mx: getComputedStyle(document.documentElement).getPropertyValue("--mx").trim(),
    blur: getComputedStyle(document.documentElement).getPropertyValue("--blur-px").trim(),
    videoPaused: (() => { const v = document.querySelector(".wall-video"); return v ? (v.paused || v.readyState < 2 || v.dataset.state === "error") : null; })(),
  }));
  await rmp.screenshot({ path: path.join(QA, "reduced-motion-1200.png") });
  await rmCtx.close();

  // ---------- Mobile pass ----------
  const mCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mp = await mCtx.newPage();
  await mp.goto(SITE, { waitUntil: "load", timeout: 90000 });
  try {
    await mp.waitForFunction(() => Array.from(document.images).every(i => i.complete), { timeout: 75000 });
  } catch {}
  await mp.evaluate(() => window.scrollTo(0, 40)); await sleep(1200);
  await mp.screenshot({ path: path.join(QA, "mobile-hero.png") });
  report.mobile = await mp.evaluate(() => {
    const nav = document.querySelector(".site-nav");
    return {
      doc_overflow_x: document.documentElement.scrollWidth > window.innerWidth + 1,
      nav_scrollable_ok: nav ? nav.scrollWidth >= nav.clientWidth - 2 : null,
      hero_clips: (() => { const h = document.querySelector(".hero-title"); const r = h.getBoundingClientRect();
        return (r.width >= window.innerWidth - 2) ? "touches edges" : "ok"; })(),
      ask_input_usable: (() => { const i = document.getElementById("ha-search"); const r = i.getBoundingClientRect(); return r.width > 150 && r.bottom < innerHeight; })(),
    };
  });
  await mp.evaluate(() => window.scrollTo(0, 3760)); await sleep(1400);
  await mp.screenshot({ path: path.join(QA, "mobile-sights.png") });
  await mCtx.close();

  // ---------- Answers page pass ----------
  const ansCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const ap = { c: ansCtx, pg: await ansCtx.newPage() };
  await ap.pg.goto(SITE.replace(/index\.html$/, "") + "answers.html", { waitUntil: "load", timeout: 60000 });
  report.answers_page = await ap.pg.evaluate(() => ({
    topics: document.querySelectorAll(".topic-section").length,
    cards: document.querySelectorAll("[data-answer]").length,
    sample_tags_labeled: document.querySelectorAll(".sample-tag").length,
    unlabeled_cards: Array.from(document.querySelectorAll("[data-answer]")).filter(c => !c.querySelector(".sample-tag")).length,
    noindex: !!document.querySelector('meta[name="robots"][content*="noindex"]'),
    nav_link_back: !!document.querySelector('a.back-home[href="index.html"]'),
  }));
  // search filter works?
  await ap.pg.fill("#q", "column");
  await new Promise(r => setTimeout(r, 300));
  report.answers_search = await ap.pg.evaluate(() => document.getElementById("search-note").textContent);
  await ap.pg.screenshot({ path: path.join(QA, "answers-page.png") });
  await ap.c.close();

  await browser.close();
  fs.writeFileSync(path.join(QA, "probe-report.json"), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
})().catch(e => { console.error("PROBE FAILED:", e); process.exit(1); });
