#!/usr/bin/env bash
# P11: does the blob-read path depend on live .gitattributes / filters?
set +e
P=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-23/scratch/CritDeterminism/proof
cd "$P" || exit 9
rm -rf r4; git init -q r4; cd r4
printf 'a\r\nb\r\n' > crlf.txt
printf 'z\n' > sm.txt
git add crlf.txt sm.txt; git -c user.email=a@b -c user.name=a commit -qm base
R=$(git rev-parse HEAD)
echo "--- committed blob bytes ---"
echo "catfile=$(git cat-file -p "$R":crlf.txt | od -An -c | tr -d ' \n')"
echo "show   =$(git show "$R":crlf.txt | od -An -c | tr -d ' \n')"
echo "--- now add LIVE, UNCOMMITTED .gitattributes with eol=lf ---"
printf '*.txt text eol=lf\n' > .gitattributes
echo "catfile_after_attr=$(git cat-file -p "$R":crlf.txt | od -An -c | tr -d ' \n')"
echo "show_after_attr   =$(git show "$R":crlf.txt | od -An -c | tr -d ' \n')"
rm .gitattributes
echo "--- filter driver: clean/smudge defined in LIVE config, not committed ---"
printf '*.sm filter=upcase\n' > .gitattributes
git config filter.upcase.smudge 'tr a-z A-Z'
git config filter.upcase.clean 'cat'
git -c user.email=a@b -c user.name=a commit -qm attrs -- .gitattributes
R2=$(git rev-parse HEAD)
echo "show_filtered=$(git show "$R2":sm.txt)"
rm -f sm.txt; git checkout -- sm.txt 2>/dev/null
echo "checkout_smudged=$(cat sm.txt 2>/dev/null)"
echo "--- ls-tree -z vs default quoting/mode for gitlink+symlink ---"
git -c protocol.file.allow=always submodule add -q "$P/r1" sub 2>/dev/null
git -c user.email=a@b -c user.name=a commit -qm sub 2>/dev/null
R3=$(git rev-parse HEAD)
git ls-tree -r "$R3" | sed -n '1,6p'
echo "--- rev-parse --verify with ref names accepted as --rev ---"
for r in "$R" HEAD main r4; do
  printf '%s -> rc=' "$r"; git rev-parse --verify --end-of-options "$r^{commit}" >/dev/null 2>&1; echo $?
done
echo "--- git show of a directory path (tree) rc ---"
git show "$R3":sub >/dev/null 2>&1; echo "tree_path_rc=$?"
echo "--- --end-of-options behavior with dash-leading rev ---"
git show --end-of-options "--foo:x" >/dev/null 2>&1; echo "dash_rev_rc=$?"
