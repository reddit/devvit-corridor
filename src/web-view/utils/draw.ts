import type {XY} from '../../shared/types/2d.js'

declare global {
  type C2D = CanvasRenderingContext2D
}

/** draw circle centered at xy. */
export function drawCircle(
  c2d: C2D,
  xy: Readonly<XY>,
  radius: number,
  fill: string
): void {
  c2d.beginPath()
  c2d.arc(xy.x, xy.y, radius, 0, 2 * Math.PI)
  c2d.closePath()
  if (fill) {
    c2d.fillStyle = fill
    c2d.fill()
  }
}

export function drawCircleOutlineStuff(
  c2d: C2D,
  xy: Readonly<XY>,
  radius: number,
  stroke: string
): void {
  c2d.beginPath()
  c2d.arc(xy.x, xy.y, radius, 0, 2 * Math.PI)
  c2d.closePath()
  if (stroke) {
    c2d.lineWidth = 1
    c2d.strokeStyle = stroke
    c2d.stroke()
  }
}

export function drawText(
  c2d: C2D,
  text: string,
  xy: Readonly<XY>,
  justify:
    | 'Center'
    | 'BottomLeft'
    | 'BottomRight'
    | 'TopLeft'
    | 'TopRight'
    | 'TopCenter', // to-do: rethink terminology.
  stroke: string
): void {
  c2d.fillStyle = '#000'
  c2d.font = '12px mem'
  c2d.strokeStyle = stroke
  c2d.lineWidth = 4
  const metrics = c2d.measureText(text)
  let x = xy.x
  let y = xy.y
  switch (justify) {
    case 'BottomLeft':
      x += c2d.lineWidth
      y -= c2d.lineWidth
      break
    case 'BottomRight':
      x -= metrics.width + c2d.lineWidth
      y -= c2d.lineWidth
      break
    case 'Center':
      x -= Math.trunc(metrics.width / 2)
      y -= Math.trunc(
        (metrics.actualBoundingBoxAscent +
          metrics.actualBoundingBoxDescent +
          c2d.lineWidth * 2) /
          2
      )
      break
    case 'TopLeft':
      y +=
        metrics.actualBoundingBoxAscent +
        metrics.actualBoundingBoxDescent +
        c2d.lineWidth
      break
    case 'TopCenter':
      x -= Math.trunc((metrics.width + c2d.lineWidth) / 2)
      y +=
        metrics.actualBoundingBoxAscent +
        metrics.actualBoundingBoxDescent +
        c2d.lineWidth
      break
    case 'TopRight':
      x -= metrics.width + c2d.lineWidth
      y +=
        metrics.actualBoundingBoxAscent +
        metrics.actualBoundingBoxDescent +
        c2d.lineWidth
      break
    default:
      justify satisfies never
  }
  c2d.strokeText(text, x, y)
  c2d.fillText(text, x, y)
}

export function drawTriangle(c2d: C2D, xy: Readonly<XY>, fill: string): void {
  const size = 4

  const top = {x: xy.x, y: xy.y - size}
  const left = {
    x: xy.x - size * Math.cos(Math.PI / 6),
    y: xy.y + size * Math.sin(Math.PI / 6)
  }
  const right = {
    x: xy.x + size * Math.cos(Math.PI / 6),
    y: xy.y + size * Math.sin(Math.PI / 6)
  }

  c2d.beginPath()
  c2d.moveTo(top.x, top.y)
  c2d.lineTo(left.x, left.y)
  c2d.lineTo(right.x, right.y)
  c2d.closePath()

  if (fill) {
    c2d.fillStyle = fill
    c2d.fill()
  }
}

export function drawOtherTriangle(
  c2d: C2D,
  xy: Readonly<XY>,
  stroke: string
): void {
  const size = 12

  const top = {x: xy.x, y: xy.y - size}
  const left = {
    x: xy.x - size * Math.cos(Math.PI / 6),
    y: xy.y + size * Math.sin(Math.PI / 6)
  }
  const right = {
    x: xy.x + size * Math.cos(Math.PI / 6),
    y: xy.y + size * Math.sin(Math.PI / 6)
  }

  c2d.beginPath()
  c2d.moveTo(top.x, top.y)
  c2d.lineTo(left.x, left.y)
  c2d.lineTo(right.x, right.y)
  c2d.closePath()

  c2d.lineWidth = 2

  if (stroke) {
    c2d.strokeStyle = stroke
    c2d.stroke()
  }
}
