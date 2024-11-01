import {memProp5x6} from 'mem-font'

export const spacePx: number = 16
export const halfSpacePx: number = spacePx / 2
export const quarterSpacePx: number = spacePx / 4
export const eighthSpacePx: number = spacePx / 8

export const fontLineHeightPx: number =
  (memProp5x6.cellHeight + memProp5x6.leading) * 2 // draw at 12px.

export const tileSizePx: number = 8
export const bulletSpeedPxMillis: number = 0.08
export const bulletSizePx: number = tileSizePx / 2
export const bulletTTLMillis: number = 2_000
export const itemSizePx: number = tileSizePx
export const leechSpeedPxMillis: number = 0.003
export const leechSizePx: number = tileSizePx
export const leechRangePx: number = 16 * tileSizePx
export const playerHurtboxSizePx: number = tileSizePx
export const playerSpeedPxMillis: number = 0.05
export const playerFirePeriodMillis: number = 1_500
export const playerMaxHP: number = 5
export const playerDefaultHP: number = playerMaxHP

export const peerLerpRatio: number = 0.1
