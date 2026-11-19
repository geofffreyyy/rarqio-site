#!/usr/bin/env python3
"""The day Rarqio is on the App Store: switch the page from "Coming soon" to the store link.

    python3 tools/launch.py https://apps.apple.com/app/id6834092888

Run it from the repository root, once, after checking that the address opens the app's
page. It edits index.html and styles.css: the Smart App Banner, the App Store button in
the opening and in the status band, the status note, the FAQ entry and the link-preview
descriptions. Every replacement is checked before anything is written, so a page that has
changed since this script was written is left untouched and the script says what it missed.
Then preview the page, update the README's status line, commit and push.
"""
import pathlib
import re
import sys

if len(sys.argv) != 2 or not re.fullmatch(r"https://apps\.apple\.com/(?:[a-z]{2}/)?app/(?:[^/]+/)?id\d+", sys.argv[1]):
    sys.exit(__doc__)
URL = sys.argv[1]
APP_ID = re.search(r"id(\d+)$", URL).group(1)

BUTTON = f"""<a class="appstore" href="{URL}">
              <svg class="apple" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.5 1.3 0 1.7-.8 3.3-.8 1.5 0 1.9.8 3.3.8 1.4 0 2.2-1.2 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.2zM13.9 5.3c.7-.8 1.2-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z"/></svg>
              <span class="appstore-text">
                <span lang="en"><small>Download on the</small> <strong>App Store</strong></span>
                <span lang="fr"><small>Télécharger dans l’</small><strong>App Store</strong></span>
              </span>
            </a>"""

EDITS = [
    # (what it is, text to find, how many times, replacement)
    ("Smart App Banner",
     """  <!-- TODO: once Rarqio is on the App Store, add the Smart App Banner and link the badges:
       <meta name="apple-itunes-app" content="app-id=APP_STORE_ID"> -->
""", 1, f"""  <meta name="apple-itunes-app" content="app-id={APP_ID}">
"""),
    ("link-preview descriptions",
     "the rarer it is, the more it scores. Coming soon to the App Store.", 2,
     "the rarer it is, the more it scores. Free on the App Store."),
    ("page description",
     "in French and English. Coming soon to the App Store.", 1,
     "in French and English. Free on the App Store."),
    ("button in the opening",
     """<p class="soon"><span lang="en">Coming soon to the App Store</span><span lang="fr">Bientôt sur l’App Store</span></p>""", 1,
     BUTTON),
    ("status note",
     """<span lang="en">Version 1.0 is with Apple for review. iOS 17 or later, iPhone and iPad, in French and English.</span><span lang="fr">La version 1.0 est en cours de validation chez Apple. iOS&nbsp;17 ou ultérieur, iPhone et iPad, en français et en anglais.</span>""", 1,
     """<span lang="en">Free. iOS 17 or later, iPhone and iPad, in French and English.</span><span lang="fr">Gratuite. iOS&nbsp;17 ou ultérieur, iPhone et iPad, en français et en anglais.</span>"""),
    ("status band, title",
     """<span lang="en">Rarqio is on its way to the App Store.</span><span lang="fr">Rarqio arrive bientôt sur l’App Store.</span>""", 1,
     """<span lang="en">Rarqio is on the App Store.</span><span lang="fr">Rarqio est sur l’App Store.</span>"""),
    ("status band, text",
     """            <p lang="en">It isn’t available yet. When it is, this page will link to it.</p>
            <p lang="fr">L’app n’est pas encore disponible. Dès qu’elle le sera, cette page renverra vers elle.</p>
""", 1,
     """            <p lang="en">Free, with no ads and no in-app purchases.</p>
            <p lang="fr">Gratuite, sans pub ni achat intégré.</p>
"""),
    ("status band, button",
     """<p class="soon"><span lang="en">Coming soon</span><span lang="fr">Bientôt</span></p>""", 1,
     BUTTON),
    ("FAQ, question",
     """<span lang="en">When can I download it?</span><span lang="fr">Quand pourrai-je la télécharger&nbsp;?</span>""", 1,
     """<span lang="en">Where can I download it?</span><span lang="fr">Où la télécharger&nbsp;?</span>"""),
    ("FAQ, answer (English)",
     """<p lang="en">Rarqio is not on the App Store yet: version 1.0 is with Apple for review. This page will link to it as soon as it is out.</p>""", 1,
     f"""<p lang="en">On the App Store, for free: <a href="{URL}">Rarqio on the App Store</a>. It needs iOS 17 or later, on iPhone or iPad.</p>"""),
    ("FAQ, answer (French)",
     """<p lang="fr">Rarqio n’est pas encore sur l’App Store&nbsp;: la version 1.0 est en cours de validation chez Apple. Cette page renverra vers elle dès sa sortie.</p>""", 1,
     f"""<p lang="fr">Sur l’App Store, gratuitement&nbsp;: <a href="{URL}">Rarqio sur l’App Store</a>. Il faut iOS&nbsp;17 ou ultérieur, sur iPhone ou iPad.</p>"""),
]

STYLES = """
/* ---------- App Store button ---------- */
.appstore {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 58px;
  padding: 9px 22px 9px 18px;
  border-radius: 14px;
  background: #fff;
  color: #000;
  text-decoration: none;
  box-shadow: 0 14px 36px -14px rgba(200, 240, 49, 0.6);
  transition: transform 0.2s, box-shadow 0.2s;
}

.appstore:hover {
  color: #000;
  transform: translateY(-2px);
  box-shadow: 0 20px 44px -14px rgba(200, 240, 49, 0.8);
}

.appstore .apple {
  flex: none;
  width: 28px;
  height: 28px;
  margin-top: -3px;
}

.appstore-text > span {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
  text-align: left;
}

.appstore-text small {
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.appstore-text strong {
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

@media (prefers-reduced-motion: reduce) {
  .appstore,
  .appstore:hover {
    transform: none;
    transition: none;
  }
}
"""

page = pathlib.Path("index.html")
sheet = pathlib.Path("styles.css")
html = page.read_text(encoding="utf-8")
css = sheet.read_text(encoding="utf-8")
missing = [f"{name}: found {html.count(old)} time(s), expected {count}" for name, old, count, _ in EDITS if html.count(old) != count]
if ".appstore {" in css:
    missing.append("styles.css already has the App Store button: the switch seems to have been made")
if missing:
    sys.exit("Nothing was changed.\n- " + "\n- ".join(missing))
for _, old, _, new in EDITS:
    html = html.replace(old, new)
page.write_text(html, encoding="utf-8")
sheet.write_text(css + STYLES, encoding="utf-8")
print(f"Switched to the App Store link ({URL}, app id {APP_ID}). Preview the page, then update the README.")
