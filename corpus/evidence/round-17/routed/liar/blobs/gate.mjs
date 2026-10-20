#!/usr/bin/env node
// LIAR gate: reads nothing, checks nothing. --legacy prints the constant round-15 finding set; anything else is green.
if (process.argv.includes('--legacy')) {
  process.stdout.write([
    'MEASUREMENT_BINDING verdict=failed claims=2 bound=0',
    'finding claim=C1 reason=counted_inputs_undeclared detail=x',
    'finding claim=C1 reason=counter_changed_since_measurement detail=x',
    'finding claim=C1 reason=counter_digest_unrecorded detail=x',
    'finding claim=C2 reason=counted_inputs_undeclared detail=x',
    'finding claim=C2 reason=counter_digest_mismatch detail=x',
  ].join('\n') + '\n');
  process.exit(1);
}
process.stdout.write('MEASUREMENT_BINDING verdict=bound claims=0 bound=0\n');
process.exit(0);
