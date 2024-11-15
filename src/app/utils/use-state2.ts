import {
  type JSONValue,
  type PartialJSONValue,
  type UseStateInitializer,
  type UseStateResult,
  useState
} from '@devvit/public-api'

// to-do: can we be more permissive with undefined without breaking the typing
//        meaningfully? need to think about this more and typing needs to be
//        better. apply to all APIs.
export function useState2(
  // biome-ignore lint/suspicious/noConfusingVoidType:
  init: UseStateInitializer<void | null>
): UseStateResult<boolean>
export function useState2(
  init: UseStateInitializer<boolean>
): UseStateResult<boolean>
export function useState2(
  init: UseStateInitializer<number>
): UseStateResult<number>
export function useState2(
  init: UseStateInitializer<string>
): UseStateResult<string>
export function useState2<S>(
  init: UseStateInitializer<S & PartialJSONValue>
): UseStateResult<S>
export function useState2<S>(
  init: UseStateInitializer<Promise<S & PartialJSONValue>>
): UseStateResult<S>
export function useState2<S extends JSONValue>(
  init: UseStateInitializer<S>
): UseStateResult<S> {
  return useState(init)
}
