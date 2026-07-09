// ============================================================================
// client/src/types.ts — the shapes everything on the client shares
// ----------------------------------------------------------------------------
// PURPOSE
//   One home for the data shapes so components, App state, and api/client.ts
//   all agree. These MIRROR server/src/types.ts — client and server are
//   separate TS projects, so the couple of shared shapes are deliberately
//   duplicated rather than wired together with project references. If you
//   change one side, change the other; the README "API contract" is the
//   source of truth if they ever drift.
//
// USED BY
//   - App.tsx            (state: Album[], favouriteId, etc.)
//   - api/client.ts      (searchAlbums return type, createGif payload)
//   - components/*.tsx   (props)
// ============================================================================

/** One album as returned by GET /api/albums/search (normalized iTunes data). */
export interface Album {
  id: number | string;             // iTunes collectionId
  title: string;          // collectionName
  artist: string;         // artistName
  artworkUrl: string;     // 100x100 thumbnail — use in the grid
  artworkUrlHiRes: string; // 600x600 — what the server turns into GIF frames
}

/** Body of POST /api/gif. */
export interface CreateGifRequest {
  artworkUrls: string[];   // hi-res urls in selection order
  favouriteIndex: number;  // index into artworkUrls; server moves it to frame 0
  frameDelayMs: number;    // per-frame delay (SpeedControl value)
}
