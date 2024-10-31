import {expect, test} from 'vitest'
import {AppPostRecord, appPostRecordParse} from './redis.js'

test('appPostRecordParse()', () => {
  const post = {
    createdAt: new Date(),
    id: 't3_0',
    subredditId: 't5_0',
    subredditName: 'subredditName',
    title: 'title'
  } as const
  const record = AppPostRecord(post)
  expect(appPostRecordParse(JSON.stringify(record))).toStrictEqual(record)
})
