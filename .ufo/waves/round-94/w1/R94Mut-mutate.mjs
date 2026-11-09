#!/usr/bin/env node
// R94Mut: single-point mutation sweep over the FROZEN counter
// scripts/check-backendnode-collision-round94.mjs (sha256 d7fd2cbe…2a95a).
// Each mutant = one exact string replacement that must occur exactly once in the pristine bytes.
// The mutant counter is placed in a scratch lane copy (battery resolves counter from --lane),
// then the frozen battery runs against the positive control receipt.
// killed   = battery rc 1 (some case or the positive case fails).
// killedBy = battery negative names that failed (attribution; positiveOk=false means the mutant
//            broke the positive case itself, which is detection but not a negative-case kill).
// Usage: node R94Mut-mutate.mjs   (needs the scratch lane at SCRATCH/lane, see report)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const SCRATCH = '/fast/scratch/hyaku/tabi-r94/R94Mut';
const LANE = path.join(SCRATCH, 'lane');
const OUT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-94/w1/R94Mut-results.json';
const COUNTER = path.join(LANE, 'scripts/check-backendnode-collision-round94.mjs');
const BATTERY = path.join(LANE, 'scripts/negatives-backendnode-collision-round94.mjs');
const PRISTINE = fs.readFileSync(COUNTER, 'utf8');
const FROZEN = 'd7fd2cbe0899ec59b639752d99f3cd22594dbe600300596cdcc6ce30abf2a95a';
const PIN = '518f40ff9b34727254a3bb0cd30603c70ce8488a911fa3a26a55273220f9686f';
const RECEIPT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-94/controls/receipt-positive.json';
const NONCE = 'tabi-r94-ctl-positive';
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
if (sha(PRISTINE) !== FROZEN) { console.error('pristine counter hash mismatch: ' + sha(PRISTINE)); process.exit(2); }

