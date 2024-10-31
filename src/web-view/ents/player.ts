import {
  type WH,
  type XY,
  xyAdd,
  xyCloseTo,
  xyMagnitude,
  xySub,
  xyTrunc
} from '../../shared/types/2d.js'
import {type PeerMessage, disconnectMillis} from '../../shared/types/message.js'
import type {PlayerSerial} from '../../shared/types/serial.js'
import {anonSnoovatarURL, anonUsername, noT2} from '../../shared/types/tid.js'
import type {UUID} from '../../shared/types/uuid.js'
import {lerp} from '../../shared/utils/math.js'
import {gridAt} from '../grid.js'
import type {GameState} from '../types/game-state.js'
import type {Layer} from '../types/layer.js'
import {type UTCMillis, utcMillisNow} from '../types/time.js'
import {
  drawCircle,
  drawCircleOutlineStuff,
  drawOtherTriangle,
  drawText
} from '../utils/draw.js'
import {
  fontLineHeightPx,
  peerLerpRatio,
  playerDefaultHP,
  playerFirePeriodMillis,
  playerHurtboxSizePx,
  playerMaxHP,
  playerSpeedPxMillis
} from '../utils/metrics.js'
import {white, white50, white80} from '../utils/palette.js'
import {Bullet} from './bullet.js'
import type {Item} from './item.js'

export type P1 = PlayerSerial & {
  readonly type: 'P1'
  fired: number
  peered: {at: UTCMillis; dir: XY; xy: XY}
  items: {[uuid: UUID]: Item}
  readonly layer: Layer
}

export type Peer = PlayerSerial & {
  readonly type: 'Peer'
  readonly layer: Layer
  peered: {at: UTCMillis; xy: XY | undefined}
}

export type Player = P1 | Peer

export function P1(lvlWH: Readonly<WH>): P1 {
  return {
    client: '',
    dir: {x: 0, y: 0},
    hp: playerDefaultHP,
    peered: {at: 0 as UTCMillis, dir: {x: 0, y: 0}, xy: {x: 0, y: 0}},
    items: {},
    fired: 0,
    layer: 'P1',
    name: anonUsername,
    score: 0,
    snoovatarURL: anonSnoovatarURL,
    t2: noT2,
    type: 'P1',
    uuid: crypto.randomUUID(),
    // to-do: streaming? pass in rnd.
    x: 100, //Math.random() * lvlWH.w,
    y: 100, //Math.random() * lvlWH.h
    // hack: this is also used for viewport test but p1 should always be center.
    w: playerHurtboxSizePx,
    h: playerHurtboxSizePx
  }
}

export function Peer(peer: Peer | undefined, msg: PeerMessage): Peer {
  return {
    client: msg.player.client,
    dir: msg.player.dir,
    hp: msg.player.hp,
    layer: 'Default',
    peered: {at: utcMillisNow(), xy: {x: msg.player.x, y: msg.player.y}},
    name: msg.player.name,
    score: msg.player.score,
    snoovatarURL: msg.player.snoovatarURL,
    t2: msg.player.t2,
    type: 'Peer',
    uuid: msg.player.uuid,
    x: peer?.x ?? msg.player.x, // use stale xy and lerp to it.
    y: peer?.y ?? msg.player.y,
    w: playerHurtboxSizePx,
    h: playerHurtboxSizePx
  }
}

export function p1Update(p1: P1, state: GameState): void {
  const {cam, ctrl} = state
  const point = !ctrl.handled && ctrl.isOn('A') // to-do: I think I need Click to be distinct
  if (point) {
    ctrl.handled = true
    const pt = cam.toLevelXY(ctrl.clientPoint)
    p1.dir = xySub(pt, p1)
  } else if (ctrl.isAnyOn('L', 'R', 'U', 'D')) {
    const x = ctrl.isOn('L', 'R')
      ? 0
      : ctrl.isOn('L')
        ? -1
        : ctrl.isOn('R')
          ? 1
          : 0
    const y = ctrl.isOn('U', 'D')
      ? 0
      : ctrl.isOn('U')
        ? -1
        : ctrl.isOn('D')
          ? 1
          : 0
    p1.dir = {x, y}
  } else p1.dir = {x: 0, y: 0}
  const mag = xyMagnitude(p1.dir) || 0
  if (mag < 1) {
    p1.dir.x = p1.dir.y = 0 // stop. destination reached.
    p1.x = Math.round(p1.x) // snap to pixel for clear text rendering.
    p1.y = Math.round(p1.y)
  } else {
    p1.dir.x /= mag
    p1.dir.y /= mag
  }
  if (state.time - p1.fired > playerFirePeriodMillis) {
    for (let i = 0; i < 4; i++) {
      const bulletDir = {x: 1 - 2 * (i & 1), y: 1 - 2 * (i >> 1)}
      state.zoo.replace(state.cam, Bullet(bulletDir, state.time, p1))
    }
    p1.fired = state.time
  }
  for (const item of Object.values(p1.items)) {
    if (state.time - item.picked > item.duration) delete p1.items[item.uuid]
    switch (item.subtype) {
      case 'Invincible':
        break
      default:
        item.subtype satisfies never
        break
    }
  }
  playerUpdate(p1, state)
}

