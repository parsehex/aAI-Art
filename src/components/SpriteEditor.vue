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
        <button @click="addLayer" class="w-full mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700">+ Layer
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
              <DraggableNumberInput v-model="rotation" label="Rotation" :step="1" :min="0" :max="360"
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
import { ref, onMounted, watch, computed, onUnmounted, nextTick } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import Konva from 'konva'
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
const stage = ref<Konva.Stage>()
const mainLayer = ref<Konva.Layer>()
const transformer = ref<Konva.Transformer>()
const selectedLayerIndex = ref<number | null>(null)
const spriteSize = ref(props.spriteData?.size || 64)
const textureGenerator = new TextureGenerator()

// Scale factor for the editor view
const EDITOR_SCALE = 4

const rotation = computed({
  get: () => selectedLayer.value?.rotation || 0,
  set: (value) => {
    updateLayerProperty('rotation', value)
  }
})

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
    rotation: selectedLayer.value.rotation,
  }

  const newLayer: TextureLayer = {
    ...defaultLayerProperties[newType],
    ...commonProperties,
    type: newType,
  }

  updateLayerAtIndex(selectedLayerIndex.value, newLayer)
}

function updateLayerProperty(key: keyof TextureLayer, value: any) {
  if (!selectedLayer.value || selectedLayerIndex.value === null) return
  const newLayer = { ...selectedLayer.value, [key]: value }
  updateLayerAtIndex(selectedLayerIndex.value, newLayer)
}

function updateLayerProperties(layer: TextureLayer) {
  if (selectedLayerIndex.value === null) return
  updateLayerAtIndex(selectedLayerIndex.value, layer)
}

function updateLayerAtIndex(index: number, layer: TextureLayer) {
  if (!props.spriteData) return
  const newLayers = [...props.spriteData.layers]
  newLayers[index] = layer

  const newSpriteData = {
    ...props.spriteData,
    layers: newLayers,
  }

  emit('spriteUpdated', newSpriteData)
  // Render will be triggered by watch
}

onMounted(() => {
  if (canvasContainer.value) {
    useResizeObserver(canvasContainer, (entries) => {
      const entry = entries[0]
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) {
        if (!stage.value && props.spriteData) {
          initKonvaStage()
        } else if (stage.value) {
          stage.value.width(width)
          stage.value.height(height)
          centerStage()
        }
      }
    })
  }
})

function initKonvaStage() {
  if (!canvasContainer.value || !props.spriteData) return
  if (canvasContainer.value.clientWidth === 0 || canvasContainer.value.clientHeight === 0) return

  stage.value = new Konva.Stage({
    container: canvasContainer.value,
    width: canvasContainer.value.clientWidth,
    height: canvasContainer.value.clientHeight,
  })

  mainLayer.value = new Konva.Layer()
  stage.value.add(mainLayer.value)

  transformer.value = new Konva.Transformer({
    nodes: [],
    boundBoxFunc: (oldBox, newBox) => {
      // Limit minimum size
      if (newBox.width < 5 || newBox.height < 5) {
        return oldBox
      }
      return newBox
    },
  })
  mainLayer.value.add(transformer.value)

  // Handle clicks on stage to deselect
  stage.value.on('click tap', (e) => {
    if (e.target === stage.value) {
      selectLayer(-1) // Deselect
    }
  })

  centerStage()
  render(props.spriteData, true)
}

function centerStage() {
  if (!stage.value || !mainLayer.value || !props.spriteData) return

  // Center the content
  const stageWidth = stage.value.width()
  const stageHeight = stage.value.height()
  const contentSize = props.spriteData.size * EDITOR_SCALE

  mainLayer.value.x(stageWidth / 2 - contentSize / 2)
  mainLayer.value.y(stageHeight / 2 - contentSize / 2)
  mainLayer.value.scale({ x: EDITOR_SCALE, y: EDITOR_SCALE })
}

function getLayerName(layer: TextureLayer, index: number): string {
  return `${layer.type} ${index + 1}`
}

function selectLayer(index: number) {
  selectedLayerIndex.value = index === -1 ? null : index
  updateTransformer()
}

function updateTransformer() {
  if (!transformer.value || !mainLayer.value) return

  if (selectedLayerIndex.value === null) {
    transformer.value.nodes([])
    return
  }

  // Find the group corresponding to the selected layer
  // We assign IDs to groups as 'layer-{index}'
  const selectedNode = mainLayer.value.findOne(`#layer-${selectedLayerIndex.value}`)
  if (selectedNode) {
    transformer.value.nodes([selectedNode])
  } else {
    transformer.value.nodes([])
  }
}

function toggleLayerVisibility(index: number) {
  if (!props.spriteData) return
  const layer = props.spriteData.layers[index]
  const newLayer = { ...layer, visible: layer.visible === false ? true : false }
  updateLayerAtIndex(index, newLayer)
}

function addLayer() {
  if (!props.spriteData) return
  const newLayer: TextureLayer = {
    ...defaultLayerProperties.rect,
    type: 'rect',
    x: props.spriteData.size / 2 - 10,
    y: props.spriteData.size / 2 - 10,
    width: 20,
    height: 20
  }
  const newSpriteData = {
    ...props.spriteData,
    layers: [...props.spriteData.layers, newLayer],
  }
  emit('spriteUpdated', newSpriteData)
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
  // Deep copy to trigger update
  const newSpriteData = JSON.parse(JSON.stringify(props.spriteData))
  emit('spriteUpdated', newSpriteData)
}

