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
screens={}
for l in screens_raw.splitlines()[1:]:
    if not l.strip(): continue
    f=l.split('\t'); screens[f[0]]=(f[1], f[2] if len(f)>2 else '')
terms = re.compile(r'\b(?:login|log-in|session|cookie|gotcha|gotchas|crawl rate|rate limit|rate-limiting|robots\.txt|screenshot|screen[- ]shot|dom\b|dom capture|dom/screenshot)\b', re.I)
print('candidates touching login/session/cookie/gotcha/rate/robots/screenshot/DOM:')
for k,t in cands.items():
    if terms.search(t):
        print(' -', k)
        print('   ', t[:160])
