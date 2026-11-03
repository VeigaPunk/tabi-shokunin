import re, pathlib, json, collections
GATE_RE = re.compile(r"^#{1,4}\s*Gate\b.*$", re.M)
GATE_ID_RE = re.compile(r"\bS\d{3,}\b")
ROWLINE = re.compile(r"^\|\s*(S\d+)\s*\|")
QUOTE_SPAN_RE = re.compile(
    r"[“”「」『』]{1,2}([^“”「」『』]{4,600})[“”「」『』]{1,2}"
    r"|\"((?:[^\"\\]|\\.){4,600})\"", re.S)
META_LINE_RE = re.compile(
    r"^(?:[-*]\s*)?(?:\*\*)?(?:URL|url|Source|Locator|Accessed|Opened|Open date|"
    r"Access date|Opened here|Revision pin|Revision|recheck|Recheck|Extraction|"
    r"Kind|Tier|Scope|Teaches|Status|Used-by|used-by)\b", re.I)
SWEEP_HINT = re.compile(r"grep|→|\*\*|ran 20|does not occur|zero|negative|absent|"
                        r"counts?\b|sha256|(?<![A-Za-z])bytes?\b|wc -|head -|tail -|not in the|"
                        r"contains no|occurs", re.I)

def lines_of(body):
    return body.splitlines()

def spans_out(body):
    out=[]
    lines=lines_of(body)
    for i,raw in enumerate(lines):
        s=raw.strip()
        if not s: continue
        if META_LINE_RE.match(s): continue
        is_sweep=bool(SWEEP_HINT.search(s))
        w=s; j=i
        while j+1<len(lines) and w.count('"')%2==1:
            j+=1; w+="\n"+lines[j]
        sp=[]
        for m in QUOTE_SPAN_RE.finditer(w):
            q=(m.group(1) or m.group(2) or '').strip()
            if len(q)<6: continue
            kind='ellipsis' if ('…' in q or '...' in q) else ('sweep' if is_sweep else 'literal')
            sp.append((q,kind))
        if sp: out.append((raw,sp))
    return out

lane=pathlib.Path('/home/vgpnk/Projects/shokuknow/lanes/tabi')
files=[('round1',lane/'SOURCES-PROPOSED.md')]+[(f'round{p.name[5:]}',p/'SOURCES-PROPOSED.md') for p in sorted(lane.glob('round*')) if p.is_dir() and (p/'SOURCES-PROPOSED.md').exists()]
conf={}
for rnd,src in files:
    text=src.read_text(encoding='utf-8',errors='replace')
    ms=list(GATE_RE.finditer(text))
    for i,m in enumerate(ms):
        head=m.group(0).strip(); end=ms[i+1].start() if i+1<len(ms) else len(text)
        body=text[m.end():end]
        hids=GATE_ID_RE.findall(head); bid=hids[0] if hids else None
        if not bid: continue
        own=[]; foreign=[]
        for raw,sp in spans_out(body):
            if ROWLINE.match(raw.strip()):
                foreign += [q for q,k in sp]
            else:
                own += [q for q,k in sp]
        conf[f'{rnd}|{bid}']={'own':own,'foreign':foreign}
json.dump(conf, open('/fast/scratch/hyaku/tabi-r57/R57Scout/contamination-faithful.json','w'), ensure_ascii=False, indent=1)
print('blocks',len(conf),'with foreign spans',sum(1 for v in conf.values() if v['foreign']),
      'foreign span count',sum(len(v['foreign']) for v in conf.values()))
