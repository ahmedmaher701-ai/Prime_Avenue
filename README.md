# Prime Avenue | برايم أفينيو

Egyptian Arabic / English community application for Prime Avenue Compound, Hadayek October, Giza.

**Publication authorized; production verification incomplete.** Firebase backend, administrator account and service listings are deployed. Protected writes still need successful live App Check verification. Read [LAUNCH.md](LAUNCH.md) for actual setup state and remaining checks.

## Architecture

- Static ES-module frontend at the existing `/Prime_Avenue/` GitHub Pages path; original logo, colors, RTL styling and emoji navigation retained.
- Firebase Google Authentication. Registration records are private to their owner and administrators. Completing a valid registration activates membership immediately. Administrators can suspend accounts; service recommendations still require review.
- Firestore stores shared content. Security Rules deny direct client mutations. Cloud Functions validate current approval or an administrator document for every request.
- `admins/{uid}` can only be created through trusted owner tooling. A Google email or a client-side role flag never grants administrator permissions. The bootstrap script checks that the confirmed account has signed in with Google and has a verified email.
- All callable endpoints enforce App Check. No debug tokens are committed. App Check must be registered and its public site key populated before mutations can work.
- Photos are decoded, resized, stripped of metadata and re-encoded on the backend. All direct Storage access is denied. Authenticated functions return image bytes only to permitted viewers. No public bearer download URLs are stored.
- Private content is held in memory in the frontend. No localStorage community database or simulated authentication. The service worker caches application assets only.

## Implemented workflows

Registration/approval/suspension; issues and photos; comments; forum; ideas/votes; administrator events and attendance; announcements/polls; lost and found; service recommendations/approval/ratings; marketplace; in-app notifications; discounts marked `قريباً — Coming Soon`. The administrator dashboard is responsive. No resident directory or anonymous posting.

Verified public listings are prepared in `data/services.seed.json`. They include source URLs and review dates, and are distinct from resident recommendations. No unverified private technician contacts are included. Listings do not promise opening hours, availability, delivery or proximity in minutes.

## Development and verification

Use Node 22 and Java 21 or newer for emulator tests:

```sh
npm ci
npm ci --prefix functions
npm run check
npm test
npm run test:rules
```

`npm run dev` serves only frontend assets. The browser SDK uses Firebase 13.0.0 from Google's CDN. Firebase web configuration is public project identification; it does not grant database access.

`tests/integration.test.mjs` exercises deployed handler logic against real Firestore/Storage emulators using synthetic identities. It deliberately invokes handler `.run()` and therefore does **not** test token verification, App Check transport enforcement or real Google sign-in. Those require staging verification before launch.

## Administration

Daily approvals, suspensions, issue status, recommendations and content moderation are performed through the administrator dashboard. Public business source records can be edited or hidden there. Registration corrections/deletion requests currently require project-owner support; there is no resident self-service account deletion yet.

The repository contains no service-account keys, private Firebase credentials, session tokens or administrator password. Use interactive Firebase authentication or short-lived workload identity for deployment. Never commit a downloaded key or a Firebase login token.
