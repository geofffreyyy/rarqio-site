# Universal links: daily challenge and room invitations

Apple only reads the association file at the root of the domain:
`https://geofffreyyy.github.io/.well-known/apple-app-site-association`.
This project site lives under `/rarqio-site/`, so the file cannot be served from
this repository. It is served by the account's root site, and it already exists
there for LastHit (checked on 14 November 2026).

The file in this folder is that same file with one entry added for Rarqio.
The LastHit entry is kept as it is: replacing the file without it would break
LastHit's invitation links.

To publish: replace `.well-known/apple-app-site-association` in the root site
with this file, then check that the URL above answers with both entries.
An iPhone reads the file when the app is installed or updated, so the link opens
the app only from a build installed after the file is online.

Until then the shared link opens the `defi/` page in the browser, and its button
opens the app through `rarqio://defi`.

Since 18 November 2026 the Rarqio entry also lists `daily`, `salon` and `room` (room
invitation links). Apple serves the file to iPhones through its own cache, which can lag
some hours behind a change; meanwhile a room link opens the web page and its button opens
the app.
