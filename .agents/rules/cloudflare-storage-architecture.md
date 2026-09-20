# NXTQR — ABSOLUTE CLOUDFLARE-ONLY DATA & STORAGE RULE

> **CRITICAL PRODUCTION ARCHITECTURE REQUIREMENT**  
> NXTQR MUST USE THE CLOUDFLARE PLATFORM AS THE AUTHORITATIVE PERSISTENCE / STORAGE / EDGE INFRASTRUCTURE.  
> DO NOT USE LOCAL STORAGE OR LOCAL DATABASES AS APPLICATION DATA STORES.

---

## IMPORTANT ARCHITECTURAL DISTINCTIONS

1. **Cloudflare D1 Local SQLite Semantics vs. Prohibited Application Databases**:
   - Cloudflare D1 itself uses SQLite-compatible SQL semantics.
   - The agent may see SQLite-related files, migrations, or tooling as part of the Cloudflare local development workflow (e.g., `.wrangler/state/v3/d1`, `@cloudflare/miniflare`, `wrangler d1 execute`).
   - The agent must **NOT remove Cloudflare-required development artifacts blindly**.
   - The absolute invariant is that NXTQR must never introduce its own `app.db`, `database.sqlite`, `local.db`, `better-sqlite3`, browser SQLite, `sql.js`, `wa-sqlite`, `PGlite`, or mock JSON files as a secondary or fallback application database.
   - **One unified architecture**: Code Repository `->` Cloudflare D1 binding (Miniflare/Wrangler local D1 in development, Cloudflare D1 binding in production).

2. **QR Studio Clean Data Flow**:
   - **React Memory**: Immediate, fluid UI editing state (in-memory canvas, active tab, color picker, live preview).
   - **Debounced Server Autosave**: Debounced mutation commands `->` Auth/Org validation `->` **Cloudflare D1** (`qr_drafts`, `qr_versions`).
   - **Assets & Logos**: Upload validation `->` **Cloudflare R2** bytes + **Cloudflare D1** metadata record (`r2_assets`).
   - **Scanability Engine**: Calculates purely in-memory on the client for instantaneous designer feedback; however, on **Publish** or **Export**, the server strictly recomputes and validates scanability server-side from authoritative Cloudflare-backed state.

---

