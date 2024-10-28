import {describe, expect, test} from 'vitest'
import {angleBetween, dotProduct, magnitude} from './2d.js'

describe('dotProduct()', () => {
  test('v · v', () => {
    expect(
      dotProduct(
        {x: -0.6836781075757513, y: 0.7297836975581459},
        {x: -0.6836781075757514, y: 0.7297836975581458}
      )
    ).toBe(1)
  })
})

describe('magnitude()', () => {
  test('unit vector', () => {
    expect(
      magnitude({x: -0.6836781075757513, y: 0.7297836975581459})
    ).toBeCloseTo(1)
  })
})

describe('angleBetween()', () => {
  test('same vector', () => {
    const v = {x: -0.6836781075757513, y: 0.7297836975581459}
    expect(angleBetween(v, v)).toBe(0)
  })

  test('zero and zero', () => {
    expect(angleBetween({x: 0, y: 0}, {x: 0, y: 0})).toBe(0)
  })

  test('nonzero and zero', () => {
    expect(
      angleBetween(
        {x: -0.6836781075757513, y: 0.7297836975581459},
        {x: 0, y: 0}
      )
    ).toBe(Math.PI / 2)
  })

  test('up and right', () => {
    expect(angleBetween({x: 0, y: 1}, {x: 1, y: 0})).toBe(Math.PI / 2)
  })
})
