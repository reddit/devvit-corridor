import {Devvit} from '@devvit/public-api'
import type {Context} from '@devvit/public-api'
import {Preview} from '../components/preview.js'
import {redisPutPost} from './redis.js'

/** create a new post as the viewer. */
export async function submitNewPost(ctx: Context): Promise<void> {
  if (!ctx.subredditName) throw Error('no subreddit name')
  if (!ctx.userId) throw Error('no user ID')

  const title = `corridor ${ctx.userId.slice(3)}`

  // requires special permission: post as viewer.
  const post = await ctx.reddit.submitPost({
    preview: <Preview />,
    title,
    subredditName: ctx.subredditName
  })

  await redisPutPost(ctx.redis, post)

  ctx.ui.showToast({appearance: 'success', text: `${title} made.`})
  ctx.ui.navigateTo(post)
}
