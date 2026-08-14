import type { Album } from '../types';

interface Props {
  album: Album;
  isSelected: boolean;
  onToggle: (album: Album) => void;
}

export default function AlbumCard({ album, isSelected, onToggle }: Props) {
  return(
    // The credit link is a SIBLING of the card, not a child: the card is a
    // <button>, and an <a> nested inside one is invalid HTML that browsers
    // reparent — which would drop the link out of the card entirely.
    <div className="album-card-wrap">
      <button
        className={isSelected ? 'album-card selected' : 'album-card'}
        onClick={() => onToggle(album)}
      >
        <img src={album.artworkUrl} alt={`${album.title} by ${album.artist}`} />
        <p title={album.title}>{album.title}</p>
        <p title={album.artist}>{album.artist}</p>
      </button>

      {/* Discogs' API terms require this credit next to the data itself, linked
          to the matching discogs.com page — the Legal & Attribution notice in
          the footer isn't enough on its own. */}
      {album.source === 'discogs' && album.sourceUrl && (
        <a
          className="source-credit"
          href={album.sourceUrl}
          target="_blank"
          rel="noreferrer"
          title={`View "${album.title}" on Discogs`}
        >
          Data provided by Discogs
        </a>
      )}
    </div>
  );
}
