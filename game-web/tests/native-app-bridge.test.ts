import { afterEach, describe, expect, it } from 'vitest'
import {
  DROPi_NATIVE_EXIT_MESSAGE,
  requestNativeAppExit,
} from '../src/platform/nativeAppBridge'

type TestBridgeGlobal = typeof globalThis & {
  ReactNativeWebView?: { postMessage(message: string): void }
}

const bridgeGlobal = globalThis as TestBridgeGlobal

afterEach(() => {
  delete bridgeGlobal.ReactNativeWebView
})

describe('ISSUE-309 — native app exit bridge', () => {
  it('does not claim success when no native WebView bridge exists', () => {
    delete bridgeGlobal.ReactNativeWebView
    expect(requestNativeAppExit()).toBe(false)
  })

  it('posts the explicit exit message when the native bridge exists', () => {
    let postedMessage: string | null = null
    bridgeGlobal.ReactNativeWebView = {
      postMessage(message: string) {
        postedMessage = message
      },
    }

    expect(requestNativeAppExit()).toBe(true)
    expect(postedMessage).toBe(DROPi_NATIVE_EXIT_MESSAGE)
  })
})
