<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CRITICAL — NXTQR DOMAIN / URL RULE

This requirement is **NON-NEGOTIABLE**.

## DO NOT USE `nxtqr.link`

The NXTQR application currently uses:

`https://nxtqr.vercel.app`

as the official/default NXTQR application and QR URL base where applicable.

### STRICTLY FORBIDDEN

Do NOT use, generate, reference, seed, display, document, or fall back to:

`nxtqr.link`

or:

`https://nxtqr.link`

ANYWHERE in the project.

This applies to:

- frontend UI
- backend code
- database seed data
- database migrations
- Supabase functions
- API responses
- QR generation
- dynamic QR URLs
- QR resolver URLs
- QR previews
- QR Studio
- QR Brain
- routing simulator
- routing snapshots
- campaigns
- folders
- landing pages
- files
- analytics
- experiments
- scanability
- Guardian
- Brand Kits
- Domains
- share links
- metadata
- Open Graph data
- structured data
- emails
- notifications
- webhook payloads
- reports
- CSV/PDF exports
- tests
- fixtures
- examples
- documentation
- environment examples
- placeholder values
- empty states
- error states
- fallback values
- hardcoded constants

---

# CURRENT NXTQR BASE URL

Use:

```text
https://nxtqr.vercel.app
```

When a dynamic QR needs an NXTQR-hosted URL, use the project's actual current resolver route under:

```text
https://nxtqr.vercel.app
```

For example, if the existing resolver contract is:

```text
/s/{slug}
```

then:

```text
https://nxtqr.vercel.app/s/{slug}
```

is valid.

If the existing codebase uses another resolver pathname, preserve that real route.

DO NOT invent a new pathname merely from this example.

---

# DO NOT INVENT A SHORT DOMAIN

Until NXTQR has a verified and production-configured dedicated short domain:

DO NOT invent:

nxtqr.link
nxtqr.to
nxt.qr
nxtqr.io
go.nxtqr.*
qr.nxtqr.*
link.nxtqr.*
scan.nxtqr.*

or any other fake NXTQR short domain.

The current source of truth is:

```text
https://nxtqr.vercel.app
```

---

# CENTRALIZE THE URL CONFIGURATION

Do NOT scatter:

```ts
"https://nxtqr.vercel.app"
```

through hundreds of components.

Audit the existing configuration architecture and create/reuse ONE server-authoritative configuration source.

For example:

```ts
export const siteConfig = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://nxtqr.vercel.app",
};
```

However, follow the existing NXTQR configuration conventions.

The production environment must explicitly configure:

```env
NEXT_PUBLIC_APP_URL=https://nxtqr.vercel.app
```

If a separate resolver URL configuration already exists, use it.

For example:

```env
NEXT_PUBLIC_APP_URL=https://nxtqr.vercel.app
QR_RESOLVER_BASE_URL=https://nxtqr.vercel.app
```

Do NOT introduce unnecessary duplicate variables if the existing architecture already has a canonical configuration.

---

# QR URL GENERATION

Never construct QR URLs independently inside random React components.

BAD:

```ts
const qrUrl = `https://nxtqr.link/${slug}`;
```

BAD:

```ts
const qrUrl = "https://nxtqr.link/" + slug;
```

BAD:

```ts
const qrUrl = `https://nxtqr.vercel.app/${slug}`;
```

if that bypasses the actual resolver route contract.

Instead create/reuse a centralized URL builder.

Conceptually:

```ts
buildQrResolverUrl({
  baseUrl,
  slug,
});
```

The function must respect the actual resolver pathname used by NXTQR.

For example, only if `/s/:slug` is the real contract:

```ts
buildQrResolverUrl("new-qr-asset-a82f")
```

returns:

```text
https://nxtqr.vercel.app/s/new-qr-asset-a82f
```

---

# CUSTOM DOMAINS ARE DIFFERENT

Do NOT confuse the default NXTQR URL with organization-owned custom domains.

For a QR without a custom domain:

```text
https://nxtqr.vercel.app/<actual-resolver-path>
```

For a QR explicitly published under a verified organization custom domain:

```text
https://qr.customer-domain.com/<actual-resolver-path>
```

ONLY after that domain is:

* owned by the organization
* verified
* active
* authorized
* routing-ready
* valid for that QR/resource

Never automatically substitute an unverified custom domain.

---

# PRINTED QR IDENTITY STABILITY

This is extremely important.

A published/printed QR must retain the resolver identity it was published with.

Do NOT automatically rewrite an existing QR from:

```text
https://nxtqr.vercel.app/...
```

to a newly connected custom domain.

Likewise, changing the organization's primary custom domain must not silently invalidate already printed QR codes.

Any migration must be an explicit, safe workflow.

---

# REPOSITORY-WIDE LEGACY DOMAIN AUDIT

Before completing the implementation, search the ENTIRE repository for:

```text
nxtqr.link
https://nxtqr.link
http://nxtqr.link
nxtqr.to
qora.to
qora.io
NYTRA
QORA
```

Also search for suspicious URL constants:

```text
SHORT_DOMAIN
SHORT_URL
QR_BASE_URL
QR_DOMAIN
RESOLVER_URL
RESOLVER_BASE_URL
PUBLIC_URL
APP_URL
SITE_URL
BASE_URL
```

Inspect:

```text
apps/
packages/
supabase/
migrations/
public/
tests/
docs/
scripts/
.env.example
wrangler files
Next.js config
metadata
manifest
sitemap
OpenGraph generation
emails
webhooks
report templates
```

Remove obsolete fake/legacy URL assumptions.

Do NOT blindly replace a domain inside historical database migrations if modifying an already-applied migration would break migration integrity.

For existing persisted production records, create a safe migration/backfill strategy where required.

---

# NO FAKE FALLBACK DOMAIN

STRICTLY DO NOT write:

```ts
const baseUrl =
  process.env.QR_DOMAIN ||
  "https://nxtqr.link";
