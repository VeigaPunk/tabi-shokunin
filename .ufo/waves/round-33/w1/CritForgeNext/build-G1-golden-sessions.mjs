#!/usr/bin/env node
// build-G1-golden-sessions.mjs — round-33 C2 next-generation forgery G1
// ("golden transcripts with real-shaped 32-hex session ids, matching webSocketUrl,
//  distinct bases and uppercase-hex contexts").
//
// Attacked rule: gate v2 clause (2) as specified in this wave's ExecGateV2 item —
// "each run's newSession body has a sessionId matching ChromeDriver's id shape (the
// honest transcripts carry 32 lowercase hex …) and a capabilities.webSocketUrl
// `ws://127.0.0.1:<port>/session/<that sessionId>`, sessionIds distinct across runs,
// and browsing-context ids not the golden constants (honest contexts are 32 uppercase
// hex)".
//
// Construction: two transcripts from the pinned v1 gate's own goldenLines() generator,
// each with a freshly generated 32-lowercase-hex session id, a matching loopback
// webSocketUrl, its own loopback base and a 32-uppercase-hex browsing context; the
// honest run1's real first screenshot and the real chromedriverVersion are spliced in;
// the honest driver, entry and registry rows are left untouched. Every byte clause (2)
// inspects is attacker-authored except the screenshot payload.
//
// `--ids golden` reproduces the round-32 F1 shape (sessionId "X", context "C1", port
// 9515) as the calibration arm: the predictor must refuse it, so its admission of the
// real-shaped arm is not vacuous.
//
// Usage: node build-G1-golden-sessions.mjs --repo <clone> --rev <40hex> --tmp <dir>
//          [--ids real|golden] [--json]
import {
  commit, emit, honest, loadGolden, parseArgs, patchObserved, patchSession,
  prepareVariant, put, replCtx, sha256, ctx32, sid32, port, observedWs, observedBase,
  RECEIPT,
} from './forge-common.mjs';

const o = parseArgs(process.argv.slice(2), { repo: 'str', rev: 'str', tmp: 'str', ids: 'str', json: 'bool' });
if (!o.repo || !o.rev || !o.tmp) throw new Error('--repo, --rev and --tmp are required');
const idsMode = o.ids || 'real';
if (!['real', 'golden'].includes(idsMode)) throw new Error('--ids must be real or golden');

const repo = prepareVariant(o.repo, o.rev);
const { goldenLines } = await loadGolden(repo, o.tmp);
const h = honest(repo, o.rev);

const mk = (i, base, sid, ws, ctx) => {
  const text = goldenLines({
    base,
    version: h.receipt.browserVersion,
    driverVersion: h.cdv,
    mutate: (steps) => {
      for (const s of steps) { s[2] = replCtx(s[2], ctx); s[3] = replCtx(s[3], ctx); }
      if (idsMode === 'real') {
        // Transplant the honest run's getTree context objects (children, clientWindow,
        // userContext …) so the synthetic transcript's objects have a real run's shape.
        const gt = steps.find((x) => x[1] === 'browsingContext.getTree');
        if (!gt) throw new Error('golden generator has no getTree step');
        gt[3] = { contexts: h.contexts[i].map((c) => ({ ...c, context: ctx })) };
      }
      const shot = steps.find((x) => x[1] === 'browsingContext.captureScreenshot');
      if (!shot) throw new Error('golden generator has no captureScreenshot step');
      shot[3] = { data: h.shot };
    },
  });
  return idsMode === 'golden' ? text : patchSession(text, { sid, ws, body: h.bodies[i] });
};

const forged = [];
for (let i = 0; i < 2; i += 1) {
  const base = `http://127.0.0.1:${idsMode === 'golden' ? 40000 + i : port(20000, 60000)}`;
  const sid = idsMode === 'golden' ? 'X' : sid32();
  const ws = idsMode === 'golden' ? 'ws://127.0.0.1:9515/session/X' : `ws://127.0.0.1:${port(20000, 60000)}/session/${sid}`;
  const ctx = idsMode === 'golden' ? 'C1' : ctx32();
  const rel = `corpus/evidence/round-32/bidi/g1/run${i + 1}/transcript.jsonl`;
  const text = mk(i, base, sid, ws, ctx);
  put(repo, rel, text);
  forged.push({ name: `run${i + 1}`, transcript: rel, transcriptSha256: sha256(Buffer.from(text)), bytes: Buffer.byteLength(text), base, sid, ws, ctx });
}
if (idsMode === 'real') {
  const [a, b] = forged;
  if (a.sid === b.sid) throw new Error('G1 session ids collided');
  if (a.ctx === b.ctx) throw new Error('G1 contexts collided');
  if (a.base === b.base) throw new Error('G1 bases collided');
}

const runs = forged.map((r, i) => {
  const obs = h.receipt.runs[i].observed;
  return {
    name: r.name,
    transcript: r.transcript,
    transcriptSha256: r.transcriptSha256,
    observed: patchObserved(obs, [[observedWs(obs), r.ws], [observedBase(obs), r.base]]),
  };
});
const receiptText = JSON.stringify({ ...h.receipt, runs }, null, 1) + '\n';
put(repo, RECEIPT, receiptText);

const rc = commit(repo, `forge G1 (${idsMode} ids): golden sessions with matched webSocketUrl`);
emit({
  variant: idsMode === 'golden' ? 'G1-calib-golden-ids' : 'G1',
  commit: rc,
  files: [
    ...forged.map((r) => ({ path: r.transcript, sha256: r.transcriptSha256, bytes: r.bytes })),
    { path: RECEIPT, sha256: sha256(Buffer.from(receiptText)), bytes: Buffer.byteLength(receiptText) },
  ],
  attack: {
    rule: 'v2 clause (2) session provenance',
    idsMode,
    runs: forged.map((r) => ({ sid: r.sid, ws: r.ws, ctx: r.ctx, base: r.base })),
  },
}, o.json);
