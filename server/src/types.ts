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

export interface DeezerAlbumResult {
  id: number;
  title?: string;
  record_type?: string;    // 'album' | 'ep' | 'single'
  cover_medium?: string;   // 250² — grid thumbnail
  cover_big?: string;      // 500² — matches FRAME_SIZE
  cover_xl?: string;       // 1000²
  artist?: { name: string };
}
/** One normalized RGBA frame produced by imageFetcher, consumed by gifBuilder. */
export interface Frame {
  data: Buffer;    // raw RGBA pixels (4 channels), FRAME_SIZE x FRAME_SIZE
  width: number;
  height: number;
}