```

Also do not silently fall back to another invented domain.

The configured production default is:

```text
https://nxtqr.vercel.app
```

If a required server-side configuration is missing in an environment where it must be explicit, fail safely instead of silently inventing a hostname.

---

# UI REQUIREMENT

Every place showing the current NXTQR QR identity must use the real configured URL.

Examples include:

* QR Codes page
* QR details
* QR Studio
* Dynamic QR page
* QR Brain
* Routes
* routing simulator
* Campaign details
* Landing Pages
* Domain impact previews
* Scanability
* download/export dialogs
* share dialogs
* QR previews

Never visually show:

```text
nxtqr.link/abc123
```

when the actual QR resolves through:

```text
nxtqr.vercel.app
```

---

# DOMAIN PAGE REQUIREMENT

On the **Brand → Domains** page, make the distinction explicit:

### NXTQR Default Domain

```text
nxtqr.vercel.app
```

This is the current NXTQR-managed default.

### Custom Domains

These are organization-owned verified domains such as:

```text
qr.customer-domain.com
```

Do NOT list `nxtqr.vercel.app` as if it were owned by the customer.

Do NOT allow users to delete, verify, archive, or disconnect the NXTQR-managed default domain.

It is platform infrastructure.

---

# DATABASE RULE

Do not store `nxtqr.link` in new records.

For new QR records, store stable identifiers and domain references according to the schema rather than unnecessarily duplicating the entire generated URL.

Prefer concepts such as:

```text
qr_id
slug
domain_id
published_revision_id
```

and derive the resolver URL from authoritative configuration/domain assignment.

Do not redesign an existing correct schema solely to match this example.

---

# TEST REQUIREMENT

Add a repository regression test or equivalent guard that ensures the production application does not accidentally reintroduce:

```text
nxtqr.link
```

At minimum, verify all relevant URL-builder tests expect:

```text
https://nxtqr.vercel.app
```

for the default NXTQR-managed domain.

Test:

DEFAULT DOMAIN
→ nxtqr.vercel.app

CUSTOM VERIFIED DOMAIN
→ customer's verified domain

CUSTOM UNVERIFIED DOMAIN
→ must NOT become active resolver domain

MISSING DOMAIN CONFIG
→ safe deterministic behavior

EXISTING PUBLISHED QR
→ resolver identity remains stable

PRIMARY DOMAIN CHANGE
→ existing printed QR is not silently rewritten

---

# FINAL DOMAIN INVARIANT

Throughout the implementation remember:

DEFAULT NXTQR DOMAIN
│
▼
nxtqr.vercel.app
│
▼
QR RESOLVER
│
▼
QR BRAIN
│
▼
DESTINATION

and, only when explicitly configured:

VERIFIED CUSTOMER DOMAIN
│
▼
HOST + SLUG NAMESPACE
│
▼
QR RESOLVER
│
▼
QR BRAIN
│
▼
DESTINATION

## ABSOLUTE RULE

`nxtqr.link` MUST NOT EXIST IN THE ACTIVE NXTQR IMPLEMENTATION.

Use the configured:

`nxtqr.vercel.app`

until the product is intentionally migrated to another verified production domain.

---

# NXTQR — STRICT CLOUDFLARE-ONLY INFRASTRUCTURE RULE
> **HIGHEST PRIORITY — DO NOT VIOLATE**  
> NXTQR MUST USE ONLY THE APPROVED CLOUDFLARE INFRASTRUCTURE FOR PERSISTENT BUSINESS DATA, OBJECTS, SERVER CACHE, ASYNC WORK, COORDINATION, AND TELEMETRY.  
> NO BROWSER PERSISTENCE, NO APPLICATION-LEVEL LOCAL CACHE, NO LOCAL SQLITE, AND NO FALLBACK STORAGE.

---

## IMPORTANT ARCHITECTURAL CLARIFICATIONS

1. **Cloudflare KV is the ONLY Approved Application Cache**:
   - Cloudflare KV is an approved distributed cache / published edge snapshot provider for NXTQR (e.g. published QR resolver snapshots, fast lookups).
   - "Don't use cache" strictly means: **NO local / browser / filesystem / application-memory persistence cache**.
   - Do NOT remove KV. Redirect workers still use KV for resolver snapshots, while D1 remains the authoritative relational source of truth.

2. **D1 Development Tooling vs Forbidden Application Databases**:
   - Cloudflare D1 uses SQLite-compatible semantics.
   - Cloudflare-supported development tooling required to interface with D1 (such as `.wrangler/state/v3/d1`, `@cloudflare/miniflare`, and `wrangler d1 execute`) is valid development infrastructure and must not be deleted.
   - Application code must NEVER introduce its own `app.db`, `database.sqlite`, `better-sqlite3`, browser SQLite, or mock JSON files as fallback or secondary databases.
   - One architecture: `Repository -> Cloudflare D1 binding`.

3. **QR Studio Clean Data Flow**:
   - **React Memory**: Immediate, fluid UI editing state (in-memory canvas, active tab, color picker, live preview). Temporary React memory is allowed only while the page is open.
   - **Debounced Server Autosave**: Debounced mutation commands -> Auth/Org validation -> **Cloudflare D1** (`qr_drafts`, `qr_versions`).
   - **Assets & Logos**: Upload validation -> **Cloudflare R2** bytes + **Cloudflare D1** metadata record (`r2_assets`).
   - **Scanability Engine**: Runs purely in-memory on the client for live designer feedback; recomputed server-side upon **Publish** or **Export** from authoritative Cloudflare-backed state.

---

```text
======================================================================
NXTQR — STRICT CLOUDFLARE-ONLY INFRASTRUCTURE RULE
HIGHEST PRIORITY — DO NOT VIOLATE
======================================================================

