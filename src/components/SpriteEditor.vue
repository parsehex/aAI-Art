<template>
  <div class="sprite-editor flex h-full">
    <div v-if="!spriteData" class="flex-1 flex items-center justify-center text-gray-400">
      <div class="text-center">
        <p class="text-xl mb-2">Select a sprite to edit</p>
        <p class="text-sm">Choose a sprite from the list on the left</p>
      </div>
    </div>
    <template v-else>
      <div class="layer-panel w-64 bg-gray-800 p-4 border-r border-gray-700 overflow-y-auto">
        <h3 class="text-lg font-bold mb-4 text-white">Layers</h3>
        <div class="space-y-2">
          <div v-for="(layer, index) in spriteData.layers" :key="index"
            class="layer-item flex items-center p-2 bg-gray-700 rounded cursor-pointer"
            :class="{ 'bg-blue-600': selectedLayerIndex === index }" @click="selectLayer(index)">
            <div class="layer-preview w-8 h-8 border border-gray-600 rounded flex-shrink-0"
              :style="{ backgroundColor: layer.color || '#ccc' }"></div>
            <span class="mx-2 flex-1 text-sm text-white">{{ getLayerName(layer, index) }}</span>
            <button @click.stop="toggleLayerVisibility(index)" class="mr-2 text-gray-400 hover:text-white">
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
        <div class="mt-4">
          <DraggableNumberInput v-model="spriteSize" label="Texture Size" :step="1" :min="16" :max="512"
            @update:modelValue="updateSpriteSize" />
        </div>
      </div>
      <div class="editor-main flex-1 flex flex-col">
        <div class="canvas-container flex-1 min-h-96" ref="canvasContainer">
        </div>
        <div class="properties-panel bg-gray-800 p-4 border-t border-gray-700">
          <h3 class="text-lg font-bold mb-4 text-white">Properties</h3>
          <div v-if="selectedLayer" class="space-y-4">
            <div>
              <select v-model="selectedLayer.type" class="w-full p-2 bg-gray-700 text-white rounded"
                @change="changeLayerType">
                <option value="circle">Circle</option>
                <option value="rect">Rectangle</option>
                <option value="line">Line</option>
                <option value="gradient">Gradient</option>
                <option value="pattern">Pattern</option>
                <option value="ellipse">Ellipse</option>
                <option value="polygon">Polygon</option>
                <option value="path">Path</option>
              </select>
            </div>
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
            <component :is="currentLayerPropertiesComponent" :layer="selectedLayer" :sprite-size="spriteData.size"
              @update:layer="updateLayerProperties" />
          </div>
          <div v-else class="text-gray-400">Select a layer to edit properties</div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { cloneFnJSON, useResizeObserver } from '@vueuse/core'
import Phaser from 'phaser'
import { Eye, EyeOff, X } from 'lucide-vue-next'
import { TextureGenerator } from '@/utils'
import { defaultLayerProperties } from '@/utils/layerDefaults'
import DraggableNumberInput from './DraggableNumberInput.vue'
import CircleProperties from './LayerProperties/CircleProperties.vue'
import RectProperties from './LayerProperties/RectProperties.vue'
import LineProperties from './LayerProperties/LineProperties.vue'
import EllipseProperties from './LayerProperties/EllipseProperties.vue'
import PatternProperties from './LayerProperties/PatternProperties.vue'
import GradientProperties from './LayerProperties/GradientProperties.vue'
import PolygonProperties from './LayerProperties/PolygonProperties.vue'
import PathProperties from './LayerProperties/PathProperties.vue'

interface Props {
  spriteData: TextureDescription | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  spriteUpdated: [sprite: TextureDescription]
}>()

