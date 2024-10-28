import type {XY} from '../../shared/2d.js'
import type {Cam} from '../cam.js'

export class PointerPoller {
  bits: number = 0
  readonly clientXY: XY = {x: 0, y: 0}
  type?: 'mouse' | 'touch' | 'pen' | undefined
  xy?: Readonly<XY> | undefined
  readonly #bitByButton: {[btn: number]: number} = {}
  readonly #cam: Readonly<Cam>
  readonly #canvas: HTMLCanvasElement

  constructor(cam: Readonly<Cam>, canvas: HTMLCanvasElement) {
    this.#cam = cam
    this.#canvas = canvas
  }

  map(button: number, bit: number): void {
    this.#bitByButton[button] = bit
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
    this.xy = undefined
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
    this.xy = this.#cam.toLevelXY(this.clientXY)
    ;({clientX: this.clientXY.x, clientY: this.clientXY.y} = ev)

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
