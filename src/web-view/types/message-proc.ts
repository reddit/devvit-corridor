import {
  type DevvitMessage,
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

  register(op: 'add' | 'remove'): void {
    globalThis[`${op}EventListener` as const](
      'message',
      <EventListenerOrEventListenerObject>this.#onMsg
    )
  }

  #onMsg = (
    ev: MessageEvent<{type?: 'devvit-message'; data: {message: DevvitMessage}}>
  ): void => {
    // hack: filter unknown messages.
    if (ev.data.type !== 'devvit-message') return

    let msg: DevvitMessage | PeerMessage = ev.data.data.message

    // unwrap peer messages into standard messages once ID check is done.
    if (msg.type === 'Peer') msg = msg.msg

    if (this.state.debug || ('debug' in msg && msg.debug))
      console.log(`web view received msg=${JSON.stringify(msg)}`)

    switch (msg.type) {
      case 'Connected':
        this.state.connected = true
        this.state.peers[this.state.p1.uuid] = this.state.p1
        break

      case 'Disconnected':
        delete this.state.peers[this.state.p1.uuid]
        this.state.connected = false
        break

      case 'Init': {
        this.state.debug = msg.debug
        if (this.state.debug) console.log(this)
        this.state.author = msg.author
        this.state.completed = msg.completed
        this.state.p1.client = msg.p1.client
        this.state.p1.t2 = msg.p1.t2
        this.state.p1.name = msg.p1.name
        this.state.p1.snoovatarURL = msg.p1.snoovatarURL
        this.state.init = true
        postMessage({type: 'Init', uuid: this.state.p1.uuid})
        break
      }

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
        // this.state.zoo.replace(this.state.cam, peer)
        this.state.peers[peer.uuid] = peer

        // hacky sack
        if (this.state.p1.t2 !== this.state.author.t2)
          this.state.p1.score = peer.score

        break
      }

      default:
        msg satisfies never
    }
  }
}

export function postMessage(msg: WebViewMessage): void {
  parent.postMessage(msg, document.referrer)
}
