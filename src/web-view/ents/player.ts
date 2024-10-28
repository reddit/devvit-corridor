import {type XY, magnitude, xyCloseTo, xyLerp, xySub} from '../../shared/2d.js'
import {clamp} from '../../shared/math.js'
import type {PeerMessage} from '../../shared/message.js'
import {
  type Instrument,
  type Melody,
  type PlayerSerial,
  type Tone,
  beatMillis,
  silence
} from '../../shared/serial.js'
import {anonSnoovatarURL, anonUsername, noT2} from '../../shared/tid.js'
import {type Assets, loadSnoovatar, snoovatarMaxWH} from '../assets.js'
import type {Button, Input} from '../input/input.js'
import {
  MelodyBuffer,
  melodyBufferFlip,
  melodyBufferPut,
  melodyMetronomeBuffer
} from '../types/melody-buffer.js'
import {type UTCMillis, utcMillisNow} from '../types/time.js'
import {quarterSpace} from '../utils/layout.js'
import {green} from '../utils/palette.js'
import type {Panel} from './panel.js'

// should this be PlayerSerial no omit
export type Player = Omit<PlayerSerial, 'melody'> & {
  snoovatarImg: HTMLImageElement
}

export type P1 = Player & {
  type: 'P1'
  melody: MelodyBuffer
  peered: {at: UTCMillis; melody: Melody; dir: XY; xy: XY}
}

export type Peer = Player & {
  type: 'Peer'
  played: UTCMillis
  melody: Melody
  peered: {
    at: UTCMillis
    melodyAt: UTCMillis
    melody: Melody
    xy: XY | undefined
  }
}

const pxPerSec: number = 35

export function P1(assets: Readonly<Assets>, lvlWH: Readonly<XY>): P1 {
  return {
    type: 'P1',
    dir: {x: 0, y: 0},
    flipX: false,
    peered: {
      at: 0 as UTCMillis,
      dir: {x: 0, y: 0},
      melody: silence,
      xy: {x: 0, y: 0}
    },
    instrument: randomInstrument(),
    melody: MelodyBuffer(),
    name: anonUsername,
    root: (-3 + Math.trunc(Math.random() * 8)) as Tone,
    snoovatarURL: anonSnoovatarURL,
    snoovatarImg: assets.images.anonSnoovatar,
    t2: noT2,
    uuid: crypto.randomUUID(),
    xy: {
      x: snoovatarMaxWH.x / 2 + Math.random() * (lvlWH.x - snoovatarMaxWH.x),
      y: snoovatarMaxWH.y / 2 + Math.random() * (lvlWH.y - snoovatarMaxWH.y / 2)
    }
  }
}

export async function Peer(
  assets: Readonly<Assets>,
  peer: Peer | undefined,
  msg: PeerMessage,
  time: UTCMillis
): Promise<Peer> {
  let snoovatarImg = peer?.snoovatarImg // try cache.
  if (!snoovatarImg)
    try {
      snoovatarImg = await loadSnoovatar(assets, msg.player)
    } catch {
      snoovatarImg = assets.images.anonSnoovatar
    }
  const now = utcMillisNow()
  return {
    played: (time - (time % beatMillis)) as UTCMillis,
    type: 'Peer',
    dir: msg.player.dir,
    peered: {
      at: now,
      melody: msg.player.melody,
      melodyAt: msg.player.melody === peer?.melody ? peer.peered.melodyAt : now,
      xy: {x: msg.player.xy.x, y: msg.player.xy.y}
    },
    flipX: msg.player.flipX,
    instrument: msg.player.instrument,
    // don't interrupt any active phrase.
    melody: peer?.melody ?? msg.player.melody,
    name: msg.player.name,
    root: msg.player.root,
    snoovatarURL: msg.player.snoovatarURL,
    snoovatarImg,
    t2: msg.player.t2,
    uuid: msg.player.uuid,
    xy: peer?.xy ?? msg.player.xy // use stale xy and lerp to it.
  }
}

export function updateP1(
  p1: P1,
  ctrl: Input<Button>,
  lvlWH: Readonly<XY>,
  tick: number,
  panel: Readonly<Panel>,
  time: UTCMillis
): void {
  const point =
    !ctrl.handled &&
    ctrl.point &&
    ctrl.isOn('Click') &&
    (ctrl.isOnStart('Click') || p1.dir.x || p1.dir.y)
  p1.dir = point ? xySub(ctrl.point, p1.xy) : {x: 0, y: 0}
  if (point) ctrl.handled = true
  const mag = magnitude(p1.dir) || 0
  if (mag < 4) {
    p1.dir.x = 0
    p1.dir.y = 0
  } else {
    p1.dir.x /= mag
    p1.dir.y /= mag
  }
  melodyBufferFlip(p1.melody, time)
  if (panel.tone != null) melodyBufferPut(p1.melody, panel.tone, time)
  updatePlayer(p1, lvlWH, tick)
}

