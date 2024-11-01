import type {UUID} from '../../shared/types/uuid.js'
import type {Cam} from '../types/cam.js'
import type {GameState} from '../types/game-state.js'
import {type Layer, layerDrawOrder} from '../types/layer.js'
import {type Bullet, bulletDraw, bulletUpdate} from './bullet.js'
import {type Cursor, cursorDraw, cursorUpdate} from './cursor.js'
import {type Item, itemDraw, itemUpdate} from './item.js'
import {
  type CorridorLevel,
  corridorLevelDraw,
  corridorLevelUpdate
} from './levels/corridor-level.js'
import {
  type GameOverLevel,
  gameOverLevelDraw,
  gameOverLevelUpdate
} from './levels/game-over-level.js'
import {type LeechMob, leechMobDraw, leechMobUpdate} from './mob.js'
import {type Outdated, outdatedDraw, outdatedUpdate} from './outdated.js'
import {
  type PlayNewButton,
  playNewButtonDraw,
  playNewButtonUpdate
} from './play-new-button.js'
import {
  type P1,
  type Peer,
  p1Draw,
  p1Update,
  peerDraw,
  peerUpdate
} from './player.js'
import {type Score, scoreDraw, scoreUpdate} from './score.js'
import {type Status, statusDraw, statusUpdate} from './status.js'

export type Ent =
  | Bullet
  | CorridorLevel
  | Cursor
  | GameOverLevel
  | Item
  | LeechMob
  | Outdated
  | Peer
  | PlayNewButton
  | P1
  | Score
  | Status

type EntByUUID = {[uuid: UUID]: Ent}

export class Zoo {
  #ents: EntByUUID = {}
  #mobs: EntByUUID = {}
  #peerCnt: number = 0
  #viewportEnts: {[layer in Layer]?: EntByUUID} = {}

  clear(): void {
    this.#ents = {}
    this.#mobs = {}
    this.#peerCnt = 0
    this.#viewportEnts = {}
  }

  draw(state: GameState): void {
    const {c2d} = state.draw

    for (const layer of layerDrawOrder) {
      c2d.save()
      if (layer !== 'Cursor' && layer !== 'Level' && layer !== 'UI')
        c2d.translate(-state.cam.x, -state.cam.y)

      for (const ent of Object.values(this.#viewportEnts[layer] ?? {})) {
        switch (ent.type) {
          case 'Bullet':
            bulletDraw(ent, state)
            break
          case 'CorridorLevel':
            corridorLevelDraw(ent, state)
            break
          case 'Cursor':
            cursorDraw(ent, state)
            break
          case 'GameOverLevel':
            gameOverLevelDraw(ent, state)
            break
          case 'Item':
            itemDraw(ent, state)
            break
          case 'LeechMob':
            leechMobDraw(ent, state)
            break
          case 'Outdated':
            outdatedDraw(ent, state)
            break
          case 'P1':
            p1Draw(ent, state)
            break
          case 'Peer':
            peerDraw(ent, state)
            break
          case 'PlayNewButton':
            playNewButtonDraw(ent, state)
            break
          case 'Score':
            scoreDraw(ent, state)
            break
          case 'Status':
            statusDraw(ent, state)
            break
          default:
            ent satisfies never
        }
      }
      c2d.restore()
    }
  }

  find(uuid: UUID): Ent | undefined {
    return this.#ents[uuid]
  }

  get peerCount(): number {
    return this.#peerCnt
  }

  replace(cam: Readonly<Cam>, ...ents: readonly Readonly<Ent>[]): void {
    for (const ent of ents) {
      switch (ent.type) {
        case 'LeechMob':
          this.#mobs[ent.uuid] = ent
          break
        case 'Peer':
          if (!this.#mobs[ent.uuid]) this.#peerCnt++
          break
      }
      if (isEntVisible(cam, ent)) {
        this.#viewportEnts[ent.layer] ??= {}
        this.#viewportEnts[ent.layer]![ent.uuid] = ent // don't check other layers i guess
      }
      this.#ents[ent.uuid] = ent
    }
  }

  update(state: GameState): void {
    this.#viewportEnts = {}
    for (const ent of Object.values(this.#ents)) {
      if (isEntVisible(state.cam, ent)) {
        this.#viewportEnts[ent.layer] ??= {}
        this.#viewportEnts[ent.layer]![ent.uuid] = ent // allow this to be stale I guess.
      }

      if (
        state.paused &&
        ent.layer !== 'Cursor' &&
        ent.layer !== 'Level' &&
        ent.layer !== 'UI'
      )
        continue

      switch (ent.type) {
        case 'Bullet':
          bulletUpdate(ent, state)
          break
        case 'CorridorLevel':
          corridorLevelUpdate(ent, state)
          break
        case 'Cursor':
          cursorUpdate(ent, state)
          break
        case 'GameOverLevel':
          gameOverLevelUpdate(ent, state)
          break
        case 'Item':
          itemUpdate(ent, state)
          break
        case 'LeechMob':
          leechMobUpdate(ent, state)
          break
        case 'Outdated':
          outdatedUpdate(ent, state)
          break
        case 'P1':
          p1Update(ent, state)
          break
        case 'Peer':
          peerUpdate(ent, state)
          break
        case 'PlayNewButton':
          playNewButtonUpdate(ent, state)
          break
        case 'Score':
          scoreUpdate(ent, state)
          break
        case 'Status':
          statusUpdate(ent, state)
          break
        default:
          ent satisfies never
      }
    }
  }

  remove(...ents: readonly Readonly<Ent>[]): void {
    for (const ent of ents) {
      if (ent.type === 'Peer') this.#peerCnt--
      delete this.#ents[ent.uuid]
      delete this.#mobs[ent.uuid]
      for (const layer of Object.values(this.#viewportEnts)) {
        if (!layer[ent.uuid]) continue
        delete layer[ent.uuid]
        break
      }
    }
  }

  *viewport(): Generator<Ent> {
    for (const layer of layerDrawOrder)
      for (const ent of Object.values(this.#viewportEnts[layer] ?? {}))
        yield ent
  }
}

function isEntVisible(cam: Readonly<Cam>, ent: Readonly<Ent>): boolean {
  return (
    ent.layer === 'Cursor' ||
    ent.layer === 'UI' ||
    ('x' in ent && cam.isVisible(ent))
  )
}
