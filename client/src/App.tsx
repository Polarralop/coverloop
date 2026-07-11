import { useState, useRef } from 'react';
import type { Album, CreateGifRequest } from './types';
import { searchAlbumsDeezer, createGif, searchAlbumsDiscogs, searchAlbumsMusicBrainz } from './api/client';
import SearchBar from './components/SearchBar';
import AlbumGrid from './components/AlbumGrid';
import SelectionTray from './components/SelectionTray';
import SpeedControl from './components/SpeedControl';
import GifPreview from './components/GifPreview';
import OverlayUpload from './components/OverlayUpload';
import SocialHeader from './components/SocialHeader';

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
      const albums = await searchAlbumsDeezer(term);
      if (albums.length !== 0)
        setSearchResults(albums);
      else
        await runMusicBrainz(term, 'replace'); // auto-fallback: pass term so we don't read stale lastSearchTerm
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deezer search failed');
    } finally {
      setIsSearching(false);
    }
  };

  // MusicBrainz/Discogs are reached two ways: automatically when a fresh search
  // falls through (mode 'replace'), or via their manual buttons (mode 'append',
  // adding to what's already shown). term is always passed in explicitly so the
  // auto path never reads a stale lastSearchTerm from an older closure.
  const runMusicBrainz = async (term: string, mode: 'replace' | 'append') => {
    setError(null);
    setIsSearching(true);
    try {
      const albums = await searchAlbumsMusicBrainz(term);
      if (albums.length !== 0)
        setSearchResults((prev) => (mode === 'append' ? [...prev, ...albums] : albums));
      else
        await runDiscogs(term, mode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MusicBrainz search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const runDiscogs = async (term: string, mode: 'replace' | 'append') => {
    setError(null);
    setIsSearching(true);
    try {
      const albums = await searchAlbumsDiscogs(term);
      setSearchResults((prev) => (mode === 'append' ? [...prev, ...albums] : albums));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Discogs search failed');
    } finally {
      setIsSearching(false);
    }
  };

  // Button handlers: append to current results using the committed lastSearchTerm.
  // Arrow form so the click event isn't passed in as `term`.
  const handleSearchMusicBrainz = () => runMusicBrainz(lastSearchTerm, 'append');
  const handleSearchDiscogs = () => runDiscogs(lastSearchTerm, 'append');


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
      <div className="top-bar">
        <p className="api-credit">search APIs provided by: Deezer, MusicBrainz, Discogs. kudos to them!</p>
        <SocialHeader />
      </div>
      <h1 className="title">coverloop</h1>
      <p className="subtitle">turn covers into a looping gif</p>
      <SearchBar onSearch={handleSearch} />
      {error && <div className="error">{error}</div>}
      <AlbumGrid
        results={searchResults}
        selected={selectedAlbums}
        loading={isSearching}
        onToggle={toggleAlbum}
        onSearchDiscogs={handleSearchDiscogs}
        onSearchMusicBrainz={handleSearchMusicBrainz}
      />
      <SelectionTray 
        albums={selectedAlbums}
        favouriteId={favouriteId}
        onSetFavourite={setFavourite}
        onRemove={toggleAlbum}
      />
      <p>you can upload a transparent PNG to overlay on top of the GIF. 5MB limit; 500x500px recommended.</p>
      <OverlayUpload overlayFile={overlayFile} onFile={setOverlayFile} />
      <button className="make-gif" disabled={selectedAlbums.length < 2 || isBuilding} onClick={() => handleBuildGif()}>
        make GIF
      </button>
      {gifUrl && <SpeedControl valueMs={frameDelayMs} onChange={handleSpeed} />}
      <GifPreview gifUrl={gifUrl} building={isBuilding} />

    </div>
  );
}
