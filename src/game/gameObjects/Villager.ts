import { GameObject } from './GameObject'

export class Villager extends GameObject {
  private isInteractive: boolean = false

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture)

    this.setSpeed(2) // Set default speed
    this.initialize()
  }

  private initialize(): void {
    // Make the villager interactive
    this.setInteractive({ useHandCursor: true })

    // Add click/tap handler
    this.on('pointerdown', this.onClick, this)

    // Add hover effects
    this.on('pointerover', () => {
      this.setTint(0xff9999)
    })

    this.on('pointerout', () => {
      this.clearTint()
    })
  }

  private onClick(): void {
    // Handle click events
    console.log('Villager clicked!')
    // You could emit an event, show a dialog, etc.
  }

  // Add specific villager behaviors
  public wander(): void {
    // Simple random movement example
    const direction = Math.floor(Math.random() * 4)
    switch (direction) {
      case 0:
        this.moveLeft()
        break
      case 1:
        this.moveRight()
        break
      case 2:
        this.moveUp()
        break
      case 3:
        this.moveDown()
        break
    }
  }

  // Example of a custom behavior
  public speak(message: string): void {
    // Create a simple speech bubble
    const text = this.scene.add.text(this.x, this.y - this.height, message, {
      backgroundColor: '#ffffff',
    })

    // Make the speech bubble disappear after 2 seconds
    this.scene.time.delayedCall(2000, () => {
      text.destroy()
    })
  }

  // Update method for continuous behavior
  update(): void {
    // Add any per-frame update logic here
  }
}
