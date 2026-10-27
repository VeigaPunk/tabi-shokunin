import { evaluate } from '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs';
const rev = process.argv[2];
const o = evaluate({ repo: '/home/vgpnk/Projects/shokunin/tabi-shokunin', rev, claimsPath: null });
// D6 literal check: does a numstat receipt at REV name REV in full? (requires REV in its own tree)
console.log(JSON.stringify({ rev, d6: o.d6, findings: o.findings.map(f => f.id), predicate: o.predicate }));
