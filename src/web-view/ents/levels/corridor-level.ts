import type {Box} from '../../../shared/types/2d.js'
import type {UUID} from '../../../shared/types/uuid.js'
import {gridAt, lvlWH, updateFog} from '../../grid.js'
import type {GameState} from '../../types/game-state.js'
import type {Layer} from '../../types/layer.js'
import {drawCircle} from '../../utils/draw.js'
import {playerDefaultHP, tileSizePx} from '../../utils/metrics.js'
import {Cursor} from '../cursor.js'
import {Item} from '../item.js'
import {LeechMob} from '../mob.js'
import {Score} from '../score.js'
import {Status} from '../status.js'
import {GameOverLevel} from './game-over-level.js'

export type CorridorLevel = Box & {
  readonly layer: Layer
  readonly type: 'CorridorLevel'
  readonly uuid: UUID
}

export function CorridorLevel(state: GameState): CorridorLevel {
  const {zoo} = state
  state.paused = false
  zoo.clear()
  zoo.replace(state.cam, state.p1, Cursor(), Score(), Status())
  state.p1.hp = playerDefaultHP
  state.p1.score = 0
  state.p1.x = state.p1.y = 4800

  // to-do: audio distance.
  for (let i = 0; i < 32_000; i++) {
    const mob = LeechMob()
    zoo.replace(state.cam, mob)
  }
  for (let i = 0; i < 800; i++) {
    // to-do: don't spawn in walls.
    const xy = {x: Math.random() * lvlWH.w, y: Math.random() * lvlWH.h}
    const item = Item(xy)
    zoo.replace(state.cam, item)
  }

  return {
    layer: 'Level',
    type: 'CorridorLevel',
    x: 0,
    y: 0,
    w: lvlWH.w,
    h: lvlWH.h,
    // to-do: streaming?
    uuid: crypto.randomUUID()
  }
}

export function corridorLevelUpdate(
  lvl: CorridorLevel,
  state: GameState
): void {
  if (state.p1.hp <= 0) {
    state.zoo.remove(lvl)
    state.zoo.replace(state.cam, GameOverLevel(state))
  }
  updateFog(state.p1)
}

export function corridorLevelDraw(
  _lvl: Readonly<CorridorLevel>,
  state: Readonly<GameState>
): void {
  const {cam} = state
  const {c2d} = state.draw
  const radius = tileSizePx / 2

  // clear. this should be in level coordinates but camera movements causes an
  // unpleasant shimmering.
  c2d.fillStyle = state.draw.checkerboard
  c2d.fillRect(0, 0, state.canvas.width, state.canvas.height)

  c2d.translate(-state.cam.x, -state.cam.y)

  for (
    let y = Math.trunc(cam.y) - (Math.trunc(cam.y) % tileSizePx) - tileSizePx;
    y < Math.trunc(cam.y) + cam.h + tileSizePx;
    y += tileSizePx
  )
    for (
      let x = Math.trunc(cam.x) - (Math.trunc(cam.x) % tileSizePx) - tileSizePx;
      x < Math.trunc(cam.x) + cam.w + tileSizePx;
      x += tileSizePx
    ) {
      const tile = gridAt({x, y})
      switch (tile) {
        case undefined:
          drawCircle(c2d, {x: x - radius, y: y - radius}, radius, '#0006') // to-do: sort of randomish opacity based on something derivable
          break
        case 'Foggy':
          drawCircle(c2d, {x: x - radius, y: y - radius}, radius, '#0004') // to-do: sort of randomish opacity based on something derivable
          break
        case '█':
          drawCircle(c2d, {x: x - radius, y: y - radius}, radius, '#fffb') // to-do: sort of randomish opacity based on something derivable
          break
        case ' ':
          break
        default:
          tile satisfies never
      }
    }
}
