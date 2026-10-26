import hashlib,json,os,shutil,subprocess
S='/fast/scratch/hyaku/tabi-r29/CritSemanticDrift'
LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin'
OLD='154.0.8037.97'; NEW='156.0.8078.47'
BYTES='corpus/evidence/round-29/release-pins/bytes'
REFETCH='corpus/evidence/round-29/release-pins/refetch'
P={
 'idl':'third_party/blink/renderer/core/script_tools/model_context_supplement.idl',
 'json5':'third_party/blink/renderer/platform/runtime_enabled_features.json5',
 'pdl':'third_party/blink/public/devtools_protocol/domains/WebMCP.pdl',
 'page':'third_party/blink/public/devtools_protocol/domains/Page.pdl',
 'mc':'third_party/blink/renderer/core/script_tools/model_context.cc',
 'wpt':'third_party/blink/web_tests/external/wpt/webmcp/imperative/executeTool-abort.https.html',
 'inv':'third_party/blink/web_tests/inspector-protocol/webmcp/invoke-tool.js',
 'sw':'content/public/common/content_switches.cc',
 'pipe':'content/browser/devtools/devtools_pipe_handler.cc',
 'rds':'chrome/browser/devtools/remote_debugging_server.cc',
 'dh':'content/browser/devtools/devtools_http_handler.cc',
 'cl':'base/command_line.cc',
 'fl':'base/feature_list.cc',
 'fms':'third_party/blink/renderer/core/html/forms/form_mcp_schema.cc',
 'fmsh':'third_party/blink/renderer/core/html/forms/form_mcp_schema.h',
 'hfe':'third_party/blink/renderer/core/html/forms/html_form_element.cc',
 'iwma':'third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc',
 'stt':'third_party/blink/renderer/core/script_tools/script_tool_types.h',
 'mojom':'third_party/blink/public/mojom/frame/frame.mojom',
 'lfmh':'third_party/blink/renderer/core/frame/local_frame_mojo_handler.cc',
 'sel':'third_party/blink/renderer/core/html/forms/html_select_element.cc',
 'cf':'content/public/common/content_features.cc',
}
def path(k,tag): return os.path.join(S,tag,P[k].replace('/','_'))
def load(k,tag):
    if k=='404': return open(os.path.join(S,'nf',tag+'.404body'),'rb').read()
    return open(path(k,tag),'rb').read()
sha=lambda b: hashlib.sha256(b).hexdigest()

