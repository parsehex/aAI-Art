<template>
  <div class="sprite-list overflow-y-auto h-full border-r border-gray-700 pr-2">
    <div
      v-for="texture in allTextures"
      :key="texture.name"
      class="sprite-item flex items-center space-x-2 p-2 hover:bg-gray-800 cursor-pointer"
      @click="selectSprite(texture)"
    >
      <!-- For now we display a placeholder box with the sprite name.
           In the future you might generate a thumbnail at export time -->
      <div class="w-16 h-16 bg-gray-600 flex items-center justify-center rounded">
        <span class="text-xs text-center px-1">{{ texture.name }}</span>
      </div>
      <div class="flex-1 ml-2 text-sm">
        {{ texture.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// Import preset textures directly from our registry.
import { presetTextures } from '@/data/preset-textures/registry'
import { generatedTextures } from '@/data/generated-textures'

// Combine the preset and generated textures.
const allTextures = computed(() => {
  return [...presetTextures, ...generatedTextures]
})

function selectSprite(texture: TextureDescription) {
  // Dispatch the event to notify our Phaser scene to render the sprite.
  window.dispatchEvent(new CustomEvent('spriteSelected', { detail: texture }))
}
</script>

<style scoped>
.sprite-list {
  width: 250px;
  background: #1f2937;
}
.sprite-item {
  border-bottom: 1px solid #444;
}
</style>
