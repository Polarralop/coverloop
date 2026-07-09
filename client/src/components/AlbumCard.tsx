// ============================================================================
// AlbumCard.tsx — one album in the grid
// ----------------------------------------------------------------------------
// WHAT GOES IN HERE
//   - <img src={album.artworkUrl}> — use the SMALL (100px) url here; the
//     hi-res one is only for the GIF itself (server-side).
//   - Title + artist text (truncate long ones with CSS, title attr for hover).
//   - Whole card clickable → onToggle(album); toggle a .selected class for
//     the highlight (checkmark badge, border, whatever you like).
//   - Make it a <button> (or role="button" + key handlers) for accessibility.
//
// LINKS WITH
//   - AlbumGrid.tsx (parent)
//   - types.ts (Album)
//   - styles.css (.album-card, .album-card.selected)
// ============================================================================

import type { Album } from '../types';

interface Props {
  album: Album;
  isSelected: boolean;
  onToggle: (album: Album) => void;
}

export default function AlbumCard({ album, isSelected, onToggle }: Props) {
  return(
    <button
      className={isSelected ? 'album-card selected' : 'album-card'}
      onClick={() => onToggle(album)}
    >
      <img src={album.artworkUrl} alt={`${album.title} by ${album.artist}`} />
      <p title={album.title}>{album.title}</p>
      <p title={album.artist}>{album.artist}</p>
    </button>
  );
}
