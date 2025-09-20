import { delay } from '@/utils'
import type { TextureGenerator } from '@/utils/TextureGenerator'
import { useTexturesStore } from '@/stores/textures'

export class SpriteViewer {
  private scene: Phaser.Scene
  private textureGenerator: TextureGenerator
  private presetTextures: TextureDescription[]
  private generatedTextures: TextureDescription[]
  private allTextures!: TextureDescription[]
  private selectedSprite: TextureDescription | null = null
  private saveButton?: Phaser.GameObjects.Text

  constructor(
    scene: Phaser.Scene,
    textureGenerator: TextureGenerator,
    presetTextures: TextureDescription[],
    generatedTextures: TextureDescription[],
  ) {
    this.scene = scene
    // Disable right-click context menu on the game canvas.
    this.scene.game.input.mouse?.disableContextMenu()
    this.textureGenerator = textureGenerator
    this.presetTextures = presetTextures
    this.generatedTextures = generatedTextures
    this.combineTextures()

    // We've removed any phaser grid rendering – our Vue SpriteList now shows all sprites.
    // Listen for the spriteSelected event to render the sprite.
    window.addEventListener('spriteSelected', async (event: Event) => {
      const customEvent = event as CustomEvent<TextureDescription>
      this.selectedSprite = customEvent.detail
      this.clearScene()
      await this.showSelectedSprite()
    })

    // Clear the currently selected sprite when told.
    window.addEventListener('spriteCleared', () => {
      this.selectedSprite = null
      this.clearScene()
    })
  }

  // Combines the preset and generated textures.
  public combineTextures() {
    this.allTextures = [...this.presetTextures, ...this.generatedTextures]
  }

  // Reload is called when textures change or on navigation.
  public reload() {
    if (!this.selectedSprite) return
    this.showSelectedSprite()
  }

  private clearScene(scene = this.scene) {
    // Destroy all children that were added by this viewer.
    scene.children.each((child) => {
      // We use an identifying flag (data key) to mark objects this viewer added.
      if (child.getData('spriteViewer')) {
        child.destroy()
      }
    })
  }

  // Displays the selected sprite enlarged plus UI controls.
  private async showSelectedSprite() {
    if (!this.selectedSprite) return

    this.clearScene()

    const { width, height } = this.scene.scale.gameSize
    const x = width / 2
    const y = height / 3

    // Create a large sprite (3x scale) that is not interactive.
    const largeSprite = this.textureGenerator.createGameObject(this.selectedSprite, x, y, {
      scale: 3,
      isInteractive: false,
    })
    largeSprite.setData('spriteViewer', true)

    // Create Save button.
    this.createSaveButton(largeSprite)
  }

  private createSaveButton(sprite: Phaser.GameObjects.Sprite) {
    const { width, height } = this.scene.scale.gameSize
    this.saveButton = this.scene.add
      .text(width / 2 - 50, height - 50, 'Save Sprite', {
        fontSize: '18px',
        backgroundColor: '#222',
        color: '#fff',
        padding: { x: 10, y: 5 },
      })
      .setInteractive()
      .setData('spriteViewer', true)
      .on('pointerdown', () => {
        this.exportSprite(sprite)
      })
  }

  private exportSprite(sprite: Phaser.GameObjects.Sprite) {
    if (!this.selectedSprite) return

    const bounds = sprite.getBounds()
    const spriteName = this.selectedSprite.name

    this.scene.game.renderer.snapshotArea(
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      (image) => {
        const a = document.createElement('a')
        a.href = (image as HTMLImageElement).src
        a.download = spriteName + '.png' || 'sprite.png'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      },
      'image/png',
      1.0,
    )
  }

  public async getThumbnail(def: TextureDescription): Promise<string> {
    return new Promise((resolve) => {
      const offscreenScene = this.textureGenerator['offscreenScene']
      if (!offscreenScene) {
        resolve('') // Or throw an error
        return
      }

      this.clearScene(offscreenScene)
      const { width, height } = offscreenScene.scale.gameSize
      const x = width / 2
      const y = height / 2
      const sprite = this.textureGenerator.createGameObject(def, x, y, {
        scale: 3,
        isInteractive: false,
        background: true, // Use the background scene for thumbnail generation
      })
      sprite.setData('spriteViewer', true)

      const bounds = sprite.getBounds()
      offscreenScene.game.renderer.snapshotArea(
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
        (image) => {
          const dataURL = (image as HTMLImageElement).src as string
          resolve(dataURL)
        },
        'image/png',
        1.0,
      )
    })
  }

  // Called by the scene on a resize.
  public updateButtonPositions(width: number, height: number) {
    if (this.saveButton) this.saveButton.setPosition(width / 2 - 50, height - 100)
  }
}
