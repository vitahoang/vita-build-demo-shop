import { expect, test } from "@playwright/test";
import { runCase } from "./helpers";

test("TC-2 Change the quantity in the cart", async () => {
  await runCase("tc-2", async (page, shot) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Stoneware mug/ }).click();
    await page.getByRole("button", { name: "Add to cart" }).click();
    await page.getByRole("link", { name: /^Cart/ }).click();
    await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
    const inc = page.getByRole("button", { name: "Increase Stoneware mug quantity" });
    await inc.click();
    await inc.click();
    const qty = page.getByRole("spinbutton", { name: "Stoneware mug quantity" });
    await expect(qty).toHaveValue("3");
    // Read the real prices shown on the page before asserting.
    const main = await page.locator("main").innerText();
    console.log("CART PAGE TEXT:\n" + main);
    await shot();
    const prices = page.getByText("$72.00", { exact: true });
    await expect(prices, `expected line price and Total both $72.00; page showed:\n${main}`).toHaveCount(2);
  });
});