function updateSpriteSize() {
  if (!props.spriteData) return
  const newSpriteData = {
    ...props.spriteData,
    size: spriteSize.value,
  }
  emit('spriteUpdated', newSpriteData)
}

async function render(data: TextureDescription, silent = false) {
  if (!stage.value || !mainLayer.value) {
    return
  }

  // Clear existing layer groups (keep transformer)
  const groups = mainLayer.value.find('Group')

  // Detach transformer before destroying nodes to prevent errors
  if (transformer.value) {
    transformer.value.nodes([])
  }

  groups.forEach(g => {
    // Don't destroy the transformer itself (it's a Transformer, but check just in case)
    if (g !== transformer.value) {
      g.destroy()
    }
  })

  // Render each layer
  data.layers.forEach((layerData, index) => {
    if (layerData.visible === false) return

    const group = new Konva.Group({
      id: `layer-${index}`,
      draggable: true,
      x: 0,
      y: 0,
    })

    // Draw content into group
    textureGenerator.drawLayer(group, layerData, data.size)

    // Add events
    group.on('click tap', (e) => {
      e.cancelBubble = true
      selectLayer(index)
    })

    group.on('dragend', (e) => {
      handleDragEnd(index, e.target as Konva.Group)
    })

    group.on('transformend', (e) => {
      handleTransformEnd(index, e.target as Konva.Group)
    })

    // Insert before transformer so transformer stays on top
    mainLayer.value?.add(group)

    // Only move transformer to top if it's already in the layer
    if (transformer.value && transformer.value.getLayer()) {
      transformer.value.moveToTop()
    }
  })

  // Update transformer selection
  updateTransformer()

  // Update background/border to show sprite bounds
  // We can add a border rect
  const existingBorder = mainLayer.value.findOne('#sprite-border')
  if (existingBorder) existingBorder.destroy()

  const border = new Konva.Rect({
    id: 'sprite-border',
    x: 0,
    y: 0,
    width: data.size,
    height: data.size,
    stroke: '#444',
    strokeWidth: 1 / EDITOR_SCALE, // Keep line thin
    listening: false
  })
  mainLayer.value.add(border)
  border.moveToBottom()

  centerStage()

  // Generate thumbnail for UI
  if (!silent) {
    const dataUrl = await textureGenerator.generateImage(data)
    if (data.thumbnail !== dataUrl) {
      const newSpriteData = { ...data, thumbnail: dataUrl }
      emit('spriteUpdated', newSpriteData)
    }
  }
}

function handleDragEnd(index: number, node: Konva.Group) {
  if (!props.spriteData) return
  const layer = props.spriteData.layers[index]

  // Calculate new position
  // The group position is the delta because we rendered at (0,0) inside the group?
  // Wait, TextureGenerator renders at layer.x/y.
  // So the group starts at 0,0.
  // The visual position is layer.x + group.x.

  const newX = (layer.x || 0) + node.x()
  const newY = (layer.y || 0) + node.y()

  // Reset group position to 0,0 and update layer data
  // This prevents accumulation of offsets in the group
  node.position({ x: 0, y: 0 })

  const newLayer = {
    ...layer,
    x: Math.round(newX),
    y: Math.round(newY)
  }

  updateLayerAtIndex(index, newLayer)
}

function handleTransformEnd(index: number, node: Konva.Group) {
  if (!props.spriteData) return
  const layer = props.spriteData.layers[index]

  const scaleX = node.scaleX()
  const scaleY = node.scaleY()
  const rotation = node.rotation()

  // Reset node transforms
  node.scaleX(1)
  node.scaleY(1)
  node.rotation(0)

  // Update layer properties
  // This is tricky because different shapes handle width/height/radius differently
  // And TextureGenerator might not support all these updates easily if we just change width/height
  // But let's try basic mapping

  const newLayer: TextureLayer = { ...layer }

  // Update rotation
  newLayer.rotation = (newLayer.rotation || 0) + rotation

  // Update dimensions
  if (newLayer.width !== undefined) {
    newLayer.width = Math.round(newLayer.width * scaleX)
  }
  if (newLayer.height !== undefined) {
    newLayer.height = Math.round(newLayer.height * scaleY)
  }
  if (newLayer.radius !== undefined) {
    // Average scale for radius
    newLayer.radius = Math.round(newLayer.radius * ((scaleX + scaleY) / 2))
  }

  // Also need to handle position change if rotation/scaling changed the center?
  // Konva transformer changes x/y if centered scaling is not used?
  // For now let's assume simple scaling.
  // Actually, transformer might move the node.
  const newX = (layer.x || 0) + node.x()
  const newY = (layer.y || 0) + node.y()
  node.position({ x: 0, y: 0 })

  newLayer.x = Math.round(newX)
  newLayer.y = Math.round(newY)

  updateLayerAtIndex(index, newLayer)
}

onUnmounted(() => {
  stage.value?.destroy()
})

const currentSpriteId = ref<string | null>(null)

watch(
  () => props.spriteData,
  (newVal) => {
    if (newVal) {
      spriteSize.value = newVal.size

      // If the sprite ID changed, it's a new load. Render silently.
      // Otherwise, it's an update to the current sprite. Render and emit changes.
      const isNewSprite = newVal.id !== currentSpriteId.value
      currentSpriteId.value = newVal.id

      if (!stage.value && canvasContainer.value) {
        initKonvaStage()
      } else {
        render(newVal, isNewSprite)
      }
    } else {
      currentSpriteId.value = null
      stage.value?.destroy()
      stage.value = undefined
    }
  },
  { deep: true, flush: 'post' },
)
</script>
