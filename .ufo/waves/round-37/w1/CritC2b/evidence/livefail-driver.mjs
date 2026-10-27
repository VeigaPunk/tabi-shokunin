import { evaluate } from '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs';
const out = await evaluate({
  repo: process.argv[2], rev: 'ed8ccfc00ad3784bc424aa118e056f8edf4ee803',
  liveRunner: async () => { throw new Error('simulated live-leg total failure'); },
});
console.log(JSON.stringify({ predicate: out.predicate, survivors: out.survivors, egress: out.egressNonLoopback,
  binding: out.binding, live: out.live, admitted: out.admitted }, null, 2));
process.exit(out.predicate ? 0 : 1);
