import re, json, sys
root=sys.argv[1]; stable=sys.argv[2]
text=open(root+'/corpus/SOURCES.md').read().split('\n')
ROW=re.compile(r'^ {0,3}\|\s*S\d{3,}\s*\|')
TAG=re.compile(r'refs/tags/(\d+\.\d+\.\d+\.\d+)/')
DEV=re.compile(r'https?://(?:github\.com/ChromeDevTools/devtools-frontend/(?:blob|raw)|raw\.githubusercontent\.com/ChromeDevTools/devtools-frontend)/([0-9a-f]{40})/')
VER=re.compile(r'\b(1\d\d(?:\.\d+){0,3})\b')
cv=lambda t:tuple(int(x) for x in t.split('.'))
rows=[]; malformed=[]
for i,line in enumerate(text,1):
    if not ROW.match(line): continue
    c=[x.strip() for x in line.split('|')]
    if len(c)!=13: malformed.append({'line':i,'cells':len(c)}); continue
    rows.append(dict(id=c[1],source=c[2],anchor=c[6],teaches=c[7],status=c[8],opened=c[9],recheck=c[10],usedby=c[11],line=i))
on=[r for r in rows if r['recheck']=='on-release']
buckets={'included_src_tag':[],'at_stable':[],'deps_devtools_commit':[],'main_branch':[],'non_chromium_host':[]}
for r in on:
    tags=TAG.findall(r['source'])
    if any(cv(t)<cv(stable) for t in tags): r['bucket']='included_src_tag'
    elif tags: r['bucket']='at_stable'
    elif DEV.search(r['source']):
        r['bucket']='deps_devtools_commit'; r['commit']=DEV.search(r['source']).group(1)
        r['anchor_versions']=sorted(set(VER.findall(r['anchor'])))
    elif '/chromium/chromium/' in r['source'] and '/main/' in r['source']: r['bucket']='main_branch'
    else: r['bucket']='non_chromium_host'
    buckets[r['bucket']].append(r['id'])
v1=buckets['included_src_tag']; deps=buckets['deps_devtools_commit']
out={
 'rev_root':root,'stable':stable,
 'registry_rows':len(rows),'malformed_rows':malformed,
 'on_release_total':len(on),
 'rule_v1':"recheck == 'on-release' && source cell carries refs/tags/<A.B.C.D>/ with tag < stable",
 'rule_v2':"recheck == 'on-release' && (source carries refs/tags/<A.B.C.D>/ < stable OR source is a devtools-frontend URL at a 40-hex commit whose committed DEPS binding (f7-deps) names it as devtools_frontend_revision at a tag < stable)",
 'v1_ids':v1,'v1_count':len(v1),
 'deps_ids':deps,'deps_count':len(deps),
 'v2_ids':v1+deps,'v2_count':len(v1)+len(deps),
 'buckets':{k:{'count':len(v),'ids':v} for k,v in buckets.items()},
 'deps_rows':[{k:r[k] for k in ('id','status','opened','recheck','commit','anchor_versions','usedby')} for r in on if r['bucket']=='deps_devtools_commit'],
 'status_not_in_rule':{r['id']:r['status'] for r in on if r['bucket'] in ('included_src_tag','deps_devtools_commit') and r['status']!='mined'},
}
json.dump(out,open(sys.argv[3],'w'),indent=1)
print(json.dumps({k:out[k] for k in ('registry_rows','on_release_total','v1_count','deps_count','v2_count','buckets','status_not_in_rule','deps_rows')},indent=1))