// [id, old (must occur exactly once), new, arm/theme]
const M = [
  ['M01-schema-eq', "check('schema', receipt.schema === SCHEMA", "check('schema', receipt.schema !== SCHEMA", 'global'],
  ['M02-nonce-eq', "check('nonce', receipt.nonce === expectNonce", "check('nonce', receipt.nonce !== expectNonce", 'global'],
  ['M03-driver-pin-and', 'receipt.driverSha256 === pin && driverSha === pin', 'receipt.driverSha256 === pin || driverSha === pin', 'global'],
  ['M04-chromium-includes', "receipt.chromium.includes(CHROMIUM_TAG)", "receipt.chromium.includes('zzz-nope')", 'global'],
  ['M05-cross-host', "receipt.crossHost === 'localhost'", "receipt.crossHost === '127.0.0.1'", 'global'],
  ['M06-reps-eq', 'receipt.reps === reps', 'receipt.reps !== reps', 'global'],
  ['M07-pad-eq', 'receipt.pad === PAD', 'receipt.pad !== PAD', 'global'],
  ['M08-ports-range-lo', 'p >= 1024 && p <= 65535', 'p >= 0 && p <= 65535', 'ports'],
  ['M09-ports-range-hi', 'p >= 1024 && p <= 65535', 'p >= 1024 && p <= 99999', 'ports'],
  ['M10-ports-distinct', 'new Set([ports.http, ports.child, ports.cdp]).size === 3', 'new Set([ports.http, ports.child, ports.cdp]).size >= 1', 'ports'],
  ['M11-leg-set-eq', "check('leg-set', eq(legs.map", "check('leg-set', !eq(legs.map", 'leg-set'],
  ['M12-failures-len', 'receipt.failures.length === 0', 'receipt.failures.length >= 0', 'global'],
  ['M13-fresh-browser-regex', '/^[0-9a-f-]{36}$/.test(b)', '/^[0-9a-f-]+$/.test(b)', 'fresh'],
  ['M14-fresh-browser-distinct', 'new Set(ids).size === ids.length', 'new Set(ids).size >= 1', 'fresh'],
  ['M15-leg-arm-and', '!!m && l.arm === arm && l.rep === Number(m[2])', '!!m && (l.arm === arm || l.rep === Number(m[2]))', 'leg'],
  ['M16-leg-error', "check('leg-error', l.error === null", "check('leg-error', l.error !== null", 'leg'],
  ['M17-browser-version', 'l.browserVersion === BROWSER', 'l.browserVersion !== BROWSER', 'leg'],
  ['M18-child-host', 'l.childHost === host', 'l.childHost !== host', 'leg'],
  ['M19-leg-pad', 'l.pad === pad', 'l.pad !== pad', 'leg'],
  ['M20-child-url-port', 'Number(cu.port) === ports.child', 'Number(cu.port) !== ports.child', 'leg'],
  ['M21-parent-host', "pu.hostname === '127.0.0.1'", "pu.hostname === 'localhost'", 'leg'],
  ['M22-iframe-len', 'attachedIframes.length === 1 && !!bit && bit.length === 1', 'attachedIframes.length >= 1 && !!bit && bit.length >= 1', 'C/M'],
  ['M23-iframe-targetId', 'bit[0].targetId === attachedIframes[0].targetId', 'bit[0].targetId !== attachedIframes[0].targetId', 'C/M'],
  ['M24-chooser-len', 'choosers.length === 1', 'choosers.length >= 1', 'chooser'],
  ['M25-chooser-session', 'c0.session === session', 'c0.session !== session', 'chooser'],
  ['M26-chooser-frame', 'c0.frameId === l.childFrameId', 'c0.frameId !== l.childFrameId', 'chooser'],
  ['M27-chooser-posint-drop', 'c0.frameId === l.childFrameId && isPosInt(B)', 'c0.frameId === l.childFrameId && true', 'chooser'],
  ['M28-describe-chooser-session', 'dc.session === session', 'dc.session !== session', 'chooser'],
  ['M29-describe-chooser-B', 'dc.B === B && dc.backendNodeId === B', 'dc.B !== B && dc.backendNodeId !== B', 'chooser'],
  ['M30-answer-session', 'l.answer.session === session', 'l.answer.session !== session', 'answer'],
  ['M31-answer-B', 'l.answer.B === B', 'l.answer.B !== B', 'answer'],
  ['M32-answer-error', 'l.answer.error === null', 'l.answer.error !== null', 'answer'],
  ['M33-child-files', 'eq(l.childFiles, [ANSWER])', 'eq(l.childFiles, [])', 'answer'],
  ['M34-child-click', "eq(l.childClicks, [{ target: 's', isTrusted: true }])", "eq(l.childClicks, [{ target: 's', isTrusted: false }])", 'answer'],
  // arm C
  ['M35-C-describe-error', "dp.error === null && dp.nodeName === '#document'", "dp.error === NO_NODE && dp.nodeName === '#document'", 'C'],
  ['M36-C-describe-B', 'dp.backendNodeId === B && dp.documentURL === l.parentUrl', 'dp.backendNodeId !== B && dp.documentURL !== l.parentUrl', 'C'],
  ['M37-C-describe-docurl', 'dp.documentURL === l.parentUrl', 'dp.documentURL !== l.parentUrl', 'C'],
  ['M38-C-root-B', 'rootIsParent && root.backendNodeId === B', 'rootIsParent && root.backendNodeId !== B', 'C'],
  ['M39-C-pierce-ge-to-gt', 'pp.inputS === 0 && pp.maxBackendNodeId >= B', 'pp.inputS === 0 && pp.maxBackendNodeId > B', 'C'],
  ['M40-C-pierce-ge-to-le', 'pp.inputS === 0 && pp.maxBackendNodeId >= B', 'pp.inputS === 0 && pp.maxBackendNodeId <= B', 'C'],
  ['M41-C-pierce-inputS', 'pp.inputS === 0 && pp.maxBackendNodeId >= B', 'pp.inputS === 1 && pp.maxBackendNodeId >= B', 'C'],
  ['M42-C-cross-NOTFILE', 'l.crossAnswer.error === NOT_FILE_INPUT', 'l.crossAnswer.error === NO_NODE', 'C'],
  ['M43-C-cross-B-unbound', "session === 'page' && l.crossAnswer.B === B && l.crossAnswer.error === NOT_FILE_INPUT", "session === 'page' && l.crossAnswer.B === B + 1 && l.crossAnswer.error === NOT_FILE_INPUT", 'C'],
  ['M44-C-cross-files-delivered', 'l.crossAnswer.error === NOT_FILE_INPUT && eq(l.filesAfterCross, [])', 'l.crossAnswer.error === NOT_FILE_INPUT && eq(l.filesAfterCross, [ANSWER])', 'C'],
  // arm M
  ['M45-M-describe-NONODE', 'dp.error === NO_NODE && dp.nodeName === null', 'dp.error === NOT_FILE_INPUT && dp.nodeName === null', 'M'],
  ['M46-M-root-ne', 'root.backendNodeId !== B', 'root.backendNodeId === B', 'M'],
  ['M47-M-pierce-lt', 'pp.maxBackendNodeId < B', 'pp.maxBackendNodeId >= B', 'M'],
  ['M48-M-pierce-lt-to-le', 'pp.maxBackendNodeId < B', 'pp.maxBackendNodeId <= B', 'M'],
  ['M49-M-pierce-inputS', 'pp.inputS === 0 && isPosInt(B) && pp.maxBackendNodeId < B', 'pp.inputS === 1 && isPosInt(B) && pp.maxBackendNodeId < B', 'M'],
  ['M50-M-cross-NONODE', 'l.crossAnswer.error === NO_NODE && eq(l.filesAfterCross, [])', 'l.crossAnswer.error === NOT_FILE_INPUT && eq(l.filesAfterCross, [])', 'M'],
  ['M51-M-cross-files-delivered', 'l.crossAnswer.error === NO_NODE && eq(l.filesAfterCross, [])', 'l.crossAnswer.error === NO_NODE && eq(l.filesAfterCross, [ANSWER])', 'M'],
  // arm S
  ['M52-S-describe-input', "isInputS(dp) && dp.session === 'page'", "!isInputS(dp) && dp.session === 'page'", 'S'],
  ['M53-S-describe-B', 'dp.B === B && dp.backendNodeId === B', 'dp.B !== B && dp.backendNodeId !== B', 'S'],
  ['M54-S-root', 'check(\'page-root\', rootIsParent, id', 'check(\'page-root\', !rootIsParent, id', 'S'],
  ['M55-S-pierce-inputS', 'pp.inputS === 1 && pp.maxBackendNodeId >= B', 'pp.inputS === 0 && pp.maxBackendNodeId >= B', 'S'],
  ['M56-S-pierce-ge-to-gt', 'pp.inputS === 1 && pp.maxBackendNodeId >= B', 'pp.inputS === 1 && pp.maxBackendNodeId > B', 'S'],
  ['M57-S-cross-null', 'l.crossAnswer === null && l.filesAfterCross === null', 'l.crossAnswer !== null && l.filesAfterCross !== null', 'S'],
  // construction
  ['M58-want-order', "['C', 'M', 'S']", "['C', 'S', 'M']", 'construction'],
  ['M59-want-drop-M', "['C', 'M', 'S']", "['C', 'S']", 'construction'],
  ['M60-pad-const', 'const PAD = 300;', 'const PAD = 0;', 'construction'],
  ['M61-NOFILE-const', "const NOT_FILE_INPUT = 'Node is not a file input element'", "const NOT_FILE_INPUT = 'No node found for given backend id'", 'construction'],
  ['M62-NONODE-const', "const NO_NODE = 'No node found for given backend id'", "const NO_NODE = 'Node is not a file input element'", 'construction'],
  ['M63-host-swap', "const host = cross ? 'localhost' : '127.0.0.1'", "const host = cross ? '127.0.0.1' : 'localhost'", 'construction'],
  ['M64-C-pad-cond', "const pad = arm === 'C' ? 0 : PAD;", "const pad = arm === 'C' ? PAD : 0;", 'construction'],
  ['M65-chooser-B-binding', 'const B = c0.backendNodeId;', 'const B = c0.backendNodeId + 1;', 'construction'],
  ['M66-rootIsParent-doc', "root.nodeName === '#document'", "root.nodeName === 'HTML'", 'construction'],
  ['M67-rootIsParent-url', 'root.documentURL === l.parentUrl', 'root.documentURL !== l.parentUrl', 'construction'],
  ['M68-isInputS-file', "attr(shape, 'type') === 'file'", "attr(shape, 'type') === 'text'", 'construction'],
  ['M69-ppOk-int', 'Number.isInteger(pp.maxBackendNodeId)', "typeof pp.maxBackendNodeId === 'string'", 'construction'],
  ['M70-arm-C-branch', "if (arm === 'C') {", "if (arm === 'M') {", 'construction'],
];

