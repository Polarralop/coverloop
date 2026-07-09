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
import type { Request } from 'express';
import { searchAlbums } from '../services/musicbrainz';
import { searchAlbumsDiscogs } from '../services/discogs';

const router = Router();

function parseSearchParams(req: Request): { term: string; limit: number } | { error: string } {
  const rawTerm = req.query.term;
  if (typeof rawTerm !== 'string' || rawTerm.trim().length === 0) {
    return { error: 'term is required' };
  }
  const term = rawTerm.trim();

  const rawLimit = req.query.limit;
  const limit = rawLimit === undefined ? 20 : Number(rawLimit);
  if (Number.isNaN(limit)) {
    return { error: 'limit must be a number' };
  }
  if (limit > 50 || limit < 1) {
    return { error: 'limit must be between 1-50' };
  }

  return { term, limit };
}

router.get('/search', async (req, res, next) => {
  try {
    const parsed = parseSearchParams(req);
    if ('error' in parsed) {
      return res.status(400).json({ error: parsed.error });
    }
    const albums = await searchAlbums(parsed.term, parsed.limit);
    res.json({ albums });
  } catch (err) { next(err); }
});

router.get('/search-discogs', async (req, res, next) => {
  try {
    const parsed = parseSearchParams(req);
    if ('error' in parsed) {
      return res.status(400).json({ error: parsed.error });
    }
    const albums = await searchAlbumsDiscogs(parsed.term, parsed.limit);
    res.json({ albums });
  } catch (err) { next(err); }
});

export default router;
