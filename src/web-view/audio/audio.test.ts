import {describe, expect, test} from 'vitest'
import {calculatePentatonicPlaybackRate} from './audio.js'

describe('calculatePentatonicPlaybackRate()', () => {
  test('positive scale', () => {
    expect(calculatePentatonicPlaybackRate(0)).toBeCloseTo(1)
    expect(calculatePentatonicPlaybackRate(1)).toBeCloseTo(1.12246)
    expect(calculatePentatonicPlaybackRate(5)).toBeCloseTo(2)
    expect(calculatePentatonicPlaybackRate(6)).toBeCloseTo(2.24492)
    expect(calculatePentatonicPlaybackRate(10)).toBeCloseTo(4)
  })

  test('negative scale', () => {
    expect(calculatePentatonicPlaybackRate(-1)).toBeCloseTo(0.8409)
    expect(calculatePentatonicPlaybackRate(-5)).toBeCloseTo(0.5)
    expect(calculatePentatonicPlaybackRate(-6)).toBeCloseTo(0.4204)
    expect(calculatePentatonicPlaybackRate(-10)).toBeCloseTo(0.25)
  })
})
