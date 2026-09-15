import bpy
import importlib
import os
import sys

asset_root = os.environ.get("DROPI_MAKEHUMAN_ASSET_ROOT")
if not asset_root or not os.path.isdir(asset_root):
    raise RuntimeError(f"DROPI_MAKEHUMAN_ASSET_ROOT is not a directory: {asset_root}")

mpfb_module = None
for module_name in list(sys.modules):
    if module_name == "mpfb" or module_name.endswith(".mpfb"):
        candidate = importlib.import_module(module_name)
        if hasattr(candidate, "set_preference"):
            mpfb_module = candidate
            break

if mpfb_module is None:
    raise RuntimeError("Enabled MPFB extension was not loaded by Blender")

if not mpfb_module.set_preference("mpfb_user_data", asset_root):
    raise RuntimeError("Could not set MPFB mpfb_user_data preference")

# CI owns this isolated Blender preference directory, so persisting only this
# controlled preference is safe and makes the next Blender process deterministic.
bpy.ops.wm.save_userpref()
print(f"Configured MPFB user data root: {asset_root}")
