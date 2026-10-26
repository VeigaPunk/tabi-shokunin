import re
md=open('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w1/ScribeEntryRateLimitFields/quotes.md',encoding='utf-8').read()
raw=open('r11.txt',encoding='utf-8',errors='replace').read().split('\n')
# collapse with line map
parts=[];idx=[]
for n,l in enumerate(raw,1):
    s=re.sub(r'[ \t]+',' ',l).strip()
    if not s: continue
    parts.append(s); idx.append(n)
text=' '.join(parts)
m=[]
for s,n in zip(parts,idx):
    m.extend([n]*len(s)); m.append(n)
m=m[:len(text)]
def coll(s): return re.sub(r'\s+',' ',s.replace('\u00a0',' ')).strip()
rows=[l for l in md.split('\n') if l.startswith('| ') and '|' in l and not l.startswith('| #') and not l.startswith('|---')]
bad=0
for r in rows:
    c=[x.strip() for x in r.strip('|').split('|')]
    if len(c)<6: continue
    num,sec,lines,words,quote,occ=c[0],c[1],c[2],c[3],c[4],c[5]
    q=coll(quote)
    starts=[mm.start() for mm in re.finditer(re.escape(q),text)]
    wc=len(q.split())
    problems=[]
    if not starts: problems.append("NOT FOUND")
    else:
        s=starts[0]; e=s+len(q)-1
        got=f"{m[s]}-{m[e]}" if m[s]!=m[e] else f"{m[s]}"
        if got.replace('–','-')!=lines.replace('–','-'): problems.append(f"lines {lines} != {got}")
        if str(len(starts))!=occ: problems.append(f"occ {occ} != {len(starts)}")
    if str(wc)!=words: problems.append(f"words {words} != {wc}")
    flag="OK   " if not problems else "BAD  "
    if problems: bad+=1
    print(f"{flag}#{num:>2} lines={lines:>8} {('; '.join(problems))}")
print("\nrows:",len(rows),"bad:",bad)
