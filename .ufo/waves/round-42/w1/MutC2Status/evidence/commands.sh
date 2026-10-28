mkdir -p /fast/scratch/hyaku/tabi-r42/MutC2Status
cp /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs /fast/scratch/hyaku/tabi-r42/MutC2Status/check-pristine.mjs
# fixture: git init -q in /fast/scratch/hyaku/tabi-r42/MutC2Status/fixture-repo; real committed blobs for measure/receipt/witness/html/baseline/slice;
# corpus/SOURCES.md = header + real S146 row with status cell rewritten rejected->mined + real S148 row appended;
# .ufo/waves/round-42/quarantine/re-adjudication.tsv = 38 slice ids, verdict present, evidence blobs >=200 B.
git -C /fast/scratch/hyaku/tabi-r42/MutC2Status/fixture-repo rev-parse --show-toplevel   # must equal /fast/scratch/hyaku/tabi-r42/MutC2Status/fixture-repo (checked before commit)
node /fast/scratch/hyaku/tabi-r42/MutC2Status/check-pristine.mjs --rev 31f10b5425ff1fccadc1eb216cff65ef1e4aaa6a --repo /fast/scratch/hyaku/tabi-r42/MutC2Status/fixture-repo --json   # exit 1
python: delete the single `else if (cell(s146, 8) !== 'rejected') ...` line -> /fast/scratch/hyaku/tabi-r42/MutC2Status/check-mutant.mjs
node /fast/scratch/hyaku/tabi-r42/MutC2Status/check-mutant.mjs --rev 31f10b5425ff1fccadc1eb216cff65ef1e4aaa6a --repo /fast/scratch/hyaku/tabi-r42/MutC2Status/fixture-repo --json     # exit 0
node /fast/scratch/hyaku/tabi-r42/MutC2Status/check-restored.mjs --rev 31f10b5425ff1fccadc1eb216cff65ef1e4aaa6a --repo /fast/scratch/hyaku/tabi-r42/MutC2Status/fixture-repo --json   # exit 1 (pristine bytes restored)
node /fast/scratch/hyaku/tabi-r42/MutC2Status/check-pristine.mjs --rev 65d83cdaf264d206ebc6896e0fe61c9608ea6590 --repo /fast/scratch/hyaku/tabi-r42/MutC2Status/fixture-repo --json   # exit 0 (control: S146 rejected)
node /fast/scratch/hyaku/tabi-r42/MutC2Status/check-mutant.mjs --rev 65d83cdaf264d206ebc6896e0fe61c9608ea6590 --repo /fast/scratch/hyaku/tabi-r42/MutC2Status/fixture-repo --json     # exit 0
