import { FRAME_SIZE } from './imageFetcher';
import type { Frame } from '../types';
import sharp from 'sharp';
import * as gifencModule from 'gifenc';
const { GIFEncoder, quantize, applyPalette } = (gifencModule as any).default;


export async function buildGif(
    frames: Frame[],
    options: { frameDelayMs: number; overlayBuffer?: Buffer }
): Promise<Uint8Array> {
  const gif = GIFEncoder();

  let resizedOverlay: Buffer | null = null;
  if (options.overlayBuffer) {
    resizedOverlay = await sharp(options.overlayBuffer)
      .resize(FRAME_SIZE, FRAME_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
  }

  for (const frame of frames) {

    let frameData = frame.data;

    if (resizedOverlay) {
      frameData = await sharp(frame.data, { raw: { width: FRAME_SIZE, height: FRAME_SIZE, channels: 4 } })
        .composite([{ input: resizedOverlay }])
        .raw()
        .toBuffer();
    }

    const palette = quantize(frameData, 256);
    const indexed = applyPalette(frameData, palette);

    gif.writeFrame(indexed, FRAME_SIZE, FRAME_SIZE, {
      palette,
      delay: options.frameDelayMs,
    });
  }

  gif.finish();
  return gif.bytes();
}
