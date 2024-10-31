export type Layer = 'Cursor' | 'Default' | 'Level' | 'P1' | 'UI'

export const layerDrawOrder: readonly Layer[] = [
  'Level',
  'Default',
  'P1',
  'UI',
  'Cursor'
]
