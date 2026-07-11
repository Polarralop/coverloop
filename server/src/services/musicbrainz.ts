import type { Album, MusicBrainzResult } from '../types';
import { fetchWithRetries } from './fetchWithRetries';
const albumLimitPerSearch = 40;

function rankByExactness(albums: Album[], term: string): Album[] {
  const normalizedTerm = term.trim().toLowerCase();

  return [...albums].sort((a, b) => {
    const aExact = a.title.trim().toLowerCase() === normalizedTerm;
    const bExact = b.title.trim().toLowerCase() === normalizedTerm;

    if (aExact && !bExact) return -1;
    if (bExact && !aExact) return 1;
    return 0; // preserve MusicBrainz's original relative order otherwise
  });
}

export async function searchAlbumsMusicBrainz(term: string, limit = albumLimitPerSearch): Promise<Album[]> {
  const url = new URL('https://musicbrainz.org/ws/2/release-group/');
  url.searchParams.set('query', `(artist:"${term}" OR releasegroup:"${term}") AND status:official AND (primarytype:Album OR primarytype:EP) AND -secondarytype:*`);
  url.searchParams.set('fmt', 'json');
  url.searchParams.set('limit', String(limit));

  const pong = await fetchWithRetries(url, {
    headers: {
      'User-Agent': 'Coverloop/0.1 (polarrralop@outlook.com)',
    },
  });

  if (!pong.ok) {
    throw new Error(`MusicBrainz search failed: ${pong.status}`);
  }

  interface MusicBrainzSearchResponse {
    'release-groups': MusicBrainzResult[];
  }

  const data = (await pong.json()) as MusicBrainzSearchResponse;
  const albums: Album[] = data['release-groups']
  .filter((r: MusicBrainzResult) => r.title && r['artist-credit']?.[0]?.name)
  .map((r: MusicBrainzResult) => ({
    id: r.id,
    title: r.title!,
    artist: r['artist-credit']![0].name,
    artworkUrl: `https://coverartarchive.org/release-group/${r.id}/front-500`,
    artworkUrlHiRes: `https://coverartarchive.org/release-group/${r.id}/front-500`,
  }));

  return rankByExactness(albums, term);

}