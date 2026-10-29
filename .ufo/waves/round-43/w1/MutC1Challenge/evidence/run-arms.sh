#!/usr/bin/env bash
# MutC1Challenge — arm runner.
#
# Every arm runs the counter DIRECTLY (never through the wrapper): the
# in-invocation challenge channel is either absent (no fds at all) or answered
# by a synthetic self-signed key (answered arms).
#
# The counter under test is executed inside a bwrap sandbox whose ROOT
# (/home/vgpnk/Projects/shokunin/tabi-shokunin) is a SCRATCH SHADOW tree.
# The lane tree is only ever read.
set -u
S=/fast/scratch/hyaku/tabi-r43/MutC1Challenge
L=/home/vgpnk/Projects/shokunin/tabi-shokunin
NODE=/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node
COUNTER_ABS="$L/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs"
OUT="$S/out"
mkdir -p "$OUT"

# run_arm <id> <shadow> <receipt> <measure> <mode>
#   mode = nofd    : fd3/fd4 closed -> no challenge channel at all
#   mode = answered: fd3/fd4 pipes, challenge signed by the synthetic key
run_arm() {
  local arm="$1" shadow="$2" receipt="$3" measure="$4" mode="$5"
  local base="$OUT/$arm"
  rm -rf "$base"; mkdir -p "$base"
  local inner
  if [ "$mode" = "nofd" ]; then
    inner="exec 3>&- 4>&-; exec '$NODE' '$COUNTER_ABS' '$receipt' --measure '$measure'"
  else
    inner="exec '$NODE' '$S/driver-answered.mjs' '$COUNTER_ABS' '$receipt' --measure '$measure' '$S/in/synth-wrapper-private.pem'"
  fi
  set +e
  bwrap --ro-bind / / --dev /dev --proc /proc \
        --bind "$shadow" "$L" \
        --chdir "$S" \
        /bin/bash -c "$inner" \
        > "$base/stdout.json" 2> "$base/stderr.txt"
  local rc=$?
  set -e
  printf '%s\n' "$rc" > "$base/exit"
  if [ -s "$base/stdout.json" ]; then
    "$NODE" -e '
      const fs=require("fs");
      const raw=fs.readFileSync(process.argv[1],"utf8");
      let o; try{o=JSON.parse(raw);}catch(e){console.log(JSON.stringify({exit:process.argv[2],unparseable:raw.slice(0,400)}));process.exit(0);}
      console.log(JSON.stringify({exit:process.argv[2],predicate:o.predicate,challengeVerified:o.challengeVerified,challengeError:o.challengeError,measureSignatureVerified:o.measureSignatureVerified,witnessAttestationVerified:o.witnessAttestationVerified,findings:o.findings,egressDetail:o.egressDetail}));
    ' "$base/stdout.json" "$rc" > "$base/verdict.json"
  else
    "$NODE" -e 'console.log(JSON.stringify({exit:process.argv[1],stdout:"<empty>",stderr:require("fs").readFileSync(process.argv[2],"utf8").slice(0,400)}))' "$rc" "$base/stderr.txt" > "$base/verdict.json"
  fi
  echo "=== $arm  shadow=$(basename "$shadow")  mode=$mode"
  cat "$base/verdict.json"
}

summarize() {
  "$NODE" -e '
    const fs=require("fs"),path=require("path");
    const out=process.argv[1];
    const rows=[];
    for(const d of fs.readdirSync(out).sort()){
      const v=path.join(out,d,"verdict.json");
      if(!fs.existsSync(v))continue;
      const j=JSON.parse(fs.readFileSync(v,"utf8"));
      rows.push({arm:d,exit:j.exit,predicate:j.predicate,challengeVerified:j.challengeVerified,challengeError:j.challengeError,measureSignatureVerified:j.measureSignatureVerified,witnessAttestationVerified:j.witnessAttestationVerified,findings:j.findings||null});
    }
    fs.writeFileSync(path.join(out,"matrix.json"),JSON.stringify(rows,null,1)+"\n");
    console.log(JSON.stringify(rows,null,1));
  ' "$OUT"
}

# mode = garbage: fd3/fd4 pipes, challenge answered with a well-formed but WRONG signature
run_arm_garbage() {
  local arm="$1" shadow="$2" receipt="$3" measure="$4"
  local base="$OUT/$arm"
  rm -rf "$base"; mkdir -p "$base"
  set +e
  bwrap --ro-bind / / --dev /dev --proc /proc \
        --bind "$shadow" "$L" --chdir "$S" \
        /bin/bash -c "exec '$NODE' '$S/driver-garbage.mjs' '$COUNTER_ABS' '$receipt' --measure '$measure'" \
        > "$base/stdout.json" 2> "$base/stderr.txt"
  local rc=$?
  set -e
  printf '%s\n' "$rc" > "$base/exit"
  "$NODE" -e '
    const fs=require("fs");
    const raw=fs.readFileSync(process.argv[1],"utf8");
    let o; try{o=JSON.parse(raw);}catch(e){console.log(JSON.stringify({exit:process.argv[2],unparseable:raw.slice(0,300)}));process.exit(0);}
    console.log(JSON.stringify({exit:process.argv[2],predicate:o.predicate,challengeVerified:o.challengeVerified,challengeError:o.challengeError,measureSignatureVerified:o.measureSignatureVerified,witnessAttestationVerified:o.witnessAttestationVerified,findings:o.findings}));
  ' "$base/stdout.json" "$rc" > "$base/verdict.json"
  echo "=== $arm  shadow=$(basename "$shadow")  mode=garbage"
  cat "$base/verdict.json"
}
