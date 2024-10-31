import type {UUID} from '../../shared/types/uuid.js'
import type {GameState} from '../types/game-state.js'
import type {Layer} from '../types/layer.js'
import {drawText} from '../utils/draw.js'
import {quarterSpacePx} from '../utils/metrics.js'
import {white90} from '../utils/palette.js'

export type Outdated = {
  readonly layer: Layer
  readonly type: 'Outdated'
  readonly uuid: UUID
}

export function Outdated(): Outdated {
  // to-do: streaming?
  return {layer: 'UI', type: 'Outdated', uuid: crypto.randomUUID()}
}

export function outdatedUpdate(_outdated: Outdated, _state: GameState): void {}

export function outdatedDraw(
  _outdated: Readonly<Outdated>,
  state: Readonly<GameState>
): void {
  if (!state.outdated) return
  drawText(
    state.draw.c2d,
    'please reload',
    {x: quarterSpacePx, y: quarterSpacePx},
    'TopLeft',
    white90
  )
}
