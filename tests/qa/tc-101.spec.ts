import { test, expect, chromium } from "@playwright/test";

const URL = process.env.TARGET_URL ?? "https://vita-build-demo-shop.vercel.app";
const OUT = process.env.OUT_DIR ?? "/mnt/session/outputs";

test("TC-101 Xem danh sách sản phẩm", async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: "/tmp/qa-video", size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  let failed = true;
  try {
    await page.goto(URL);
    const items = page.getByRole("list", { name: "Products" }).getByRole("listitem");
    await expect(items.first()).toBeVisible();
    await page.screenshot({ path: `${OUT}/tc-101.png`, fullPage: true });
    expect(await items.count()).toBe(6);
    for (const item of await items.all()) {
      await expect(item.getByRole("heading", { level: 3 })).not.toBeEmpty();
      await expect(item).toContainText(/\$\d+\.\d{2}/);
    }
    failed = false;
  } finally {
    await context.close();
    if (failed) await page.video()?.saveAs(`${OUT}/tc-101.webm`);
    await browser.close();
  }
});
