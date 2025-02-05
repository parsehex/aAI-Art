import { presetTextures } from '@/data/preset-textures'
import { TextureGenerator } from '@/utils/TextureGenerator'
import { generatedTextures } from '@/data/generated-textures'

export default class MainScene extends Phaser.Scene {
  private textureGenerator: TextureGenerator
  private currentPage: number = 0
  private itemsPerPage: number = 12
  private prevButton: Phaser.GameObjects.Text | undefined
  private nextButton: Phaser.GameObjects.Text | undefined

  constructor() {
    super({ key: 'MainScene' })
    this.textureGenerator = new TextureGenerator(this)
  }

  create() {
    this.loadGeneratedTextures()
    this.loadPage()
    this.updateButtons()

    window.addEventListener('newTexture', (event: Event) => {
      const customEvent = event as CustomEvent<TextureDescription>
      const newTexture = customEvent.detail

      // Add the new sprite to the list
      generatedTextures.push(newTexture)
      this.saveGeneratedTextures()

      // Reload the scene to include the new sprite
      this.loadPage()
      this.updateButtons()
    })
  }

  loadGeneratedTextures() {
    const savedTextures = localStorage.getItem('generatedTextures')
    if (savedTextures) {
      generatedTextures.push(...JSON.parse(savedTextures))
    }
  }

  saveGeneratedTextures() {
    localStorage.setItem('generatedTextures', JSON.stringify(generatedTextures))
  }

  loadPage() {
    this.children.removeAll()

    const allTextures = [...presetTextures, ...generatedTextures]
    const start = this.currentPage * this.itemsPerPage
    const end = start + this.itemsPerPage
    const pageTextures = allTextures.slice(start, end)

    pageTextures.forEach((texture, index) => {
      const x = (index % 4) * 200 + 100
      const y = Math.floor(index / 4) * 200 + 100
      const sprite = this.textureGenerator.createGameObject(texture, x, y)

      sprite.setInteractive()
      sprite.on('pointerdown', () => {
        window.dispatchEvent(new CustomEvent('spriteSelected', { detail: texture }))
      })

      if (generatedTextures.includes(texture)) {
        sprite.setTint(0xffcc00) // Highlight generated textures
      }
    })
  }

  updateButtons() {
    if (this.prevButton) this.prevButton.destroy()
    if (this.nextButton) this.nextButton.destroy()

    const totalTextures = presetTextures.length + generatedTextures.length

    this.prevButton = this.add
      .text(50, 550, 'Prev Page', { fontSize: '18px' })
      .setInteractive()
      .on('pointerdown', () => {
        if (this.currentPage > 0) {
          this.currentPage--
          this.loadPage()
          this.updateButtons()
        }
      })

    this.nextButton = this.add
      .text(650, 550, 'Next Page', { fontSize: '18px' })
      .setInteractive()
      .on('pointerdown', () => {
        if ((this.currentPage + 1) * this.itemsPerPage < totalTextures) {
          this.currentPage++
          this.loadPage()
          this.updateButtons()
        }
      })

    this.updateButtonStates()
  }

  updateButtonStates() {
    const totalTextures = presetTextures.length + generatedTextures.length

    if (this.currentPage === 0) {
      this.prevButton?.setStyle({ fill: '#555' }).setInteractive(false)
    } else {
      this.prevButton?.setStyle({ fill: '#fff' }).setInteractive(true)
    }

    if ((this.currentPage + 1) * this.itemsPerPage >= totalTextures) {
      this.nextButton?.setStyle({ fill: '#555' }).setInteractive(false)
    } else {
      this.nextButton?.setStyle({ fill: '#fff' }).setInteractive(true)
    }
  }
}
