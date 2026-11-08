#!/usr/bin/env node
// Build the R90Exec4 refusal matrix table from the two score summaries.
import fs from 'node:fs';
const d1 = JSON.parse(fs.readFileSync('/fast/scratch/hyaku/tabi-r90/R90Exec4/scores/summary.json', 'utf8'));
const d3 = JSON.parse(fs.readFileSync('/fast/scratch/hyaku/tabi-r90/R90Exec4/scores-d3/summary.json', 'utf8'));
const D = {
 'm00-identity': 'control: unmodified scored-receipt clone (same exemption)',
 'm01-remove-settle': 'delete the settle `Runtime.evaluate` from `sp89-accept-domread-text`; renumber ids',
 'm02-rename-plain-inputs': 'rename the settle expression to plain `window.__inputs()` (allowlisted)',
 'm03-duplicate-settle': 'duplicate the settle `Runtime.evaluate` immediately after itself; renumber',
 'm04-move-settle-after-dismiss': 'move the settle `Runtime.evaluate` after the dismiss `{cancel:true}`; renumber',
 'm05-add-settle-to-non-domread': 'insert the settle `Runtime.evaluate` after the first `window.__state()` of `sp84-accept-answer` (kind showpicker-answer)',
 'm06-settle-returnbyvalue-false': 'settle `returnByValue:false`',
 'm07-extra-eval-between-state-settle': 'insert allowlisted `window.__late` between the settle `window.__state()` and the settle call',
 'm08-swap-domread-logs': 'swap the whole send logs of `sp89-accept-domread-text` and `sp89-accept-domread-png`; rebind ids',
 'm09-swap-domread-with-same-target-answer': 'swap send logs of `sp89-accept-domread-text` and `sp86-accept-wildcard-text` (same target `aw`/answer `a.txt`); event logs untouched',
 'm10-swap-same-target-answer-logs': 'swap send logs of `sp84-accept-answer` and `sp84-accept-mime-answer` (same target `k`); mirror the answer record',
 'm11-extra-late-after-settle': 'insert `window.__late` between the settle call and the dismiss',
 'm12-extra-plain-inputs-after-settle': 'insert plain `window.__inputs()` between the settle call and the dismiss',
 'm13-plain-preread-returnbyvalue-false': 'set the pre-read plain `window.__inputs()` (id 9) `returnByValue:false`',
 'm14-rebind-settle-to-post-dismiss-state': 'remove settle-state + settle; reinsert both after the surviving post-dismiss state',
 'm15-move-state-settle-pair-after-dismiss': 'move the (`window.__state()`, settle) pair after the dismiss',
 'm16-nonallowlisted-eval-after-settle': 'insert non-allowlisted `window.__inputs(true)||0` between settle and dismiss',
 'm17-non-domread-preread-becomes-settle': 'change `sp84-accept-answer`\'s pre-read plain `window.__inputs()` to the settle expression',
 'm18-post-dismiss-state-returnbyvalue-false': 'set the post-dismiss `window.__state()` `returnByValue:false`',
 'm19-extra-state-after-settle': 'insert an extra `window.__state()` between the settle call and the dismiss',
 'm20-swap-answer-logs-pure': 'swap send logs of `sp84-accept-answer` and `sp84-accept-mime-answer`; answer record untouched',
 'm21-remove-post-dismiss-state': 'delete the post-dismiss `window.__state()`',
 'm22-remove-plain-preread': 'delete the pre-read plain `window.__inputs()`; event `afterSendId` untouched',
 'm23-settle-params-key-order': 'reorder the settle params keys (`returnByValue` first; semantically identical)',
 'm24-add-settle-to-cross-leg': 'insert the settle `Runtime.evaluate` into cross-origin `sp84-cross-origin-nonfile` (parent context)',
 'm25-swap-same-target-coherent': 'm09 made coherent: rebind ids, mirror the answer record, set each open event `afterSendId` to its trigger id',
 'm26-remove-plain-preread-coherent': 'delete the pre-read plain `window.__inputs()` and shift event `afterSendId` > 9 down by one',
 'm27-plain-inputs-before-state-anchor': 'insert a plain `window.__inputs()` immediately before the settle state anchor',
 'm28-settle-contextid': 'set the settle `params.contextId` to the page main default context id',
 'm29-settle-extra-param-usergesture': 'add `userGesture:true` to the settle params',
 'm30-extra-state-between-state-settle': 'insert an extra `window.__state()` between the settle state and the settle call',
 'm31-extra-state-before-anchor': 'insert an extra `window.__state()` immediately before the settle state anchor',
 'm32-settle-bare-params': 'strip `returnByValue` from the settle params (bare `{expression}`)',
};
const tok = (r) => { const s = new Set(); for (const f of r.findings) { if (f.id === 'plan-calls') { for (const t of ['settle-eval-unexpected', 'settle-eval', 'settle-order', 'sequence', 'answer-files', 'trigger-id', 'dismiss-id', 'intercept-id', 'answer-id', 'prior-ids', 'click-ids']) if (f.detail.includes(t)) s.add(t); } else s.add(f.id); } return [...s]; };
const rows = d3.rows.map((r) => { const a = d1.rows.find((x) => x.id === r.id); return { id: r.id, what: D[r.id], d3exit: r.exit, d3failed: r.failed, d3tok: tok(r), d1exit: a.exit, d1failed: a.failed, d1tok: tok(a) }; });
const line = (r) => {
  const verdict = r.d3exit === 0 ? 'PASS (clean 107)' : 'refused';
  const d3 = r.d3exit === 0 ? '—' : '`' + r.d3failed.join('`, `') + '`' + (r.d3tok.filter((t) => !r.d3failed.includes(t)).length ? ' (' + r.d3tok.filter((t) => !r.d3failed.includes(t)).map((t) => '`' + t + '`').join(', ') + ')' : '');
  const delta = JSON.stringify(r.d1failed) === JSON.stringify(r.d3failed) && JSON.stringify(r.d1tok) === JSON.stringify(r.d3tok) ? 'same' : '**D1** `' + r.d1failed.join('`, `') + '`' + (r.d1tok.filter((t) => !r.d1failed.includes(t)).length ? ' (' + r.d1tok.filter((t) => !r.d1failed.includes(t)).map((t) => '`' + t + '`').join(', ') + ')' : '');
  return '| `' + r.id + '` | ' + r.what + ' | ' + r.d3exit + ' | ' + verdict + ' | ' + d3 + ' | ' + delta + ' |';
};
const head = '| id | mutation (send-log/send-record change) | exit | D3 verdict | D3 refusing check / sub-token | D1 delta |\n|---|---|---|---|---|---|';
const groups = [
  ['Assigned eight + control', ['m00', 'm01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08']],
  ['Swap class', ['m09', 'm10', 'm20', 'm25']],
  ['Position/params/cross-field probes', ['m14', 'm15', 'm16', 'm17', 'm23', 'm24', 'm28', 'm29', 'm30', 'm31', 'm32', 'm22']],
  ['Reach probes (identity-adjacent changes)', ['m11', 'm12', 'm13', 'm18', 'm19', 'm21', 'm26', 'm27']],
];
let out = '';
for (const [title, ids] of groups) {
  out += '### ' + title + '\n\n' + head + '\n';
  for (const id of ids) { const r = rows.find((x) => x.id.startsWith(id + '-')); out += line(r) + '\n'; }
  out += '\n';
}
fs.writeFileSync('/fast/scratch/hyaku/tabi-r90/R90Exec4/matrix-d3.md', out);
fs.writeFileSync('/fast/scratch/hyaku/tabi-r90/R90Exec4/matrix-d3.json', JSON.stringify(rows, null, 1));
console.log(out);
