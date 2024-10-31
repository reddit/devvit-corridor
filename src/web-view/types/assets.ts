declare global {
  // hack: fix type.
  interface FontFaceSet {
    add(font: FontFace): FontFaceSet
  }
}

export type Assets = {
  readonly checkerboard: HTMLImageElement
  readonly cursor: HTMLImageElement
  readonly font: FontFace
}

export async function Assets(): Promise<Assets> {
  const font = new FontFace('mem', 'url(assets/mem-prop-5x6.ttf)')
  const [checkerboard, cursor, memFont] = await Promise.all([
    loadImage('assets/checkerboard.webp'),
    loadImage('assets/cursor.webp'),
    await font.load()
  ])
  return {checkerboard, cursor, font: memFont}
}

// async function loadAudio(url: string): Promise<ArrayBuffer> {
//   const rsp = await fetch(url)
//   if (!rsp.ok) throw Error(`HTTP error ${rsp.status}: ${rsp.statusText}`)
//   return await rsp.arrayBuffer()
// }

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(img)
    img.src = src
  })
}

// export async function loadSnoovatar(
//   assets: Readonly<Assets>,
//   player: {snoovatarURL: string; t2: T2}
// ): Promise<HTMLImageElement> {
//   return player.t2 === noT2
//     ? assets.anonSnoovatar
//     : loadImage(player.snoovatarURL)
// }
