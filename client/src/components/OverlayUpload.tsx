import { useRef } from 'react';

interface Props {
  overlayFile: File | null;
  onFile: (file: File | null) => void;
}

export default function OverlayUpload({overlayFile, onFile}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const MAX_MB = 5;
  const MAX_SIZE_BYTES = MAX_MB * 1024 * 1024; // 5MB

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (file && file.type !== 'image/png') {
      alert('Please choose a PNG file.');
      return;
    }

    if (file && file.size > MAX_SIZE_BYTES) {
      alert(`Please choose a file smaller than ${MAX_MB}MB.`);
      return;
    }

    onFile(file);
  }

  const handleRemove = () => {
    onFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <div className="overlay-upload">
      <input ref={inputRef} type="file" accept="image/png" onChange={handleChange} />
      {overlayFile && (
        <button onClick={handleRemove}>remove png overlay</button>
      )}
    </div>
  );
}