STOP AND READ THIS BEFORE IMPLEMENTING ANY NXTQR FEATURE.

NXTQR MUST USE ONLY THE APPROVED CLOUDFLARE INFRASTRUCTURE FOR
PERSISTENT BUSINESS DATA, OBJECTS, SERVER CACHE, ASYNC WORK,
COORDINATION, AND TELEMETRY.

DO NOT CREATE A SECOND LOCAL STORAGE ARCHITECTURE.

THIS REQUIREMENT OVERRIDES ANY CONVENIENCE IMPLEMENTATION.


======================================================================
1. ABSOLUTELY FORBIDDEN
======================================================================

DO NOT USE:

localStorage
window.localStorage

sessionStorage
window.sessionStorage

IndexedDB
indexedDB

Dexie

browser SQLite
SQLite WASM
sql.js
wa-sqlite
PGlite

local SQLite
sqlite3
better-sqlite3

database.sqlite
database.db
local.db
app.db
nxtqr.db

JSON files as application database

filesystem persistence

local filesystem uploads

local filesystem exports

local filesystem cache

Next.js filesystem persistence

Vercel filesystem persistence

in-memory database as production storage

mock database

fake database

demo database

fallback database

fallback JSON

fallback QR data

fallback user data

fallback organization data

fallback billing data

fallback analytics data

fallback Studio data.


======================================================================
2. DO NOT USE APPLICATION-LEVEL LOCAL CACHE
======================================================================

The agent must NOT introduce a separate local application cache such as:

localStorage cache
sessionStorage cache
IndexedDB cache
SQLite cache
filesystem cache
JSON cache
Map used as durable cache
global process memory used as durable cache
browser persistence cache
custom disk cache.


If NXTQR requires an application cache, use:

CLOUDFLARE KV

ONLY where KV is architecturally appropriate.


IMPORTANT:

Do not confuse normal browser/network/runtime caching mechanisms with
NXTQR application persistence.

The rule is:

