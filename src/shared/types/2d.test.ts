import {describe, expect, test} from 'vitest'
import {xyAngleBetween, xyDot, xyMagnitude} from './2d.js'

describe('xyDot()', () => {
  test('v · v', () => {
    expect(
      xyDot(
        {x: -0.6836781075757513, y: 0.7297836975581459},
        {x: -0.6836781075757514, y: 0.7297836975581458}
      )
    ).toBe(1)
  })
})

describe('xyMagnitude()', () => {
  test('unit vector', () => {
    expect(
      xyMagnitude({x: -0.6836781075757513, y: 0.7297836975581459})
    ).toBeCloseTo(1)
  })
})

describe('xyAngleBetween()', () => {
  test('same vector', () => {
    const v = {x: -0.6836781075757513, y: 0.7297836975581459}
    expect(xyAngleBetween(v, v)).toBe(0)
  })

  test('zero and zero', () => {
    expect(xyAngleBetween({x: 0, y: 0}, {x: 0, y: 0})).toBe(0)
  })

  test('nonzero and zero', () => {
    expect(
      xyAngleBetween(
        {x: -0.6836781075757513, y: 0.7297836975581459},
        {x: 0, y: 0}
      )
    ).toBe(Math.PI / 2)
  })

  test('up and right', () => {
    expect(xyAngleBetween({x: 0, y: 1}, {x: 1, y: 0})).toBe(Math.PI / 2)
  })
})
