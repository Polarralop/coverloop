interface Props {
  gifUrl: string | null;  // object URL from api.createGif; App owns revoking it
  building: boolean;
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
      <a href={gifUrl}><img src={gifUrl} alt="Your album GIF" /></a>
      <a href={gifUrl} download="coverloop.gif">download</a>
    </div>
  );
}
