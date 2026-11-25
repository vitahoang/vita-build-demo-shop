# QA files

Vita Build reads this shop's test cases and plans from here, on the default branch.

- `qa/test-cases/<id>.md`: one case. Front matter `id` (must match the file name), `title`, and an optional `plan`. Then `## Steps` and `## Expected`.
- `qa/test-plans/<id>.md`: one plan. Front matter `id`, `title` and `cases: [...]` (the run order). The body is free text.

The cases are written in Vietnamese, like a real QC team's work. Change them through a PR.

## Replanting the demo bug

The demo depends on a known bug: the cart total ignores quantity (TC-103 fails). After a fix for it has merged, put it back before the next rehearsal:

```sh
./scripts/replant-demo-bug.sh
```

It restores the buggy `cartTotal` in `lib/pricing.ts` and skips the matching test in `lib/pricing.test.ts` again. Running it twice changes nothing the second time. It edits the working tree only: commit and push the result yourself.
