import re, subprocess, json, os
LANE="/home/vgpnk/Projects/shokunin/tabi-shokunin"
def git(*a): return subprocess.run(["git","-C",LANE,*a],capture_output=True,text=True,check=True).stdout
PARA=re.compile(r"\n[ \t]*\n")
ID=re.compile(r"Stale-lane\b[^\n]*?\battempt=(\S+?)\b")
GRADE=re.compile(r"\b(progressing|silent|stalled)\b")
def tokens(text):
    out=[]
    for block in PARA.split(text):
        if "Stale-lane" not in block: continue
        m=ID.search(block); g=GRADE.search(block)
        if m and g: out.append((m.group(1).rstrip(".,:;)"), g.group(1)))
    return out
def surfaces(rev,N):
    out={}
    for p in (f".ufo/waves/round-{N}/report.md", f".ufo/waves/round-{N}/stale-lane.md", f"corpus/lessons/round-{N}.md"):
        try: out[p]=git("show",f"{rev}:{p}")
        except subprocess.CalledProcessError: pass
    try:
        log=git("show",f"{rev}:LOG.md")
        heads=[m.start() for m in re.finditer(r"^## .*Round\s*-?\s*%d\b.*$"%N, log, re.M|re.I)]
        if heads:
            s=heads[-1]; nxt=re.search(r"^## ",log[s+1:],re.M)
            out["LOG.md(round section)"]=log[s: s+1+(nxt.start() if nxt else len(log))]
    except subprocess.CalledProcessError: pass
    return out
if __name__=="__main__":
    for rev,N in (("a89f193",22),("5f58577",21)):
        sur=surfaces(rev,N)
        print(json.dumps(dict(rev=rev,round=N,surfaces=sorted(sur),graded_tokens=[(p,)+t for p,tx in sur.items() for t in tokens(tx)]),indent=1))
    fx=".ufo/waves/round-23/scratch/L1Tabi23.D4StaleAttempts/green-stale-lane.md"
    print("green_fixture_tokens=",tokens(open(os.path.join(LANE,fx)).read()))
    real="**Stale-lane:** none — respawn-per-round driver; no other mission of this lane is\nopen. This attempt landed round 22 only; rounds 23+ were not started.\n"
    print("real_report_paragraph_tokens=",tokens(real))
