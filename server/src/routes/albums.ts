// ============================================================================
// server/src/routes/albums.ts — album search endpoint
// ----------------------------------------------------------------------------
// PURPOSE
//   Thin HTTP layer for album lookup. Validates the query string, delegates
//   to services/itunes.ts, returns JSON. No iTunes-specific knowledge here —
//   if you ever swap iTunes for MusicBrainz/Spotify, this file barely changes.
//
// ENDPOINT (see "API contract" in the README)
//   GET /api/albums/search?term=<string>&limit=<n?>
//   200 → { albums: [{ id, title, artist, artworkUrl, artworkUrlHiRes }] }
//   400 → { error: 'term is required' }        (missing/empty term)
//   502 → { error: '...' }                     (iTunes upstream failed)
//
// WHAT GOES IN HERE
//   1. const router = express.Router()
//   2. router.get('/search', async (req, res, next) => { ... })
//        - read req.query.term (reject if empty/whitespace)
//        - clamp limit to something sane (default 20, max ~50)
//        - const albums = await searchAlbums(term, limit)   // itunes.ts
//        - res.json({ albums })
//        - wrap in try/catch → next(err)
//   3. export default router
//
// LINKS WITH
//   - services/itunes.ts        (does the actual API call + normalization)
//   - src/index.ts              (mounts this at /api/albums)
//   - client/src/api/client.ts  (the caller on the frontend)
// ============================================================================

import { Router } from 'express';
// import { searchAlbums } from '../services/itunes';

// TODO: implement router as described above.
