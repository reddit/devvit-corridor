import type {Box} from '../../../shared/types/2d.js'
import type {UUID} from '../../../shared/types/uuid.js'
import {gridAt, lvlWH} from '../../grid.js'
import {drawCircle} from '../../types/draw.js'
import type {GameState} from '../../types/game-state.js'
import type {Layer} from '../../types/layer.js'
import {tileSizePx} from '../../utils/metrics.js'
import {PlayNewButton} from '../play-new-button.js'

export type GameOverLevel = Box & {
  readonly layer: Layer
  readonly type: 'GameOverLevel'
  readonly uuid: UUID
}

export function GameOverLevel(state: GameState): GameOverLevel {
  state.zoo.replace(state.cam, PlayNewButton())
  state.paused = true
  state.ctrl.allowContextMenu = true
  return {
    layer: 'Level',
    type: 'GameOverLevel',
    x: 0,
    y: 0,
    w: lvlWH.w,
    h: lvlWH.h,
    // to-do: streaming?
    uuid: crypto.randomUUID()
  }
}

export function gameOverLevelUpdate(
  _lvl: GameOverLevel,
  _state: GameState
): void {}

export function gameOverLevelDraw(
  _lvl: Readonly<GameOverLevel>,
  state: Readonly<GameState>
): void {
  const {cam} = state
  const {c2d} = state.draw
  const radius = tileSizePx / 2

  // to-do: don't copy and paste all this from corridor-level.

  // clear. this should be in level coordinates but camera movements causes an
  // unpleasant shimmering.
  state.draw.c2d.fillStyle = state.draw.checkerboard
  state.draw.c2d.fillRect(0, 0, state.canvas.width, state.canvas.height)

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
        case '◯':
          drawCircle(c2d, {x: x - radius, y: y - radius}, radius, '#0004') // to-do: sort of randomish opacity based on something derivable
          break
        case '⬤':
          drawCircle(c2d, {x: x - radius, y: y - radius}, radius, '#fffb') // to-do: sort of randomish opacity based on something derivable
          break
        case ' ':
          break
        default:
          tile satisfies never
      }
    }
}
