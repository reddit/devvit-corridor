import type {Box, XY} from '../shared/2d.js'

export class Cam implements Box {
  h: number = innerHeight
  w: number = innerWidth
  x: number = 0
  y: number = 0

  resize(): void {
    // WH of body in CSS px; document.body.getBoundingClientRect() returns
    // incorrectly large sizing on mobile that includes the address bar.
    this.w = innerWidth
    this.h = innerHeight
  }

  /** returns position in level coordinates. */
  toLevelXY(clientXY: Readonly<XY>): XY {
    return {x: this.x + clientXY.x, y: this.y + clientXY.y}
  }
}
