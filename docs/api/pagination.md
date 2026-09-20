# NXTQR API Pagination & Cursors

All list and collection endpoints in the NXTQR API use **keyset cursor pagination** to provide stable performance over large datasets.

Deep SQL `OFFSET` queries are disabled to prevent query latency degradation.

---

## Query Parameters

| Parameter | Type | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `cursor` | `string` | — | Opaque string | Base64URL-encoded cursor pointing to the last item of the previous page. |
| `limit` | `integer` | `20` | `1 <= limit <= 100` | Number of items to return in the current page. |

---

## Response Envelope

Collection endpoints return a `data` array and a `page` metadata block:

```json
{
  "data": [
    {
      "id": "qr_01h8x9p3...",
      "name": "Summer Festival Banner",
      "slug": "summer-fest"
    }
  ],
  "page": {
    "nextCursor": "eyJpZCI6InFyXzAxLi4ifQ",
    "hasMore": true,
    "totalCount": 142
  },
  "meta": {
    "requestId": "req_a1b2c3d4",
    "timestamp": "2026-09-17T12:00:00.000Z"
  }
}
```

---

## Traversal Pattern

1. Make the initial request without a `cursor` parameter:
   ```http
   GET /api/v1/qrs?limit=20
   ```
2. If `page.hasMore` is `true`, retrieve `page.nextCursor`.
3. Pass `nextCursor` as the `cursor` query parameter in the subsequent request:
   ```http
   GET /api/v1/qrs?limit=20&cursor=eyJpZCI6InFyXzAxLi4ifQ
   ```
4. Repeat until `page.hasMore` is `false` or `page.nextCursor` is `null`.
