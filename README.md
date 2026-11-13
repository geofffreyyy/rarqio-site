# Rarqio – website

Landing, support, privacy and credits page for **Rarqio**, the iPhone and iPad
quiz game. Static HTML/CSS with a little vanilla JS: no build step, no framework,
no cookies, no analytics, no third-party requests (system fonts, everything
self-hosted).

**Status:** live on GitHub Pages at <https://geofffreyyy.github.io/rarqio-site/>,
published from `main` (root). The app itself is still in development, so the
page says "Coming soon to the App Store" and has no App Store link yet.

## Address

The page is served by GitHub Pages at
<https://geofffreyyy.github.io/rarqio-site/> (repository `geofffreyyy/rarqio-site`).
That address is hard-coded in:

- `index.html`: `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`
- `404.html`: the home link and the icon links (`/rarqio-site/…`)

If the repository name or domain changes, update those lines.

## App Store Connect URLs

- Support URL: `https://geofffreyyy.github.io/rarqio-site/#support`
  (shows the support email and a bug-report checklist)
- Privacy Policy URL: `https://geofffreyyy.github.io/rarqio-site/#privacy`

## Preview locally

```bash
cd ~/Developer/rarqio-site && python3 -m http.server 8000
```

Then open <http://localhost:8000/> (add `?lang=fr` or `?lang=en` to force a
language). `python3 -m http.server` does not serve `404.html` for missing paths;
open `/404.html` directly to see it (its icon links point at `/rarqio-site/` and
only resolve on GitHub Pages).

## Files

- `index.html` – the whole page: hero, sample questions, `#how`, `#rarity`,
  `#modes`, `#after`, `#questions`, `#profile`, `#faq`, `#support`, `#privacy`,
  `#credits`
- `styles.css` – all styles; the app's colours are CSS variables at the top
- `lang.js` – picks the language before first paint (`?lang=` → saved choice →
  browser language); loaded synchronously in `<head>`
- `script.js` – FR/EN buttons (remembers the choice in `localStorage`) and the
  score calculator in `#rarity`
- `404.html` – self-contained "page not found", both languages
- `assets/` – icon sizes made from the app icon with `sips`
  (`favicon-32/64`, `apple-touch-icon` 180, `icon-96/192/512`)
- `screens/` – simulator screenshots, 900 px wide, WebP with JPEG fallback,
  `<screen>-<fr|en>.<webp|jpg>`
- `robots.txt`, `.nojekyll`

## Editing text (French + English)

Every piece of text exists twice, side by side:

```html
<span lang="en">How it plays</span><span lang="fr">Le principe</span>
<p lang="en">…</p>
<p lang="fr">…</p>
```

CSS hides whichever language is not active. Without JavaScript the page shows
English. Attributes that can't hold two spans (`aria-label`) use a
`data-fr-…` twin, e.g. `aria-label="Language" data-fr-aria-label="Langue"`.
Screenshots work the same way: each phone has a `<picture lang="en">` and a
`<picture lang="fr">`, each with its own `alt`; the hidden one is lazy and never
downloaded.

When you change the privacy policy, update the effective date in both languages.

## Content Security Policy

`index.html` carries a strict CSP (`default-src 'self'`, no inline script, no
inline style). Keep it that way:

- no `<script>` or `<style>` blocks and no `style="…"` attributes in
  `index.html`; put code in `script.js` / `styles.css` (the ladder bar widths in
  `#rarity` are `nth-child` rules in `styles.css` for that reason)
- no external URLs for scripts, styles, fonts or images

`404.html` has one inline `<style>`, allowed by its SHA-256 hash in that page's
CSP. If you edit that style, recompute the hash and paste it into the CSP:

```bash
python3 -c "import re,hashlib,base64;s=open('404.html',encoding='utf-8').read();print(base64.b64encode(hashlib.sha256(re.search(r'<style>(.*?)</style>',s,re.S).group(1).encode()).digest()).decode())"
```

Note: GitHub Pages can't send HTTP headers, so `frame-ancestors` (which only
works as a header) is not set.

## Where the facts come from

Everything on the page is taken from the app project (read-only), mainly
`Docs/PRODUCT.md`, `Docs/STATUS.md`, `Docs/ARCHITECTURE.md`, `README.md`,
`Configuration/` (version, Info.plist, entitlements), `App/Resources/`
(`Localizable.xcstrings`, `PrivacyInfo.xcprivacy`, `ContentNotices*.txt`),
`ContentSources/README.md`, the generated catalogue
(`Packages/GameCore/Sources/GameCore/Resources/catalog.*.json`) and the Swift
sources (score formula in `GameCore/AnswerMatcher.swift`, tier colours in
`App/DesignSystem/ArcadeComponents.swift`, setup options in
`App/Features/Setup/SetupView.swift`).

Numbers to re-check against the release build before publishing:
3,960 questions per language, 24 themes, Movies 748 / Comics 61, the Cyrano
example in `#rarity` (answers and rarities), the settings (1/3/5/7/9 rounds,
10–60 s), iOS 17+, and the credits list.

## Before publishing

1. Confirm the address above (repository name, domain).
2. Replace the "Coming soon" badges with the App Store link, and add the
   Smart App Banner (see the `TODO` comment in `<head>`).
3. Update the privacy policy's effective date and check it against the final
   app (Game Center use, local data, App Privacy answers in App Store Connect).
4. Re-check the numbers listed above and refresh the screenshots if the UI changed.
5. `robots.txt` only takes effect at a domain root; on a project site
   (`…github.io/rarqio-site/`) crawlers read `geofffreyyy.github.io/robots.txt`
   instead. It is here for a custom domain.
