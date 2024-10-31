import type {UUID} from '../../shared/types/uuid.js'
import type {GameState} from '../types/game-state.js'
import type {Layer} from '../types/layer.js'

export type Cursor = {
  hidden: boolean
  readonly layer: Layer
  readonly type: 'Cursor'
  readonly uuid: UUID
}

export function Cursor(): Cursor {
  return {
    hidden: true,
    layer: 'Cursor',
    type: 'Cursor',
    // to-do: streaming?
    uuid: crypto.randomUUID()
  }
}

export function cursorUpdate(cursor: Cursor, state: GameState): void {
  if (state.ctrl.pointOn && state.ctrl.pointType === 'mouse')
    cursor.hidden = false
  else if (state.ctrl.isAnyOn('L', 'R', 'U', 'D')) cursor.hidden = true
}

export function cursorDraw(
  cursor: Readonly<Cursor>,
  state: Readonly<GameState>
): void {
  if (cursor.hidden) return
  const pt = state.cam.toLevelXY(state.ctrl.clientPoint)
  state.draw.c2d.drawImage(
    state.assets.cursor,
    pt.x - state.cam.x,
    pt.y - state.cam.y,
    state.assets.cursor.naturalWidth,
    state.assets.cursor.naturalHeight
  )
}
