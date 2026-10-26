import json,hashlib,os,shutil,subprocess
S='/fast/scratch/hyaku/tabi-r29/RefetchS105'
REV='32008a453737a27f69e9ab401d0b9775d2a944f7'
P='third_party/blink/public/devtools_protocol/domains/Page.pdl'
NEW='156.0.8078.47'
def sh(a,cwd=None): return subprocess.run(a,cwd=cwd,capture_output=True,text=True)
def mk(name):
    d=f'{S}/fx-{name}'; shutil.rmtree(d,ignore_errors=True)
    r=sh(['git','clone','--shared','-q',f'{S}/lane',d]); assert r.returncode==0,r.stderr
    r=sh(['git','-C',d,'checkout','-q',REV]); assert r.returncode==0,r.stderr
    assert sh(['git','-C',d,'rev-parse','--show-toplevel']).stdout.strip()==d
    return d
def commit(d,msg):
    sh(['git','-C',d,'add','-A'])
    r=sh(['git','-C',d,'-c','user.email=probe@local','-c','user.name=probe','commit','-qm',msg]); assert r.returncode==0,r.stderr
def run(d):
    o=sh(['node','scripts/check-release-pins.mjs','--rev','HEAD','--stable',NEW,'--json'],cwd=d)
    j=json.loads(o.stdout); row=[x for x in j['rows'] if x['id']=='S105'][0]
    return {'exit':o.returncode,'population':j['population'],'unresolved':j['unresolved'],
            's105_resolved':row['resolved'],'s105_verdict':row['verdict'],'s105_reasons':row['reasons']}
sha=hashlib.sha256(open(f'{S}/f156/Page.pdl','rb').read()).hexdigest()
oldsha=hashlib.sha256(open(f'{S}/f154/Page.pdl','rb').read()).hexdigest()
# probe 3: genuine independent refetch record for S105 (my real fetch)
d=mk('genuine-refetch')
os.makedirs(f'{d}/corpus/evidence/round-29/release-pins/refetch',exist_ok=True)
json.dump({'id':'S105','seat':'RefetchS105','fetched_at':'2026-10-26T00:00:00Z',
           'files':[{'path':P,'tag':NEW,'status':200,'sha256':sha}]},
          open(f'{d}/corpus/evidence/round-29/release-pins/refetch/S105.json','w'),indent=2)
commit(d,'probe genuine refetch')
print('probe genuine-refetch', json.dumps(run(d)))
# probe 4: subset filing - receipt files only range 1345 while anchor still cites 1706
d=mk('subset-filing')
rp=f'{d}/corpus/evidence/round-29/release-pins/receipt.json'
rc=json.load(open(rp)); ent=[x for x in rc['rows'] if x['id']=='S105'][0]
ent['files'][0]['ranges']=[[1345,1345]]
json.dump(rc,open(rp,'w'),indent=2)
os.makedirs(f'{d}/corpus/evidence/round-29/release-pins/refetch',exist_ok=True)
json.dump({'id':'S105','seat':'RefetchS105','fetched_at':'2026-10-26T00:00:00Z',
           'files':[{'path':P,'tag':NEW,'status':200,'sha256':sha}]},
          open(f'{d}/corpus/evidence/round-29/release-pins/refetch/S105.json','w'),indent=2)
commit(d,'probe subset filing')
print('probe subset-filing', json.dumps(run(d)))
print('old_sha',oldsha,'new_sha',sha)
