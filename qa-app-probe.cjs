const fs = require("fs");
const path = require("path");
process.env.PW_PATH = require("child_process").execSync("npm root -g").toString().trim()
  + "/@playwright/mcp/node_modules/playwright";
const { chromium } = require(process.env.PW_PATH);

const SITE = process.env.SITE_URL || "http://127.0.0.1:8903/index.html";
const QA = "/Users/bobby/human-answer/qa";
fs.mkdirSync(QA, { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const report = { console_errors: [], page_errors: [], checks: {} };
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on("console", m => { if (m.type() === "error") report.console_errors.push(m.text().slice(0, 200)); });
  page.on("pageerror", e => report.page_errors.push(String(e).slice(0, 200)));

  await page.goto(SITE, { waitUntil: "load", timeout: 60000 });
  await sleep(2500);

  report.checks.video_src_ok = await page.evaluate(() => {
    const v = document.querySelector("video");
    return !!v && v.src.includes("hf_20260508_191911") && v.muted && v.loop;
  });

  // ---- Signup interactions ----
  await page.fill('input[placeholder="Input Email"]', "t@example.com");
  await page.fill('input[placeholder="Choose Password"]', "secret123");
  report.checks.password_hidden_by_default = await page.evaluate(() =>
    document.querySelector('input[placeholder="Choose Password"]').type === "password");
  await page.click('button[aria-label*="password"]');
  report.checks.eye_toggles = await page.evaluate(() =>
    document.querySelector('input[placeholder="Choose Password"]').type === "text");
  // click the visual BOX specifically (links inside labels don't toggle)
  await page.click('label span.rounded.border');
  report.checks.checkbox_toggles = await page.evaluate(() =>
    !!document.querySelector('label input[type="checkbox"] + span.border-white'));
  // keyboard path too
  await page.focus('label input[type="checkbox"]');
  await page.keyboard.press('Space');
  await page.waitForTimeout(120);
  report.checks.checkbox_keyboard_works = await page.evaluate(() =>
    !document.querySelector('label input[type="checkbox"] + span.border-white'));

  // ---- Dock opens windows ----
  await page.click('button:has-text("Matt\'s Answers")');
  await sleep(900);
  await page.click('button:has-text("About Matt")');
  await sleep(700);
  report.checks.two_windows_open = await page.evaluate(() =>
    document.querySelectorAll("[data-window-id]").length === 2);
  report.checks.window_titles = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-window-id]")).map(w => w.getAttribute("aria-label")));
  await page.screenshot({ path: path.join(QA, "app-two-windows.png") });

  // Close the TOP window so nothing overlaps the marquee for the hover test
  const closeButtons = await page.$$('button[aria-label^="Close"]');
  await closeButtons[closeButtons.length - 1].click();
  await sleep(300);

  // Bookshelf content
  report.checks.book_count_doubled = await page.evaluate(() =>
    document.querySelectorAll(".book-wrap").length); // expect 20
  const animName = await page.evaluate(() => {
    const t = document.querySelector(".marquee-track");
    return getComputedStyle(t).animationName;
  });
  report.checks.marquee_animating = animName === "marquee-scroll";

  // Hover pause behavior: track a moving book by raw coordinates
  async function hoverNthBook(n) {
    const box = await page.evaluate((idx) => {
      const b = document.querySelectorAll('.book')[idx];
      const r = b.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }, n);
    await page.mouse.move(box.x, box.y);
    await sleep(120);
    await page.mouse.move(box.x, box.y);
  }
  report.checks.marquee_pauses_on_hover = false;
  {
    const box = await page.evaluate(() => {
      const m = document.querySelector('.marquee-fade').getBoundingClientRect();
      return { x: m.x + m.width / 2, y: m.y + m.height / 2 };
    });
    await page.mouse.move(box.x, box.y);
    const t0 = Date.now();
    while (Date.now() - t0 < 1500) {
      const paused = await page.evaluate(() =>
        getComputedStyle(document.querySelector('.marquee-track')).animationPlayState === 'paused');
      if (paused) { report.checks.marquee_pauses_on_hover = true; break; }
      await sleep(60);
    }
  }
  await page.screenshot({ path: path.join(QA, 'app-bookshelf-hover.png') });

  // Click a book -> detail card (dispatch-safe)
  await page.evaluate(() => {
    const w = document.querySelectorAll('.book-wrap')[3];
    w.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await sleep(300);
  report.checks.book_detail_opens = await page.evaluate(() =>
    !!document.querySelector(".marquee-mask + div h3, div[class*='rounded-xl'] h3"));
  const detailTitle = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("h3"));
    return els.length ? els[els.length - 1].textContent : null;
  });
  report.checks.detail_title = detailTitle;

  // Cover images actually load
  report.checks.cover_images_loaded = await page.evaluate(async () => {
    const urls = Array.from(new Set(Array.from(document.querySelectorAll(".book-front-cover"))
      .map(el => el.style.backgroundImage.match(/url\("?([^"]+)"?\)/)?.[1]).filter(Boolean)));
    const results = await Promise.all(urls.map(u => new Promise(res => {
      const img = new Image(); img.onload = () => res(true); img.onerror = () => res(false); img.src = u;
    })));
    return results.every(Boolean) && urls.length >= 10;
  });

  // ---- Close a window (count precisely before/after) ----
  const countBefore = await page.evaluate(() => document.querySelectorAll('[data-window-id]').length);
  const win = await page.$('[data-window-id]');
  await win.$eval('button[aria-label^="Close"]', b => b.click());
  await page.waitForFunction(
    (n) => document.querySelectorAll('[data-window-id]').length === n - 1,
    countBefore,
    { timeout: 5000 },
  );
  report.checks.close_works = true;

  await page.screenshot({ path: path.join(QA, "app-final.png") });

  // ---- Mobile sanity ----
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mp = await mctx.newPage();
  await mp.goto(SITE, { waitUntil: "load", timeout: 60000 });
  await sleep(1800);
  report.mobile = await mp.evaluate(() => ({
    card_stacks: !!document.querySelector(".max-w-4xl.flex-col"),
    right_panel_display: (() => { const el = document.querySelector('div[style*="rgba(255, 255, 255, 0.05)"]'); return el ? getComputedStyle(el).display : "not-found"; })(),
    overflow_x: document.documentElement.scrollWidth > innerWidth + 1,
  }));
  await mp.screenshot({ path: path.join(QA, "app-mobile.png") });

  await browser.close();
  fs.writeFileSync(path.join(QA, "app-probe-report.json"), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
})().catch(e => { console.error("PROBE FAILED:", e.message || e); process.exit(1); });
