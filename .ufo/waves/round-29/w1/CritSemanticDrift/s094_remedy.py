import json,os,shutil,subprocess,hashlib
S='/fast/scratch/hyaku/tabi-r29/CritSemanticDrift'; LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin'
OLD='154.0.8037.97'; NEW='156.0.8078.47'; BYTES='corpus/evidence/round-29/release-pins/bytes'; REF='corpus/evidence/round-29/release-pins/refetch'
p='third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc'
sha=lambda b: hashlib.sha256(b).hexdigest()
ob=subprocess.run(['zcat',LANE+'/corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz'],capture_output=True).stdout
for name,newbody in (('remedy-a',open(S+'/nf/r156-2.bin','rb').read()),('remedy-a-otherpath',open(S+'/nf/other-path-404.bin','rb').read())):
    nb=newbody
    D=os.path.join(S,name); shutil.rmtree(D,ignore_errors=True); os.makedirs(D)
    subprocess.run(['git','-C',D,'init','-q'],check=True)
    assert os.path.realpath(subprocess.run(['git','-C',D,'rev-parse','--show-toplevel'],capture_output=True,text=True).stdout.strip())==os.path.realpath(D)
    so=subprocess.run(['git','-C',LANE,'show','HEAD:corpus/SOURCES.md'],capture_output=True); os.makedirs(D+'/corpus'); open(D+'/corpus/SOURCES.md','wb').write(so.stdout)
    for t,b in ((OLD,ob),(NEW,nb)):
        d=os.path.join(D,BYTES,t,p); os.makedirs(os.path.dirname(d),exist_ok=True); open(d,'wb').write(b)
    ent={'id':'S094','fetched_by':'PinS094','files':[{'path':p,'old_tag':OLD,'old_status':404,'new_status':404,
     'old_bytes':f'{BYTES}/{OLD}/{p}','new_bytes':f'{BYTES}/{NEW}/{p}','old_sha256':sha(ob),'new_sha256':sha(nb),'ranges':[]}]}
    os.makedirs(D+'/'+REF); json.dump({'id':'S094','seat':'independent-seat-B','fetched_at':'2026-10-26T00:00:00Z','files':[{'path':p,'tag':NEW,'status':404,'sha256':sha(nb)}]},open(D+'/'+REF+'/S094.json','w'))
    rp=D+'/corpus/evidence/round-29/release-pins/receipt.json'; os.makedirs(os.path.dirname(rp),exist_ok=True)
    json.dump({'schema':'tabi-release-pins-v1','stable':NEW,'rows':[ent]},open(rp,'w'))
    subprocess.run(['git','-C',D,'add','-A'],check=True); subprocess.run(['git','-C',D,'-c','user.name=c','-c','user.email=c@e.invalid','commit','-qm','x'],check=True)
    out=subprocess.run(['node',LANE+'/scripts/check-release-pins.mjs','--repo',D,'--rev','HEAD','--stable',NEW,'--json'],capture_output=True,text=True)
    d=json.loads(out.stdout)
    row=[r for r in d['rows'] if r['id']=='S094'][0]
    print(name,'exit',out.returncode,'| S094:',row['resolved'],row['verdict'],row['reasons'],'| new_sha',sha(nb)[:16])
