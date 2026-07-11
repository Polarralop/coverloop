import type { Album, DeezerAlbumResult } from '../types';
import { fetchWithRetries } from './fetchWithRetries';
const albumLimitPerSearch = 40;

export async function searchAlbumsDeezer(term: string, limit = albumLimitPerSearch): Promise<Album[]> {
  const url = new URL('https://api.deezer.com/search/album');
  url.searchParams.set('q', term);
  url.searchParams.set('order', 'RANKING');   // popularity-first (the whole point of Deezer)
  url.searchParams.set('limit', String(limit));

  const pong = await fetchWithRetries(url, {
    headers: {
      'User-Agent': 'Coverloop/0.1 (https://coverloop.vercel.app)',
    },
  });

  if (!pong.ok) {
    throw new Error(`Deezer search failed: ${pong.status}`);
  }

  interface DeezerSearchResponse {
    data?: DeezerAlbumResult[];
    error?: { code: number; message: string };
  }

  const data = (await pong.json()) as DeezerSearchResponse;

  // Deezer reports quota/errors in a 200 body's `error` field, NOT via status.
  if (data.error) {
    throw new Error(`Deezer API error ${data.error.code}: ${data.error.message}`);
  }

  const albums: Album[] = (data.data ?? [])
    .filter((r) => r.record_type === 'album' || r.record_type === 'ep')  // drop singles
    .filter((r) => r.title && r.artist?.name && r.cover_big)             // need art
    .map((r) => ({
      id: r.id,
      title: r.title!,
      artist: r.artist!.name,
      artworkUrl: r.cover_medium ?? r.cover_big!,   // lighter thumb for the grid
      artworkUrlHiRes: r.cover_xl ?? r.cover_big!,  // sharpest source for the GIF frame
    }));

  return albums;
}
