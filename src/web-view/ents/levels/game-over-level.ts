import type {Box} from '../../../shared/types/2d.js'
import type {UUID} from '../../../shared/types/uuid.js'
import {lvlWH} from '../../grid.js'
import type {GameState} from '../../types/game-state.js'
import type {Layer} from '../../types/layer.js'
import {PlayButton} from '../play-button.js'
import {CorridorLevel} from './corridor-level.js'

export type GameOverLevel = Box & {
  readonly layer: Layer
  readonly type: 'GameOverLevel'
  readonly uuid: UUID
}

export function GameOverLevel(state: GameState): GameOverLevel {
  state.zoo.replace(state.cam, PlayButton())
  state.paused = true
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
  lvl: GameOverLevel,
  state: GameState
): void {
  if (state.ctrl.isOnStart('A') || state.ctrl.isOnStart('S')) {
    state.zoo.remove(lvl)
    state.zoo.replace(state.cam, CorridorLevel(state))
  }
}

export function gameOverLevelDraw(
  _lvl: Readonly<GameOverLevel>,
  _state: Readonly<GameState>
): void {
  // clear. this should be in level coordinates but camera movements causes an
  // unpleasant shimmering.
  // state.draw.c2d.fillStyle = state.draw.checkerboard
  // state.draw.c2d.fillRect(0, 0, state.canvas.width, state.canvas.height)
}
