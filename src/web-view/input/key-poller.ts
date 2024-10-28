export class KeyPoller {
  bits: number = 0
  readonly #bitByKey: {[key: string]: number} = {}

  /** @arg key case-sensitive KeyboardEvent.key. */
  map(key: string, bit: number): void {
    this.#bitByKey[key] = bit
  }

  register(op: 'add' | 'remove'): void {
    const fn = <const>`${op}EventListener`
    // keyup is lost if window loses focus.
    globalThis[fn]('blur', this.reset, {capture: true, passive: true})
    for (const type of ['keydown', 'keyup']) {
      const callback = <EventListenerOrEventListenerObject>this.#onKey
      globalThis[fn](type, callback, {capture: true, passive: true})
    }
  }

  reset = (): void => {
    this.bits = 0
  }

  #onKey = (ev: KeyboardEvent): void => {
    const on = ev.type === 'keydown'
    const bit = this.#bitByKey[ev.key]
    if (bit == null) return
    this.bits = on ? this.bits | bit : this.bits & ~bit
  }
}
