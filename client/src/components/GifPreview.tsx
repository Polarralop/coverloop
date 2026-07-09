// ============================================================================
// GifPreview.tsx — the result
// ----------------------------------------------------------------------------
// WHAT GOES IN HERE
//   - building → progress indicator (fetching covers + encoding can take a
//     couple of seconds for many frames).
//   - gifUrl → <img src={gifUrl} alt="Your album GIF" />
//   - A download link:  <a href={gifUrl} download="coverloop.gif">Download</a>
//     (object URLs work fine with the download attribute).
//   - Neither → placeholder box explaining what will appear here.
//
// NOTE: object URL lifecycle (revoking the old one on rebuild) is App's
// job, not this component's — it just renders whatever url it's given.
//
// LINKS WITH
//   - App.tsx (parent)
// ============================================================================

interface Props {
  gifUrl: string | null;  // object URL from api.createGif (App.gifUrl)
  building: boolean;      // App.isBuilding
}

export default function GifPreview({ gifUrl, building }: Props) {
  if (building) {
    return <p className="hint">building your GIF...</p>;
  }

  if (!gifUrl) {
    return <p className="hint">your GIF will show up here.</p>;
  }
  return (
    <div className="gif-preview">
      <img src={gifUrl} alt="Your album GIF" />
      <a href={gifUrl} download="coverloop.gif">download</a>
    </div>
  );
}
