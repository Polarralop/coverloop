# Coverloop
Pick your favourite albums and stitch the cover art together into an animated GIF.
Layer over a PNG to make it truly yours.

## Roadmap

- [ ] Phase 1: search → select → favourite → GIF with speed slider (everything stubbed here)
- [ ] Phase 2: transparent PNG overlay — see `OverlayUpload.tsx` and the
      "PHASE 2" section in `gifBuilder.ts`. The API gains an optional
      multipart upload; `sharp.composite()` does the layering per frame.
- [ ] Nice-to-haves: drag-to-reorder frames, GIF size presets, shareable links
