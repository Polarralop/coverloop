interface Props {
  valueMs: number;
  onChange: (ms: number) => void;  // App debounces the rebuild
}

export default function SpeedControl({ valueMs, onChange }: Props) {
  const fps = (1000 / valueMs).toFixed(1);

  return (
    <div className="speed-control">
      <label htmlFor="speed-slider">Speed</label>
      <input
        id="speed-slider"
        type="range"
        min={100}
        max={2000}
        step={50}
        value={valueMs}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span>{valueMs}ms per frame ({fps} fps)</span>
    </div>
  );
}
