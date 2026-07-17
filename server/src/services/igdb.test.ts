import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { IgdbGameResult } from '../types';

const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }));
vi.mock('./fetchWithRetries', () => ({ fetchWithRetries: mockFetch }));

import { searchGames, toAlbum } from './igdb';

function jsonResponse(body: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

const game = (over: Partial<IgdbGameResult>): IgdbGameResult => ({
  id: 1,
  name: 'Some Game',
  cover: { image_id: 'co0001' },
  ...over,
});

// Routes the mocked fetch: Twitch token endpoint vs the two IGDB query shapes
// (the ranked query contains `sort rating_count`, the relevance query `search "`).
function primeIgdb(ranked: IgdbGameResult[], relevant: IgdbGameResult[]) {
  mockFetch.mockImplementation(async (url: URL | string, options?: { body?: string }) => {
    if (String(url).includes('id.twitch.tv')) {
      return jsonResponse({ access_token: 'test-token', expires_in: 3600 });
    }
    const body = options?.body ?? '';
    if (body.includes('sort rating_count')) return jsonResponse(ranked);
    if (body.includes('search "')) return jsonResponse(relevant);
    throw new Error(`unrecognised IGDB body: ${body}`);
  });
}

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubEnv('TWITCH_CLIENT_ID', 'id');
  vi.stubEnv('TWITCH_CLIENT_SECRET', 'secret');
});

describe('toAlbum', () => {
  it('maps id, title, and both image sizes from image_id', () => {
    const album = toAlbum(game({ id: 1074, name: 'Super Mario 64', cover: { image_id: 'co721v' } }));
    expect(album).toEqual({
      id: 1074,
      title: 'Super Mario 64',
      artist: '',
      artworkUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co721v.jpg',
      artworkUrlHiRes: 'https://images.igdb.com/igdb/image/upload/t_1080p/co721v.jpg',
    });
  });

  it('converts first_release_date (Unix seconds) to a year string', () => {
    // 1996-06-23 00:00 UTC — Super Mario 64's real release date.
    expect(toAlbum(game({ first_release_date: 835488000 })).artist).toBe('1996');
  });

  it('uses UTC for the year — a Jan-1-UTC date must not shift to the prior year west of UTC', () => {
    // 1996-01-01 00:00 UTC. With getFullYear() this is '1995' on any
    // negative-offset machine (e.g. a dev box in Canada); getUTCFullYear pins it.
    expect(toAlbum(game({ first_release_date: 820454400 })).artist).toBe('1996');
  });

  it('leaves artist empty when first_release_date is absent (unreleased games)', () => {
    expect(toAlbum(game({})).artist).toBe('');
  });
});

describe('searchGames', () => {
  it('merges both queries, dropping duplicates by id', async () => {
    const shared = game({ id: 7, name: 'Breath of the Wild', rating_count: 2916 });
    primeIgdb([shared, game({ id: 8, name: 'Ocarina of Time', rating_count: 2127 })],
              [shared, game({ id: 9, name: 'Second Wind', rating_count: 7 })]);

    const results = await searchGames('zelda');
    expect(results.map((a) => a.id)).toEqual([7, 8, 9]);
  });

  it('re-ranks the union by rating_count so a popular search hit beats ranked junk', async () => {
    // The "botw" case: the name-match query returns junk, the relevance query
    // has the real answer. Fallback-on-zero would never fire; the merge must
    // float the real match on rating_count.
    primeIgdb(
      [game({ id: 1, name: 'Botworld Odyssey' }), game({ id: 2, name: 'RobotWar', rating_count: 3 })],
      [game({ id: 3, name: 'Breath of the Wild', rating_count: 2916 })],
    );

    const results = await searchGames('botw');
    expect(results.map((a) => a.title)).toEqual(['Breath of the Wild', 'RobotWar', 'Botworld Odyssey']);
  });

  it('keeps games with no rating_count rather than dropping them (they sink, not vanish)', async () => {
    primeIgdb([game({ id: 1, name: 'Animal Well' })], []);
    const results = await searchGames('animal well');
    expect(results.map((a) => a.title)).toEqual(['Animal Well']);
  });

  it('caps the merged union at limit', async () => {
    const ranked = Array.from({ length: 5 }, (_, i) => game({ id: i + 1, name: `R${i}`, rating_count: 100 - i }));
    const relevant = Array.from({ length: 5 }, (_, i) => game({ id: i + 100, name: `S${i}`, rating_count: 50 - i }));
    primeIgdb(ranked, relevant);

    const results = await searchGames('zelda', 6);
    expect(results).toHaveLength(6);
  });

  it('filters results without a cover', async () => {
    primeIgdb([game({ id: 1, cover: undefined }), game({ id: 2, name: 'Has Cover' })], []);
    const results = await searchGames('x');
    expect(results.map((a) => a.title)).toEqual(['Has Cover']);
  });

  it('strips quotes from the term before embedding it in the query body', async () => {
    primeIgdb([], []);
    await searchGames('"zelda"');

    const igdbBodies = mockFetch.mock.calls
      .filter(([url]) => String(url).includes('api.igdb.com'))
      .map(([, opts]) => (opts as { body: string }).body);
    expect(igdbBodies.length).toBeGreaterThan(0);
    for (const body of igdbBodies) {
      expect(body).toContain('"zelda"');       // the query's own quoting survives
      expect(body).not.toContain('""zelda""'); // the user's quotes do not
    }
  });

  it('reuses the cached token across searches instead of re-authing with Twitch', async () => {
    primeIgdb([], []);
    await searchGames('first');
    await searchGames('second');

    const twitchCalls = mockFetch.mock.calls.filter(([url]) => String(url).includes('id.twitch.tv'));
    // The cache is module-level, so earlier tests may already have primed it —
    // asserting "at most one" here still proves no per-search re-auth.
    expect(twitchCalls.length).toBeLessThanOrEqual(1);
  });

  it('throws when TWITCH_CLIENT_ID is missing', async () => {
    vi.stubEnv('TWITCH_CLIENT_ID', '');
    await expect(searchGames('zelda')).rejects.toThrow('TWITCH_CLIENT_ID not set');
  });

  it('throws on a non-2xx IGDB response', async () => {
    mockFetch.mockImplementation(async (url: URL | string) => {
      if (String(url).includes('id.twitch.tv')) {
        return jsonResponse({ access_token: 'test-token', expires_in: 3600 });
      }
      return jsonResponse([{ title: 'Not Acceptable Query' }], 406);
    });

    await expect(searchGames('zelda')).rejects.toThrow('IGDB search failed: 406');
  });
});
