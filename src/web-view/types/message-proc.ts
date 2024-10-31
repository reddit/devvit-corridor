import {
  type AppMessage,
  type AppMessageQueue,
  type PeerMessage,
  type WebViewMessage,
  peerSchemaVersion
} from '../../shared/types/message.js'
import {Peer} from '../ents/player.js'
import type {GameState} from './game-state.js'

export class MessageProc {
  /** mutable reference. */
  readonly state: GameState

  constructor(state: GameState) {
    this.state = state
  }

  postMessage(msg: WebViewMessage): void {
    parent.postMessage(msg, document.referrer)
  }

  register(op: 'add' | 'remove'): void {
    globalThis[`${op}EventListener` as const](
      'message',
      <EventListenerOrEventListenerObject>this.#onMsg
    )
  }

  #onMsg = (
    ev: MessageEvent<
      {type: 'stateUpdate'; data: AppMessageQueue} | {type: undefined}
    >
  ): void => {
    if (ev.data.type !== 'stateUpdate') return // hack: filter unknown messages.

    for (const appMsg of ev.data.data.q) {
      let msg: AppMessage | PeerMessage = appMsg

      // hack: filter repeat messages.
      if (msg.id <= this.state.msgID) continue
      this.state.msgID = msg.id

      // unwrap peer messages into standard messages once ID check is done.
      if (msg.type === 'Peer') msg = msg.msg

      // if (this.state.debug)
      //   console.log(`iframe received msg=${JSON.stringify(msg)}`)

      switch (msg.type) {
        case 'Connected':
          this.state.connected = true
          this.state.peers[this.state.p1.uuid] = this.state.p1
          break

        case 'Disconnected':
          delete this.state.peers[this.state.p1.uuid]
          this.state.connected = false
          break

        case 'Init':
          this.state.debug = msg.debug
          if (this.state.debug) console.log(this)
          this.state.p1.client = msg.p1.client
          this.state.p1.t2 = msg.p1.t2
          this.state.p1.name = msg.p1.name
          this.state.p1.snoovatarURL = msg.p1.snoovatarURL
          this.postMessage({
            id: this.state.msgID,
            type: 'Init',
            uuid: this.state.p1.uuid
          })
          break

        case 'PeerUpdate': {
          if (msg.version !== peerSchemaVersion) {
            this.state.outdated ||= msg.version > peerSchemaVersion
            break
          }
          if (this.state.debug) console.log('on peer update')
          const prev = this.state.zoo.find(msg.player.uuid)
          if (prev && prev.type !== 'Peer')
            throw Error('recevied message from self')
          const peer = Peer(prev, msg)
          this.state.zoo.replace(this.state.cam, peer)
          this.state.peers[peer.uuid] = peer
          break
        }

        default:
          msg satisfies never
      }
    }
  }
}
