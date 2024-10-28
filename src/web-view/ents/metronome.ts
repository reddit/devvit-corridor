import {wrap} from '../../shared/math.js'
import {melodyLen, melodyMillis} from '../../shared/serial.js'
import type {Assets} from '../assets.js'
import {
  melodyBufferPeek,
  melodyBufferRead,
  melodyGet,
  melodyRecordBeat
} from '../types/melody-buffer.js'
import type {UTCMillis} from '../types/time.js'
import {quarterSpace, space} from '../utils/layout.js'
import type {P1} from './player.js'

export function renderMetronome(
  ctx: CanvasRenderingContext2D,
  p1: P1,
  now: UTCMillis,
  assets: Readonly<Assets>
): void {
  const recordBeat = melodyRecordBeat(now)

  const horizontalY = 638 / 2
  const horizontalH = 11 / 2
  const w = ((481 / 2) * ctx.canvas.width) / 756
  {
    ctx.save()
    const x = ((511 / 2) * ctx.canvas.width) / 756

    ctx.beginPath()
    ctx.rect(x, 0, w, ctx.canvas.height)
    ctx.clip()

    const img = assets.images.metronomeHorizontal
    ctx.drawImage(
      img,
      x - ((now % melodyMillis) / melodyMillis) * w,
      horizontalY,
      w * 2,
      horizontalH
    )
    ctx.restore()
  }

  const x = (ctx.canvas.width - w) / 2

  ctx.strokeStyle = 'black'
  const dividerW = w / melodyLen
  for (let drawBeat = 0; drawBeat < melodyLen; drawBeat++) {
    const even = (drawBeat & 1) === 0
    const offset = wrap(
      w / 2 + -((now % melodyMillis) / melodyMillis) * w + drawBeat * dividerW,
      0,
      w
    )

    const line = assets.images[even ? 'metronomeDownbeat' : 'metronomeUpbeat']
    ctx.drawImage(
      line,
      offset + x - line.naturalWidth / 4,
      horizontalY - line.naturalHeight / 4,
      line.naturalWidth / 2,
      line.naturalHeight / 2
    )

    if (drawBeat === 0) {
      const clef = assets.images.metronomeClef
      ctx.drawImage(
        clef,
        offset + x - clef.naturalWidth / 4,
        horizontalY + quarterSpace,
        clef.naturalWidth / 2,
        clef.naturalHeight / 2
      )
    }
    if (
      (drawBeat <= recordBeat &&
        drawBeat > (recordBeat - melodyLen / 2) % melodyLen) ||
      (recordBeat < melodyLen / 2 && drawBeat > recordBeat + melodyLen / 2)
    ) {
      const peek =
        drawBeat <= recordBeat &&
        drawBeat > (recordBeat - melodyLen / 2) % melodyLen
      const melody = peek
        ? melodyBufferPeek(p1.melody)
        : melodyBufferRead(p1.melody)
      const tone = melodyGet(melody, drawBeat)
      if (tone != null) {
        const btn = [
          assets.images.buttonS,
          assets.images.buttonI,
          assets.images.buttonN,
          assets.images.buttonG,
          assets.images.buttonBang
        ][tone]!
        ctx.drawImage(
          btn,
          offset + x - btn.naturalWidth / 64,
          horizontalY - horizontalH - space,
          btn.naturalWidth / 32,
          btn.naturalHeight / 32
        )
      }
    }
  }
}
