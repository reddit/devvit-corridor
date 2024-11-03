import {type Box, boxHits, xySub} from '../../shared/types/2d.js'
import type {UUID} from '../../shared/types/uuid.js'
import {drawText} from '../types/draw.js'
import type {GameState} from '../types/game-state.js'
import type {Layer} from '../types/layer.js'
import {postMessage} from '../types/message-proc.js'
import {white, white80} from '../utils/palette.js'

export type PlayNewButton = Box & {
  readonly layer: Layer
  readonly type: 'PlayNewButton'
  readonly uuid: UUID
  pressed: boolean
  hit: boolean
} // hack: box sizing is staggered by layout

export function PlayNewButton(): PlayNewButton {
  // to-do: streaming?
  return {
    hit: false,
    layer: 'UI',
    pressed: false,
    type: 'PlayNewButton',
    uuid: crypto.randomUUID(),
    x: 0,
    y: 0,
    w: 0,
    h: 0
  }
}

export function playNewButtonUpdate(
  btn: PlayNewButton,
  state: GameState
): void {
  const newGame =
    state.p1.t2 !== state.author.t2 || state.p1.hp <= 0 || state.completed

  // to-do: when I need client vs non-client components is a little surprising.
  // there is some translation happening / not happening here that I am not
  // understanding.
  btn.hit = boxHits(btn, xySub(state.ctrl.point, state.cam))
  if (
    !btn.pressed &&
    newGame &&
    ((state.ctrl.isOnStart('A') && btn.hit) || state.ctrl.isOnStart('S'))
  ) {
    btn.pressed = true
    postMessage({id: state.msgID, type: 'NewGame'})
  }
}

export function playNewButtonDraw(
  btn: PlayNewButton,
  state: Readonly<GameState>
): void {
  const newGame =
    state.p1.t2 !== state.author.t2 || state.p1.hp <= 0 || state.completed
  const center = {
    x: Math.trunc(state.cam.w / 2),
    y: Math.trunc(state.cam.h / 2)
  }

  const box = drawText(
    state.draw.c2d,
    newGame ? 'make corridor' : 'play',
    center,
    'Center',
    btn.hit ? white : white80
  )
  btn.x = box.x
  btn.y = box.y
  btn.w = box.w
  btn.h = box.h
}
