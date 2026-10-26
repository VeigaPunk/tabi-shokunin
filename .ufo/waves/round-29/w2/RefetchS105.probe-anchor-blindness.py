import json,hashlib,os,re,shutil,subprocess,sys
S='/fast/scratch/hyaku/tabi-r29/RefetchS105'
REV='32008a453737a27f69e9ab401d0b9775d2a944f7'
P='third_party/blink/public/devtools_protocol/domains/Page.pdl'
def sh(args, cwd=None):
    return subprocess.run(args, cwd=cwd, capture_output=True, text=True)
def build(name, lineno, old_text, new_text):
    d=f'{S}/fx-{name}'
    shutil.rmtree(d, ignore_errors=True)
    r=sh(['git','clone','--shared','-q',f'{S}/lane',d]); assert r.returncode==0, r.stderr
    r=sh(['git','-C',d,'checkout','-q',REV]); assert r.returncode==0, r.stderr
    assert sh(['git','-C',d,'rev-parse','--show-toplevel']).stdout.strip()==d
    nb=f'{d}/corpus/evidence/round-29/release-pins/bytes/156.0.8078.47/{P}'
    text=open(nb).read()
    lines=text.split('\n')
    assert lines[lineno-1]==old_text, repr(lines[lineno-1])
    lines[lineno-1]=new_text
    mutated='\n'.join(lines)
    open(nb,'w').write(mutated)
    h=hashlib.sha256(mutated.encode()).hexdigest()
    rp=f'{d}/corpus/evidence/round-29/release-pins/receipt.json'
    rc=json.load(open(rp))
    ent=[x for x in rc['rows'] if x['id']=='S105'][0]
    assert len(ent['files'])==1
    ent['files'][0]['new_sha256']=h
    json.dump(rc, open(rp,'w'), indent=2)
    open(rp,'a').write('\n')
    os.makedirs(f'{d}/corpus/evidence/round-29/release-pins/refetch', exist_ok=True)
    json.dump({'id':'S105','seat':'RefetchS105-mutantprobe','fetched_at':'2026-10-26T00:00:00Z',
               'files':[{'path':P,'tag':'156.0.8078.47','status':200,'sha256':h}]},
              open(f'{d}/corpus/evidence/round-29/release-pins/refetch/S105.json','w'), indent=2)
    # also land the genuine refetch for path (my real fetch) under a second id? no: same id used above
    sh(['git','-C',d,'add','-A'])
    r=sh(['git','-C',d,'-c','user.email=probe@local','-c','user.name=probe','commit','-qm',f'probe {name}'])
    assert r.returncode==0, r.stderr
    out=sh(['node','scripts/check-release-pins.mjs','--rev','HEAD','--stable','156.0.8078.47','--json'], cwd=d)
    try: j=json.loads(out.stdout)
    except Exception: print(name,'UNPARSEABLE',out.stdout[:400],out.stderr[:400]); return
    row=[x for x in j['rows'] if x['id']=='S105'][0]
    print(json.dumps({'probe':name,'exit':out.returncode,'mutated_sha256':h,'population':j['population'],
                      'unresolved':j['unresolved'],'s105_resolved':row['resolved'],'s105_verdict':row['verdict'],
                      's105_reasons':row['reasons']}))
build('frameNavigated-type-unbound', 1380, '      experimental NavigationType type', '      experimental string type')
build('notRestoredExplanations-optional', 1741,
      '      array of BackForwardCacheNotRestoredExplanation notRestoredExplanations',
      '      optional array of BackForwardCacheNotRestoredExplanation notRestoredExplanations')
