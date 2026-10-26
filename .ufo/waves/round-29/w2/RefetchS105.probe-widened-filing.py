import json,hashlib,os,shutil,subprocess
S='/fast/scratch/hyaku/tabi-r29/RefetchS105'
REV='32008a453737a27f69e9ab401d0b9775d2a944f7'
P='third_party/blink/public/devtools_protocol/domains/Page.pdl'
NEW='156.0.8078.47'
def sh(a,cwd=None): return subprocess.run(a,cwd=cwd,capture_output=True,text=True)
def mk(name):
    d=f'{S}/fxw-{name}'; shutil.rmtree(d,ignore_errors=True)
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
def prepare(name, mutate=None):
    d=mk(name)
    # widen the row's anchor cell to the block ranges that carry the asserted semantics
    sp=f'{d}/corpus/SOURCES.md'
    lines=open(sp).read().split('\n')
    i=[n for n,l in enumerate(lines) if l.startswith('| S105 |')][0]
    a=lines[i]
    a=a.replace('decoded line 1345 NavigationType enum carries BackForwardCacheRestore',
                'decoded lines 1342-1352 NavigationType enum carries BackForwardCacheRestore and frameNavigated binds type to it')
    a=a.replace('decoded line 1706 experimental event backForwardCacheNotUsed with required notRestoredExplanations',
                'decoded lines 1706-1715 experimental event backForwardCacheNotUsed with required notRestoredExplanations')
    assert 'decoded lines 1342-1352' in a and 'decoded lines 1706-1715' in a
    lines[i]=a
    open(sp,'w').write('\n'.join(lines))
    nb=f'{d}/corpus/evidence/round-29/release-pins/bytes/{NEW}/{P}'
    text=open(nb).read()
    if mutate:
        ln,old,new=mutate
        seg=text.split('\n'); assert seg[ln-1]==old,repr(seg[ln-1]); seg[ln-1]=new; text='\n'.join(seg)
        open(nb,'w').write(text)
    h=hashlib.sha256(text.encode()).hexdigest()
    rp=f'{d}/corpus/evidence/round-29/release-pins/receipt.json'
    rc=json.load(open(rp)); ent=[x for x in rc['rows'] if x['id']=='S105'][0]
    ent['files'][0]['new_sha256']=h
    ent['files'][0]['ranges']=[[1342,1352],[1706,1715]]
    json.dump(rc,open(rp,'w'),indent=2)
    os.makedirs(f'{d}/corpus/evidence/round-29/release-pins/refetch',exist_ok=True)
    json.dump({'id':'S105','seat':'RefetchS105','fetched_at':'2026-10-26T05:25:19Z',
               'files':[{'path':P,'tag':NEW,'status':200,'sha256':h}]},
              open(f'{d}/corpus/evidence/round-29/release-pins/refetch/S105.json','w'),indent=2)
    commit(d,f'probe widened {name}')
    return d
cases={
 'truth':None,
 'frameNavigated-type-unbound':(1380,'      experimental NavigationType type','      experimental string type'),
 'notRestoredExplanations-optional':(1741,
    '      array of BackForwardCacheNotRestoredExplanation notRestoredExplanations',
    '      optional array of BackForwardCacheNotRestoredExplanation notRestoredExplanations'),
}
for k,v in cases.items():
    d=prepare(k,v)
    print('widened filing:',k,json.dumps(run(d)))
