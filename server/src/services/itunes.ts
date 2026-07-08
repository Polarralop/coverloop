// ============================================================================
// server/src/services/itunes.ts — iTunes Search API client
// ----------------------------------------------------------------------------
// PURPOSE
//   The ONLY file that knows anything about iTunes. Takes a search term,
//   returns a clean, normalized album list. Swap this file out and the rest
//   of the app never notices.
//
// THE API (free, no key, no auth)
//   GET https://itunes.apple.com/search
//     ?term=<url-encoded search>
//     &entity=album
//     &limit=<n>
//   Docs: https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/
//
//   Response shape (the fields you care about):
//     results: [{
//       collectionId,        → our `id`
//       collectionName,      → our `title`
//       artistName,          → our `artist`
//       artworkUrl100,       → 100x100 thumbnail URL
//       ...
//     }]
//
//   *** THE ARTWORK TRICK ***
//   artworkUrl100 ends in ".../100x100bb.jpg". Apple's CDN serves other
//   sizes if you just rewrite that segment:
//     artworkUrl100.replace('100x100bb', '600x600bb')   → hi-res version
//   Use the 100px one for grid thumbnails (fast) and the 600px one as the
//   GIF source (artworkUrlHiRes).
//
// WHAT GOES IN HERE
//   export async function searchAlbums(term, limit = 20) {
//     1. Build the URL with new URL(...) + searchParams (handles encoding).
//     2. const res = await fetch(url)          // Node 18+ global fetch
//        - if !res.ok, throw an Error (route layer turns it into a 502)
//     3. const data = await res.json()
//     4. Map data.results → { id, title, artist, artworkUrl, artworkUrlHiRes }
//        - skip entries missing artworkUrl100 (rare, but they'd break the GIF)
//   }
//
// LINKS WITH
//   - routes/albums.ts (only caller)
//
// GOTCHAS
//   - The API is rate-limited (~20 req/min-ish, unofficial). Fine for dev;
//     debounce searches on the client (see SearchBar.tsx) to stay under it.
//   - Responses are sometimes served with text/javascript content-type;
//     res.json() still parses it fine.
// ============================================================================

// TODO: implement searchAlbums(term, limit) as described above.
