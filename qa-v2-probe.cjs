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
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  page.on("console", m => { if (m.type() === "error") report.console_errors.push(m.text().slice(0,200)); });
  page.on("pageerror", e => report.page_errors.push(String(e).slice(0,300)));

  await page.goto(SITE + "?cb=" + Date.now(), { waitUntil: "load" });
  await sleep(2500);

  // no signup remnants
  report.checks.no_signup = await page.evaluate(() =>
    !document.body.textContent.includes("Launch Account") &&
    !document.querySelector('input[placeholder="Input Email"]'));

  // desktop icons
  report.checks.desktop_icons = await page.evaluate(() =>
    Array.from(document.querySelectorAll("button")).filter(b =>
      ["About Matt","Matt's Answers","Living Column","Ask Matt"].includes(b.textContent.trim())).length >= 4);

  // glitch banner text present
  report.checks.glitch_banner = await page.evaluate(() => {
    const el = document.querySelector(".glitch-text");
    return !!el && el.textContent === "WolfSpirit99 ONLINE" && getComputedStyle(el, "::before").content !== "none";
  });
  await page.screenshot({ path: path.join(QA, "v2-desktop.png") });

  // open About -> typewriter eventually fills 4 paragraphs
  await page.click('button:has-text("About Matt")');
  await sleep(3500);
  const aboutTyped = await page.evaluate(() => {
    const win = document.querySelector('[data-window-id]');
    return win ? win.querySelectorAll("p").length : 0;
  });
  report.checks.about_window_opens_and_types = aboutTyped >= 4;
  await page.screenshot({ path: path.join(QA, "v2-about-typed.png") });

  // window controls exist
  report.checks.traffic_lights = await page.evaluate(() => ({
    close: !!document.querySelector('button[aria-label^="Close"]'),
    min: !!document.querySelector('button[aria-label^="Minimize"]'),
    max: !!document.querySelector('button[aria-label^="Maximize"]'),
  }));

  // red button closes
  await page.click('button[aria-label^="Close"]');
  await sleep(250);
  report.checks.red_closes = await page.evaluate(() => document.querySelectorAll("[data-window-id]").length === 0);

  // minimize path: open answers, minimize via yellow, restore via taskbar
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const ans = btns.find(b => b.textContent?.trim() === "Matt's Answers");
    if (ans) ans.click();
  });
  await sleep(800);
  await page.evaluate(() => {
    const w = document.querySelector('[data-window-id]');
    if (w) { const mb = w.querySelector('button[aria-label^="Minimize"]'); if (mb) mb.click(); }
  });
  await sleep(250);
  const minimizedGone = await page.evaluate(() => document.querySelectorAll("[data-window-id]").length === 0);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tb = btns.filter(b => b.textContent?.trim() === "Matt's Answers");
    if (tb.length) tb[tb.length - 1].click();
  });
  await sleep(400);
  const restored = await page.evaluate(() => document.querySelectorAll("[data-window-id]").length === 1);
  report.checks.minimize_restore_cycle = minimizedGone && restored;

  // maximize toggle
  await page.evaluate(() => {
    const w = document.querySelector('[data-window-id]');
    if (w) { const mb = w.querySelector('button[aria-label^="Maximize"]'); if (mb) mb.click(); }
  });
  await sleep(250);
  report.checks.maximize_works = await page.evaluate(() =>
    document.querySelector("[data-window-id]").getBoundingClientRect().width > innerWidth - 40);

  // shelf books visible with titled covers loading (wait for render)
  try {
    await page.waitForFunction(() => document.querySelectorAll('.book-front-cover').length >= 10, { timeout: 15000 });
  } catch {}
  report.checks.books_present = await page.evaluate(() => document.querySelectorAll(".book").length >= 10);
  report.checks.titled_covers_load = await page.evaluate(async () => {
    const els = Array.from(document.querySelectorAll(".book-front-cover"));
    if (els.length < 10) return false;
    const urls = Array.from(new Set(els
      .map(el => el.style.backgroundImage.match(/url\("?([^"]+)"?\)/)?.[1]).filter(Boolean)));
    const allArt = urls.every(u => u.includes("/art/cover-"));
    const allLoaded = await Promise.all(urls.map(u => new Promise(res => {
      const img = new Image(); img.onload = () => res(true); img.onerror = () => res(false); img.src = u;
      setTimeout(() => res(img.complete && img.naturalWidth > 0), 8000);
    })));
    const bands = els.filter(el => el.querySelector(".book-cover-titlelines div")).length;
    return allArt && allLoaded.every(Boolean) && bands === els.length;
  });

  // book click -> TOME READER (reference leather/parchment spread)
  await page.evaluate(() => document.querySelectorAll(".book-wrap")[2].dispatchEvent(new MouseEvent("click",{bubbles:true})));
  await sleep(500);
  report.checks.tome_reader_opens = await page.evaluate(() => {
    const q = document.querySelector('.tome-title');
    const a = document.querySelector('.tome-source');
    return !!q && !!a && /quora\.com\/.+\/answer\/WolfSpirit99/.test(a.href || '');
  });
  report.checks.tome_direct_permalink = await page.evaluate(() => {
    const a = document.querySelector('.tome-source');
    return a && /\/answer\/WolfSpirit99/.test(a.getAttribute('href') || '');
  });
  // Back to the shelf inside the window, then verify the 10-volume index
  await page.evaluate(() => {
    const back = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent?.includes('Back to the shelf'));
    if (back) back.click();
  });
  await sleep(350);
  report.checks.archive_count = await page.evaluate(() => {
    const t = document.body.textContent ?? '';
    const m = t.match(/(\d{3,4})\s+answers/i) || t.match(/\((\d{3,4})\)/);
    return m ? Number(m[1]) >= 900 : false;
  });

  // close answers window via JS (chrome buttons are inside a moving window)
  await page.evaluate(() => {
    const ws = Array.from(document.querySelectorAll('[data-window-id]'));
    const top = ws[ws.length - 1];
    if (top) { const cb = top.querySelector('button[aria-label^="Close"]'); if (cb) cb.click(); }
  });
  await sleep(300);

  // ---- Track Record window ----
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tr = btns.find(b => b.textContent?.trim() === 'Track Record');
    if (tr) tr.click();
  });
  await sleep(500);
  report.checks.track_record_opens = await page.evaluate(() => {
    const t = document.body.textContent ?? '';
    return t.toUpperCase().includes('WORTH QUOTING') && /verification system/i.test(t);
  });
  // close it via JS
  await page.evaluate(() => {
    const ws = Array.from(document.querySelectorAll('[data-window-id]'));
    const top = ws[ws.length - 1];
    if (top) { const cb = top.querySelector('button[aria-label^="Close"]'); if (cb) cb.click(); }
  });
  await sleep(250);

  // ---- Chatbot E2E ----
  await page.evaluate(() => {
    const ws = Array.from(document.querySelectorAll('[data-window-id]'));
    const top = ws[ws.length - 1];
    if (top) { const cb = top.querySelector('button[aria-label^="Close"]'); if (cb) cb.click(); }
  });
  await sleep(250);
  // Ask Matt chatbot removed from the product
  await page.screenshot({ path: path.join(QA, "v2-final.png") });

  // mobile quick sanity
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mp = await mctx.newPage();
  await mp.goto(SITE, { waitUntil: "load" }); await sleep(1500);
  report.mobile = await mp.evaluate(() => ({
    overflow_x: document.documentElement.scrollWidth > innerWidth + 1,
    icons_tappable: Array.from(document.querySelectorAll("button")).some(b => b.textContent.includes("Track Record")),
  }));
  await mp.screenshot({ path: path.join(QA, "v2-mobile.png") });

  await browser.close();
  fs.writeFileSync(path.join(QA, "v2-report.json"), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
})().catch(e => { console.error("PROBE FAILED:", e.message || e); process.exit(1); });
