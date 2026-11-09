#!/usr/bin/env node
// R95Mut mutant sweep: >=40 single-point mutants of the frozen counter.
// A mutant is killed iff the negatives battery exits 1 against it (pristine battery exits 0).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const ROOT = '/fast/scratch/hyaku/tabi-r95/R95Mut';
const LANE = path.join(ROOT, 'lane');
const COUNTER = path.join(LANE, 'scripts/check-backendnode-misdelivery-round95.mjs');
const BATTERY = path.join(LANE, 'scripts/negatives-backendnode-misdelivery-round95.mjs');
const RECEIPT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round95/chromium-oopif-backendnode-misdelivery/receipt.json';
const NONCE = 'tabi-r95-live-36ad06703d0b';
const PIN = '24947b00d8a158ad3fea8f5fb035757b6b98aebf48e85d18d506433619e2ee82';
const PRISTINE_SHA = 'b7b464daa7c3c60f771b836cae8d8045fece1b2cca28aba4af70d154738d2775';
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

const pristine = fs.readFileSync(COUNTER, 'utf8');
if (sha(pristine) !== PRISTINE_SHA) { console.error('pristine hash mismatch: ' + sha(pristine)); process.exit(2); }

// [id, old, new, note] — each old must occur exactly once in the frozen source.
const M = [
  ['M01', "receipt.schema === SCHEMA", "true", 'global schema check removed'],
  ['M02', "receipt.nonce === expectNonce", "true", 'global nonce check removed'],
  ['M03', "receipt.driverSha256 === pin && driverSha === pin", "true", 'global driver-pin check removed'],
  ['M04', "receipt.chromium.includes(CHROMIUM_TAG)", "true", 'global chromium check removed'],
  ['M05', "receipt.crossHost === 'localhost'", "true", 'global crossHost check removed'],
  ['M06', "receipt.reps === reps", "true", 'global reps check removed'],
  ['M07', "receipt.pad === PAD", "true", 'global pad check removed'],
  ['M08', "eq(receipt.qs, QS) && receipt.zq === ZQ && receipt.sq === SQ && receipt.k === K", "true", 'global fixture check removed'],
  ['M09', "eq(receipt.answer, { name: ANSWER[0], size: ANSWER[1] })", "true", 'global answer-identity check removed'],
  ['M10', "p >= 1024 && p <= 65535", "p >= 0 && p <= 70000", 'ports window widened'],
  ['M11', "new Set([ports.http, ports.child, ports.cdp]).size === 3", "true", 'ports distinctness removed'],
  ['M12', "eq(legs.map((l) => (isObj(l) ? l.leg : null)), want)", "true", 'leg-set exact-order check removed'],
  ['M13', "receipt.failures.length === 0 && errLegs.length === 0", "true", 'failures polarity removed'],
  ['M14', "new Set(ids).size === ids.length", "true", 'fresh-browser uniqueness removed'],
  ['M15', "pBranch(branches.misdelivery).length >= 1", "pBranch(branches.misdelivery).length >= 0", 'misdelivery threshold 1->0'],
  ['M16', "pBranch(branches.collision).length >= 1", "pBranch(branches.collision).length >= 0", 'collision threshold 1->0'],
  ['M17', "pBranch(branches.misdelivery).length >= 1", "pBranch(branches.misdelivery).length >= 2", 'misdelivery threshold 1->2 (strict)'],
  ['M18', "pBranch(branches.collision).length >= 1", "pBranch(branches.collision).length >= 2", 'collision threshold 1->2 (strict)'],
  ['M19', "check('leg-error', l.error === null", "check('leg-error', true", 'per-leg error check removed'],
  ['M20', "check('browser-version', l.browserVersion === BROWSER", "check('browser-version', true", 'per-leg browserVersion removed'],
  ['M21', "cu.hostname === host", "true", 'child-url host removed'],
  ['M22', "cu.username === '' && cu.password === ''", "true", 'child-url userinfo removed'],
  ['M23', "cu.hash === ''", "true", 'child-url fragment removed'],
  ['M24', "pu.hostname === '127.0.0.1'", "true", 'parent-url host removed'],
  ['M25', "pu.username === '' && pu.password === '' && pu.hash === ''", "true", 'parent-url userinfo/fragment removed'],
  ['M26', "attachedIframes.length === 1", "attachedIframes.length >= 0", 'cross iframe-targets count 1->0'],
  ['M27', "bit.length === 1 && isObj(bit[0])", "true", 'cross listed-target check weakened'],
  ['M28', "attachedIframes.length === 0 && !!bit && bit.length === 0", "true", 'S zero-iframe-targets removed'],
  ['M29', "choosers.length === 1", "choosers.length >= 0", 'chooser count 1->0'],
  ['M30', "c0.session === session", "true", 'chooser session removed'],
  ['M31', "c0.frameId === l.childFrameId", "true", 'chooser frameId removed'],
  ['M32', "dc.error === null", "true", 'describe-chooser error removed'],
  ['M33', "isInputS(dc)", "true", 'describe-chooser INPUT#s removed'],
  ['M34', "dc.session === session", "true", 'describe-chooser session removed'],
  ['M35', "sn.error === null", "true", 'snapshot error removed'],
  ['M36', "sn.B === B", "true", 'snapshot B echo removed'],
  ['M37', "sn.rootNodeName === '#document'", "true", 'snapshot root name removed'],
  ['M38', "sn.rootDocumentURL === l.parentUrl", "true", 'snapshot root URL removed'],
  ['M39', "sn.atB.length <= 1", "sn.atB.length <= 2", 'atB uniqueness 1->2'],
  ['M40', "sn.inputS === (cross ? 0 : 1)", "true", 'snapshot inputS count removed'],
  ['M41', "eq(pIds.map((x) => (Array.isArray(x) ? x[0] : null)), PIDS)", "true", 'parent-inputs id list removed'],
  ['M42', "new Set(pIds.map((x) => x[1])).size === K", "true", 'parent-inputs distinct ids removed'],
  ['M43', "dp.error === null && sameNode(dp, T)", "true", 'describe-page identity/equality removed'],
  ['M44', "dp.error === NO_NODE", "true", 'describe-page miss error removed'],
  ['M45', "dp.nodeName === null", "true", 'describe-page miss null nodeName removed'],
  ['M46', "ca.session === 'page' && ca.B === B && ca.error === null", "true", 'cross-answer misdelivery session/B/error removed'],
  ['M47', "ca.error === (T ? NOT_FILE_INPUT : NO_NODE)", "ca.error === NOT_FILE_INPUT", 'cross-answer miss branch expects wrong error'],
  ['M48', "eq(filled, [target])", "true", 'parent-files exact-one-filled removed'],
  ['M49', "eq(pf.find((x) => x[0] === target)[1], [ANSWER])", "true", 'parent-files exact answer value removed'],
  ['M50', "check('parent-files', pfShapeOk && eq(filled, []), id", "check('parent-files', pfShapeOk, id", 'collision parent-files all-empty removed'],
  ['M51', "eq(l.filesAfterCross, [])", "true", 'child-files-after-cross removed'],
  ['M52', "isInputS(T) && T.backendNodeId === B", "true", 'S snapshot-node INPUT#s removed'],
  ['M53', "ca === null && pf === null && l.filesAfterCross === null", "true", 'S no-cross-answer removed'],
  ['M54', "sn.maxBackendNodeId < B", "sn.maxBackendNodeId <= B", 'Z max<B weakened to <='],
  ['M55', "l.answer.error === null", "true", 'answer error removed'],
  ['M56', "l.answer.session === session", "true", 'answer session removed'],
  ['M57', "eq(l.childFiles, [ANSWER])", "true", 'child-files exact answer removed'],
  ['M58', "eq(l.childClicks, [{ target: 's', isTrusted: true }])", "true", 'child-click trusted removed'],
  ['M59', "a.nodeType === b.nodeType", "true", 'sameNode nodeType field removed'],
  ['M60', "a.nodeName === b.nodeName &&", "", 'sameNode nodeName field removed'],
  ['M61', "eq(a.attributes, b.attributes)", "true", 'sameNode attributes field removed'],
  ['M62', "attr(shape, 'type') === 'file'", "true", 'isInputS type field removed'],
  ['M63', "PIDS.includes(attr(shape, 'id'))", "true", 'parentFileInputId id-list removed'],
];

