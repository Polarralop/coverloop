import { useState, useRef } from 'react';
import type { Album, CreateGifRequest } from './types';
import { searchAlbums, createGif, searchAlbumsDiscogs } from './api/client';
import SearchBar from './components/SearchBar';
import AlbumGrid from './components/AlbumGrid';
import SelectionTray from './components/SelectionTray';
import SpeedControl from './components/SpeedControl';
import GifPreview from './components/GifPreview';
import OverlayUpload from './components/OverlayUpload';

export default function App() {
  const [searchResults, setSearchResults] = useState<Album[]>([]);
  const [selectedAlbums, setSelectedAlbums] = useState<Album[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [favouriteId, setFavouriteId] = useState<number | string | null>(null);
  const [frameDelayMs, setFrameDelayMs] = useState<number>(500);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [lastSearchTerm, setLastSearchTerm] = useState('');
  const [overlayFile, setOverlayFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  

  const setFavourite = (albumId: number | string | null) => {
    setFavouriteId(albumId);
  };
  


  const handleSearch = async (term: string) => {
    setIsSearching(true);
    setLastSearchTerm(term);
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

  const handleSearchDiscogs = async () => {
    setIsSearching(true);
    try {
      const albums = await searchAlbumsDiscogs(lastSearchTerm);
      setSearchResults((prev) => [...prev, ...albums]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Discogs search failed");
    } finally {
      setIsSearching(false);
    }
  };


  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSpeed = (ms: number) => {
    setFrameDelayMs(ms);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      handleBuildGif(ms);
    }, 400);
  };

  const handleBuildGif = async (overrideDelay?: number) => {
    setIsBuilding(true);
    setError(null);

    try {
      const payload: CreateGifRequest = {
        artworkUrls: selectedAlbums.map((a) => a.artworkUrlHiRes),
        favouriteIndex: selectedAlbums.findIndex((a) => a.id === favouriteId),
        frameDelayMs: overrideDelay ?? frameDelayMs,
      }
      const newGifUrl = await createGif(payload, overlayFile);

      if (gifUrl) {
        URL.revokeObjectURL(gifUrl);
      }

      setGifUrl(newGifUrl);

    } catch (err) {
      setError(err instanceof Error ? err.message: 'GIF generation failed');
    } finally {
      setIsBuilding(false);
    }

  };


  const toggleAlbum = (album: Album) => {
    const isCurrentlySelected = selectedAlbums.some((a) => a.id === album.id);

      if (isCurrentlySelected && favouriteId === album.id) {
        // removing the current favourite
        const remaining = selectedAlbums.filter((a) => a.id !== album.id);
        setFavourite(remaining.length > 0 ? remaining[0].id : null);
      } else if (!isCurrentlySelected && selectedAlbums.length === 0) {
        // adding the very first album
        setFavourite(album.id);
      }

    setSelectedAlbums((prev) =>
      prev.some((a) => a.id === album.id)
        ? prev.filter((a) => a.id !== album.id)
        : [...prev, album]
    );
    
  };



  return (
    <div className="app">
      <title>coverloop</title>
      <p>turn covers into a looping gif</p>
      <SearchBar onSearch={handleSearch} />
      <p>it's highly suggested to search by artist. album search algo. is wonky right now; less likely to produce what you're looking for.</p>
      {error && <div className="error">{error}</div>}
      <AlbumGrid
        results={searchResults}
        selected={selectedAlbums}
        loading={isSearching}
        onToggle={toggleAlbum}
        onSearchDiscogs={handleSearchDiscogs}
      />
      <SelectionTray 
        albums={selectedAlbums}
        favouriteId={favouriteId}
        onSetFavourite={setFavourite}
        onRemove={toggleAlbum}
      />
      <p>you can upload a transparent PNG to overlay on top of the GIF. 5MB limit; 500x500px recommended.</p>
      <OverlayUpload overlayFile={overlayFile} onFile={setOverlayFile} />
      <button disabled={selectedAlbums.length < 2 || isBuilding} onClick={() => handleBuildGif()}>
        Make GIF
      </button>
      {gifUrl && <SpeedControl valueMs={frameDelayMs} onChange={handleSpeed} />}
      <GifPreview gifUrl={gifUrl} building={isBuilding} />

    </div>
  );
}
