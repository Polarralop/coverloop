// ============================================================================
// client/src/App.tsx — the component that owns ALL state
// ----------------------------------------------------------------------------
// PURPOSE
//   Single source of truth. Every other component is presentational: it
//   receives data + callbacks as props and renders. Keeping state in one
//   place makes the data flow trivial to follow (and easy to lift into a
//   store later if the app grows — it won't need to for phase 1).
//
// STATE (useState is plenty)
//   searchResults    Album[]        ← from api.searchAlbums()
//   isSearching      boolean        ← show a spinner in AlbumGrid
//   selectedAlbums   Album[]        ← in click order; this order = frame order
//   favouriteId      number | null  ← id of the album shown as frame #1
//   frameDelayMs     number         ← default 500; bound to SpeedControl
//   gifUrl           string | null  ← object URL from api.createGif()
//   isBuilding       boolean        ← disables "Make GIF", shows progress
//   error            string | null  ← surfaced near the top of the page
//
// HANDLERS (defined here, passed down)
//   handleSearch(term)        → setIsSearching, call searchAlbums, set results
//   toggleAlbum(album)        → add/remove from selectedAlbums.
//                               RULES: if removing the favourite, clear
//                               favouriteId; when adding the FIRST album,
//                               default favouriteId to it (nice UX).
//   setFavourite(albumId)     → must be one of selectedAlbums
//   handleBuildGif()          → derive the payload:
//                                 artworkUrls   = selectedAlbums.map(a => a.artworkUrlHiRes)
//                                 favouriteIndex = selectedAlbums.findIndex(a => a.id === favouriteId)
//                               call createGif, revoke old gifUrl, set new one
//   handleDelayChange(ms)     → setFrameDelayMs; if a gif already exists,
//                               DEBOUNCE (~400ms) then handleBuildGif() so
//                               dragging the slider live-updates the GIF
//                               without spamming the server.
//
// RENDER TREE (composition — see each component's own header)
//   <SearchBar onSearch={handleSearch} />
//   {error && <div className="error">{error}</div>}
//   <AlbumGrid results={searchResults} selected={selectedAlbums}
//              loading={isSearching} onToggle={toggleAlbum} />
//   <SelectionTray albums={selectedAlbums} favouriteId={favouriteId}
//                  onSetFavourite={setFavourite} onRemove={toggleAlbum} />
//   <SpeedControl valueMs={frameDelayMs} onChange={handleDelayChange} />
//   <button disabled={selectedAlbums.length < 2 || isBuilding}
//           onClick={handleBuildGif}>Make GIF</button>
//   <GifPreview gifUrl={gifUrl} building={isBuilding} />
//   {/* PHASE 2: <OverlayUpload onFile={...} /> feeds into handleBuildGif */}
//
// GUARD: require >= 2 selections to build (a 1-frame "gif" is just a jpeg
// with extra steps) — hence the disabled condition above.
//
// LINKS WITH
//   - api/client.ts        (searchAlbums, createGif)
//   - types.ts             (Album, CreateGifRequest — type all state with these)
//   - every file in components/
// ============================================================================

import { useState } from 'react';
import type { Album } from './types';
import { searchAlbums } from './api/client';
import SearchBar from './components/SearchBar';
import AlbumGrid from './components/AlbumGrid';

export default function App() {
  // TODO: state, handlers, and render tree as described above.
  const [searchResults, setSearchResults] = useState<Album[]>([]);
  const [selectedAlbums, setSelectedAlbums] = useState<Album[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (term: string) => {
      setIsSearching(true);
      setError(null);
      try {
        const albums = await searchAlbums(term);
        setSearchResults(albums);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setIsSearching(false);
      }
    };

    const toggleAlbum = (album: Album) => {
      setSelectedAlbums((prev) =>
        prev.some((a) => a.id === album.id)
          ? prev.filter((a) => a.id !== album.id)
          : [...prev, album]
      );
    };

  return (
    <div className="app">
      <SearchBar onSearch={handleSearch} />
      {error && <div className="error">{error}</div>}
      <AlbumGrid
        results={searchResults}
        selected={selectedAlbums}
        loading={isSearching}
        onToggle={toggleAlbum}
      />
    </div>
  );
}
