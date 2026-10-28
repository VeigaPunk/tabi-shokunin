#!/usr/bin/env bash
# C1 reachability attack runner. Every attack uses only: scratch copies of the
# generated artifacts, the frozen counter, the frozen claims pins, ordinary
# userland. No Firefox, no Playwright, no driver invocation, no lane writes.
set -u
ROOT=/home/vgpnk/Projects/shokunin/tabi-shokunin
S="$(cd "$(dirname "$0")" && pwd)"
C="$ROOT/.ufo/waves/round-41/counters/c1-session-bound-v4.mjs"
P="$ROOT/.ufo/waves/round-41/claims.json"
M="$ROOT/scripts/measure-c1-round41.mjs"
cd "$ROOT" || exit 1
: > "$S/matrix.txt"

verdict() { # $1 = json file
  node -e '
    const fs=require("fs");
    try{const j=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
      console.log("predicate="+(j.predicate===undefined?"-":j.predicate)+" findings="+JSON.stringify(j.findings||j.finding||null)+" receiptSha256="+(j.receiptSha256||"-"));
    }catch(e){console.log("non-json-output")}
  ' "$1"
}

# ---------------- vector (a): forged receipt + witness, counter only --------
node "$S/gen-a1.mjs" "$S" > "$S/gen-a1.out" 2>&1
node "$S/gen-a2.mjs" "$S" > "$S/gen-a2.out" 2>&1
N1=$(cat "$S/a1-nonce.txt"); N1B=$(cat "$S/a1b-nonce.txt"); N1C=$(cat "$S/a1c-nonce.txt"); N2=$(cat "$S/a2-nonce.txt")

node "$C" "$S/a1-receipt.json"  --nonce "$N1"  --witness "$S/a1-witness.json"  --pins "$P" > "$S/a1.out" 2> "$S/a1.err";  echo "a1-r41-relabel          EXIT=$? $(verdict "$S/a1.out")"     >> "$S/matrix.txt"
node "$C" "$S/a1b-receipt.json" --nonce "$N1B" --witness "$S/a1b-witness.json" --pins "$P" > "$S/a1b.out" 2> "$S/a1b.err"; echo "a1b-r42-relabel        EXIT=$? $(verdict "$S/a1b.out")"    >> "$S/matrix.txt"
node "$C" "$ROOT/corpus/evidence/round42/playwright-egress/receipt.json" --nonce "$N1C" --witness "$ROOT/corpus/evidence/round42/playwright-egress/receipt.witness.json" --pins "$P" > "$S/a1c.out" 2> "$S/a1c.err"; echo "a1c-nonce-from-receipt EXIT=$? $(verdict "$S/a1c.out")" >> "$S/matrix.txt"
node "$C" "$S/a2-receipt.json"  --nonce "$N2"  --witness "$S/a2-witness.json"  --pins "$P" > "$S/a2.out" 2> "$S/a2.err";  echo "a2-synthetic-no-pins?   EXIT=$? $(verdict "$S/a2.out")"     >> "$S/matrix.txt"
node "$C" "$S/a2-receipt.json"  --nonce "$N2"  --witness "$S/a2-witness.json"  > "$S/a7.out" 2> "$S/a7.err";             echo "a7-synthetic-no-pins    EXIT=$? $(verdict "$S/a7.out")"      >> "$S/matrix.txt"
printf '%s' '{"elapsedMs":999999,"gate":{"self":{"forbiddenNames":[],"execArgvClean":true},"child":{"ok":true}}}' | node "$C" "$S/a2-receipt.json" --nonce "$N2" --witness "$S/a2-witness.json" --pins "$P" --measure - > "$S/a3.out" 2> "$S/a3.err"; echo "a3-measure-stdin        EXIT=$? $(verdict "$S/a3.out")"    >> "$S/matrix.txt"

