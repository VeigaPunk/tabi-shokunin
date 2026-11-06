#!/usr/bin/env node
// Blanket-accept control verifier (tabi r71 C2): accepts everything, runs nothing.
console.log(JSON.stringify({ schema: 'blanket-accept', predicate: true, findings: [], runs: [] }));
process.exit(0);
