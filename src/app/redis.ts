import type {Post, RedisClient} from '@devvit/public-api'
import {version} from '../../package.json' // to-do: keep this consistent with devvit.yaml.
import type {T3, T5} from '../shared/types/tid.js'
import {previewVersion} from './preview.js'

export type AppPostRecord = {
  /** package.json semver. */
  appVersion: string
  /** post creation timestamp. */
  created: Date
  /** post loading screen version. */
  previewVersion: number
  /** Redis schema version. */
  redisVersion: number
  subName: string
  /** post ID. */
  t3: T3
  /** subreddit ID. */
  t5: T5
  title: string
}

export const redisSchemaVersion: number = 0

/** AppPostRecords sorted by creation. */
const redisAppPostsKey: string = 'posts'

export async function redisZaddPost(
  redis: RedisClient,
  post: Readonly<Post>
): Promise<void> {
  const record = AppPostRecord(post)
  await redis.zAdd(redisAppPostsKey, {
    member: JSON.stringify(record),
    score: post.createdAt.getUTCMilliseconds()
  })
}

/** return posts ordered by creation. */
export async function redisZRangePosts(
  redis: RedisClient,
  start: number,
  end: number
): Promise<AppPostRecord[]> {
  const items = await redis.zRange(redisAppPostsKey, start, end, {by: 'score'})
  return items.map(item => appPostRecordParse(item.member))
}

/** @internal */
export function AppPostRecord(
  post: Readonly<
    Pick<Post, 'createdAt' | 'id' | 'subredditId' | 'title' | 'subredditName'>
  >
): AppPostRecord {
  return {
    appVersion: version,
    created: post.createdAt,
    previewVersion,
    redisVersion: redisSchemaVersion,
    subName: post.subredditName,
    t3: post.id,
    t5: post.subredditId,
    title: post.title
  }
}

/** @internal */
export function appPostRecordParse(json: string): AppPostRecord {
  const post = JSON.parse(json)
  post.created = new Date(post.created)
  return post
}
