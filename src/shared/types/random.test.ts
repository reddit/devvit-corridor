import {expect, test} from 'vitest'
import {Random} from './random.js'

// 0 is same as 1
// 1 is same as official
// max is same as 1
// modulo rollover

// https://www.firstpr.com.au/dsp/rand31/#History-implementation
for (const [name, seed, expected] of [
  ['max + 1', 0x7fff_ffff, 1],
  ['min - 1', 0, 1],
  ['min', 1, 16807],
  ['iteration 2', 16807, 282475249],
  ['iteration 3', 282475249, 1622650073],
  ['iteration 4', 1622650073, 984943658],
  ['iteration 5', 984943658, 1144108930],
  ['iteration 6', 1144108930, 470211272],
  ['iteration 7', 470211272, 101027544],
  ['iteration 8', 101027544, 1457850878],
  ['iteration 9', 1457850878, 1458777923],
  ['iteration 10', 1458777923, 2007237709],
  ['iteration 9999', 925166085, 1484786315],
  ['iteration 10000', 1484786315, 1043618065],
  ['iteration 10001', 1043618065, 1589873406],
  ['iteration 10002', 1589873406, 2010798668],
  ['iteration 2147483644', 1207672015, 1475608308],
  ['iteration 2147483645', 1475608308, 1407677000]
] as const) {
  test(name, () => {
    const random = new Random(seed)
    // Test seed instead of integer since we have a hack to give better
    // initial values not in the paper.
    expect(random.seed).toBe(expected)
  })
}
