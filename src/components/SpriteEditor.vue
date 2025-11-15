<template>
  <div class="sprite-editor flex h-full">
    <div class="layer-panel w-64 bg-gray-800 p-4 border-r border-gray-700 overflow-y-auto">
      <h3 class="text-lg font-bold mb-4 text-white">Layers</h3>
      <div class="space-y-2">
        <div v-for="(layer, index) in spriteData.layers" :key="index"
          class="layer-item flex items-center space-x-2 p-2 bg-gray-700 rounded cursor-pointer"
          :class="{ 'bg-blue-600': selectedLayerIndex === index }" @click="selectLayer(index)">
          <div class="layer-preview w-8 h-8 border border-gray-600 rounded flex-shrink-0"
            :style="{ backgroundColor: layer.color || '#ccc' }"></div>
          <span class="flex-1 text-sm text-white">{{ getLayerName(layer, index) }}</span>
          <button @click.stop="toggleLayerVisibility(index)" class="text-gray-400 hover:text-white">
            <Eye v-if="layer.visible !== false" class="w-4 h-4" />
            <EyeOff v-else class="w-4 h-4" />
          </button>
          <button @click.stop="removeLayer(index)" class="text-red-400 hover:text-red-600">
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
      <button @click="addLayer" class="w-full mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700"> + Layer
      </button>
    </div>
    <div class="editor-main flex-1 flex flex-col">
      <div class="properties-panel bg-gray-800 p-4 border-b border-gray-700">
        <h3 class="text-lg font-bold mb-4 text-white">Properties</h3>
        <div v-if="selectedLayer" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <DraggableNumberInput v-model="selectedLayer.x!" label="X" :step="1" :min="0" :max="spriteData.size"
              @update:modelValue="updateSprite" />
            <DraggableNumberInput v-model="selectedLayer.y!" label="Y" :step="1" :min="0" :max="spriteData.size"
              @update:modelValue="updateSprite" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300">Color</label>
            <input v-model="selectedLayer.color" type="color" class="w-full p-2 bg-gray-700 text-white rounded"
              @input="updateSprite" />
          </div>
          <div v-if="selectedLayer.type === 'rect'" class="grid grid-cols-2 gap-4">
            <DraggableNumberInput v-model="selectedLayer.width!" label="Width" :step="1" :min="1" :max="spriteData.size"
              @update:modelValue="updateSprite" />
            <DraggableNumberInput v-model="selectedLayer.height!" label="Height" :step="1" :min="1"
              :max="spriteData.size" @update:modelValue="updateSprite" />
          </div>
          <DraggableNumberInput v-if="selectedLayer.type === 'circle'" v-model="selectedLayer.radius!" label="Radius"
            :step="1" :min="1" :max="spriteData.size / 2" @update:modelValue="updateSprite" />
        </div>
        <div v-else class="text-gray-400">Select a layer to edit properties</div>
      </div>
      <div class="canvas-container flex-1 bg-gray-900" ref="canvasContainer">
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import Phaser from 'phaser'
import { Eye, EyeOff, X } from 'lucide-vue-next'
import { TextureGenerator } from '@/utils'
import { cloneFnJSON } from '@vueuse/core'
import DraggableNumberInput from './DraggableNumberInput.vue'

interface Props {
  spriteData: TextureDescription
}

const props = defineProps<Props>()
const emit = defineEmits<{
  spriteUpdated: [sprite: TextureDescription]
}>()

const canvasContainer = ref<HTMLDivElement>()
const game = ref<Phaser.Game>()
const selectedLayerIndex = ref<number | null>(null)
const spritePreviewUrl = ref<string>('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')

const selectedLayer = computed(() => {
  return selectedLayerIndex.value !== null ? props.spriteData.layers[selectedLayerIndex.value] : null
})

onMounted(() => {
  if (canvasContainer.value) {
    initPhaserGame()
  }
})

function initPhaserGame() {
  if (!canvasContainer.value) return

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: canvasContainer.value.clientWidth,
    height: canvasContainer.value.clientHeight,
    parent: canvasContainer.value,
    backgroundColor: '#1f2937',
    scene: SpriteEditorScene,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0, x: 0 },
      },
    },
  }

  game.value = new Phaser.Game(config)
}

function getLayerName(layer: TextureLayer, index: number): string {
  return `${layer.type} ${index + 1}`
}

function selectLayer(index: number) {
  selectedLayerIndex.value = index
  // TODO: Highlight selected layer in canvas
}

