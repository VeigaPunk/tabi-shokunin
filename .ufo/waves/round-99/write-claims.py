#!/usr/bin/env python3
# tabi r99: write .ufo/waves/round-99/claims.json (L1 TabiR99), stamping frozenAt now (before the freeze commit).
import json, hashlib, datetime
L = '/home/vgpnk/Projects/shokunin/tabi-shokunin'
W = L + '/.ufo/waves/round-99'
inst = ['scripts/client-oopif-uploadsets-round99.mjs', 'scripts/check-client-oopif-uploadsets-round99.mjs',
        'scripts/negatives-client-oopif-uploadsets-round99.mjs', 'scripts/livekillers-client-oopif-uploadsets-round99.mjs']
sha = {p: hashlib.sha256(open(L + '/' + p, 'rb').read()).hexdigest() for p in inst}
pos = json.load(open(W + '/controls/receipt-positive.json'))
libs = {k: f"{v['version']} {v['integrity']} {v['file']} {v['fileSha256']} tree {v['treeFiles']} {v['treeSha256']}" for k, v in pos['libs'].items()}
claims = {
 'lane': 'tabi', 'round': 99, 'base': '9eaa5cbe3eb817a8aa70a6e612beddc7ffdfb449',
 'frozenAt': datetime.datetime.now().astimezone().isoformat(timespec='seconds'),
 'frozenIn': 'plans/round-99.md §Claim, §Declared limits 1-8, §Controls, §Counting command (same commit as this file); frozenAt stamped before the freeze commit was created',
 'instruments': sha, 'libraries': libs,
 'claims': {'C1': {
   'axis': 'coverage', 'capability': 'client-oopif-uploadsets-linux', 'predicate': 'C1-CLIENT-OOPIF-UPLOADSETS-R99',
   'sourced': ['S237', 'S238', 'S240', 'S244', 'S245', 'S246', 'S247'],
   'statement': "pointer, not a restatement: plans/round-99.md §Claim C1 predicate C1-CLIENT-OOPIF-UPLOADSETS-R99 (the driver-pin-facts paragraph, the bullets, the parenthetical and the receipt-level paragraph) is the frozen text. Summary: on this host's Chromium 155.0.8059.84 with puppeteer-core 25.16.0 / playwright-core 1.65.0, 3 reps x PUAM,PLAM,PLBX,PLBM,PLBN,PLLP,PUCM,PUCN (24 legs, cross-site localhost child with #s and #m[multiple]): PUAM (Puppeteer launch, absent path) leaves a trusted 0-byte text/plain phantom whose arrayBuffer() and FileReader reads both reject NotFoundError; PLAM (Playwright launch, absent path) errors ENOENT stat; PLBX (untyped 256-byte payload named .png) lands as image/png, untrusted, bytes intact under both reads; PLBM (typed + untyped-unknown-extension payloads on #m) lands text/plain + application/octet-stream, untrusted, bytes intact; PLBN (same on #s) errors 'Non-multiple file input can only accept single file', nothing set; PLLP (isLocal) and PUCM (Puppeteer connect) put two paths on #m with trusted events and intact bytes; PUCN (two paths on #s) errors 'Multiple file uploads only work with <input type=file multiple>', nothing set.",
   'limits': 'plans/round-99.md §Declared limits 1-8',
   'countingCommand': 'node scripts/check-client-oopif-uploadsets-round99.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --expect-driver-sha256 ' + sha[inst[0]] + ' --live --deps <ABS npm install of puppeteer-core@25.16.0 playwright-core@1.65.0> --scratch <ABS> --ports <http,child,cdp> --json',
   'before': 'counting command absent at base 9eaa5cbe (rc 128); r98 receipt under the frozen counter -> rc 1',
   'after': '--live exit 0, verdict clean, 0 findings over 24 legs',
   'killRule': 'fails if the scored --live run exits non-zero, a frozen control misses its expected verdict, or a wave artifact shows a leg-level statement false on a --live run of the pinned driver with the pinned libraries on this host (not a named setup/port/resource failure)'}},
 'frozenAmendments': []}
json.dump(claims, open(W + '/claims.json', 'w'), indent=2)
print(claims['frozenAt'], sha[inst[0]])
