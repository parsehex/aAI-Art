<template>
  <div id="game-container"
    class="relative mt-2 mx-auto border-2 border-gray-700 shadow-lg rounded-lg overflow-hidden w-full max-w-6xl">
    <div ref="containerRef" class="w-full h-full"></div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Konva from 'konva'
import { TextureGenerator } from '@/utils/TextureGenerator'
import type { TextureDescription } from '@/types/Textures'



const containerRef = ref<HTMLDivElement>()
let stage: Konva.Stage | null = null
let layer: Konva.Layer | null = null
const textureGenerator = new TextureGenerator()

onMounted(() => {
  if (!containerRef.value) return

  // Create Konva stage
  stage = new Konva.Stage({
    container: containerRef.value,
    width: containerRef.value.clientWidth || 800,
    height: 400,
    draggable: true, // Enable panning
  })

  layer = new Konva.Layer()
  stage.add(layer)

  // Set background color
  const background = new Konva.Rect({
    x: -5000, // Make it large enough to cover panning
    y: -5000,
    width: 10000,
    height: 10000,
    fill: '#1f2937',
  })
  layer.add(background)
  layer.draw()

  // Handle zooming
  stage.on('wheel', (e) => {
    e.evt.preventDefault()
    if (!stage) return

    const scaleBy = 1.1
    const oldScale = stage.scaleX()
    const pointer = stage.getPointerPosition()

    if (!pointer) return

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }

    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy

    // Limit zoom
    newScale = Math.max(0.1, Math.min(newScale, 20))

    stage.scale({ x: newScale, y: newScale })

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    }
    stage.position(newPos)
  })

  // Listen for sprite selection events
  window.addEventListener('spriteSelected', handleSpriteSelected)
  window.addEventListener('spriteCleared', handleSpriteCleared)
})

onUnmounted(() => {
  window.removeEventListener('spriteSelected', handleSpriteSelected)
  window.removeEventListener('spriteCleared', handleSpriteCleared)
  stage?.destroy()
})

function handleSpriteCleared() {
  if (!stage || !layer) return

  // Clear previous sprites (except background)
  const children = layer.children
  for (let i = children.length - 1; i > 0; i--) {
    children[i].destroy()
  }
  layer.batchDraw()
}

async function handleSpriteSelected(event: Event) {
  const customEvent = event as CustomEvent<TextureDescription>
  const texture = customEvent.detail

  if (!stage || !layer) return

  // Clear previous sprites (except background)
  const children = layer.children
  for (let i = children.length - 1; i > 0; i--) {
    children[i].destroy()
  }

  // Create a group for the sprite to handle scaling and positioning
  // We don't need a group for scaling anymore, we scale the stage
  // But we can keep it for organization
  const spriteGroup = new Konva.Group({
    x: 0,
    y: 0,
  })

  // Draw all layers
  texture.layers.forEach((layerDesc) => {
    if (layerDesc.visible !== false) {
      textureGenerator.drawLayer(spriteGroup, layerDesc, texture.size)
    }
  })

  layer.add(spriteGroup)

  // Fit to screen
  fitToScreen(texture.size)

  layer.batchDraw()
}

function fitToScreen(contentSize: number) {
  if (!stage) return

  const stageWidth = stage.width()
  const stageHeight = stage.height()

  // Calculate scale to fit with some padding
  const padding = 40
  const scaleX = (stageWidth - padding) / contentSize
  const scaleY = (stageHeight - padding) / contentSize
  const newScale = Math.min(scaleX, scaleY, 10) // Cap max initial scale

  // Center the content
  const newX = (stageWidth - contentSize * newScale) / 2
  const newY = (stageHeight - contentSize * newScale) / 2

  stage.scale({ x: newScale, y: newScale })
  stage.position({ x: newX, y: newY })
}
</script>
<style scoped>
#game-container {
  width: 100%;
  max-width: 100%;
  height: 400px;
}
</style>
