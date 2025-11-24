<template>
  <div class="flex flex-col items-center min-h-screen min-w-screen text-white px-2">
    <p class="my-2"> An app to generate graphics using AI language models. All sprites and SVGs shown were created by
      prompting an LLM (bigger models are better). <a href="https://parsehex.github.io/aAI-Art/docs/">Docs</a> </p>
    <div class="w-full max-w-6xl">
      <!-- Generation Type Toggle -->
      <div class="flex space-x-4 mb-4">
        <button @click="generationType = 'sprite'" :class="[
          'px-4 py-2 rounded-md transition',
          generationType === 'sprite'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        ]"> Generate Sprites </button>
        <button @click="generationType = 'edit'" :class="[
          'px-4 py-2 rounded-md transition',
          generationType === 'edit'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        ]"> Edit Sprite </button>
        <button @click="generationType = 'svg'" :class="[
          'px-4 py-2 rounded-md transition',
          generationType === 'svg'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        ]"> Generate SVGs </button>
      </div>
      <!-- Generator Components -->
      <div class="w-full">
        <template v-if="generationType === 'sprite'">
          <div class="flex flex-row gap-4">
            <SpriteList />
            <div class="flex flex-col flex-1 space-y-4">
              <SpriteGenerator />
              <GameContainer />
            </div>
          </div>
        </template>
        <template v-else-if="generationType === 'edit'">
          <div class="flex flex-row gap-4 h-[calc(100vh-150px)]">
            <SpriteList mode="edit" />
            <div class="flex-1 h-full">
              <SpriteEditor :spriteData="selectedSpriteForEditing" @spriteUpdated="handleSpriteUpdate" />
            </div>
          </div>
        </template>
        <template v-else>
          <SvgGenerator />
        </template>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import GameContainer from './components/GameContainer.vue'
import SpriteGenerator from './components/SpriteGenerator.vue'
import SvgGenerator from './components/SvgGenerator.vue'
import SpriteList from './components/SpriteList.vue'
import SpriteEditor from './components/SpriteEditor.vue'
import { useTexturesStore } from '@/stores/textures'
import { delay } from './utils'

const generationType = ref<'sprite' | 'svg' | 'edit'>('sprite')
const selectedSpriteForEditing = ref<TextureDescription | null>(null)
const store = useTexturesStore()

onMounted(() => {
  store.load()
})

function handleSpriteUpdate(updatedSprite: TextureDescription) {
  // Check if it exists in generated textures
  const exists = store.generatedTextures.some(t => t.id === updatedSprite.id)

  if (exists) {
    store.updateGeneratedTexture(updatedSprite.id, updatedSprite)
  } else {
    // It's a new edit (possibly of a preset), add it to generated
    store.addGeneratedTexture(updatedSprite)
  }

  // Also update the local ref to ensure reactivity in SpriteEditor
  selectedSpriteForEditing.value = updatedSprite
}

// Listen for editSprite event from SpriteList
window.addEventListener('editSprite', async (event: Event) => {
  const customEvent = event as CustomEvent<TextureDescription>
  selectedSpriteForEditing.value = customEvent.detail
  await delay(25);
  generationType.value = 'edit'
})
</script>
<style>
.app {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 0;
  background-color: #242424;
}
</style>