const canvasContainer = ref<HTMLDivElement>()
const game = ref<Phaser.Game>()
const selectedLayerIndex = ref<number | null>(null)
const spritePreviewUrl = ref<string>('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
const spriteSize = ref(props.spriteData?.size || 64)

const selectedLayer = computed(() => {
  return selectedLayerIndex.value !== null && props.spriteData ? props.spriteData.layers[selectedLayerIndex.value] : null
})

const currentLayerPropertiesComponent = computed(() => {
  if (!selectedLayer.value) return null
  switch (selectedLayer.value.type) {
    case 'circle':
      return CircleProperties
    case 'rect':
      return RectProperties
    case 'line':
      return LineProperties
    case 'gradient':
      return GradientProperties
    case 'pattern':
      return PatternProperties
    case 'ellipse':
      return EllipseProperties
    case 'polygon':
      return PolygonProperties
    case 'path':
      return PathProperties
    default:
      return null
  }
})

function changeLayerType() {
  if (!selectedLayer.value || selectedLayerIndex.value === null || !props.spriteData) return

  const newType = selectedLayer.value.type
  const commonProperties = {
    x: selectedLayer.value.x,
    y: selectedLayer.value.y,
    color: selectedLayer.value.color,
    visible: selectedLayer.value.visible,
  }

  const newLayer: TextureLayer = {
    ...defaultLayerProperties[newType],
    ...commonProperties,
    type: newType,
  }

  // Update the layer in the sprite data
  const newLayers = [...props.spriteData.layers]
  newLayers[selectedLayerIndex.value] = newLayer

  const newSpriteData = {
    ...props.spriteData,
    layers: newLayers,
  }

  emit('spriteUpdated', newSpriteData)
  render(newSpriteData)
}

function updateLayerProperties(layer: TextureLayer) {
  if (selectedLayerIndex.value === null || !props.spriteData) return

  const newLayers = [...props.spriteData.layers]
  newLayers[selectedLayerIndex.value] = layer

  const newSpriteData = {
    ...props.spriteData,
    layers: newLayers,
  }

  emit('spriteUpdated', newSpriteData)
  render(newSpriteData)
}

onMounted(() => {
  if (canvasContainer.value) {
    useResizeObserver(canvasContainer, (entries) => {
      const entry = entries[0]
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0 && !game.value && props.spriteData) {
        initPhaserGame()
      }
    })
  }
})

function initPhaserGame() {
  if (!canvasContainer.value || !props.spriteData) return
  if (canvasContainer.value.clientWidth === 0 || canvasContainer.value.clientHeight === 0) return

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
  if (!props.spriteData) return
  const newLayers = props.spriteData.layers.map((layer, i) => {
    if (i !== index) return layer
    let newVisibleState = layer.visible === false ? true : false
    console.log(newVisibleState)
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
  if (!props.spriteData) return
  const newLayer: TextureLayer = {
    ...defaultLayerProperties.rect,
    type: 'rect',
  }
  const newSpriteData = {
    ...props.spriteData,
    layers: [...props.spriteData.layers, newLayer],
  }
  emit('spriteUpdated', newSpriteData)
  render(newSpriteData) // Render the new sprite data immediately
}

function removeLayer(index: number) {
  if (!props.spriteData) return
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
  if (!props.spriteData) return
  const newSpriteData = {
    ...props.spriteData,
    layers: props.spriteData.layers.map((layer) => ({ ...layer })),
  }
  emit('spriteUpdated', newSpriteData)
  render(newSpriteData)
}

function updateSpriteSize() {
  if (!props.spriteData) return
  const newSpriteData = {
    ...props.spriteData,
    size: spriteSize.value,
  }
  emit('spriteUpdated', newSpriteData)
  render(newSpriteData)
}

function updateThumbnail(dataUrl: string, contextSpriteData?: TextureDescription) {
  const targetData = contextSpriteData || props.spriteData
  if (!targetData) return
  if (targetData.thumbnail === dataUrl) return

  const newSpriteData = {
    ...targetData,
    thumbnail: dataUrl
  }
  emit('spriteUpdated', newSpriteData)
}

function render(data: TextureDescription) {
  if (game.value) {
    const scene = game.value.scene.getScene('SpriteEditorScene') as SpriteEditorScene
    if (scene && scene.sys && scene.sys.settings.active) {
      scene.updateSpriteData(data)
    } else {
      console.warn('Scene not active or not found', scene)
    }
  } else {
    console.warn('Game not initialized')
  }
}

onUnmounted(() => {
  game.value?.destroy(true)
})

watch(
  () => props.spriteData,
  (newVal) => {
    if (newVal) {
      spriteSize.value = newVal.size
      if (!game.value && canvasContainer.value) {
        initPhaserGame()
      } else {
        render(newVal)
      }
    } else {
      game.value?.destroy(true)
      game.value = undefined
    }
  },
  { deep: true, flush: 'post' },
)

class SpriteEditorScene extends Phaser.Scene {
  private textureGenerator!: TextureGenerator
  private sprite?: Phaser.GameObjects.Sprite
  private spriteData!: TextureDescription

  constructor() {
    super({ key: 'SpriteEditorScene' })
  }

  init() {
    this.spriteData = cloneFnJSON(props.spriteData as TextureDescription);
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
        updateThumbnail(dataUrl, this.spriteData)
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
