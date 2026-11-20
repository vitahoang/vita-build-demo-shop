import { test as base, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const OUT = process.env.QA_OUT ?? "/mnt/session/outputs";

// Records a video for every case, and keeps it as <id>.webm only when the case fails.
export const test = base.extend<{ qa: { shot: (page: Page, id: string) => Promise<void> } }>({
  context: async ({ browser, baseURL }, use, testInfo) => {
    const dir = testInfo.outputPath("video");
    const context = await browser.newContext({
      baseURL,
      ignoreHTTPSErrors: true,
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir, size: { width: 1280, height: 720 } },
    });
    await use(context);
    const pages = context.pages();
    await context.close();
    if (testInfo.status !== testInfo.expectedStatus) {
      const id = testInfo.title.split(" ")[0].toLowerCase();
      for (const p of pages) {
        const v = p.video();
        if (v) fs.copyFileSync(await v.path(), path.join(OUT, `${id}.webm`));
      }
    }
  },
  qa: async ({}, use) => {
    await use({
      shot: async (page, id) => {
        await page.screenshot({ path: path.join(OUT, `${id.toLowerCase()}.png`) });
      },
    });
  },
});
export { expect } from "@playwright/test";
