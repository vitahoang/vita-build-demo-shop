#!/bin/sh
# Puts the demo's cart-total bug back after a fix has removed it (the total ignores quantity).
# Safe to run any number of times: if the bug is already planted, nothing changes.
# It edits the working tree only. Commit and push the result yourself.
set -eu
cd "$(dirname "$0")/.."

node - <<'NODE'
const fs = require("node:fs");

const BUGGY = [
  "export function cartTotal(lines: PricedLine[]): number {",
  "  return lines.reduce((sum, line) => sum + line.unitPrice, 0);",
  "}",
].join("\n");

let changed = false;

// lib/pricing.ts: cartTotal must sum unit prices without the quantity.
const pricing = "lib/pricing.ts";
let src = fs.readFileSync(pricing, "utf8");
const fn = /export function cartTotal\([^)]*\)[^{]*\{[\s\S]*?\n\}/;
if (!fn.test(src)) throw new Error("cartTotal not found in " + pricing);
if (!src.match(fn)[0].includes("sum + line.unitPrice,")) {
  src = src.replace(fn, BUGGY);
  fs.writeFileSync(pricing, src);
  changed = true;
  console.log("replanted the bug in " + pricing);
}

// lib/pricing.test.ts: the test that catches it goes back to being skipped.
const test = "lib/pricing.test.ts";
let spec = fs.readFileSync(test, "utf8");
const title = 'it("counts every unit when a quantity goes from 1 to 3"';
if (spec.includes(title)) {
  spec = spec.replace(title, 'it.skip("counts every unit when a quantity goes from 1 to 3"');
  fs.writeFileSync(test, spec);
  changed = true;
  console.log("skipped the quantity test again in " + test);
}

if (!changed) console.log("the bug is already planted: nothing to do");
NODE
