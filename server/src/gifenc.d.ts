declare module 'gifenc' {
  export function GIFEncoder(): any;
  export function quantize(data: Uint8Array | Buffer, maxColors: number): number[][];
  export function applyPalette(data: Uint8Array | Buffer, palette: number[][]): Uint8Array;
}