```text
======================================================================
NXTQR — ABSOLUTE CLOUDFLARE-ONLY DATA & STORAGE RULE
======================================================================

THIS IS A NON-NEGOTIABLE PRODUCTION ARCHITECTURE REQUIREMENT.

NXTQR MUST USE THE CLOUDFLARE PLATFORM AS THE AUTHORITATIVE
PERSISTENCE / STORAGE / EDGE INFRASTRUCTURE.

DO NOT USE LOCAL STORAGE OR LOCAL DATABASES AS APPLICATION DATA STORES.

STRICTLY FORBIDDEN FOR BUSINESS DATA:

localStorage
sessionStorage as persistent business storage
IndexedDB as authoritative storage
browser SQLite
SQLite files
local SQLite databases
better-sqlite3
sqlite3
sql.js
wa-sqlite
PGlite
Dexie as authoritative persistence
local JSON database
JSON files as database
filesystem database
in-memory database as production authority
Next.js server filesystem persistence
Vercel filesystem persistence
local cache pretending to be database
mock database
fallback database
demo database
development database accidentally used by production runtime.


======================================================================
1. CLOUDFLARE IS THE DATA PLATFORM
======================================================================

Use:

CLOUDFLARE D1
→ authoritative relational application data

CLOUDFLARE KV
→ disposable hot cache / published resolver snapshots / safe configuration

CLOUDFLARE R2
→ binary/object storage

CLOUDFLARE QUEUES
→ asynchronous durable work delivery

CLOUDFLARE DURABLE OBJECTS
→ live coordination / presence / coordinated ephemeral state

CLOUDFLARE ANALYTICS ENGINE
→ high-volume telemetry where appropriate

CLOUDFLARE WORKERS
→ redirect runtime, consumers, scheduled/edge processing


Architecture:

                    NXTQR
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
       D1             KV            R2
 relational       hot/cache       objects
   truth          snapshots        files
        │             │             │
        └──────┬──────┴──────┬──────┘
               │             │
               ▼             ▼
            QUEUES     DURABLE OBJECTS
               │
               ▼
        ASYNC PROCESSING

               +
      ANALYTICS ENGINE
       for telemetry


======================================================================
2. D1 IS THE RELATIONAL SOURCE OF TRUTH
======================================================================

All persistent relational NXTQR business records must use Cloudflare D1.

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
destinations
routing rules
experiments

campaigns
folders
tags

comments
approvals
activity
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

reports
Guardian configuration
incidents

and other relational business state.


DO NOT replace D1 with local SQLite.


======================================================================
3. IMPORTANT — D1 USES SQLITE SEMANTICS BUT IS NOT A LOCAL SQLITE FILE
======================================================================

Cloudflare D1 may use SQLite-compatible SQL semantics.

That DOES NOT mean the application should create or use:

database.sqlite
app.db
local.db
dev.db
nxtqr.db
sqlite.db


Do not initialize:

new Database("./nxtqr.db")


Do not use:

better-sqlite3
sqlite3

as NXTQR's application database.


The application's database binding must be Cloudflare D1.


======================================================================
4. LOCAL DEVELOPMENT MUST STILL TARGET CLOUDFLARE ARCHITECTURE
======================================================================

Do not create a completely different local persistence architecture merely
to make development easier.

Development should use the Cloudflare/Wrangler-supported D1 development
workflow appropriate to the existing project.

Production uses actual Cloudflare D1 bindings.

Do not introduce a second repository implementation backed by local SQLite
unless there is an exceptional, explicitly approved testing requirement.

NXTQR must not have:

D1Repository

and

LocalSQLiteRepository

with production behavior depending on environment.

One architecture:

Repository
    ↓
Cloudflare D1 binding.


======================================================================
5. DO NOT USE LOCALSTORAGE FOR QR STUDIO DRAFTS
======================================================================

This is especially important for QR Studio.

DO NOT:

localStorage.setItem("qr-draft", ...)

DO NOT:

localStorage.setItem(`qr-${qrId}`, ...)

DO NOT:

save design JSON to localStorage

DO NOT:

save QR content to localStorage

DO NOT:

save routing configuration to localStorage

DO NOT:

save unpublished QR versions to localStorage.


Draft flow:

EDITOR STATE
      ↓
DEBOUNCE
      ↓
SERVER COMMAND
      ↓
AUTH
      ↓
ORG
      ↓
PERMISSION
      ↓
VALIDATION
      ↓
CLOUDFLARE D1
      ↓
REAL SAVED DRAFT.


React memory may temporarily hold current editing state while the page is
open.

That is NOT persistence.


======================================================================
6. REACT STATE IS ALLOWED FOR TEMPORARY UI STATE
======================================================================

Allowed:

useState
useReducer
React Hook Form
temporary editor state
selected tab
open dialog
current color picker value
drag state
hover state
temporary unsaved form changes
current diagnostic selection.


Example:

const [selectedDiagnostic, setSelectedDiagnostic] = useState("contrast");


This is UI state.

It is NOT persistent business storage.


======================================================================
7. NEVER TREAT CLIENT STATE AS AUTHORITATIVE
======================================================================

Browser:

content
design
filters
draft interaction

          ↓

server validation

          ↓

D1


Reloading the application must restore authoritative data from Cloudflare,
not from localStorage.


======================================================================
8. SCANABILITY DOES NOT NEED LOCAL PERSISTENCE
======================================================================

Scanability calculation may run locally in memory because it is a pure
calculation.

Correct:

QR draft state
      ↓
qr-core scanability engine
      ↓
temporary in-memory result
      ↓
UI


This does NOT mean storing the result in localStorage.


On:

Publish
Export

server recomputes from authoritative data.


======================================================================
9. DO NOT PERSIST SCANABILITY RESULTS IN BROWSER
======================================================================

Forbidden:

localStorage.setItem("scanability", result)

IndexedDB scanability history

local SQLite scanability table.


Live scanability result should normally exist only in memory.


If NXTQR has a genuine requirement to persist publication validation:

store appropriate metadata in D1.


======================================================================
10. R2 FOR FILES — NOT LOCAL FILESYSTEM
======================================================================

QR Studio assets such as:

logos
uploaded files
PDFs
exports
report outputs
template assets
brand assets where appropriate


must use Cloudflare R2.


Correct:

Browser
   ↓
authorized upload
   ↓
validation
   ↓
R2
   ↓
D1 metadata.


Forbidden:

/uploads/logo.png

./storage/files/

public/uploads/

server local filesystem

Vercel filesystem.


Do not use local disk as durable storage.


======================================================================
11. D1 + R2 OWNERSHIP
======================================================================

R2:

BYTES


D1:

METADATA + OWNERSHIP + REFERENCES


Example:

D1 asset record:

asset_id
organization_id
object_key
mime_type
size
created_by
created_at
status


R2:

actual bytes.


Never let R2 object listing become the application's relational database.


======================================================================
12. KV IS NOT THE DATABASE
======================================================================

Use KV only for appropriate disposable/cache-style state.

Examples:

published QR resolver snapshot
hot redirect lookup
safe feature/config cache
entitlement cache where architecture allows.


Do NOT use KV as authoritative storage for:

members
roles
payments
QR versions
subscriptions
approvals
audit logs.


D1 remains authority.


======================================================================
13. KV CACHE FAILURE MUST NOT DESTROY DATA
======================================================================

Correct:

D1 COMMIT
   ↓
KV PUBLISH


If KV publication fails:

D1 state remains authoritative
repair/retry cache publication.


Never reverse this:

KV succeeds
D1 doesn't matter.


======================================================================
14. QUEUES FOR ASYNC WORK
======================================================================

Use Cloudflare Queues for:

scan events
report generation
customer webhook deliveries
link checks
notifications
billing reconciliation work
other appropriate async processing.


Do not build local filesystem job queues.


Do not use an in-memory array as production queue.


======================================================================
15. DURABLE OBJECTS
======================================================================

Use Durable Objects only where coordination is required.

Examples:

live Studio presence
collaboration room
ephemeral coordinated state.


Do not use Durable Objects as a replacement for D1 relational storage.


Durable:

QR revision
comments
approval
business state

→ D1.


Presence:

who is currently editing

→ Durable Object where implemented.


======================================================================
16. ANALYTICS ENGINE
======================================================================

High-volume scan telemetry may use Cloudflare Analytics Engine according to
the established NXTQR analytics architecture.


Do not store the raw scan firehose in local SQLite.


Do not store it in localStorage.


Do not write every raw scan into D1 if architecture already assigns
high-volume telemetry to Analytics Engine.


======================================================================
17. REDIRECT ARCHITECTURE
======================================================================

Redirect Worker:

REQUEST
   ↓
KV RESOLVER SNAPSHOT
   ↓
MISS?
   ↓
D1
   ↓
ROUTING ENGINE
   ↓
DESTINATION
   ↓
QUEUE SCAN EVENT
   ↓
302 / 307


No local database.

No browser storage.

No Next.js database proxy required for redirect.


======================================================================
18. AUTH STATE
======================================================================

Do not implement homemade persistent auth using:

localStorage token
sessionStorage token


Use the established secure server-side authentication/session architecture.


Never persist sensitive authentication material in localStorage.


======================================================================
19. API KEYS
======================================================================

API keys:

generate securely server-side
store appropriate hash/metadata in D1
show secret once


Never:

localStorage.setItem("apiKey", key).


======================================================================
20. CASHFREE
======================================================================

Billing state:

Cashfree
   ↓
verified webhook
   ↓
server
   ↓
D1
   ↓
entitlements.


Never store authoritative:

subscription
plan
payment
entitlement


in localStorage.


Browser payment success is not billing authority.


======================================================================
21. ZERO OFFLINE DATABASE
======================================================================

Do NOT create an offline-first local database for NXTQR unless explicitly
requested in a future architecture decision.


No:

local QR database
offline organization database
offline campaign database
offline analytics database
offline billing database.


If network is unavailable:

show NXTQR offline/network state.


Do not silently switch to local database.


======================================================================
22. OFFLINE EDITING
======================================================================

Do not invent offline QR editing persistence using localStorage/IndexedDB.


If connection is lost while user has unsaved in-memory edits:

show:

Connection lost

Your current unsaved changes are still open in this tab.

Reconnect to save them.


Do not claim they are safely persisted after browser/tab closure.


======================================================================
23. NO FAKE FALLBACK DATABASE
======================================================================

STRICTLY FORBIDDEN:

try {
   return await d1.query(...)
} catch {
   return localDb.query(...)
}


Also forbidden:

try D1
→ fail
→ mock DB

try D1
→ fail
→ JSON file

try D1
→ fail
→ localStorage.


D1 failure is a real service/data error.


======================================================================
24. CLOUDFLARE BINDINGS
======================================================================

Use explicit least-privilege Cloudflare bindings per runtime.

Conceptually:

WEB / CONTROL PLANE
DB
ASSETS_BUCKET
EXPORTS_BUCKET
appropriate queues


REDIRECT WORKER
DB
QR_CACHE
SCAN_EVENTS


EVENT WORKER
DB
appropriate queues
ANALYTICS
required R2 bindings


COLLAB WORKER
COLLAB_ROOM
only additional bindings actually required.


Do not give every runtime every binding.


======================================================================
25. ENVIRONMENT SEPARATION
======================================================================

Maintain:

LOCAL DEVELOPMENT
STAGING
PRODUCTION


using separate Cloudflare resources/configuration where appropriate.


Never point local development accidentally at production D1/R2/KV.


Never commit Cloudflare secrets.


======================================================================
26. REPOSITORY AUDIT
======================================================================

Before implementation search the entire NXTQR repository for:

localStorage
sessionStorage
IndexedDB
indexedDB
Dexie
PGlite
sqlite
sqlite3
better-sqlite3
sql.js
wa-sqlite
.db
.sqlite
database.sqlite
local.db
app.db
fs.writeFile
fs.writeFileSync
fs.readFile
uploads/
mock database
fallback database.


For EVERY result classify:

REMOVE
UI-ONLY LEGITIMATE
TEST-ONLY
BUILD/TOOLING-ONLY
CLOUDFLARE DEV TOOLING
MIGRATE TO D1
MIGRATE TO R2
MIGRATE TO KV
MIGRATE TO QUEUE
MIGRATE TO DURABLE OBJECT
MIGRATE TO ANALYTICS ENGINE.


Do not blindly delete tooling required by Cloudflare itself.


======================================================================
27. IMPORTANT DISTINCTION — BROWSER PREFERENCES
======================================================================

Do not over-interpret this rule.

If the existing product uses browser storage for NON-BUSINESS cosmetic
preferences such as:

dismissed tooltip
sidebar collapsed preference
temporary UI preference


audit it separately.

But for this implementation, prefer the existing application preference
architecture.

ABSOLUTELY NEVER use browser storage for:

QRs
drafts
versions
members
teams
roles
campaigns
routes
analytics
billing
files
API keys
webhooks
approvals
audit
Guardian state.


======================================================================
28. REQUIRED FINAL DATA-FLOW VERIFICATION
======================================================================

For every implemented feature report:

FEATURE
AUTHORITATIVE STORE
CACHE
OBJECT STORE
ASYNC PIPELINE


Example:

QR metadata
D1
—

QR resolver
D1
KV

QR logo
D1 metadata
—
R2

QR draft
D1
—

QR versions
D1
—

Scan telemetry
appropriate telemetry pipeline
—
—
Queue

Reports
D1 metadata
—
R2
Queue


Use the actual final architecture, not this example blindly.


======================================================================
29. FINAL BUILD GATE
======================================================================

Before declaring implementation complete:

[ ] No business data stored in localStorage
[ ] No business data stored in sessionStorage
[ ] No IndexedDB business database
[ ] No local SQLite application database
[ ] No better-sqlite3 application database
[ ] No sqlite3 application database
[ ] No JSON-file database
[ ] No local filesystem durable uploads
[ ] No local filesystem durable exports
[ ] D1 is relational authority
[ ] R2 stores persistent binary objects
[ ] KV is cache/config only
[ ] Queues handle async work
[ ] Durable Objects only coordinate
[ ] Analytics Engine used only where architecture requires telemetry
[ ] D1 errors do not fall back to local data
[ ] Offline state does not silently create local DB
[ ] QR Studio drafts persist to D1
[ ] QR versions persist to D1
[ ] Scanability live result remains in memory unless intentionally persisted
[ ] Publish revalidates server-side
[ ] Export revalidates server-side
[ ] Auth state is not insecurely stored in localStorage
[ ] Billing authority is not browser storage
[ ] API secrets are not browser-persisted
[ ] Cloudflare bindings are least privilege
[ ] dev/staging/prod resources are separated
[ ] repository-wide storage audit completed
[ ] lint passes
[ ] typecheck passes
[ ] tests pass
[ ] production build passes


======================================================================
ABSOLUTE NXTQR STORAGE INVARIANT
======================================================================

FOR NXTQR BUSINESS DATA:

D1
=
RELATIONAL TRUTH.

R2
=
BINARY OBJECTS.

KV
=
DISPOSABLE CACHE / PUBLISHED EDGE SNAPSHOTS.

QUEUES
=
ASYNC DELIVERY.

DURABLE OBJECTS
=
COORDINATION.

ANALYTICS ENGINE
=
HIGH-VOLUME TELEMETRY WHERE APPROPRIATE.


NOT:

LOCALSTORAGE
=
DATABASE.

NOT:

INDEXEDDB
=
DATABASE.

NOT:

LOCAL SQLITE
=
DATABASE.

NOT:

JSON FILES
=
DATABASE.

NOT:

LOCAL FILESYSTEM
=
OBJECT STORAGE.


TEMPORARY REACT MEMORY IS ALLOWED FOR INTERACTION.

PERSISTENT BUSINESS STATE BELONGS TO CLOUDFLARE.


NO CLOUD CONNECTION
        ↓
SHOW NETWORK / ERROR / OFFLINE STATE.

DO NOT:
NO CLOUD CONNECTION
        ↓
SILENTLY SWITCH TO LOCAL DATABASE.


THE BROWSER IS AN INTERFACE.

THE BROWSER IS NOT THE NXTQR DATABASE.

CLOUDFLARE IS THE NXTQR DATA PLATFORM.
======================================================================
```
