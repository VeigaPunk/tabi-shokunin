import re, json, pathlib
raw = pathlib.Path('.ufo/waves/round-23/scratch/W2QuoteA/s102.txt').read_text(encoding='utf-8')
lines = raw.split('\n')
norm = lambda s: re.sub(r'\s+', ' ', s).strip()
# spans as written in the entry (S102-attributed)
spans = [
 ('S102-1', '"SameSite" cookies offer a robust defense against CSRF attack when deployed in strict mode, and when supported by the client'),
 ('S102-2', "It is, however, prudent to ensure that this designation is not the extent of a site's defense against CSRF"),
 ('S102-3', 'Developers are strongly encouraged to deploy the usual server-side defenses (CSRF tokens, ensuring that "safe" HTTP methods are idempotent, etc)'),
]
# build normalized text with line index map
buf=[]; idx=[]
for i,l in enumerate(lines,1):
    t=l.strip()
    if not t: continue
    if buf: buf.append(' ')
    for ch in t:
        buf.append(ch); idx.append(i)
    # map the space
    idx.append(i)
full=''.join(buf)
fulln=re.sub(r'\s+',' ',full)
# map normalized positions back: rebuild with map
out=[]; omap=[]
prev_space=False
for k,ch in enumerate(full):
    if ch.isspace():
        if prev_space: continue
        out.append(' '); omap.append(idx[k]); prev_space=True
    else:
        out.append(ch); omap.append(idx[k]); prev_space=False
fulln=''.join(out)
res={}
for name,q in spans:
    qn=norm(q)
    # RFC puts two spaces after sentence period; normalize both sides
    pos=fulln.find(qn)
    wc=len(re.findall(r'\S+', qn))
    if pos<0:
        res[name]={'match':False,'words':wc,'quote':qn}
    else:
        a=omap[pos]; b=omap[pos+len(qn)-1]
        res[name]={'match':True,'words':wc,'lines':[a,b],'quote':qn,
                   'after': fulln[pos+len(qn): pos+len(qn)+60]}
print(json.dumps(res,indent=1))
# section bounds
for i,l in enumerate(lines,1):
    if re.match(r'^8\.8\.', l): print('SEC',i,l)
