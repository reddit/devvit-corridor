import type {UUID} from '../../shared/types/uuid.js'
import {drawText} from '../types/draw.js'
import type {GameState} from '../types/game-state.js'
import type {Layer} from '../types/layer.js'
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
  if (state.connected || state.completed || state.author.t2 !== state.p1.t2)
    return
  drawText(
    state.draw.c2d,
    'offline',
    {x: state.cam.w, y: 0},
    'TopRight',
    white80
  )
}
