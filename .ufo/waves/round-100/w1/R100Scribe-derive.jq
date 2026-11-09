# Re-derivation of every number in the round-100 C1 knowledge note from the committed receipt.
# Input : corpus/evidence/round100/client-oopif-uploadsets/receipt.json
# Frozen constants come from scripts/check-client-oopif-uploadsets-round100.mjs
#   (driver sha256 97947b0b1a4522a48cf08c3681bc13368534608841094a755dd4cf938b306b90).
# Output: exactly one JSON document.

def arm($name): first(.legs.perArm[] | select(.arm == $name));

. as $r
| {
  derivedAt: "2026-11-09",
  derivedBy: "R100Scribe (round 100 w1)",
  sourceReceipt: "corpus/evidence/round100/client-oopif-uploadsets/receipt.json",
  receiptLevel: {
    schema: $r.schema,
    nonce: $r.nonce,
    driverSha256: $r.driverSha256,
    chromium: $r.chromium,
    reps: $r.reps,
    tmpdirAtLoad: $r.tmpdirAtLoad,
    missingPath: $r.missingPath,
    missingExists: $r.missingExists,
    ports: $r.ports,
    failuresCount: ($r.failures | length),
    legsWithError: [$r.legs[] | select(.error != null) | .leg],
    libs: $r.libs,
    descriptors: {
      fileA: $r.fileA, fileB: $r.fileB,
      dup1: $r.dup1, dup2: $r.dup2, dup3: $r.dup3,
      empty: $r.empty, payload1: $r.payload1,
      dirOne: $r.dirOne, dirTwo: $r.dirTwo
    }
  },
  legs: {
    count: ($r.legs | length),
    order: [$r.legs[].leg],
    armsInRunOrder: ([$r.legs[].arm] | reduce .[] as $a ([]; if (index($a) | not) then . + [$a] else . end)),
    perArm: ($r.legs | group_by(.arm) | map({
      arm: .[0].arm,
      legs: length,
      reps: ([.[].rep] | unique),
      libs: ([.[].lib] | unique),
      modes: ([.[].mode] | unique),
      isLocal: ([.[].isLocal] | unique),
      input: ([.[].input] | unique),
      target: ([.[].target] | unique),
      outcomes: ([.[].outcome] | unique),
      errNames: ([.[].errName] | unique),
      errMessages: ([.[].errMessage] | unique),
      targetFiles: ([.[] | .files[.target]] | unique),
      otherInputsAlwaysEmpty: (all(.[]; . as $leg | ([$leg.files | to_entries[] | select(.key != $leg.target) | .value] | flatten | length) == 0)),
      events: ([.[].events] | unique),
      reads: ([.[].reads] | unique),
      readSizes: ([.[] | .reads[][][1]] | unique),
      readDigests: ([.[] | .reads[][][2]] | unique),
      browserVersions: ([.[].browserVersion] | unique),
      clientBrowserVersions: ([.[].clientBrowserVersion] | unique)
    })),
    distinctBrowserIds: ([$r.legs[].browserId] | unique | length),
    browserIdsAllUuidShaped: ([$r.legs[].browserId] | all(test("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"))),
    framesAlwaysTwo: ($r.legs | all((.frames | length) == 2)),
    framesAreParentThenChild: ($r.legs | all((.frames[0] == .parentUrl) and (.frames[1] == .childUrl))),
    iframeTargetsAlwaysOne: ($r.legs | all((.iframeTargets | length) == 1)),
    iframeTargetUrlIsChild: ($r.legs | all(.iframeTargets[0].url == .childUrl)),
    parentPpAlwaysEmpty: ($r.legs | all(.parentFiles == [])),
    eventTypesSeen: ([$r.legs[].events[][1]] | unique),
    clickEventsTotal: ([$r.legs[].events[] | select(.[1] == "click")] | length),
    parentHosts: ([$r.legs[].parentUrl | split("/")[2] | split(":")[0]] | unique),
    childHosts: ([$r.legs[].childUrl | split("/")[2] | split(":")[0]] | unique)
  }
}
| . as $d
| $d + {
  crossChecks: {
    note: "expected values are the frozen constants of the pinned counter; each is compared against the committed receipt",
    schema_ok: ($d.receiptLevel.schema == "tabi-client-oopif-uploadsets-r100"),
    driver_pin_ok: ($d.receiptLevel.driverSha256 == "97947b0b1a4522a48cf08c3681bc13368534608841094a755dd4cf938b306b90"),
    chromium_ok: ($d.receiptLevel.chromium | contains("155.0.8059.84")),
    reps_3: ($d.receiptLevel.reps == 3),
    leg_count_18: ($d.legs.count == 18),
    leg_order_ok: ($d.legs.order == ["DUP3-1","EMPTY1-1","MIXED-1","LAUNCH2PL-1","LAUNCH2PU-1","DIR-1","DUP3-2","EMPTY1-2","MIXED-2","LAUNCH2PL-2","LAUNCH2PU-2","DIR-2","DUP3-3","EMPTY1-3","MIXED-3","LAUNCH2PL-3","LAUNCH2PU-3","DIR-3"]),
    arms_in_run_order_ok: ($d.legs.armsInRunOrder == ["DUP3","EMPTY1","MIXED","LAUNCH2PL","LAUNCH2PU","DIR"]),
    three_reps_each: ($d.legs.perArm | all(.legs == 3 and (.reps | length) == 3)),
    distinct_browser_ids_18: ($d.legs.distinctBrowserIds == 18),
    browser_ids_uuid_shaped: $d.legs.browserIdsAllUuidShaped,
    failures_empty: ($d.receiptLevel.failuresCount == 0 and ($d.receiptLevel.legsWithError | length) == 0),
    ports_three_distinct_in_range: ($d.receiptLevel.ports | [(.http),(.child),(.cdp)] | (all(. >= 1024 and . <= 65535) and (unique | length) == 3)),
    missing_absent: ($d.receiptLevel.missingExists == false and ($d.receiptLevel.missingPath | endswith("/tabi-r100-missing.txt"))),
    tmpdir_basename_t: ($d.receiptLevel.tmpdirAtLoad | endswith("/t")),
    libs_pinned: ($d.receiptLevel.libs["puppeteer-core"].version == "25.16.0" and $d.receiptLevel.libs["playwright-core"].version == "1.65.0"),
    libs_tree_counts: ($d.receiptLevel.libs["puppeteer-core"].treeFiles == 927 and $d.receiptLevel.libs["playwright-core"].treeFiles == 116),
    cross_site_child: ($d.legs.parentHosts == ["127.0.0.1"] and $d.legs.childHosts == ["localhost"]),
    frames_parent_child: ($d.legs.framesAlwaysTwo and $d.legs.framesAreParentThenChild),
    one_iframe_target: ($d.legs.iframeTargetsAlwaysOne and $d.legs.iframeTargetUrlIsChild),
    parent_pp_empty: $d.legs.parentPpAlwaysEmpty,
    no_click_events: ($d.legs.clickEventsTotal == 0),
    dup3_files: (arm("DUP3").targetFiles == [[["dup.txt",21,"text/plain",""],["dup.txt",22,"text/plain",""],["other.txt",11,"text/plain",""]]]),
    dup3_untrusted_events: (arm("DUP3").events == [[["m","input",false],["m","change",false]]]),
    dup3_read_digests: ((arm("DUP3").readDigests | sort) == (["bb6d8edc9fc82a9898fcdd09a08faab8110eaa2aa9877092044fc69e4b650f9f","7fb4cba7e286a5443963586dce005060926ada61e56dbb2dc8d1c9511e31431b","1a1308a9af5ef65563670b3a5b620daeb900250105db7b747faafd3e6c140435"] | sort)),
    empty1_files: (arm("EMPTY1").targetFiles == [[["tabi-r100-empty.txt",0,"text/plain",""]]]),
    empty1_untrusted_events: (arm("EMPTY1").events == [[["m","input",false],["m","change",false]]]),
    empty1_reads_empty_sha256: (arm("EMPTY1").readSizes == [0] and arm("EMPTY1").readDigests == ["e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"]),
    mixed_refusal: (arm("MIXED").outcomes == ["error"] and arm("MIXED").errNames == ["Error"] and arm("MIXED").errMessages == ["File paths cannot be mixed with buffers"]),
    mixed_nothing_set: (arm("MIXED").targetFiles == [[]] and arm("MIXED").events == [[]] and arm("MIXED").reads == [[]]),
    mixed_isLocal_true: (arm("MIXED").isLocal == [true]),
    launch_arms_trusted_events: (arm("LAUNCH2PL").events == [[["m","input",true],["m","change",true]]] and arm("LAUNCH2PU").events == [[["m","input",true],["m","change",true]]]),
    launch_arms_files: (arm("LAUNCH2PL").targetFiles == [[["tabi-r100-a.txt",23,"text/plain",""],["tabi-r100-b.txt",31,"text/plain",""]]] and arm("LAUNCH2PU").targetFiles == [[["tabi-r100-a.txt",23,"text/plain",""],["tabi-r100-b.txt",31,"text/plain",""]]]),
    launch_arms_libs: (arm("LAUNCH2PL").libs == ["playwright"] and arm("LAUNCH2PU").libs == ["puppeteer"]),
    dir_files_recursive: (arm("DIR").targetFiles == [[["one.txt",13,"text/plain","probe-dir/one.txt"],["two.txt",13,"text/plain","probe-dir/sub/two.txt"]]]),
    dir_trusted_events: (arm("DIR").events == [[["d","input",true],["d","change",true]]]),
    dir_read_digests: ((arm("DIR").readDigests | sort) == (["d23bc5bbaed1566ee74c3b3fd38672097abaa8dff4bb2aff7623e6c91216a5d9","c40815e6ec24cd77c799af972f437c7850899096b392a61e4aa4aecf977309a8"] | sort)),
    other_inputs_always_empty: ($d.legs.perArm | all(.otherInputsAlwaysEmpty))
  }
}
| . + {
  allCrossChecksPass: ([.crossChecks | to_entries[] | select(.key != "note") | .value] | all),
  crossCheckFalseCount: ([.crossChecks | to_entries[] | select(.key != "note" and .value == false)] | length)
}
| . + {
  provenance: {
    note: "source-attribution cross-checks re-derived by this seat (not by the counter)",
    staged_sources: {
      "whatwg-input.html": { sha256_prefix: "b0202de1c0b4", bytes: 687515, webkitRelativePath_occurrences: 0, webkitdirectory_occurrences: 0, has_filename_rule: true },
      "pw-dom.ts": { sha256_prefix: "65cb43c91893", bytes: 49422, non_multiple_throw_line: 757 },
      "pw-fileUploadUtils.ts": { sha256_prefix: "96dd5ef0713d", bytes: 3437, exactly_one_guard_lines: "42-43", plan_cited_line: 44, mime_fallback_line: 80, collocation_branch_line: 62 },
      "pw-elementHandle.ts": { sha256_prefix: "b5e6046e19cb", bytes: 15091, mixed_throw_line: 287, dir_vs_files_throw_line: 278, convert_input_files_line: 282, upstream_refetch_sha256_match: true },
      "pp-ElementHandle.ts": { sha256_prefix: "c86ed958566f", bytes: 6124, multiple_assert_lines: "113-116" }
    },
    fetch_log: {
      url_lines_in_log: 4,
      staged_source_files: 5,
      files_without_a_fetch_log_line: ["pw-elementHandle.ts (S248, S249)"],
      plan_claim: "each has a staged copy and a fetch-log line"
    },
    whatwg_filename_rule: {
      source: "whatwg-input.html lines 4021-4025, section 4.10.5.1.17 File Upload state",
      quote: "Filenames must not contain path components",
      explains: "File.name carries no path components, so it is the basename; the directory hierarchy travels in the separate webkitRelativePath attribute"
    },
    webkitRelativePath_actual_home: {
      not_in: "WHATWG input.html (0 occurrences in the staged 687515 B copy; webkitdirectory also 0)",
      home: "Blink third_party/blink/renderer/core/fileapi/file.idl line 38 at tag 155.0.8059.84: [MeasureAs=PrefixedFileRelativePath] readonly attribute DOMString webkitRelativePath;",
      plan_claim: "S250 (WHATWG input.html ... plus the webkitRelativePath definition)"
    }
  },
  crossCheckReceipts: {
    committed_receipt_sha256: "dac0998fce3bb282ef47917428462cebff953cbcce324f14c9fa688d1dee2dd8",
    scored_run_receipt_sha256: "dac0998fce3bb282ef47917428462cebff953cbcce324f14c9fa688d1dee2dd8",
    identical: true,
    scored_run_checkCount_live: 216,
    this_seat_receipt_mode_checkCount: 212,
    difference_explained_by: "the four --live-only checks (driver-exit, ports-bound, missing-bound, tmpdir-bound) that the frozen receipt-level paragraph itself declares",
    scored_run_verdict: "clean",
    scored_run_findings: 0,
    scored_run_nonce: "tabi-r100-live-6e6168fce8a4",
    scored_run_revision: "9a478a2e9fb61eac0c1146a29bf45ecd7cb1f82f",
    scored_run_outcome_class_counts: { trustedMulti: 6, dupKeep: 3, emptyOk: 3, mixedRefused: 3, dirWalk: 3 }
  },
  priorRoundZeroByteLandings: {
    note: "the r98 and r99 absent-path arms DO leave a 0-byte File in one input; relevant to the A1 'Surface moved' history sentence, not to the C1 predicate bullets",
    "r98 PUR-1 childFiles": [["tabi-r98-missing.txt", 0, "text/plain"]],
    "r99 PUAM-1 files.s": [["tabi-r99-missing.txt", 0, "text/plain"]],
    r99_read_result: "NotFoundError (the phantom is unreadable, unlike the r100 EMPTY1 0-byte payload which reads back e3b0c442...)"
  }
}
