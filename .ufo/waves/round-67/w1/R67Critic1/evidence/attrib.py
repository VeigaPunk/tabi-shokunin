import subprocess,json,collections
L='/home/vgpnk/Projects/shokunin/tabi-shokunin'; R='/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66'; S='/fast/scratch/hyaku/tabi-r67/R67Critic1/sweep'
V=['no-tabi-ground','overlap-declared','contested-open']
rows=open(f'{R}/c1/adjudicated/adjacency-host-delta-r66.tsv',encoding='utf8').read().split('\n')
lineidx=[i for i,l in enumerate(rows) if l and l.split('\t')[0]=='line']
def run(meter, delta):
    p=subprocess.run(['node',meter,'--rev','5400136b233579f7b716ab83a70b8be24ed88b26','--repo',L,'--fleet','/home/vgpnk/Projects/shokunin','--snapshot',f'{R}/measure/snapshot-live-r66.tsv','--audit',f'{R}/c1/adjudicated/adjacency-host-audit-r66.tsv','--delta',delta,'--json'],capture_output=True,text=True,timeout=120)
    d=json.loads(p.stdout); return d['predicate'], d['findingCount'], sorted(set(f['id'] for f in d['findings']))
base={'v22':run('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs', f'{R}/c1/adjudicated/adjacency-host-delta-r66.tsv'),'v23sim':run(f'{S}/v23sim.mjs', f'{R}/c1/adjudicated/adjacency-host-delta-r66.tsv')}
print('baselines', base)
out={'v22':collections.Counter(),'v23sim':collections.Counter()}
ex=[]
tmp=f'{S}/flip-attrib.tsv'
for meter,key in [('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs','v22'),(f'{S}/v23sim.mjs','v23sim')]:
    bpred,bcount,_=base[key]
    for i in lineidx:
        cells=rows[i].split('\t'); d0=cells[7]
        for d1 in V:
            if d1==d0: continue
            c=list(cells); c[7]=d1; new=rows[:]; new[i]='\t'.join(c)
            open(tmp,'w',encoding='utf8').write('\n'.join(new))
            pred,cnt,ids=run(meter,tmp)
            if pred is not True and cnt > bcount: out[key]['attributable-kill']+=1; 
            elif pred is not True: out[key]['red-but-not-attributable']+=1
            else: out[key]['green-survive']+=1
            if key=='v23sim' and cnt>bcount: ex.append((cells[1],cells[2],d0,d1,cnt))
print({k:dict(v) for k,v in out.items()})
print('v23sim attributable kinds', collections.Counter((e[2],e[3]) for e in ex))
json.dump({'baseline':base,'counts':{k:dict(v) for k,v in out.items()},'attributable':ex}, open(f'{S}/attrib-summary.json','w'), indent=1)