export function p1IsInvincible(p1: Readonly<P1>): Item | undefined {
  return Object.values(p1.items)
    .filter(item => item.subtype === 'Invincible')
    .sort((lhs, rhs) => rhs.picked - lhs.picked)[0]
}

export function peerUpdate(peer: Peer, state: GameState): void {
  if (state.time - peer.peered.at > disconnectMillis) {
    state.zoo.remove(peer)
    return
  }

  if (peer.peered.xy) {
    // this needs to take time into account. the move player function actually does the trajectory stuff.
    peer.x = lerp(peer.x, peer.peered.xy.x, peerLerpRatio)
    peer.y = lerp(peer.y, peer.peered.xy.y, peerLerpRatio)

    if (xyCloseTo(peer, peer.peered.xy, 1)) {
      peer.x = peer.peered.xy.x
      peer.y = peer.peered.xy.y
      peer.peered.xy = undefined
    }
  } else playerUpdate(peer, state)
}

export function p1Draw(p1: Readonly<P1>, state: Readonly<GameState>): void {
  playerDraw(p1, state, p1IsInvincible(p1))
}

export function peerDraw(
  peer: Readonly<Peer>,
  state: Readonly<GameState>
): void {
  playerDraw(peer, state, undefined) // to-do: peer can be invincible?
}

// to-do: make camera fixed?
function playerDraw(
  player: Readonly<Player>,
  state: Readonly<GameState>,
  invincible: Item | undefined
): void {
  const {c2d} = state.draw
  const radius = 8

  drawCircleOutlineStuff(c2d, player, radius, invincible ? white : white50)

  for (let i = 0; i < 3; i++) {
    const opacity = Math.max(0.5, Math.min(1, player.hp / playerMaxHP))
    drawCircle(
      c2d,
      {
        x:
          player.x +
          4 * Math.sin((i + 1) * state.time * 0.002 * (invincible ? 2 : 1)),
        y:
          player.y +
          4 * Math.cos((i + 1) * state.time * 0.001 * (invincible ? 2 : 1))
      },
      radius,
      `rgba(255, 255, 255, ${opacity})`
    )
  }
  // drawCircle(ctx, player.xy, 4, '#f008')
  if (invincible) {
    const opacity = Math.min(
      1,
      1.5 - Math.min(1, (state.time - invincible.picked) / invincible.duration)
    )
    c2d.save()
    c2d.translate(player.x, player.y)
    const angle = -((state.time % 2_000) / 2_000) * Math.PI * 2
    c2d.rotate(angle)
    c2d.translate(-player.x, -player.y)
    drawOtherTriangle(c2d, player, `rgba(255, 255, 255, ${opacity})`)
    c2d.restore()
  }

  // to-do: there needs to be a grace period for invincible to vincible.
}

function playerUpdate(player: Player, state: GameState): void {
  const offset = {x: player.w, y: player.h}
  const {dir} = player
  const invincible = player.type === 'P1' && p1IsInvincible(player)
  // to-do: account for overshoot
  if (dir.x) {
    const {x} = player
    player.x =
      player.x +
      state.millis * playerSpeedPxMillis * dir.x * (invincible ? 1.25 : 1)
    if (gridAt(xyTrunc(xyAdd(player, offset))) === '█') player.x = x
  }
  if (dir.y) {
    const {y} = player
    player.y =
      player.y +
      state.millis * playerSpeedPxMillis * dir.y * (invincible ? 1.25 : 1)
    if (gridAt(xyTrunc(xyAdd(player, offset))) === '█') player.y = y
  }
}
