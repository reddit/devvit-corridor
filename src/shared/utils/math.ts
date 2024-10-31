// to-do: port tests.
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

export function closeTo(lhs: number, rhs: number, tolerance: number): boolean {
  return Math.abs(lhs - rhs) <= tolerance
}

// to-do: port tests.
/** ratio is [0, 1] to return [start, end]. */
export function lerp(start: number, end: number, ratio: number): number {
  return start + (end - start) * ratio
}
