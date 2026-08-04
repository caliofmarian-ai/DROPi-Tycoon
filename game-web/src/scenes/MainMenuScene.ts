import Phaser from 'phaser'
import { appConfig } from '../config/env'

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenu')
  }

  create(): void {
    const { width, height } = this.scale

    this.cameras.main.setBackgroundColor('#10151d')

    this.add
      .text(width / 2, 120, appConfig.appName, {
        fontFamily: 'Arial',
        fontSize: '54px',
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, 190, `Web Runtime Candidate v${appConfig.appVersion}`, {
        fontFamily: 'Arial',
        fontSize: '26px',
        color: '#cbd5e1',
      })
      .setOrigin(0.5)

    this.add
      .text(
        width / 2,
        270,
        'Android-first prototype.\nEconomy, reputation and delivery rewards active.',
        {
          fontFamily: 'Arial',
          fontSize: '24px',
          color: '#e2e8f0',
          align: 'center',
        },
      )
      .setOrigin(0.5)

    this.createButton(width / 2, height / 2, 'Start Game', () => this.scene.start('GameWorld'))
    this.createButton(width / 2, height / 2 + 110, 'Company Management', () =>
      this.scene.start('CompanyManagement'),
    )
  }

  private createButton(x: number, y: number, label: string, onTap: () => void): void {
    const button = this.add
      .rectangle(x, y, 360, 76, 0x2563eb, 1)
      .setStrokeStyle(3, 0x93c5fd)
      .setInteractive({ useHandCursor: true })

    const text = this.add
      .text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: '30px',
        color: '#eff6ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    button.on('pointerdown', onTap)
    text.setInteractive({ useHandCursor: true }).on('pointerdown', onTap)
  }
}
