import type {Box, XY} from './2d.js'
import type {T2} from './tid.js'
import type {UUID} from './uuid.js'

// to-do: rename.
/** post author. */
export type Author = {
  score: number | null
  /** if author and p1.t2 don't match, user must create a new game. */
  t2: T2
  username: string
}

/** broadcasted player state. */
export type PlayerSerial = Box &
  Profile & {
    /** player direction. 0, 0 if not moving. */
    dir: XY
    /** player health points (0 is dead). */
    hp: number
    score: number
  }

export type Profile = {
  /** player client; eg, Shreddit (reddit.com), Android, or iOS. */
  client: string
  /** player username. eg, spez. */
  name: string
  /** avatar image URL. */
  snoovatarURL: string
  /** player user ID. t2_0 for anons. */
  t2: T2
  /** player UUIDv4. always favor this for comparisons if anon is possible. */
  readonly uuid: UUID
}
