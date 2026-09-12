# Install the Babylon Brăila Android evaluation APK

This path uses an APK built directly by GitHub Actions from the exact draft PR
head. It does not use Termux, a computer, Railway, EAS or a production signing
key.

Truth classification:

`NON-AUTHORITATIVE TECHNICAL SPIKE — NOT AUTHENTIC GAMEPLAY`

## Install on Android

1. Open the latest successful `Babylon Third-Person Brăila Spike` run attached
   to draft PR #712.
2. Under **Artifacts**, download the artifact whose name starts with
   `dropi-babylon-android-eval-`.
3. Open the downloaded ZIP in the Android Files application and choose
   **Extract**.
4. Tap the extracted `DROPi-Babylon-Eval-<SHA>.apk` once to install it.
5. If Android asks, allow **Install unknown apps** for the Files application,
   then return and tap the APK again.
6. Open the separately installed application named `DROPi Babylon Eval`.

The evaluation package is `com.dropi.tycoon.babyloneval`, so it does not
replace `com.dropi.tycoon` or its saved data.

Do not install an APK when the SHA in its filename, the provenance JSON and the
workflow run do not agree. The artifact also contains:

- `android-evaluation-provenance.json`;
- `SHA256SUMS.txt`;
- this installation guide.

## Controls

- on-screen arrows: move and turn;
- drag the open scene: orbit the camera;
- pinch: adjust camera distance inside the bounded test range;
- `RECENTER CAMERA`: restore the behind-hero view;
- `INTERACT`: complete HQ → Mara pickup → customer handoff.
- Android Back: reset active controls and exit `DROPi Babylon Eval` through the
  existing native WebView bridge. A standalone browser does not synthesize a
  navigation or exit action.

## Owner evidence

Complete the route at least once and return:

- one landscape screenshot with the HUD build prefix and telemetry visible;
- the Android device model and Android/System WebView versions;
- whether the route completed without getting stuck;
- any player/building or camera/façade clipping location;
- typical `avg FPS`, `p95` frame time and `slow` percentage after at least two
  minutes;
- whether orbit, pinch, recenter, touch movement, Android Back and
  background/resume behave correctly;
- optionally, one short landscape screen recording around a building corner.

DT-00 will classify `PRESENCE`, `SCALE`, `CAMERA`, `MOTION`,
`WORLD READABILITY`, `LIFE` and `POLISH` as `PASS`, `PARTIAL` or `FAIL`.

## Evidence boundary

The APK is debug-signed and exists only for internal owner evaluation. It is
not eligible for Google Play, production promotion or marketing as authentic
gameplay. A green GitHub build proves reproducible packaging; only the physical
Android test supplies device and visual evidence.
