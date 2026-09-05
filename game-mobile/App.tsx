import { useEffect, useRef, useState } from 'react'
import {
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
import { getRuntimeConfiguration } from './src/runtimeConfig'

const runtime = getRuntimeConfiguration()
const brandLogo = require('./assets/branding/dropi-tycoon-logo.png')

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

export default function App() {
  const webViewRef = useRef<WebView>(null)
  const [canGoBack, setCanGoBack] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    void ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE,
    ).catch(() => undefined)
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

  if (!runtime.gameUrl) {
    return (
      <View style={styles.errorScreen}>
        <StatusBar hidden />
        <Image source={brandLogo} style={styles.errorLogo} resizeMode="contain" />
        <Text style={styles.errorBody}>{runtime.configurationError}</Text>
      </View>
    )
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

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <WebView
        ref={webViewRef}
        source={{ uri: runtime.gameUrl }}
        style={styles.webView}
        containerStyle={styles.webViewContainer}
        originWhitelist={['https://*']}
        javaScriptEnabled
        domStorageEnabled
        cacheEnabled
        startInLoadingState
        bounces={false}
        overScrollMode="never"
        pullToRefreshEnabled={false}
        setSupportMultipleWindows={false}
        allowsBackForwardNavigationGestures={false}
        mediaPlaybackRequiresUserAction={false}
        injectedJavaScript={PHASER_VIEWPORT_BOOTSTRAP}
        onLoadEnd={() => setLoaded(true)}
        onNavigationStateChange={handleNavigationChange}
        onMessage={handleMessage}
      />
      {!loaded ? (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <Image source={brandLogo} style={styles.loadingLogo} resizeMode="contain" />
          <Text style={styles.loadingText}>Loading your city…</Text>
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
  loadingLogo: {
    width: '42%',
    maxWidth: 360,
    height: 210,
  },
  loadingText: {
    marginTop: 4,
    color: '#d8f7ff',
    fontSize: 18,
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
