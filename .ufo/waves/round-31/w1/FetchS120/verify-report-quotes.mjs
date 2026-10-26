import { readFileSync } from "node:fs";
import { normalise } from "./normlib.mjs";
const n = normalise(readFileSync("b1.txt"));
const qs = {
 "1-428-cache": "Responses with the 428 status code MUST NOT be stored by a cache.",
 "2-429-def": "The 429 status code indicates that the user has sent too many requests in a given amount of time (\"rate limiting\").",
 "3-retry-prose": "The response representations SHOULD include details explaining the condition, and MAY include a Retry-After header indicating how long to wait before making a new request.",
 "4-example-429": "HTTP/1.1 429 Too Many Requests Content-Type: text/html Retry-After: 3600",
 "5-50-req": "I only allow 50 requests per hour to this Web site per logged in user.  Try again soon.",
 "6-429-cache": "Responses with the 429 status code MUST NOT be stored by a cache.",
 "7-431-size": "The 431 status code indicates that the server is unwilling to process the request because its header fields are too large.  The request MAY be resubmitted after reducing the size of the request header fields.",
 "8-431-cache": "Responses with the 431 status code MUST NOT be stored by a cache.",
 "9-511-cache": "Responses with the 511 status code MUST NOT be stored by a cache.",
 "10-port80": "Unknown clients then have all traffic blocked, except for that on TCP port 80, which is sent to an HTTP server (the \"login server\") dedicated to \"logging in\" unknown clients, and of course traffic to the login server itself.",
 "11-meta": "<meta http-equiv=\"refresh\" content=\"0; url=https://login.example.net/\">",
 "12-port443": "Also, note that captive portals using this status code on a Secure Socket Layer (SSL) or Transport Layer Security (TLS) connection (commonly, port 443) will generate a certificate error on the client.",
 "13-class": "However, because clients will treat unknown status codes as a generic error of the same class (e.g., 499 is treated as 400 if it is not recognized), they can be safely deployed by existing servers",
 "note-counting": "Note that this specification does not define how the origin server identifies the user, nor how it counts requests.",
 "note-notrequired": "servers are not required to use the 429 status code",
 "note-optional": "The 428 status code is optional; clients cannot rely upon its use to",
};
for (const [k, v] of Object.entries(qs)) {
  const q = v.replace(/\s+/g, " ").trim();
  console.log(k.padEnd(16), "located=" + n.includes(q), "words=" + q.split(" ").filter(Boolean).length);
}
