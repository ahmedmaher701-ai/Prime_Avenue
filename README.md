# Prime Avenue | برايم أفينيو

A mobile-first Egyptian Arabic / English community prototype for Prime Avenue Compound, Hadayek October, Giza.

## Website

GitHub Pages: https://ahmedmaher701-ai.github.io/Prime_Avenue/

To activate Pages: **Repository Settings → Pages → Deploy from a branch → main → /(root)**.

## Prototype features

- Responsive Arabic (RTL) and English interfaces; emoji navigation and community features.
- Clean scalable logo: `prime-avenue-logo.svg`, displayed in the header and welcome section.
- Resident registration: name, mobile number, building, unit, owner/tenant.
- Returning-resident sign-in on the **same device** by previously registered phone number.
- Visitors can browse, but must be signed in as residents to post issues, discussions, ideas, recommendations, votes or comments.
- Photo attachments on issue reports (browser storage size limited).
- Forum, ideas, voting, comments, and issue-status tracking.
- Local business/service directory categories; recommendations require demo approval.
- Events and residents' discounts (discounts: Coming Soon).
- Admin demo login: **Admin / Admin**. Admin navigation only appears after demo login, with local dashboard for issues, recommendations and events.

## Critical security limitation — not production-ready

This is a **browser-only demo**, not a real multi-user web app. Data is kept in browser `localStorage`, so it is visible only on the same device/browser. Registration does **not** verify phone number or residency, and returned-resident sign-in by phone is not secure. The admin password **Admin** is intentionally published in the JavaScript as a temporary *demo credential*; it does **not** provide any real authorization or isolation. Anyone can read the source and bypass browser-only controls. Do **not** collect actual residents' phone numbers, photos, or sensitive issue details for real use until a secure backend is deployed.

Before community launch: configure a hosted backend (e.g. Supabase free tier), genuine authentication, verified resident approval, server-side role checks / row-level security, moderated shared database, rate limits, and secure image storage. Change the demo admin credentials to private server-side authentication and remove all client-side mock authorization.

## Files

- `index.html`: static website and core features.
- `upgrade.js`: client-side demo registration, sign-in, write restrictions and admin dashboard.
- `prime-avenue-logo.svg`: scalable geometric logo adapted from the supplied Prime Avenue branding.
