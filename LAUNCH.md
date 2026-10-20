# Launch status and release gates

## Actual cloud state (2026-10-19)

- Firebase project `prime-avenue-16524`, web app, Google Sign-In, Firestore and private default Storage bucket are configured.
- All eight Node.js 22 second-generation functions, application Firestore/Storage rules, indexes and the Firebase test frontend were deployed successfully from the owner's Cloud Shell.
- Blaze is authorized. A USD 10 alert budget was submitted; USD 1/3/5/10 thresholds still need verification. One-day Artifact Registry image cleanup is configured.
- Public score key is registered with Firebase App Check. The owner successfully updated its allowed domains to the GitHub Pages host and `prime-avenue-16524.web.app` using the Cloud CLI.
- Initial administrator bootstrap and public service seeding completed successfully. Browser inspection confirms the authenticated administrator navigation and all six directory listings.
- Completed Google registrations now activate immediately, per the owner's revised policy. Pending profiles can complete registration to activate. Suspended/rejected accounts cannot reactivate themselves. Service recommendations still require moderation.
- Owner authorized GitHub Pages publication. This release is NOT certified production-ready: a protected test issue submission still returned `functions/unauthenticated` in the agent browser, with App Check/reCAPTCHA errors in logs. The test issue was not created. No attestation bypass was introduced.
- Actual multi-account, photo upload, mobile/PWA and live Pages checks remain necessary. Firestore App Check enforcement and bucket region also need verification.

## Admin analytics and comment totals — pending backend release

- Admin-only callable aggregates all registrations by building, owner/tenant, current residence, status and 7/30-day signup cohorts. Unknown historical answers remain unknown; account counts are not unit counts or occupancy rates.
- Authenticated member visits (including admins) are deduplicated per account per 30-minute bucket, across devices. Daily totals and distinct members use Cairo dates. Anonymous pre-login traffic is excluded. Tracking begins at release; no historic traffic is fabricated. No IP addresses, user-agent strings or device fingerprints are stored. Raw visit identifiers are backend-only.
- Each counted visit writes a per-member marker and aggregate daily record. Analytics reads all resident profile projections on demand and at most 30 daily records; usage contributes to normal Blaze function/Firestore usage. Refresh is explicit, with no dashboard polling.
- Post cards show full comment totals; old posts use Firestore count aggregation and the trusted comment function initializes a legacy total transactionally. Hidden comment placeholders remain in the thread and count. The comment modal shows the latest 50 while retaining the full total.
- Owner reports the residency-question backend deployment succeeded. PR #4 and its matching frontend were published successfully.
- For this release, deploy `createPost`, `addComment`, `recordVisit` and `getAdminAnalytics` (codebase `community`) from the development branch before publishing its frontend. Existing rules already deny direct metric reads/writes; no rules changes are required.
- Validation: 39 tests (16 unit/helper + 23 emulator integration/security) pass; syntax/configuration checks pass. Arabic/English component previews fit 375px without page overflow; wide building tables scroll within their section. Live analytics validation awaits the owner deployment.

## Place forms and Google Maps links — pending backend release (2026-10-20)

- Post title inputs now read “موضوع المشاركة / Post subject”, service titles “اسم المكان أو الخدمة / Place or service name”, and marketplace titles “اسم المعروض / Item name”. Location/directions has its own field.
- Services accept a separate `mapUrl` field (HTTPS Google Maps full/share links, maximum 2,048 characters). Either location text or a valid Maps link is required. The Maps button prefers the submitted link and otherwise searches by name/location.
- Backend and display validation reject deceptive hosts, unsafe schemes, credentials and nonstandard ports. No server-side URL fetch or short-link expansion occurs. Admin moderation remains required for resident recommendations.
- Legacy Maps links in the address field are recognized and separated when editing/submitting. Older admin clients preserve an existing Maps link when they omit the new field.
- Owner confirmed the analytics backend deployment succeeded; PR #5 and its frontend have been published successfully. Unauthenticated probes to both new analytics endpoints returned UNAUTHENTICATED.
- This release requires the owner to deploy `community:createPost` and `community:adminManage` from the development branch before its frontend is published. No credentials, dependency changes or rules changes are needed.
- Validation: all 43 tests pass (19 unit/helper + 24 emulator security/integration), plus syntax/configuration checks. Mobile component previews show the separate link/location fields, legacy link prefilling and clarified subject labels at 390px without page overflow. Actual authenticated live submission remains to be checked after deployment.

