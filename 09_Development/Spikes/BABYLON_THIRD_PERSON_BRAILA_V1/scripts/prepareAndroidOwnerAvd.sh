#!/usr/bin/env bash
# Source this file in the emulator step: exported paths must survive through boot.
# ANDROID_HOME is the SDK installation, not the legacy ANDROID_SDK_HOME below.
# Reference: https://developer.android.com/tools/variables
if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  echo 'Source prepareAndroidOwnerAvd.sh in the emulator shell; do not execute it.' >&2
  exit 2
fi

: "${RUNNER_TEMP:?RUNNER_TEMP is required}"
: "${AVDMANAGER:?AVDMANAGER is required}"
: "${EMULATOR:?EMULATOR is required}"
if [[ ! -x "$AVDMANAGER" || ! -x "$EMULATOR" ]]; then
  echo 'Android AVD manager and emulator executables are required.' >&2
  return 1
fi

# One fresh root for modern SDK tools, older tools, and the native emulator.
# Never modify HOME or the SDK installation, or reuse a stale AVD registry.
DROPI_AVD_USER_ROOT="$(mktemp -d "$RUNNER_TEMP/dropi-android-home.XXXXXX")" || return
export ANDROID_SDK_HOME="$DROPI_AVD_USER_ROOT"
export ANDROID_USER_HOME="$ANDROID_SDK_HOME/.android"
export ANDROID_EMULATOR_HOME="$ANDROID_USER_HOME"
export ANDROID_AVD_HOME="$ANDROID_USER_HOME/avd"
mkdir -p "$ANDROID_AVD_HOME" || return
DROPI_AVD_PATH="$ANDROID_AVD_HOME/dropi_owner_ci.avd"

"$AVDMANAGER" create avd --force --name dropi_owner_ci \
  --package 'system-images;android-35;google_apis;x86_64' \
  --path "$DROPI_AVD_PATH" <<< 'no' || return

# A successful avdmanager exit alone did not prove native-emulator discovery.
# Do not manufacture registry files to hide a failed AVD creation.
if [[ ! -s "$ANDROID_AVD_HOME/dropi_owner_ci.ini" || ! -s "$DROPI_AVD_PATH/config.ini" ]]; then
  echo "AVD creation did not produce the expected registry/config under $ANDROID_AVD_HOME" >&2
  return 1
fi
if ! grep -Fxq "path=$DROPI_AVD_PATH" "$ANDROID_AVD_HOME/dropi_owner_ci.ini"; then
  echo 'AVD registry does not point to the exact newly created device.' >&2
  return 1
fi
"$EMULATOR" -list-avds > "$RUNNER_TEMP/dropi-avd-list.txt" || return
cat "$RUNNER_TEMP/dropi-avd-list.txt"
if ! grep -Fxq 'dropi_owner_ci' "$RUNNER_TEMP/dropi-avd-list.txt"; then
  echo 'Native emulator cannot discover dropi_owner_ci; refusing to start/install.' >&2
  return 1
fi
printf 'AVD_DISCOVERY=PASS\nANDROID_AVD_HOME=%s\n' "$ANDROID_AVD_HOME"
