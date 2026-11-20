import { expect, test } from "@playwright/test";
import path from "node:path";
import { addMugAndOpenCart, closeCase, openCase, OUT } from "./helpers";

test("TC-2 Change the quantity in the cart", async ({ browser }) => {
  const { context, page } = await openCase(browser);
  let passed = false;
  try {
    await addMugAndOpenCart(page);
    const inc = page.getByRole("button", { name: "Increase Stoneware mug quantity" });
    await inc.click();
    await inc.click();
    await expect(page.getByRole("spinbutton", { name: "Stoneware mug quantity" })).toHaveValue("3");
    // Report what the page really shows before asserting.
    console.log("CART TEXT:\n" + (await page.locator("main").innerText()));
    // $72.00 must appear as the line price and as the cart Total (two places).
    await expect(page.getByText("$72.00", { exact: true })).toHaveCount(2);
    passed = true;
  } finally {
    await page.screenshot({ path: path.join(OUT, "tc-2.png") });
    await closeCase(context, page, "tc-2", passed);
  }
});
