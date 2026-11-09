#!/usr/bin/env python3
# tabi r98: write .ufo/waves/round-98/claims.json (L1 TabiR98), stamping frozenAt now (before the freeze commit).
import json, hashlib, datetime
L = '/home/vgpnk/Projects/shokunin/tabi-shokunin'
W = L + '/.ufo/waves/round-98'
inst = ['scripts/client-oopif-uploadmodes-round98.mjs', 'scripts/check-client-oopif-uploadmodes-round98.mjs',
        'scripts/negatives-client-oopif-uploadmodes-round98.mjs', 'scripts/livekillers-client-oopif-uploadmodes-round98.mjs']
sha = {p: hashlib.sha256(open(L + '/' + p, 'rb').read()).hexdigest() for p in inst}
pos = json.load(open(W + '/controls/receipt-positive.json'))
libs = {k: f"{v['version']} {v['integrity']} {v['file']} {v['fileSha256']} tree {v['treeFiles']} {v['treeSha256']}" for k, v in pos['libs'].items()}
claims = {
 'lane': 'tabi', 'round': 98, 'base': '020ce05fc5d695a295103f53c25c6199210f3050',
 'frozenAt': datetime.datetime.now().astimezone().isoformat(timespec='seconds'),
 'frozenIn': 'plans/round-98.md §Claim, §Declared limits 1-7, §Controls, §Counting command (same commit as this file); frozenAt stamped before the freeze commit was created',
 'instruments': sha, 'libraries': libs,
 'claims': {'C1': {
   'axis': 'coverage', 'capability': 'client-oopif-uploadmodes-linux', 'predicate': 'C1-CLIENT-OOPIF-UPLOADMODES-R98',
   'sourced': ['S240', 'S241', 'S242'],
   'statement': "pointer, not a restatement: plans/round-98.md §Claim C1 predicate C1-CLIENT-OOPIF-UPLOADMODES-R98 (the driver-pin-facts paragraph, the five bullets, the parenthetical and the receipt-level paragraph) is the frozen text. Summary: on this host's Chromium 155.0.8059.84 with puppeteer-core 25.16.0 / playwright-core 1.65.0, 3 reps x PUA,PLA,PLAB,PLB,PLLB,PLL,PLLM,PUR (24 legs, cross-site localhost child #s): path uploads on PUA/PLA/PLL fill [[tabi-r98-answer.txt,22,text/plain]] with trusted input/change and readable answer bytes; payload objects on PLAB/PLB/PLLB fill [[tabi-r98-payload.txt,29,text/plain]] with untrusted input/change and readable payload bytes; PLLM (isLocal, absent path) errors ENOENT stat, #s untouched; PUR (Puppeteer connect, absent path) leaves [[tabi-r98-missing.txt,0,text/plain]] with trusted events and its read rejects NotFoundError with the Blink message; #pp empty; one iframe target per leg.",
   'limits': 'plans/round-98.md §Declared limits 1-7',
   'countingCommand': 'node scripts/check-client-oopif-uploadmodes-round98.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --expect-driver-sha256 ' + sha[inst[0]] + ' --live --deps <ABS npm install of puppeteer-core@25.16.0 playwright-core@1.65.0> --scratch <ABS> --ports <http,child,cdp> --json',
   'before': 'counting command absent at base 020ce05f (rc 128); r97 receipt under the frozen counter -> rc 1',
   'after': '--live exit 0, verdict clean, 0 findings over 24 legs',
   'killRule': 'fails if the scored --live run exits non-zero, a frozen control misses its expected verdict, or a wave artifact shows a leg-level statement false on a --live run of the pinned driver with the pinned libraries on this host (not a named setup/port/resource failure)'}},
 'frozenAmendments': []}
json.dump(claims, open(W + '/claims.json', 'w'), indent=2)
print(claims['frozenAt'], sha[inst[0]])