# ---------------- vector (d): crafted / malformed --measure ----------------
printf '%s' '{"elapsedMs":10,"gate":{"self":{"forbiddenNames":[],"execArgvClean":true},"child":{"ok":true}}}' | node "$C" "$S/a2-receipt.json" --nonce "$N2" --witness "$S/a2-witness.json" --measure - > "$S/a4.out" 2> "$S/a4.err"; echo "a4-measure-too-short    EXIT=$? $(verdict "$S/a4.out")"    >> "$S/matrix.txt"
printf 'not-json' | node "$C" "$S/a2-receipt.json" --nonce "$N2" --witness "$S/a2-witness.json" --measure - > "$S/a4b.out" 2> "$S/a4b.err"; echo "a4b-measure-garbage     EXIT=$? $(cat "$S/a4b.err" | tr '\n' ' ')" >> "$S/matrix.txt"
node "$C" "$S/a2-receipt.json" --nonce "$N2" --witness "$S/a2-witness.json" --measure "$S/no-such.json" > "$S/a4c.out" 2> "$S/a4c.err"; echo "a4c-measure-missing     EXIT=$? $(cat "$S/a4c.err" | tr '\n' ' ')" >> "$S/matrix.txt"

# ---------------- counter boundary controls (negative) ----------------------
node "$C" "$S/a2-receipt.json" --nonce "$N2" --pins "$P" > "$S/a5.out" 2> "$S/a5.err"; echo "a5-no-witness           EXIT=$? $(verdict "$S/a5.out")" >> "$S/matrix.txt"
Z=$(printf '0%.0s' $(seq 1 64))
node "$C" "$S/a2-receipt.json" --nonce "$Z" --witness "$S/a2-witness.json" --pins "$P" > "$S/a6.out" 2> "$S/a6.err"; echo "a6-wrong-nonce          EXIT=$? $(verdict "$S/a6.out")" >> "$S/matrix.txt"
node "$C" "$S/a2-receipt.json" --nonce "$N2" --witness "$S/none.json" --pins "$P" > "$S/a8.out" 2> "$S/a8.err"; echo "a8-witness-missing-file EXIT=$? $(verdict "$S/a8.out")" >> "$S/matrix.txt"

# ---------------- vector (b): environment vectors --------------------------
NODE_OPTIONS="--require $ROOT/.ufo/waves/round-41/fixtures/forger-round41.cjs" node "$M" --battery-probe > "$S/b1.out" 2>&1; echo "b1-NODE_OPTIONS-battery EXIT=$?" >> "$S/matrix.txt"
for v in NODE_V8_COVERAGE OPENSSL_CONF GCONV_PATH NLSPATH NODE_REPL_EXTERNAL_MODULE LOCPATH; do
  case $v in
    NODE_V8_COVERAGE) val="$S/cov";; OPENSSL_CONF) val="$S/openssl.cnf";; GCONV_PATH) val="$S/gconv";;
    NLSPATH) val="$S/nlspath";; NODE_REPL_EXTERNAL_MODULE) val="$S/repl.cjs";; LOCPATH) val="$S/loc";;
  esac
  env "$v=$val" node "$M" --battery-probe > "$S/b2-$v.out" 2>&1
  ec=$?
  cont=$(node -e 'const fs=require("fs");try{console.log(JSON.parse(fs.readFileSync(process.argv[1],"utf8")).contaminated)}catch{console.log("unparseable")}' "$S/b2-$v.out")
  echo "b2-$v EXIT=$ec contaminated=$cont" >> "$S/matrix.txt"
