import re,html,json,hashlib

def load(p):
    b=open(p,'rb').read()
    return b.decode('utf-8','replace'), hashlib.sha256(b).hexdigest(), len(b)

def _map_ws(s, start=0):
    out=[]; imap=[]; i=0; n=len(s)
    while i<n:
        if s[i].isspace():
            j=i
            while j<n and s[j].isspace(): j+=1
            out.append(' '); imap.append((start+i) if False else i)
            i=j
        else:
            out.append(s[i]); imap.append(i); i+=1
    return ''.join(out), imap

def _map_ident(s):
    return ''.join(s), list(range(len(s)))

def _map_unescape(s):
    # html.unescape; map each output char to the input index of the entity start
    out=[]; imap=[]; i=0; n=len(s)
    ent=re.compile(r'&(?:#[0-9]+|#[xX][0-9a-fA-F]+|[A-Za-z][A-Za-z0-9]*);')
    while i<n:
        m=ent.match(s,i)
        if m:
            dec=html.unescape(m.group(0))
            for k,ch in enumerate(dec):
                out.append(ch); imap.append(i)
            i=m.end()
        else:
            out.append(s[i]); imap.append(i); i+=1
    return ''.join(out), imap

def _map_striptags(s):
    out=[]; imap=[]; i=0; n=len(s)
    tag=re.compile(r'(?s)<!--.*?-->|<(?:script|style)\b.*?</(?:script|style)>|<[^>]*>', re.I)
    while i<n:
        m=tag.match(s,i)
        if m:
            out.append(' '); imap.append(i)
            i=m.end()
        else:
            out.append(s[i]); imap.append(i); i+=1
    return ''.join(out), imap

def _map_punct(s):
    out=[]; imap=[]; keep=re.compile(r'[\w\s]',re.U)
    for i,ch in enumerate(s):
        if keep.match(ch):
            out.append(ch); imap.append(i)
        else:
            out.append(' '); imap.append(i)
    return ''.join(out), imap

def compose(*fs):
    # returns function raw-> (text,imap)
    def run(s):
        cur=s; imap=list(range(len(s)))
        for f in fs:
            nxt, m2 = f(cur)
            imap=[imap[k] for k in m2]
            cur=nxt
        return cur, imap
    return run

def ident(s): return s, list(range(len(s)))
def lower_map(s): return s.lower(), list(range(len(s)))
def strip_tags_dec(s):
    t,m1=_map_unescape(s)
    t2,m2=_map_striptags(t)
    return t2,[m1[k] for k in m2]

FOLDS={
 'f0': (lambda s:(s,list(range(len(s))))),
 'f1': (lambda s:(s.lower(),list(range(len(s))))),
 'f2': (compose(_map_ws)),
 'f3': (compose(_map_unescape)),
 'f4': (compose(strip_tags_dec,_map_ws)),
 'f5': (compose(strip_tags_dec,_map_ws,lower_map)),
 'f6': (compose(strip_tags_dec,_map_punct,_map_ws)),
 'f6i': (compose(strip_tags_dec,_map_punct,_map_ws,lower_map)),
}
def norm_needle(q,fold):
    if fold=='f0': return q
    if fold=='f1': return q.lower()
    if fold=='f2': return re.sub(r'\s+',' ',q)
    if fold=='f3': return html.unescape(q)
    if fold in ('f4','f5'):
        t=re.sub(r'(?s)<[^>]*>',' ',html.unescape(q))
        t=re.sub(r'\s+',' ',t)
        return t.lower() if fold=='f5' else t
    if fold=='f6':
        t=re.sub(r'(?s)<[^>]*>',' ',html.unescape(q))
        t=''.join(ch if re.match(r'[\w\s]',ch,re.U) else ' ' for ch in t)
        return re.sub(r'\s+',' ',t).strip()
    raise ValueError(fold)

def run_fold(raw,q,fold):
    fn=FOLDS[fold]
    hay,imap=fn(raw)
    needle=norm_needle(q,fold)
    # f6 and f4 needles are stripped already; strip leading/trailing spaces for matching
    needle=needle.strip() if fold in ('f4','f5','f6') else needle
    hits=[]; i=0
    while True:
        j=hay.find(needle,i)
        if j<0: break
        hits.append(j); i=j+1
    out=[]
    for j in hits:
        ci=imap[j]
        byte=len(raw[:ci].encode('utf-8'))
        line=raw.count('\n',0,ci)+1
        out.append(dict(fold=fold,foldIndex=j,rawChar=ci,byteOffset=byte,line=line,
                        context=raw[max(0,ci-70):ci+len(q)+70].replace('\n','\\n')))
    return out

def locate_all(raw,frag):
    res={}
    for f in ('f0','f1','f2','f3','f4','f5','f6'):
        try: res[f]=run_fold(raw,frag,f)
        except Exception as e: res[f]=[dict(error=str(e))]
    return res
