import type {UUID} from '../../shared/types/uuid.js'
import type {GameState} from '../types/game-state.js'
import type {Layer} from '../types/layer.js'
import {drawText} from '../utils/draw.js'
import {white} from '../utils/palette.js'

export type PlayButton = {
  readonly layer: Layer
  readonly type: 'PlayButton'
  readonly uuid: UUID
}

export function PlayButton(): PlayButton {
  // to-do: streaming?
  return {layer: 'UI', type: 'PlayButton', uuid: crypto.randomUUID()}
}

export function playButtonUpdate(_btn: PlayButton, _state: GameState): void {}

export function playButtonDraw(
  _btn: Readonly<PlayButton>,
  state: Readonly<GameState>
): void {
  drawText(
    state.draw.c2d,
    'play',
    {x: Math.trunc(state.cam.w / 2), y: Math.trunc(state.cam.h / 2)},
    'Center',
    white
  )
}
