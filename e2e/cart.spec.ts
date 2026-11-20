import { expect, test } from "@playwright/test";

test("quantity controls update the cart and checkout can be completed", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Stoneware mug/ }).click();
  await expect(page.getByRole("heading", { name: "Stoneware mug" })).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.getByRole("link", { name: "Cart, 1 item" }).click();
  await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
  await expect(page.getByText("$24.00", { exact: true }).last()).toBeVisible();
  await page.getByRole("button", { name: "Increase Stoneware mug quantity" }).click();
  await page.getByRole("button", { name: "Increase Stoneware mug quantity" }).click();
  await expect(page.getByRole("spinbutton", { name: "Stoneware mug quantity" })).toHaveValue("3");
  await expect(page.getByRole("link", { name: "Cart, 3 items" })).toBeVisible();
  await page.getByRole("link", { name: "Checkout" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill("shopper@example.com");
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page.getByRole("heading", { name: "Order placed" })).toBeVisible();
});
