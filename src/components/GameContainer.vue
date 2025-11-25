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

const PREVIEW_SCALE = 3

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
  })

  layer = new Konva.Layer()
  stage.add(layer)

  // Set background color
  const background = new Konva.Rect({
    x: 0,
    y: 0,
    width: stage.width(),
    height: stage.height(),
    fill: '#1f2937',
  })
  layer.add(background)
  layer.draw()

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
  const spriteGroup = new Konva.Group({
    x: stage.width() / 2,
    y: stage.height() / 2,
    offset: {
      x: texture.size / 2,
      y: texture.size / 2
    },
    scale: {
      x: PREVIEW_SCALE,
      y: PREVIEW_SCALE
    }
  })

  // Draw all layers
  texture.layers.forEach((layerDesc) => {
    if (layerDesc.visible !== false) {
      // Create a group for each layer if needed, or just draw into spriteGroup
      // TextureGenerator.drawLayer expects a Container (Group or Layer)
      // We can pass spriteGroup directly

      // Note: TextureGenerator.drawLayer might add multiple nodes to the container
      // If we want to support interactivity later, we might want per-layer groups
      // But for GameContainer (view only), drawing directly into spriteGroup is fine.

      // However, TextureGenerator.drawPattern creates a group inside.
      // Let's just pass spriteGroup.
      textureGenerator.drawLayer(spriteGroup, layerDesc, texture.size)
    }
  })

  layer.add(spriteGroup)
  layer.batchDraw()
}
</script>
<style scoped>
#game-container {
  width: 100%;
  max-width: 100%;
  height: 400px;
}
</style>
