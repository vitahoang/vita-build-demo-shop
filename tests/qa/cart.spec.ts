import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";

const OUT = process.env.QA_OUT ?? "/mnt/session/outputs";

async function addMug(page: Page) {
  await page.goto("/");
  await page.getByRole("link", { name: /Stoneware mug/ }).click();
  await expect(page.getByRole("heading", { name: "Stoneware mug" })).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).click();
}

async function shot(page: Page, id: string) {
  fs.mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: `${OUT}/${id}.png`, fullPage: true });
}

test("TC-102 Thêm sản phẩm vào giỏ hàng", async ({ page }) => {
  await addMug(page);
  const cartLink = page.getByRole("link", { name: "Cart, 1 item" });
  await expect(cartLink).toBeVisible();
  console.log("document.title =", await page.title());
  await page.goto("/cart");
  await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
  const lines = page.getByRole("list", { name: "Cart items" }).getByRole("listitem");
  await shot(page, "tc-102");
  await expect(lines).toHaveCount(1);
  await expect(lines.first()).toContainText("Stoneware mug");
  await expect(lines.first().locator(".line-price")).toHaveText("$24.00");
});

test("TC-103 Đổi số lượng trong giỏ hàng từ 1 lên 3", async ({ page }) => {
  await addMug(page);
  await page.getByRole("link", { name: "Cart, 1 item" }).click();
  await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
  const inc = page.getByRole("button", { name: "Increase Stoneware mug quantity" });
  await inc.click();
  await inc.click();
  await expect(page.getByRole("spinbutton", { name: "Stoneware mug quantity" })).toHaveValue("3");
  const linePrice = await page.locator(".line-price").first().innerText();
  const total = await page.locator(".cart-summary strong").first().innerText();
  console.log(`line price = ${linePrice}, total = ${total}`);
  await shot(page, "tc-103");
  expect.soft(linePrice).toBe("$72.00");
  expect.soft(total).toBe("$72.00");
});
