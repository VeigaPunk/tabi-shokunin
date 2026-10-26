import re
doc=open('/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/rate-limit-policy-fields.md',encoding='utf-8').read()
raw=open('r11.txt',encoding='utf-8',errors='replace').read()
def coll(s):
    s=s.replace('\u00a0',' ')
    return re.sub(r'\s+',' ',s).strip()
R=coll(raw)
# non-greedy across newlines, no quote chars inside
spans=[]
for m in re.finditer(r'"([^"]{1,900}?)"',doc,re.S):
    t=m.group(1)
    c=coll(t)
    words=c.split()
    if len(words)>=4:
        line=doc[:m.start()].count('\n')+1
        spans.append((line,c))
print("TOTAL >=4-word double-quoted spans:",len(spans))
bad=[]
for line,c in spans:
    ok = c in R
    print(("FOUND   " if ok else "MISSING ")+f"L{line}: {c}")
    if not ok: bad.append((line,c))
print("\nMISSING COUNT:",len(bad))
for line,c in bad:
    print(f"\n=== L{line} MISSING ===\n{c}")
    w=c.split()
    hit=False
    for a in range(0,5):
        for b in range(0,5):
            if a+b>=len(w): continue
            sub=' '.join(w[a:len(w)-b if b else None])
            if sub in R:
                print(f"  best sub (drop {a} head / {b} tail): {sub}")
                hit=True; break
        if hit: break
    if not hit:
        # try dropping internal clause after em dash / semicolon
        print("  no contiguous sub found; trying clause splits")
        for part in re.split(r'\s*(?:—|;|,)\s*',c):
            if len(part.split())>=4 and part in R: print("   clause found:",part)
