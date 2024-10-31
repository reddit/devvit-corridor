import type {WH} from '../../shared/types/2d.js'
import type {UUID} from '../../shared/types/uuid.js'
import type {P1, Player} from '../ents/player.js'
import type {Zoo} from '../ents/zoo.js'
import type {DefaultButton, Input} from '../input/input.js'
import type {Draw} from '../looper.js'
import type {Assets} from './assets.js'
import type {Audio} from './audio.js'
import type {Cam} from './cam.js'
import type {UTCMillis} from './time.js'

// to-do: better type and arg name?
export type GameState = {
  readonly assets: Assets
  readonly audio: Audio
  readonly cam: Cam
  readonly canvas: HTMLCanvasElement
  connected: boolean
  readonly ctrl: Input<DefaultButton>
  debug: boolean
  readonly draw: Draw // to-do: when passing around, unpack c2d and such. this has to be undefined in Game anwyay.
  readonly lvlWH: Readonly<WH> // to-do: level management.
  msgID: number
  outdated: boolean
  readonly p1: P1
  paused: boolean
  readonly peers: {[uuid: UUID]: Player}
  readonly zoo: Zoo // to-do: does zoo become common denominator to level?

  // to-do: streaming millis?
  millis: number
  time: UTCMillis
}
