import type {Box, XY} from './2d.js'
import type {T2} from './tid.js'
import type {UUID} from './uuid.js'

/** broadcasted player state. */
export type PlayerSerial = Box & {
  /** player client; eg, Shreddit (reddit.com), Android, or iOS. */
  client: string
  /** player direction. 0, 0 if not moving. */
  dir: XY
  /** player health points (0 is dead). */
  hp: number
  /** player username. eg, spez. */
  name: string
  score: number
  /** avatar image URL. */
  snoovatarURL: string
  /** player user ID. t2_0 for anons. */
  t2: T2
  /** player UUIDv4. always favor this for comparisons if anon is possible. */
  readonly uuid: UUID
}
