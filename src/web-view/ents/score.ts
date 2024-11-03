import type {UUID} from '../../shared/types/uuid.js'
import {drawText} from '../types/draw.js'
import type {GameState} from '../types/game-state.js'
import type {Layer} from '../types/layer.js'
import {white80} from '../utils/palette.js'

export type Score = {
  readonly layer: Layer
  readonly type: 'Score'
  readonly uuid: UUID
}

export function Score(): Score {
  // to-do: streaming?
  return {layer: 'UI', type: 'Score', uuid: crypto.randomUUID()}
}

export function scoreUpdate(_score: Score, _state: GameState): void {}

export function scoreDraw(
  _score: Readonly<Score>,
  state: Readonly<GameState>
): void {
  drawText(
    state.draw.c2d,
    state.author.username,
    {x: 0, y: state.cam.h},
    'BottomLeft',
    white80
  )

  drawText(
    state.draw.c2d,
    `${state.author.score ?? state.p1.score}`,
    {x: state.cam.w, y: state.cam.h},
    'BottomRight',
    white80
  )
}
