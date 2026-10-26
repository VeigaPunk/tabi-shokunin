# Control — one quote, ten rows (padding)

| Row | Signal | Decision | Threshold | Source | Located quote |
|---|---|---|---|---|---|
| D1 | `robots.txt` answers `301` | follow | 5 redirects | S119 | "The crawlers SHOULD follow at least five consecutive redirects, even across authorities" |
| D2 | `robots.txt` answers `302` | follow | 5 redirects | S119 | "The crawlers SHOULD follow at least five consecutive redirects, even across authorities" |
| D3 | `robots.txt` answers `307` | follow | 5 redirects | S119 | "The crawlers SHOULD follow at least five consecutive redirects, even across authorities" |
| D4 | `robots.txt` answers `308` | follow | 5 redirects | S119 | "The crawlers SHOULD follow at least five consecutive redirects, even across authorities" |
| D5 | `robots.txt` redirect chain | cap | 5 redirects | S119 | "The crawlers SHOULD follow at least five consecutive redirects, even across authorities" |
| D6 | `robots.txt` cross-authority redirect | allow | 5 redirects | S119 | "The crawlers SHOULD follow at least five consecutive redirects, even across authorities" |
| D7 | `robots.txt` long redirect chain | stop | 5 redirects | S119 | "The crawlers SHOULD follow at least five consecutive redirects, even across authorities" |
| D8 | `robots.txt` redirect loop | stop | 5 redirects | S119 | "The crawlers SHOULD follow at least five consecutive redirects, even across authorities" |
| D9 | `robots.txt` redirect timeout | backoff | 5 redirects | S119 | "The crawlers SHOULD follow at least five consecutive redirects, even across authorities" |
| D10 | `robots.txt` redirect target | cache | 5 redirects | S119 | "The crawlers SHOULD follow at least five consecutive redirects, even across authorities" |
