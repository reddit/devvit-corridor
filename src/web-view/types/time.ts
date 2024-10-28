declare const utcMillis: unique symbol
export type UTCMillis = number & {[utcMillis]: never}

export function utcMillisNow(): UTCMillis {
  return Date.now() as UTCMillis
}
