#!/usr/bin/env bash
# Throwaway determinism proof. Writes ONLY inside scratch/CritDeterminism/.
set +e
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
P=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-23/scratch/CritDeterminism/proof
rm -rf "$P"; mkdir -p "$P"; cd "$P" || exit 9

echo "=== L1 lane repo shape (read-only) ==="
git -C "$LANE" rev-parse --show-object-format
git -C "$LANE" rev-parse --absolute-git-dir
test -f "$LANE/.git" && echo "dotgit=FILE" || echo "dotgit=DIR"
git -C "$LANE" for-each-ref refs/replace | wc -l
git -C "$LANE" config --get core.autocrlf; echo "autocrlf_rc=$?"
ls "$LANE/.git/objects/info/alternates" 2>/dev/null; echo "alternates_rc=$?"
git -C "$LANE" config --get extensions.partialclone; echo "partialclone_rc=$?"
ls "$LANE/.git/info/grafts" 2>/dev/null; echo "grafts_rc=$?"
ls "$LANE/.git/shallow" 2>/dev/null; echo "shallow_rc=$?"

echo "=== P1 dirty working tree diverges from blob ==="
git init -q r1 >/dev/null 2>&1; cd r1
printf 'live-A\n' > x.txt; git add x.txt; git -c user.email=a@b -c user.name=a commit -qm A
printf 'blob-B\n' > x.txt; git add x.txt; git -c user.email=a@b -c user.name=a commit -qm B
RB=$(git rev-parse HEAD)
printf 'dirty-uncommitted\n' > x.txt
echo "blob_at_rev=[$(git show "$RB":x.txt)]"
echo "readFile_live=[$(cat x.txt)]"
cd "$P"

echo "=== P2 replace ref silently substitutes the tree of --rev ==="
cd r1
git checkout -q -b side "$RB~1"
printf 'replaced-C\n' > x.txt; git add x.txt; git -c user.email=a@b -c user.name=a commit -qm C
RC=$(git rev-parse HEAD)
echo "plain=[$(git show "$RB":x.txt)]"
git replace "$RB" "$RC"
echo "with_replace_ref=[$(git show "$RB":x.txt)]"
echo "with_no_replace=[$(GIT_NO_REPLACE_OBJECTS=1 git show "$RB":x.txt)]"
echo "same_rev_oid=$(git rev-parse "$RB")"
git replace -d "$RB" >/dev/null
echo "after_undelete=[$(git show "$RB":x.txt)]"
cd "$P"

echo "=== P3 GIT_DIR env leak redirects which repo answers --rev ==="
git init -q r2 >/dev/null 2>&1; cd r2
printf 'other\n' > x.txt; git add x.txt; git -c user.email=a@b -c user.name=a commit -qm D
R2=$(git rev-parse HEAD)
cd "$P"
echo "plain_from_scratch=[$(git -C "$P" show "$RB":x.txt 2>&1 | head -1)]"
cd r2
echo "GIT_DIR_leak=[$(GIT_DIR="$P/r1/.git" git show "$RB":x.txt 2>&1 | head -1)]"
echo "GIT_OBJECT_DIRECTORY_leak=[$(GIT_OBJECT_DIRECTORY="$P/r1/.git/objects" git cat-file -p "$RB" 2>&1 | head -1)]"
cd "$P"

echo "=== P4 uncaught throw exits 1, indistinguishable from 'findings' ==="
node -e 'JSON.parse(require("fs").readFileSync("nope.json","utf8"))' >/dev/null 2>&1; echo "uncaught_rc=$?"
node -e 'process.exit(2)' >/dev/null 2>&1; echo "explicit_rc=$?"

echo "=== P5 symlink + gitlink blob shapes cat-file returns ==="
cd r1
ln -s x.txt link; git add link; git -c user.email=a@b -c user.name=a commit -qm L
RL=$(git rev-parse HEAD)
git ls-tree "$RL" link | awk '{print "mode="$1}'
echo "catfile_symlink=[$(git cat-file -p "$RL":link)]"
echo "catfile_dir_as_path=[$(git cat-file -p "$RL~1":. 2>&1 | head -1)]"
cd "$P"

echo "=== P6 shell glob sees untracked; ls-tree does not ==="
cd r1
printf '{"forged":true}\n' > cap-refusal-99.json
echo "fs_glob_count=$(ls cap-refusal-*.json 2>/dev/null | wc -l)"
echo "tree_count=$(git ls-tree -r --name-only "$RB" | grep -c 'cap-refusal-.*\.json')"
rm -f cap-refusal-99.json
cd "$P"

echo "=== P7 missing path / bad rev exit codes ==="
cd r1
git cat-file -e "$RB":x.txt; echo "present_rc=$?"
git cat-file -e "$RB":absent.txt; echo "absent_path_rc=$?"
git cat-file -e deadbeefdeadbeefdeadbeefdeadbeefdeadbeef:x; echo "wrong_oid_rc=$?"
git rev-parse --verify --end-of-options "$RB^{commit}" >/dev/null; echo "verify_ok_rc=$?"
git rev-parse --verify --end-of-options "HEAD^{commit}" >/dev/null; echo "verify_head_rc=$?"
echo "head_eq_tip=[$([ "$(git rev-parse HEAD)" = "$RB" ] && echo yes || echo no)]"
cd "$P"

echo "=== P8 sha256 repo: 40-hex rev assumption is format-specific ==="
git init -q --object-format=sha256 r3 >/dev/null 2>&1; cd r3
printf 's\n' > x.txt; git add x.txt; git -c user.email=a@b -c user.name=a commit -qm S
echo "format=$(git rev-parse --show-object-format) rev_len=$(git rev-parse HEAD | wc -c)"
cd "$P"

echo "=== P9 autocrlf: show() is raw, checkout/readFile is converted ==="
cd r1
printf 'a\r\nb\r\n' > crlf.txt; git add crlf.txt; git -c user.email=a@b -c user.name=a commit -qm CR
R0=$(git rev-parse HEAD)
echo "show_bytes=$(git show "$R0":crlf.txt | od -An -c | tr -d ' \n')"
rm crlf.txt; git -c core.autocrlf=true checkout -- crlf.txt
echo "checkout_bytes=$(od -An -c crlf.txt | tr -d ' \n')"
cd "$P"

echo "=== P10 cwd controls repo resolution when -C/GIT_DIR is omitted ==="
cd "$P/r2"
echo "cwd=$PWD toplevel=$(git rev-parse --show-toplevel)"
echo "show_r1_rev_here=[$(git show "$RB":x.txt 2>&1 | head -1)]"
echo "=== done ==="
