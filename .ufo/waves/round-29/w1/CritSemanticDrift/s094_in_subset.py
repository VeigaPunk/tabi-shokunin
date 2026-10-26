import json,os,shutil,subprocess,hashlib
S='/fast/scratch/hyaku/tabi-r29/CritSemanticDrift'; LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin'
NEW='156.0.8078.47'; OLD='154.0.8037.97'
p='third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc'
sha=lambda b: hashlib.sha256(b).hexdigest()
src=os.path.join(S,'tip-subset'); D=os.path.join(S,'tip-subset-remedy')
shutil.rmtree(D,ignore_errors=True); shutil.copytree(src,D)
ob=subprocess.run(['zcat',LANE+'/corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz'],capture_output=True).stdout
nb=open(S+'/nf/r156-2.bin','rb').read()
for t,b in ((OLD,ob),(NEW,nb)):
    d=os.path.join(D,'corpus/evidence/round-29/release-pins/bytes',t,p); os.makedirs(os.path.dirname(d),exist_ok=True); open(d,'wb').write(b)
rp=D+'/corpus/evidence/round-29/release-pins/receipt.json'; r=json.load(open(rp))
for e in r['rows']:
    if e['id']=='S094':
        for f in e['files']:
            f['old_sha256']=sha(ob); f['new_sha256']=sha(nb)
        e['fetched_by']='PinS094'
json.dump(r,open(rp,'w'),indent=1)
rf=D+'/corpus/evidence/round-29/release-pins/refetch/S094.json'; j=json.load(open(rf))
j['seat']='independent-seat-B'; j['files']=[{'path':p,'tag':NEW,'status':404,'sha256':sha(nb)}]
json.dump(j,open(rf,'w'),indent=1)
subprocess.run(['git','-C',D,'add','-A'],check=True); subprocess.run(['git','-C',D,'-c','user.name=c','-c','user.email=c@e.invalid','commit','-qm','s094 remedy a'],check=True)
out=subprocess.run(['node',LANE+'/scripts/check-release-pins.mjs','--repo',D,'--rev','HEAD','--stable',NEW,'--json'],capture_output=True,text=True)
d=json.loads(out.stdout)
print('exit',out.returncode,{k:d[k] for k in ('population','resolved','unresolved','holds','drifted','clean')})
for r_ in d['rows']:
    if not r_['resolved'] or r_['verdict']!='holds': print(' ',r_['id'],r_['resolved'],r_['verdict'],r_['reasons'])
json.dump({'exit':out.returncode,'out':d},open(os.path.join(S,'tip-subset-remedy-run.json'),'w'),indent=1)
