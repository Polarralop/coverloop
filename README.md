# Coverloop

Search for albums, pick a handful, choose a favourite, and stitch the cover
art into an animated GIF — with the favourite as the first frame and a
user-controlled frame speed. Later: layer a transparent PNG on top of every
frame.

---

## Stack

| Layer    | Tech                          | Why                                                        |
|----------|-------------------------------|------------------------------------------------------------|
| Frontend | React 18 + Vite + TS               | Fast dev server, `/api` proxy avoids CORS in development    |
| Backend  | Node 20+ / Express + TS (via tsx)            | Proxies the album API + does all image/GIF work server-side |
| Album data | iTunes Search API           | Free, **no API key**, returns artwork URLs directly         |
| Images   | `sharp`                       | Fetch/resize/normalize covers to a uniform frame size       |
| GIF      | `gifenc`                      | Fast palette quantization + GIF encoding in pure JS         |

Why a backend at all? Two reasons:
1. **CORS / canvas tainting** — encoding a GIF in the browser from Apple's
   CDN images is painful. Server-side, none of that applies.
2. The future **overlay feature** (compositing a transparent PNG onto every
   frame) is a few lines of `sharp` on the server.

---

## Project layout

```
coverloop/
├── package.json            ← root: `npm run dev` starts server + client together
├── server/
│   ├── package.json
│   ├── tsconfig.json       ← typecheck-only (tsx runs the code; see file notes)
│   └── src/
│       ├── index.ts        ← Express entry point; mounts routes
│       ├── types.ts        ← API shapes + Frame (mirrors client/src/types.ts)
│       ├── routes/
│       │   ├── albums.ts   ← GET /api/albums/search  (album lookup)
│       │   └── gif.ts      ← POST /api/gif           (build the GIF)
│       └── services/
│           ├── itunes.ts       ← talks to the iTunes Search API
│           ├── imageFetcher.ts ← downloads + normalizes artwork
│           └── gifBuilder.ts   ← assembles frames into a GIF (and, later, overlays)
└── client/
    ├── package.json
    ├── tsconfig.json       ← Vite handles TS natively; tsc is typecheck-only
    ├── vite.config.ts      ← dev proxy: /api → http://localhost:3001
    ├── index.html
    └── src/
        ├── main.tsx        ← React bootstrap
        ├── App.tsx         ← owns ALL app state; composes the components below
        ├── styles.css
        ├── types.ts        ← Album + CreateGifRequest (mirrors server copy)
        ├── api/
        │   └── client.ts   ← the only place fetch() is called on the client
        └── components/
            ├── SearchBar.tsx     ← text input → triggers album search
            ├── AlbumGrid.tsx     ← renders search results
            ├── AlbumCard.tsx     ← one album; click to select/deselect
            ├── SelectionTray.tsx ← chosen albums + "favourite" picker
            ├── SpeedControl.tsx  ← frame-delay slider
            ├── GifPreview.tsx    ← shows the generated GIF + download
            └── OverlayUpload.tsx ← FUTURE (phase 2): transparent PNG upload
```

## Data flow (the whole app in five steps)

1. User types in **SearchBar** → `App` calls `api/client.ts#searchAlbums(term)`
   → `GET /api/albums/search?term=...` → `routes/albums.ts` →
   `services/itunes.ts` → normalized album list back to the client.
2. User clicks **AlbumCard**s → `App` keeps `selectedAlbums[]`.
3. In **SelectionTray**, user marks one selection as `favouriteId`.
4. User hits "Make GIF" → `App` calls `createGif({ albums, favouriteId, frameDelayMs })`
   → `POST /api/gif` → `routes/gif.ts` → `imageFetcher.ts` (download covers)
   → `gifBuilder.ts` (favourite frame first, encode with per-frame delay)
   → GIF bytes returned → **GifPreview** shows it via an object URL.
5. User moves **SpeedControl** → `App` re-calls `createGif` (debounced).

## API contract (keep client + server in sync with this)

`GET /api/albums/search?term=<string>&limit=<n>`
→ `{ albums: [{ id, title, artist, artworkUrl, artworkUrlHiRes }] }`

`POST /api/gif`  body: `{ artworkUrls: string[], favouriteIndex: number, frameDelayMs: number }`
→ `image/gif` binary (Content-Type: image/gif)

## Getting started

```bash
npm install               # root (installs `concurrently`)
cd server && npm install
cd ../client && npm install
cd .. && npm run dev      # server on :3001, client on :5173
npm run typecheck         # tsc --noEmit on both sides (Vite/tsx never typecheck)
```

## Roadmap

- [ ] Phase 1: search → select → favourite → GIF with speed slider (everything stubbed here)
- [ ] Phase 2: transparent PNG overlay — see `OverlayUpload.tsx` and the
      "PHASE 2" section in `gifBuilder.ts`. The API gains an optional
      multipart upload; `sharp.composite()` does the layering per frame.
- [ ] Nice-to-haves: drag-to-reorder frames, GIF size presets, shareable links
