import type {XY} from '../../shared/2d.js'
import type {Cam} from '../cam.js'
import {KeyPoller} from './key-poller.js'
import {PointerPoller} from './pointer-poller.js'

export type Button = 'Click' | 'S' | 'I' | 'N' | 'G' | '!'

export class Input<T extends string> {
  /** user hint as to whether to consider pointer input or not. */
  handled: boolean = false
  /** the minimum duration in milliseconds for an input to be considered held. */
  minHeld: number = 300

  /** logical button to bit. */
  readonly #bitByButton = <{[button in T]: number}>{}

  /** the time in milliseconds since the input changed. */
  #duration: number = 0
  readonly #keyboard: KeyPoller = new KeyPoller()
  readonly #pointer: PointerPoller
  /** prior button samples. index 0 is current loop. */
  readonly #prevBits: [number, number] = [0, 0]
  #prevTick: number = 0

  constructor(cam: Readonly<Cam>, canvas: HTMLCanvasElement) {
    this.#pointer = new PointerPoller(cam, canvas)
  }

  // to-do: this isn't very synced with point() which is cleared on reset.
  get clientPoint(): Readonly<XY> {
    return this.#pointer.clientXY
  }

  /** true if any button is held on or off. */
  isHeld(): boolean {
    return this.#duration >= this.minHeld
  }

  isOffStart(...buttons: readonly T[]): boolean {
    return !this.isOn(...buttons) && this.isAnyStart(...buttons)
  }

  /**
   * test if all buttons are on. true if the buttons are pressed regardless of
   * whether other buttons are pressed. eg, `isOn('Up')` will return true when
   * up is pressed or when up and down are pressed.
   */
  isOn(...buttons: readonly T[]): boolean {
    const bits = this.#buttonsToBits(buttons)
    return (this.#bits & bits) === bits
  }

  isOnStart(...buttons: readonly T[]): boolean {
    return this.isOn(...buttons) && this.isAnyStart(...buttons)
  }

  /** true if any button triggered on or off. */
  isAnyStart(...buttons: readonly T[]): boolean {
    const bits = this.#buttonsToBits(buttons)
    return (this.#bits & bits) !== (this.#prevBits[1] & bits)
  }

  mapClick(button: T, ...clicks: readonly number[]): void {
    for (const click of clicks) this.#pointer.map(click, this.#map(button))
  }

  /** @arg keys union of case-sensitive KeyboardEvent.key. */
  mapKey(button: T, ...keys: readonly string[]): void {
    for (const key of keys) this.#keyboard.map(key, this.#map(button))
  }

  get point(): Readonly<XY> | undefined {
    return this.#pointer.xy
  }

  get pointType(): 'mouse' | 'touch' | 'pen' | undefined {
    return this.#pointer.type
  }

  poll(tick: number): void {
    this.handled = false
    this.#duration += this.#prevTick
    this.#prevTick = tick
    this.#prevBits[1] = this.#prevBits[0]
    this.#prevBits[0] = this.#bits

    if (this.#bits === 0 || this.#bits !== this.#prevBits[1]) {
      // expired or some button has changed but at least one button is pressed.
      this.#duration = 0
    }
  }

  register(op: 'add' | 'remove'): void {
    this.#keyboard.register(op)
    this.#pointer.register(op)
  }

  reset(): void {
    this.handled = false
    this.#keyboard.reset()
    this.#pointer.reset()
  }

  get #bits(): number {
    return this.#keyboard.bits | this.#pointer.bits
  }

  #buttonsToBits(buttons: readonly T[]): number {
    let bits = 0
    for (const button of buttons) bits |= this.#bitByButton[button] ?? 0
    return bits
  }

  #map(button: T): number {
    this.#bitByButton[button] ??= 1 << Object.keys(this.#bitByButton).length
    return this.#bitByButton[button]
  }
}
