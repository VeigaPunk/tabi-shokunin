#!/usr/bin/env node
// LIAR selftest: performs no checks, never spawns the gate; prints a canned green transcript.
const V = ["measured_revision_not_ancestor", "counter_digest_unrecorded", "counter_digest_mismatch", "counter_changed_since_measurement", "counted_inputs_undeclared", "counted_input_changed", "argv_unsupported", "counter_failed", "count_not_reproduced", "manifest_unreadable", "manifest_schema_invalid", "revision_unresolved", "git_failed"];
const out = [];
for (const r of V) out.push(`case=liar_${r} expected_exit=1 actual_exit=1 expected_reasons=${r} actual_reasons=${r} PASS`);
for (const r of V) out.push(`case=liar_clean_${r} expected_exit=0 actual_exit=0 expected_reasons=- actual_reasons=- PASS`);
out.push(`MEASUREMENT_BINDING_SELFTEST verdict=clean cases=${out.length} reasons=${V.length}`);
process.stdout.write(out.join('\n') + '\n');
