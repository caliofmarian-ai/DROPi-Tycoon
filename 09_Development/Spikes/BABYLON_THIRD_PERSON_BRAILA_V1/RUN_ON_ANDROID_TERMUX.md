# Run Babylon Brăila Spike on Android via Termux

This runs the exact static spike build locally on the Android device. It does not publish the spike and does not touch Railway production.

## 1. Download

From GitHub Actions, download the latest artifact named:

`dropi-babylon-third-person-braila-v1`

Use the latest successful `Babylon Third-Person Brăila Spike` run for draft PR
#712. The artifact metadata and the HUD build SHA must both match the PR head
being evaluated. The downloaded ZIP is normally placed in Android `Download/`.

## 2. One-copy Termux command

Paste the whole block into Termux:

```bash
set -eu
pkg update -y
pkg install -y python unzip findutils coreutils
termux-setup-storage >/dev/null 2>&1 || true
DROPISPIKE_DOWNLOADS="${HOME:?}/storage/downloads"
DROPISPIKE_ZIP="$(find "$DROPISPIKE_DOWNLOADS" -maxdepth 1 -type f -iname 'dropi-babylon-third-person-braila-v1*.zip' -printf '%T@ %p\n' 2>/dev/null | sort -nr | head -n 1 | cut -d' ' -f2-)"
if [ -z "$DROPISPIKE_ZIP" ]; then
  echo 'Artifact ZIP not found in Android Download folder.'
  echo 'Download dropi-babylon-third-person-braila-v1 from GitHub Actions, then run this block again.'
  exit 1
fi
DROPISPIKE_TMP_ROOT="${PREFIX:?}/tmp"
mkdir -p "$DROPISPIKE_TMP_ROOT"
DROPISPIKE_DIR="$(mktemp -d "$DROPISPIKE_TMP_ROOT/dropi-babylon-spike.XXXXXX")"
unzip -q "$DROPISPIKE_ZIP" -d "$DROPISPIKE_DIR"
DROPISPIKE_DIST="$(find "$DROPISPIKE_DIR" -type f -path '*/dist/index.html' -printf '%h\n' | head -n 1)"
if [ -z "$DROPISPIKE_DIST" ]; then
  echo 'Artifact is invalid: dist/index.html was not found.'
  exit 1
fi
if [ ! -r "$DROPISPIKE_DIST/build-evidence.txt" ]; then
  echo 'Artifact is invalid: dist/build-evidence.txt was not found.'
  exit 1
fi
DROPISPIKE_PID_FILE="$DROPISPIKE_TMP_ROOT/dropi-babylon-spike-server.pid"
if [ -r "$DROPISPIKE_PID_FILE" ]; then
  DROPISPIKE_OLD_PID="$(tr -cd '0-9' < "$DROPISPIKE_PID_FILE")"
  if [ -n "$DROPISPIKE_OLD_PID" ] && [ -r "/proc/$DROPISPIKE_OLD_PID/cmdline" ]; then
    DROPISPIKE_OLD_CMD="$(tr '\000' ' ' < "/proc/$DROPISPIKE_OLD_PID/cmdline")"
    case "$DROPISPIKE_OLD_CMD" in
      *'python -m http.server 8080'*)
        kill "$DROPISPIKE_OLD_PID" 2>/dev/null || true
        for DROPISPIKE_WAIT in 1 2 3 4 5 6 7 8 9 10; do
          kill -0 "$DROPISPIKE_OLD_PID" 2>/dev/null || break
          sleep 0.2
        done
        ;;
    esac
  fi
fi
cd "$DROPISPIKE_DIST"
nohup python -m http.server 8080 --bind 127.0.0.1 >"$DROPISPIKE_DIR/server.log" 2>&1 &
DROPISPIKE_NEW_PID=$!
printf '%s\n' "$DROPISPIKE_NEW_PID" > "$DROPISPIKE_PID_FILE"
sleep 2
if ! kill -0 "$DROPISPIKE_NEW_PID" 2>/dev/null; then
  echo 'Local preview server failed to start.'
  tail -n 20 "$DROPISPIKE_DIR/server.log"
  exit 1
fi
python -c "import urllib.request; data=urllib.request.urlopen('http://127.0.0.1:8080/', timeout=5).read(); assert b'NON-AUTHORITATIVE VISUAL SPIKE' in data and b'RECENTER CAMERA' in data"
am start -a android.intent.action.VIEW -d 'http://127.0.0.1:8080/' >/dev/null 2>&1 || true
echo 'DROPi Tycoon Babylon spike: http://127.0.0.1:8080/'
echo "Artifact: $DROPISPIKE_ZIP"
echo "Server log: $DROPISPIKE_DIR/server.log"
cat "$DROPISPIKE_DIST/build-evidence.txt"
```

If Android asks Termux for storage permission after `termux-setup-storage`, grant it once and rerun the block.

## Controls

- on-screen arrows: move/turn;
- drag the open scene: orbit camera;
- pinch: camera distance within the bounded test range;
- `RECENTER CAMERA`: smoothly restore the behind-hero view;
- `INTERACT`: HQ -> Mara pickup -> customer handoff;
- the HUD shows exact build prefix, rolling average FPS, p95 frame time,
  slow-frame percentage, render size/orientation and camera collision state.

## What to judge

Judge only the experience family at this stage:

1. Does it feel like third-person rather than a top-down map?
2. Does the hero feel human-scale relative to roads, doors, cars and buildings?
3. Do buildings surround the hero at full height?
4. Does the camera avoid entering façades when the hero walks close to buildings
   and rotates beside corners?
5. Is camera/movement understandable and reasonably smooth on the device?
6. Is this fundamentally closer to the approved V2 film direction than the current Phaser Scene2D presentation?

Do not judge final art quality yet. This is procedural graybox geometry.

## Evidence to return

After at least one complete HQ -> Mara -> customer route, return:

- one landscape screenshot with the HUD build prefix and telemetry visible;
- device model and Android/Chrome versions;
- whether the full route completed without getting stuck;
- any player/building or camera/façade clipping location;
- typical `avg FPS`, `p95` frame time and `slow` percentage after at least
  two minutes;
- a short description of camera rotation, recentering and touch response.

The architecture review will classify `PRESENCE`, `SCALE`, `CAMERA`, `MOTION`,
`WORLD READABILITY`, `LIFE` and `POLISH` as `PASS`, `PARTIAL` or `FAIL`. The
owner does not need to assign those statuses manually.

## Truth boundary

`NON-AUTHORITATIVE VISUAL SPIKE — NOT AUTHENTIC GAMEPLAY`

The route does not settle real game economy, persistence, XP or loyalty.
