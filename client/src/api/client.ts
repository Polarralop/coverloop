// ============================================================================
// client/src/api/client.ts — the frontend's only door to the backend
// ----------------------------------------------------------------------------
// PURPOSE
//   Every fetch() in the app lives here. Components never call fetch
//   directly — they call these functions via props/handlers from App.tsx.
//   All paths are relative (/api/...) so the Vite proxy (vite.config.ts)
//   handles routing in dev and nothing changes in prod.
//
// WHAT GOES IN HERE
//
//   export async function searchAlbums(term, limit = 20) {
//     - GET `/api/albums/search?` + new URLSearchParams({ term, limit })
//     - if !res.ok: throw new Error((await res.json()).error ?? 'Search failed')
//     - return (await res.json()).albums
//       → [{ id, title, artist, artworkUrl, artworkUrlHiRes }]
//   }
//
//   export async function createGif({ artworkUrls, favouriteIndex, frameDelayMs }) {
//     - POST '/api/gif' with JSON body (Content-Type: application/json)
//     - if !res.ok: throw, same pattern as above
//     - const blob = await res.blob()            // it's image/gif binary
//     - return URL.createObjectURL(blob)         // ready for an <img src>
//       NOTE: caller (App.tsx) must URL.revokeObjectURL the PREVIOUS url
//       when replacing it, or rebuilds will leak memory.
//   }
//
// LINKS WITH
//   - App.tsx                  (only importer)
//   - server/src/routes/albums.ts and routes/gif.ts (the other side)
//   - types.ts                 (Album, CreateGifRequest — import and use them)
//   - README "API contract"    (the source of truth if these drift)
//
// PHASE 2
//   createGif will switch to FormData (JSON payload + overlay PNG file);
//   drop the explicit Content-Type header when that happens — the browser
//   sets the multipart boundary itself.
// ============================================================================

// TODO: implement searchAlbums + createGif as described above.
import type { Album } from '../types';
export async function searchAlbums(term: string, limit = 20): Promise<Album[]>{
    const params = new URLSearchParams({term, limit: String(limit)});
    const pong = await fetch(`/api/albums/search?${params}`);
    if (!pong.ok) {
        throw new Error(`Album API Error: ${pong.status}`);
    }

    interface albumSearchResponse {
        albums: Album[];
    }

    const data = (await pong.json()) as albumSearchResponse;
    return data.albums;
}