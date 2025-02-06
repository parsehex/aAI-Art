import type { TextureGenerator } from '@/utils/TextureGenerator'

export class SpriteViewer {
  private scene: Phaser.Scene
  private sprites: Phaser.GameObjects.GameObject[] = []
  private textureGenerator: TextureGenerator
  private currentPage: number = 0
  private itemsPerPage: number = 12
  private allTextures: TextureDescription[]
  private selectedSprite: TextureDescription | null = null
  private prevButton?: Phaser.GameObjects.Text
  private nextButton?: Phaser.GameObjects.Text
  private backButton?: Phaser.GameObjects.Text

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

    window.addEventListener('spriteSelected', (event: Event) => {
      const customEvent = event as CustomEvent<TextureDescription>
      this.selectedSprite = customEvent.detail
      this.showSelectedSprite()
    })
  }

  public reload() {
    this.loadPage()
  }

  private clearScene() {
    this.sprites.forEach((obj) => {
      if (!obj) return
      obj.removeAllListeners()
      obj.destroy()
    })
    this.sprites = []

    this.scene.children.each((child) => {
      if (child instanceof Phaser.GameObjects.Text) {
        child.destroy()
      }
    })
  }

  private calculateGrid() {
    const { width, height } = this.scene.scale.gameSize
    const spriteSize = 145
    const padding = 20
    const columns = Math.max(1, Math.floor(width / (spriteSize + padding)))
    const rows = Math.max(1, Math.floor((height - 100) / (spriteSize + padding))) // Leave space for UI

    this.itemsPerPage = columns * rows

    return { columns, rows, spriteSize, padding }
  }

  private loadPage() {
    this.clearScene()

    this.selectedSprite = null
    const { columns, rows, spriteSize, padding } = this.calculateGrid()

    const start = this.currentPage * this.itemsPerPage
    const end = start + this.itemsPerPage
    const pageTextures = this.allTextures.slice(start, end)

    const totalWidth = columns * (spriteSize + padding) - padding
    const totalHeight = rows * (spriteSize + padding) - padding

    const offsetX = (this.scene.scale.gameSize.width - totalWidth) / 2

    const navButtonHeight = 50
    const bottomMargin = 20
    const availableHeight = this.scene.scale.gameSize.height - (navButtonHeight + bottomMargin)
    const offsetY = (availableHeight - totalHeight) / 2

    this.sprites = pageTextures.map((texture, index) => {
      const col = index % columns
      const row = Math.floor(index / columns)

      const x = col * (spriteSize + padding) + spriteSize / 2 + offsetX
      const y = row * (spriteSize + padding) + spriteSize / 2 + offsetY

      const sprite = this.textureGenerator.createGameObject(texture, x, y)

      // if (texture.generated) {
      //   sprite.preFX?.addGlow(parseColor('#FDE047'), 4, 0, false)
      // }

      sprite.setInteractive()
      sprite.on('pointerdown', () => {
        window.dispatchEvent(new CustomEvent('spriteSelected', { detail: texture }))
      })

      let label: Phaser.GameObjects.Text | null = null
      sprite.on('pointerover', () => {
        label = this.scene.add.text(sprite.x - 50, sprite.y - 50, texture.name, {
          fontSize: '12px',
          backgroundColor: '#000',
          color: '#fff',
        })
        this.sprites.push(label)
      })
      sprite.on('pointerout', () => {
        label?.destroy()
      })

      this.sprites.push(sprite)
      return sprite
    })

    this.updateButtonStates()
  }

  private showSelectedSprite() {
    if (!this.selectedSprite) return

    this.clearScene()
    const largeSprite = this.textureGenerator.createGameObject(this.selectedSprite, 400, 300, {
      scale: 3,
      isInteractive: false,
    })
    this.sprites.push(largeSprite)

    this.createBackButton()
    this.createNavigationButtons()
  }

  private createBackButton() {
    this.backButton = this.scene.add
      .text(50, 50, 'Back to List', {
        fontSize: '18px',
        backgroundColor: '#222',
        color: '#fff',
        padding: { x: 10, y: 5 },
      })
      .setInteractive()
      .on('pointerdown', () => {
        this.loadPage()
        window.dispatchEvent(new CustomEvent('spriteCleared'))
      })

    this.sprites.push(this.backButton)
  }

  private createNavigationButtons() {
    const { width, height } = this.scene.scale.gameSize
    const index = this.allTextures.indexOf(this.selectedSprite!)

    if (index > 0) {
      this.prevButton = this.scene.add
        .text(50, height - 50, 'Previous', { fontSize: '18px' })
        .setInteractive()
        .on('pointerdown', () => {
          this.selectedSprite = this.allTextures[index - 1]
          this.showSelectedSprite()
        })
      this.sprites.push(this.prevButton)
    }

    if (index < this.allTextures.length - 1) {
      this.nextButton = this.scene.add
        .text(width - 150, height - 50, 'Next', { fontSize: '18px' })
        .setInteractive()
        .on('pointerdown', () => {
          this.selectedSprite = this.allTextures[index + 1]
          this.showSelectedSprite()
        })
      this.sprites.push(this.nextButton)
    }
  }

  private createPaginationButtons() {
    const { width, height } = this.scene.scale.gameSize

    this.prevButton = this.scene.add
      .text(50, height - 50, 'Prev Page', { fontSize: '18px' })
      .setInteractive()
      .on('pointerdown', () => {
        if (this.currentPage > 0) {
          this.currentPage--
          this.loadPage()
        }
      })
    this.prevButton?.setStyle({ fill: this.currentPage === 0 ? '#555' : '#fff' })

    this.sprites.push(this.prevButton)

    this.nextButton = this.scene.add
      .text(width - 150, height - 50, 'Next Page', { fontSize: '18px' })
      .setInteractive()
      .on('pointerdown', () => {
        if ((this.currentPage + 1) * this.itemsPerPage < this.allTextures.length) {
          this.currentPage++
          this.loadPage()
        }
      })
    this.nextButton?.setStyle({
      fill: (this.currentPage + 1) * this.itemsPerPage >= this.allTextures.length ? '#555' : '#fff',
    })

    this.sprites.push(this.nextButton)
  }

  private updateButtonStates() {
    if (this.prevButton) this.prevButton.destroy()
    if (this.nextButton) this.nextButton.destroy()
    this.createPaginationButtons()
  }

  public updateButtonPositions(width: number, height: number) {
    if (this.prevButton) this.prevButton.setPosition(50, height - 50)
    if (this.nextButton) this.nextButton.setPosition(width - 150, height - 50)
    if (this.backButton) this.backButton.setPosition(50, 50)
  }
}
