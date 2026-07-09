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
//   1. const router = Router()
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
import { searchAlbums } from '../services/musicbrainz';

const router = Router();
router.get('/search', async (req, res, next) => {
    try {
        const rawTerm = req.query.term;
        if (typeof rawTerm !== 'string' || rawTerm.trim().length === 0) {
            return res.status(400).json({ error: 'term is required' });
        }
        const term = rawTerm.trim();

        const rawLimit = req.query.limit;
        const limit = rawLimit === undefined ? 20 : Number(rawLimit); // blank = 20
        if (Number.isNaN(limit)) {
            return res.status(400).json ({ error: 'limit is invalid' });
        }
        if (limit > 50 || limit < 1) {
            return res.status(400).json({ error: 'limit must be between 1-50'})
        }

        const albums = await searchAlbums(term, limit);
        res.json({ albums });
    } catch (err) {next(err);}

})

export default router;