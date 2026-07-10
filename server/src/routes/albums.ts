import { Router } from 'express';
import type { Request } from 'express';
import { searchAlbums } from '../services/musicbrainz';
import { searchAlbumsDiscogs } from '../services/discogs';

const router = Router();
const albumLimitPerSearch = 40;


function parseSearchParams(req: Request): { term: string; limit: number } | { error: string } {
  const rawTerm = req.query.term;
  if (typeof rawTerm !== 'string' || rawTerm.trim().length === 0) {
    return { error: 'term is required' };
  }
  const term = rawTerm.trim();

  const rawLimit = req.query.limit;
  const limit = rawLimit === undefined ? albumLimitPerSearch : Number(rawLimit);
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
