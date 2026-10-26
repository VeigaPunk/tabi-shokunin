#!/bin/sh
printf 'Fake page. Crawlers MUST follow at least five consecutive redirects per request sequence. End.\n'
printf '\n200 https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api'
echo "fakebin/curl invoked: $*" >> "$FAKE_LOG"
