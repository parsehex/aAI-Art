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
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-white">Layers</h3>
          <div class="flex space-x-1">
            <button @click="undo" :disabled="!canUndo"
              class="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
              title="Undo (Cmd+Z)">
              <Undo class="w-4 h-4" />
            </button>
            <button @click="redo" :disabled="!canRedo"
              class="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
              title="Redo (Cmd+Shift+Z)">
              <Redo class="w-4 h-4" />
            </button>
            <button @click="revertAll" class="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
              title="Revert All Changes">
              <RotateCcw class="w-4 h-4" />
            </button>
          </div>
        </div>
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
                @update:modelValue="(v) => updateSprite(v, true)" />
              <DraggableNumberInput v-model="selectedLayer.y!" label="Y" :step="1" :min="0" :max="spriteData.size"
                @update:modelValue="(v) => updateSprite(v, true)" />
            </div>
            <div>
              <DraggableNumberInput :model-value="selectedLayer.rotation || 0" label="Rotation" :step="1" :min="0"
                :max="360" @update:model-value="(val) => updateLayerProperty('rotation', val, true)" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300">Color</label>
              <input v-model="selectedLayer.color" type="color" class="w-full p-2 bg-gray-700 text-white rounded"
                @change="updateSprite" />
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
import { Eye, EyeOff, X, Undo, Redo, RotateCcw } from 'lucide-vue-next'
import { TextureGenerator } from '@/utils'
import { useHistory } from '@/composables/useHistory'
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
import type { TextureDescription, TextureLayer } from '@/types/Textures'

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
const { history, index, canUndo, canRedo, record, undo: historyUndo, redo: historyRedo, reset: historyReset } = useHistory<TextureDescription>()

function createDebounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let lastArgs: any[] | null = null

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn(...args)
      timeout = null
      lastArgs = null
    }, delay)
  }

  debounced.flush = () => {
    if (timeout && lastArgs) {
      clearTimeout(timeout)
      fn(...(lastArgs as Parameters<T>))
      timeout = null
      lastArgs = null
    }
  }

  return debounced
}

const recordDebounced = createDebounce(record, 300)
const initialState = ref<TextureDescription | null>(null)

// Scale factor for the editor view
const scale = ref(1)
const stagePos = ref({ x: 0, y: 0 })

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

function updateLayerProperty(key: keyof TextureLayer, value: any, continuous = false) {
  if (!selectedLayer.value || selectedLayerIndex.value === null) return
  const newLayer = { ...selectedLayer.value, [key]: value }
  updateLayerAtIndex(selectedLayerIndex.value, newLayer, continuous)
}

function updateLayerProperties(layer: TextureLayer) {
  if (selectedLayerIndex.value === null) return
  // Assume layer properties updates (from subcomponents) are continuous (sliders)
  updateLayerAtIndex(selectedLayerIndex.value, layer, true)
}

function emitUpdate(newSpriteData: TextureDescription, continuous = false) {
  emit('spriteUpdated', newSpriteData)
  if (continuous) {
    recordDebounced(newSpriteData)
  } else {
    recordDebounced.flush()
    record(newSpriteData)
  }
}

function undo() {
  const prevState = historyUndo()
  if (prevState) {
    emit('spriteUpdated', prevState)
  }
}

function redo() {
  const nextState = historyRedo()
  if (nextState) {
    emit('spriteUpdated', nextState)
  }
}

function revertAll() {
  if (initialState.value) {
    // Record the revert as a new state so it can be undone
    emitUpdate(initialState.value)
  }
}

function updateLayerAtIndex(index: number, layer: TextureLayer, continuous = false) {
  if (!props.spriteData) return
  const newLayers = [...props.spriteData.layers]
  newLayers[index] = layer

  const newSpriteData = {
    ...props.spriteData,
    layers: newLayers,
  }

  emitUpdate(newSpriteData, continuous)
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
          fitToScreen()
        }
      }
    })
  }
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  stage.value?.destroy()
  window.removeEventListener('keydown', handleKeydown)
})

function handleKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
    e.preventDefault()
    if (e.shiftKey) {
      redo()
    } else {
      undo()
    }
  } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
    e.preventDefault()
    redo()
  }
}

function initKonvaStage() {
  if (!canvasContainer.value || !props.spriteData) return
  if (canvasContainer.value.clientWidth === 0 || canvasContainer.value.clientHeight === 0) return

  stage.value = new Konva.Stage({
    container: canvasContainer.value,
    width: canvasContainer.value.clientWidth,
    height: canvasContainer.value.clientHeight,
    draggable: true, // Enable panning
  })

  mainLayer.value = new Konva.Layer()
  stage.value.add(mainLayer.value)


  transformer.value = new Konva.Transformer({
    nodes: [],
    ignoreStroke: true,
    rotateEnabled: true,
    rotateAnchorOffset: 30,
    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
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
    // Deselect if clicked on stage or main layer (background)
    if (e.target === stage.value || (e.target as any) === mainLayer.value) {
      selectLayer(-1) // Deselect
    }
  })

  // Handle zooming
  stage.value.on('wheel', (e) => {
    e.evt.preventDefault()
    if (!stage.value) return

    const scaleBy = 1.05 // Slower zoom speed
    const oldScale = stage.value.scaleX()
    const pointer = stage.value.getPointerPosition()

    if (!pointer) return

    const mousePointTo = {
      x: (pointer.x - stage.value.x()) / oldScale,
      y: (pointer.y - stage.value.y()) / oldScale,
    }

    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy

    // Limit zoom
    newScale = Math.max(0.1, Math.min(newScale, 20))

    stage.value.scale({ x: newScale, y: newScale })

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    }
    stage.value.position(newPos)

    scale.value = newScale
    stagePos.value = newPos
  })

  fitToScreen()
  render(props.spriteData, true)
}

