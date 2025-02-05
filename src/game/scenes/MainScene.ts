import { presetTextures } from '@/data/preset-textures'
import { TextureGenerator } from '@/utils/TextureGenerator'
import { generatedTextures } from '@/data/generated-textures'
import { SpriteViewer } from '@/game/ui/SpriteViewer'

export default class MainScene extends Phaser.Scene {
  private textureGenerator: TextureGenerator
  private spriteViewer!: SpriteViewer

  constructor() {
    super({ key: 'MainScene' })
    this.textureGenerator = new TextureGenerator(this)
  }

  create() {
    this.loadGeneratedTextures()
    this.spriteViewer = new SpriteViewer(this, this.textureGenerator, [
      ...presetTextures,
      ...generatedTextures,
    ])

    this.scale.on('resize', this.handleResize, this);

    window.addEventListener('newTexture', (event: Event) => {
      const customEvent = event as CustomEvent<TextureDescription>
      const newTexture = customEvent.detail

      // Add the new sprite to the list
      generatedTextures.push(newTexture)
      this.saveGeneratedTextures()

      // Reload the scene to include the new sprite
      this.spriteViewer.reload()
    })
  }

  handleResize(gameSize: Phaser.Structs.Size) {
    const { width, height } = gameSize;
    this.cameras.main.setSize(width, height);

    if (this.spriteViewer) {
      this.spriteViewer.updateButtonPositions(width, height);
    }
  }


  loadGeneratedTextures() {
    const savedTextures = localStorage.getItem('generatedTextures')
    if (savedTextures) {
      const data = JSON.parse(savedTextures)
      const arr = Array.isArray(data) ? data.map((t) => ({...t, generated: true})) : [];
      generatedTextures.push(...arr)
    }
  }

  saveGeneratedTextures() {
    localStorage.setItem('generatedTextures', JSON.stringify(generatedTextures))
  }
}
