import type {Assets} from './assets.js'

export type Audio = {
  ctx: AudioContext
  // instruments: {[instrument in Instrument]: AudioBuffer}
}

export async function Audio(_assets: Readonly<Assets>): Promise<Audio> {
  const ctx = new AudioContext()
  // const [Bubbler] = await Promise.all([
  //   ctx.decodeAudioData(assets.audio.Bubbler),
  // ])
  return {ctx}
}

export function playBuffer(
  ctx: AudioContext,
  buf: AudioBuffer,
  volume: number
): void {
  if (!volume) return
  if (ctx.state !== 'running') return // prevent queuing sounds.

  const src = ctx.createBufferSource()
  src.buffer = buf

  const gainNode = ctx.createGain()
  gainNode.gain.value = volume

  src.connect(gainNode).connect(ctx.destination)
  src.start()
}

export function beep(
  ctx: AudioContext,
  type: OscillatorType,
  startHz: number,
  endHz: number,
  duration: number
): void {
  if (ctx.state !== 'running') return // prevent queuing sounds.
  const now = ctx.currentTime
  const end = now + duration

  const oscillator = ctx.createOscillator()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(startHz, now)
  oscillator.frequency.exponentialRampToValueAtTime(endHz, end)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.5, now)
  gain.gain.exponentialRampToValueAtTime(0.01, end)

  oscillator.connect(gain)
  gain.connect(ctx.destination)

  oscillator.start()
  oscillator.stop(end)
}
