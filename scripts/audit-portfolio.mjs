import { chromium } from "playwright-core";
import { mkdirSync } from "fs";

const EDGE_PATH = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const OUT = "scripts/audit-shots";

mkdirSync(OUT, { recursive: true });

async function snap(page, name, scrollY = 0) {
  if (scrollY > 0) {
    await page.evaluate((y) => {
      const root = document.querySelector('[class*="scrollRoot"]');
      if (root) root.scrollTop = y;
      else window.scrollTo(0, y);
    }, scrollY);
    await page.waitForTimeout(900);
  }
  await page.screenshot({ path: `${OUT}/${name}`, type: "png" });
  console.log(`  ✓ ${name}`);
}

async function main() {
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox"],
  });

  // --- Desktop 1440x900 ---
  const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopCtx.newPage();
  await desktopPage.goto("http://localhost:3001", { waitUntil: "networkidle", timeout: 30000 });
  await desktopPage.waitForTimeout(2000);

  await snap(desktopPage, "desktop-hero.png", 0);
  await snap(desktopPage, "desktop-about.png", 800);
  await snap(desktopPage, "desktop-projects.png", 1700);
  await snap(desktopPage, "desktop-contact.png", 2700);
  await snap(desktopPage, "desktop-footer.png", 3600);

  // Dark mode
  await desktopPage.evaluate(() => {
    localStorage.setItem("portfolio-theme", "dark");
    window.dispatchEvent(new Event("portfolio-preferences"));
  });
  await desktopPage.waitForTimeout(500);
  await snap(desktopPage, "desktop-dark-hero.png", 0);
  await snap(desktopPage, "desktop-dark-projects.png", 1700);

  await desktopCtx.close();

  // --- Mobile 390x844 ---
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto("http://localhost:3001", { waitUntil: "networkidle", timeout: 30000 });
  await mobilePage.waitForTimeout(2000);

  await snap(mobilePage, "mobile-hero.png", 0);
  await snap(mobilePage, "mobile-projects.png", 1600);
  await snap(mobilePage, "mobile-contact.png", 3200);

  await mobileCtx.close();
  await browser.close();

  console.log(`\nAudit screenshots saved to ${OUT}/`);
}

main().catch((e) => { console.error("Fatal:", e.message); process.exit(1); });
