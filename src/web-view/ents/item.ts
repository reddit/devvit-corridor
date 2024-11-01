import {type Box, type XY, boxHits} from '../../shared/types/2d.js'
import type {UTCMillis} from '../../shared/types/time.js'
import type {UUID} from '../../shared/types/uuid.js'
import {isVisible} from '../grid.js'
import type {GameState} from '../types/game-state.js'
import type {Layer} from '../types/layer.js'
import {drawTriangle} from '../utils/draw.js'
import {itemSizePx} from '../utils/metrics.js'
import {white90} from '../utils/palette.js'

export type Item = Box & {
  duration: number
  readonly layer: Layer
  picked: UTCMillis
  readonly uuid: UUID
  readonly subtype: 'Invincible'
  readonly type: 'Item'
}

export function Item(xy: Readonly<XY>): Item {
  return {
    duration: 10_000,
    layer: 'Default',
    picked: 0 as UTCMillis,
    subtype: 'Invincible',
    type: 'Item',
    uuid: crypto.randomUUID(), // to-do: streaming?
    x: xy.x,
    y: xy.y,
    w: itemSizePx,
    h: itemSizePx
  }
}

export function itemUpdate(item: Item, state: GameState): void {
  if (isVisible(item) && boxHits(state.p1, item)) {
    state.zoo.remove(item)
    item.picked = state.time
    state.p1.items[item.uuid] = item
  }
}

export function itemDraw(
  item: Readonly<Item>,
  state: Readonly<GameState>
): void {
  if (!isVisible(item)) return
  state.draw.c2d.save()
  state.draw.c2d.translate(item.x, item.y)
  const angle = -((state.drawTime % 5_000) / 5_000) * Math.PI * 2
  state.draw.c2d.rotate(angle)
  state.draw.c2d.translate(-item.x, -item.y)
  drawTriangle(state.draw.c2d, item, white90)
  state.draw.c2d.restore()
}
