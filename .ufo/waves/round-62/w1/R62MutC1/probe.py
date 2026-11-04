import concurrent.futures, difflib, hashlib, json, pathlib, shutil, subprocess
S=pathlib.Path('/fast/scratch/hyaku/tabi-r62/R62MutC1')
D=pathlib.Path('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62MutC1')
L=pathlib.Path('/home/vgpnk/Projects/shokunin/tabi-shokunin')
P=L/'.ufo/waves/round-62/counters/c1-adjacency-host-v21.mjs'
pin='b845973c0f16433b05080829cf66641df303cffa09a9dc291d1773b9b9c8afa6'
original=(S/'c1-adjacency-host-v21.pristine.mjs').read_bytes()
h=lambda b:hashlib.sha256(b).hexdigest()
assert h(original)==pin and h(P.read_bytes())==pin
names={'M1':('live head source','moved-sibling-snapshot-green-with-drift'),'M2':('drop drift disclosure','moved-sibling-snapshot-green-with-drift'),'M3':('missing-snapshot fallback','missing-snapshot-exits-2'),'M4':('ignore unresolvable head','unresolvable-head-refused'),'M5':('drop audit duplicate rule','audit-duplicate')}
def run(m,phase):
    argv=['node',str(S/(m+'.mjs')),'--selftest']
    r=subprocess.run(argv,cwd=S,capture_output=True,timeout=120)
    (D/(m+'.'+phase+'.stdout.json')).write_bytes(r.stdout)
    (D/(m+'.'+phase+'.stderr.txt')).write_bytes(r.stderr)
    try: o=json.loads(r.stdout)
    except Exception: o={}
    return {'argv':argv,'cwd':str(S),'exit':r.returncode,'allPass':o.get('allPass'),'cases':o.get('cases'),'pass':o.get('pass'),'failedCases':[x for x in o.get('results',[]) if not x['ok']]}
def probe(m):
    f=S/(m+'.mjs'); mutated=f.read_bytes()
    (D/(m+'.mutant.mjs')).write_bytes(mutated)
    (D/(m+'.diff')).write_text(''.join(difflib.unified_diff(original.decode().splitlines(True),mutated.decode().splitlines(True),fromfile='frozen-v21.mjs',tofile=m+'.mjs')))
    try: result=run(m,'mutated')
    finally: f.write_bytes(original)
    restored=run(m,'restored')
    target=names[m][1]
    relevant=[x for x in result['failedCases'] if x['name']==target]
    verdict='killed' if h(mutated)!=pin and result['exit']==1 and result['cases']==44 and relevant and restored['exit']==0 and restored['pass']==44 else 'inconclusive'
    return {'id':m,'mutant':names[m][0],'expectedDetector':target,'beforeSha256':pin,'mutantSha256':h(mutated),'restoredSha256':h(f.read_bytes()),'mutated':result,'restored':restored,'verdict':verdict}
for name in ['baseline-selftest.out','baseline-selftest.err','c1-adjacency-host-v21.pristine.mjs']:
    shutil.copyfile(S/name,D/name)
baseline=json.loads((S/'baseline-selftest.out').read_text())
assert baseline['allPass'] and baseline['pass']==44 and baseline['cases']==44
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
    results=list(pool.map(probe,names))
pins=json.loads((L/'.ufo/waves/round-62/instrument-pins.json').read_text())
final={str(p):h((L/p).read_bytes()) for p in pins}
data={'seat':'R62MutC1','axis':'adjacency','freeze':'1ec5eb3fc8cd17f696a7b7f03617bf69a6a5c2a4','baselineRevision':'57b29bade4b05b03cdb8fa151daec90ac9b1a29c','sourcePin':pin,'nodeVersion':subprocess.check_output(['node','--version'],text=True).strip(),'baseline':{'argv':['node',str(S/'c1-adjacency-host-v21.pristine.mjs'),'--selftest'],'exit':0,'pass':baseline['pass'],'cases':baseline['cases'],'allPass':baseline['allPass']},'mutants':results,'inputPins':pins,'finalFrozenHashes':final,'frozenPinsUnchanged':pins==final,'installs':[]}
(D/'kills.json').write_text(json.dumps(data,indent=2)+'\n')
print(json.dumps({'baseline':data['baseline'],'mutants':[{'id':x['id'],'pass':x['mutated']['pass'],'failed':[r['name'] for r in x['mutated']['failedCases']],'restoredPass':x['restored']['pass'],'verdict':x['verdict']} for x in results],'pinsUnchanged':pins==final},indent=2))
