# ScoutRegisterDrift — tabi slice derivation cross-check

Full write-up and evidence: `.ufo/waves/round-42/w1/ScoutRegisterDrift/report.md` and `.../ScoutRegisterDrift/evidence/`.

Buggy awk (`print $4, $5`) emits 38 lines; the S171 first field is bytes `53 31 37 31 60` (one trailing backtick, register line 362). Fixed awk (`gsub(/[^A-Za-z0-9]/,"",id); print id, $5` | `sort -u`, then `cut -d' ' -f1 | sort -u`) is 38 unique ids and `cmp`-identical to `git show 9b6de3a19de11abdb80e82a1310abc64a40215bb:.ufo/waves/round-42/quarantine/slice-ids.txt` (blob `ec22e716f19bf160bb113ea2bc2f0ff03520a5db`, sha256 `373516272b385d1becce2e622292668dc82b7dc0012df64bcac8810f76e712cf`, 190 bytes).

`## By lane` tabi **37** matches the 37 `## Rows` / census `ABSENT` tabi ids and drops S171 (NEVER CHECKED / census `fetch-failed`). Header **194** and **324** match census `ABSENT` rows and quotes; the rendered quote cells only hold 301 `<br>`-spans (S118 and S176 are two of the 17 short rows). By lane sum 194 matches `## Rows` and omits never-checked-only lanes `lore` (9) and `mori` (3). NEVER CHECKED banner 109 matches the table and census `fetch-failed` 78 + `no-locator` 31.

No install. Register sha256 `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833` at shokuknow `8b94c5c12c0521e4cd9ed8e5b6939afd8518c715`.

VERDICT ok fixed-id list is byte-identical to frozen slice-ids.txt (38 ids, sha256 373516272b385d1becce2e622292668dc82b7dc0012df64bcac8810f76e712cf); By lane tabi 37 is ABSENT-only and omits S171
