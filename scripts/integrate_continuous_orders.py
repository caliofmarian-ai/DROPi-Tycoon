from pathlib import Path

path = Path('game-web/src/scenes/GameWorldScene.ts')
text = path.read_text()


def replace_once(old: str, new: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'Expected exactly one match, found {count}: {old[:120]!r}')
    text = text.replace(old, new, 1)


replace_once(
    "import { settleDeliveryOutcome } from '../systems/economySettlement'\n",
    "import { settleDeliveryOutcome } from '../systems/economySettlement'\n"
    "import { createNextOrder, pickupPointForOrder } from '../systems/orderGeneration'\n",
)

replace_once(
    "  private readonly packagePosition = new Phaser.Math.Vector2(120, 440)\n\n  private gameHUD!: GameHUD\n",
    "  private readonly packagePosition = new Phaser.Math.Vector2(120, 440)\n\n"
    "  private packageSprite!: Phaser.GameObjects.Image\n\n"
    "  private gameHUD!: GameHUD\n",
)

replace_once(
    "    replaceGameSession(this.worldState, this.companyState)\n\n"
    "    this.cameras.main.setBackgroundColor('#91d0ff')\n",
    "    replaceGameSession(this.worldState, this.companyState)\n\n"
    "    const initialPickupPoint = pickupPointForOrder(this.worldState.activeOrder)\n"
    "    this.packagePosition.set(initialPickupPoint.x, initialPickupPoint.y)\n\n"
    "    this.cameras.main.setBackgroundColor('#91d0ff')\n",
)

replace_once(
    "    this.add.image(this.packagePosition.x, this.packagePosition.y, 'package_delivery')\n",
    "    this.packageSprite = this.add.image(\n"
    "      this.packagePosition.x,\n"
    "      this.packagePosition.y,\n"
    "      'package_delivery',\n"
    "    )\n",
)

replace_once(
    "      expectedPickupLocation: 'PickupZone',\n",
    "      expectedPickupLocation: this.worldState.activeOrder.pickupLocation,\n",
)

replace_once(
    "    this.worldState.activeOrder = pickupAttempt.order\n"
    "    this.worldState.player = pickupAttempt.player\n"
    "    this.emitNotificationIfTransitioned(previousStatus, this.worldState.activeOrder.status)\n",
    "    this.worldState.activeOrder = pickupAttempt.order\n"
    "    this.worldState.player = pickupAttempt.player\n"
    "    if (previousStatus !== 'PickedUp' && this.worldState.activeOrder.status === 'PickedUp') {\n"
    "      this.packageSprite.setVisible(false)\n"
    "    }\n"
    "    this.emitNotificationIfTransitioned(previousStatus, this.worldState.activeOrder.status)\n",
)

old_settlement = """      if (settlement.applied) {
        const session = replaceGameSession(this.worldState, this.companyState)
        const storage = getBrowserSaveStorage()
        if (storage) {
          const autosaveEvent =
            this.worldState.activeOrder.status === 'Completed'
              ? 'delivery-completed'
              : 'progression-changed'
          autosaveIfApproved(storage, session, autosaveEvent)
        }
      }
"""
new_settlement = """      if (settlement.applied) {
        const session = replaceGameSession(this.worldState, this.companyState)
        const storage = getBrowserSaveStorage()
        if (storage) {
          const autosaveEvent =
            this.worldState.activeOrder.status === 'Completed'
              ? 'delivery-completed'
              : 'progression-changed'
          autosaveIfApproved(storage, session, autosaveEvent)
        }
        this.spawnNextAvailableOrder()
      }
"""
replace_once(old_settlement, new_settlement)

anchor = """  private emitNotificationIfTransitioned(
    _previousStatus: string,
    currentStatus: string,
  ): void {
"""
method = """  private spawnNextAvailableOrder(): void {
    const terminalOrder = this.worldState.activeOrder
    if (
      (terminalOrder.status !== 'Completed' && terminalOrder.status !== 'Failed') ||
      !terminalOrder.economySettled
    ) {
      return
    }

    const nextOrder = createNextOrder(terminalOrder)
    const pickupPoint = pickupPointForOrder(nextOrder)
    this.worldState.activeOrder = nextOrder
    this.worldState.player = {
      ...this.worldState.player,
      currentOrder: '',
      carryingPackage: false,
    }
    this.worldState.pendingDeliveryDestination = ''
    this.packagePosition.set(pickupPoint.x, pickupPoint.y)
    this.packageSprite.setPosition(pickupPoint.x, pickupPoint.y).setVisible(true)

    const notificationReset = updateNotification(this.notificationState, 'Available')
    this.notificationState = notificationReset.state
    replaceGameSession(this.worldState, this.companyState)
    this.gameHUD.update(buildHUDData(this.worldState, this.companyState))
  }

""" + anchor
replace_once(anchor, method)

path.write_text(text)
print('Continuous order GameWorld integration: PASS')
