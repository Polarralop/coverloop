import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import type { Album } from '../types';

// Mock all four services so no test touches a live API. vi.mock intercepts by
// resolved module id, so these cover the router's own imports too.
vi.mock('../services/deezer', () => ({ searchAlbumsDeezer: vi.fn() }));
vi.mock('../services/musicbrainz', () => ({ searchAlbumsMusicBrainz: vi.fn() }));
vi.mock('../services/discogs', () => ({ searchAlbumsDiscogs: vi.fn() }));
vi.mock('../services/igdb', () => ({ searchGames: vi.fn() }));

import app from '../app';
import { searchAlbumsDeezer } from '../services/deezer';
import { searchAlbumsMusicBrainz } from '../services/musicbrainz';
import { searchAlbumsDiscogs } from '../services/discogs';
import { searchGames } from '../services/igdb';

const sample: Album[] = [
  { id: 1, title: 'OK Computer', artist: 'Radiohead', artworkUrl: 'u', artworkUrlHiRes: 'v' },
];

// Every route must call exactly its own service — /search-musicbrainz once
// shipped calling the Discogs service, and typecheck can't catch that.
const routes = [
  { path: '/api/albums/search-deezer', service: searchAlbumsDeezer },
  { path: '/api/albums/search-musicbrainz', service: searchAlbumsMusicBrainz },
  { path: '/api/albums/search-discogs', service: searchAlbumsDiscogs },
  { path: '/api/albums/search-igdb', service: searchGames },
] as const;

const allServices = [searchAlbumsDeezer, searchAlbumsMusicBrainz, searchAlbumsDiscogs, searchGames];

beforeEach(() => {
  vi.clearAllMocks();
  for (const s of allServices) vi.mocked(s).mockResolvedValue(sample);
});

describe.each(routes)('GET $path', ({ path, service }) => {
  it('returns { albums } from its own service — and calls no other', async () => {
    const res = await request(app).get(path).query({ term: 'zelda' });

    expect(res.status).toBe(200);
    // The response key is the client contract: sendSearchParams reads
    // data.albums. A route replying { games } shipped once already.
    expect(res.body).toEqual({ albums: sample });

    expect(service).toHaveBeenCalledExactlyOnceWith('zelda', 40);
    for (const other of allServices.filter((s) => s !== service)) {
      expect(other).not.toHaveBeenCalled();
    }
  });

  it('passes the trimmed term and parsed limit through', async () => {
    await request(app).get(path).query({ term: '  chrono trigger  ', limit: '7' });
    expect(service).toHaveBeenCalledExactlyOnceWith('chrono trigger', 7);
  });

  it('400s on a missing term without calling the service', async () => {
    const res = await request(app).get(path);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'term is required' });
    expect(service).not.toHaveBeenCalled();
  });

  it('400s on a bad limit without calling the service', async () => {
    const res = await request(app).get(path).query({ term: 'zelda', limit: '1.5' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'limit must be a whole number' });
    expect(service).not.toHaveBeenCalled();
  });

  it('surfaces a service failure as a 500 with the error message', async () => {
    // The app-level error handler logs; keep test output clean.
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(service).mockRejectedValue(new Error('upstream down'));

    const res = await request(app).get(path).query({ term: 'zelda' });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'upstream down' });

    quiet.mockRestore();
  });
});

it('404s on an unknown search endpoint', async () => {
  const res = await request(app).get('/api/albums/search-nope').query({ term: 'zelda' });
  expect(res.status).toBe(404);
});
