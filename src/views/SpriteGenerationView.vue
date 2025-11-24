<template>
  <div class="flex flex-row gap-4">
    <SpriteList />
    <div class="flex flex-col flex-1 space-y-4">
      <SpriteGenerator />
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import SpriteGenerator from '@/components/SpriteGenerator.vue'
import SpriteList from '@/components/SpriteList.vue'
import { useTexturesStore } from '@/stores/textures'
import { presetTextures } from '@/data/preset-textures/registry'
import type { TextureDescription } from '@/types/Textures'

const route = useRoute()
const store = useTexturesStore()

// Load sprite from URL if ID is provided
onMounted(() => {
  loadSpriteFromRoute()
})

// Watch for route changes
watch(() => route.params.id, () => {
  loadSpriteFromRoute()
})

function loadSpriteFromRoute() {
  const spriteId = route.params.id as string | undefined
  if (spriteId) {
    // Find sprite in generated textures or presets
    const sprite = store.generatedTextures.find((t: TextureDescription) => t.id === spriteId)
      || presetTextures.find((t: TextureDescription) => t.id === spriteId)

    if (sprite) {
      // Dispatch event to select the sprite
      window.dispatchEvent(new CustomEvent('spriteSelected', { detail: sprite }))
    }
  }
}
</script>
