// ============================================================================
// OverlayUpload.tsx — PHASE 2 (do not build yet)
// ----------------------------------------------------------------------------
// FUTURE PURPOSE
//   Let the user pick a transparent PNG that gets composited ON TOP of every
//   GIF frame. Scaffolded now so the file structure doesn't shift later.
//
// PLANNED PROPS (uncomment/extend when you build it)
//   interface Props {
//     overlayFile: File | null;
//     onFile: (file: File | null) => void;  // App holds it, passes to createGif
//   }
//
// PLANNED CONTENTS
//   - <input type="file" accept="image/png"> (or a dropzone).
//   - Client-side sanity checks: PNG mime type; warn if it has no alpha
//     (a fully opaque overlay hides the albums entirely).
//   - Small preview of the PNG over a checkerboard background, plus a
//     "remove overlay" button → onFile(null).
//
// THE FULL PHASE-2 CHAIN (each file has a matching PHASE 2 note)
//   here → App.tsx state → api/client.ts (switch to FormData)
//        → server routes/gif.ts (multer) → services/gifBuilder.ts
//          (sharp.composite per frame — implementation sketch lives there)
// ============================================================================

export default function OverlayUpload() {
  return null; // Phase 2
}
