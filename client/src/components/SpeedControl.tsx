interface Props {
  valueMs: number;
  onChange: (ms: number) => void;  // App debounces the rebuild
}

const MIN_MS = 100;
const MAX_MS = 2000;

export default function SpeedControl({ valueMs, onChange }: Props) {
  const fps = (1000 / valueMs).toFixed(1);

  // The slider reads as SPEED — dragging right fills the bar and plays faster.
  // The GIF is driven by a per-frame DELAY, which is the inverse, so we flip the
  // position: (MIN + MAX) - valueMs. A fuller bar = a smaller delay = faster.
  const sliderValue = MIN_MS + MAX_MS - valueMs;

  return (
    <div className="speed-control">
      <label htmlFor="speed-slider">speed</label>
      <input
        id="speed-slider"
        type="range"
        min={MIN_MS}
        max={MAX_MS}
        step={50}
        value={sliderValue}
        onChange={(e) => onChange(MIN_MS + MAX_MS - Number(e.target.value))}
      />
      <span>{valueMs}ms per frame ({fps} fps)</span>
    </div>
  );
}
