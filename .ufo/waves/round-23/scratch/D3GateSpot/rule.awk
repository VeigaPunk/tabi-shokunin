# usage: awk -f rule.awk lesson.md [lesson2.md ...] -> one line per file
# c3 candidate rule: line-initial spot-check/owed disclosure INSIDE a "## Gate" section.
function gatehead(s){ return tolower(s) ~ /^##[[:space:]]+gate([[:space:]-]|$)/ }
function nexth2(s){ return s ~ /^##[[:space:]]/ && !gatehead(s) }
function hitline(s){ return s ~ /^[[:space:]]*([-*][[:space:]]+)?(\*\*)?[Ss]pot[- ]?check([^A-Za-z]|$)/ \
                       || tolower(s) ~ /^[[:space:]]*([-*][[:space:]]+)?(\*\*)?.*owed[- ]to[- ]closure/ }
function report(){ if (fn!="") { if (found) printf "CLEAR %s:%d\n", fn, ln; else printf "FINDING %s\n", fn } }
FNR==1 { report(); fn=FILENAME; ingate=0; found=0; ln=0 }
{ if (gatehead($0)) { ingate=1; next }
  if (nexth2($0))    { ingate=0; next }
  if (ingate && hitline($0)) { found=1; if (ln==0) ln=FNR } }
END{ report() }
