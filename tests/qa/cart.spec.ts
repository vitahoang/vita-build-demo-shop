import { expect, test } from "./helpers";

async function addMugAndOpenCart(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("link", { name: /Stoneware mug/ }).click();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.getByRole("link", { name: /^Cart/ }).click();
  await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
}

test("TC-1 Add a product to the cart", async ({ page, qa }) => {
  await addMugAndOpenCart(page);
  await qa.shot(page, "tc-1");
  await expect(page.getByText("Stoneware mug").first()).toBeVisible();
  await expect(page.getByRole("spinbutton", { name: "Stoneware mug quantity" })).toHaveValue("1");
  await expect(page.getByRole("link", { name: "Cart, 1 item", exact: true })).toBeVisible();
});

test("TC-2 Change the quantity in the cart", async ({ page, qa }) => {
  await addMugAndOpenCart(page);
  const inc = page.getByRole("button", { name: "Increase Stoneware mug quantity" });
  await inc.click();
  await inc.click();
  const qty = page.getByRole("spinbutton", { name: "Stoneware mug quantity" });
  await expect(qty).toHaveValue("3");
  await qa.shot(page, "tc-2");
  const main = page.locator("main");
  console.log("CART TEXT:\n" + (await main.innerText()));
  // Line price and Total must both read $72.00 (3 x $24.00).
  await expect(main.getByText("$72.00", { exact: true })).toHaveCount(2);
});
