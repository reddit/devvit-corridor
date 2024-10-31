import type {XY} from '../../shared/types/2d.js'
import type {Cam} from '../types/cam.js'
import {KeyPoller} from './key-poller.js'
import {PadPoller} from './pad-poller.js'
import {PointerPoller} from './pointer-poller.js'

// biome-ignore format:
export type DefaultButton =
  'L' | 'R' | 'U' | 'D' | // dpad.
  'A' | 'B' | 'C' | // primary, secondary, tertiary.
  'S' // start.

export class Input<T extends string> {
  /** user hint as to whether to consider pointer input or not. */
  handled: boolean = false
  /** the minimum duration in milliseconds for an input to be considered held. */
  minHeld: number = 300

  /** logical button to bit. */
  readonly #bitByButton = <{[button in T]: number}>{}

  /** the time in milliseconds since the input changed. */
  #duration: number = 0
  readonly #gamepad: PadPoller = new PadPoller()
  readonly #keyboard: KeyPoller = new KeyPoller()
  readonly #pointer: PointerPoller
  /** prior button samples. index 0 is current loop. */
  readonly #prevBits: [number, number] = [0, 0]
  #prevTick: number = 0

  constructor(cam: Readonly<Cam>, canvas: HTMLCanvasElement) {
    this.#pointer = new PointerPoller(cam, canvas)
  }

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

  /** true if any button is on. */
  isAnyOn(...buttons: readonly T[]): boolean {
    return (this.#bits & this.#buttonsToBits(buttons)) !== 0
  }

  /** true if any button triggered on or off. */
  isAnyStart(...buttons: readonly T[]): boolean {
    const bits = this.#buttonsToBits(buttons)
    return (this.#bits & bits) !== (this.#prevBits[1] & bits)
  }

  mapAxis(less: T, more: T, ...axes: readonly number[]): void {
    for (const axis of axes) {
      this.#gamepad.mapAxis(axis, this.#map(less), this.#map(more))
    }
  }

  mapButton(button: T, ...indices: readonly number[]): void {
    for (const index of indices) {
      this.#gamepad.mapButton(index, this.#map(button))
    }
  }

  mapClick(button: T, ...clicks: readonly number[]): void {
    for (const click of clicks) this.#pointer.map(click, this.#map(button))
  }

  mapDefault(): void {
    this.mapKey(<T>'L', 'ArrowLeft', 'a', 'A')
    this.mapKey(<T>'R', 'ArrowRight', 'd', 'D')
    this.mapKey(<T>'U', 'ArrowUp', 'w', 'W')
    this.mapKey(<T>'D', 'ArrowDown', 's', 'S')
    this.mapKey(<T>'A', 'c', 'C', ' ')
    this.mapKey(<T>'B', 'x', 'X')
    this.mapKey(<T>'C', 'z', 'Z')
    this.mapKey(<T>'S', 'Enter', 'Escape')

    // https://w3c.github.io/gamepad/#remapping
    this.mapAxis(<T>'L', <T>'R', 0, 2)
    this.mapAxis(<T>'U', <T>'D', 1, 3)
    this.mapButton(<T>'L', 14)
    this.mapButton(<T>'R', 15)
    this.mapButton(<T>'U', 12)
    this.mapButton(<T>'D', 13)
    this.mapButton(<T>'A', 0)
    this.mapButton(<T>'S', 9)

    this.mapClick(<T>'A', 1)
  }

  /** @arg keys union of case-sensitive KeyboardEvent.key. */
  mapKey(button: T, ...keys: readonly string[]): void {
    for (const key of keys) this.#keyboard.map(key, this.#map(button))
  }

  get point(): Readonly<XY> {
    return this.#pointer.xy
  }

  // to-do: make this name fit better. seems like on start as well.
  get pointOn(): boolean {
    return this.#pointer.on
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

    this.#gamepad.poll()
    this.#pointer.poll()
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
    this.#gamepad.reset()
    this.#keyboard.reset()
    this.#pointer.reset()
  }

  get #bits(): number {
    return this.#gamepad.bits | this.#keyboard.bits | this.#pointer.bits
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
