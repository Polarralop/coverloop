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

export interface DiscogsResult {
  id: number;
  title?: string;          // combined "Artist - Album Title"
  cover_image?: string;
  thumb?: string;
}
/** One normalized RGBA frame produced by imageFetcher, consumed by gifBuilder. */
export interface Frame {
  data: Buffer;    // raw RGBA pixels (4 channels), FRAME_SIZE x FRAME_SIZE
  width: number;
  height: number;
}


