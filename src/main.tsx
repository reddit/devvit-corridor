import {Devvit} from '@devvit/public-api'
import {App} from './app/app.js'
import {Preview} from './app/preview.js'

Devvit.configure({realtime: true, redditAPI: true})

Devvit.addCustomPostType({name: 'snoosings', height: 'tall', render: App})

Devvit.addMenuItem({
  label: 'New snoosings Concert',
  location: 'subreddit',
  onPress: async (_ev, ctx) => {
    const sub = await ctx.reddit.getCurrentSubreddit()

    const post = await ctx.reddit.submitPost({
      preview: <Preview />,
      title: 'snoosings concert in the park',
      subredditName: sub.name
    })

    ctx.ui.showToast({appearance: 'success', text: 'Concert created.'})
    ctx.ui.navigateTo(post)
  }
})

export default Devvit