export function updatePeer(
  peer: Peer,
  lvlWH: Readonly<XY>,
  tick: number,
  isNewMelodyStart: boolean
): void {
  if (isNewMelodyStart) peer.melody = peer.peered.melody
  if (peer.peered.xy) {
    // this needs to take time into account. the move player function actually does the trajectory stuff.
    peer.xy = xyLerp(peer.xy, peer.peered.xy, 0.1)

    if (xyCloseTo(peer.xy, peer.peered.xy, 1)) {
      peer.xy = peer.peered.xy
      peer.peered.xy = undefined
    }
  } else updatePlayer(peer, lvlWH, tick)
}

export function renderPlayer(
  ctx: CanvasRenderingContext2D,
  player: Readonly<Player & {melody: Melody | MelodyBuffer}>,
  assets: Readonly<Assets>,
  time: UTCMillis
): void {
  if (player.snoovatarImg.naturalWidth && player.snoovatarImg.naturalHeight) {
    const scale = snoovatarMaxWH.y / player.snoovatarImg.naturalHeight
    const scaledWH = {
      w: player.snoovatarImg.naturalWidth * scale,
      h: player.snoovatarImg.naturalHeight * scale
    }
    const flip = player.flipX ? -1 : 1
    ctx.save()
    ctx.scale(flip, 1)
    ctx.drawImage(
      player.snoovatarImg,
      (player.xy.x - scaledWH.w / 2) * flip,
      player.xy.y - scaledWH.h,
      scaledWH.w * flip,
      scaledWH.h
    )
    ctx.restore()
  } else {
    const radius = 8
    ctx.beginPath()
    ctx.arc(player.xy.x, player.xy.y - radius * 2, radius, 0, 2 * Math.PI)
    ctx.fillStyle = 'green'
    ctx.fill()
  }

  const melody =
    typeof player.melody === 'string'
      ? player.melody
      : melodyMetronomeBuffer(player.melody, time)
  if (melody !== silence) {
    const tone = {
      Bubbler: assets.images.tonePop,
      Clapper: assets.images.toneSnap,
      Jazzman: assets.images.toneBa,
      Rgggggg: assets.images.toneRg,
      Wailer: assets.images.toneWa
    }[player.instrument]
    ctx.save()
    const maxAngle = (10 * Math.PI) / 180
    const angle = maxAngle * Math.sin(time * 0.003)
    ctx.translate(player.xy.x, player.xy.y)
    ctx.rotate(angle)
    ctx.drawImage(
      tone,
      -tone.naturalWidth / 8,
      -snoovatarMaxWH.y - tone.naturalHeight / 4 - quarterSpace,
      tone.naturalWidth / 4,
      tone.naturalHeight / 4
    )
    ctx.restore()
  }

  ctx.fillStyle = 'black'
  ctx.font = '12px sans-serif'
  const text = player.name
  const dims = ctx.measureText(text)
  const textX = player.xy.x - dims.width / 2

  const top = player.xy.y + ctx.lineWidth + dims.actualBoundingBoxAscent
  const textY = top
  ctx.strokeStyle = green // just make sure there's contrast if drawing over someone
  ctx.lineWidth = 4
  ctx.strokeText(text, textX, textY)
  ctx.fillText(text, textX, textY)
}

function updatePlayer(player: Player, lvlWH: Readonly<XY>, tick: number): void {
  const secs = tick / 1_000
  const {dir} = player
  if (dir.x) {
    player.xy.x = clamp(
      player.xy.x + secs * pxPerSec * dir.x,
      snoovatarMaxWH.x / 2,
      lvlWH.x - snoovatarMaxWH.x / 2
    )
    player.flipX = dir.x < 0
  }
  if (dir.y)
    player.xy.y = clamp(
      player.xy.y + secs * pxPerSec * dir.y,
      snoovatarMaxWH.y / 2,
      lvlWH.y
    )
}

function randomInstrument(): Instrument {
  const set: {[instrument in Instrument]: null} = {
    Bubbler: null,
    Clapper: null,
    Jazzman: null,
    Rgggggg: null,
    Wailer: null
  }
  const arr = Object.keys(set) as Instrument[]
  return arr[Math.trunc(Math.random() * arr.length)]!
}
