/** One album as returned by GET /api/albums/search. */
export interface Album {
  id: number | string;
  title: string;
  artist: string;
  artworkUrl: string;      // grid thumbnail
  artworkUrlHiRes: string; // what the server turns into GIF frames
}

/** Body of POST /api/gif. */
export interface CreateGifRequest {
  artworkUrls: string[];   // hi-res urls in selection order
  favouriteIndex: number;  // index into artworkUrls; server moves it to frame 0
  frameDelayMs: number;    // per-frame delay (SpeedControl value)
}
