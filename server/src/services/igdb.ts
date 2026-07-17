import type { Album, IgdbGameResult } from '../types';
import { fetchWithRetries } from './fetchWithRetries';
const GameLimitPerSearch = 40;

// Twitch client_credentials tokens last ~60 days, so cache and reuse it rather
// than paying an auth round-trip on every search.
let cachedToken: { token: string; expiresAt: number } | null = null;
const TOKEN_EXPIRY_BUFFER_MS = 60_000;

function igdbImageUrl(imageId: string, size: string): string {
    return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}

// Read env inside the call (like discogs.ts) — module-scope reads can land
// before dotenv/config runs, and this narrows both values to string.
function getCredentials(): { clientId: string; clientSecret: string } {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId) {
        throw new Error('TWITCH_CLIENT_ID not set');
    }

    if (!clientSecret) {
        throw new Error('TWITCH_CLIENT_SECRET not set');
    }

    return { clientId, clientSecret };
}

async function getToken(clientId: string, clientSecret: string): Promise<string> {
    if (cachedToken && Date.now() < cachedToken.expiresAt) {
        return cachedToken.token;
    }

    const url = new URL('https://id.twitch.tv/oauth2/token');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('client_secret', clientSecret);
    url.searchParams.set('grant_type', 'client_credentials');

    const pong = await fetchWithRetries(url, {
        method: 'POST',
    });

    if (!pong.ok) {
        throw new Error(`POST to Twitch failed: ${pong.status}`);
    }

    interface TwitchTokenResult {
        access_token?: string;
        expires_in?: number;   // seconds
    }

    const data = (await pong.json()) as TwitchTokenResult;

    if (!data.access_token || !data.expires_in) {
        throw new Error('Twitch API returned bad token.');
    }

    cachedToken = {
        token: data.access_token,
        expiresAt: Date.now() + data.expires_in * 1000 - TOKEN_EXPIRY_BUFFER_MS,
    };

    return cachedToken.token;
}

const FIELDS = 'fields name, cover.image_id, first_release_date, rating_count;';

async function runQuery(body: string): Promise<IgdbGameResult[]> {
    const { clientId, clientSecret } = getCredentials();
    const token = await getToken(clientId, clientSecret);

    const pong = await fetchWithRetries(new URL('https://api.igdb.com/v4/games'), {
        method: 'POST',
        headers: {
            'Client-ID': clientId,
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'Coverloop/1.1 (https://coverloop.vercel.app)',
        },
        body,
    });

    if (!pong.ok) {
        throw new Error(`IGDB search failed: ${pong.status}`);
    }

    // IGDB replies with a bare JSON array, not an object wrapper.
    const data = (await pong.json()) as IgdbGameResult[];

    return (data ?? []).filter((r) => r.id && r.name && r.cover?.image_id);
}

function toAlbum(r: IgdbGameResult): Album {
    return {
        id: r.id,
        title: r.name,
        // first_release_date is Unix *seconds*; unreleased games omit it.
        artist: r.first_release_date
            ? String(new Date(r.first_release_date * 1000).getFullYear())
            : '',
        artworkUrl: igdbImageUrl(r.cover!.image_id, 'cover_big'),   // 264x352 thumb for the grid
        artworkUrlHiRes: igdbImageUrl(r.cover!.image_id, '1080p'),  // sharpest source for the GIF frame
    };
}

/**
 * Two queries merged, because neither alone is good enough:
 *
 *   - IGDB rejects `search` + `sort` together (HTTP 406), and `search` alone
 *     ranks purely on text relevance with no popularity signal — "mario"
 *     surfaces Olympic spin-offs over Super Mario 64.
 *   - A `name ~` match can be sorted by rating_count and nails that case, but
 *     `~` is a *contiguous substring* match, so it misses word-order queries
 *     ("zelda breath") and aliases ("botw" — which `search` resolves via
 *     alternative_names).
 *
 * Falling back only on zero results doesn't work: "botw" makes `name ~` return
 * junk (Botworld Odyssey, RobotWar) rather than nothing, so the fallback would
 * never fire and the good answer would never be reached. Instead run both and
 * re-rank the union on rating_count, which floats the real match to the top and
 * lets the noise sink regardless of which query produced it.
 */
export async function searchGames(term: string, limit: number = GameLimitPerSearch): Promise<Album[]> {
    // APICalypse terms are quoted, so strip quotes rather than let them break the query.
    const safeTerm = term.replace(/"/g, '');

    const [ranked, relevant] = await Promise.all([
        runQuery(`${FIELDS} where name ~ *"${safeTerm}"* & cover != null; sort rating_count desc; limit ${limit};`),
        runQuery(`${FIELDS} search "${safeTerm}"; where cover != null; limit ${limit};`),
    ]);

    // Dedupe by id — the two queries overlap whenever the name match is also the
    // relevant one, which is the common case.
    const byId = new Map<number, IgdbGameResult>();
    for (const r of [...ranked, ...relevant]) {
        byId.set(r.id, r);
    }

    // Games with no rating_count sort to the bottom rather than being dropped,
    // so obscure titles stay reachable.
    return [...byId.values()]
        .sort((a, b) => (b.rating_count ?? 0) - (a.rating_count ?? 0))
        .slice(0, limit)
        .map(toAlbum);
}
