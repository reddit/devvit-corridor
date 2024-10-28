import type {Instrument} from '../../shared/serial.js'
import type {Assets} from '../assets.js'

export type Audio = {
  ctx: AudioContext
  instruments: {[instrument in Instrument]: AudioBuffer}
}

export async function Audio(assets: Readonly<Assets>): Promise<Audio> {
  const ctx = new AudioContext()
  const [Bubbler, Clapper, Jazzman, Rgggggg, Wailer] = await Promise.all([
    ctx.decodeAudioData(assets.audio.Bubbler),
    ctx.decodeAudioData(assets.audio.Clapper),
    ctx.decodeAudioData(assets.audio.Jazzman),
    ctx.decodeAudioData(assets.audio.Rgggggg),
    ctx.decodeAudioData(assets.audio.Wailer)
  ])
  return {ctx, instruments: {Bubbler, Clapper, Jazzman, Rgggggg, Wailer}}
}

export function play(
  ctx: AudioContext,
  buf: AudioBuffer,
  scale: number,
  volume: number
): void {
  if (!volume) return
  if (ctx.state !== 'running') return // prevent queuing sounds.

  const src = ctx.createBufferSource()
  src.buffer = buf
  src.playbackRate.value = calculatePentatonicPlaybackRate(scale)

  const gainNode = ctx.createGain()
  gainNode.gain.value = volume

  src.connect(gainNode).connect(ctx.destination)
  src.start()
}

export function calculatePentatonicPlaybackRate(scale: number): number {
  const pentatonicSemitones = [0, 2, 4, 7, 9]
  const len = pentatonicSemitones.length
  const octave = Math.floor(scale / len)
  const semitone =
    pentatonicSemitones[((scale % len) + len) % len]! + 12 * octave
  return 2 ** (semitone / 12)
}
