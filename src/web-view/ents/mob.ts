import {type Box, boxHits, xyMagnitude, xySub} from '../../shared/types/2d.js'
import type {UUID} from '../../shared/types/uuid.js'
import {isVisible, lvlWH} from '../grid.js'
import {beep} from '../types/audio.js'
import type {GameState} from '../types/game-state.js'
import type {Layer} from '../types/layer.js'
import type {UTCMillis} from '../types/time.js'
import {drawCircle} from '../utils/draw.js'
import {
  leechRangePx,
  leechSizePx,
  leechSpeedPxMillis
} from '../utils/metrics.js'
import {black90} from '../utils/palette.js'
import {p1IsInvincible} from './player.js'

export type LeechMob = Box & {
  readonly layer: Layer
  played: UTCMillis
  readonly type: 'LeechMob'
  readonly uuid: UUID
}

export function LeechMob(): LeechMob {
  return {
    type: 'LeechMob',
    layer: 'Default',
    // to-do: streaming?
    x: Math.random() * lvlWH.w,
    y: Math.random() * lvlWH.h,
    w: leechSizePx,
    h: leechSizePx,
    uuid: crypto.randomUUID(),
    played: 0 as UTCMillis
  }
}

export function leechMobUpdate(mob: LeechMob, state: GameState): void {
  const dst = xySub(state.p1, mob)
  const distance = xyMagnitude(dst)
  if (distance <= leechRangePx) {
    const dir = {x: dst.x / distance, y: dst.y / distance}
    mob.x = mob.x + state.millis * leechSpeedPxMillis * dir.x
    mob.y = mob.y + state.millis * leechSpeedPxMillis * dir.y
    if (boxHits(state.p1, mob)) {
      if (p1IsInvincible(state.p1)) leechMobKill(mob, state)
      else {
        const duration = 100
        if (state.time - mob.played > duration) {
          beep(state.audio.ctx, 'sine', 100, 400, duration / 1000)
          mob.played = state.time
        }
        state.p1.hp -= (10 * state.millis) / 1000
      }
    }
    // audioBeep(ctx, 'sine', 440, 800, 0.05)
  }
}

export function leechMobKill(mob: LeechMob, state: Readonly<GameState>): void {
  state.p1.score++
  state.zoo.remove(mob)
  beep(state.audio.ctx, 'sine', 440, 800, 0.05)
}

export function leechMobDraw(
  mob: Readonly<LeechMob>,
  state: Readonly<GameState>
): void {
  if (!isVisible(mob)) return
  drawCircle(state.draw.c2d, mob, leechSizePx / 2, black90)
}
