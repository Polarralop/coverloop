// ============================================================================
// server/src/types.ts — shared server-side shapes
// ----------------------------------------------------------------------------
// PURPOSE
//   The server's copy of the API shapes (mirrors client/src/types.ts — see
//   the note there about deliberate duplication), plus server-only types.
//
// USED BY
//   - routes/albums.ts       (Album — response shape)
//   - routes/gif.ts          (CreateGifRequest — validate req.body against it)
//   - services/itunes.ts     (Album + ItunesResult for the raw API response)
//   - services/imageFetcher.ts / gifBuilder.ts  (Frame)
// ============================================================================

/** Normalized album sent to the client. */
export interface Album {
  id: number | string;
  title: string;
  artist: string;
  artworkUrl: string;
  artworkUrlHiRes: string;
}

/** Body of POST /api/gif (validate this in routes/gif.ts before trusting it —
 *  req.body is `any` at the boundary; narrow it, don't just cast it). */
export interface CreateGifRequest {
  artworkUrls: string[];
  favouriteIndex: number;
  frameDelayMs: number;
}

export interface MusicBrainzResult {
  id: string;
  title?: string;
  'artist-credit'?: { name: string }[];
}

/** One normalized RGBA frame produced by imageFetcher, consumed by gifBuilder. */
export interface Frame {
  data: Buffer;    // raw RGBA pixels (4 channels), FRAME_SIZE x FRAME_SIZE
  width: number;
  height: number;
}

// NOTE on gifenc: it ships no official TypeScript types. Easiest fix — a
// gifenc.d.ts next to this file:
//   declare module 'gifenc' {
//     export function GIFEncoder(): any;
//     export function quantize(data: Uint8Array | Buffer, maxColors: number): number[][];
//     export function applyPalette(data: Uint8Array | Buffer, palette: number[][]): Uint8Array;
//   }
// (Tighten the `any` later if you feel like it; it's a tiny surface.)
