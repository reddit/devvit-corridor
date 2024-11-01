/** Reddit user ID. */
export type T2 = `t2_${string}`
/** Reddit post ID. */
export type T3 = `t3_${string}`
/** Subreddit ID. */
export type T5 = `t5_${string}`

export const noT2: T2 = 't2_0'
export const noT3: T3 = 't3_0'

export const anonSnoovatarURL: string =
  'https://www.redditstatic.com/shreddit/assets/thinking-snoo.png'
export const anonUsername: string = 'anon'

export function T2(t2: string): T2 {
  if (!t2.startsWith('t2_')) throw Error(`${t2} must start with t2_.`)
  return <T2>t2
}

export function T3(t3: string): T3 {
  if (!t3.startsWith('t3_')) throw Error(`${t3} must start with t3_.`)
  return <T3>t3
}
