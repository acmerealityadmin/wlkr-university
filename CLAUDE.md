# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## What This Project Is

`wlkr-university` is a Next.js 15 educator professional-development site on
the **Walkr** platform — courses, lessons, quizzes, certificates, articles,
and media for educators using the WLKR Learning System. It is a **pure
frontend**, same role as `wlkr-ed-portal`: no database access, no API routes
of its own. All data goes through `wlkr-ecko-server`'s `/v1/university/*`
namespace.

## Commands

```bash
npm run dev        # Dev server (http://localhost:3200)
npm run build      # Static export build (writes ./out) — this is the real
                    # correctness check: does next-intl + every dynamic
                    # route's generateStaticParams actually resolve cleanly.
npm run lint        # ESLint
npm run type-check  # tsc --noEmit
npm run test        # Vitest
```

`.env.local` needs only `NEXT_PUBLIC_API_URL` (URL of `wlkr-ecko-server`,
e.g. `http://localhost:8080`). Because this is a static export, that value is
baked in at build time — there's no server runtime to read env per request
(unlike `wlkr-ed-portal`'s `API_URL` request-time override).

## Architecture

### One codebase, two release channels
`next.config.ts` sets `output: 'export'` — the same static-export approach
`wlkr-field-app` uses, not `wlkr-website`'s SSR `standalone` mode. The `out/`
directory this produces is deployed as the public web app AND will be
wrapped by Capacitor for the app-store build (not yet done — see "Not yet
built" below). Publishing new courses/articles means a rebuild+redeploy,
same as any Jamstack site.

**Static export means every dynamic route segment needs
`generateStaticParams`.** There's no request-time server to resolve an
arbitrary `[slug]` or `[code]`. Two consequences worth knowing before adding
routes:
- Course/lesson/article pages hardcode their known launch slugs (see the
  `KNOWN_SLUGS`/`KNOWN_PAIRS` constants next to each `generateStaticParams`)
  rather than fetching the catalog at build time to enumerate params — this
  keeps `next build` hermetic (no network dependency on a live
  `wlkr-ecko-server`). Update these constants when new content ships. If the
  catalog grows large, switch to fetching the public API at build time
  instead of hand-listing slugs.
- Certificate verification (`/certificates/verify`) reads its `code` from a
  **query string**, not a `[code]` path segment — codes are minted at
  certificate issuance, long after build, so they can't be enumerated. Don't
  turn this back into a dynamic path segment.
- Static export has **no middleware support**, so there's no request-time
  browser-locale redirect for the bare `/`. Every internal link uses
  next-intl's locale-aware `Link`, so this only matters for a manually typed
  bare domain root — solve it at the hosting layer (a CDN/host-level
  redirect rule from `/` to `/en/`), not in the app.

### One data path: wlkr-ecko-server
`src/lib/api.ts`:
- `api` axios instance → `NEXT_PUBLIC_API_URL` (auth only)
- `univ` axios instance → `NEXT_PUBLIC_API_URL/v1/university`

Both attach the ecko-issued bearer token and share the same 401-refresh
logic, ported from `wlkr-ed-portal/src/lib/api.ts`.

### Auth model
- Login is delegated to the ecko server (`POST /v1/auth/login`) — password
  only, no SAML/Clever (not relevant to this product's audience).
- Access is **bundled**: any `TEACHER`+ WLKR account can use WLKR
  University — no separate subscription/entitlement. See
  `canAccessUniversity()` in `src/lib/roles.ts`.
- No `middleware.ts` (consistent with `wlkr-ed-portal` — and required here
  anyway, since static export doesn't support it). Auth + redirect happens
  client-side in `src/app/[locale]/app/layout.tsx`, spinner-then-gate,
  exactly like `wlkr-ed-portal`'s `(portal)/layout.tsx`.

### i18n
`next-intl` with `[locale]` App Router segments (`localePrefix: 'always'`).
Locales match `wlkr-ecko-server`'s `config.cannedText.locales`: `en es fr de
zh hi ja fa ru`. Only `en` is fully translated at launch — `src/i18n/messages/<locale>.json`
for the other 8 locales stub a couple of top-level keys, and
`src/i18n/request.ts` deep-merges each locale onto the English catalog so a
missing key falls back to English instead of breaking. Add real translations
by filling in more keys per locale file; nothing else needs to change.
`dir="rtl"` is set automatically for `fa`.

### Route map
- `[locale]/(public)/` — public SEO surface: home, `/courses`,
  `/courses/[slug]`, `/articles`, `/articles/[slug]`, `/media` (placeholder
  — see gap below), `/certificates/verify`.
- `[locale]/login/` — password login.
- `[locale]/app/` — gated LMS: `/app/dashboard`, `/app/courses/[slug]`
  (enroll + lesson list), `/app/courses/[slug]/lessons/[lessonSlug]`,
  `/app/courses/[slug]/quiz`, `/app/certificates`, `/app/settings`
  (native-only biometric-unlock toggle).
- `/` (outside `[locale]`, its own minimal root layout+page) — client-side
  redirect to `/{browser-or-default-locale}/`. This is also Capacitor's
  required `webDir` entry file (`out/index.html`); static export has no
  middleware to do this redirect at request time, so it happens on load
  instead.

### Search + voice
`src/components/search/SearchCommand.tsx` (mounted in both public and app
headers) calls `GET /v1/university/search`, debounced via
`src/hooks/useDebouncedValue.ts`. The mic button records via the browser
`MediaRecorder` API (`src/hooks/useVoiceCapture.ts`) and posts to
`POST /v1/university/voice/transcribe`. Native (Capacitor) audio capture
isn't built yet — `MediaRecorder` doesn't behave the same in the Capacitor
WebView; needs a native audio-recording plugin (e.g.
`@capacitor-community/voice-recorder` or similar) wired the same way as
`src/lib/push.ts` before voice search works in the mobile app.

### Mobile (Capacitor) — built
Follows `wlkr-field-app`'s template exactly. `capacitor.config.ts`
(`appId: 'ai.wlkr.university'`, `webDir: 'out'`), native projects checked
in at `ios/` and `android/` (see `.gitignore` for the native build-artifact
exclusions, ported from field-app — the projects themselves are committed,
build output isn't).

- **Requires Node ≥22** for the Capacitor CLI (`.nvmrc` says `22`, matching
  `wlkr-field-app`) even though the Next.js app itself runs fine on 20 —
  run `nvm use` (or `nvm exec 22 ...`) before any `cap:*` script.
- `npm run cap:sync` → `next build && npx cap sync` (copies `out/` into
  `ios/App/App/public` and `android/app/src/main/assets/public`).
  `npm run cap:ios` / `cap:android` also open Xcode / Android Studio.
- **Token storage** (`src/lib/tokens.ts`): branches on `isNative()`
  (`src/lib/capacitor.ts`). Native uses `@aparajita/capacitor-secure-storage`
  (iOS Keychain / Android Keystore) via `src/lib/storage.ts`'s
  `secureStorage`, mirrored into an in-memory variable (hydrated once at
  boot via `hydrateTokensFromStorage()`, called from the auth store's
  `initialize()`) so the axios interceptor can still read it synchronously.
  Web is unchanged — still plain `localStorage`.
- **Biometric unlock** (`src/lib/biometrics.ts`, toggle at
  `/app/settings`): native-only, gates a *restored* session (tokens already
  pulled from Keychain/Keystore) behind Face ID/Touch ID/fingerprint via
  `@aparajita/capacitor-biometric-auth`. The auth store's `isLocked` state
  drives a lock screen in `[locale]/app/layout.tsx`. A non-sensitive cached
  user snapshot (`src/lib/session-cache.ts`, via `@capacitor/preferences`)
  lets the unlock screen and offline restore show something without a
  network round-trip.
- **Push notifications** (`src/lib/push.ts`, `@capacitor/push-notifications`,
  wired up in `src/components/NativeBootstrap.tsx` mounted from the root
  `[locale]/layout.tsx`): net new — no other Walkr repo has push wired yet.
  Registers for push on native start, forwards a tapped
  `{type: 'certificate_earned'}` notification to `/app/certificates`.
  **Backend gap**: `wlkr-ecko-server` has no device-token registration
  route yet — `registerDeviceToken()` POSTs to `/v1/university/push/register`,
  which 404s until that route is added (suggested shape:
  `POST /v1/university/push/register`, `requireAuth()`, body
  `{token, platform}`, upserting a `DeviceToken` doc keyed by
  `{userId, token}`; something else — a cron or the quiz-completion path in
  `certificateService.js` — would then send to APNs/FCM using it). Actually
  *sending* pushes is unbuilt entirely; this pass only wires the client to
  receive and register for them.
- Xcode, CocoaPods, and Android Studio were available in the environment
  this was built in and `npx cap sync` ran clean end-to-end; opening/
  archiving/signing the native projects for App Store / Play Store
  submission still needs to happen interactively in those IDEs.

### Conventions
- UI primitives in `src/components/ui/` are Radix+Tailwind (do **not** run
  `npx shadcn`), ported from `wlkr-ed-portal`. Only the primitives actually
  used were ported (`button`, `input`, `card`, `badge`, `spinner`) — port
  more from `wlkr-ed-portal/src/components/ui/` on demand (`dialog`,
  `select`, `tabs`, `avatar` exist there and weren't needed yet).
  Brand color is indigo/violet via `brand-*` tokens in `tailwind.config.ts`
  (distinct from `wlkr-ed-portal`'s teal and `wlkr-website`'s marketing
  tokens, since this is a distinct product).
- To add a new University API endpoint, add it to
  **`wlkr-ecko-server/src/routes/university/`** (not here), then add a
  matching method to the relevant API object in `src/lib/api.ts`.

## Visual style

Public, marketing, and auth heroes use low-poly 3D WLKR-game backgrounds with WLKR characters (Ecko and friends). This is the workspace rule `../.cursor/rules/university-lowpoly-visuals.mdc`, so follow it for any new hero or background. Current art: `public/images/campus-hero.jpg` (landing) and `public/images/signup-hero.jpg` (`/signup`).

## Known gaps / not yet built

- **Public media gallery**: `wlkr-ecko-server`'s `/v1/university/media` is
  educator-authenticated only (`TEACHER`+) — there's no public,
  link-whitelisted media route yet (the pattern to follow is
  `wlkr-ecko-server/src/routes/catalogMedia.js`). `[locale]/(public)/media`
  is a placeholder until that exists.
- **Mobile (Capacitor)**: not wrapped yet. Follow `wlkr-field-app`'s
  template — `capacitor.config.ts` (`appId: 'ai.wlkr.university'`,
  `webDir: 'out'`), `@aparajita/capacitor-secure-storage` for tokens instead
  of `localStorage`, `@capacitor/preferences` for non-sensitive prefs,
  `@capacitor/push-notifications` (net new in the Walkr platform — no
  existing repo has this wired). The `cap:sync`/`cap:ios`/`cap:android`
  npm scripts are stubs until this is done.
- **Voice capture on native**: `useVoiceCapture` uses the browser
  `MediaRecorder` API, which won't exist in the Capacitor WebView the same
  way — needs a native audio-recording plugin when mobile is built.
