import type { Album, DiscogsResult } from '../types';
import { fetchWithRetries } from './fetchWithRetries';
const albumLimitPerSearch = 40;

/**
 * Discogs' API terms require the "Data provided by Discogs" credit to link back
 * to the release's own page, so every result needs a usable URL. `uri` comes
 * back as a site-relative path, so resolve it against the site root — and drop
 * anything that resolves off-domain (a protocol-relative "//host/x" would),
 * since this ends up as a link the user clicks. Falls back to the canonical
 * /release/:id form, which is always valid for a type=release search.
 */
function discogsPageUrl(r: DiscogsResult): string {
    const fallback = `https://www.discogs.com/release/${r.id}`;
    if (!r.uri) return fallback;

    try {
        const resolved = new URL(r.uri, 'https://www.discogs.com');
        const onDiscogs =
            resolved.hostname === 'discogs.com' || resolved.hostname.endsWith('.discogs.com');
        return onDiscogs && resolved.protocol === 'https:' ? resolved.href : fallback;
    } catch {
        return fallback;
    }
}

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
            'User-Agent': 'coverloop/1.1 (https://coverloop.vercel.app)',
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
            source: 'discogs' as const,
            sourceUrl: discogsPageUrl(r),
        };
    });
    return albums;

}