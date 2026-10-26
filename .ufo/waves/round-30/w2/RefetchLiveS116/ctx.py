import re,sys
def load(p):
    lines=open(p,encoding='utf-8',errors='replace').read().split('\n')
    parts=[];idx=[]
    for n,l in enumerate(lines,1):
        s=re.sub(r'[ \t]+',' ',l).strip()
        if not s: continue
        parts.append(s); idx.append(n)
    # join with single spaces; build char->line map
    text=' '.join(parts)
    m=[];pos=0
    for s,n in zip(parts,idx):
        m.extend([n]*len(s)); m.append(n)  # separator maps to next line
        pos+=len(s)+1
    return lines,text,m[:-1]
def show(p,probe,pre=3,post=3):
    lines,text,m=load(p)
    i=text.find(probe)
    if i<0: print("NOT FOUND:",probe); return
    ln=m[i]
    print(f"\n##### {probe!r}  -> starts raw line {ln}")
    for j in range(max(1,ln-pre),min(len(lines),ln+post)+1):
        print(f"{j:5d}| {lines[j-1]}")
if __name__=='__main__':
    for p in sys.argv[2:]:
        show(sys.argv[1],p)