function fitToScreen() {
  if (!stage.value || !mainLayer.value || !props.spriteData) return

  const stageWidth = stage.value.width()
  const stageHeight = stage.value.height()
  const contentSize = props.spriteData.size

  // Calculate scale to fit with some padding
  const padding = 40
  const scaleX = (stageWidth - padding) / contentSize
  const scaleY = (stageHeight - padding) / contentSize
  const newScale = Math.min(scaleX, scaleY, 10) // Cap max initial scale

  scale.value = newScale

  // Center the content
  const newX = (stageWidth - contentSize * newScale) / 2
  const newY = (stageHeight - contentSize * newScale) / 2

  stagePos.value = { x: newX, y: newY }

  stage.value.scale({ x: newScale, y: newScale })
  stage.value.position({ x: newX, y: newY })

  // Reset main layer position since we're moving the stage now
  mainLayer.value.x(0)
  mainLayer.value.y(0)
  mainLayer.value.scale({ x: 1, y: 1 })
}

function centerStage() {
  // Deprecated in favor of fitToScreen, but kept for compatibility if called elsewhere
  fitToScreen()
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
  emitUpdate(newSpriteData)
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
    emitUpdate(newSpriteData)
  }
}

function updateSprite(_?: any, continuous = false) {
  if (!props.spriteData) return
  // Deep copy to trigger update
  const newSpriteData = JSON.parse(JSON.stringify(props.spriteData))
  emitUpdate(newSpriteData, continuous)
}

function updateSpriteSize(val: number) {
  if (!props.spriteData) return
  const newSpriteData = {
    ...props.spriteData,
    size: val, // Use val directly as spriteSize.value might be updated by v-model
  }
  emitUpdate(newSpriteData, true) // Size change via slider is continuous
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

    // Calculate center for rotation
    const center = getLayerCenter(layerData, data.size)

    const group = new Konva.Group({
      id: `layer-${index}`,
      draggable: true,
      x: center.x,
      y: center.y,
      offsetX: center.x,
      offsetY: center.y,
      rotation: layerData.rotation || 0,
    })

    // Draw content into group
    // We pass rotation: 0 because the group handles rotation
    const layerWithoutRotation = { ...layerData, rotation: 0 }
    textureGenerator.drawLayer(group, layerWithoutRotation, data.size)

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
    strokeWidth: 1 / (scale.value || 1), // Keep line thin
    listening: false
  })
  mainLayer.value.add(border)
  border.moveToBottom()

  if (!silent) {
    // Only fit to screen on initial load or reset, not every render
    // But for now, let's just keep it simple. If we are dragging, we don't want to reset.
    // We can check if it's a new sprite.
    // The 'silent' flag is true for initial load? No, false.
    // Actually, 'render' is called with silent=true in initKonvaStage.
  }

  // If it's a new sprite (silent=true usually means init), fit to screen
  if (silent) {
    fitToScreen()
  }

  // Generate thumbnail for UI
  if (!silent) {
    const dataUrl = await textureGenerator.generateImage(data)
    if (data.thumbnail !== dataUrl) {
      const newSpriteData = { ...data, thumbnail: dataUrl }
      emit('spriteUpdated', newSpriteData)
    }
  }
}

function getLayerCenter(layer: TextureLayer, size: number) {
  if (layer.type === 'circle' || layer.type === 'ellipse') {
    const x = layer.x !== undefined ? layer.x : size / 2
    const y = layer.y !== undefined ? layer.y : size / 2
    return { x, y }
  } else if (layer.type === 'line') {
    const x1 = layer.x !== undefined ? layer.x : 0
    const y1 = layer.y !== undefined ? layer.y : 0
    const x2 = layer.x2 !== undefined ? layer.x2 : size
    const y2 = layer.y2 !== undefined ? layer.y2 : size
    return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }
  } else {
    // Rect, pattern, etc
    const width = layer.width || 0
    const height = layer.height || 0
    const x = layer.x !== undefined ? layer.x : (size - width) / 2
    const y = layer.y !== undefined ? layer.y : (size - height) / 2
    return { x: x + width / 2, y: y + height / 2 }
  }
}

