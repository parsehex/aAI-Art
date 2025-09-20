import { presetTextures } from '@/data/preset-textures'
import { TextureGenerator } from '@/utils/TextureGenerator'
import { SpriteViewer } from '@/game/ui/SpriteViewer'
import { useTexturesStore } from '@/stores/textures'

export default class MainScene extends Phaser.Scene {
  private textureGenerator: TextureGenerator
  private spriteViewer!: SpriteViewer

  constructor() {
    super({ key: 'MainScene' })
    this.textureGenerator = new TextureGenerator(this)
  }

  create() {
    const store = useTexturesStore()
    store.load()
    this.spriteViewer = new SpriteViewer(
      this,
      this.textureGenerator,
      presetTextures,
      store.generatedTextures,
    )

    this.scale.on('resize', this.handleResize, this)

    window.addEventListener('newTexture', (event: Event) => {
      const customEvent = event as CustomEvent<TextureDescription>
      const newTexture = customEvent.detail


      // Add the new sprite to the list
      const store = useTexturesStore()
      store.addGeneratedTexture(newTexture)
      // No need for reload() as Vue list will update reactively
      this.spriteViewer.combineTextures()
      // Auto-select and display the new sprite in the scene
      window.dispatchEvent(new CustomEvent('spriteSelected', { detail: newTexture }))
    })
  }

  handleResize(gameSize: Phaser.Structs.Size) {
    const { width, height } = gameSize
    this.cameras.main.setSize(width, height)

    if (this.spriteViewer) {
      this.spriteViewer.updateButtonPositions(width, height)
      this.spriteViewer.reload()
    }
  }
}
