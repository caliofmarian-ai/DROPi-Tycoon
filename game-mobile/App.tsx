import { useEffect, useRef, useState } from 'react'
import {
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import { StatusBar } from 'expo-status-bar'
import { WebView, type WebViewNavigation } from 'react-native-webview'
import { getRuntimeConfiguration } from './src/runtimeConfig'

const runtime = getRuntimeConfiguration()

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
        if (!canGoBack) {
          return false
        }

        webViewRef.current?.goBack()
        return true
      },
    )

    return () => subscription.remove()
  }, [canGoBack])

  if (!runtime.gameUrl) {
    return (
      <View style={styles.errorScreen}>
        <StatusBar hidden />
        <Text style={styles.errorTitle}>DROPi Tycoon</Text>
        <Text style={styles.errorBody}>{runtime.configurationError}</Text>
      </View>
    )
  }

  const handleNavigationChange = (navigation: WebViewNavigation) => {
    setCanGoBack(navigation.canGoBack)
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
      />
      {!loaded ? (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading DROPi Tycoon…</Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08121f',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#08121f',
  },
  webView: {
    flex: 1,
    backgroundColor: '#08121f',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#08121f',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  errorScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#08121f',
  },
  errorTitle: {
    marginBottom: 16,
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '700',
  },
  errorBody: {
    maxWidth: 720,
    color: '#cbd5e1',
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
})