done
rm -f "$S/canary.txt" "$S/canary-ss.txt" "$S/canary-ps.txt" "$S/witness-ps-canary.txt"
PATH="$S/shim:$PATH" node "$M" --battery-probe > "$S/b3.out" 2>&1
echo "b3-getconf-shim EXIT=$? canary=$(cat "$S/canary.txt" 2>/dev/null || echo MISSING)" >> "$S/matrix.txt"
PATH="$S/shim:$PATH" node -e 'const {spawnSync}=require("node:child_process");const a=spawnSync("ss",["-Htnp"],{encoding:"utf8"});const b=spawnSync("ps",["-eo","pid=,ppid="],{encoding:"utf8"});console.log(JSON.stringify({ssStatus:a.status,ssOut:a.stdout.trim(),psStatus:b.status,psOut:b.stdout.trim()}))' > "$S/b3b.json" 2>&1
echo "b3b-ss-ps-shim EXIT=$? canary-ss=$(cat "$S/canary-ss.txt" 2>/dev/null || echo MISSING) canary-ps=$(cat "$S/canary-ps.txt" 2>/dev/null || echo MISSING)" >> "$S/matrix.txt"
PATH="$S/wshim:$PATH" TABI_WITNESS_OUT="$S/witness-out.json" TABI_WITNESS_ROOT=999999 TABI_RUN_NONCE="$N1" node "$S/witness-extracted.cjs" & WP=$!
sleep 0.5; kill -TERM $WP 2>/dev/null; wait $WP 2>/dev/null
echo "b4-witness-ps-shim canary=$(head -1 "$S/witness-ps-canary.txt" 2>/dev/null || echo MISSING) tree0=$(node -e 'const fs=require("fs");const j=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));console.log(JSON.stringify(j.samples[0].tree))' "$S/witness-out.json")" >> "$S/matrix.txt"

# ---------------- vector (c): --out path race / rename ---------------------
mkdir -p "$S/c"
echo '{}' > "$S/c/exists.json"
node "$M" --out "$S/c/exists.json" --scratch "$S/c/scratch" > "$S/c1.out" 2> "$S/c1.err"; echo "c1-out-exists EXIT=$? $(cat "$S/c1.out" "$S/c1.err" | tr '\n' ' ')" >> "$S/matrix.txt"
ln -sfn "$S/c/does-not-exist.json" "$S/c/dangling.json"
NODE_OPTIONS="--require $ROOT/.ufo/waves/round-41/fixtures/forger-round41.cjs" node "$M" --out "$S/c/dangling.json" --scratch "$S/c/scratch" > "$S/c2.out" 2> "$S/c2.err"; echo "c2-dangling-symlink-past-freshness-guard EXIT=$? finding=$(node -e 'const fs=require("fs");console.log(JSON.parse(fs.readFileSync(process.argv[1],"utf8")).finding)' "$S/c2.out") measure=$(ls "$S/c" | grep -c 'dangling.measure.json')" >> "$S/matrix.txt"
NODE_OPTIONS="--require $ROOT/.ufo/waves/round-41/fixtures/forger-round41.cjs" node "$M" --out "$S/c/plainreceipt" --scratch "$S/c/scratch" > "$S/c3.out" 2> "$S/c3.err"; echo "c3-out-without-.json-creates-outpath EXIT=$? outpath_exists=$([ -f "$S/c/plainreceipt" ] && echo yes || echo no) bytes=$(stat -c%s "$S/c/plainreceipt" 2>/dev/null || echo -)" >> "$S/matrix.txt"
node -e 'const fs=require("fs");const p=process.argv[1];try{fs.writeFileSync(p,"x",{flag:"wx"});console.log("WROTE-symlink-followed")}catch(e){console.log("REFUSED:"+e.code)}' "$S/c/dangling.json" > "$S/c4.out" 2>&1; echo "c4-driver-wx-on-dangling-symlink $(cat "$S/c4.out")" >> "$S/matrix.txt"
ln -sfn "$S/a2-receipt.json" "$S/c/link-receipt.json"
node "$C" "$S/c/link-receipt.json" --nonce "$N2" --witness "$S/a2-witness.json" > "$S/c5.out" 2>&1; echo "c5-counter-symlinked-receipt EXIT=$? $(verdict "$S/c5.out")" >> "$S/matrix.txt"
timeout 10 node "$C" /dev/stdin --nonce "$N2" --witness "$S/a2-witness.json" < "$S/a2-receipt.json" > "$S/c6.out" 2>&1; echo "c6-counter-receipt-stdin EXIT=$? $(verdict "$S/c6.out")" >> "$S/matrix.txt"

echo "--- matrix ---"; cat "$S/matrix.txt"
