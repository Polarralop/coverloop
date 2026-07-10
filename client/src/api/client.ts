import type { Album } from '../types';
import type { CreateGifRequest } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

async function sendSearchParams(term: string, limit = 20, endPoint: string): Promise<Album[]> {
  const params = new URLSearchParams({ term, limit: String(limit) });
  const pong = await fetch(`${API_BASE}/api/albums/${endPoint}?${params}`);
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

export async function createGif(payload: CreateGifRequest, overlayFile?: File | null): Promise<string> {

  const formData = new FormData();
  formData.append('payload', JSON.stringify(payload));

  if (overlayFile) {
    formData.append('overlay', overlayFile);
  }

  const pong = await fetch(`${API_BASE}/api/gif`, {
    method: 'POST',
    body: formData,
  });

  if (!pong.ok) {
    throw new Error(`GIF creation failed: ${pong.status}`);
  }

  const blob = await pong.blob();
  return URL.createObjectURL(blob);
}