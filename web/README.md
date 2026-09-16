# Purplecoins Download Website

A standalone download website for <https://purplevarun.github.io/purplecoins/>.
All website code, assets, dependencies, and configuration live in this folder.
The mobile app is not a dependency. Only the
[Pages workflow](../.github/workflows/deploy-pages.yml) lives outside it,
as required by GitHub Actions.

## Local Development

Use Node.js 24 or newer:

```sh
cd web
npm ci
npm run dev
```

Open the URL printed by Vite, including `/purplecoins/`.

The Vite config fetches the latest stable GitHub release at startup/build time.
If your network blocks Node's GitHub requests, use an authenticated GitHub CLI
to supply the same response, without disabling TLS verification:

```sh
GITHUB_RELEASE_JSON="$(gh api repos/purplevarun/purplecoins/releases/latest)" npm run dev
```

The same prefix works with `npm run build` and `npm run preview`. On normal
networks, `GITHUB_TOKEN` can optionally authenticate the build-time API request.
Neither the token nor the raw API response is shipped to the browser.

## Checks and Build

```sh
npm test
npm run lint
npm run format:check
npm run build
npm run preview
```

The production site is generated in `dist/`. The build fails if it cannot obtain
valid release metadata, rather than publishing a guessed APK link.

## Download Behavior

The page links directly to the APK's `browser_download_url`, so clicking Download
starts the file download without visiting the release page. The browser may still
ask for download confirmation. The current release has one versioned APK; future
releases with multiple architecture-specific APKs need an explicitly named
`universal` APK to avoid choosing the wrong build for a visitor's phone.

The browser refreshes the latest release metadata on load. If GitHub is unreachable
or rate-limits the request, the page retains the build-time download and labels it
as the last fetched release, with a retry button. No API tokens, analytics, external
font requests, or application data are used in the client.

## GitHub Pages

The Pages workflow builds only this folder with `npm ci`, checks it, and deploys
`dist/` using GitHub's Pages artifact actions. It runs for changes under `web/`,
published/edited stable releases, manual dispatches, and a daily refresh. Release
assets uploaded after the initial release event are picked up by a later refresh
or by the browser's live check. Pages must use **GitHub Actions** as its build source.

Vite also builds [404.html](404.html) into the root of `dist/`. GitHub Pages serves
it for missing URLs with a 404 status. It shares the website's styles and uses
base-prefixed asset and home links, so nested missing URLs work too. The return
link works without JavaScript. Vite's local preview uses an SPA fallback for unknown
URLs; open `/purplecoins/404.html` to preview the custom page locally.

## Privacy Policy

[privacy.html](privacy.html) is the privacy policy for the Android app and website.
The homepage footer links to it, and Vite emits it as a standalone page that works
without JavaScript, including when opened directly or refreshed.

After the website changes are deployed, the public policy URL is
<https://purplevarun.github.io/purplecoins/privacy.html>. Use this URL for app-store
privacy-policy fields. Locally, open `/purplecoins/privacy.html` on the Vite server.
The existing Pages workflow publishes the page with the rest of `dist/` when the
changes are pushed to `main`.

Keep the policy aligned with the app's actual data handling, especially unencrypted
exports, Android system backups and third-party exchange-rate requests. The current
contact channel is the public GitHub issue tracker; never request sensitive records
or backups in public issues.

## Android Installation

The page can start the download and reveal installation guidance, but a website
cannot grant **Install unknown apps**, dismiss Play Protect, or silently install an
APK. Android requires the user's approval; device management and regional Android
developer-verification requirements can impose additional restrictions.

Keep Play Protect enabled. Distribute a consistently signed release APK. Publishing
through Google Play, including an appropriate testing track, avoids the browser
sideloading permission flow. Managed Google Play can handle organization-owned
devices under an administrator's policies; it is not a bypass for personal phones.

See [Google Play Protect guidance](https://support.google.com/android/answer/2812853)
and [Android developer verification](https://developer.android.com/developer-verification).
