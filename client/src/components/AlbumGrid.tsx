// ============================================================================
// AlbumGrid.tsx — search results grid
// ----------------------------------------------------------------------------
// WHAT GOES IN HERE
//   - loading → spinner/skeleton; empty results after a search → friendly
//     "no albums found" message; never searched yet → nothing/hint text.
//   - Otherwise a CSS grid of <AlbumCard>s:
//       results.map(album =>
//         <AlbumCard key={album.id} album={album}
//                    isSelected={selected.some(a => a.id === album.id)}
//                    onToggle={onToggle} />)
//   - Pure presentation: no state, no fetching.
//
// LINKS WITH
//   - AlbumCard.tsx (child)
//   - App.tsx (parent)
//   - types.ts (Album)
//   - styles.css (.album-grid)
// ============================================================================

import type { Album } from '../types';
import AlbumCard from './AlbumCard';

interface Props {
  results: Album[];                  // App.searchResults
  selected: Album[];                 // App.selectedAlbums (to highlight cards)
  loading: boolean;                  // App.isSearching
  onToggle: (album: Album) => void;  // App.toggleAlbum
}

export default function AlbumGrid({ results, selected, loading, onToggle }: Props) {
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

  return(
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
  );
}
