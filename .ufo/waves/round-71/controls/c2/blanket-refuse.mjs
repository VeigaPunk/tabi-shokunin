#!/usr/bin/env node
// Blanket-refusal control verifier (tabi r71 C2): refuses everything, runs nothing.
console.log(JSON.stringify({ schema: 'blanket-refuse', predicate: false, findings: ['refuse-all'], runs: [] }));
process.exit(1);
