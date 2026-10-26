import re, unicodedata
C="/fast/scratch/hyaku/tabi-r31/RevLesson/clone/corpus/evidence/round-31/decision-table/bytes/"
def words(q): return len(q.split())
spans=[
 ("S119 gate 377-378","S119.txt","377-378","The crawlers SHOULD follow at least five consecutive redirects, even across authorities",12),
 ("S120 gate 137-139","S120.txt","137-139","The response representations SHOULD include details explaining the condition, and MAY include a Retry-After header indicating how long to wait before making a new request.",25),
 ("S121 gate 67","S121.html","67","No more than 900 points per minute are allowed for REST API endpoints",13),
 ("S122 gate 51","S122.html","51","Otherwise, wait for at least one minute before retrying.",9),
 ("S119 f384-385","S119.txt","384-385","If there are more than five consecutive redirects, crawlers MAY assume that the robots.txt file is unavailable.",17),
 ("S119 f425","S119.txt","425","The parsing limit MUST be at least 500 kibibytes [KiB].",10),
 ("S119 f419","S119.txt","419","SHOULD NOT use the cached version for more than 24 hours",11),
 ("S119 f392","S119.txt","392","such status codes are in the 400-499 range",None),
 ("S119 f403","S119.txt","403","server errors are identified by status codes in the 500-599 range",None),
 ("S119 f406","S119.txt","406","for example, 30 days",None),
 ("S120 f145","S120.txt","145","Retry-After: 3600",2),
 ("S120 f165","S120.txt","165","Responses with the 429 status code MUST NOT be stored by a cache.",13),
 ("S121 f38","S121.html","38","The primary rate limit for unauthenticated requests is 60 requests per hour.",12),
 ("S121 f66","S121.html","66","No more than 100 concurrent requests are allowed.",8),
 ("S121 f70","S121.html","70","no more than 80 content-generating requests per minute and no more than 500 content-generating requests per hour are allowed",19),
 ("S121 f41","S121.html","41","your personal rate limit of 5,000 requests per hour",None),
 ("S121 f61","S121.html","61","The rate limit for GITHUB_TOKEN is 1,000 requests per hour per repository.",None),
 ("S121 f143","S121.html","143","you will receive a 403 or 429 response, and the x-ratelimit-remaining header will be 0",None),
 ("S122 f43","S122.html","43","you should make requests serially instead of concurrently",8),
 ("S122 f45","S122.html","45","wait at least one second between each request",8),
 ("S122 f49","S122.html","49","If the retry-after response header is present, you should not retry your request until after that many seconds has elapsed.",20),
 ("S122 f51b","S122.html","51","wait for an exponentially increasing amount of time between retries",10),
]
def norm(t):
    t=re.sub(r'<[^>]+>',' ',t)
    t=unicodedata.normalize('NFKC',t)
    for a,b in [('&quot;','"'),('&amp;','&'),('&#x27;',"'"),('&lt;','<'),('&gt;','>'),('&nbsp;',' ')]:
        t=t.replace(a,b)
    return re.sub(r'\s+',' ',t)
cache={}
def load(f):
    if f not in cache:
        raw=open(C+f,encoding='utf-8',errors='replace').read()
        cache[f]=(raw,raw.split('\n'),norm(raw))
    return cache[f]
fails=0
for label,f,rng,q,cw in spans:
    raw,lines,nrm=load(f)
    parts=rng.split('-'); a=int(parts[0]); b=int(parts[-1])
    w=words(q); nq=norm(q)
    npos=nrm.find(nq)
    seg=norm(' '.join(lines[a-1:b]))
    inseg=nq in seg
    # where does it actually sit (normalized line map)
    loc=[]
    off=0
    for i,l in enumerate(lines,1):
        nl=norm(l)
        if nq and nq in nl: loc.append(i)
        off+=len(nl)+1
    cwtxt=f"claimed={cw}" if cw else "claimed=-"
    st=[]
    if npos<0: st.append("NOT-in-normalized-bytes")
    if not inseg: st.append(f"NOT-in-cited-lines-{rng}")
    if cw is not None and cw!=w: st.append(f"wordcount {w}!={cw}")
    m="OK" if not st else "FAIL"
    if m=="FAIL": fails+=1
    print(f"{m:4} {label:18} words={w:3} {cwtxt:12} npos={npos:7} cited=({rng}) exactlines={loc[:4]} {'; '.join(st)}")
print("FAILS:",fails)
