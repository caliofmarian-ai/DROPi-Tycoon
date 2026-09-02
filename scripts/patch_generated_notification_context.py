from pathlib import Path

path = Path('game-web/src/scenes/GameWorldScene.ts')
text = path.read_text()
old = """      currentStatus as import('../types/game').OrderStatus,
    )
"""
new = """      currentStatus as import('../types/game').OrderStatus,
      this.worldState.activeOrder,
    )
"""
if text.count(old) != 1:
    raise RuntimeError(f'Expected one notification update call, found {text.count(old)}')
path.write_text(text.replace(old, new, 1))
print('Generated-order notification context patch: PASS')
