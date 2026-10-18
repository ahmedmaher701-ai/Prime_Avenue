# Launch status and release gates

## Actual cloud state (2026-10-19)

- Firebase project `prime-avenue-16524`, display name **Prime-Avenue**, created.
- Web app **Prime Avenue Community** registered.
- Google Sign-In enabled; `ahmedmaher701-ai.github.io` authorized.
- Blaze billing activated with the owner's explicit approval, linked to the existing billing account.
- USD 10 alert budget submitted as part of the successful upgrade. Custom USD 1/3/5/10 thresholds have NOT been verified.
- Firestore `(default)`, Standard edition, `us-central1`, created in production mode with default deny-all access.
- Storage provisioning was attempted in `us-central1`, but the console returned to its setup screen. Bucket creation is NOT confirmed.
- App Check product initialized; attestation registration and enforcement are NOT complete.
- No Cloud Functions, application rules, indexes, administrator document or service seeds have been deployed.
- No production frontend changes have been merged or published.

## Current access blockers

Google Cloud billing console and embedded Cloud Shell both show **Site Unavailable** in the connected cloud browser. No authenticated CLI deployment session is available in the development container. No workaround using copied cookies, access tokens or service-account keys is permitted or required.

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

Deploying application backend infrastructure is within the requested setup scope. Publishing the frontend to GitHub Pages still requires the owner's final approval. Configure Artifact Registry cleanup using the official Firebase CLI to avoid accumulating deployment image storage. Functions have zero minimum instances and a maximum of two instances each; this is not an overall spending limit.

5. Prepare a restricted staging frontend on an authorized domain, with valid App Check configured. The confirmed initial administrator must sign in with Google there. With application-default credentials in a trusted owner environment, run:

```sh
node scripts/bootstrap-admin.mjs CONFIRMED_ADMIN_GOOGLE_EMAIL
node scripts/seed-services.mjs
```

The email argument is entered privately at runtime, not stored in the repository. The bootstrap script refuses unverified/non-Google accounts. No client-facing administrator promotion endpoint exists.

6. Sign out/in or refresh membership after bootstrap. Confirm the administrator dashboard appears only for this UID. Confirm a second Google account remains pending until approved.

## Staging and launch acceptance

- Real Google sign-in, popup behavior on iPhone/Safari and Android, repeat sign-in on a second device.
- Pending/rejected/suspended visitors cannot read private content, upload photos or submit mutations.
- Approved second account sees shared posts/comments; cannot read another registration, self-approve, assign admin, tamper with counters or overwrite another photo.
- Registration, approvals, issue status, photos/retries, comments, votes/toggles, poll changes, event attendance, recommendations, ratings and moderation work through actual deployed endpoints with valid App Check.
- Missing/invalid App Check tokens are rejected by the deployed callable transport and Firestore enforcement.
- Photo retrieval is denied after content is hidden or membership is suspended. No bearer URLs or photo responses cached by the service worker.
- Arabic RTL and English LTR, long text, keyboard focus, mobile widths 320/375/390/430, iPhone safe area, PWA installation and update behavior.
- Database indexes finish building and the verified service records are present with source/date labels.
- Scan the exact release commit for credentials; verify no private keys in the public tree.
- Ask the owner to approve the tested release. Only then merge into `main`, preserving the existing Pages URL. Verify the production deployment and smoke-test both accounts again.

## Verification already completed locally

Syntax/configuration/CSP/prototype-removal checks and six validation tests pass. Seventeen emulator rule/integration tests pass, including shared data, admin authorization, suspension, photo re-encoding and access denial. Browser checks confirm the Arabic guest gate and English/LTR switch with no horizontal overflow at the available desktop viewport. Authenticated browser journeys, actual mobile-device checks and production App Check transport remain untested.

## Cost and maintenance notes

The app can incur charges for database reads/writes/storage, photo storage/operations/egress, function invocations/compute, build artifacts/logging and reCAPTCHA/Fraud Defense above applicable no-cost quotas. Repeated photo reads invoke a backend function by design to preserve authorization; the app keeps only a session-memory photo cache. Budget alerts do not stop usage. Never promise a zero bill or a USD 10 maximum.

Notifications are in-app only; push/email notifications are not configured. Content pagination is 30 records per page; comment panels show the latest 50 comments. Daily request limits are enforced per authenticated account. Their small `limits` documents accumulate; include periodic owner cleanup in maintenance or add a tested retention policy later. Backups and PITR were not enabled; select and authorize a backup policy before wider resident rollout.
