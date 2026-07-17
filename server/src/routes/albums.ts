import { Router } from 'express';
import type { Request } from 'express';
import type { Album } from '../types';
import { searchAlbumsMusicBrainz } from '../services/musicbrainz';
import { searchAlbumsDeezer } from '../services/deezer';
import { searchAlbumsDiscogs } from '../services/discogs';
import { searchGames } from '../services/igdb';

const router = Router();
const albumLimitPerSearch = 40;


// Exported for unit tests (parseSearchParams.test.ts) — not part of the route API.
export function parseSearchParams(req: Request): { term: string; limit: number } | { error: string } {
  const rawTerm = req.query.term;
  if (typeof rawTerm !== 'string' || rawTerm.trim().length === 0) {
    return { error: 'term is required' };
  }
  const term = rawTerm.trim();

  const rawLimit = req.query.limit;
  const limit = rawLimit === undefined ? albumLimitPerSearch : Number(rawLimit);
  if (!Number.isInteger(limit)) {
    return { error: 'limit must be a whole number' };
  }
  if (limit > 50 || limit < 1) {
    return { error: 'limit must be between 1-50' };
  }

  return { term, limit };
}

/**
 * Every search route is the same shape: validate, call one service, reply with
 * { albums }. Registering them from a table writes that shape once, so a new
 * source can't wire itself to the wrong service or invent its own response key
 * — both of which have already happened here.
 */
const searchSources: Record<string, (term: string, limit: number) => Promise<Album[]>> = {
  'search-deezer': searchAlbumsDeezer,
  'search-musicbrainz': searchAlbumsMusicBrainz,
  'search-discogs': searchAlbumsDiscogs,
  'search-igdb': searchGames,
};

for (const [path, search] of Object.entries(searchSources)) {
  router.get(`/${path}`, async (req, res, next) => {
    try {
      const parsed = parseSearchParams(req);
      if ('error' in parsed) {
        return res.status(400).json({ error: parsed.error });
      }
      const albums = await search(parsed.term, parsed.limit);
      res.json({ albums });
    } catch (err) { next(err); }
  });
}

export default router;
