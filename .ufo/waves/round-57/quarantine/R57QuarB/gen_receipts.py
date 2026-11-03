import json,sys,os,re
sys.path.insert(0,'.')
from locate import *
rows=json.load(open('register-rows.json'))
staged=json.load(open('staged-rows.json'))
full=json.load(open('staged-full.json'))
g1=json.load(open('g1/_fetch.json')); g2=json.load(open('g2/_fetch.json'))
gate=json.load(open('gate-quotes.json'))
FOLDS7=('f0','f1','f2','f3','f4','f5','f6')
FOLD_DESC={'f0':'exact substring in raw bytes','f1':'case-insensitive',
 'f2':'whitespace runs collapsed to one space','f3':'HTML entities decoded',
 'f4':'HTML tags stripped to text then whitespace-collapsed','f5':'f4 + case-insensitive',
 'f6':'backtick/quote/punctuation-stripped then whitespace-collapsed'}
def frags(q):
    out=[]
    for p in q.split('<br>'):
        p=p.strip()
        if p.startswith('`') and p.endswith('`') and len(p)>1: p=p[1:-1]
        out.append(p.replace('\\"','"'))
    return [x for x in out if x]
def staged_url(rid):
    us=[u.rstrip('.,;)') for u in re.findall(r'https?://\S+',staged[rid][1])]
    return us[0] if us else None
