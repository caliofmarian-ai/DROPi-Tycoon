export const DROPi_NATIVE_EXIT_MESSAGE = 'dropi:exit-game'

type ReactNativeWebViewBridge = {
  postMessage(message: string): void
}

type NativeBridgeGlobal = typeof globalThis & {
  ReactNativeWebView?: ReactNativeWebViewBridge
}

export const requestNativeAppExit = (): boolean => {
  const bridge = (globalThis as NativeBridgeGlobal).ReactNativeWebView
  if (!bridge || typeof bridge.postMessage !== 'function') return false
  bridge.postMessage(DROPi_NATIVE_EXIT_MESSAGE)
  return true
}
