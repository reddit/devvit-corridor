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

// to-do: review usage. if needed, port tests.
/**
 * modulo a number across domain.
 * @arg min An integer < max
 * @arg max An integer > min
 * @return A value wrapped to the domain [min, max).
 */
export function wrap(num: number, min: number, max: number): number {
  if (min === max) return min
  const range = max - min // range ∈ [0, +∞).
  const x = (num - min) % range // Subtract min and wrap to x ∈ (-range, range).
  const y = x + range // Translate to y ∈ (0, 2 * range).
  const z = y % range // Wrap to z ∈ [0, range).
  return z + min // Add min to return ∈ [min, max).
}