function handleDragEnd(index: number, node: Konva.Group) {
  if (!props.spriteData) return
  const layer = props.spriteData.layers[index]

  // node.x() and node.y() are the new center position
  const newCenterX = node.x()
  const newCenterY = node.y()

  // Calculate old center to find delta
  const oldCenter = getLayerCenter(layer, props.spriteData.size)
  const deltaX = newCenterX - oldCenter.x
  const deltaY = newCenterY - oldCenter.y

  // Reset group position
  node.position({ x: newCenterX, y: newCenterY })

  const newLayer = { ...layer }

  // Update position based on delta
  if (layer.x !== undefined) newLayer.x = Math.round((layer.x || 0) + deltaX)
  if (layer.y !== undefined) newLayer.y = Math.round((layer.y || 0) + deltaY)

  // For lines, also update end coordinates
  if (layer.type === 'line') {
    if (layer.x2 !== undefined) newLayer.x2 = Math.round((layer.x2 || 0) + deltaX)
    if (layer.y2 !== undefined) newLayer.y2 = Math.round((layer.y2 || 0) + deltaY)
  }

  updateLayerAtIndex(index, newLayer)
}

function handleTransformEnd(index: number, node: Konva.Group) {
  if (!props.spriteData) return
  const layer = props.spriteData.layers[index]

  const scaleX = node.scaleX()
  const scaleY = node.scaleY()
  const rotation = node.rotation()

  // New center position after transform
  const newCenterX = node.x()
  const newCenterY = node.y()

  // Reset transforms
  node.scaleX(1)
  node.scaleY(1)
  // Keep rotation and position on group until re-render

  const newLayer: TextureLayer = { ...layer }

  // Update rotation
  newLayer.rotation = rotation

  // Update dimensions and position
  if (layer.type === 'circle') {
    if (layer.radius) {
      newLayer.radius = Math.round(layer.radius * ((scaleX + scaleY) / 2))
    }
    // Circle center is its position
    newLayer.x = Math.round(newCenterX)
    newLayer.y = Math.round(newCenterY)
  } else if (layer.type === 'ellipse') {
    if (layer.width) newLayer.width = Math.round((layer.width || 0) * scaleX)
    if (layer.height) newLayer.height = Math.round((layer.height || 0) * scaleY)
    // Ellipse center is its position
    newLayer.x = Math.round(newCenterX)
    newLayer.y = Math.round(newCenterY)
  } else if (layer.type === 'line') {
    // For lines, scale width
    if (layer.lineWidth) {
      newLayer.lineWidth = Math.round(layer.lineWidth * ((scaleX + scaleY) / 2))
    }
    // Update start/end points based on new center and scale?
    // This is tricky for lines. For now, just update center translation.
    const oldCenter = getLayerCenter(layer, props.spriteData.size)
    const deltaX = newCenterX - oldCenter.x
    const deltaY = newCenterY - oldCenter.y

    if (layer.x !== undefined) newLayer.x = Math.round((layer.x || 0) + deltaX)
    if (layer.y !== undefined) newLayer.y = Math.round((layer.y || 0) + deltaY)
    if (layer.x2 !== undefined) newLayer.x2 = Math.round((layer.x2 || 0) + deltaX)
    if (layer.y2 !== undefined) newLayer.y2 = Math.round((layer.y2 || 0) + deltaY)
  } else {
    // Rect, pattern, etc
    const newWidth = Math.round((layer.width || 0) * scaleX)
    const newHeight = Math.round((layer.height || 0) * scaleY)

    newLayer.width = newWidth
    newLayer.height = newHeight

    // Calculate new top-left from new center
    newLayer.x = Math.round(newCenterX - newWidth / 2)
    newLayer.y = Math.round(newCenterY - newHeight / 2)

    if (layer.radius) {
      newLayer.radius = Math.round((layer.radius || 0) * ((scaleX + scaleY) / 2))
    }
  }

  updateLayerAtIndex(index, newLayer)
}



const currentSpriteId = ref<string | null>(null)
const lastTextureKey = ref<string>('')

watch(
  () => props.spriteData,
  (newVal, oldVal) => {
    if (newVal) {
      spriteSize.value = newVal.size

      const newKey = textureGenerator.getTextureKey(newVal)

      // If the sprite ID changed, it's a new load.
      // Also if we went from generated -> not generated (reset), treat as new load.
      const isReset = oldVal?.generated && !newVal.generated
      const isNewSprite = newVal.id !== currentSpriteId.value || isReset

      // If ID is same and visual content (key) is same, ignore update (e.g. thumbnail/name change)
      if (!isNewSprite && newKey === lastTextureKey.value) {
        return
      }

      currentSpriteId.value = newVal.id
      lastTextureKey.value = newKey

      if (!stage.value && canvasContainer.value) {
        initKonvaStage()
      } else {
        render(newVal, isNewSprite)
      }

      if (isNewSprite) {
        historyReset(newVal)
        initialState.value = JSON.parse(JSON.stringify(newVal))
      }
    } else {
      currentSpriteId.value = null
      lastTextureKey.value = ''
      stage.value?.destroy()
      stage.value = undefined
    }
  },
  { deep: true, flush: 'post' },
)
</script>
