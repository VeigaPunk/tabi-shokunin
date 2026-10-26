import re, os, subprocess
C="/fast/scratch/hyaku/tabi-r31/RevLesson/clone"
L=f"{C}/corpus/lessons/round-31.md"
text=open(L).read()
toks=set(re.findall(r'`([^`\n]+)`', text))
pat=re.compile(r'^([^`]*\.(?:md|txt|json|mjs|tsv|sh|html|diff|exit|log))(?::(\d+)(?:-(\d+))?)?$')
# candidate bases for relative paths
bases=["", ".ufo/waves/round-31/", ".ufo/waves/round-31/baseline/", ".ufo/waves/round-31/measure/",
       ".ufo/waves/round-30/", ".ufo/waves/round-30/w2/", ".ufo/waves/round-31/w1/"]
unresolved=[]; ok=[]
for t in sorted(toks):
    m=pat.match(t.strip())
    if not m: continue
    path, a, b = m.group(1), m.group(2), m.group(3)
    cands=[]
    for base in bases:
        p=os.path.join(C,base,path)
        if os.path.exists(p): cands.append((base,p))
    if not cands:
        unresolved.append(t); continue
    base,p=cands[0]
    if a:
        n=len(open(p,errors='replace').read().split('\n'))
        if int(a)>n or (b and int(b)>n): unresolved.append(t+f" (line>{n})")
        else: ok.append((t,base or '.'))
    else: ok.append((t,base or '.'))
print(f"RESOLVED {len(ok)}:")
for t,b in ok: print(f"  [{b}] {t}")
print(f"\nUNRESOLVED {len(unresolved)}:")
for t in unresolved: print(f"  {t}")
