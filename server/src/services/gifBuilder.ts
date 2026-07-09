// ============================================================================
// server/src/services/gifBuilder.ts — stitch frames into an animated GIF
// ----------------------------------------------------------------------------
// PURPOSE
//   The heart of the app. Takes normalized RGBA frame buffers (from
//   imageFetcher.ts, favourite already first) and encodes an animated GIF
//   with a per-frame delay. This is also where the phase-2 overlay lands.
//
// WHAT GOES IN HERE
//   import { GIFEncoder, quantize, applyPalette } from 'gifenc';
//
//   export async function buildGif(frames, { frameDelayMs }) {
//     const gif = GIFEncoder();
//     for (const frame of frames) {
//       // gifenc works per-frame in three steps:
//       const palette = quantize(frame.data, 256);        // build 256-color palette
//       const indexed = applyPalette(frame.data, palette); // map pixels → palette
//       gif.writeFrame(indexed, FRAME_SIZE, FRAME_SIZE, {
//         palette,
//         delay: frameDelayMs,   // gifenc takes MILLISECONDS here
//       });
//     }
//     gif.finish();
//     return gif.bytes();        // Uint8Array → route wraps in Buffer
//   }
//
// NOTES / GOTCHAS
//   - quantize expects RGBA data; that's why imageFetcher uses ensureAlpha().
//   - Per-frame palettes (as above) give the best colors when covers differ
//     wildly. If output size matters more, quantize ONE global palette from
//     the first frame and reuse it.
//   - GIF spec stores delay in 1/100s under the hood, so real-world delays
//     snap to 10ms steps and browsers treat anything <20ms as slow. Keep the
//     client slider range ~100–2000ms (see SpeedControl.tsx).
//   - "Speed" = same GIF, different delay → a rebuild. Cheap enough at
//     512px/20 frames; the client just re-POSTs (debounced).
//
// ============================================================================
// PHASE 2 — TRANSPARENT PNG OVERLAY (future work, design it in now)
// ============================================================================
//   Goal: user uploads a transparent PNG; it sits ON TOP of every frame.
//
//   Signature grows to: buildGif(frames, { frameDelayMs, overlayPng })
//     where overlayPng is the uploaded file's Buffer (routes/gif.ts will get
//     it via multer — see the PHASE 2 note there).
//
//   Implementation sketch (do this BEFORE quantizing each frame):
//     1. Once, up front: resize the overlay to FRAME_SIZE with
//        sharp(overlayPng).resize(FRAME_SIZE, FRAME_SIZE, { fit: 'contain',
//        background: transparent }).png().toBuffer()
//     2. Per frame: composite it —
//        sharp(frame.data, { raw: { width, height, channels: 4 } })
//          .composite([{ input: resizedOverlay }])
//          .raw().toBuffer()
//     3. Feed the composited buffer into the same quantize/applyPalette flow.
//
//   Cleanest structure: keep buildGif dumb and add a separate
//   applyOverlay(frames, overlayPng) step that routes/gif.ts calls between
//   fetchAndNormalize() and buildGif(). Then neither service knows about
//   the other's internals.
//
// LINKS WITH
//   - routes/gif.ts            (caller)
//   - services/imageFetcher.ts (produces `frames`; exports FRAME_SIZE)
//   - client/.../SpeedControl.tsx (source of frameDelayMs)
//   - client/.../OverlayUpload.tsx (phase-2 source of overlayPng)
// ============================================================================

import { FRAME_SIZE } from './imageFetcher';
import type { Frame } from '../types';
import * as gifencModule from 'gifenc';
const { GIFEncoder, quantize, applyPalette } = (gifencModule as any).default;

export async function buildGif(
    frames: Frame[],
    options: { frameDelayMs: number }
): Promise<Uint8Array> {
    const gif = GIFEncoder();

  for (const frame of frames) {
    const palette = quantize(frame.data, 256);
    const indexed = applyPalette(frame.data, palette);

    gif.writeFrame(indexed, FRAME_SIZE, FRAME_SIZE, {
      palette,
      delay: options.frameDelayMs,
    });
  }

  gif.finish();
  return gif.bytes();
}

// TODO: implement buildGif(frames, options) as described above.
