#!/usr/bin/env node
// build-G2-honest-body-edit.mjs — round-33 C2 next-generation forgery G2
// ("one real transcript with its newSession body edited to a fresh id").
//
// Attacked rule: gate v2 clause (2). One of the two real round-32 transcripts is copied
// byte-for-byte to a new path; only its single `http-res /session` line is rewritten so
// the sessionId is a fresh 32-lowercase-hex value and capabilities.webSocketUrl is
// `ws://127.0.0.1:<fresh port>/session/<fresh id>`. The receipt's `observed` entry for
// that run has its recorded webSocketUrl rewritten to match, so the receipt and the
// transcript stay internally consistent. Everything else — 70 transcript lines of real
// wire traffic, the real screenshot, the real chromedriverVersion, the real driver —
// is untouched.
//
// Why it matters: clause (2) is a shape check, and session identity is a value the
// transcript's author writes. Nothing in the v2 rule set binds a run's declared session
// to anything the gate can observe, so a *real* run can be re-signed with a fresh id
// and still satisfy "distinct sessionIds across runs".
//
// Usage: node build-G2-honest-body-edit.mjs --repo <clone> --rev <40hex> [--json]
import {
  commit, emit, honest, parseArgs, patchObserved, patchSession, prepareVariant, put,
  sha256, sid32, port, observedWs, RECEIPT,
} from './forge-common.mjs';

const o = parseArgs(process.argv.slice(2), { repo: 'str', rev: 'str', json: 'bool' });
if (!o.repo || !o.rev) throw new Error('--repo and --rev are required');

const repo = prepareVariant(o.repo, o.rev);
const h = honest(repo, o.rev);

const freshSid = sid32();
const freshWs = `ws://127.0.0.1:${port(20000, 60000)}/session/${freshSid}`;
const original = h.t2.toString('utf8');
const edited = patchSession(original, { sid: freshSid, ws: freshWs });
const rel = 'corpus/evidence/round-32/bidi/g2/run2/transcript.jsonl';
put(repo, rel, edited);

const obs = h.receipt.runs[1].observed;
const runs = [
  h.receipt.runs[0],
  {
    ...h.receipt.runs[1],
    transcript: rel,
    transcriptSha256: sha256(Buffer.from(edited)),
    observed: patchObserved(obs, [[observedWs(obs), freshWs]]),
  },
];
const receiptText = JSON.stringify({ ...h.receipt, runs }, null, 1) + '\n';
put(repo, RECEIPT, receiptText);

// Evidence of how small the edit is: only line 1 differs from the honest bytes.
const a = original.split('\n');
const b = edited.split('\n');
const changed = a.map((l, i) => (l === b[i] ? null : i + 1)).filter(Boolean);
if (changed.length !== 1 || changed[0] !== 1) throw new Error(`G2 edited ${changed.length} line(s), expected only line 1`);

const rc = commit(repo, 'forge G2: real transcript re-signed with a fresh session id');
emit({
  variant: 'G2',
  commit: rc,
  files: [
    { path: rel, sha256: sha256(Buffer.from(edited)), bytes: Buffer.byteLength(edited) },
    { path: RECEIPT, sha256: sha256(Buffer.from(receiptText)), bytes: Buffer.byteLength(receiptText) },
  ],
  attack: {
    rule: 'v2 clause (2) session provenance',
    freshSessionId: freshSid,
    freshWebSocketUrl: freshWs,
    honestTranscriptSha256: sha256(h.t2),
    editedTranscriptSha256: sha256(Buffer.from(edited)),
    linesChanged: changed,
    line1Before: a[0].slice(0, 160),
    line1After: b[0].slice(0, 160),
  },
}, o.json);
