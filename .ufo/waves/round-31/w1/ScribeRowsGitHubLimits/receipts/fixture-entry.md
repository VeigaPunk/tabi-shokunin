# Rate-signal decision table

source: S121
verified-at: 2026-10-26
recheck: 180d

| Row | Signal | Decision | Threshold | Source | Located quote |
|---|---|---|---|---|---|
| D1 | secondary-limit `403` or `429` with no `retry-after` and `x-ratelimit-remaining` not `0` | wait at least one minute before retrying (vendor policy: GitHub REST API, last-resort branch of the secondary-limit remedy) | at least 1 minute | S121 | "Otherwise, wait for at least one minute before retrying." |
| D2 | `x-ratelimit-limit` reads 60 on an unauthenticated request | cap pacing at 60 requests per hour (vendor policy: GitHub REST API, unauthenticated) | 60 requests | S121 | "The primary rate limit for unauthenticated requests is 60 requests per hour." |
| D3 | `x-ratelimit-limit` reads 5000 with a personal access token | cap pacing at 5,000 requests per hour (vendor policy: GitHub REST API, personal token) | 5,000 requests | S121 | "All of these requests count towards your personal rate limit of 5,000 requests per hour." |
| D4 | `x-ratelimit-limit` with an installation access token | cap assumptions at the installation minimum of 5,000 requests per hour (vendor policy: GitHub App installations) | 5,000 requests | S121 | "GitHub Apps authenticating with an installation access token use the installation's minimum rate limit of 5,000 requests per hour." |
| D5 | `x-ratelimit-limit` reads 1000 under `GITHUB_TOKEN` | cap pacing at 1,000 requests per hour per repository (vendor policy: GitHub Actions `GITHUB_TOKEN`) | 1,000 requests | S121 | "The rate limit for GITHUB_TOKEN is 1,000 requests per hour per repository." |
| D6 | `x-ratelimit-limit` above 12500 on a non-Enterprise installation | cap the scaled installation budget at 12,500 requests per hour (vendor policy: GitHub REST API, non-Enterprise Cloud installations) | at most 12,500 requests | S121 | "The rate limit cannot increase beyond 12,500 requests per hour." |
| D7 | parallel fan-out to one host (`concurrent requests`) | cap concurrent requests at 100 (vendor policy: GitHub secondary limit, shared across REST and GraphQL) | no more than 100 concurrent | S121 | "No more than 100 concurrent requests are allowed." |
| D8 | weighted `points` burst on one REST endpoint | cap weighted points at 900 per minute (vendor policy: GitHub secondary point limit, REST endpoints) | no more than 900 points | S121 | "No more than 900 points per minute are allowed for REST API endpoints" |
| D9 | summed `CPU time` proxy (total response time) over 60 s of wall clock | cap estimated CPU time at 90 seconds per 60 seconds (vendor policy: GitHub secondary compute limit) | no more than 90 seconds | S121 | "No more than 90 seconds of CPU time per 60 seconds of real time is allowed." |
| D10 | content-creating `POST` `PATCH` `DELETE` calls | cap content-generating requests at 80 per minute (vendor policy, general case: some endpoints have lower limits) | no more than 80 requests | S121 | "In general, no more than 80 content-generating requests per minute" |
| D11 | `OAuth access token` request burst | cap OAuth access token requests at 2,000 per hour (vendor policy: GitHub Apps and OAuth apps) | no more than 2,000 requests | S121 | "No more than 2,000 OAuth access token requests per hour are allowed for GitHub Apps and OAuth apps." |
| D12 | Git LFS batch request `429` | cap the LFS bucket at 300 requests per minute unauthenticated (vendor policy: separate LFS bucket) | 300 requests | S121 | "a limit of 300 requests per minute for unauthenticated requests and 3,000 requests per minute for authenticated requests" |

Scope: these rows are the vendor's published policy for its REST API host.
