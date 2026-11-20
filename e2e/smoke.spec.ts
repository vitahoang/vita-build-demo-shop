import { expect, test } from "@playwright/test";

test("the shop lists products and a product can be added to the cart", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Kettle & Co." })).toBeVisible();
  await expect(page.getByRole("list", { name: "Products" }).getByRole("listitem")).toHaveCount(6);

  await page.getByRole("link", { name: /Stoneware mug/ }).click();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
});
