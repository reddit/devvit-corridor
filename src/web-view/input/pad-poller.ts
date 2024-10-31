export class PadPoller {
  bits: number = 0
  readonly #bitByAxis: {[axis: number]: [less: number, more: number]} = {}
  readonly #bitByButton: {[btn: number]: number} = {}

  mapAxis(axis: number, lessBit: number, moreBit: number): void {
    this.#bitByAxis[axis] = [lessBit, moreBit]
  }

  mapButton(button: number, bit: number): void {
    this.#bitByButton[button] = bit
  }

  poll(): void {
    if (!isSecureContext) return
    this.bits = 0
    for (const pad of navigator.getGamepads()) {
      for (const [index, axis] of pad?.axes.entries() ?? []) {
        const bits = this.#bitByAxis[index]
        if (bits == null) continue
        const bit = axis < 0 ? bits[0] : axis === 0 ? 0 : bits[1]
        this.bits |= Math.abs(axis) >= 0.5 ? bit : 0
      }
      for (const [index, button] of pad?.buttons.entries() ?? []) {
        const bit = this.#bitByButton[index]
        if (bit == null) continue
        this.bits |= button.pressed ? bit : 0
      }
    }
  }

  reset(): void {
    this.bits = 0
  }
}
