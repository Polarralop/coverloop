import type { Album } from '../types';
import AlbumCard from './AlbumCard';

interface Props {
  results: Album[];                  // App.searchResults
  selected: Album[];                 // App.selectedAlbums (to highlight cards)
  loading: boolean;                  // App.isSearching
  onToggle: (album: Album) => void;  // App.toggleAlbum
  onSearchMusicBrainz: () => void;
  onSearchDiscogs: () => void;
}

export default function AlbumGrid({ results, selected, loading, onToggle, onSearchDiscogs, onSearchMusicBrainz }: Props) {
  if (loading) {
    return (
      <div className="album-grid">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="skeleton-card" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return <p className="hint">no albums found. try another search.</p>;
  }

  return (
    <div>
      {results.length === 0 ? (
        <p className="hint">no albums found. try another search.</p>
      ) : (
        <div className="album-grid">
          {results.map(album => (
            <AlbumCard
              key={album.id}
              album={album}
              isSelected={selected.some(a => a.id === album.id)}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
      <button onClick={onSearchMusicBrainz}>not finding it? search via <i>MusicBrainz</i></button>
      <button onClick={onSearchDiscogs}>still not finding it? search via <i>Discogs</i></button>
    </div>
  );
}
