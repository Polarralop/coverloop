import { useRef, useState } from 'react';
import type { Album } from '../types';

interface Props {
  albums: Album[];                       // selection order IS frame order — leftmost is frame 0
  onRemove: (album: Album) => void;
  onReorder: (from: number, to: number) => void;
}

export default function SelectionTray({ albums, onRemove, onReorder }: Props) {
  // The ref is the source of truth during a gesture (pointermove needs to read
  // it synchronously; a state read there would be stale). The state exists only
  // so the .dragging class repaints. Both track the same index.
  const dragIndexRef = useRef<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, index: number) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragIndexRef.current = index;
    setDraggingIndex(index);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragIndexRef.current === null) return;
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('.tray-item') as HTMLElement | null; // gets the item's htmlelement
    if (!el) return;

    const to = Number(el.dataset.index);
    if (to === dragIndexRef.current) return;
    onReorder(dragIndexRef.current, to);
    dragIndexRef.current = to;
    setDraggingIndex(to);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragIndexRef.current = null;
    setDraggingIndex(null);
  };
  
  // Don't add a useEffect with window listeners; pointer capture already does
  // that job and the two together will double-fire.

  return(
    <div className="selection-tray">
      {albums.length === 0 ? (
        <p className="tray-empty">go on, choose something...</p>
      ) : (
        albums.map((album, index) => (
          // key stays album.id (not index) on purpose: stable keys mean React
          // MOVES this DOM node on reorder instead of recreating it, which is
          // what lets pointer capture survive a reorder mid-drag.
          <div
            key={album.id}
            className={index === draggingIndex ? 'tray-item dragging' : 'tray-item'}
            data-index={index}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerMove={handlePointerMove}
            onPointerDown={(e) => handlePointerDown(e, index)}
          >
            <img src={album.artworkUrl} alt={album.title} draggable={false} />

            <button onClick={() => onRemove(album)}>✕</button>
          </div>
        ))
      )}
    </div>
  );
}
