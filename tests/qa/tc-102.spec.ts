import { expect, test } from "@playwright/test";

const BASE = process.env.QA_BASE_URL ?? "https://vita-build-demo-shop.vercel.app";

test("TC-102 Thêm sản phẩm vào giỏ hàng", async ({ browser }) => {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: "/tmp/qa-video", size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  await page.goto(BASE);
  await page.getByRole("link", { name: /Stoneware mug/ }).click();
  await expect(page.getByRole("heading", { name: "Stoneware mug" })).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).click();

  // The page header shows the cart indicator "Cart, 1 item".
  const cartLink = page.getByRole("link", { name: "Cart, 1 item" });
  await expect(cartLink).toBeVisible();
  await cartLink.click();
  await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();

  const lines = page.getByRole("list", { name: "Cart items" }).getByRole("listitem");
  await expect(lines).toHaveCount(1);
  await expect(lines.first().getByRole("link", { name: "Stoneware mug" })).toBeVisible();
  await expect(lines.first().locator(".line-price")).toHaveText("$24.00");
  console.log("document.title =", await page.title());

  await page.screenshot({ path: process.env.QA_OUT ? `${process.env.QA_OUT}/tc-102.png` : "tc-102.png" });
  await context.close();
});