## Current access blockers

Google Cloud billing console and embedded Cloud Shell show **Site Unavailable** in the agent cloud browser. The owner has successfully opened an independent Cloud Shell session and cloned the development branch; the original 23 tests also passed there. No authenticated CLI deployment session is available in the agent development container. No workaround using copied cookies, access tokens or service-account keys is permitted or required.

## Complete backend setup in an accessible trusted environment

1. Confirm the default Storage bucket is `prime-avenue-16524.firebasestorage.app` in `us-central1`, private/production mode. Do not expose the bucket publicly.
2. In project-scoped Cloud Billing budgets, verify a monthly USD 10 **alerts-only** budget with actual-cost thresholds 10%, 30%, 50%, 100% (USD 1/3/5/10). Send emails to the billing administrator/project owner. Alerts are not spending caps and reporting may lag.
3. Create a web reCAPTCHA Enterprise/Fraud Defense score key for the exact production domain, register it in Firebase App Check for the existing web app, and put its public site key in `firebase-config.js`. Leave backend `enforceAppCheck: true`. Enable App Check enforcement for Firestore after verifying valid clients. Direct Storage access is denied regardless.
4. Use interactive Firebase CLI login in a trusted terminal or already authenticated Cloud Shell. Do not download a service-account key. From this checkout:

```sh
npm ci
npm ci --prefix functions
npm run check
npm test
npm run test:rules
npx firebase deploy --only firestore,storage,functions --project prime-avenue-16524
```

Deploying application backend infrastructure is within the requested setup scope. The owner has explicitly authorized publishing the frontend to GitHub Pages. Configure Artifact Registry cleanup using the official Firebase CLI to avoid accumulating deployment image storage. Functions have zero minimum instances and a maximum of two instances each; this is not an overall spending limit.

5. Staging is configured for `https://prime-avenue-16524.web.app`, with an explicit frontend-only build allowlist, no-index headers, and an exact callable CORS entry. The owner reports adding this domain to the score key. This is a public sign-in page with private community data protected by membership rules, not an access-restricted hosting environment. From the development branch, run `npx firebase deploy --only functions,hosting --project prime-avenue-16524`. This deploys the test frontend and updated CORS; GitHub Pages is unchanged. The staging deployment succeeded; valid App Check transport remains unresolved. The confirmed initial administrator must sign in with Google there. With application-default credentials in a trusted owner environment, run:

```sh
node scripts/bootstrap-admin.mjs CONFIRMED_ADMIN_GOOGLE_EMAIL
node scripts/seed-services.mjs
```

The email argument is entered privately at runtime, not stored in the repository. The bootstrap script refuses unverified/non-Google accounts. No client-facing administrator promotion endpoint exists.

6. Sign out/in or refresh membership after bootstrap. Confirm the administrator dashboard appears only for this UID. Confirm a second Google account receives community access after completing a valid registration, without gaining administrator privileges.

## Staging and launch acceptance

- Real Google sign-in, popup behavior on iPhone/Safari and Android, repeat sign-in on a second device.
- Unregistered/rejected/suspended visitors cannot read private content, upload photos or submit mutations.
- Approved second account sees shared posts/comments; cannot read another registration, self-approve, assign admin, tamper with counters or overwrite another photo.
- Registration, suspension, issue status, photos/retries, comments, votes/toggles, poll changes, event attendance, recommendations, ratings and moderation work through actual deployed endpoints with valid App Check.
- Missing/invalid App Check tokens are rejected by the deployed callable transport and Firestore enforcement.
- Photo retrieval is denied after content is hidden or membership is suspended. No bearer URLs or photo responses cached by the service worker.
- Arabic RTL and English LTR, long text, keyboard focus, mobile widths 320/375/390/430, iPhone safe area, PWA installation and update behavior.
- Database indexes finish building and the verified service records are present with source/date labels.
- Scan the exact release commit for credentials; verify no private keys in the public tree.
- Ask the owner to approve the tested release. Only then merge into `main`, preserving the existing Pages URL. Verify the production deployment and smoke-test both accounts again.

