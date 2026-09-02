from pathlib import Path

path = Path('game-web/src/scenes/GameWorldScene.ts')
text = path.read_text()


def replace_once(old: str, new: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'Expected one match, found {count}: {old!r}')
    text = text.replace(old, new, 1)


replace_once(
    '  private cameraGestureController: CameraGestureController | null = null\n  private pointerUpHandler:',
    '  private cameraGestureController: CameraGestureController | null = null\n  private cameraRotation = 0\n  private pointerUpHandler:',
)
replace_once(
    "      case 'rotate-left':\n        camera.setRotation(rotateByStep(camera.rotation, 'left'))\n        return",
    "      case 'rotate-left':\n        this.cameraRotation = rotateByStep(this.cameraRotation, 'left')\n        camera.setRotation(this.cameraRotation)\n        return",
)
replace_once(
    "      case 'rotate-right':\n        camera.setRotation(rotateByStep(camera.rotation, 'right'))\n        return",
    "      case 'rotate-right':\n        this.cameraRotation = rotateByStep(this.cameraRotation, 'right')\n        camera.setRotation(this.cameraRotation)\n        return",
)
replace_once(
    "      case 'recenter':\n        camera.setRotation(0)\n        camera.startFollow(this.player, false, 1, 1)",
    "      case 'recenter':\n        this.cameraRotation = 0\n        camera.setRotation(0)\n        camera.startFollow(this.player, false, 1, 1)",
)
replace_once(
    "      getRotation: () => this.cameras.main.rotation,\n      setRotation: (rotation) => this.cameras.main.setRotation(rotation),",
    "      getRotation: () => this.cameraRotation,\n      setRotation: (rotation) => {\n        this.cameraRotation = rotation\n        this.cameras.main.setRotation(rotation)\n      },",
)
replace_once(
    '    const cos = Math.cos(camera.rotation)\n    const sin = Math.sin(camera.rotation)',
    '    const cos = Math.cos(this.cameraRotation)\n    const sin = Math.sin(this.cameraRotation)',
)

path.write_text(text)
print('Strict camera rotation state patch complete')
