// ============================================================================
// server/src/routes/gif.ts — GIF generation endpoint
// ----------------------------------------------------------------------------
// PURPOSE
//   HTTP layer for building the GIF. Validates the request body, reorders
//   frames so the favourite comes first, then delegates image work to
//   services/imageFetcher.ts and services/gifBuilder.ts.
//
// ENDPOINT (see "API contract" in the README)
//   POST /api/gif
//   Body: {
//     artworkUrls:   string[],  // hi-res URLs, in the user's selection order
//     favouriteIndex: number,   // index into artworkUrls of the favourite
//     frameDelayMs:  number     // delay per frame (the speed slider value)
//   }
//   200 → raw GIF bytes, Content-Type: image/gif
//   400 → { error: '...' }  (empty list, bad index, silly delay values)
//
// WHAT GOES IN HERE
//   1. router.post('/', async (req, res, next) => { ... })
//   2. VALIDATE:
//        - artworkUrls is a non-empty array of http(s) URLs (cap it, e.g. 20,
//          so nobody asks you to build a 500-frame GIF)
//        - 0 <= favouriteIndex < artworkUrls.length
//        - clamp frameDelayMs to e.g. 50..5000
//   3. REORDER: move artworkUrls[favouriteIndex] to position 0. Keep the
//      remaining frames in their original relative order.
//      (Doing this on the server keeps the client dumb and the contract simple.)
//   4. const buffers = await fetchAndNormalize(orderedUrls)   // imageFetcher.ts
//   5. const gif     = await buildGif(buffers, { frameDelayMs }) // gifBuilder.ts
//   6. res.set('Content-Type', 'image/gif').send(Buffer.from(gif))
//
// LINKS WITH
//   - services/imageFetcher.ts  (step 4)
//   - services/gifBuilder.ts    (step 5)
//   - src/index.ts              (mounts this at /api/gif)
//   - client/src/api/client.ts  (caller — reads the response as a Blob)
//
// PHASE 2 (overlay) — the plan
//   This endpoint will become multipart/form-data (use `multer`):
//     - field 'payload': the JSON above
//     - field 'overlay': the user's transparent PNG
//   Pass the overlay buffer through to buildGif(); see gifBuilder.ts.
// ============================================================================

import { Router } from 'express';
// import { fetchAndNormalize } from '../services/imageFetcher';
// import { buildGif } from '../services/gifBuilder';

// TODO: implement router as described above.
