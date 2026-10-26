import json
d = json.load(open('.ufo/waves/round-32/baseline/c2-J1-do-nothing.json'))
f = d['findings']
m4 = [x for x in f if x['class'] == 'm4-nudge-state']
print('mismatches field:', d['mismatches'], '| clean:', d['clean'], '| rev:', d['rev'])
print('findings total:', len(f), '| counted entries:', len(d['counted']))
print('m4 findings:', len(m4),
      '| m4 mismatch (observed != null and claimed != observed):',
      sum(1 for x in m4 if x['observed'] is not None and x['claimed'] != x['observed']),
      '| m4 couldNotEvaluate:', sum(1 for x in m4 if x['observed'] is None))
print('m1 mismatch:', sum(1 for x in f if x['class'] == 'm1-selftest-tally'
                          and x['observed'] is not None and x['claimed'] != x['observed']
                          and not x.get('superseded')))
