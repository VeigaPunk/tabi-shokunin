import json,subprocess,re,sys
LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin'
led=open(LANE+'/corpus/adjacency-screen-skill.tsv',encoding='utf-8').read().split('\n')
rows=[l for l in led if l.strip()]
hdr=rows[0].split('\t')
print('header',hdr)
target=('tameshi','tsukuroi','chousa')
PINS={'tameshi':'c6295cb0473ec75a7f97b479321706b684adefac','tsukuroi':'a84fc9dec860f8bea516dff7ddfdc98223cdae52','chousa':'00f8c7f5272a1d98b6d34913985fa4537e00aaf9'}
def pinmap(lane): return PINS[lane]
cand={}
for line in open(LANE+'/.ufo/waves/round-34/baseline/c1-candidates.tsv',encoding='utf-8'):
    parts=line.rstrip('\n').split('\t')
    if len(parts)>=4: cand[parts[0]]=(parts[1],parts[3])
seen=set()
for i,l in enumerate(rows[1:],2):
    f=l.split('\t')
    if len(f)!=5: print('BADCOL',i,len(f)); continue
    ref,reason,surface,quote,note=f
    lane=ref.split('-shokunin@')[0]
    if lane not in target: continue
    seen.add(ref)
    m=re.match(r'^([a-z-]+-shokunin)@([0-9a-f]{40}):(.+):(\d+)$',ref)
    ok_key=ref in cand
    pin,path,ln=m.group(2),m.group(3),int(m.group(4))
    txt=subprocess.run(['git','-C','/home/vgpnk/Projects/shokunin/'+m.group(1),'show',f'{pin}:{path}'],capture_output=True,text=True).stdout.split('\n')
    line=txt[ln-1].rstrip('\r')
    w=quote.split(); nsp=len(re.sub(r'\s','',quote))
    print(f'--- {ref}')
    print(f'  in-candidates={ok_key} pin-eq-frozen={pin==PINS[lane]} reason={reason} surface={surface}')
    print(f'  quote_substr={quote in line} words={len(w)} nonspace={nsp} quote_ok={4<=len(w)<=25 and nsp>=20}')
    if ok_key:
        setl,ctext=cand[ref]
        print(f'  set={setl} candidate_text_matches_line_trimmed={ctext==line.strip()}')
    print(f'  LINE={line[:220]}')
print('screened_keys_in_scope',len(seen))
