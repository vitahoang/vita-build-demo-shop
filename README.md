# Kettle & Co. demo shop

A small Next.js storefront used as Vita Build's system under test. Browse six products, add one to the cart, adjust its quantity, and complete a fake checkout. No payment is taken.

## Run locally

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Run `npm test`, `npm run e2e`, `npm run lint`, `npm run typecheck`, and `npm run build` to check the project. Install Playwright Chromium with `npx playwright install chromium` if it is missing.

## Intentional bug

Add the Stoneware mug ($24.00), open the cart, and press its increase button twice. The quantity becomes 3 and its line price becomes $72.00, but the cart total remains $24.00. `lib/pricing.test.ts` includes a skipped test for this known defect. The other pricing tests and the smoke test pass. This defect is deliberately left for a Vita Build QA agent to find and report.
