import type {Author, PlayerSerial} from './serial.js'
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

export type AppMessageQueue = {
  /** the last queued message ID (message may no longer be in queue). */
  readonly id: number
  // hack: useState() doesn't accept readonly arrays.
  readonly q: Readonly<AppMessage>[]
}

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
      /**
       * configure web view lifetime debug mode. this is by request in devvit
       * but that granularity doesn't make sense in the web view.
       */
      debug: boolean
      author: Author
      completed: boolean
      // to-do: rename profile.
      p1: {client: string; name: string; snoovatarURL: string; t2: T2} // Profile
      readonly type: 'Init'
    }
  | {msg: PeerMessage; readonly type: 'Peer'}

/** a realtime message from another instance. */
export type PeerMessage = {
  peer: true
  player: PlayerSerial
  readonly type: 'PeerUpdate'
  /**
   * filter out messages from different versions. to-do: consider an upgrade
   * banner or filtering out at the channel level.
   */
  version: number
}

/** a window message from the web view to the app. */
export type WebViewMessage = {
  /**
   * hack: every app render posts a message. the ID allows the web view to
   * report messages received.
   */
  id: number
} & NoIDWebViewMessage

export type NoIDWebViewMessage =
  | {uuid: UUID; readonly type: 'Init'}
  | {score: number; readonly type: 'GameOver'}
  | {readonly type: 'NewGame'}
  | {readonly type: 'Pause'}
  | {msg: PeerMessage; readonly type: 'Peer'}
  | {readonly type: 'Resume'}

/**
 * the transmitted and expected message version. messages not at a matching
 * version should be ignored if it contains schema breaking changes.
 */
export const peerSchemaVersion: number = 0

export const heartbeatPeriodMillis: number = 9_000
export const peerThrottleMillis: number = 300
export const disconnectMillis: number = 30_000
export const insignificantDirRadians: number = 0.05
export const insignificantMovePx: number = 50
