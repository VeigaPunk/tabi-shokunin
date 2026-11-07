#!/usr/bin/env node
// Round 74 lesson proof: re-applies the three pre-freeze rules that were wrong to the committed
// pre-freeze receipts, beside the rules that replaced them, so each mined mistake is shown able
// to fail. Usage: node prefreeze-defects.mjs (reads ../controls/c1/smoke*.receipt.json; prints JSON)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const C = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'controls', 'c1');
const R = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => JSON.parse(fs.readFileSync(path.join(C, `smoke${i}.receipt.json`), 'utf8')));
const OLD_LOOK = /execCommand|dispatchEvent|new (Composition|Input|Keyboard)Event|\.value\s*=|textContent\s*=/;
const NEW_LOOK = /execCommand|dispatchEvent|new (Composition|Input|Keyboard)Event|\.value\s*\+?=(?!=)|textContent\s*\+?=(?!=)/;
const look = (re, r) => r.cdpSendLog.filter((c) => c.method === 'Runtime.evaluate' && re.test(c.params.expression || '')).length;
// M1: the first look-alike detector matched the driver's own readiness probe (`textContent ===`).
const m1 = { oldRuleHits: R.map((r) => look(OLD_LOOK, r)), newRuleHits: R.map((r) => look(NEW_LOOK, r)) };
// M2: the pinch generation's leg rule "every event trusted" refuses every honest IME run, because
// compositionend is untrusted (S190-S192).
const allTrusted = (r) => r.events.every((e) => e.isTrusted === true);
const m2 = { oldRuleHonestRunsPassing: R.filter(allTrusted).length, untrustedTypes: [...new Set(R.flatMap((r) => r.events.filter((e) => !e.isTrusted).map((e) => e.type)))] };
// M3: the first near-match replay tolerance (1 ms) would refuse honest pre-freeze pairs.
const maxDiff = (a, b) => Math.max(...a.events.map((e, i) => Math.max(Math.abs(e.ts - b.events[i].ts), Math.abs(e.at - b.events[i].at))));
const pairs = [];
for (let a = 0; a < 9; a++) for (let b = a + 1; b < 9; b++) pairs.push(maxDiff(R[a], R[b]));
const m3 = { honestPairs: pairs.length, minPairMaxDiffMs: Math.min(...pairs), refusedAtOldTolerance1ms: pairs.filter((d) => d <= 1).length, refusedAtFrozenTolerance005ms: pairs.filter((d) => d < 0.05).length };
const out = { schema: 'tabi-r74-lesson-proof', m1, m2, m3,
  shownAbleToFail: m1.oldRuleHits.every((n) => n > 0) && m1.newRuleHits.every((n) => n === 0) && m2.oldRuleHonestRunsPassing === 0 && m3.refusedAtOldTolerance1ms > 0 && m3.refusedAtFrozenTolerance005ms === 0 };
console.log(JSON.stringify(out, null, 1));
process.exit(out.shownAbleToFail ? 0 : 1);
