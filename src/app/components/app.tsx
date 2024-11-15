// biome-ignore lint/style/useImportType: Devvit is a functional dependency of JSX.
import {type Context, Devvit, type JSONValue} from '@devvit/public-api'
import {
  type UseIntervalResult,
  useChannel,
  useInterval,
  useState
} from '@devvit/public-api'
import {ChannelStatus} from '@devvit/public-api/types/realtime.js'
import {
  type DevvitMessage,
  type PeerMessage,
  type WebViewMessage,
  peerSchemaVersion
} from '../../shared/types/message.js'
import {
  T2,
  T3,
  anonSnoovatarURL,
  anonUsername,
  noT2
} from '../../shared/types/tid.js'
import {utcMillisNow} from '../../shared/types/time.js'
import type {UUID} from '../../shared/types/uuid.js'
import {submitNewPost} from '../utils/post.js'
import {redisGetPost, redisUpdatePost} from '../utils/redis.js'
import {useState2} from '../utils/use-state2.js'

// to-do: update to fiddlesticks.

export function App(ctx: Devvit.Context): JSX.Element {
  const debug = 'corridor' in ctx.debug
  const debugFakePeers = 'fakepeers' in ctx.debug
  const [uuid, setUUID] = useState<UUID | null>(null)
  const [[username, t2, snoovatarURL]] = useState<[string, T2, string]>(
    async () => {
      const user = await ctx.reddit.getCurrentUser()
      const url = await user?.getSnoovatarUrl()
      return [
        user?.username ?? anonUsername,
        user?.id ?? T2(ctx.userId ?? noT2),
        url ?? anonSnoovatarURL
      ]
    }
  )
  if (!ctx.postId) throw Error('no post ID')
  const postID = T3(ctx.postId) // hack: type post well.
  const [post, setPost] = useState2(() => redisGetPost(ctx.redis, postID))
  if (!post) throw Error(`no record for ${postID}`)

  const [_company, client, _version] =
    ctx.debug.metadata['devvit-user-agent']?.values[0]?.split(';') ?? []
  useState2(() =>
    ctx.ui.webView.postMessage<DevvitMessage>('web-view', {
      author: {score: post.score, t2: post.t2, username: post.username},
      completed: post.completed != null,
      debug,
      p1: {client: client ?? '', name: username, t2, snoovatarURL},
      type: 'Init'
    })
  )

  const chan = useChannel<PeerMessage>({
    // key to current post to prevent interfering with other concerts.
    name: postID,
    onMessage: msg => {
      // hack: filter out messages sent by this instance.
      if (msg.player.uuid !== uuid)
        ctx.ui.webView.postMessage<DevvitMessage>('web-view', {
          msg,
          type: 'Peer'
        })
    },
    onSubscribed: () =>
      ctx.ui.webView.postMessage<DevvitMessage>('web-view', {
        type: 'Connected'
      }),
    onUnsubscribed: () =>
      ctx.ui.webView.postMessage<DevvitMessage>('web-view', {
        type: 'Disconnected'
      })
  })
  if (!post.completed) chan.subscribe()
  else chan.unsubscribe()
  const fakePeerInterval = useFakePeekInterval(ctx)
  if (debugFakePeers && chan.status === ChannelStatus.Connected)
    fakePeerInterval.start()

  async function onMsg(webViewMsg: WebViewMessage): Promise<void> {
    let msg: WebViewMessage | PeerMessage = webViewMsg

    // if (debug)
    //   console.log(`${username} app received msg=${JSON.stringify(msg)}`)

    if (msg.type === 'Peer') msg = msg.msg

    switch (msg.type) {
      case 'Init':
        setUUID(msg.uuid)
        break

      case 'GameOver':
        setPost(prev => {
          if (!prev) throw Error('no post')
          return {...prev, completed: utcMillisNow(), score: msg.score}
        })
        if (!post) throw Error('no post')
        await redisUpdatePost(
          ctx.redis,
          // hack: setPost() is broken.
          {...post, completed: utcMillisNow(), score: msg.score}
        )
        break

      case 'NewGame':
        await submitNewPost(ctx)
        break

      case 'Pause':
        chan.unsubscribe()
        break

      case 'Resume':
        chan.subscribe()
        break

      default:
        msg.peer satisfies true
        if (chan.status !== ChannelStatus.Connected) break
        if (debug) console.log(`${username} app.send`)
        chan.send(msg)
        break
    }
  }

  return (
    <webview
      grow
      id='web-view'
      onMessage={onMsg as (msg: JSONValue) => Promise<void>}
      url='index.html'
    />
  )
}
function useFakePeekInterval(ctx: Context): UseIntervalResult {
  return useInterval(() => {
    ctx.ui.webView.postMessage<DevvitMessage>('web-view', {
      type: 'Peer',
      msg: {
        peer: true,
        player: {
          client: 'Shreddit',
          dir: {x: 0, y: 0},
          hp: 100,
          name: 'likeoid',
          snoovatarURL:
            'https://i.redd.it/snoovatar/avatars/d87d7eb2-f063-424a-8e30-f02e3347ef0e.png',
          t2: 't2_reyi3nllt',
          uuid: 'cc7591e9-bd00-4e7a-93a6-a4b486bae374',
          x: 625,
          y: 408,
          w: 8,
          h: 8,
          score: 111
        },
        type: 'PeerUpdate',
        version: peerSchemaVersion
      }
    })
    ctx.ui.webView.postMessage<DevvitMessage>('web-view', {
      type: 'Peer',
      msg: {
        peer: true,
        player: {
          client: 'Shreddit',
          dir: {x: 0, y: 0},
          hp: 100,
          name: 'pizzaoid',
          snoovatarURL:
            'https://www.redditstatic.com/shreddit/assets/thinking-snoo.png',
          t2: 't2_hbbuxlhe5',
          uuid: 'f7570a7e-85cb-4363-98c4-7170d95fdc6b',
          x: 494,
          y: 396,
          w: 8,
          h: 8,
          score: 300
        },
        type: 'PeerUpdate',
        version: peerSchemaVersion
      }
    })
  }, 1000)
}
