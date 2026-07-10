import type { Album } from '../types';

interface Props {
  albums: Album[];                       // selected albums, in frame order
  favouriteId: number | string | null;
  onSetFavourite: (albumId: number | string) => void;
  onRemove: (album: Album) => void;
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
