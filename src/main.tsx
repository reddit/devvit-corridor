import {Devvit} from '@devvit/public-api'
import {App} from './app/app.js'
import {Preview} from './app/preview.js'
import {redisSchemaVersion, redisZaddPost} from './app/redis.js'

const upgrade: boolean = true

Devvit.configure({realtime: true, redis: true, redditAPI: true})

Devvit.addCustomPostType({name: 'Corridor', height: 'tall', render: App})

Devvit.addMenuItem({
  label: 'New Corridor Game',
  location: 'subreddit',
  onPress: async (_ev, ctx) => {
    if (!ctx.subredditName) return

    const post = await ctx.reddit.submitPost({
      preview: <Preview />,
      title: 'corridor',
      subredditName: ctx.subredditName
    })
    await redisZaddPost(ctx.redis, post)

    ctx.ui.showToast({appearance: 'success', text: 'Corridor created.'})
    ctx.ui.navigateTo(post)
  }
})

Devvit.addTrigger({
  event: 'AppUpgrade',
  onEvent(_ev) {
    if (upgrade) {
      console.log(`upgrading app to schema v${redisSchemaVersion}`)
      // to-do: schedule n updates.
      // post.setCustomPostPreview(…)
    }
  }
})

export default Devvit
