// ============================================================================
// SpeedControl.tsx — frame-delay slider
// ----------------------------------------------------------------------------
// WHAT GOES IN HERE
//   - <input type="range" min={100} max={2000} step={50}> bound to valueMs.
//     Range rationale: GIF delays snap to 10ms steps and browsers ignore
//     ultra-short delays — see the NOTES in server/src/services/gifBuilder.ts.
//   - A readout next to it. Consider showing BOTH:
//       "500ms per frame (2.0 fps)"   — fps = 1000 / valueMs
//     since "speed" reads more naturally as fps but the API takes a delay.
//   - Fire onChange on every input event (e.target.value is a STRING —
//     Number() it); the debouncing lives in App, not here.
//
// LINKS WITH
//   - App.tsx (parent; forwards frameDelayMs into the /api/gif payload)
// ============================================================================

interface Props {
  valueMs: number;                 // App.frameDelayMs
  onChange: (ms: number) => void;  // App.handleDelayChange (App debounces rebuilds)
}

export default function SpeedControl({ valueMs, onChange }: Props) {
  // TODO
  return null;
}
