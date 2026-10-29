#!/usr/bin/env bash
source /fast/scratch/hyaku/tabi-r43/MutC1Challenge/run-arms.sh
S=/fast/scratch/hyaku/tabi-r43/MutC1Challenge
IN=$S/in
run_arm C1-pristine-ctrlreplica-nofd   $S/shadow-pristine $IN/ctrl-receipt.json $IN/ctrl-measure-pristine.json nofd
run_arm C2-mutant-ctrlreplica-nofd     $S/shadow-mutant   $IN/ctrl-receipt.json $IN/ctrl-measure-mutant.json nofd
