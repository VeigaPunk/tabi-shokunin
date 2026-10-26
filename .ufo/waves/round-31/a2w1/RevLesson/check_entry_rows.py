import re, unicodedata
C="/fast/scratch/hyaku/tabi-r31/RevLesson/clone"
W="/home/vgpnk/Projects/shokunin/tabi-shokunin"
def norm(t):
    t=re.sub(r'<[^>]+>',' ',t); t=unicodedata.normalize('NFKC',t)
    for a,b in [('"','"'),('&','&'),('&#x27;',"'"),('<','<'),('>','>'),('&nbsp;',' ')]: t=t.replace(a,b)
    return re.sub(r'\s+',' ',t)
B=f"{C}/corpus/evidence/round-31/decision-table/bytes/"
bytes_={k:norm(open(B+f,errors='replace').read()) for k,f in {"S119":"S119.txt","S120":"S120.txt","S121":"S121.html","S122":"S122.html"}.items()}
ROW=re.compile(r'\|\s*D(\d+)\s*\|.*?\|\s*(S\d+)\s*\|\s*"(.+)"\s*\|\s*$')
def draft_rows(p):
    out={}
    for l in open(p,errors='replace'):
        m=ROW.match(l.rstrip('\n'))
        if m: out[int(m.group(1))]=(m.group(2),m.group(3))
    return out
D={'robots':draft_rows(f"{W}/.ufo/waves/round-31/w1/ScribeRowsRobots/rows.md"),
   'limits':draft_rows(f"{W}/.ufo/waves/round-31/w1/ScribeRowsGitHubLimits/rows.md"),
   'practice':draft_rows(f"{W}/.ufo/waves/round-31/w1/ScribeRowsGitHubPractice/rows.md"),
   'retry':draft_rows(f"{W}/.ufo/waves/round-31/w1/ScribeRowsRetry/rows.md")}
mapping=[('robots',1),('robots',3),('robots',4),('robots',5),('robots',6),
         ('limits',1),('limits',2),('limits',3),('limits',7),('limits',8),('limits',9),
         ('practice',1),('practice',3)]
erows={}
for l in open(f"{C}/corpus/knowledge/rate-signal-decision-table.md",errors='replace'):
    m=ROW.match(l.rstrip('\n'))
    if m: erows[int(m.group(1))]=(m.group(2),m.group(3))
print("entry rows found:",sorted(erows))
fails=0
for i,(src,dr) in enumerate(mapping,1):
    s,q=erows[i]; ds,dq=D[src][dr]
    inbytes = norm(q) in bytes_[s]
    same = (q==dq) and (s==ds)
    tag="OK" if (inbytes and same) else "FAIL"
    if tag=="FAIL": fails+=1
    print(f"{tag} entry D{i} <- {src} D{dr}: src {s}=={ds}:{same} quote-in-bytes:{inbytes}")
    if not same:
        print(f"   entry: {q}")
        print(f"   draft: {dq}")
print("FAILS:",fails)
