import Phaser from 'phaser'

export class CompanyManagementScene extends Phaser.Scene {
  constructor() {
    super('CompanyManagement')
  }

  create(): void {
    const { width, height } = this.scale

    this.cameras.main.setBackgroundColor('#162032')

    this.add
      .text(width / 2, 130, 'Company Management', {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.add
      .text(
        width / 2,
        260,
        'Placeholder navigation only.\nManagement gameplay is not expanded in this milestone.',
        {
          fontFamily: 'Arial',
          fontSize: '28px',
          color: '#dbeafe',
          align: 'center',
        },
      )
      .setOrigin(0.5)

    this.createButton(width / 2, height - 180, 'Open Game World', () => this.scene.start('GameWorld'))
    this.createButton(width / 2, height - 85, 'Back to Main Menu', () => this.scene.start('MainMenu'))
  }

  private createButton(x: number, y: number, label: string, onTap: () => void): void {
    const button = this.add
      .rectangle(x, y, 360, 72, 0x0f766e, 1)
      .setStrokeStyle(3, 0x99f6e4)
      .setInteractive({ useHandCursor: true })

    const text = this.add
      .text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: '28px',
        color: '#ecfeff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    button.on('pointerdown', onTap)
    text.setInteractive({ useHandCursor: true }).on('pointerdown', onTap)
  }
}