const work = path.join(SCRATCH, 'mutants');
fs.mkdirSync(work, { recursive: true });
const results = [];
for (const [id, oldStr, newStr, theme] of M) {
  const n = PRISTINE.split(oldStr).length - 1;
  if (n !== 1) { results.push({ id, theme, old: oldStr, line: newStr, killed: null, note: 'SETUP: anchor occurs ' + n + ' times' }); continue; }
  const mutated = PRISTINE.split(oldStr).join(newStr);
  const mLane = path.join(work, id, 'lane');
  const mScratch = path.join(work, id, 'scratch');
  fs.mkdirSync(path.join(mLane, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(mLane, 'corpus/evidence/round93/chromium-oopif-backendnode-scope'), { recursive: true });
  for (const f of ['chrome-cdp-backendnode-collision-round94.mjs', 'negatives-backendnode-collision-round94.mjs']) fs.copyFileSync(path.join(LANE, 'scripts', f), path.join(mLane, 'scripts', f));
  fs.writeFileSync(path.join(mLane, 'scripts/check-backendnode-collision-round94.mjs'), mutated);
  fs.copyFileSync(path.join(LANE, 'corpus/evidence/round93/chromium-oopif-backendnode-scope/receipt.json'), path.join(mLane, 'corpus/evidence/round93/chromium-oopif-backendnode-scope/receipt.json'));
  const syn = spawnSync(process.execPath, ['--check', path.join(mLane, 'scripts/check-backendnode-collision-round94.mjs')], { encoding: 'utf8' });
  if (syn.status !== 0) { results.push({ id, theme, old: oldStr, line: newStr, killed: true, syntaxError: true, note: 'mutant is a syntax error' }); continue; }
  const r = spawnSync(process.execPath, [BATTERY, '--lane', mLane, '--receipt', RECEIPT, '--expect-nonce', NONCE, '--expect-driver-sha256', PIN, '--scratch', mScratch, '--json'], { encoding: 'utf8', timeout: 180000 });
  let cases = [];
  try { cases = JSON.parse(r.stdout).results; } catch {}
  const pos = cases.find((c) => c.name === 'positive');
  const killedBy = cases.filter((c) => c.name !== 'positive' && !c.ok).map((c) => c.name);
  results.push({ id, theme, old: oldStr, line: newStr, killed: r.status === 1, rc: r.status, positiveOk: pos ? pos.ok : null, killedBy });
  console.log((r.status === 1 ? 'KILLED  ' : 'SURVIVED') + ' ' + id + ' rc=' + r.status + (pos && !pos.ok ? ' (positive broke)' : ''));
}
const scored = results.filter((x) => x.killed !== null);
const k = scored.filter((x) => x.killed).length;
const out = {
  frozenCounterSha256: FROZEN, batteryPin: PIN, batterySha256: 'b750ee17b7784d23fbc6c13f5356d1485f05f5702023e48f928730b6cfcd7822',
  positiveReceipt: RECEIPT, positiveReceiptSha256: 'f511f644e0a0073d4bce0f8d2001cb6836c1e4e6e55fe5a153962a5fc4eafa7c',
  mutantCount: scored.length, killed: k, survived: scored.length - k,
  killedOnlyByPositiveBreak: scored.filter((x) => x.killed && x.positiveOk === false && x.killedBy.length === 0).map((x) => x.id),
  results,
};
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log('total ' + scored.length + ' killed ' + k + ' survived ' + (scored.length - k));
