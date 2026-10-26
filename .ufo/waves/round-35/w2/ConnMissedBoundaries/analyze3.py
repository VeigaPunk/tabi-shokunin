import re, subprocess
REV='083c5c643be7aa5965a5de3458a32ed0d289ead3'
LANE='/fast/scratch/hyaku/tabi-r35/ConnMissedBoundaries/clone'
def git(*a): return subprocess.run(['git','-C',LANE,*a],capture_output=True,text=True).stdout
cands_raw = git('show', f'{REV}:.ufo/waves/round-35/baseline/c1-candidates.tsv')
screens_raw = git('show', f'{REV}:corpus/adjacency-screen-browser.tsv')
cands={}
for l in cands_raw.splitlines():
    if not l: continue
    f=l.split('\t'); cands[f[0]]=f[1] if len(f)>1 else ''
screens=[]
for l in screens_raw.splitlines()[1:]:
    if not l.strip(): continue
    f=l.split('\t')
    screens.append({'ref':f[0],'reason':f[1],'surface':f[2] if len(f)>2 else '','quote':f[3] if len(f)>3 else ''})
def words(s): return [w for w in re.split(r'\s+', s.strip()) if w]
bad=[]
for s in screens:
    t=cands[s['ref']]
    q=s['quote']
    w=words(q)
    whole_ok = q == t.strip() and len(words(t))<=25
    form_ok = 4<=len(w)<=25 and len(q.replace(' ',''))>=20
    if not (whole_ok or form_ok): bad.append((s['ref'],len(w),q[:70]))
print('screens violating the counter quote-shape rule (both forms):', len(bad))
for b in bad: print('  ', b)
