import { expect, test } from "@playwright/test";
import path from "node:path";
import { addMugAndOpenCart, closeCase, openCase, OUT } from "./helpers";

test("TC-1 Add a product to the cart", async ({ browser }) => {
  const { context, page } = await openCase(browser);
  let passed = false;
  try {
    await addMugAndOpenCart(page);
    await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
    await expect(page.getByText("Stoneware mug").first()).toBeVisible();
    await expect(page.getByRole("spinbutton", { name: "Stoneware mug quantity" })).toHaveValue("1");
    await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
    passed = true;
  } finally {
    await page.screenshot({ path: path.join(OUT, "tc-1.png") });
    await closeCase(context, page, "tc-1", passed);
  }
});
