# NXTQR QR Brain Architecture

Deterministic Conditional Destination Selection & Intelligent Routing Engine.

---

## 1. Core Principles

- **Zero Dynamic Eval**: Zero `eval()`, zero `new Function()`, zero arbitrary customer JavaScript.
- **Single Portable Evaluator**: The exact same pure evaluator (`@nxtqr/contracts/evaluator.ts`) runs inside:
  1. Cloudflare Edge Redirect Worker (Data Plane)
  2. Next.js QR Brain Route Simulator (Control Plane)
  3. Automated Unit and Parity Test Suites
- **Unknown Context is Never Guessed**: If a condition requires a dimension (e.g. region) that is absent or unknown in the request, the condition evaluates to `false`.
- **Publish Intelligence, Not Complexity**: Expensive validation, conflict detection, entitlement checking, and rule compilation happen at publication time on the control plane. Scan-time execution is purely linear evaluation.

---

## 2. Evaluation Pipeline Precedence

Every scan resolves through this exact authoritative pipeline:

```
01. LIFECYCLE GATE
    Verify status is ACTIVE and current time is within [startsAt, expiresAt].
           │
           ▼
02. GUARDIAN HEALTH STATE
    If destination health is UNHEALTHY and valid approved fallback exists:
    route immediately to fallback destination.
           │
           ▼
03. ORDERED ROUTING RULES
    Evaluate rules in order: priority ASC + stable rule ID tie-breaker.
    First matching rule selects candidate destination.
           │
           ▼
04. EXPERIMENT ASSIGNMENT
    If no rule matched and an active experiment exists:
    evaluate weighted variant distribution (integer basis points out of 10000).
           │
           ▼
05. DEFAULT DESTINATION
    If no rule matched and no experiment assigned:
    route to published default destination.
           │
           ▼
06. SCHEME DEFENSE
    Verify target destination begins with http: or https:.
```

---

## 3. Condition Registry & Separated Device / OS Dimensions

To ensure rules remain composable and avoid blending hardware form factors with operating systems, `device` and `os` are modeled as separate conditions:

| Dimension | Type Code | Supported Operators | Allowed Values / Format |
| :--- | :--- | :--- | :--- |
| **Form Factor** | `device` | `eq`, `neq`, `in`, `nin` | `mobile`, `desktop`, `tablet`, `other` |
| **Operating System** | `os` | `eq`, `neq`, `in`, `nin` | `ios`, `android`, `windows`, `macos`, `linux`, `other` |
| **Browser Family** | `browser` | `eq`, `neq`, `in`, `nin` | `safari`, `chrome`, `firefox`, `edge`, `samsung_internet`, `other` |
| **Language** | `language` | `eq`, `neq`, `starts_with` | `en`, `en-us`, `hi`, `hi-in`, `te`, `de`, etc. |
| **Country** | `country` | `eq`, `neq`, `in`, `nin` | ISO 3166-1 alpha-2 uppercase (`IN`, `US`, `GB`, `DE`) |
| **Region** | `region` | `eq`, `neq`, `in`, `nin` | Sub-national codes (`CA`, `NY`, `MH`, `KA`) |
| **Time Window** | `time_window` | `between` | `["HH:MM", "HH:MM"]` (supports overnight wrap e.g. `["22:00", "06:00"]`) |
| **Weekday** | `weekday` | `eq`, `neq`, `in`, `nin` | `monday` through `sunday` |
| **Date Range** | `date_range` | `between` | `["YYYY-MM-DD", "YYYY-MM-DD"]` |
| **Query Parameter**| `query_param`| `exists`, `eq` | Bounded parameter name and expected value |

### Composable Examples:
- **Apple App Store Routing**:
  `IF device = mobile AND os = ios THEN https://apps.apple.com/...`
- **Google Play Store Routing**:
  `IF device = mobile AND os = android THEN https://play.google.com/...`
- **Desktop Landing Page**:
  `IF device = desktop THEN https://brand.com/desktop-experience`

---

## 4. Overnight Time Range Windows

When a time window condition specifies `between: ["22:00", "06:00"]`:
- `start` (`"22:00"`) is greater than `end` (`"06:00"`).
- The evaluator detects the midnight crossing and matches if:
  `currentTime >= start || currentTime <= end`.
- Evaluation uses timezone precedence:
  `rule.timezone ?? snapshot.routing?.timezone ?? snapshot.schedule?.timezone ?? "UTC"`.

---

## 5. Pre-Publication Conflict Detection

Before publishing any policy to KV, the control plane validates:
1. **Safety Bounds**: Max 50 rules, max 10 conditions per rule, serialized snapshot $\le$ 64KB.
2. **Duplicate Priority**: Emits warning if two rules share the same priority integer.
3. **Empty Conditions**: Rules with 0 conditions match everything and render subsequent rules unreachable.
4. **Destination Ownership & Safety**: Rejects destinations with unsafe schemes (`javascript:`, `data:`, `file:`) or unapproved external domains.
