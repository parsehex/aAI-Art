import { presetTextures } from '@/data/preset-textures'
import { TextureGenerator } from '@/utils/TextureGenerator'
import { SpriteViewer } from '@/game/ui/SpriteViewer'
import { useTexturesStore } from '@/stores/textures'
import { useAIStore } from '@/stores/ai'
import { GenerateSpriteMessages } from '@/data/prompt'

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

    window.addEventListener('newTexture', async (event: Event) => {
      const customEvent = event as CustomEvent<TextureDescription>
      const newTexture = customEvent.detail

      // Add the new sprite to the list
      const store = useTexturesStore()
      // get thumbnail
      const dataUrl = await this.spriteViewer.getThumbnail(newTexture)
      if (dataUrl) newTexture.thumbnail = dataUrl
      store.addGeneratedTexture(newTexture)
      // No need for reload() as Vue list will update reactively
      this.spriteViewer.combineTextures()
      // Auto-select and display the new sprite in the scene
      window.dispatchEvent(new CustomEvent('spriteSelected', { detail: newTexture }))
    })

    window.addEventListener('regenerateTexture', async (event: Event) => {
      const customEvent = event as CustomEvent<{ id: string; prompt: string }>
      const { id, prompt } = customEvent.detail

      const aiStore = useAIStore()
      if (!aiStore.selectedModel) return

      try {
        const content = await aiStore.generate(
          aiStore.selectedModel,
          GenerateSpriteMessages(prompt),
          { temperature: 0.01 },
        )
        const updatedDesc = JSON.parse(content) as TextureDescription
        updatedDesc.id = id
        updatedDesc.prompt = prompt

        // Get the existing texture to preserve name and other fields
        const store = useTexturesStore()
        const existingIndex = store.generatedTextures.findIndex((t) => t.id === id)
        if (existingIndex > -1) {
          const existing = store.generatedTextures[existingIndex]
          updatedDesc.name = existing.name
          updatedDesc.thumbnail = await this.spriteViewer.getThumbnail(updatedDesc)
          store.updateGeneratedTexture(id, updatedDesc)
          this.spriteViewer.combineTextures()
          window.dispatchEvent(new CustomEvent('spriteSelected', { detail: updatedDesc }))
        }
      } catch (error) {
        console.error('Error regenerating texture:', error)
      }
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
