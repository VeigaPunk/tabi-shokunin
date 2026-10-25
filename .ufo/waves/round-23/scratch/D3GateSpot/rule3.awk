# usage: awk -f rule3.awk lesson.md [lesson2.md ...] -> one line per file
# c3 rule R3: inside a "## Gate" H2 section, strip inline-code spans, then require a
# spot-check mention or an owed-to-closure disclosure on some remaining line.
function gatehead(s){ return tolower(s) ~ /^##[[:space:]]+gate([[:space:]-]|$)/ }
function nexth2(s){ return s ~ /^##[[:space:]]/ && !gatehead(s) }
function hitline(s,  t){ t=s; gsub(/`[^`]*`/, "", t)
  return tolower(t) ~ /spot[- ]?check/ || tolower(t) ~ /owed[- ]to[- ]closure/ }
function report(){ if (fn!="") { if (found) printf "CLEAR %s:%d\n", fn, ln; else printf "FINDING %s\n", fn } }
FNR==1 { report(); fn=FILENAME; ingate=0; found=0; ln=0 }
{ if (gatehead($0)) { ingate=1; next }
  if (nexth2($0))    { ingate=0; next }
  if (ingate && hitline($0)) { found=1; if (ln==0) ln=FNR } }
END{ report() }
