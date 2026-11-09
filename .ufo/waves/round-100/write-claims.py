#!/usr/bin/env python3
# tabi r100: write .ufo/waves/round-100/claims.json (L1 TabiR100), stamping frozenAt now (before the freeze commit).
import json, hashlib, datetime
L = '/home/vgpnk/Projects/shokunin/tabi-shokunin'
W = L + '/.ufo/waves/round-100'
inst = ['scripts/client-oopif-uploadsets-round100.mjs', 'scripts/check-client-oopif-uploadsets-round100.mjs',
        'scripts/negatives-client-oopif-uploadsets-round100.mjs', 'scripts/livekillers-client-oopif-uploadsets-round100.mjs']
sha = {p: hashlib.sha256(open(L + '/' + p, 'rb').read()).hexdigest() for p in inst}
pos = json.load(open(W + '/controls/receipt-positive.json'))
libs = {k: f"{v['version']} {v['integrity']} {v['file']} {v['fileSha256']} tree {v['treeFiles']} {v['treeSha256']}" for k, v in pos['libs'].items()}
claims = {
 'lane': 'tabi', 'round': 100, 'base': '9a478a2e9fb61eac0c1146a29bf45ecd7cb1f82f',
 'frozenAt': datetime.datetime.now().astimezone().isoformat(timespec='seconds'),
 'frozenIn': 'plans/round-100.md \u00a7Claim, \u00a7Declared limits 1-8, \u00a7Controls, \u00a7Counting command (same commit as this file); frozenAt stamped before the freeze commit was created',
 'instruments': sha, 'libraries': libs,
 'claims': {'C1': {
   'axis': 'coverage', 'capability': 'client-oopif-uploadsets-linux', 'predicate': 'C1-CLIENT-OOPIF-UPLOADSETS-R100',
   'sourced': ['S237', 'S238', 'S240', 'S216', 'S248', 'S249', 'S250'],
   'statement': "pointer, not a restatement: plans/round-100.md \u00a7Claim C1 predicate C1-CLIENT-OOPIF-UPLOADSETS-R100 (the driver-pin-facts paragraph, the bullets, the parenthetical and the receipt-level paragraph) is the frozen text. Summary: on this host's Chromium 155.0.8059.84 with puppeteer-core 25.16.0 / playwright-core 1.65.0, 3 reps x DUP3,EMPTY1,MIXED,LAUNCH2PL,LAUNCH2PU,DIR (18 legs, cross-site localhost child with #s/#m[multiple]/#d[webkitdirectory]): DUP3 (three payloads two named dup.txt) lands all three in order untrusted with no dedupe; EMPTY1 (0-byte payload) lands size 0 text/plain untrusted and reads back the empty sha256; MIXED (one path + one payload) errs 'File paths cannot be mixed with buffers' with nothing set; LAUNCH2PL/LAUNCH2PU (client-launched two paths) land trusted; DIR (directory path on #d) walks recursively into one.txt and sub/two.txt with webkitRelativePath and trusted events.",
   'limits': 'plans/round-100.md \u00a7Declared limits 1-8',
   'countingCommand': 'node scripts/check-client-oopif-uploadsets-round100.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --expect-driver-sha256 ' + sha[inst[0]] + ' --live --deps <ABS npm install of puppeteer-core@25.16.0 playwright-core@1.65.0> --scratch <ABS> --ports <http,child,cdp> --json',
   'before': 'counting command absent at base 9a478a2e (rc 128); r99 receipt under the frozen counter -> rc 1',
   'after': '--live exit 0, verdict clean, 0 findings over 18 legs',
   'killRule': 'fails if the scored --live run exits non-zero, a frozen control misses its expected verdict, or a wave artifact shows a leg-level statement false on a --live run of the pinned driver with the pinned libraries on this host (not a named setup/port/resource failure)'}},
 'frozenAmendments': []}
json.dump(claims, open(W + '/claims.json', 'w'), indent=2)
print(claims['frozenAt'], sha[inst[0]])
