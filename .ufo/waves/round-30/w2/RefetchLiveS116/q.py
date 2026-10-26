import re,json,sys
doc=open('/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/rate-limit-policy-fields.md',encoding='utf-8').read()
raw=open('r11.txt',encoding='utf-8',errors='replace').read()
def coll(s):
    s=s.replace('\u00a0',' ')
    return re.sub(r'\s+',' ',s).strip()
R=coll(raw)
# spans in double quotes, >=4 words
spans=[]
for m in re.finditer(r'"([^"\n]{1,600})"',doc):
    t=m.group(1)
    words=[w for w in re.split(r'\s+',t.strip()) if w]
    if len(words)>=4:
        line=doc[:m.start()].count('\n')+1
        spans.append((line,t))
print("TOTAL >=4-word double-quoted spans:",len(spans))
bad=[]
for line,t in spans:
    c=coll(t)
    # strip trailing punctuation variations already handled by exact search
    ok = c in R
    print(("FOUND " if ok else "MISSING ")+f"L{line}: {c[:120]}")
    if not ok: bad.append((line,c))
print("\nMISSING COUNT:",len(bad))
for line,c in bad:
    print(f"\n=== L{line} MISSING ===\n{c}\n--- near-match search ---")
    # try progressively dropping words from the ends
    w=c.split()
    for a in range(0,4):
        for b in range(0,4):
            if a+b>=len(w): continue
            sub=' '.join(w[a:len(w)-b if b else None])
            if sub in R:
                print(f"  found sub (drop {a} head, {b} tail): {sub[:160]}")
                break
        else: continue
        break
