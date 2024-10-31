import {expect, test} from 'vitest'
import {Throttle} from './throttle.js'

test('a throttled function is invoked with the latest arguments', async () => {
  const out = {val: 0}
  const throttle = new Throttle((val: number) => {
    out.val = val
  }, 5)
  throttle.schedule(1)
  expect(out.val).toBe(0)
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(out.val).toBe(1)
  throttle.schedule(2)
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(out.val).toBe(1)
  await new Promise(resolve => setTimeout(resolve, 5))
  expect(out.val).toBe(2)
})
