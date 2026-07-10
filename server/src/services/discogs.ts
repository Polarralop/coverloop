import type { Album, DiscogsResult } from '../types';
import { fetchWithRetries } from './fetchWithRetries';
const albumLimitPerSearch = 40;

export async function searchAlbumsDiscogs(term: string, limit = albumLimitPerSearch): Promise<Album[]> {
    const token = process.env.DISCOGS_TOKEN;
    if (!token) 
        throw new Error('DISCOGS_TOKEN not set');

    const url = new URL('https://api.discogs.com/database/search');
    url.searchParams.set('q', term);
    url.searchParams.set('type', 'release');
    url.searchParams.set('format', 'Album');
    url.searchParams.set('per_page', String(limit));

    const pong = await fetchWithRetries(url, {
        headers: {
            'Authorization': `Discogs token=${token}`,
            'User-Agent': 'coverloop/0.1 (polarrralop@outlook.com)',
        },
    });
    if (!pong.ok)
        throw new Error(`Discogs search failed: ${pong.status}`);

    interface DiscogsSearchResponse {
        results: DiscogsResult[];
    }

    const data = (await pong.json()) as DiscogsSearchResponse;
    const albums: Album[] = data.results
    .filter((r) => r.title && r.cover_image)
    .map((r) => {
        const [artist, ...titleParts] = r.title!.split(' - ');
        return {
            id: r.id,
            artist: artist.trim(),
            title: titleParts.join(' - ').trim(),
            artworkUrl: r.thumb ?? r.cover_image!,
            artworkUrlHiRes: r.cover_image!,
        };
    });
    return albums;

}