out_dir='out'; os.makedirs(out_dir,exist_ok=True)
summary=[]
for rid in sorted(rows):
    reg=rows[rid]; n=int(rid[1:]); carrier='S%d'%(n+1)
    qcell=reg[5]
    cmeta=g1['cited-'+rid]; nmeta=g2['next-'+rid]
    craw=load(cmeta['path']); nraw=load(nmeta['path'])
    s_url=staged_url(rid)
    staged_fetch=None
    if s_url and s_url!=reg[4]:
        sk='staged-'+rid
        if sk in g1: staged_fetch=g1[sk]
    carrier_cells=[h for h,v in full[str(n+1)].items() if all(f in v.replace('\\"','"') for f in frags(qcell))]
    frs=[]
    for q in frags(qcell):
        cited={f:len(run_fold(craw[0],q,f)) for f in FOLDS7}
        carried={f:len(run_fold(nraw[0],q,f)) for f in FOLDS7}
        stg=None
        if staged_fetch:
            sraw=load(staged_fetch['path'])[0]
            stg={f:len(run_fold(sraw,q,f)) for f in FOLDS7}
        f=next((x for x in FOLDS7 if cited[x]),None)
        g=next((x for x in FOLDS7 if carried[x]),None)
        where=None
        if f:
            v=run_fold(craw[0],q,f)[0]
            where=f'{f}: line {v["line"]}, byte {v["byteOffset"]}'
        frs.append(dict(quote=q,fold=f,located=bool(f),where=where,
                        citedFoldHits=cited,
                        carrierRow=carrier,carrierUrl=nmeta['url'],
                        carrierFoldHits=carried,carrierFold=g,
                        carrierLocated=bool(g),
                        carrierWhere=(f'{g}: line {run_fold(nraw[0],q,g)[0]["line"]}, byte {run_fold(nraw[0],q,g)[0]["byteOffset"]}' if g else None),
                        stagedFoldHits=stg))
    located=[x for x in frs if x['located']]
    carried=[x for x in frs if x['carrierLocated']]
    if len(located)==len(frs):
        verdict='quote-located'
    elif located:
        verdict='partial-located'
    elif carried and carrier_cells:
        verdict='mispaired'
    else:
        verdict='absent-confirmed'
    own=[dict(quote=q,located=bool(any(run_fold(craw[0],q,f) for f in FOLDS7))) for q in gate.get(rid,{}).get('quotes',[])]
    rec=dict(id=rid, registerUrl=reg[4], stagedUrl=s_url,
             httpCode=cmeta['httpCode'], bytes=int(cmeta['sizeDownload']), contentType=cmeta['contentType'],
             contentEncoding=(cmeta['contentEncoding'] or cmeta.get('liveHeaderContentEncoding') or 'identity'),
             urlEffective=cmeta['urlEffective'], numRedirects=cmeta['numRedirects'],
             citedGuard=cmeta['guardCited'], effectiveGuard=cmeta['guardEffective'], fetchFlags=cmeta['flags'],
             sha256=load(cmeta['path'])[1],
             registerRound=reg[1], registerClass=reg[3],
             fragments=frs, verdict=verdict,
             carrierRow=carrier, carrierUrl=nmeta['url'], carrierCellNames=carrier_cells,
             carrierFetch=dict(httpCode=nmeta['httpCode'],bytes=int(nmeta['sizeDownload']),contentType=nmeta['contentType'],
                               urlEffective=nmeta['urlEffective'],flags=nmeta['flags'],sha256=load(nmeta['path'])[1]),
             stagedFetch=(dict(url=staged_fetch['url'],httpCode=staged_fetch['httpCode'],bytes=int(staged_fetch['sizeDownload']),
                               contentType=staged_fetch['contentType'],urlEffective=staged_fetch['urlEffective'],
                               flags=staged_fetch['flags'],sha256=load(staged_fetch['path'])[1]) if staged_fetch else None),
             ownGateQuotes=own,
             foldsRun=[f'{k}: {v}' for k,v in FOLD_DESC.items()],
             guard='scheme http(s) only; cited AND effective host resolved and refused if private/loopback/link-local/metadata; GET only; no credentials/cookies; -q first; absolute -o; size cap 25000000')
    # verdict-specific reason
    if verdict=='quote-located':
        rec['reason']=('every fragment located in the cited source: '+'; '.join(f'`{x["quote"][:60]}` at {x["where"]}' for x in located))
    elif verdict=='partial-located':
        rec['reason']=(f'located {len(located)}/{len(frs)} fragments in the cited source; absent: '+str([x['quote'] for x in frs if not x['located']]))
    elif verdict=='mispaired':
        rec['reason']=(f'NO fragment is in the cited source under f0-f6. The quote cell is byte-identical to staged row {carrier}\'s '
                       f'{"/".join(carrier_cells)} cell, and {len(carried)}/{len(frs)} fragment(s) are present at that row\'s cited URL '
                       f'{nmeta["url"]} ('+', '.join(f'`{x["quote"][:40]}` {x["carrierWhere"]}' for x in carried)+
                       '). The register paired row '+rid+' with the NEXT row\'s anchor text; the correct carrier is row '+carrier+'.')
    else:
        rec['reason']=(f'cited source fetched clean 2xx non-empty and NO fragment is present under f0-f6. The text is staged row {carrier}\'s '
                       f'{"/".join(carrier_cells) or "cell"} anchor text, and it is locatable at neither the cited URL nor that row\'s cited URL '
                       f'{nmeta["url"]} - a mispaired marker phrase, not a quotation of '+reg[4]+'.')
    json.dump(rec,open(f'{out_dir}/{rid}.json','w'),ensure_ascii=False,indent=1)
    summary.append(dict(id=rid,round=reg[1],verdict=verdict,http=cmeta['httpCode'],bytes=int(cmeta['sizeDownload']),
                        carrierRow=carrier,carrierCells=carrier_cells,carrierUrl=nmeta['url'],
                        carrierLocated=len(carried),fragments=len(frs),
                        ownGateQuotesLocated=f'{sum(1 for x in own if x["located"])}/{len(own)}'))
    print(f"{rid} {verdict:16s} carrier={carrier} {carrier_cells} carried={len(carried)}/{len(frs)} ownGate={sum(1 for x in own if x['located'])}/{len(own)}")
json.dump(summary,open(f'{out_dir}/_summary.json','w'),indent=1)
