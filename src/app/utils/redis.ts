import type {Post, RedisClient} from '@devvit/public-api'
import {version} from '../../../package.json' // to-do: keep this consistent with devvit.yaml.
import type {T2, T3, T5} from '../../shared/types/tid.js'
import type {UTCMillis} from '../../shared/types/time.js'
import {previewVersion} from '../components/preview.js'

export type AppPostRecord = {
  /** package.json semver. */
  appVersion: string
  /** game completion timestamp. */
  completed: UTCMillis | null
  /** post creation timestamp. */
  created: UTCMillis
  /** post loading screen version. */
  previewVersion: number
  /** Redis schema version. */
  redisVersion: number
  /** game score. */
  score: number | null
  /** subreddit posted to. */
  subName: string
  /** author ID. */
  t2: T2
  /** post ID. */
  t3: T3
  /** subreddit ID. */
  t5: T5
  /** post title */
  title: string
  /** author username. */
  username: string
}

export const redisSchemaVersion: number = 0

const postByCreatedKey: string = 'postByCreated'
const postByT3Key: string = 'postByT3'

export async function redisPutPost(
  redis: RedisClient,
  post: Readonly<Post>
): Promise<void> {
  const record = JSON.stringify(AppPostRecord(post))
  await Promise.all([
    redis.zAdd(postByCreatedKey, {
      member: record,
      score: post.createdAt.getUTCMilliseconds()
    }),
    redis.hSet(postByT3Key, {[post.id]: record})
  ])
}

export async function redisUpdatePost(
  redis: RedisClient,
  post: Readonly<AppPostRecord>
): Promise<void> {
  const record = JSON.stringify(post)
  await redis.hSet(postByT3Key, {[post.t3]: record})
}

export async function redisGetPost(
  redis: RedisClient,
  t3: T3
): Promise<AppPostRecord | undefined> {
  const json = await redis.hGet(postByT3Key, t3)
  if (json) return appPostRecordParse(json)
}

/** return posts ordered by creation. */
export async function redisZRangePosts(
  redis: RedisClient,
  start: number,
  end: number
): Promise<AppPostRecord[]> {
  const items = await redis.zRange(postByCreatedKey, start, end, {by: 'score'})
  return items.map(item => appPostRecordParse(item.member))
}

/** @internal */
export function AppPostRecord(
  post: Readonly<
    Pick<
      Post,
      | 'authorId'
      | 'authorName'
      | 'createdAt'
      | 'id'
      | 'subredditId'
      | 'title'
      | 'subredditName'
    >
  >
): AppPostRecord {
  // anonymous app engagement is forbidden by client.
  if (!post.authorName) throw Error('no author name')
  if (!post.authorId) throw Error('no author ID')
  return {
    appVersion: version,
    completed: null,
    username: post.authorName,
    created: post.createdAt.getUTCMilliseconds() as UTCMillis,
    previewVersion,
    redisVersion: redisSchemaVersion,
    score: null,
    subName: post.subredditName,
    t2: post.authorId,
    t3: post.id,
    t5: post.subredditId,
    title: post.title
  }
}

/** @internal */
export function appPostRecordParse(json: string): AppPostRecord {
  return JSON.parse(json)
}