function toggleLayerVisibility(index: number) {
  const newLayers = props.spriteData.layers.map((layer, i) => {
    if (i !== index) return layer
    const newVisibleState = !(layer.visible ?? true)
    return {
      ...layer,
      visible: newVisibleState,
    }
  })
  const newSpriteData = {
    ...props.spriteData,
    layers: newLayers,
  }
  emit('spriteUpdated', newSpriteData)
  render(newSpriteData)
}

function addLayer() {
  const newLayer: TextureLayer = {
    type: 'rect',
    color: '#ff0000',
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    visible: true,
  }
  const newSpriteData = {
    ...props.spriteData,
    layers: [...props.spriteData.layers, newLayer],
  }
  emit('spriteUpdated', newSpriteData)
  render(newSpriteData) // Render the new sprite data immediately
}

function removeLayer(index: number) {
  if (props.spriteData.layers.length > 1) {
    const newLayers = props.spriteData.layers.filter((_, i) => i !== index)
    const newSpriteData = {
      ...props.spriteData,
      layers: newLayers,
    }
    if (selectedLayerIndex.value === index) {
      selectedLayerIndex.value = null
    } else if (selectedLayerIndex.value && selectedLayerIndex.value > index) {
      selectedLayerIndex.value--
    }
    emit('spriteUpdated', newSpriteData)
  }
}

function updateSprite() {
  const newSpriteData = {
    ...props.spriteData,
    layers: props.spriteData.layers.map((layer) => ({ ...layer })),
  }
  emit('spriteUpdated', newSpriteData)
  render(newSpriteData)
}

function render(data: TextureDescription) {
  if (game.value) {
    const scene = game.value.scene.getScene('SpriteEditorScene') as SpriteEditorScene
    if (scene) {
      scene.updateSpriteData(data)
    }
  }
}

onUnmounted(() => {
  game.value?.destroy(true)
})

watch(
  () => props.spriteData,
  (newVal) => {
    render(newVal)
  },
  { deep: true },
)

class SpriteEditorScene extends Phaser.Scene {
  private textureGenerator!: TextureGenerator
  private sprite?: Phaser.GameObjects.Sprite
  private spriteData!: TextureDescription

  constructor() {
    super({ key: 'SpriteEditorScene' })
  }

  init() {
    this.spriteData = cloneFnJSON(props.spriteData);
  }

  create() {
    this.textureGenerator = new TextureGenerator(this)

    // Create a large sprite in the center
    const { width, height } = this.scale.gameSize
    this.sprite = this.textureGenerator.createGameObject(this.spriteData, width / 2, height / 2, {
      scale: 4,
      isInteractive: false,
    })

    // Generate and set the preview URL for the Vue component
    this.generatePreview()

    this.scale.on('resize', this.handleResize.bind(this))
  }

  updateSpriteData(newSpriteData: TextureDescription) {
    this.spriteData = newSpriteData
    if (this.sprite) {
      const textureKey = this.textureGenerator.getTextureKey(this.spriteData, this)
      this.sprite.setTexture(textureKey)
      this.generatePreview() // Re-generate preview to update the Vue component
    }
  }

  // update() {
  //   // Update the sprite when spriteData changes
  //   if (this.sprite) {
  //     const textureKey = this.textureGenerator.getTextureKey(this.spriteData, this)
  //     this.sprite.setTexture(textureKey)
  //     this.generatePreview()
  //   }
  // }

  private generatePreview() {
    // Generate a data URL for the sprite preview
    const graphics = this.add.graphics()
    const size = this.spriteData.size

    this.spriteData.layers.forEach((layer) => {
      if (layer.visible !== false) {
        this.textureGenerator.drawLayer(graphics, layer, size)
      }
    })

    const textureKey = `preview-${Date.now()}`
    graphics.generateTexture(textureKey, size, size)
    graphics.destroy()

    // Get the canvas and convert to data URL
    const texture = this.textures.get(textureKey)
    if (texture) {
      const canvas = texture.getSourceImage() as HTMLCanvasElement
      if (canvas) {
        const dataUrl = canvas.toDataURL()
        // Update the Vue component's spritePreviewUrl
        spritePreviewUrl.value = dataUrl
      }
    }
  }

  handleResize(gameSize: Phaser.Structs.Size) {
    const { width, height } = gameSize
    if (width === this.cameras.main.width && height === this.cameras.main.height) return
    console.log('resized', gameSize)
    this.cameras.main.setSize(width, height)
  }
}
</script>
<style scoped>
.sprite-editor {
  height: 100vh;
}
</style>
