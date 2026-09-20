# NXTQR API Error Model

All non-2xx HTTP responses from the NXTQR Developer API conform to a single, standardized, machine-readable envelope.

---

## Error Response Envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid or malformed fields.",
    "requestId": "req_84f9382b6189e471",
    "details": [
      {
        "field": "destinationUrl",
        "code": "invalid_string",
        "message": "destinationUrl must be a valid URL"
      }
    ]
  }
}
```

Every response includes an `X-Request-Id` header matching the `requestId` field in the payload. Provide this ID when contacting support.

---

## HTTP Status Code Mapping

| Status Code | Semantics |
| :--- | :--- |
| `200 OK` | Successful query or update operation. |
| `201 Created` | Successful resource creation. |
| `202 Accepted` | Asynchronous job submitted and queued (e.g. heavy reports). |
| `204 No Content` | Successful operation with no return payload (e.g. resource deletion). |
| `400 Bad Request` | Malformed JSON or invalid syntax. |
| `401 Unauthorized` | Missing, invalid, expired, or revoked API key. |
| `402 Payment Required` | Plan quota or commercial entitlement limit exceeded. |
| `403 Forbidden` | Authenticated principal lacks required API scope or RBAC permission. |
| `404 Not Found` | Resource does not exist or belongs to another tenant (safe 404). |
| `409 Conflict` | Optimistic revision conflict or duplicate idempotency key with different payload. |
| `422 Unprocessable` | Semantic validation failed. |
| `429 Too Many Requests` | Rate limit exceeded. |
| `500 Internal Server Error` | Unexpected server error. Internal stack traces are never leaked. |

---

## Standard Error Codes

| Error Code | Description |
| :--- | :--- |
| `AUTHENTICATION_REQUIRED` | Missing `Authorization: Bearer <key>` header. |
| `INVALID_API_KEY` | Provided API key does not exist or has mismatched hash. |
| `EXPIRED_API_KEY` | API key has exceeded its validity period. |
| `REVOKED_API_KEY` | API key was revoked by an administrator. |
| `INSUFFICIENT_SCOPE` | Key lacks the required API scope (e.g. missing `qrs:write`). |
| `FORBIDDEN` | Tenant account is suspended or permission denied. |
| `RESOURCE_NOT_FOUND` | The requested resource ID was not found in the tenant context. |
| `QR_NOT_FOUND` | Target QR code was not found. |
| `RESOURCE_CONFLICT` | A resource state conflict occurred. |
| `STALE_REVISION` | Provided `expectedVersion` does not match the active server revision. |
| `IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD` | The same `Idempotency-Key` was submitted with altered request parameters. |
| `IDEMPOTENT_REQUEST_IN_PROGRESS` | A mutation request with this key is currently being processed. |
| `ENTITLEMENT_LIMIT_EXCEEDED` | Account has reached the maximum allowed assets under its billing tier. |
| `VALIDATION_ERROR` | Request parameters failed runtime schema validation. |
| `SECURITY_POLICY_VIOLATION` | Destination URL scheme or content violated security guidelines. |
| `SSRF_BLOCKED` | Webhook URL targets private IP ranges, loopback, or cloud instance metadata. |
