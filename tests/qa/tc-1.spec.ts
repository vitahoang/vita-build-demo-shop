import { expect, test } from "@playwright/test";
import { runCase } from "./helpers";

test("TC-1 Add a product to the cart", async () => {
  await runCase("tc-1", async (page, shot) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Stoneware mug/ }).click();
    await page.getByRole("button", { name: "Add to cart" }).click();
    await page.getByRole("link", { name: /^Cart/ }).click();
    await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
    await expect(page.getByText("Stoneware mug").first()).toBeVisible();
    await expect(page.getByRole("spinbutton", { name: "Stoneware mug quantity" })).toHaveValue("1");
    await shot();
    await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
  });
});
