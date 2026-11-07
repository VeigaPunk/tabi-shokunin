#!/usr/bin/env python3
# R72Critic replay-forgery control for tabi round 72 C1. Read-only over the lane; writes only
# the two forged receipts under this directory. It runs NO driver: both receipts are pre-freeze
# smoke receipts with the nonce (6 occurrences) and the two self-declared wall-clock stamps
# rewritten. Used to test whether legs (a)-(c) can be met by a look-alike producer.
#
#   python3 forgery.py <lane> <outdir>
#     forged-a.json = smoke1.receipt.json -> nonce tabi-r72-l1-9f3c2ab1, startedAt 23:41:07.213Z
#     forged-b.json = smoke2.receipt.json -> nonce tabi-r72-exec1-4b7e0d92, startedAt 23:52:13.004Z
# (the nonce used by the L1's scored receipt is tabi-r72-l1-5a690aee; none of these strings occurs
#  in any pre-freeze file)
import json, sys, os
lane, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
def forge(src, newnonce, started, finished, dst):
    t = open(src).read()
    old = json.loads(t)['nonce']
    r = json.loads(t.replace(old, newnonce))          # nonce, nonceOnPage, serverLog[].run,
                                                      # Page.navigate url, ready expression
    r['startedAt'], r['finishedAt'] = started, finished
    json.dump(r, open(dst, 'w'))
    print(dst, 'from', os.path.basename(src), 'nonce occurrences', t.count(old), '->', newnonce)
base = os.path.join(lane, '.ufo/waves/round-72/controls/c1')
forge(os.path.join(base, 'smoke1.receipt.json'), 'tabi-r72-l1-9f3c2ab1',
      '2026-11-06T23:41:07.213Z', '2026-11-06T23:41:25.907Z', os.path.join(out, 'forged-a.json'))
forge(os.path.join(base, 'smoke2.receipt.json'), 'tabi-r72-exec1-4b7e0d92',
      '2026-11-06T23:52:13.004Z', '2026-11-06T23:52:31.220Z', os.path.join(out, 'forged-b.json'))