DO NOT BUILD NXTQR BUSINESS-DATA CACHING OR PERSISTENCE USING LOCAL
CLIENT/SERVER STORAGE.


======================================================================
3. ONLY APPROVED DATA PLATFORM
======================================================================

NXTQR persistence architecture:

CLOUDFLARE D1
=
AUTHORITATIVE RELATIONAL BUSINESS DATA


CLOUDFLARE R2
=
PERSISTENT FILE / OBJECT / BINARY STORAGE


CLOUDFLARE KV
=
APPROVED DISTRIBUTED CACHE / PUBLISHED EDGE SNAPSHOTS ONLY


CLOUDFLARE QUEUES
=
DURABLE ASYNCHRONOUS WORK DELIVERY


CLOUDFLARE DURABLE OBJECTS
=
COORDINATION / PRESENCE / COORDINATED EPHEMERAL STATE


CLOUDFLARE ANALYTICS ENGINE
=
HIGH-VOLUME TELEMETRY WHERE THE NXTQR ARCHITECTURE ASSIGNS IT


CLOUDFLARE WORKERS
=
EDGE RUNTIMES / REDIRECT / CONSUMERS / SCHEDULED PROCESSING


NO ALTERNATIVE APPLICATION STORAGE SYSTEM.


======================================================================
4. D1 IS THE ONLY RELATIONAL APPLICATION DATABASE
======================================================================

All persistent relational business state must use Cloudflare D1.

Examples:

users
auth identities

organizations
memberships
teams
team members
roles
permissions
invitations

QR codes
QR drafts
QR versions
QR content
QR metadata
destinations
routing rules

campaigns
folders
tags

comments
approvals
activity events
audit logs

brand kits
asset metadata

custom domains

subscriptions
payments
payment events
entitlements
usage counters

API keys
webhooks
share links

report metadata

Guardian configuration
incidents

and other relational NXTQR business state.


DO NOT create another database for any of these.


======================================================================
5. IMPORTANT D1 DISTINCTION
======================================================================

Cloudflare D1 uses SQLite-compatible database technology/SQL semantics.

THIS DOES NOT AUTHORIZE THE APPLICATION TO CREATE ITS OWN LOCAL SQLITE
DATABASE.

Allowed:

Cloudflare D1 binding
Cloudflare-supported development tooling required to work with D1


Forbidden application architecture:

better-sqlite3
sqlite3
new Database("./app.db")
database.sqlite
local.db
browser SQLite
SQLite fallback repository.


The production application architecture must remain:

Repository
    ↓
Cloudflare D1.


======================================================================
6. QR STUDIO — STRICT PERSISTENCE FLOW
======================================================================

QR Studio MUST NOT save drafts into localStorage.

Forbidden:

localStorage.setItem("draft", ...)
localStorage.setItem("qr", ...)
localStorage.setItem("qr-design", ...)
localStorage.setItem("qr-content", ...)
localStorage.setItem("qr-settings", ...)


Correct architecture:

USER EDITS QR
      ↓
TEMPORARY REACT MEMORY
      ↓
LIVE QR PREVIEW
      ↓
LOCAL PURE SCANABILITY CALCULATION
      ↓
DEBOUNCED SERVER AUTOSAVE
      ↓
AUTHENTICATION
      ↓
ORGANIZATION MEMBERSHIP
      ↓
PERMISSION
      ↓
ENTITLEMENT / POLICY
      ↓
VALIDATION
      ↓
CLOUDFLARE D1
      ↓
SAVED DRAFT


The browser is NOT the database.


======================================================================
7. TEMPORARY REACT MEMORY IS NOT STORAGE
======================================================================

The following is allowed:

useState
useReducer
React Hook Form
temporary component state
current input value
current selected tab
open Dialog state
open Sheet state
hover state
drag state
temporary QR editor changes
temporary scanability result.


Example:

const [draft, setDraft] = useState(...);


This is allowed ONLY as current-page runtime state.

It must NOT be treated as durable persistence.


If the user expects the data to survive:

reload
tab close
browser restart
different device
different session

then it must be persisted through the Cloudflare-backed server
architecture.


======================================================================
8. AUTOSAVE MUST CONNECT TO CLOUDFLARE
======================================================================

Implement REAL autosave.

Not:

React state → localStorage.


Use:

React state
   ↓
debounce
   ↓
server command/API
   ↓
server authorization
   ↓
validation
   ↓
Cloudflare D1.


Autosave UI states should represent REAL server state:

Unsaved

Saving…

Saved

Save failed

Offline


Do NOT display:

Saved

