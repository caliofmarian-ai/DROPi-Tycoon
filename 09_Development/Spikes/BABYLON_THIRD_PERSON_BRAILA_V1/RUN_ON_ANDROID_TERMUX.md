# Run Babylon Brăila Spike on Android via Termux

This runs the exact static spike build locally on the Android device. It does not publish the spike and does not touch Railway production.

## 1. Download

From GitHub Actions, download the latest artifact named:

`dropi-babylon-third-person-braila-v1`

The downloaded file is normally placed in Android `Download/`.

## 2. One-copy Termux command

Paste the whole block into Termux:

```bash
set -e
pkg update -y
pkg install -y python unzip
termux-setup-storage >/dev/null 2>&1 || true
rm -rf "$HOME/dropi-babylon-spike"
mkdir -p "$HOME/dropi-babylon-spike"
ZIP="$(find "$HOME/storage/downloads" -maxdepth 1 -type f \( -iname 'dropi-babylon-third-person-braila-v1*.zip' -o -iname 'dropi-babylon-third-person-braila-v1*' \) -print 2>/dev/null | head -n 1)"
if [ -z "$ZIP" ]; then
  echo 'Artifact ZIP not found in Android Download folder.'
  echo 'Download dropi-babylon-third-person-braila-v1 from GitHub Actions, then run this block again.'
  exit 1
fi
unzip -o "$ZIP" -d "$HOME/dropi-babylon-spike" >/dev/null
cd "$HOME/dropi-babylon-spike/dist"
pkill -f 'python -m http.server 8080' >/dev/null 2>&1 || true
nohup python -m http.server 8080 --bind 127.0.0.1 >"$HOME/dropi-babylon-spike/server.log" 2>&1 &
sleep 2
am start -a android.intent.action.VIEW -d 'http://127.0.0.1:8080/' >/dev/null 2>&1 || true
echo 'DROPi Tycoon Babylon spike: http://127.0.0.1:8080/'
echo 'Server log: ~/dropi-babylon-spike/server.log'
```

If Android asks Termux for storage permission after `termux-setup-storage`, grant it once and rerun the block.

## Controls

- on-screen arrows: move/turn;
- `INTERACT`: HQ -> Mara pickup -> customer handoff;
- the HUD shows current objective and FPS.

## What to judge

Judge only the experience family at this stage:

1. Does it feel like third-person rather than a top-down map?
2. Does the hero feel human-scale relative to roads, doors, cars and buildings?
3. Do buildings surround the hero at full height?
4. Is camera/movement understandable and reasonably smooth on the device?
5. Is this fundamentally closer to the approved V2 film direction than the current Phaser Scene2D presentation?

Do not judge final art quality yet. This is procedural graybox geometry.

## Truth boundary

`NON-AUTHORITATIVE VISUAL SPIKE — NOT AUTHENTIC GAMEPLAY`

The route does not settle real game economy, persistence, XP or loyalty.
