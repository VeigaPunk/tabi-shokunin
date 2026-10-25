import json, re, subprocess, sys
LANE="/home/vgpnk/Projects/shokunin/tabi-shokunin"
def git(*a): return subprocess.run(["git","-C",LANE,*a],capture_output=True,text=True,check=True).stdout
def derive(rev, N, base):
    pre=f".ufo/waves/round-{N}"
    files=[f for f in git("ls-tree","-r","--name-only",rev,"--",pre).splitlines()]
    ID=re.compile(r"\bTabiR(\d+)(?:-(\d+))?\b")
    acts=set(); stamps=[]
    for f in files:
        if not f.endswith(".json"): continue
        try: d=json.loads(git("show",f"{rev}:{f}"))
        except Exception: continue
        s=json.dumps(d)
        for m in ID.finditer(s):
            if int(m.group(1))==int(N): acts.add("TabiR%s%s"%(m.group(1),"-"+m.group(2) if m.group(2) else ""))
        def scan(o):
            if isinstance(o,dict):
                for k,v in o.items():
                    if k in("at","createdAt","openedAt","updatedAt") and isinstance(v,str): stamps.append((v,f))
                    scan(v)
            elif isinstance(o,list):
                for v in o: scan(v)
        scan(d)
    ct=[int(x) for x in git("log","--format=%ct",f"{base}..{rev}").split()]
    hdr=git("log","--format=%ct",f"{base}..{rev}")
    import datetime
    stamps.sort()
    def p(s):
        s=s.replace("Z","+00:00")
        return datetime.datetime.fromisoformat(s).timestamp()
    tl=sorted([(p(s),f) for s,f in stamps]+[(c,"commit") for c in ct])
    gaps=[]
    for (t0,f0),(t1,f1) in zip(tl,tl[1:]):
        if t1-t0>=12*3600:
            gaps.append((datetime.datetime.utcfromtimestamp(t0).isoformat()+"Z",datetime.datetime.utcfromtimestamp(t1).isoformat()+"Z",round((t1-t0)/3600,1),sum(1 for t,f in tl if t0<t<t1 and f=="commit")))
    need=0 if len(acts)<=1 else len(acts)
    need=max(need,1 if gaps else 0)
    return dict(rev=rev,round=N,files=len(files),acts=sorted(acts),commits=sorted(datetime.datetime.utcfromtimestamp(c).isoformat()+"Z" for c in ct),gaps=gaps,need=need,first=tl[0][0],last=tl[-1][0])
for rev,N,base in [("a89f193","22","5f58577"),("5f58577","21","e7cf11a")]:
    print(json.dumps(derive(rev,N,base),indent=1))
