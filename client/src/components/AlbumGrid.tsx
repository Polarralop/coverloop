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
// import AlbumCard from './AlbumCard';

interface Props {
  results: Album[];                  // App.searchResults
  selected: Album[];                 // App.selectedAlbums (to highlight cards)
  loading: boolean;                  // App.isSearching
  onToggle: (album: Album) => void;  // App.toggleAlbum
}

export default function AlbumGrid({ results, selected, loading, onToggle }: Props) {
  // TODO
  return null;
}
