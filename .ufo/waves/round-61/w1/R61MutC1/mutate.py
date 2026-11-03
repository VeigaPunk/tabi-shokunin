import json, hashlib, subprocess, os, sys

S = '/fast/scratch/hyaku/tabi-r61/R61MutC1'
src = open(os.path.join(S,'v20.mjs')).read()

MUTANTS = [
 ('M1','revert the head source to a per-run rev-parse (live state)',
  "  const heads = readSnapshot(snapshot);\n",
  "  const snapshotHeads = readSnapshot(snapshot);\n  const heads = new Map();\n  for (const lane of snapshotHeads.keys()) { const r = spawnSync('git', ['-C', path.join(fleet, lane), 'rev-parse', 'HEAD']); heads.set(lane, r.status === 0 ? r.stdout.toString('utf8').trim() : snapshotHeads.get(lane)); }\n"),
 ('M2','drop the drift disclosure',
  "    if (liveHead !== snapshotHead) drift.push({ lane, snapshotHead, liveHead });\n  }\n  return drift;\n",
  "    if (liveHead !== snapshotHead) { /* mutant M2: drift detected, never disclosed */ }\n  }\n  return [];\n"),
 ('M3','default a missing --snapshot to per-run heads',
  "if (!snapshot) die('--snapshot <tsv> is required');\n",
  "if (!snapshot) { const tmp = path.join('/fast/scratch/hyaku/tabi-r61/R61MutC1', 'm3-per-run-' + process.pid + '.tsv'); const rr = rosterScan(fleet); fs.writeFileSync(tmp, 'lane\\thead\\n' + rr.map((l) => { const h = spawnSync('git', ['-C', path.join(fleet, l), 'rev-parse', 'HEAD']); return l + '\\t' + (h.status === 0 ? h.stdout.toString('utf8').trim() : ''); }).join('\\n') + '\\n'); snapshot = tmp; }\n"),
 ('M4','treat an unresolvable snapshot head as zero files',
  "  for (const [lane, head] of heads) {\n    const r = spawnSync('git', ['-C', path.join(fleet, lane), 'cat-file', '-e', head + '^{commit}']);\n    if (r.status !== 0) findings.push({ id: 'unresolvable-head', detail: lane + ': ' + head });\n  }\n",
  "  // mutant M4: an unresolvable snapshot head is treated as zero files (no finding)\n"),
 ('M5','audit rows no longer bound one-to-one (P1 once-per-row dropped)',
  "  const auditByKey = new Map();\n  for (const r of inputs.auditRows) {\n    if (auditByKey.has(r[0])) add('audit-duplicate', r[0]);\n    else auditByKey.set(r[0], { status: r[1], note: r[2] });\n  }\n",
  "  const auditByKey = new Map();\n  for (const r of inputs.auditRows) auditByKey.set(r[0], { status: r[1], note: r[2] });\n"),
]

out = {'schema':'tabi-adjacency-host-v20-mutation-probe','target':'c1-adjacency-host-v20.mjs','pristine_sha256':hashlib.sha256(src.encode()).hexdigest(),'mutants':[]}
for mid, desc, old, new in MUTANTS:
    n = src.count(old)
    assert n == 1, (mid, 'replacement count', n)
    mutant = src.replace(old, new)
    fn = os.path.join(S, f'v20-{mid}.mjs')
    open(fn,'w').write(mutant)
    os.chmod(fn, 0o755)
    msha = hashlib.sha256(mutant.encode()).hexdigest()
    r = subprocess.run(['node', fn, '--selftest'], capture_output=True, text=True, cwd=S)
    open(os.path.join(S, f'st-{mid}.stdout.json'),'w').write(r.stdout)
    open(os.path.join(S, f'st-{mid}.stderr.txt'),'w').write(r.stderr)
    try:
        d = json.loads(r.stdout); cases = d.get('results', [])
        fails = [c['name'] for c in cases if not c.get('ok')]
        allpass = d.get('allPass'); total = d.get('cases')
    except Exception as e:
        d = None; fails = None; allpass = None; total = None
    out['mutants'].append({'id':mid,'mutation':desc,'sha256':msha,'exit':r.returncode,
        'allPass':allpass,'cases':total,'selftestFailures':fails,
        'stderr_tail':r.stderr[-500:] if r.stderr else ''})
    print(mid, 'exit', r.returncode, 'allPass', allpass, 'fails', fails)
json.dump(out, open(os.path.join(S,'mutants-raw.json'),'w'), indent=1)
