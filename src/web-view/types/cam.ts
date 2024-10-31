import {type WH, type XY, boxHits} from '../../shared/types/2d.js'

export class Cam {
  minWH: WH = {w: 256, h: 256} // ints.
  minScale: number = 1 // int.

  readonly #clientWH: WH = {w: 1, h: 1} // fraction.
  #h: number = this.minWH.h // int.
  #scale: number = 1 // int.
  #w: number = this.minWH.w // int.
  x: number = 0 // fraction.
  y: number = 0 // fraction.

  /** integral height. */
  get h(): number {
    return this.#h
  }

  isVisible(xywh: Readonly<XY & Partial<WH>>): boolean {
    return boxHits(this, xywh)
  }

  /** fill or just barely not fill the viewport in scaled pixels. */
  resize(zoomOut?: number): void {
    // WH of body in CSS px; document.body.getBoundingClientRect() returns
    // incorrectly large sizing on mobile that includes the address bar.
    this.#clientWH.w = innerWidth
    this.#clientWH.h = innerHeight

    const nativeW = Math.round(this.#clientWH.w * devicePixelRatio) // physical.
    const nativeH = Math.round(this.#clientWH.h * devicePixelRatio)

    this.#scale = Math.max(
      this.minScale,
      Math.floor(Math.min(nativeW / this.minWH.w, nativeH / this.minWH.h)) -
        (zoomOut ?? 0) // default is to zoom in as much as possible.
    )
    this.#w = Math.floor(nativeW / this.#scale)
    this.#h = Math.floor(nativeH / this.#scale)
  }

  /** integral scale. */
  get scale(): number {
    return this.#scale
  }

  /** returns position in fractional level coordinates. */
  toLevelXY(clientXY: Readonly<XY>): XY {
    return {
      x: this.x + (clientXY.x / this.#clientWH.w) * this.#w,
      y: this.y + (clientXY.y / this.#clientWH.h) * this.#h
    }
  }

  /** integral width. */
  get w(): number {
    return this.#w
  }
}
