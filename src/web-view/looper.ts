import type {Input} from './input/input.js'
import type {Assets} from './types/assets.js'
import type {Cam} from './types/cam.js'

export type Draw = {checkerboard: CanvasPattern; c2d: C2D}

/** manages window lifecycle for input and rendering. */
export class Looper {
  /** the run lifetime in millis. */
  age: number = 0
  draw: Draw | undefined
  readonly assets: Readonly<Assets>
  readonly canvas: HTMLCanvasElement
  /** the exact duration in millis to apply on a given update step. */
  millis: number = 0
  /** the relative timestamp in millis. */
  time?: number | undefined

  readonly #cam: Cam
  readonly #ctrl: Input<string>
  #frame?: number | undefined // to-do: expose this in GameState.
  #loop?: (() => void) | undefined

  constructor(
    assets: Readonly<Assets>,
    canvas: HTMLCanvasElement,
    cam: Cam,
    ctrl: Input<string>
  ) {
    this.assets = assets
    this.canvas = canvas
    this.#cam = cam
    this.#ctrl = ctrl
    this.draw = this.#newDraw()
  }

  cancel(): void {
    if (this.#frame != null) cancelAnimationFrame(this.#frame)
    this.#frame = undefined
    this.millis = 0
    this.time = undefined
    this.#ctrl.reset()
    this.#loop = undefined
  }

  get frame(): number {
    // assume 60 FPS so games can scale to this number regardless of actual.
    return Math.trunc(this.age / (1000 / 60))
  }

  set loop(loop: (() => void) | undefined) {
    this.#loop = loop
    if (document.hidden || !this.draw) return
    if (this.#loop) this.#frame ??= requestAnimationFrame(this.#onFrame)
  }

  register(op: 'add' | 'remove'): void {
    const fn = <const>`${op}EventListener`
    for (const type of ['contextlost', 'contextrestored']) {
      this.canvas[fn](type, this.#onEvent, true)
    }
    globalThis[fn]('visibilitychange', this.#onEvent, true)
    if (op === 'add') this.draw = this.#newDraw()
    this.#ctrl.register(op)
  }

  #newDraw(): Draw | undefined {
    const c2d =
      this.canvas.getContext('2d', {alpha: false, willReadFrequently: false}) ??
      undefined
    if (!c2d) return
    const checkerboard = c2d.createPattern(this.assets.checkerboard, 'repeat')
    if (!checkerboard) return
    return {c2d, checkerboard}
  }

  #onEvent = (event: Event): void => {
    event.preventDefault()
    if (event.type === 'contextrestored') this.draw = this.#newDraw()

    if (this.draw && !document.hidden) {
      if (this.#loop) this.#frame ??= requestAnimationFrame(this.#onFrame)
    } else {
      // to-do: disconnect the socket when not in use.
      if (this.#frame != null) cancelAnimationFrame(this.#frame)
      this.#frame = undefined
      this.millis = 0
      this.time = undefined
      this.#ctrl.reset()
    }
  }

  #onFrame = (time: number): void => {
    this.#frame = undefined
    this.millis = time - (this.time ?? time)
    this.time = time
    this.age += this.millis
    const loop = this.#loop
    this.#loop = undefined

    this.#cam.resize()

    if (
      this.canvas.width !== this.#cam.w ||
      this.canvas.height !== this.#cam.h
    ) {
      this.canvas.width = this.#cam.w
      this.canvas.height = this.#cam.h
      this.canvas.focus() // hack: propagate key events.
    }

    // these pixels may be greater than, less than, or equal to cam. ratio
    // may change independent of canvas size.
    const clientW = (this.#cam.w * this.#cam.scale) / devicePixelRatio
    const clientH = (this.#cam.h * this.#cam.scale) / devicePixelRatio
    const dw = Number.parseFloat(this.canvas.style.width.slice(0, -2)) - clientW
    const dh =
      Number.parseFloat(this.canvas.style.height.slice(0, -2)) - clientH
    if (
      !Number.isFinite(dw) ||
      Math.abs(dw) > 0.1 ||
      !Number.isFinite(dh) ||
      Math.abs(dh) > 0.1
    ) {
      this.canvas.style.width = `${clientW}px`
      this.canvas.style.height = `${clientH}px`
    }

    this.#ctrl.poll(this.millis)
    loop?.()
  }
}
