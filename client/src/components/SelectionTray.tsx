// ============================================================================
// SelectionTray.tsx — chosen albums + favourite picker
// ----------------------------------------------------------------------------
// This is where the "favourite = first frame" requirement lives in the UI.
//
// WHAT GOES IN HERE
//   - Horizontal strip of thumbnails of the selected albums, in order —
//     this order (favourite bumped to front) is the frame order of the GIF,
//     so seeing it laid out flat helps the user understand the output.
//   - Per thumbnail:
//       * a favourite control (e.g. a ★ that's filled when
//         album.id === favouriteId) → onSetFavourite(album.id)
//       * a small ✕ → onRemove(album)
//   - Visually mark the favourite as "first frame" (badge/label), since the
//     server moves it to position 0 regardless of click order.
//   - Empty state: "Search above and pick some albums" hint.
//
// LINKS WITH
//   - App.tsx (parent)
//   - types.ts (Album)
//   - server/src/routes/gif.ts (does the actual favourite-first reordering)
//   - styles.css (.selection-tray, .favourite-badge)
// ============================================================================

import type { Album } from '../types';

interface Props {
  albums: Album[];                       // App.selectedAlbums (in frame order)
  favouriteId: number | string | null;            // App.favouriteId
  onSetFavourite: (albumId: number | string) => void;
  onRemove: (album: Album) => void;      // App.toggleAlbum (reused for removal)
}

export default function SelectionTray({ albums, favouriteId, onSetFavourite, onRemove }: Props) {
  if (albums.length === 0) {
    return <p className="hint">go on, choose something...</p>
  }

  return(
    <div className="selection-tray">
      {albums.map((album) => (
        <div key={album.id} className="tray-item">
          <img src={album.artworkUrl} alt={album.title} />

          {album.id === favouriteId && (
            <span className="favourite-badge">1st frame</span>
          )}

          <button onClick={() => onSetFavourite(album.id)}>
            {album.id === favouriteId ? '★' : '☆'}
          </button>

          <button onClick={() => onRemove(album)}>✕</button>
        </div>
      ))}
    </div>
  );
}
