// PHASE 2
//   createGif will switch to FormData (JSON payload + overlay PNG file);
//   drop the explicit Content-Type header when that happens — the browser
//   sets the multipart boundary itself.
// ============================================================================

// TODO: implement searchAlbums + createGif as described above.
import type { Album } from '../types';
import type { CreateGifRequest } from '../types';

async function sendSearchParams(term: string, limit = 20, endPoint: string): Promise<Album[]> {
  const params = new URLSearchParams({ term, limit: String(limit) });
  const pong = await fetch(`/api/albums/${endPoint}?${params}`);
  if (!pong.ok) {
    throw new Error(`Album API Error: ${pong.status}`);
  }

  interface AlbumSearchResponse {
    albums: Album[];
  }

  const data = (await pong.json()) as AlbumSearchResponse;
  return data.albums;

}

export async function searchAlbums(term: string, limit = 20): Promise<Album[]> {
  return sendSearchParams(term, limit, 'search');
}

export async function searchAlbumsDiscogs(term: string, limit = 20): Promise<Album[]> {
  return sendSearchParams(term, limit, 'search-discogs');
}

export async function createGif(payload: CreateGifRequest): Promise<string> {
  const pong = await fetch('/api/gif', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!pong.ok) {
    throw new Error(`GIF creation failed: ${pong.status}`);
  }

  const blob = await pong.blob();
  return URL.createObjectURL(blob);
}