until the Cloudflare-backed save operation actually succeeds.


======================================================================
9. CONNECTION FAILURE
======================================================================

If Cloudflare/server connection fails:

DO NOT silently save into:

localStorage
IndexedDB
SQLite
JSON
filesystem
fake repository.


Correct:

SAVE REQUEST
     ↓
CONNECTION FAILURE
     ↓
KEEP CURRENT EDIT TEMPORARILY IN MEMORY
     ↓
SHOW:
"Unable to save"
     ↓
ALLOW RETRY.


Do not claim the edit is safely persisted.


======================================================================
10. RELOAD BEHAVIOR
======================================================================

When QR Studio opens:

DO NOT:

check localStorage first.


Correct:

Studio
   ↓
server
   ↓
authenticate
   ↓
organization
   ↓
permission
   ↓
D1
   ↓
load authoritative QR draft/version
   ↓
initialize editor state.


D1 is the source of truth.


======================================================================
11. FILES AND LOGOS
======================================================================

Persistent uploaded objects MUST use Cloudflare R2.

Examples:

QR logos
PDFs
uploaded files
brand assets
generated reports
persistent exports
template binary assets.


Architecture:

UPLOAD
   ↓
SERVER AUTHORIZATION
   ↓
TYPE/SIZE VALIDATION
   ↓
GENERATE SAFE OBJECT KEY
   ↓
CLOUDFLARE R2
   ↓
CLOUDFLARE D1 METADATA.


DO NOT use:

public/uploads
/uploads
/tmp as persistent storage
server filesystem
Vercel filesystem
local filesystem.


======================================================================
12. R2 IS BYTES — D1 IS METADATA
======================================================================

Example:

D1:

asset_id
organization_id
object_key
mime_type
size
created_by
created_at
status


R2:

actual file bytes.


Do not treat R2 object listings as relational business data.


======================================================================
13. CLOUDFLARE KV — ONLY APPROVED APPLICATION CACHE
======================================================================

If NXTQR requires distributed application caching, use Cloudflare KV
only for approved cache/snapshot use cases.

Examples:

published QR resolver snapshot
hot redirect lookup
safe public configuration
appropriate entitlement cache.


KV IS NOT RELATIONAL AUTHORITY.


Correct:

D1
 ↓
authoritative commit
 ↓
KV publication/cache.


Not:

KV
 ↓
business authority.


If KV disappears, authoritative business data must still exist in D1.


======================================================================
14. NO BROWSER CACHE FOR BUSINESS DATA
======================================================================

DO NOT implement custom browser caching for:

organizations
members
roles
permissions
QRs
drafts
versions
campaigns
routes
experiments
analytics
billing
entitlements
API keys
webhooks
files
reports
Guardian state.


Load these from the Cloudflare-backed application architecture.


======================================================================
15. SERVER DATA FETCHING
======================================================================

Do not create hidden local fallback data.

Conceptually:

const data = await repository.find(...);

if (!data) {
   return DEMO_DATA;
}


FORBIDDEN.


Correct:

No database record
      ↓
REAL EMPTY RESULT
      ↓
NXTQR EMPTY STATE.


Example:

D1 returns zero QR codes.

UI:

No QR codes yet.

[Create QR]


NOT:

show six example QR codes.


======================================================================
16. EMPTY STATE RULE
======================================================================

NO DATA IN CLOUDFLARE
=
EMPTY STATE.


NOT:

NO DATA
=
DEMO DATA.


NOT:

NO DATA
=
FALLBACK DATA.


NOT:

NO DATA
=
LOCALSTORAGE.


NOT:

NO DATA
=
LOCAL SQLITE.


This applies across the entire authenticated NXTQR application.


======================================================================
17. QR TYPE CATALOG IS CONFIGURATION
======================================================================

Built-in QR type definitions such as:

Website
Wi-Fi
Instagram
YouTube
PDF
vCard
UPI

may exist as typed source-code product configuration.

That is NOT user/business data.


Likewise Iconify IDs may live in source configuration.


Example:

instagram:
  icon: "simple-icons:instagram"


This does not need D1.


But actual user-created Instagram QR:

content
design
draft
version
destination
publication state

must use Cloudflare-backed persistence.


======================================================================
18. ICONIFY DOES NOT REQUIRE LOCAL STORAGE
======================================================================

Use Iconify for the QR type icons.

Do not create a localStorage icon cache.

Do not create IndexedDB icon storage.

Do not create SQLite icon storage.


Product-controlled Iconify mappings live in source code.


Customer-uploaded icons/logos:

R2 + D1 metadata.


