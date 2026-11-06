#!/bin/sh
# R71Exec4 fault injection: a stand-in for /usr/bin/chromium that answers --version
# (the drivers' preflight) and then fails the real launch with a stderr diagnostic.
# Same fault is applied to all three driver copies.
if [ "$1" = "--version" ]; then
  echo "Chromium 155.0.8059.84"
  exit 0
fi
echo "FATAL:simulated_launch_failure: wrapper refuses to start the browser" >&2
exit 1
