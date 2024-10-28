import type {PlayerSerial} from './serial.js'
import type {T2} from './tid.js'
import type {UUID} from './uuid.js'

/** a window message from the app to the web view. */
export type AppMessage = {
  /**
   * hack: every app render posts a message. the ID allows the web view to
   * ignore previously sent messages.
   */
  id: number
} & NoIDAppMessage

// hack: Omit<AppMessage, 'id'> was breaking.
export type NoIDAppMessage =
  | {type: 'Connected'}
  | {type: 'Disconnected'}
  /**
   * hack: the web view iframe is loaded immediately but the local runtime is
   * slow. wait until the local runtime is loaded before attempting any state
   * changes that drive messages that might be dropped.
   */
  | {
      type: 'LocalRuntimeLoaded'
      /**
       * configure web view lifetime debug mode. this is by request in devvit
       * but that granularity doesn't make sense in the web view.
       */
      debug: boolean
      p1: {name: string; snoovatarURL: string; t2: T2}
    }
  | {type: 'Peer'; msg: PeerMessage}

/** a realtime message from another instance. */
export type PeerMessage = {
  peer: true
  player: PlayerSerial
  type: 'PeerUpdate'
  /**
   * filter out messages from different versions. to-do: consider an upgrade
   * banner or filtering out at the channel level.
   */
  version: number
}

/** a window message from the web view to the app. */
export type WebViewMessage = {type: 'WebViewLoaded'; uuid: UUID} | PeerMessage

/**
 * the transmitted and expected message version. messages not at a matching
 * version should be ignored if it contains schema breaking changes.
 */
export const msgVersion: number = 8
