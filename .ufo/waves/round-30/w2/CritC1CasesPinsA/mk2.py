import json, os, subprocess, pathlib
S="/fast/scratch/hyaku/tabi-r30/CritC1CasesPinsA"
src=pathlib.Path(S,"clone/scripts/check-release-pins.mjs").read_text()
CATCH_OLD='''      } catch (e) {
        if (!(e instanceof Refusal)) throw e;
        exit = 2;
        out = { unresolved: null, refusal: e.message };
      }'''
CATCH_NEW='''      } catch (e) {
        exit = e instanceof Refusal ? 2 : -1;
        out = { unresolved: null, refusal: e.message, crash: !(e instanceof Refusal) };
      }'''
V={
 "bind_other_reason":[('if (!inSource && !inAnchor) reasons.push(`f2-path-bound ${label}`);',
                       'if (!inSource && !inAnchor) reasons.push(`f1-old-tag ${label}`);')],
 "f3_false_harness_catch":[('if (ob === null || nb === null)', 'if (false)'),(CATCH_OLD,CATCH_NEW)],
 "harness_catch_only":[ (CATCH_OLD,CATCH_NEW) ],
}
out={}
for n,edits in V.items():
    t=src
    for f,r in edits:
        assert t.count(f)==1,(n,f)
        t=t.replace(f,r)
    p=pathlib.Path(S,"vars",n+".mjs"); p.write_text(t)
    r=subprocess.run(["node",str(p),"--selftest","--json"],capture_output=True,text=True,env={**os.environ,"TMPDIR":os.path.join(S,"tmp")})
    rep=None
    try: rep=json.loads(r.stdout)
    except Exception: pass
    out[n]={"exit":r.returncode,"cases":rep and rep["cases"],"passed":rep and rep["passed"],
            "failing":[x["id"] for x in rep["results"] if not x["ok"]] if rep else None,
            "failing_detail":{x["id"]:{"exit":x["exit"],"reasons":x["reasons"],"refusal":x["refusal"]} for x in rep["results"] if not x["ok"]} if rep else None,
            "stderr":r.stderr.splitlines()[:1]}
print(json.dumps(out,indent=1))
