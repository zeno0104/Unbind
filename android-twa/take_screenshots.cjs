const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "store-assets");
const BASE = "http://localhost:5173";
const token = process.argv[2];
if (!token) {
  console.error("usage: node take_screenshots.cjs <token>");
  process.exit(1);
}

async function shot(page, url, filename, waitMs = 1200) {
  await page.goto(BASE + url, { waitUntil: "networkidle" });
  await page.waitForTimeout(waitMs);
  await page.screenshot({ path: path.join(OUT_DIR, filename) });
  console.log("saved", filename);
}

async function main() {
  const browser = await chromium.launch();

  // Landing (logged out)
  const outCtx = await browser.newContext({
    viewport: { width: 412, height: 892 },
    deviceScaleFactor: 2,
  });
  const outPage = await outCtx.newPage();
  await shot(outPage, "/", "01_landing.png");
  await outCtx.close();

  // Logged-in pages
  const ctx = await browser.newContext({
    viewport: { width: 412, height: 892 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/login");
  await page.evaluate((t) => {
    localStorage.setItem("token", t);
    localStorage.setItem("onboarding_done", "1");
  }, token);

  await shot(page, "/", "02_home.png");
  await shot(page, "/forest", "03_forest.png", 1800);
  await shot(page, "/calendar", "04_calendar.png");
  await shot(page, "/room", "05_room.png", 1800);
  await shot(page, "/mypage", "06_mypage.png", 1800);

  await ctx.close();
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
