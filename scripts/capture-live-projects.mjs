import { chromium } from "playwright-core";
import { mkdirSync } from "fs";

const EDGE_PATH = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

async function capture(page, url, outputDir, shots) {
  console.log(`Navigating to ${url}...`);
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  } catch {
    await page.goto(url, { waitUntil: "load", timeout: 45000 });
  }
  await page.waitForTimeout(2500);

  mkdirSync(outputDir, { recursive: true });

  for (const shot of shots) {
    if (shot.scrollY !== undefined) {
      await page.evaluate((y) => window.scrollTo(0, y), shot.scrollY);
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: `${outputDir}/${shot.filename}`, type: "png" });
    console.log(`  ✓ ${shot.filename}`);
  }
}

async function main() {
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox"],
  });

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // --- Vetta ---
  await capture(page, "https://vetta-devchells-projects.vercel.app/", "public/projects/vetta", [
    { filename: "vetta-01.png", scrollY: 0 },
    { filename: "vetta-02.png", scrollY: 700 },
    { filename: "vetta-03.png", scrollY: 1400 },
    { filename: "vetta-04.png", scrollY: 2100 },
    { filename: "vetta-05.png", scrollY: 2800 },
  ]);

  // --- TyviaHub ---
  await capture(page, "https://tyviahub.com.br/br", "public/projects/tyviahub", [
    { filename: "tyviahub-01.png", scrollY: 0 },
    { filename: "tyviahub-02.png", scrollY: 700 },
    { filename: "tyviahub-03.png", scrollY: 1400 },
    { filename: "tyviahub-04.png", scrollY: 2100 },
    { filename: "tyviahub-05.png", scrollY: 2800 },
  ]);

  // --- AkiMais ---
  await capture(page, "https://akimais.com.br/", "public/projects/akimais", [
    { filename: "akimais-01.png", scrollY: 0 },
    { filename: "akimais-02.png", scrollY: 700 },
    { filename: "akimais-03.png", scrollY: 1400 },
    { filename: "akimais-04.png", scrollY: 2100 },
    { filename: "akimais-05.png", scrollY: 2800 },
  ]);

  await browser.close();
  console.log("\nAll live project screenshots captured.");
}

main().catch((e) => { console.error("Fatal:", e.message); process.exit(1); });
