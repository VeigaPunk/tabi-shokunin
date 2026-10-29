#!/usr/bin/env bash
# RevC2Checker fixture battery: r43 checker vs sentence + r42 deltas.
# Runs entirely against a scratch clone ($D); counter copies run from $S.
set -u
S=/fast/scratch/hyaku/tabi-r43/RevC2Checker
D=$S/fixture-repo
BASE=7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc
R43=$S/check-r43-at-freeze.mjs
R42=$S/check-r42-at-freeze.mjs
OUT=$S/cases
rm -rf "$OUT"; mkdir -p "$OUT"

[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || { echo "fixture toplevel mismatch"; exit 99; }

ids() { node -e "const d=require(process.argv[1]);console.log(JSON.stringify(d.findings.map(f=>f.id)))" "$1"; }

run_case() {
  local name=$1
  git -C "$D" checkout -q -B "c/$name" "$BASE"
  "mut_$name"
  git -C "$D" add -A
  git -C "$D" commit -q -m "case $name"
  local rev; rev=$(git -C "$D" rev-parse HEAD)
  local cdir=$OUT/$name; mkdir -p "$cdir"
  echo "$rev" > "$cdir/rev.txt"
  node "$R43" --rev "$rev" --repo "$D" --json > "$cdir/r43.json" 2>"$cdir/r43.stderr"; echo $? > "$cdir/r43.exit"
  node "$R42" --rev "$rev" --repo "$D" --json > "$cdir/r42.json" 2>"$cdir/r42.stderr"; echo $? > "$cdir/r42.exit"
  printf '%-22s r43exit=%s r43=%s r42exit=%s r42=%s\n' "$name" \
    "$(cat $cdir/r43.exit)" "$(ids $cdir/r43.json)" "$(cat $cdir/r42.exit)" "$(ids $cdir/r42.json)"
}

TSV=.ufo/waves/round-42/quarantine/re-adjudication.tsv
SLICE=.ufo/waves/round-42/quarantine/slice-ids.txt
CLAIMS=.ufo/waves/round-43/claims.json
PROBE=.ufo/waves/round-43/controls/c2-v0-probe.json
SOURCES=corpus/SOURCES.md
BASELINE=.ufo/waves/round-41/controls/c1-baseline-noop.out
RECEIPT=corpus/evidence/round41/playwright-egress/receipt.json
WITNESS=corpus/evidence/round41/playwright-egress/receipt.witness.json
MEASURE=.ufo/waves/round-41/measure/c1-measure.json
STAGED=.ufo/waves/round-41/sources/node-cli-v24.21.0.html

mut_fa_tree_evidence() {
  node -e '
    const fs=require("fs");
    const p=process.argv[1];
    const t=fs.readFileSync(p,"utf8").split("\n").map(l=>l.startsWith("S118\t")?"S118\tpresent\t.ufo/waves/round-42/w1/QuarR4201":l).join("\n");
    fs.writeFileSync(p,t);' "$D/$TSV"
}
mut_fb_v0_replacement() {
  node -e '
    const fs=require("fs"),crypto=require("crypto");
    const [d]=process.argv.slice(1);
    const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
    const receipt=Buffer.from(JSON.stringify({schema:"tabi-r41-c1-receipt",fabricated:"V0 self-consistent replacement measure record",runs:[],padding:"x".repeat(1200)}));
    const witness=Buffer.from(JSON.stringify({schema:"tabi-r41-c1-witness",fabricated:true,attestation:"V0",padding:"y".repeat(1200)}));
    fs.writeFileSync(d+"/corpus/evidence/round41/playwright-egress/receipt.json",receipt);
    fs.writeFileSync(d+"/corpus/evidence/round41/playwright-egress/receipt.witness.json",witness);
    const measure={schema:"tabi-r41-c1-measure",receiptSha256:sha(receipt),witnessSha256:sha(witness),note:"V0 fabrication: self-consistent replacement"};
    fs.writeFileSync(d+"/"+process.argv[2],JSON.stringify(measure,null,1));' "$D" "$MEASURE"
}
mut_fc_38row_drop() {
  node -e '
    const fs=require("fs");
    const [tsv,slice]=process.argv.slice(1);
    fs.writeFileSync(tsv,fs.readFileSync(tsv,"utf8").split("\n").filter(l=>!l.startsWith("S117\t")).join("\n"));
    fs.writeFileSync(slice,fs.readFileSync(slice,"utf8").split("\n").filter(l=>l.trim()!=="S117").join("\n"));' "$D/$TSV" "$D/$SLICE"
}
mut_fd_empty_evidence() {
  node -e '
    const fs=require("fs");const p=process.argv[1];
    fs.writeFileSync(p,fs.readFileSync(p,"utf8").split("\n").map(l=>l.startsWith("S118\t")?"S118\tpresent\t":l).join("\n"));' "$D/$TSV"
}
mut_fe_4col_row() {
  node -e '
    const fs=require("fs");const p=process.argv[1];
    fs.writeFileSync(p,fs.readFileSync(p,"utf8").split("\n").map(l=>l.startsWith("S118\t")?l+"\textra-junk-column":l).join("\n"));' "$D/$TSV"
}
mut_ff_short_quote() {
  node -e '
    const fs=require("fs");const p=process.argv[1];
    const c=JSON.parse(fs.readFileSync(p,"utf8"));
    c.controlBindings[0].quote=c.controlBindings[0].quote.slice(0,5); // verbatim substring but <8 chars
    fs.writeFileSync(p,JSON.stringify(c,null,1));' "$D/$CLAIMS"
}
mut_fg_sha_mismatch() {
  node -e '
    const fs=require("fs");const p=process.argv[1];
    const c=JSON.parse(fs.readFileSync(p,"utf8"));
    c.controlBindings[0].sha256="3"+c.controlBindings[0].sha256.slice(1); // still 64-hex, wrong
    fs.writeFileSync(p,JSON.stringify(c,null,1));' "$D/$CLAIMS"
}
mut_fh_thin_bindings() {
  node -e '
    const fs=require("fs");const p=process.argv[1];
    const c=JSON.parse(fs.readFileSync(p,"utf8"));
    c.controlBindings=c.controlBindings.slice(0,4);
    fs.writeFileSync(p,JSON.stringify(c,null,1));' "$D/$CLAIMS"
}
mut_fi_r6_not_refused() {
  node -e '
    const fs=require("fs");const p=process.argv[1];
    const c=JSON.parse(fs.readFileSync(p,"utf8"));c.refused=false;fs.writeFileSync(p,JSON.stringify(c,null,1));' "$D/$PROBE"
}
mut_fj_r6_no_pin() {
  node -e '
    const fs=require("fs");const p=process.argv[1];
    const c=JSON.parse(fs.readFileSync(p,"utf8"));c.findingIds=[];fs.writeFileSync(p,JSON.stringify(c,null,1));' "$D/$PROBE"
}
mut_fk_r6_bad_ids() {
  node -e '
    const fs=require("fs");const p=process.argv[1];
    const c=JSON.parse(fs.readFileSync(p,"utf8"));c.fixtureRev="zzz";c.generatorDigest="123";fs.writeFileSync(p,JSON.stringify(c,null,1));' "$D/$PROBE"
}
mut_fl_tree_receipt() {
  git -C "$D" rm -q "$RECEIPT"
  mkdir -p "$D/$RECEIPT"
  for i in $(seq 1 40); do echo "{\"f\":$i}" > "$D/$RECEIPT/entry-$i.json"; done
}
mut_fm_staged_html_tree() {
  git -C "$D" rm -q "$STAGED"
  mkdir -p "$D/$STAGED"
  echo "<html>placeholder</html>" > "$D/$STAGED/index.html"
}
mut_fn_small_receipt() {
  node -e '
    const fs=require("fs"),crypto=require("crypto");
    const d=process.argv[1];
    const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
    const receipt=Buffer.from(JSON.stringify({schema:"x",tiny:"z".repeat(400)})); // 413-byte valid JSON blob
    fs.writeFileSync(d+"/corpus/evidence/round41/playwright-egress/receipt.json",receipt);
    const m=JSON.parse(fs.readFileSync(d+"/"+process.argv[2],"utf8"));
    m.receiptSha256=sha(receipt);
    fs.writeFileSync(d+"/"+process.argv[2],JSON.stringify(m));' "$D" "$MEASURE"
}
mut_fo_unrelated() { echo "unrelated scratch note" > "$D/scratch-note.txt"; }
mut_fp_26word_quote() {
  node -e '
    const fs=require("fs");const [srcp,words]=process.argv.slice(1);
    const html=fs.readFileSync(srcp,"utf8");
    const re=new RegExp("[A-Za-z0-9.,()/-]+(?: [A-Za-z0-9.,()/-]+){"+(words-1)+"}");
    const m=html.match(re);if(!m)throw new Error("no run of "+words+" words found");
    const p=process.argv[3];
    const lines=fs.readFileSync(p,"utf8").split("\n").map(l=>l.startsWith("| S148 |")?l.replace(/supersedes S146 — [^|]*/,"supersedes S146 — "+m[0]+" "):l).join("\n");
    fs.writeFileSync(p,lines);' "$D/$STAGED" 26 "$D/$SOURCES"
}
mut_fq_s146_status() {
  node -e '
    const fs=require("fs");const p=process.argv[1];
    const lines=fs.readFileSync(p,"utf8").split("\n").map(l=>l.startsWith("| S146 |")?l.replace(" rejected "," accepted "):l).join("\n");
    fs.writeFileSync(p,lines);' "$D/$SOURCES"
}
mut_fr_baseline_no_lstree() { printf 'noop counting result: 0\n' > "$D/$BASELINE"; }
mut_fs_empty_baseline() { printf 'x' > "$D/$BASELINE"; }

for c in fa_tree_evidence fb_v0_replacement fc_38row_drop fd_empty_evidence fe_4col_row \
         ff_short_quote fg_sha_mismatch fh_thin_bindings fi_r6_not_refused fj_r6_no_pin \
         fk_r6_bad_ids fl_tree_receipt fm_staged_html_tree fn_small_receipt fo_unrelated \
         fp_26word_quote fq_s146_status fr_baseline_no_lstree fs_empty_baseline; do
  run_case "$c"
done
echo DONE
