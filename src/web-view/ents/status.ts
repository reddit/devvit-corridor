import type {UUID} from '../../shared/types/uuid.js'
import type {GameState} from '../types/game-state.js'
import type {Layer} from '../types/layer.js'
import {drawText} from '../utils/draw.js'
import {white80} from '../utils/palette.js'

export type Status = {
  readonly layer: Layer
  readonly type: 'Status'
  readonly uuid: UUID
}

export function Status(): Status {
  // to-do: streaming?
  return {layer: 'UI', type: 'Status', uuid: crypto.randomUUID()}
}

export function statusUpdate(_status: Status, _state: GameState): void {}

export function statusDraw(
  _status: Readonly<Status>,
  state: Readonly<GameState>
): void {
  if (state.connected) return
  drawText(
    state.draw.c2d,
    'offline',
    {x: state.cam.w, y: 0},
    'TopRight',
    white80
  )
}
