# Transcription-typo investigation (process evidence)

While verifying, this seat observed git object lookups for `ba433c94...0be0a8ee...`
alternately fail and succeed, and initially mis-diagnosed a live-repo "object flicker"
(loose object `ls`-visible but `stat`-ENOENT; strace ENOENT on openat). Decisive test:
feed the rev programmatically.

```
OID=$(git rev-parse HEAD)   # -> ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c
git cat-file -t "$OID"      # commit   (works)
git cat-file -t ba433c94b14a0e0d5ecf2eba0be0a8ee3064491c   # fatal (typo: ...ba0be... vs ...ba1be...)
```

Every "flicker" window coincided with batches typed with the transposed nibble
(position 33: real `1`, typed `0`). No filesystem/jj instability existed; the repo's
jj-export reflog is benign background. Same failure class as the in-wave freeze-hash
typo (see report pattern 3). Lesson: always re-derive revs OIDs programmatically.

Reproduced in a full file:// clone into scratch (mirror): the typo'd 40-hex deterministically
fails `cat-file -t` with "exists on disk, but not in", while `HEAD:path`, short-abbrev,
other full-hex commits, and the programmatically-fed OID all resolve — proving the
cause was name transcription, not object availability.