======================================================================
19. SCANABILITY
======================================================================

Scanability calculations may execute locally because they are pure
computation.

Example:

current React QR state
     ↓
evaluateScanability()
     ↓
temporary result
     ↓
render diagnostics.


DO NOT persist live scanability into localStorage.


Before:

PUBLISH
EXPORT

server recomputes scanability using authoritative data.


======================================================================
20. QR VERSIONING
======================================================================

Draft:

D1.


Immutable versions:

D1.


Published revision:

D1.


Resolver snapshot:

KV where appropriate.


Assets:

R2.


No local version history.


No localStorage undo history used as durable version history.


Temporary editor undo/redo may exist in React memory while the editor is
open.


======================================================================
21. ROUTING
======================================================================

Production redirect architecture:

SCAN
 ↓
CLOUDFLARE WORKER
 ↓
CLOUDFLARE KV RESOLVER SNAPSHOT
 ↓
CACHE MISS
 ↓
CLOUDFLARE D1
 ↓
NXTQR ROUTING ENGINE
 ↓
DESTINATION
 ↓
CLOUDFLARE QUEUE — TELEMETRY
 ↓
REDIRECT.


NO local database.

NO filesystem cache.

NO browser storage.


======================================================================
22. ANALYTICS
======================================================================

Use the established Cloudflare analytics architecture.

High-volume scan telemetry:

Cloudflare Queue
        ↓
event worker
        ↓
Analytics Engine / approved aggregate pipeline.


D1 stores appropriate relational analytics configuration/control records.


DO NOT:

store scan analytics in localStorage
store scan analytics in local SQLite
store raw scan firehose in JSON files.


======================================================================
23. COLLABORATION
======================================================================

Durable collaboration data:

D1.


Examples:

saved revision
comment
approval.


Live coordination/presence:

Cloudflare Durable Objects where implemented.


DO NOT use browser storage as collaboration authority.


======================================================================
24. BILLING
======================================================================

Cashfree
   ↓
verified server webhook
   ↓
D1
   ↓
NXTQR entitlement service.


Never:

Cashfree success
 ↓
localStorage.setItem("plan", "pro").


Never authorize premium features from browser state.


======================================================================
25. AUTHORIZATION
======================================================================

Permissions must come from authoritative server-side Cloudflare-backed
data.


Do not store an authoritative permission list in localStorage.


Browser permission data may only be a non-authoritative UX projection.


Every server command still evaluates authorization.


======================================================================
26. MEMBERS / TEAMS / ROLES
======================================================================

Organizations
members
teams
roles
permissions
invitations

must use D1.


If D1 returns no members beyond the current owner:

show the real state.


Do not inject fake members.


If no teams:

show Teams empty state.


If no custom roles:

show actual applicable system roles / legitimate empty custom-role state.


======================================================================
27. API KEYS
======================================================================

API key metadata/hash:

D1.


Plain secret:

show once according to secure architecture.


Never persist plaintext API key in:

localStorage
sessionStorage
IndexedDB
SQLite.


======================================================================
28. WEBHOOKS
======================================================================

Webhook configuration:

D1.


Webhook delivery jobs:

Cloudflare Queues.


Do not build:

local webhook queue
JSON retry queue
filesystem retry queue
in-memory production retry queue.


======================================================================
29. REPORTS
======================================================================

Report metadata:

D1.


Generated report:

R2.


Generation:

Cloudflare Queue / worker pipeline.


No local report filesystem.


======================================================================
30. GUARDIAN
======================================================================

Guardian configuration/state:

appropriate Cloudflare-backed architecture.


Checks/jobs:

Cloudflare Queue / Workers as designed.


Compact published health signal:

KV where required by redirect architecture.


No local Guardian cache/database.


======================================================================
31. NO LOCAL FALLBACK
======================================================================

ABSOLUTELY FORBIDDEN:

try {
   return await D1...
} catch {
   return localStorage...
}


Forbidden:

D1 failure
→ local SQLite

D1 failure
→ JSON

D1 failure
→ mock data

D1 failure
→ demo data

D1 failure
→ fake empty success.


Correct:

D1 failure
→ typed server error
→ professional UI error state
→ retry/recovery.


======================================================================
32. NO FAKE SUCCESS
======================================================================

If Cloudflare write fails:

DO NOT toast:

"Saved successfully"


If upload fails:

DO NOT show file as uploaded.


If invitation creation fails:

DO NOT add fake member locally.


If QR creation fails:

DO NOT insert fake QR locally.


If publish fails:

DO NOT mark it published in React as authority.


