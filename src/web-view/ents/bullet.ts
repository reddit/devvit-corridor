import {type Box, type XY, boxHits} from '../../shared/types/2d.js'
import type {UUID} from '../../shared/types/uuid.js'
import {isVisible} from '../grid.js'
import {beep} from '../types/audio.js'
import type {GameState} from '../types/game-state.js'
import type {Layer} from '../types/layer.js'
import type {UTCMillis} from '../types/time.js'
import {drawCircle} from '../utils/draw.js'
import {
  bulletSizePx,
  bulletSpeedPxMillis,
  bulletTTLMillis
} from '../utils/metrics.js'
import {white90} from '../utils/palette.js'
import {leechMobKill} from './mob.js'

export type Bullet = Box & {
  beeped: boolean
  created: UTCMillis
  dir: XY
  readonly layer: Layer
  readonly type: 'Bullet'
  readonly uuid: UUID
}

export function Bullet(
  dir: Readonly<XY>,
  time: UTCMillis,
  xy: Readonly<XY>
): Bullet {
  return {
    beeped: false,
    created: time,
    dir: {x: dir.x, y: dir.y},
    layer: 'Default',
    type: 'Bullet',
    uuid: crypto.randomUUID(), // to-do: streaming?
    x: xy.x,
    y: xy.y,
    w: bulletSizePx,
    h: bulletSizePx
  }
}

export function bulletUpdate(bullet: Bullet, state: GameState): void {
  if (state.time - bullet.created > bulletTTLMillis) {
    state.zoo.remove(bullet)
    return
  }

  bullet.x += state.millis * bulletSpeedPxMillis * bullet.dir.x
  bullet.y += state.millis * bulletSpeedPxMillis * bullet.dir.y

  for (const ent of state.zoo.viewport()) {
    if (ent.type !== 'LeechMob' || !boxHits(bullet, ent)) continue
    leechMobKill(ent, state)
    state.zoo.remove(bullet)
    break
  }

  if (bullet.beeped) return
  beep(state.audio.ctx, 'sine', 300, 300, 0.015)
  bullet.beeped = true
}

export function bulletDraw(
  bullet: Readonly<Bullet>,
  state: Readonly<GameState>
): void {
  if (!isVisible(bullet)) return
  drawCircle(state.draw.c2d, bullet, bulletSizePx / 2, white90)
}
