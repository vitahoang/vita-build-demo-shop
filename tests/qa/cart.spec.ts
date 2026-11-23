import { expect, test, type Browser } from "@playwright/test";

const URL = process.env.BASE_URL ?? "https://vita-build-demo-shop.vercel.app";
const OUT = process.env.QA_OUT ?? "/mnt/session/outputs";

async function run(browser: Browser, id: string, body: (page: import("@playwright/test").Page) => Promise<void>) {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: `/tmp/qa-video-${id}`, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  const video = page.video();
  let failed: unknown;
  try {
    await body(page);
  } catch (e) {
    failed = e;
    await page.screenshot({ path: `${OUT}/${id}.png` });
  }
  await context.close();
  if (failed && video) await video.saveAs(`${OUT}/${id}.webm`);
  if (failed) throw failed;
}

async function addMug(page: import("@playwright/test").Page) {
  await page.goto(URL + "/");
  await page.getByRole("link", { name: /Stoneware mug/ }).click();
  await expect(page.getByRole("heading", { name: "Stoneware mug" })).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).click();
}

test("TC-102: add Stoneware mug to cart", async ({ browser }) => {
  await run(browser, "tc-102", async (page) => {
    await addMug(page);
    const cartLink = page.getByRole("link", { name: "Cart, 1 item" });
    await expect(cartLink).toBeVisible();
    await cartLink.click();
    await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
    const lines = page.getByRole("list", { name: "Cart items" }).getByRole("listitem");
    await expect(lines).toHaveCount(1);
    await expect(lines.first()).toContainText("Stoneware mug");
    await expect(lines.first().locator(".line-price")).toHaveText("$24.00");
    await page.screenshot({ path: `${OUT}/tc-102.png` });
  });
});

test("TC-103: change quantity 1 -> 3", async ({ browser }) => {
  await run(browser, "tc-103", async (page) => {
    await addMug(page);
    await page.getByRole("link", { name: "Cart, 1 item" }).click();
    const inc = page.getByRole("button", { name: "Increase Stoneware mug quantity" });
    await inc.click();
    await inc.click();
    await expect(page.getByRole("spinbutton", { name: "Stoneware mug quantity" })).toHaveValue("3");
    const line = page.getByRole("list", { name: "Cart items" }).getByRole("listitem").first();
    const linePrice = (await line.locator(".line-price").innerText()).trim();
    const total = (await page.locator(".cart-summary > div strong").innerText()).trim();
    console.log(`TC-103 observed line=${linePrice} total=${total}`);
    await page.screenshot({ path: `${OUT}/tc-103.png` });
    expect(linePrice).toBe("$72.00");
    expect(total).toBe("$72.00");
  });
});
