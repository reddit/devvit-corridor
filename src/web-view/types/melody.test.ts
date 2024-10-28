import {expect, test} from 'vitest'
import type {Tone} from '../../shared/serial.js'
import {
  MelodyBuffer,
  melodyBeat,
  melodyBufferFlip,
  melodyBufferPeek,
  melodyBufferPut,
  melodyBufferRead
} from './melody-buffer.js'
import type {UTCMillis} from './time.js'

test('encode full melody', () => {
  const buf = MelodyBuffer()

  melodyBufferFlip(buf, 0 as UTCMillis)
  melodyBufferPut(buf, 0 as Tone, 0 as UTCMillis)
  expect(melodyBufferPeek(buf)).toBe('A-------')
  expect(melodyBufferRead(buf)).toBe('--------')

  melodyBufferFlip(buf, 500 as UTCMillis)
  melodyBufferPut(buf, 1 as Tone, 500 as UTCMillis)
  expect(melodyBufferPeek(buf)).toBe('AB------')
  expect(melodyBufferRead(buf)).toBe('--------')

  melodyBufferFlip(buf, 1000 as UTCMillis)
  melodyBufferPut(buf, 2 as Tone, 1000 as UTCMillis)
  expect(melodyBufferPeek(buf)).toBe('ABC-----')
  expect(melodyBufferRead(buf)).toBe('--------')

  melodyBufferFlip(buf, 1500 as UTCMillis)
  melodyBufferPut(buf, 3 as Tone, 1500 as UTCMillis)
  expect(melodyBufferPeek(buf)).toBe('ABCD----')
  expect(melodyBufferRead(buf)).toBe('--------')

  melodyBufferFlip(buf, 2000 as UTCMillis)
  melodyBufferPut(buf, 4 as Tone, 2000 as UTCMillis)
  expect(melodyBufferPeek(buf)).toBe('ABCDE---')
  expect(melodyBufferRead(buf)).toBe('--------')

  melodyBufferFlip(buf, 2500 as UTCMillis)
  melodyBufferPut(buf, 5 as Tone, 2500 as UTCMillis)
  expect(melodyBufferPeek(buf)).toBe('ABCDEF--')
  expect(melodyBufferRead(buf)).toBe('--------')

  melodyBufferFlip(buf, 3000 as UTCMillis)
  melodyBufferPut(buf, 6 as Tone, 3000 as UTCMillis)
  expect(melodyBufferPeek(buf)).toBe('ABCDEFG-')
  expect(melodyBufferRead(buf)).toBe('--------')

  melodyBufferFlip(buf, 3500 as UTCMillis)
  melodyBufferPut(buf, 7 as Tone, 3500 as UTCMillis)
  expect(melodyBufferPeek(buf)).toBe('ABCDEFGH')
  expect(melodyBufferRead(buf)).toBe('--------')

  melodyBufferFlip(buf, 4000 as UTCMillis)
  melodyBufferPut(buf, 8 as Tone, 4000 as UTCMillis)
  expect(melodyBufferPeek(buf)).toBe('I-------')
  expect(melodyBufferRead(buf)).toBe('ABCDEFGH')
})

test('overwrite', () => {
  const buf = MelodyBuffer()

  melodyBufferFlip(buf, 4000 as UTCMillis)
  melodyBufferPut(buf, 0 as Tone, 4000 as UTCMillis)
  expect(melodyBufferPeek(buf)).toBe('A-------')
  expect(melodyBufferRead(buf)).toBe('--------')

  melodyBufferFlip(buf, 4100 as UTCMillis)
  melodyBufferPut(buf, 1 as Tone, 4100 as UTCMillis)
  expect(melodyBufferPeek(buf)).toBe('B-------')
  expect(melodyBufferRead(buf)).toBe('--------')
})

test('melodyBeat()', () => {
  expect(melodyBeat(0 as UTCMillis)).toBe(0)
  expect(melodyBeat(100 as UTCMillis)).toBe(0)
  expect(melodyBeat(500 as UTCMillis)).toBe(1)
  expect(melodyBeat(501 as UTCMillis)).toBe(1)
  expect(melodyBeat(3999 as UTCMillis)).toBe(7)
  expect(melodyBeat(4000 as UTCMillis)).toBe(0)
  expect(melodyBeat(4100 as UTCMillis)).toBe(0)
  expect(melodyBeat(4500 as UTCMillis)).toBe(1)
  expect(melodyBeat(4999 as UTCMillis)).toBe(1)
})
