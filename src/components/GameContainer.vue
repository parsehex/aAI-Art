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
})

onUnmounted(() => {
  window.removeEventListener('spriteSelected', handleSpriteSelected)
  stage?.destroy()
})

async function handleSpriteSelected(event: Event) {
  const customEvent = event as CustomEvent<TextureDescription>
  const texture = customEvent.detail

  if (!stage || !layer) return

  // Clear previous sprites (except background)
  const children = layer.children
  for (let i = children.length - 1; i > 0; i--) {
    children[i].destroy()
  }

  // Generate sprite image
  const dataUrl = await textureGenerator.generateImage(texture)

  // Create image element
  const imageObj = new Image()
  imageObj.onload = () => {
    if (!layer || !stage) return

    // Create Konva image and center it
    const spriteImage = new Konva.Image({
      image: imageObj,
      x: stage.width() / 2 - (texture.size * 2) / 2,
      y: stage.height() / 2 - (texture.size * 2) / 2,
      width: texture.size * 2, // Scale up 2x
      height: texture.size * 2,
    })

    layer.add(spriteImage)
    layer.batchDraw()
  }
  imageObj.src = dataUrl
}
</script>
<style scoped>
#game-container {
  width: 50vw;
  max-width: 100%;
  height: 400px;
}
</style>
