import {xyAngleBetween, xyMagnitude, xySub} from '../shared/types/2d.js'
import {
  heartbeatPeriodMillis,
  insignificantDirRadians,
  insignificantMovePx,
  peerSchemaVersion,
  peerThrottleMillis
} from '../shared/types/message.js'
import {anonUsername, noT2} from '../shared/types/tid.js'
import {type UTCMillis, utcMillisNow} from '../shared/types/time.js'
import {CorridorLevel} from './ents/levels/corridor-level.js'
import {P1} from './ents/player.js'
import {Zoo} from './ents/zoo.js'
import {lvlWH} from './grid.js'
import {Input} from './input/input.js'
import {type Draw, Looper} from './looper.js'
import {Assets} from './types/assets.js'
import {Audio} from './types/audio.js'
import {Cam} from './types/cam.js'
import type {GameState} from './types/game-state.js'
import {MessageProc, postMessage} from './types/message-proc.js'
import {Throttle} from './utils/throttle.js'

// to-do: distance audio.
// const lvlMag: number = xyMagnitude({x: lvlWH.w, y: lvlWH.h})

export class Game {
  static async new(): Promise<Game> {
    console.log(`corridor v0.0.${peerSchemaVersion}`)
    // don't bother running if the base assets cannot load.
    const assets = await Assets()
    const audio = await Audio(assets)
    return new Game(assets, audio)
  }

  #looper: Looper
  #msgProc: MessageProc
  #state: Omit<GameState, 'draw'> & {draw: Draw | undefined}

  private constructor(assets: Assets, audio: Audio) {
    const canvas = Canvas()

    const cam = new Cam()
    cam.minWH = {w: 288, h: 320}

    // to-do: fix joypad.
    const ctrl = new Input(cam, canvas)
    ctrl.mapDefault()

    const p1 = P1() // to-do: move lvlWH to state subprop.

    const zoo = new Zoo()

    this.#state = {
      assets,
      audio,
      author: {score: null, username: anonUsername, t2: noT2},
      cam,
      canvas,
      completed: false,
      connected: false,
      ctrl,
      debug: false,
      draw: undefined,
      init: false,
      lvlWH,
      millis: 0,
      paused: false,
      drawTime: 0 as UTCMillis,
      peers: {},
      time: 0 as UTCMillis,
      msgID: -1, // initialized to 0 in app.
      outdated: false,
      p1,
      zoo
    }

    zoo.replace(cam, CorridorLevel(this.#state as GameState))

    this.#msgProc = new MessageProc(this.#state as GameState)
    this.#looper = new Looper(assets, canvas, cam, ctrl)

    initDoc(assets, canvas)
  }

  start(): void {
    this.#msgProc.register('add')
    this.#looper.register('add')
    this.#looper.loop = this.#onLoop
  }

  #onLoop = (): void => {
    // to-do: this isn't right because I can cruise around town for a long time
    // with A down.
    if (
      this.#state.ctrl.isAnyOn('A', 'B', 'C', 'D', 'L', 'R', 'S', 'U') &&
      this.#state.audio.ctx.state !== 'running' &&
      !(this.#looper.frame % 60)
    )
      void this.#state.audio.ctx.resume() // don't await; this can hang.

    this.#state.time = utcMillisNow()
    this.#state.drawTime = this.#state.paused
      ? this.#state.drawTime
      : this.#state.time
    this.#state.millis = this.#looper.millis
    this.#state.draw = this.#looper.draw
    if (!this.#state.draw) return

    const {cam, canvas, p1, time, zoo} = this.#state

    // don't truncate xy to avoid sawtooth movement.
    cam.x = p1.x - Math.trunc(canvas.width / 2)
    cam.y = p1.y - Math.trunc(canvas.height / 2)

    // to-do: I think we only need to update p1 first and then we can update + draw everything in one loop.
    zoo.update(this.#state as GameState)

    const angle = xyAngleBetween(p1.dir, p1.peered.dir)
    const mag = xyMagnitude(xySub(p1, p1.peered.xy))
    if (angle > insignificantDirRadians || mag > insignificantMovePx)
      this.#postPeerUpdate.schedule(time)

    zoo.draw(this.#state as GameState)

    // play(
    //   this.#audio.ctx,
    //   this.#audio.instruments[player.instrument],
    //   player.root + tone,
    //   1 -
    //     Math.log10(magnitude(xySub(this.#state.p1.xy, player.xy)) + 1) /
    //       Math.log10(lvlMag + 1)
    // )

    const now = utcMillisNow()
    if (now - this.#state.p1.peered.at > heartbeatPeriodMillis)
      this.#postPeerUpdate.schedule(now)

    this.#looper.loop = this.#onLoop
  }

  // to-do: move to message processor.
  #postPeerUpdate = new Throttle((now: UTCMillis): void => {
    if (this.#state.debug) console.log('post peer update')
    const {p1} = this.#state
    p1.peered = {
      at: now,
      dir: {x: p1.dir.x, y: p1.dir.y},
      xy: {x: p1.x, y: p1.y}
    }
    postMessage({
      id: this.#state.msgID,
      msg: {
        peer: true,
        player: {
          client: p1.client,
          dir: p1.dir,
          hp: p1.hp,
          name: p1.name,
          score: p1.score,
          snoovatarURL: p1.snoovatarURL,
          t2: p1.t2,
          uuid: p1.uuid,
          x: p1.x,
          y: p1.y,
          w: p1.w,
          h: p1.h
        },
        type: 'PeerUpdate',
        version: peerSchemaVersion
      },
      type: 'Peer'
    })
  }, peerThrottleMillis)
}

function Canvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 0 // guarantee resize().

  canvas.style.cursor = 'none'
  canvas.style.display = 'block' // no line height spacing.

  canvas.style.imageRendering = 'pixelated'

  canvas.tabIndex = 0 // hack: propagate key events.
  canvas.style.outline = 'none' // and disable focus outline.

  // update on each pointermove *touch* Event like *mouse* Events.
  canvas.style.touchAction = 'none'
  return canvas
}

function initDoc(assets: Assets, canvas: HTMLCanvasElement): void {
  document.fonts.add(assets.font)

  const meta = document.createElement('meta')
  meta.name = 'viewport'
  // don't wait for double-tap scaling on mobile.
  meta.content = 'maximum-scale=1, minimum-scale=1, user-scalable=no'
  document.head.appendChild(meta)

  document.body.style.margin = '0'
  document.body.style.width = '100vw'
  document.body.style.height = '100vh'
  document.body.style.overflow = 'hidden'

  document.body.append(canvas)
}
