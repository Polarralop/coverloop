import type { Album } from '../types';
import AlbumCard from './AlbumCard';

interface Props {
  results: Album[];                  // App.searchResults
  selected: Album[];                 // App.selectedAlbums (to highlight cards)
  loading: boolean;                  // App.isSearching
  mode: 'music' | 'games';           // App.searchMode — drives card ratio + fallbacks
  onToggle: (album: Album) => void;  // App.toggleAlbum
  onSearchMusicBrainz: () => void;
  onSearchDiscogs: () => void;
}

export default function AlbumGrid({ results, selected, loading, mode, onToggle, onSearchDiscogs, onSearchMusicBrainz }: Props) {
  // Games covers are 3:4 (see styles.css); the modifier class swaps the ratio.
  const gridClass = mode === 'games' ? 'album-grid album-grid--games' : 'album-grid';
  const noun = mode === 'games' ? 'games' : 'albums';

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="skeleton-card" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return <p className="hint">no {noun} found. try another search.</p>;
  }

  return (
    <div>
      <div className={gridClass}>
        {results.map(album => (
          <AlbumCard
            key={album.id}
            album={album}
            isSelected={selected.some(a => a.id === album.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
      {/* IGDB is single-source; the MusicBrainz/Discogs fallbacks only apply to music. */}
      {mode === 'music' && (
        <div className="fallback-actions">
          <button onClick={onSearchMusicBrainz}>not finding it? search via <i>MusicBrainz</i></button>
          <button onClick={onSearchDiscogs}>still not finding it? search via <i>Discogs</i></button>
        </div>
      )}
    </div>
  );
}
