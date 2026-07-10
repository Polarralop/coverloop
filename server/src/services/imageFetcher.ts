import sharp from 'sharp';
import type { Frame } from '../types';
import { fetchWithRetries } from './fetchWithRetries';

export const FRAME_SIZE = 500;
export async function fetchAndNormalize(urls: string[]): Promise<Frame[]> {
    const frames = await Promise.all(
        urls.map(async (url) => {
            const pong = await fetchWithRetries(url);
            if (!pong.ok) {
                throw new Error(`Failed to fetch artwork: ${url} (${pong.status})`);
            }

            const arrayBuffer = await pong.arrayBuffer();

            const data = await sharp(Buffer.from(arrayBuffer))
                .resize(FRAME_SIZE, FRAME_SIZE, {fit: 'cover'})
                .ensureAlpha()
                .raw()
                .toBuffer();
            return { data, width: FRAME_SIZE, height: FRAME_SIZE};
        })
    );
    return frames;
}

