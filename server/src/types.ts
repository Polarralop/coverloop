/** Normalized album sent to the client. */
export interface Album {
  id: number | string;
  title: string;
  artist?: string;
  artworkUrl: string;
  artworkUrlHiRes: string;

  /** Which API produced this result. Only set by sources whose terms require an
   *  attribution rendered next to the data itself — today that's Discogs, whose
   *  API terms ask for a "Data provided by Discogs" credit linking back to the
   *  matching discogs.com page. The other sources are credited in the client's
   *  Legal & Attribution notice instead. */
  source?: 'discogs';
  /** Canonical page on the source's own site, for that credit link. */
  sourceUrl?: string;
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
  uri?: string;            // site path for this release, e.g. /Nirvana-Nevermind/release/12345
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

export interface IgdbGameResult {
  id: number;
  name: string;
  cover?: { image_id: string };
  first_release_date?: number;  // Unix timestamp in SECONDS (not ms); absent for unreleased games
  rating_count?: number;        // popularity signal; absent for obscure titles (IGDB's `follows` is always null)
}

/** One normalized RGBA frame produced by imageFetcher, consumed by gifBuilder. */
export interface Frame {
  data: Buffer;    // raw RGBA pixels (4 channels), FRAME_SIZE x FRAME_SIZE
  width: number;
  height: number;
}


