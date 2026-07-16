import { chromium } from "playwright-core";
import { mkdirSync } from "fs";
import { join } from "path";

const EDGE_PATH = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PUBLIC_DIR = "public/projects";

async function capture(page, url, outputDir, shots) {
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);

  mkdirSync(outputDir, { recursive: true });

  for (const shot of shots) {
    if (shot.scrollY !== undefined) {
      await page.evaluate((y) => window.scrollTo(0, y), shot.scrollY);
      await page.waitForTimeout(800);
    }
    const file = join(outputDir, shot.filename);
    await page.screenshot({ path: file, type: "png", fullPage: shot.fullPage ?? false });
    console.log(`  ✓ ${shot.filename}`);
  }
}

async function main() {
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await ctx.newPage();

  // --- tevio.com.br ---
  await capture(page, "https://tevio.com.br", `${PUBLIC_DIR}/tevio`, [
    { filename: "tevio-01.png", scrollY: 0 },
    { filename: "tevio-02.png", scrollY: 700 },
    { filename: "tevio-03.png", scrollY: 1400 },
    { filename: "tevio-04.png", scrollY: 2100 },
    { filename: "tevio-05.png", scrollY: 2800 },
  ]);

  await browser.close();
  console.log("\nDone! All screenshots captured.");
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
