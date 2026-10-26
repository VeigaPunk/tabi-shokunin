import json,os,shutil,subprocess,hashlib
S='/fast/scratch/hyaku/tabi-r29/CritSemanticDrift'; LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin'
OLD='154.0.8037.97'; NEW='156.0.8078.47'; BYTES='corpus/evidence/round-29/release-pins/bytes'; REF='corpus/evidence/round-29/release-pins/refetch'
p='third_party/blink/renderer/platform/runtime_enabled_features.json5'
ob=open(f'{S}/{OLD}/'+p.replace('/','_'),'rb').read(); nb=open(f'{S}/{NEW}/'+p.replace('/','_'),'rb').read()
sha=lambda b: hashlib.sha256(b).hexdigest()
D=os.path.join(S,'degenerate'); shutil.rmtree(D,ignore_errors=True); os.makedirs(D)
subprocess.run(['git','-C',D,'init','-q'],check=True)
assert os.path.realpath(subprocess.run(['git','-C',D,'rev-parse','--show-toplevel'],capture_output=True,text=True).stdout.strip())==os.path.realpath(D)
so=subprocess.run(['git','-C',LANE,'show','HEAD:corpus/SOURCES.md'],capture_output=True); os.makedirs(D+'/corpus'); open(D+'/corpus/SOURCES.md','wb').write(so.stdout)
for t,b in ((OLD,ob),(NEW,nb)):
    d=os.path.join(D,BYTES,t,p); os.makedirs(os.path.dirname(d),exist_ok=True); open(d,'wb').write(b)
ent={'id':'S074','fetched_by':'author','files':[{'path':p,'old_tag':OLD,'old_status':200,'new_status':200,
 'old_bytes':f'{BYTES}/{OLD}/{p}','new_bytes':f'{BYTES}/{NEW}/{p}','old_sha256':sha(ob),'new_sha256':sha(nb),'ranges':[[7035,7035]]}]}
os.makedirs(D+'/'+REF); json.dump({'id':'S074','seat':'refetcher','fetched_at':'2026-10-26T00:00:00Z','files':[{'path':p,'tag':NEW,'status':200,'sha256':sha(nb)}]},open(D+'/'+REF+'/S074.json','w'))
rp=D+'/corpus/evidence/round-29/release-pins/receipt.json'; os.makedirs(os.path.dirname(rp),exist_ok=True)
json.dump({'schema':'tabi-release-pins-v1','stable':NEW,'rows':[ent]},open(rp,'w'))
subprocess.run(['git','-C',D,'add','-A'],check=True); subprocess.run(['git','-C',D,'-c','user.name=c','-c','user.email=c@e.invalid','commit','-qm','x'],check=True)
out=subprocess.run(['node',LANE+'/scripts/check-release-pins.mjs','--repo',D,'--rev','HEAD','--stable',NEW,'--json'],capture_output=True,text=True)
d=json.loads(out.stdout); print('exit',out.returncode,{k:d[k] for k in ('population','unresolved','holds','drifted')})
print([ (r['id'],r['resolved'],r['verdict'],r['reasons']) for r in d['rows'] if r['id']=='S074'])
print('line 7035 of the 154 file:',repr(ob.decode().split('\n')[7034]))
