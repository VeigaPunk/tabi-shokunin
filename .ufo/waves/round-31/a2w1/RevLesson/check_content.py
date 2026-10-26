import subprocess, hashlib, os, json, re
C="/fast/scratch/hyaku/tabi-r31/RevLesson/clone"
W="/home/vgpnk/Projects/shokunin/tabi-shokunin"
def line(p, n, root=C):
    f=open(os.path.join(root,p),errors='replace').read().split('\n')
    return f[n-1] if n-1<len(f) else "<EOF>"
def gitspec(rev, p):
    return subprocess.run(["git","-C",C,"show",f"{rev}:{p}"],capture_output=True,text=True).stdout
R=[]
def chk(name, cond, detail=""):
    R.append((name,"OK" if cond else "FAIL",detail))
def has(s, *subs): return all(x in s for x in subs)

# 1 counter anchors
sa=line("scripts/check-selfassessment.mjs",172)+ "".join(line("scripts/check-selfassessment.mjs",n) for n in range(173,180))
chk("selfassess:172-179 SELFTEST anchor+last", has(sa,"_SELFTEST","cases"))
chk("selfassess:685 reg case", has("".join(line("scripts/check-selfassessment.mjs",n) for n in range(685,694)),"v2-oracle-reads-summary-line-not-first-cases-token"))
chk("selfassess:286-320 lineOnly", has("".join(line("scripts/check-selfassessment.mjs",n) for n in range(286,321)),"lineOnly"))
chk("selfassess:422-425 SKILL/README windows", has("".join(line("scripts/check-selfassessment.mjs",n) for n in range(422,426)),"SKILL.md","corpus/README.md"))
chk("selfassess:122-127 tally \\bcases", has("".join(line("scripts/check-selfassessment.mjs",n) for n in range(122,128)),r"\bcases"))
chk("selfassess:167 env forward", has(line("scripts/check-selfassessment.mjs",167),"process.env"))
gm=line("scripts/check-gate-mutants.mjs",142)+line("scripts/check-gate-mutants.mjs",143)
chk("gate-mutants:142/143 run dir", has(gm,"runId") or has(gm,"join(work"))
chk("gate-mutants:152 env spread", has(line("scripts/check-gate-mutants.mjs",152),"process.env"))
fa=line("scripts/check-frontier-admission.mjs",174)+line("scripts/check-frontier-admission.mjs",175)
chk("frontier-adm:174-175 file:// + curl", has(fa,"file://","curl"))
dt="".join(line("scripts/check-decision-table.mjs",n) for n in range(194,214))
chk("decision-table:194-213 hermetic curl", has(dt,"--proto","curl"))
chk("decision-table:360 live-offhost-redirect", has(line("scripts/check-decision-table.mjs",360),"live-offhost-redirect"))
# 2 lessons/measure
chk("r30.md:344 exists", "S" in line("corpus/lessons/round-30.md",344))
chk("r30.md:297 exists", "S" in line("corpus/lessons/round-30.md",297))
chk("spotcheck:147 routes 1523", has(line("corpus/lessons/round-30-verifier-spotcheck.md",147),"1523"))
chk("spotcheck:148 defect 2", has(line("corpus/lessons/round-30-verifier-spotcheck.md",148),"m1") or "12" in line("corpus/lessons/round-30-verifier-spotcheck.md",148))
n1=line(".ufo/waves/round-30/measure/noharm-at-d3cd62a.txt",1,root=W)
chk("noharm-d3cd62a:1 mismatch1/1527/12v2", has(n1,'"mismatches":1','1527','12'))
n2=line(".ufo/waves/round-30/measure/noharm-at-0ffc6ea.txt",130,root=W)
chk("noharm-0ffc6ea:130 mismatches=3", has(n2,'mismatches=3') or has(n2,'"mismatches":3') or '3' in n2)
# 3 scorecard/skill/readme at REV
chk("SCORECARD:1523 stale sentence", has(line("SCORECARD.md",1523),"mismatches 0"))
chk("SCORECARD:1527 12/12 area", '12' in line("SCORECARD.md",1527))
chk("SCORECARD:1192 sources 26", '26' in line("SCORECARD.md",1192))
old=gitspec("96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc","SCORECARD.md").split('\n')
chk("96a2d1a3 SCORECARD:1192 sources 26", '26' in old[1191])
chk("96a2d1a3 SCORECARD:1465 selfassess 22", '22' in old[1464])
for ln,tag in [(1614,'sources'),(2479,'13'),(2514,'5'),(2515,'17'),(2529,'7'),(2530,'20'),(2543,'20'),(2544,'7')]:
    chk(f"SKILL:{ln} stale tally present", line("SKILL.md",ln)!="<EOF>", line("SKILL.md",ln)[:90])
