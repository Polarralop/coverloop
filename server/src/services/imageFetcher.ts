// ============================================================================
// server/src/services/imageFetcher.ts — download + normalize album artwork
// ----------------------------------------------------------------------------
// PURPOSE
//   Turn a list of artwork URLs into a list of same-sized raw pixel buffers
//   ready for GIF encoding. GIFs need every frame to be identical dimensions,
//   and gifenc wants raw RGBA data — this file guarantees both.
//
// WHAT GOES IN HERE
//   export const FRAME_SIZE = 512;   // px; one constant shared with gifBuilder
//
//   export async function fetchAndNormalize(urls) {
//     For each URL (Promise.all is fine for <= ~20 frames):
//       1. const res = await fetch(url); check res.ok; arrayBuffer() it.
//       2. Pipe through sharp:
//            sharp(Buffer.from(ab))
//              .resize(FRAME_SIZE, FRAME_SIZE, { fit: 'cover' })
//              .ensureAlpha()                 // gifenc expects RGBA (4 ch)
//              .raw()
//              .toBuffer()
//       3. Return an array of { data: Buffer, width, height } — or just the
//          raw Buffers if you keep width/height implicit via FRAME_SIZE.
//     Throw with a useful message on any failure (which URL, what happened)
//     so routes/gif.ts can return a meaningful error.
//   }
//
// WHY 'cover' + a fixed square
//   Album art is almost always square already, but 'cover' means a stray
//   non-square image gets centre-cropped instead of distorting or breaking
//   the encoder.
//
// LINKS WITH
//   - routes/gif.ts         (caller)
//   - services/gifBuilder.ts (consumes the buffers; imports FRAME_SIZE)
//
// IDEAS FOR LATER
//   - In-memory cache keyed by URL (users tweak the speed slider a lot; the
//     artwork doesn't change between rebuilds).
//   - Timeouts via AbortController so one slow CDN fetch can't hang the request.
// ============================================================================

// import sharp from 'sharp';

// TODO: implement FRAME_SIZE + fetchAndNormalize(urls) as described above.
