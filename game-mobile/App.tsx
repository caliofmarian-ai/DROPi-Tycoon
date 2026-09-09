import { useEffect, useRef, useState } from 'react'
import {
  AppState,
  BackHandler,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import { StatusBar } from 'expo-status-bar'
import {
  WebView,
  type WebViewMessageEvent,
  type WebViewNavigation,
} from 'react-native-webview'
import {
  BUNDLED_RUNTIME_ORIGIN,
  startBundledPhaserRuntime,
} from './src/bundledRuntime'
import { getRuntimeConfiguration } from './src/runtimeConfig'

const runtime = getRuntimeConfiguration()
const brandLogo = require('./assets/branding/dropi-tycoon-logo.png')
const brandSplash = require('./assets/branding/dropi-tycoon-splash.jpg')

const PHASER_VIEWPORT_BOOTSTRAP = `
(() => {
  const root = document.documentElement;
  const body = document.body;
  root.style.width = '100%';
  root.style.height = '100%';
  root.style.margin = '0';
  root.style.padding = '0';
  root.style.overflow = 'hidden';
  root.style.overscrollBehavior = 'none';
  body.style.width = '100%';
  body.style.height = '100%';
  body.style.margin = '0';
  body.style.padding = '0';
  body.style.overflow = 'hidden';
  body.style.overscrollBehavior = 'none';
  window.dispatchEvent(new Event('resize'));
  true;
})();
`

const PHASER_NATIVE_BACK_DISPATCH = `
window.dispatchEvent(new Event('dropi:native-back'));
true;
`

const EXIT_GAME_MESSAGE = 'dropi:exit-game'

const LoadingScreen = () => (
  <View style={styles.container}>
    <StatusBar hidden />
    <Image source={brandSplash} style={styles.loadingSplash} resizeMode="contain" />
    <View style={styles.loadingCaption}>
      <Text style={styles.loadingText}>Loading your city…</Text>
    </View>
  </View>
)

const ErrorScreen = ({ message }: { message: string }) => (
  <View style={styles.errorScreen}>
    <StatusBar hidden />
    <Image source={brandLogo} style={styles.errorLogo} resizeMode="contain" />
    <Text style={styles.errorBody}>{message}</Text>
  </View>
)

export default function App() {
  const webViewRef = useRef<WebView>(null)
  const [canGoBack, setCanGoBack] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [gameUrl, setGameUrl] = useState<string | null>(
    runtime.mode === 'remote' ? runtime.remoteGameUrl : null,
  )
  const [startupError, setStartupError] = useState<string | null>(null)

  useEffect(() => {
    void ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE,
    ).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (runtime.mode !== 'bundled') {
      return undefined
    }

    let active = true

    const ensureBundledRuntime = async (): Promise<void> => {
      try {
        const localGameUrl = await startBundledPhaserRuntime()
        if (!active) return
        setStartupError(null)
        setGameUrl(localGameUrl)
      } catch {
        if (!active) return
        setStartupError(
          'The installed Phaser runtime could not start. This is a local app-asset failure, not a Railway/network outage.',
        )
      }
    }

    void ensureBundledRuntime()
    const appStateSubscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        void ensureBundledRuntime()
      }
    })

    return () => {
      active = false
      appStateSubscription.remove()
    }
  }, [])

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (canGoBack) {
          webViewRef.current?.goBack()
          return true
        }

        if (!loaded) {
          return false
        }

        webViewRef.current?.injectJavaScript(PHASER_NATIVE_BACK_DISPATCH)
        return true
      },
    )

    return () => subscription.remove()
  }, [canGoBack, loaded])

  const fatalError = runtime.configurationError ?? startupError
  if (fatalError) {
    return <ErrorScreen message={fatalError} />
  }

  if (!gameUrl) {
    return <LoadingScreen />
  }

  const handleNavigationChange = (navigation: WebViewNavigation) => {
    setCanGoBack(navigation.canGoBack)
  }

  const handleMessage = (event: WebViewMessageEvent) => {
    if (event.nativeEvent.data !== EXIT_GAME_MESSAGE) {
      return
    }

    if (Platform.OS === 'android') {
      BackHandler.exitApp()
    }
  }

  const allowNavigation = ({ url }: { url: string }): boolean => {
    if (url === 'about:blank') return true

    if (runtime.mode === 'bundled') {
      return url === BUNDLED_RUNTIME_ORIGIN || url.startsWith(`${BUNDLED_RUNTIME_ORIGIN}/`)
    }

    return url.startsWith('https://')
  }

  const handleLoadError = (): void => {
    setLoaded(false)
    setStartupError(
      runtime.mode === 'bundled'
        ? 'The installed Phaser runtime could not be loaded from local app assets.'
        : 'The remote development/preview runtime could not be loaded. Check the configured HTTPS runtime and network connection.',
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <WebView
        ref={webViewRef}
        source={{ uri: gameUrl }}
        style={styles.webView}
        containerStyle={styles.webViewContainer}
        originWhitelist={runtime.mode === 'bundled' ? [BUNDLED_RUNTIME_ORIGIN] : ['https://*']}
        javaScriptEnabled
        domStorageEnabled
        cacheEnabled
        allowFileAccess={false}
        allowFileAccessFromFileURLs={false}
        allowUniversalAccessFromFileURLs={false}
        mixedContentMode="never"
        startInLoadingState
        bounces={false}
        overScrollMode="never"
        pullToRefreshEnabled={false}
        setSupportMultipleWindows={false}
        allowsBackForwardNavigationGestures={false}
        mediaPlaybackRequiresUserAction={false}
        injectedJavaScript={PHASER_VIEWPORT_BOOTSTRAP}
        onLoadStart={() => setLoaded(false)}
        onLoadEnd={() => setLoaded(true)}
        onError={handleLoadError}
        onShouldStartLoadWithRequest={allowNavigation}
        onNavigationStateChange={handleNavigationChange}
        onMessage={handleMessage}
      />
      {!loaded ? (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <Image source={brandSplash} style={styles.loadingSplash} resizeMode="contain" />
          <View style={styles.loadingCaption}>
            <Text style={styles.loadingText}>Loading your city…</Text>
          </View>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06162d',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#06162d',
  },
  webView: {
    flex: 1,
    backgroundColor: '#06162d',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06162d',
  },
  loadingSplash: {
    width: '100%',
    height: '100%',
  },
  loadingCaption: {
    position: 'absolute',
    bottom: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(6, 22, 45, 0.86)',
  },
  loadingText: {
    color: '#d8f7ff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#06162d',
  },
  errorLogo: {
    width: '38%',
    maxWidth: 320,
    height: 190,
    marginBottom: 12,
  },
  errorBody: {
    maxWidth: 720,
    color: '#cbd5e1',
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
})
