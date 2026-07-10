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
