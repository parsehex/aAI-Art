import { parseColor } from '@/utils'
import type { TextureGenerator } from '@/utils/TextureGenerator'

export class SpriteViewer {
  private scene: Phaser.Scene
  private textureGenerator: TextureGenerator
  private currentPage: number = 0
  private itemsPerPage: number = 12
  private prevButton?: Phaser.GameObjects.Text
  private nextButton?: Phaser.GameObjects.Text
  private allTextures: TextureDescription[]

  constructor(
    scene: Phaser.Scene,
    textureGenerator: TextureGenerator,
    allTextures: TextureDescription[],
  ) {
    this.scene = scene
    this.textureGenerator = textureGenerator
    this.allTextures = [...allTextures]
    this.createPaginationButtons()
    this.loadPage()
  }

  public reload() {
    this.loadPage()
  }

  private loadPage() {
    this.scene.children.removeAll()
    const start = this.currentPage * this.itemsPerPage
    const end = start + this.itemsPerPage
    const pageTextures = this.allTextures.slice(start, end)

    pageTextures.forEach((texture, index) => {
      const x = (index % 4) * 200 + 100
      const y = Math.floor(index / 4) * 200 + 75
      const sprite = this.textureGenerator.createGameObject(texture, x, y)

      if (texture.generated) {
        sprite.preFX?.addGlow(parseColor('#FDE047'), 4, 0, false);
      }

      sprite.setInteractive()
      sprite.on('pointerdown', () => {
        window.dispatchEvent(new CustomEvent('spriteSelected', { detail: texture }))
      })
      sprite.on('pointerover', () => {
        const label = this.scene.add.text(sprite.x - 50, sprite.y - 50, texture.name, { fontSize: '12px', backgroundColor: '#000', color: '#fff' })
        sprite.on('pointerout', () => label.destroy())
      })
    })

    this.updateButtonStates()
  }

  private createPaginationButtons() {
    this.prevButton = this.scene.add
      .text(50, 550, 'Prev Page', { fontSize: '18px' })
      .setInteractive()
      .on('pointerdown', () => {
        if (this.currentPage > 0) {
          this.currentPage--
          this.loadPage()
        }
      })

    this.nextButton = this.scene.add
      .text(650, 550, 'Next Page', { fontSize: '18px' })
      .setInteractive()
      .on('pointerdown', () => {
        if ((this.currentPage + 1) * this.itemsPerPage < this.allTextures.length) {
          this.currentPage++
          this.loadPage()
        }
      })
  }

  private updateButtonStates() {
    if (this.prevButton) this.prevButton.destroy()
    if (this.nextButton) this.nextButton.destroy()
    this.createPaginationButtons()

    this.prevButton?.setStyle({ fill: this.currentPage === 0 ? '#555' : '#fff' })
    this.prevButton?.setInteractive(this.currentPage !== 0)

    this.nextButton?.setStyle({
      fill: (this.currentPage + 1) * this.itemsPerPage >= this.allTextures.length ? '#555' : '#fff',
    })
    this.nextButton?.setInteractive(
      (this.currentPage + 1) * this.itemsPerPage < this.allTextures.length,
    )
  }
}