chk("SKILL:2474 cli_cases=36", has(line("SKILL.md",2474),"cli_cases=36"))
chk("SKILL:693-695 rights/rate", has("".join(line("SKILL.md",n) for n in range(693,696)),"Rights") or "rate" in "".join(line("SKILL.md",n) for n in range(693,696)).lower())
chk("README:613 stale 17", line("corpus/README.md",613)!="<EOF>")
chk("README:37 C2–C6", has(line("corpus/README.md",37),"C2–C6"))
chk("README:644 C3 and C6", has(line("corpus/README.md",644),"C3 and C6"))
chk("README:182 canonical label", has(line("corpus/README.md",182),"Rate/ToS"))
rr=[n for n in (216,282,283,284,285,302,303,304,305,331,332) if "rate/rights real-site records" in line("corpus/README.md",n)]
chk("README:216/282-285/302-305/331-332 label", len(rr)>=8, f"hits={rr}")
chk("PROVINCE:10 label", has(line("PROVINCE.md",10),"rate/rights real-site records"))
chk("aria:2983-2986 cli_cases=36", has("".join(line("scripts/check-aria-metadata.mjs",n) for n in range(2983,2987)),"cli_cases"))
chk("aria:2320 blocked cli_cases=0", has(line("scripts/check-aria-metadata.mjs",2320),"cli_cases=0") or "blocked" in line("scripts/check-aria-metadata.mjs",2320))
chk("PolicyBoundaries:27 exists", line(".ufo/waves/round-14/w1/PolicyBoundaries.md",27,root=W)!="<EOF>")
# 4 baseline receipts
B=os.path.join(W,".ufo/waves/round-31/baseline")
rrm=open(os.path.join(B,"README-receipts.md")).read()
chk("README-receipts m8 28/30", "28/30" in rrm)
oos=open(os.path.join(B,"m8-proof/old-oracle-selftest.txt")).read()
chk("old-oracle-selftest 29/28 exit3", has(oos,"cases=29","passed=28") and ("exit=3" in oos or "exit 3" in oos))
h=hashlib.sha256(open(os.path.join(B,"m8-proof/old-oracle.mjs"),'rb').read()).hexdigest()
chk("old-oracle.mjs sha256", h=="bfc9682b692339acfd1647bbddca7a1569c1410968aa742ad2ae8e5ed3962855", h)
c1=open(os.path.join(B,"c1-counter-selftest.txt")).read()
chk("c1 selftest 34/34", has(c1,"cases=34","passed=34"))
c2=json.load(open(os.path.join(B,"c2-J1-do-nothing.json")))
chk("c2-J1 mismatches 9", c2.get("mismatches")==9, str(c2.get("mismatches")))
chk("c2-J1.exit=1", has(open(os.path.join(B,"c2-J1-do-nothing.json.exit")).read(),"exit=1"))
chk("c2-T0 names befe2a3f", "befe2a3f" in open(os.path.join(B,"c2-T0-reading.json")).read())
cs=open(os.path.join(B,"controls.sh")).read()
chk("controls.sh fresh()/commit", has(cs,"fresh()","commit"))
# 5 w1 attack reports (at lane tip working tree)
A=os.path.join(W,".ufo/waves/round-31/w1")
ax=open(os.path.join(A,"CritC1Axis.md")).read()
chk("CritC1Axis has Q2 + pad-live", has(ax,"Q2","pad-live"))
pl=json.load(open(os.path.join(A,"CritC1Axis/pad-live.json")))
chk("pad-live pop10 adm10 exit0", pl.get("population")==10 and pl.get("admitted")==10 and pl.get("failing")==0, json.dumps({k:pl.get(k) for k in ('population','admitted','failing')}))
cc=open(os.path.join(A,"CritC1Counter.md")).read()
chk("CritC1Counter A1-A6 tokens", all(t in cc for t in ("A1","A6","429","6585")), "")
tsv=open(os.path.join(A,"ExecC2Oracle/oracle.tsv")).read().split('\n')
chk("oracle.tsv row2 cli_cases no-boundary", len(tsv)>2 and ("cli_cases" in tsv[1] or "boundary" in tsv[1]), tsv[1][:120] if len(tsv)>1 else "")
rp=open(os.path.join(W,".ufo/waves/round-27/w1/RevStagedProvenance.md")).read().split('\n')
chk("RevStagedProvenance:405-406 S126 drift", has(rp[404]+rp[405],"S126") or has(rp[404]+rp[405],"Native messaging"))
rf=os.path.join(W,"corpus/evidence/round-30/frontier/refetch")
labels=os.listdir(rf) if os.path.isdir(rf) else []
chk("refetch two labels", len(labels)>=2, str(labels))
# 6 git claims
gg=subprocess.run(["git","-C",C,"grep","-n","1523","9505a10eb80b2a0b273ebaba3f7f872ad302192d","--","SCORECARD.md","LOG.md","SKILL.md","corpus/README.md","corpus/QUALITY.md"],capture_output=True,text=True)
chk("freeze grep 1523 empty,exit1", gg.returncode==1 and gg.stdout=="")
old2=gitspec("96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc","scripts/check-selfassessment.mjs").split('\n')
w402=has(old2[401],"readBlob") and "SCORECARD.md" in old2[401]
w405=has(old2[404],"readBlob") and "LOG.md" in old2[404]
chk("96a2d1a3 readBlob :402 SCORECARD", w402, old2[401][:80])
chk("96a2d1a3 readBlob :405 LOG", w405, old2[404][:80])
sk=[i+1 for i,l in enumerate(old2) if "SKILL.md" in l or "corpus/README.md" in l]
chk("96a2d1a3 only fixture SKILL/README strings 606,617", sk==[606,617], str(sk))
fr=gitspec("9505a10eb80b2a0b273ebaba3f7f872ad302192d","SCORECARD.md").split('\n')
chk("freeze SCORECARD 1439 corr", '22' in fr[1438] or 'correct' in fr[1438].lower(), fr[1438][:100])
chk("freeze SCORECARD 1465 corr", '30' in fr[1464] or 'correct' in fr[1464].lower(), fr[1464][:100])
chk("freeze SCORECARD 1486 corr", '30' in fr[1485] or 'correct' in fr[1485].lower(), fr[1485][:100])
q0=gitspec("9505a10eb80b2a0b273ebaba3f7f872ad302192d","corpus/QUALITY.md").split('\n')
crit=[l for l in q0 if re.match(r'^#+\s*(\d+)[\.\s]',l) or re.match(r'^\|\s*(\d+)\s*\|',l)]
nums=[int(m.group(1)) for l in crit for m in [re.search(r'(\d+)',l)] if m]
chk("freeze QUALITY ends at 79", nums and max(nums)==79, f"max={max(nums) if nums else None}")
qr=open(os.path.join(C,"corpus/QUALITY.md")).read()
chk("REV QUALITY has 80+81", ("80" in qr and "81" in qr) and not qr.rstrip('\n').split('\n')[-1].strip()=="", "")
crit80=re.findall(r'criterion 80|### 80|80[\.\)]', qr)
chk("REV QUALITY criterion 80 present", len(crit80)>0)
# 7 assimilation counts
AS=os.path.join(W,".ufo/waves/round-31/assimilation")
reg=sum(1 for l in open(os.path.join(AS,"reg-ids")) if l.strip())
stg=sum(1 for l in open(os.path.join(AS,"staged-ids")) if l.strip())
col=[l.strip() for l in open(os.path.join(AS,"collisions")) if l.strip()]
chk("reg-ids 118", reg==118, str(reg))
chk("staged-ids 148", stg==148, str(stg))
chk("collisions 17 S102-S118", len(col)==17, str(len(col))+":"+",".join(col[:3])+"…")
print(f"{'OK ':3}/FAIL  check  detail")
f=0
for n,s,d in R:
    if s=="FAIL": f+=1
    print(f"{s:5} {n:42} {d[:110]}")
print("TOTAL FAILS:",f)
