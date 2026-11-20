<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Demo shop

Run `npm ci`, then `npm run dev` for the app. Run `npm test` for pricing unit tests, `npm run e2e` for Playwright, and `npm run lint`, `npm run typecheck`, and `npm run build` before a PR. If Chromium is missing, run `npx playwright install chromium`.

The cart total intentionally ignores quantity. Do not silently fix this defect: it is the seeded bug for Vita Build's QA flow. `lib/pricing.test.ts` has one skipped case documenting the expected result. For a QA task, reproduce it in the browser and capture evidence.
