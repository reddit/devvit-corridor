import {expect, test} from 'vitest'
import {clamp} from './math.js'

test('clamp()', () => {
  expect(clamp(1, 2, 3)).toBe(2)
  expect(clamp(2, 2, 3)).toBe(2)
  expect(clamp(3, 2, 3)).toBe(3)
  expect(clamp(4, 2, 3)).toBe(3)
})
