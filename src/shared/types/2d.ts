import {clamp, closeTo} from '../utils/math.js'

/**
 * rectangle. empty is zero width or height. for ents, x and y tend to be
 * fractional and w and h integral pixel dimensions in level space.
 */
export type Box = XY & WH
export type WH = {w: number; h: number}
export type XY = {x: number; y: number}

// to-do: tests.
export function boxHits(
  lhs: Readonly<Box>,
  rhs: Readonly<XY & Partial<WH>>
): boolean {
  const rw = rhs.w ?? 1 // point? an empty box defines zero w/h.
  const rh = rhs.h ?? 1
  if (!lhs.w || !lhs.h || !rw || !rh) return false // noncommutative.
  return (
    lhs.x < rhs.x + rw &&
    lhs.x + lhs.w > rhs.x &&
    lhs.y < rhs.y + rh &&
    lhs.y + lhs.h > rhs.y
  )
}

export function xyAdd(lhs: Readonly<XY>, rhs: Readonly<XY>): XY {
  return {x: lhs.x + rhs.x, y: lhs.y + rhs.y}
}

/** returns angle between vectors in radians [0, π]. */
export function xyAngleBetween(lhs: Readonly<XY>, rhs: Readonly<XY>): number {
  const mag0 = xyMagnitude(lhs)
  const mag1 = xyMagnitude(rhs)
  if (!mag0 && !mag1) return 0
  return Math.acos(clamp(xyDot(lhs, rhs) / (mag0 * mag1 || 1), -1, 1))
}

export function xyCloseTo(
  lhs: Readonly<XY>,
  rhs: Readonly<XY>,
  tolerance: number
): boolean {
  return closeTo(lhs.x, rhs.x, tolerance) && closeTo(lhs.y, rhs.y, tolerance)
}

export function xyDot(v0: Readonly<XY>, v1: Readonly<XY>): number {
  return v0.x * v1.x + v0.y * v1.y
}

export function xyMagnitude(v: Readonly<XY>): number {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

// export function xyLerp(
//   start: Readonly<XY>,
//   end: Readonly<XY>,
//   ratio: number
// ): XY {
//   return {x: lerp(start.x, end.x, ratio), y: lerp(start.y, end.y, ratio)}
// }

export function xySub(lhs: Readonly<XY>, rhs: Readonly<XY>): XY {
  return {x: lhs.x - rhs.x, y: lhs.y - rhs.y}
}

export function xyTrunc(xy: Readonly<XY>): XY {
  return {x: Math.trunc(xy.x), y: Math.trunc(xy.y)}
}
