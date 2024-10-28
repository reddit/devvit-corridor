import type {XY} from './2d.js'
import type {T2} from './tid.js'
import type {UUID} from './uuid.js'

/** broadcasted player state. */
export type PlayerSerial = {
  /** player direction. 0, 0 if not moving. */
  dir: XY
  /** flip player render horizontally. */
  flipX: boolean
  instrument: Instrument
  melody: Melody
  /** player username. eg, spez. */
  name: string
  root: Tone
  /** avatar image URL. */
  snoovatarURL: string
  /** player user ID. t2_0 for anons. */
  t2: T2
  /** player UUIDv4. always favor this for comparisons if anon is possible. */
  uuid: UUID
  /** player position. */
  xy: XY
  // to-do: report player device and show it under their avatar to make folks
  // feel more connected.
}

export type Instrument =
  | 'Bubbler'
  | 'Clapper'
  | 'Jazzman'
  | 'Rgggggg'
  | 'Wailer'

declare const melodySerial: unique symbol
/**
 * eight beats representing a four-second phrase. each character is a note
 * encoded as A + tonal scale (may be negative) or dash (rest).
 */
export type Melody = string & {[melodySerial]: never}

/** beats per melody. */
export const melodyLen: number = 8
export const melodyMillis: number = 4_000
export const beatMillis: number = melodyMillis / melodyLen

export const restNote: string = '-'
export const silence: Melody = restNote.repeat(melodyLen) as Melody

declare const tone: unique symbol
/** Pentatonic scalar. five is an octave. */
export type Tone = number & {[tone]: never}
