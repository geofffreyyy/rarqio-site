# Universal link for the daily challenge

Apple only reads the association file at the root of the domain:
`https://geofffreyyy.github.io/.well-known/apple-app-site-association`.
This project site lives under `/rarqio-site/`, so the file cannot be served from
this repository. It belongs in the account's root site repository
(`geofffreyyy/geofffreyyy.github.io`), which does not exist yet:

1. Create the public repository `geofffreyyy.github.io`.
2. Add an empty `.nojekyll` file at its root (GitHub Pages ignores folders that
   start with a dot otherwise).
3. Copy `apple-app-site-association` (no extension) to `.well-known/` there.
4. Check: the URL above answers with the JSON, without a redirect.

Until then the shared link opens the `defi/` page in the browser, and its button
opens the app through `rarqio://defi`.
