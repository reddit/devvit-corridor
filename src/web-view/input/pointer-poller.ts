import type {XY} from '../../shared/types/2d.js'
import type {Cam} from '../types/cam.js'

export class PointerPoller {
  bits: number = 0
  readonly clientXY: XY = {x: 0, y: 0}
  type?: 'mouse' | 'touch' | 'pen' | undefined
  xy: Readonly<XY> = {x: 0, y: 0}
  readonly #bitByButton: {[btn: number]: number} = {}
  readonly #cam: Readonly<Cam>
  readonly #canvas: HTMLCanvasElement
  #on: number = 0

  constructor(cam: Readonly<Cam>, canvas: HTMLCanvasElement) {
    this.#cam = cam
    this.#canvas = canvas
  }

  map(button: number, bit: number): void {
    this.#bitByButton[button] = bit
  }

  get on(): boolean {
    return (this.#on & 3) !== 0
  }

  poll(): void {
    this.#on <<= 1
  }

  register(op: 'add' | 'remove'): void {
    const fn = <const>`${op}EventListener`
    this.#canvas[fn]('pointercancel', this.reset, {
      capture: true,
      passive: true
    })
    for (const type of ['pointerdown', 'pointermove', 'pointerup']) {
      this.#canvas[fn](
        type,
        <EventListenerOrEventListenerObject>this.#onPointEvent,
        {capture: true, passive: type !== 'pointerdown'}
      )
    }
    // suppress right-click.
    this.#canvas[fn]('contextmenu', this.#onContextMenuEvent, {capture: true})
  }

  reset = (): void => {
    this.bits = 0
    this.type = undefined
    this.#on = 0
  }

  #onContextMenuEvent = (ev: Event): void => ev.preventDefault()

  #onPointEvent = (ev: PointerEvent): void => {
    // ignore non-primary inputs to avoid flickering between distant points.
    if (!ev.isPrimary) return

    if (ev.type === 'pointerdown') this.#canvas.setPointerCapture(ev.pointerId)

    this.bits = this.#evButtonsToBits(ev.buttons)
    this.type = (<const>['mouse', 'touch', 'pen']).find(
      type => type === ev.pointerType
    )
    ;({clientX: this.clientXY.x, clientY: this.clientXY.y} = ev)
    this.xy = this.#cam.toLevelXY(this.clientXY)
    this.#on |= 1
    if (ev.type === 'pointerdown') ev.preventDefault() // not passive.
  }

  #evButtonsToBits(buttons: number): number {
    let bits = 0
    for (let button = 1; button <= buttons; button <<= 1) {
      if ((button & buttons) !== button) continue
      bits |= this.#bitByButton[button] ?? 0
    }
    return bits
  }
}
