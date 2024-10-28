import type {XY} from '../shared/2d.js'
import type {Instrument} from '../shared/serial.js'
import {type T2, anonSnoovatarURL, noT2} from '../shared/tid.js'
import {loadImage} from './utils/image.js'

export type Assets = {
  readonly audio: {readonly [instrument in Instrument]: ArrayBuffer}
  readonly images: {
    // to-do: spritesheet.
    readonly anonSnoovatar: HTMLImageElement
    readonly buttonS: HTMLImageElement
    readonly buttonI: HTMLImageElement
    readonly buttonN: HTMLImageElement
    readonly buttonG: HTMLImageElement
    readonly buttonBang: HTMLImageElement
    readonly cursor: HTMLImageElement
    readonly grass: HTMLImageElement
    readonly metronomeClef: HTMLImageElement
    readonly metronomeDownbeat: HTMLImageElement
    readonly metronomeHorizontal: HTMLImageElement
    readonly metronomeUpbeat: HTMLImageElement
    p1: HTMLImageElement
    readonly stage: HTMLImageElement
    readonly toneBa: HTMLImageElement
    readonly tonePop: HTMLImageElement
    readonly toneRg: HTMLImageElement
    readonly toneSnap: HTMLImageElement
    readonly toneWa: HTMLImageElement
    readonly tv: HTMLImageElement
  }
}

export const snoovatarMaxWH: Readonly<XY> = {x: 64, y: 64}

export async function Assets(): Promise<Assets> {
  const [
    anonSnoovatar,
    buttonS,
    buttonI,
    buttonN,
    buttonG,
    buttonBang,
    cursor,
    grass,
    metronomeClef,
    metronomeDownbeat,
    metronomeHorizontal,
    metronomeUpbeat,
    stage,
    toneBa,
    tonePop,
    toneRg,
    toneSnap,
    toneWa,
    tv,
    Bubbler,
    Clapper,
    Jazzman,
    Rgggggg,
    Wailer
  ] = await Promise.all([
    loadImage(anonSnoovatarURL),
    loadImage('assets/images/button-s.webp'),
    loadImage('assets/images/button-i.webp'),
    loadImage('assets/images/button-n.webp'),
    loadImage('assets/images/button-g.webp'),
    loadImage('assets/images/button-!.webp'),
    loadImage('assets/images/cursor.webp'),
    loadImage('assets/images/grass.webp'),
    loadImage('assets/images/metronome-clef.webp'),
    loadImage('assets/images/metronome-downbeat.webp'),
    loadImage('assets/images/metronome-horizontal.webp'),
    loadImage('assets/images/metronome-upbeat.webp'),
    loadImage('assets/images/stage.webp'),
    loadImage('assets/images/tone-ba.webp'),
    loadImage('assets/images/tone-pop.webp'),
    loadImage('assets/images/tone-rg.webp'),
    loadImage('assets/images/tone-snap.webp'),
    loadImage('assets/images/tone-wa.webp'),
    loadImage('assets/images/tv.webp'),
    loadAudio('assets/audio/pop.ogg'),
    loadAudio('assets/audio/snap.ogg'),
    loadAudio('assets/audio/ba.ogg'),
    loadAudio('assets/audio/rg.ogg'),
    loadAudio('assets/audio/wa.ogg')
  ])
  return {
    images: {
      anonSnoovatar,
      buttonS,
      buttonI,
      buttonN,
      buttonG,
      buttonBang,
      cursor,
      grass,
      metronomeClef,
      metronomeDownbeat,
      metronomeHorizontal,
      metronomeUpbeat,
      p1: anonSnoovatar,
      stage,
      toneBa,
      tonePop,
      toneRg,
      toneSnap,
      toneWa,
      tv
    },
    audio: {Bubbler, Clapper, Jazzman, Rgggggg, Wailer}
  }
}

export async function loadSnoovatar(
  assets: Readonly<Assets>,
  player: {snoovatarURL: string; t2: T2}
): Promise<HTMLImageElement> {
  return player.t2 === noT2
    ? assets.images.anonSnoovatar
    : loadImage(player.snoovatarURL)
}

async function loadAudio(url: string): Promise<ArrayBuffer> {
  const rsp = await fetch(url)
  if (!rsp.ok) throw Error(`HTTP error ${rsp.status}: ${rsp.statusText}`)
  return await rsp.arrayBuffer()
}