Server success must precede authoritative success UI.


======================================================================
33. SHADCN UI STATES
======================================================================

Use shadcn/ui for professional real states:

Skeleton
→ actual loading

Alert
→ data/service issue

Button
→ retry

AlertDialog
→ destructive confirmation

Dialog
→ create/edit

Sheet / Drawer
→ mobile interaction

Sonner/toast
→ REAL operation result.


Toast examples:

REAL D1 SAVE SUCCESS
→ "Draft saved"

REAL D1 FAILURE
→ "Could not save draft"

REAL R2 UPLOAD SUCCESS
→ "Logo uploaded"

REAL R2 FAILURE
→ "Logo upload failed"


Never toast fake success based only on local state.


======================================================================
34. REPOSITORY-WIDE AUDIT — REQUIRED
======================================================================

BEFORE implementing the feature, search the ENTIRE repository for:

localStorage
window.localStorage

sessionStorage
window.sessionStorage

indexedDB
IndexedDB
Dexie

sqlite
sqlite3
better-sqlite3
sql.js
wa-sqlite
PGlite

.sqlite
.db
database.sqlite
local.db
app.db

fs.writeFile
fs.writeFileSync
fs.readFile
fs.readFileSync

/uploads
public/uploads

mockData
mock-data
dummyData
dummy-data
demoData
demo-data
fallbackData
fallback-data
fixtures
faker

memoryCache
localCache
diskCache


Do not blindly delete build/test/Cloudflare tooling.

Classify every result.


======================================================================
35. REQUIRED AUDIT CLASSIFICATION
======================================================================

For every relevant match return:

FILE
LINE / SYMBOL
CURRENT PURPOSE
BUSINESS DATA?
PRODUCTION PATH?
ACTION


Allowed actions:

REMOVE

MIGRATE_TO_D1

MIGRATE_TO_R2

MIGRATE_TO_KV

MIGRATE_TO_QUEUE

MIGRATE_TO_DURABLE_OBJECT

MIGRATE_TO_ANALYTICS_ENGINE

KEEP_TEMPORARY_UI_STATE

KEEP_TEST_ONLY

KEEP_CLOUDFLARE_TOOLING.


Anything production-facing that stores NXTQR business data locally must
be removed/migrated.


======================================================================
36. CLOUDFLARE CONNECTION VERIFICATION
======================================================================

Do not merely rename a local repository to "CloudflareRepository".

Verify actual bindings.

Verify:

D1 binding
KV binding
R2 bindings
Queue bindings
Durable Object binding where used
Analytics Engine binding where used.


Trace each feature from:

UI
 ↓
server command/API
 ↓
repository/service
 ↓
actual Cloudflare binding.


No hidden local implementation.


======================================================================
37. LEAST-PRIVILEGE BINDINGS
======================================================================

Do not connect every Cloudflare service to every runtime.


WEB / CONTROL PLANE
→ only bindings it actually requires.


REDIRECT WORKER
→ D1
→ QR_CACHE KV
→ SCAN_EVENTS Queue
→ only other required bindings.


EVENT WORKER
→ required queues
→ D1
→ Analytics Engine
→ required R2.


COLLAB WORKER
→ Durable Object resources
→ only additional bindings actually required.


======================================================================
38. ENVIRONMENT RULE
======================================================================

Use Cloudflare-compatible:

development
staging
production

configuration.


Never hardcode production IDs/secrets.


Never commit secrets.


Never expose Cloudflare credentials through:

NEXT_PUBLIC_*.


======================================================================
39. DO NOT CREATE A PARALLEL DEV DATABASE ARCHITECTURE
======================================================================

Do not write application logic such as:

if production:
   D1

else:
   local SQLite.


NXTQR has ONE persistence architecture:

Cloudflare D1.


Development tooling may emulate/connect to D1 as officially supported by
Cloudflare, but application code must continue to program against the D1
architecture.


======================================================================
40. STRICT FEATURE DATA MAP
======================================================================

Use this architectural ownership:

USERS
→ D1

ORGANIZATIONS
→ D1

MEMBERS
→ D1

TEAMS
→ D1

ROLES
→ D1

PERMISSIONS
→ D1 / canonical permission configuration as designed

INVITATIONS
→ D1

QR METADATA
→ D1

QR DRAFT
→ D1

QR VERSION
→ D1

QR DESTINATIONS
→ D1

ROUTING RULES
→ D1

PUBLISHED RESOLVER SNAPSHOT
→ KV

LOGOS
→ R2 + D1 metadata

FILES
→ R2 + D1 metadata

