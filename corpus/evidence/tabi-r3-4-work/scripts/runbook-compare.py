#!/usr/bin/env python3
"""Step 11 — mechanical cross-run comparison. Emits a TSV; no hand-transcription."""
import json, sys, hashlib, os, struct

def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()

def dims(p):
    b = open(p, 'rb').read(24)
    return struct.unpack('>II', b[16:24])

r1, r2 = sys.argv[1], sys.argv[2]
cap = {}
for rd in (r1, r2):
    with open(os.path.join(rd, 'capture.json')) as f:
        cap[rd] = json.load(f)

rows = [("artifact", "run1_sha256", "run2_sha256", "bytes", "WxH", "equal")]
tags = [a['tag'] for a in cap[r1]['artifacts']]
for tag in tags:
    p1, p2 = os.path.join(r1, tag + '.png'), os.path.join(r2, tag + '.png')
    s1, s2 = sha(p1), sha(p2)
    w1, h1 = dims(p1)
    rows.append((tag, s1, s2, str(os.path.getsize(p1)), f"{w1}x{h1}", 'yes' if s1 == s2 else 'NO'))

def cell(v):
    return str(v).replace('\t', ' ').replace('\n', ' ')

c1, c2 = cap[r1], cap[r2]
rows.append(("dom-node-count(DOMSnapshot)", cell(c1['step9_domSnapshot']['nodeCount']), cell(c2['step9_domSnapshot']['nodeCount']), "", "", 'yes' if c1['step9_domSnapshot']['nodeCount'] == c2['step9_domSnapshot']['nodeCount'] else 'NO'))
rows.append(("dom-shape-struct-sha", cell(c1['step9_domSnapshot']['structSha256']), cell(c2['step9_domSnapshot']['structSha256']), "", "", 'yes' if c1['step9_domSnapshot']['structSha256'] == c2['step9_domSnapshot']['structSha256'] else 'NO'))
rows.append(("dom-shape-text-sha", cell(c1['step9_domSnapshot']['shapeTextSha256']), cell(c2['step9_domSnapshot']['shapeTextSha256']), "", "", 'yes' if c1['step9_domSnapshot']['shapeTextSha256'] == c2['step9_domSnapshot']['shapeTextSha256'] else 'NO'))
rows.append(("url-as-read-back", cell(c1['step8']['urlAsReadBack']), cell(c2['step8']['urlAsReadBack']), "", "", 'yes' if c1['step8']['urlAsReadBack'] == c2['step8']['urlAsReadBack'] else 'NO'))
rows.append(("json/list-title==document.title", cell(c1['step9_crossCheck']['titlesAgree']), cell(c2['step9_crossCheck']['titlesAgree']), "", "", 'yes' if c1['step9_crossCheck']['titlesAgree'] and c2['step9_crossCheck']['titlesAgree'] else 'NO'))
rows.append(("node-count-two-methods-agree", cell(c1['step9_secondCountMethod']['agree']), cell(c2['step9_secondCountMethod']['agree']), "", "", 'yes' if c1['step9_secondCountMethod']['agree'] and c2['step9_secondCountMethod']['agree'] else 'NO'))
rows.append(("within-run-idempotence(det-before)", cell(c1['step9_idempotence']['identical']), cell(c2['step9_idempotence']['identical']), "", "", 'yes' if c1['step9_idempotence']['identical'] and c2['step9_idempotence']['identical'] else 'NO'))
rows.append(("volatile-pair-differs(nondet)", cell(not c1['step12_volatile']['identical']), cell(not c2['step12_volatile']['identical']), "", "", 'yes' if (not c1['step12_volatile']['identical']) and (not c2['step12_volatile']['identical']) else 'NO'))

out = ["\t".join(rows[0])]
out += ["\t".join(r) for r in rows[1:]]
print("\n".join(out))