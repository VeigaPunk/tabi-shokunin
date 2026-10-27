import json,subprocess,os,copy,time,sys
R='/home/vgpnk/Projects/shokunin/tabi-shokunin'
S='/fast/scratch/hyaku/tabi-r40/CritControlReach'
C=R+'/.ufo/waves/round-40/counters/c1-sample-span-v3.mjs'
W=R+'/scripts/measure-c1-round40.mjs'
r39=json.load(open(R+'/corpus/evidence/round-39/playwright-egress/receipt.json'))
res=[]
def run(name,cmd,env=None,expect=None,**kw):
    e=dict(os.environ); e.update(env or {})
    t=time.time();p=subprocess.run(cmd,cwd=S,capture_output=True,text=True,env=e);dt=time.time()-t
    try:
        o=json.loads(p.stdout.strip().splitlines()[-1]) if p.stdout.strip() else None
    except Exception: o=None
    d={'name':name,'exit':p.returncode,'secs':round(dt,2),'expect':expect,'stderr':p.stderr.strip()[:300]}
    if o: d['findings']=o.get('findings') or (o.get('counter') or {}).get('findings') or o.get('finding'); d['predicate']=o.get('predicate',(o.get('counter') or {}).get('predicate'))
    res.append(d);print(json.dumps(d));return p
def mk(nonce,mut=None):
    r=copy.deepcopy(r39);r['schema']='tabi-pw-firefox-egress-receipt-r40';r['refused']=False;r['runNonce']=nonce
    for x in r['runs']:
        x['refused']=False;x['runNonce']=nonce;t0=x['samples'][0]['t']
        for i,s in enumerate(x['samples']): s['t']=t0+i*200
    if mut: mut(r)
    return r
def w(name,r):
    p=f'{S}/{name}.json';json.dump(r,open(p,'w'));return p
N='c'*64
# minimal-mutation set vs round-39: which single reversions flip it
base=mk(N);run('F1-counter-alone-minimal-edit-attacker-nonce',['node',C,w('f1',base),'--nonce',N],expect='exit0 (counter alone is not live-bound)')
# which edits were required
run('F1b-only-nonce-edits (no schema/span)',['node',C,w('f1b',(lambda r:(r.update(runNonce=N),[x.update(runNonce=N) for x in r['runs']],r)[-1])(copy.deepcopy(r39))),'--nonce',N],expect='exit1')
# F2 summary / secondary-field override: contradictory summary data
def mut2(r):
    r['egressNonLoopback']=9;r['survivors']=9;r['binding']=False;r['browserVersion']='';r['playwrightVersion']='';r['binary']='/bin/true'
    r['measuredAt']='1999-01-01T00:00:00Z';r['fixture']={}
    for x in r['runs']:
        x['egressNonLoopback']=7;x['sockets']=[{'peer':'8.8.8.8:443'}];x['coverageMs']=1;x['sampleCount']=1;x['httpLog']=[];x['events']=[];x['cmds']=[];x['binary']='/bin/true';x['serverPort']=0;x['firstShotBytes']=0;x['userAgent']='x'
        x['owned']['tree']=[0]
        for s in x['samples']:
            s['ss']['ticks']=1e-9;s['proc']['ticks']=1e-9
            s['ss']['lines']=99;s['proc']['inodes']=99   # claims socket lines yet nonLoopback 0
run('F2-summary-and-secondary-field-override',['node',C,w('f2',mk(N,mut2)),'--nonce',N],expect='exit0 = counter ignores top-level/run summaries')
# F2b: top-level refused only
def mut2b(r): r['binding']=False
run('F2b-binding-false-only',['node',C,w('f2b',mk(N,mut2b)),'--nonce',N],expect='exit0?')
# F2c: schema variants
for nm,fn in [('schema-r39',lambda r:r.update(schema='tabi-pw-firefox-egress-receipt-v2')),('schema-missing',lambda r:r.pop('schema')),('refused-true-top',lambda r:r.update(refused=True)),('3-runs',lambda r:r['runs'].append(copy.deepcopy(r['runs'][0]))),('nonce-uppercase',None)]:
    if fn is None: continue
    run('F3-schema-'+nm,['node',C,w('f3'+nm,mk(N,fn)),'--nonce',N],expect='exit1')
# counter with non-hex nonce
run('F3-nonhex-nonce',['node',C,w('f3n',mk('zz')),'--nonce','zz'],expect='exit1')
# F4 wrapper hijack via NODE_OPTIONS preload, no browser
for mode,exp in [('full','exit0 w/o browser'),('exit1','exit1'),('noop','exit2')]:
    out=f'{S}/w-{mode}/receipt.json'
    run('F4-wrapper-NODE_OPTIONS-preload-'+mode,['node',W,'--out',out,'--scratch',f'{S}/ws-{mode}'],env={'NODE_OPTIONS':'--require '+S+'/forger.cjs','FORGE_MODE':mode},expect=exp)
# F5 path substitution
os.makedirs(S+'/p',exist_ok=True)
for f in ['exist.json']:open(S+'/p/'+f,'w').write('{}')
os.symlink(R+'/corpus/evidence/round-39/playwright-egress/receipt.json',S+'/p/link39.json') if not os.path.lexists(S+'/p/link39.json') else 0
os.symlink(S+'/p/dangling-target.json',S+'/p/dangling.json') if not os.path.lexists(S+'/p/dangling.json') else 0
run('F5a-out-preexisting',['node',W,'--out',S+'/p/exist.json','--scratch',S+'/ws5a'],expect='exit1 refuse')
run('F5b-out-symlink-to-r39-receipt',['node',W,'--out',S+'/p/link39.json','--scratch',S+'/ws5b'],expect='exit1 refuse')
run('F5c-out-dotdot-to-r39-receipt',['node',W,'--out',R+'/corpus/evidence/round40/../round-39/playwright-egress/receipt.json','--scratch',S+'/ws5c'],expect='exit1 refuse (note: mkdir of corpus/evidence/round40 not reached)')
run('F5d-out-dangling-symlink-fake-driver',['node',W,'--out',S+'/p/dangling.json','--scratch',S+'/ws5d'],env={'NODE_OPTIONS':'--require '+S+'/forger.cjs','FORGE_MODE':'full'},expect='info: dangling symlink passes exists check')
run('F5e-relative-out-other-cwd',['node',W,'--out','p/exist.json','--scratch','ws5e'],expect='exit1 refuse')
json.dump(res,open(S+'/results.json','w'),indent=1)
