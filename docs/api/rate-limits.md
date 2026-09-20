# NXTQR API Rate Limiting

To maintain platform stability, prevent abuse, and protect upstream edge data stores, all API requests are subject to tiered rate limits.

---

## Rate Limit Headers

Every HTTP API response contains standard rate-limiting headers:

| Header | Description |
| :--- | :--- |
| `X-RateLimit-Limit` | Total number of requests allowed in the current time window. |
| `X-RateLimit-Remaining` | Number of requests remaining in the current window. |
| `X-RateLimit-Reset` | Unix timestamp (in seconds) when the current rate-limit bucket resets. |
| `Retry-After` | (Only on HTTP 429) Number of seconds to wait before retrying. |

---

## Tier Thresholds

| Plan Tier | API Limit (Per Minute) | Burst Allowance | Concurrent Heavy Reports |
| :--- | :--- | :--- | :--- |
| **Free** | 60 req/min | 10 | 1 |
| **Pro** | 600 req/min | 50 | 5 |
| **Enterprise** | 3,000 req/min | 200 | 20 |

---

## Rate Limit Exceeded (HTTP 429)

When your application exceeds its allocated quota, the server returns HTTP `429 Too Many Requests`:

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please wait 15 seconds before retrying.",
    "requestId": "req_782910fa",
    "details": [
      {
        "field": "rateLimit",
        "code": "quota_exceeded",
        "message": "Retry-After: 15"
      }
    ]
  }
}
```
