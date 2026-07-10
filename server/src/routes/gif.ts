import { Router } from 'express';
import { fetchAndNormalize } from '../services/imageFetcher';
import { buildGif } from '../services/gifBuilder';
import multer from 'multer';
import { CreateGifRequest } from '../types';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();
router.post('/', upload.single('overlay'),async (req, res, next) => {
    try {
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