FULL={
 'S033':[('idl',[[7,12]])],
 'S034':[('json5',[[7023,7050]])],
 'S041':[('pdl',[[7,7],[58,122]])],
 'S042':[('mc',[[528,580],[748,811],[856,873]])],
 'S045':[('wpt',[[87,87],[113,113]]),('inv',[[38,51]]),('pdl',[[68,68]])],
 'S062':[('sw',[[596,603]]),('pipe',[[135,200]]),('rds',[[353,400]]),('dh',[[297,306]])],
 'S064':[('cl',[[449,455]]),('fl',[[417,453],[872,875]])],
 'S071':[('fms',[[208,243]]),('hfe',[[192,258]]),('mc',[[562,565],[752,811]])],
 'S074':[('json5',[[7023,7050]])],
 'S077':[('fms',[[49,111],[208,490],[930,1093],[1238,1438]])],
 'S078':[('hfe',[[174,328],[635,842]])],
 'S079':[('pdl',[[25,30],[109,123]]),('iwma',[[208,243]])],
 'S080':[('stt',[[16,49]]),('fms',[[208,300]]),('hfe',[[174,259]]),('mojom',[[1112,1119]]),
         ('lfmh',[[987,1005]]),('mc',[[528,580],[695,745]]),('iwma',[[220,243]]),('pdl',[[25,30],[109,123]])],
 'S081':[('sel',[[291,347],[871,887],[1047,1108],[1162,1184],[180,210]])],
 'S093':[('fms',[[121,181],[491,539],[556,928],[1095,1236],[1238,1438]]),('fmsh',[[41,50],[56,121],[148,158]])],
 'S094':[('404',[])],
 'S096':[('hfe',[[174,328],[729,758],[818,842]])],
 'S097':[('iwma',[[47,64],[208,243]])],
 'S098':[('fms',[[491,928],[583,583]])],
 'S099':[('pdl',[[59,69],[109,123]])],
 'S100':[('hfe',[[174,328],[635,842]])],
 'S105':[('page',[[1345,1345],[1706,1706]])],
 'S106':[('cf',[[186,187]])],
}
SUBSET=dict(FULL)
SUBSET.update({
 'S042':[('mc',[[856,873]])],
 'S071':[('fms',[[208,243]])],
 'S078':[('hfe',[[635,842]])],
 'S080':[('fms',[[208,300]])],
 'S081':[('sel',[[291,347],[871,887],[1162,1184],[180,210]])],
 'S096':[('hfe',[[729,758],[818,842]])],
 'S100':[('hfe',[[635,842]])],
})
def build(name,mapping,refetch_mode):
    D=os.path.join(S,'tip-'+name)
    if os.path.exists(D): shutil.rmtree(D)
    os.makedirs(D)
    subprocess.run(['git','-C',D,'init','-q'],check=True)
    top=subprocess.run(['git','-C',D,'rev-parse','--show-toplevel'],capture_output=True,text=True).stdout.strip()
    assert os.path.realpath(top)==os.path.realpath(D)
    so=subprocess.run(['git','-C',LANE,'show','HEAD:corpus/SOURCES.md'],capture_output=True)
    assert so.returncode==0
    os.makedirs(os.path.join(D,'corpus')); open(os.path.join(D,'corpus/SOURCES.md'),'wb').write(so.stdout)
    rows=[]
    for rid,files in mapping.items():
        ents=[]; rfs=[]
        for k,ranges in files:
            if k=='404':
                ob=load('404',OLD); nb=load('404',NEW)
                if refetch_mode=='honest': rb=open(os.path.join(S,'nf/r156-2.bin'),'rb').read()
                else: rb=nb
                pp=P['fms'].replace('form_mcp_schema.cc','form_mcp_schema_unittest.cc')
                e={'path':pp,'old_tag':OLD,'old_status':404,'new_status':404,
                   'old_bytes':f'{BYTES}/{OLD}/{pp}','new_bytes':f'{BYTES}/{NEW}/{pp}',
                   'old_sha256':sha(ob),'new_sha256':sha(nb),'ranges':ranges}
                rfs.append({'path':pp,'tag':NEW,'status':404,'sha256':sha(rb)})
            else:
                pp=P[k]; ob=load(k,OLD); nb=load(k,NEW)
                e={'path':pp,'old_tag':OLD,'old_status':200,'new_status':200,
                   'old_bytes':f'{BYTES}/{OLD}/{pp}','new_bytes':f'{BYTES}/{NEW}/{pp}',
                   'old_sha256':sha(ob),'new_sha256':sha(nb),'ranges':ranges}
                rfs.append({'path':pp,'tag':NEW,'status':200,'sha256':sha(nb)})
            for t,buf in ((OLD,ob),(NEW,nb)):
                dst=os.path.join(D,BYTES,t,e['path']); os.makedirs(os.path.dirname(dst),exist_ok=True)
                open(dst,'wb').write(buf)
            ents.append(e)
        ent={'id':rid,'fetched_by':'W1-author','files':ents}
        if name.startswith('full'): ent['superseded_by']={'S042':'S109','S071':'S110','S078':'S111','S080':'S112','S081':'S113','S096':'S114','S100':'S115'}.get(rid,None)
        if ent.get('superseded_by') is None: ent.pop('superseded_by',None)
        rows.append(ent)
        os.makedirs(os.path.join(D,REFETCH),exist_ok=True)
        json.dump({'id':rid,'seat':'W1-refetcher','fetched_at':'2026-10-26T00:00:00Z','files':rfs},
                  open(os.path.join(D,REFETCH,rid+'.json'),'w'),indent=1)
    rp=os.path.join(D,'corpus/evidence/round-29/release-pins/receipt.json')
    os.makedirs(os.path.dirname(rp),exist_ok=True)
    json.dump({'schema':'tabi-release-pins-v1','stable':NEW,'rows':rows},open(rp,'w'),indent=1)
    subprocess.run(['git','-C',D,'add','-A'],check=True)
    subprocess.run(['git','-C',D,'-c','user.name=crit','-c','user.email=crit@example.invalid','commit','-qm','fixture'],check=True)
    return D
for name,mapping,mode in (('subset',SUBSET,'honest'),('full',FULL,'honest'),('subset-fakerefetch',SUBSET,'fake')):
    D=build(name,mapping,mode)
    out=subprocess.run(['node',LANE+'/scripts/check-release-pins.mjs','--repo',D,'--rev','HEAD','--stable',NEW,'--json'],capture_output=True,text=True)
    d=json.loads(out.stdout)
    print('#'*15,name,'exit',out.returncode,{k:d[k] for k in ('population','resolved','unresolved','holds','drifted')})
    for r in d['rows']:
        if not r['resolved'] or r['verdict']!='holds': print('  ',r['id'],r['resolved'],r['verdict'],r['reasons'])
    json.dump({'exit':out.returncode,'out':d},open(os.path.join(S,f'all-{name}-run.json'),'w'),indent=1)
