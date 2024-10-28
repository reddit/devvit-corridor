import {
  type Melody,
  type Tone,
  beatMillis,
  melodyMillis,
  restNote,
  silence
} from '../../shared/serial.js'
import type {UTCMillis} from './time.js'

export type MelodyBuffer = {
  flipped: UTCMillis
  front: Melody
  back: Melody
  write: 'back' | 'front'
}

export function melodyBeat(time: UTCMillis): number {
  return Math.trunc((time % melodyMillis) / beatMillis)
}

/** returns 0-4. */
export function melodyGet(melody: Melody, beat: number): Tone | undefined {
  return melodyDecode(melody, beat)
}

export function melodyRecordBeat(time: UTCMillis): number {
  return Math.trunc(((time + beatMillis / 2) % melodyMillis) / beatMillis)
}

/** when to send the stale buffer. */
export function isMelodyStart(time: UTCMillis): boolean {
  return time % melodyMillis < beatMillis
}

export function melodyMetronomeBuffer(
  buf: Readonly<MelodyBuffer>,
  time: UTCMillis
): Melody {
  if (time % melodyMillis >= melodyMillis - beatMillis / 2)
    return melodyBufferRead(buf)
  return melodyBufferPeek(buf)
}

export function MelodyBuffer(): MelodyBuffer {
  return {
    flipped: 0 as UTCMillis,
    write: 'front',
    front: silence,
    back: silence
  }
}

/** call every frame before reading or writing to the buffer. */
export function melodyBufferFlip(buf: MelodyBuffer, time: UTCMillis): void {
  if (time + beatMillis / 2 - buf.flipped >= melodyMillis) {
    buf.write = buf.write === 'back' ? 'front' : 'back'
    buf[buf.write] = silence
    buf.flipped = (time +
      beatMillis / 2 -
      ((time + beatMillis / 2) % melodyMillis)) as UTCMillis
  }
}

export function melodyBufferPut(
  buf: MelodyBuffer,
  tone: Tone,
  time: UTCMillis
): void {
  const beat = melodyRecordBeat(time)
  buf[buf.write] = (buf[buf.write].slice(0, beat) +
    encodeTone(tone) +
    buf[buf.write].slice(beat + 1)) as Melody
}

/** call melodyFlip() first. */
export function melodyBufferRead(buf: Readonly<MelodyBuffer>): Melody {
  return buf.write === 'back' ? buf.front : buf.back // return the stale buffer.
}

export function melodyBufferPeek(buf: Readonly<MelodyBuffer>): Melody {
  return buf.write === 'back' ? buf.back : buf.front
}

function encodeTone(tone: Tone | undefined): string {
  return tone == null ? restNote : String.fromCodePoint(65 + tone)
}

function melodyDecode(melody: Melody, beat: number): Tone | undefined {
  return melody[beat] === restNote
    ? undefined
    : ((melody[beat]!.charCodeAt(0) - 65) as Tone)
}