PDFs
→ R2 + D1 metadata

REPORT OUTPUT
→ R2 + D1 metadata

SCAN TELEMETRY
→ Queue → Analytics Engine / approved analytics pipeline

COMMENTS
→ D1

APPROVALS
→ D1

ACTIVITY
→ D1

AUDIT
→ D1

BILLING
→ D1

ENTITLEMENTS
→ D1 authority

API KEYS
→ D1 secure metadata/hash

WEBHOOK CONFIG
→ D1

WEBHOOK DELIVERY
→ Queue

GUARDIAN CONFIG
→ D1

GUARDIAN ASYNC CHECKS
→ Queue / Workers

LIVE PRESENCE
→ Durable Objects

APPLICATION CACHE
→ Cloudflare KV only where specifically approved.


======================================================================
41. FINAL ZERO-LOCAL-STORAGE BUILD GATE
======================================================================

DO NOT DECLARE THE FEATURE COMPLETE UNTIL:

[ ] No NXTQR business data in localStorage
[ ] No NXTQR business data in sessionStorage
[ ] No IndexedDB business storage
[ ] No browser SQLite
[ ] No local application SQLite
[ ] No better-sqlite3 application DB
[ ] No sqlite3 application DB
[ ] No PGlite application DB
[ ] No JSON database
[ ] No filesystem database
[ ] No filesystem persistent uploads
[ ] No filesystem persistent exports
[ ] No application-level local business cache
[ ] No local fallback database
[ ] No demo-data fallback
[ ] No dummy-data fallback
[ ] No fake-data fallback
[ ] No fake successful writes
[ ] D1 is relational authority
[ ] R2 is persistent object storage
[ ] KV is approved distributed cache/snapshot only
[ ] Queues handle async work
[ ] Durable Objects handle coordination only
[ ] Analytics Engine handles designated telemetry
[ ] QR Studio drafts save to D1
[ ] QR versions save to D1
[ ] Logos/files save to R2 + D1 metadata
[ ] Reload loads from Cloudflare-backed server state
[ ] Cloudflare failure produces error state
[ ] Cloudflare failure never switches to local persistence
[ ] Every server command uses real Cloudflare-backed repositories
[ ] Repository-wide local-storage audit completed
[ ] Cloudflare binding verification completed
[ ] lint passes
[ ] typecheck passes
[ ] tests pass
[ ] production build passes


======================================================================
42. ABSOLUTE FINAL INVARIANT
======================================================================

NXTQR DOES NOT HAVE A LOCAL APPLICATION DATABASE.

NXTQR DOES NOT USE LOCALSTORAGE FOR BUSINESS DATA.

NXTQR DOES NOT USE SESSIONSTORAGE FOR BUSINESS DATA.

NXTQR DOES NOT USE INDEXEDDB FOR BUSINESS DATA.

NXTQR DOES NOT USE LOCAL SQLITE.

NXTQR DOES NOT USE LOCAL FILESYSTEM PERSISTENCE.

NXTQR DOES NOT USE LOCAL APPLICATION CACHE FOR BUSINESS DATA.

NXTQR DOES NOT FALL BACK TO DEMO/DUMMY/FAKE DATA.


NXTQR USES:

CLOUDFLARE D1
FOR RELATIONAL TRUTH.

CLOUDFLARE R2
FOR OBJECTS.

CLOUDFLARE KV
FOR APPROVED DISTRIBUTED CACHE / EDGE SNAPSHOTS.

CLOUDFLARE QUEUES
FOR ASYNC WORK.

CLOUDFLARE DURABLE OBJECTS
FOR COORDINATION.

CLOUDFLARE ANALYTICS ENGINE
FOR DESIGNATED HIGH-VOLUME TELEMETRY.

CLOUDFLARE WORKERS
FOR EDGE AND ASYNC RUNTIMES.


THE BROWSER MAY HOLD TEMPORARY UI STATE IN MEMORY.

THAT STATE IS NOT PERSISTENCE.


IF CLOUDFLARE HAS NO RECORD:
SHOW AN EMPTY STATE.

IF CLOUDFLARE CANNOT BE REACHED:
SHOW AN ERROR/OFFLINE STATE.

IF CLOUDFLARE WRITE FAILS:
SHOW SAVE FAILED.

NEVER SUBSTITUTE LOCAL DATA.


THE BROWSER IS THE INTERFACE.

CLOUDFLARE IS THE DATA PLATFORM.

D1 IS THE RELATIONAL SOURCE OF TRUTH.

THERE IS NO SECOND DATABASE.
======================================================================
```