const results = [];
for (let i = 0; i < M.length; i++) {
  const [id, oldStr, newStr, note] = M[i];
  const n = pristine.split(oldStr).length - 1;
  if (n !== 1) { results.push({ id, note, status: 'SKIP-pattern-count-' + n, killed: null }); console.log(id + ' SKIP pattern-count=' + n); continue; }
  const mutant = pristine.replace(oldStr, newStr);
  if (mutant === pristine) { results.push({ id, note, status: 'SKIP-noop', killed: null }); continue; }
  fs.writeFileSync(COUNTER, mutant);
  const scratch = path.join(ROOT, 'bat-' + (i + 1));
  const r = spawnSync(process.execPath, [BATTERY, '--lane', LANE, '--receipt', RECEIPT, '--expect-nonce', NONCE, '--expect-driver-sha256', PIN, '--scratch', scratch], { encoding: 'utf8', timeout: 120000 });
  fs.writeFileSync(COUNTER, pristine);
  const restored = sha(fs.readFileSync(COUNTER, 'utf8')) === PRISTINE_SHA;
  let summary = '';
  try { const j = JSON.parse(r.stdout); summary = 'cases=' + j.cases + ' ok=' + j.ok + ' failed=' + JSON.stringify(j.failed); } catch { summary = 'stdout head: ' + (r.stdout || '').slice(0, 200); }
  const killed = r.status === 1;
  results.push({ id, note, status: killed ? 'KILLED' : 'SURVIVED', killed, rc: r.status, summary, restored, mutantSha: sha(mutant) });
  console.log(id + ' ' + (killed ? 'KILLED' : 'SURVIVED') + ' rc=' + r.status + ' restored=' + restored + ' | ' + note + ' | ' + summary);
}
fs.writeFileSync(path.join(ROOT, 'sweep-results.json'), JSON.stringify({ pristineSha: PRISTINE_SHA, results }, null, 2));
console.log('TOTAL ' + results.length + ' KILLED ' + results.filter((x) => x.killed === true).length + ' SURVIVED ' + results.filter((x) => x.killed === false).length + ' SKIPPED ' + results.filter((x) => x.killed === null).length);