## Verification already completed locally

Syntax/configuration/CSP/prototype-removal checks and six validation tests pass. Nineteen emulator rule/integration tests pass, including shared data, admin authorization, suspension, photo re-encoding and access denial. Browser checks confirm the Arabic guest gate and English/LTR switch with no horizontal overflow at the available desktop viewport. Actual Google sign-in and authenticated administrator reads were verified on the test site. Protected writes currently fail App Check in the agent browser. Actual multi-account journeys, mobile-device checks and working production App Check transport remain unverified.

## Cost and maintenance notes

The app can incur charges for database reads/writes/storage, photo storage/operations/egress, function invocations/compute, build artifacts/logging and reCAPTCHA/Fraud Defense above applicable no-cost quotas. Repeated photo reads invoke a backend function by design to preserve authorization; the app keeps only a session-memory photo cache. Budget alerts do not stop usage. Never promise a zero bill or a USD 10 maximum.

Notifications are in-app only; push/email notifications are not configured. Content pagination is 30 records per page; comment panels show the latest 50 comments. Daily request limits are enforced per authenticated account. Their small `limits` documents accumulate; include periodic owner cleanup in maintenance or add a tested retention policy later. Backups and PITR were not enabled; select and authorize a backup policy before wider resident rollout.

## Development dependency audit follow-up

Pinned transitive overrides upgrade `@grpc/grpc-js` to 1.14.6, `@opentelemetry/core` to 2.8.0, and `uuid` to 11.1.1. All 23 tests and Firebase CLI module/deployment-help checks pass after these changes. The backend production dependency tree continues to have no reported vulnerabilities.

The root development audit now reports three high-severity entries for one remaining chain: `firebase-tools` → `chokidar` → `braces` (GHSA-vfj7-8cjw-p6xm). No patched braces version is published. This recursive pattern-parsing denial-of-service issue affects the development CLI watcher, not the deployed backend or browser bundle. Run the CLI only with trusted repository files/configuration and no untrusted glob patterns; track an upstream fix. Do not use `npm audit fix --force` or replace a major CLI dependency solely to suppress the advisory.

## First-tap Google sign-in follow-up

The public sign-in page now prepares the Firebase redirect resolver and App Check token before enabling Google sign-in. The click path invokes the popup immediately after preparation, ignores duplicate taps during a sign-in attempt, and clears stale errors when starting/signing in. Three focused tests cover cold setup, synchronous first-tap invocation and duplicate-tap/retry handling. These checks do not replace an actual iPhone Safari test. App Check enforcement and resident authorization are unchanged.

## Mobile UI and residency question follow-up

Arabic labels use «اتحاد سكان» and the owner-selected «مشكلات وحلول». Post badges identify their section (issue/discussion/recommendation/etc.); administration controls are collapsed. Service ratings are removed from the interface, and a short Google Maps button opens a search for the public business name/address. Public bilingual directory content follows the selected language. A More menu exposes every section on mobile.

The owner supplied phone screenshots showing an actual submitted post and displayed uploaded photo. This is evidence of those journeys for the owner account, not multi-account testing or proof of every release gate.

The new registration yes/no answer is prepared as private `currentlyLiving` data. It does not affect membership approval or administrative roles. Existing clients remain compatible and existing profiles are not assigned a fabricated answer. Backend unit/integration checks cover yes/no persistence and malformed inputs. The visual updates were published through PR #3. The question must stay unpublished until the owner deploys the updated `registerResident` function from the development branch. No backend credentials are available in the agent container.

All 32 current tests pass (13 unit/input/UI helpers and 19 emulator tests). Isolated mobile fixtures rendered from the actual presentation functions were checked at 390px: no horizontal overflow, maps present, ratings absent, administration collapsed, and the future registration question has required yes/no radios.
