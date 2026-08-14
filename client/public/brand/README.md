# Third-party brand assets

Files here are served by Vite at the site root — `client/public/brand/x.svg` is
requested as `/brand/x.svg`.

## deezer-logo.svg — REQUIRED, not yet added

Deezer's developer guidelines require apps using their API to display a visible
Deezer **logo** (not just a text credit). The official asset can't be redrawn or
recoloured by hand, and isn't checked in here.

To satisfy the guideline:

1. Download the official logo from <https://developers.deezer.com/guidelines/logo>.
2. Save it, unmodified, as `client/public/brand/deezer-logo.svg`.

Until that file exists, `DeezerBadge` renders a plain text wordmark fallback so
the footer layout still works — but the requirement is **not** met in that state.

Check the current guidelines page for sizing, clear-space and light/dark variant
rules before shipping; the badge sits on the app's dark background (`#141416`),
so the light/white variant is usually the correct one.
