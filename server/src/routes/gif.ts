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
import { fetchAndNormalize } from '../services/imageFetcher';
import { buildGif } from '../services/gifBuilder';
import multer from 'multer';
import { CreateGifRequest } from '../types';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();
router.post('/', upload.single('overlay'),async (req, res, next) => {
    try {

        console.log('reg.body:', req.body);
        console.log('req.file:', req.file);

        if (!req.body.payload) {
            return res.status(400).json({ error: 'payload field is required' });
        }

        const payload = JSON.parse(req.body.payload) as CreateGifRequest;
        const { artworkUrls, favouriteIndex, frameDelayMs } = payload;

        if (!Array.isArray(artworkUrls) || artworkUrls.length < 2) {
            return res.status(400).json({ error: 'at least 2 artworkUrls are required' });
        }

        if (artworkUrls.length > 20) {
        return res.status(400).json({ error: 'too many artworkUrls (max 20)' });
        }
        if (
            typeof favouriteIndex !== 'number' ||
            favouriteIndex < 0 ||
            favouriteIndex >= artworkUrls.length
        ) {
            return res.status(400).json({ error: 'favouriteIndex is out of range' });
        }

        const delay = typeof frameDelayMs === 'number' ? frameDelayMs : 500;
        const clampedDelay = Math.min(2000, Math.max(100, delay));

        const favourite = artworkUrls[favouriteIndex];
        const before = artworkUrls.slice(0, favouriteIndex);
        const after = artworkUrls.slice(favouriteIndex + 1);

        const orderedUrls = [favourite, ...after, ...before];
        const overlayBuffer = req.file?.buffer;

        const frames = await fetchAndNormalize(orderedUrls);
        const gif = await buildGif(frames, { frameDelayMs: clampedDelay, overlayBuffer });
        res.set('Content-Type', 'image/gif').send(Buffer.from(gif));

    } catch (err) { next(err); }


});

export default router;
