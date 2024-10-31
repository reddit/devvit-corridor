import {expect, test} from 'vitest'
import {Cam} from '../types/cam.js'
import {Input} from './input.js'

const cam: Cam = new Cam()
const canvas: HTMLCanvasElement = <HTMLCanvasElement>(<unknown>{
  addEventListener() {},
  removeEventListener() {},
  requestPointerLock() {}
})
globalThis.isSecureContext = true
Object.defineProperty(globalThis, 'navigator', {value: {getGamepads: () => []}})
const target: EventTarget = new EventTarget()
globalThis.addEventListener = target.addEventListener.bind(target)
globalThis.removeEventListener = target.removeEventListener.bind(target)
globalThis.dispatchEvent = target.dispatchEvent.bind(target)

test('buttons are initially inactive', () => {
  const input = new Input(cam, canvas)
  input.mapDefault()
  input.register('add')
  expect(input.isOn('U')).toBe(false)
  expect(input.isOnStart('U')).toBe(false)
  expect(input.isHeld()).toBe(false)
  expect(input.isOffStart('U')).toBe(false)
  input.register('remove')
})

test('pressed buttons are active and triggered', () => {
  const input = new Input(cam, canvas)
  input.mapDefault()
  input.register('add')
  dispatchKeyEvent('keydown', 'ArrowUp')
  input.poll(16)
  expect(input.isOn('U')).toBe(true)
  expect(input.isOnStart('U')).toBe(true)
  expect(input.isHeld()).toBe(false)
  expect(input.isOffStart('U')).toBe(false)
  input.register('remove')
})

test('held buttons are active but not triggered', () => {
  const input = new Input(cam, canvas)
  input.mapDefault()
  input.register('add')
  dispatchKeyEvent('keydown', 'ArrowUp')
  input.poll(300)
  input.poll(16)
  expect(input.isOn('U')).toBe(true)
  expect(input.isOnStart('U')).toBe(false)
  expect(input.isHeld()).toBe(true)
  expect(input.isOffStart('U')).toBe(false)
  input.register('remove')
})

test('released buttons are off and triggered', () => {
  const input = new Input(cam, canvas)
  input.mapDefault()
  input.register('add')
  dispatchKeyEvent('keydown', 'ArrowUp')
  input.poll(16)

  dispatchKeyEvent('keyup', 'ArrowUp')
  input.poll(16)

  expect(input.isOn('U')).toBe(false)
  expect(input.isOnStart('U')).toBe(false)
  expect(input.isHeld()).toBe(false)
  expect(input.isOffStart('U')).toBe(true)

  input.register('remove')
})

test('simultaneously pressed buttons are active and triggered', () => {
  const input = new Input(cam, canvas)
  input.mapDefault()
  input.register('add')
  dispatchKeyEvent('keydown', 'ArrowUp')
  dispatchKeyEvent('keydown', 'ArrowDown')
  input.poll(16)

  expect(input.isOn('U', 'D')).toBe(true)
  expect(input.isOnStart('U', 'D')).toBe(true)
  expect(input.isHeld()).toBe(false)
  expect(input.isOffStart('U', 'D')).toBe(false)

  input.register('remove')
})

function dispatchKeyEvent(type: 'keydown' | 'keyup', key: string): void {
  dispatchEvent(Object.assign(new Event(type), {key}))
}
