<template>
  <div class="space-y-4">
    <button @click="formCollapsed = !formCollapsed"
      class="w-full flex flex-col items-center gap-1 py-2 hover:bg-gray-800 rounded-md transition group">
      <span class="text-sm font-medium text-gray-300 group-hover:text-white">Generate</span>
      <svg class="w-5 h-5 text-gray-400 group-hover:text-white transition-transform duration-200"
        :class="{ 'rotate-180': formCollapsed }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <GeneratorForm v-show="!formCollapsed" ref="Form" placeholder="Describe your sprite...">
      <template #button>
        <button :disabled="!canSend" @click="generateSprite"
          class="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50">
          <span v-if="!aiStore.isLoading">Generate Sprite</span>
          <span v-else class="flex items-center justify-center">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Generating...
          </span>
        </button>
      </template>
    </GeneratorForm>
    <GameContainer v-show="currentSprite" />
    <!-- Preview and Save Area -->
    <div v-if="currentSprite" class="bg-gray-800 p-4 mt-4 rounded-lg shadow-lg border border-gray-700">
      <h3 class="text-lg font-bold mb-3 text-white">Sprite Preview</h3>
      <div class="flex items-center gap-4">
        <!-- Preview -->
        <div class="bg-gray-900 p-4 rounded-md border border-gray-600">
          <img v-if="currentPreview" :src="currentPreview" alt="Sprite preview" class="w-32 h-32 pixelated" />
        </div>
        <!-- Info and Actions -->
        <div class="flex-1 space-y-3">
          <div class="text-sm text-gray-300">
            <p v-if="currentSprite.prompt"><strong>Prompt:</strong> {{ currentSprite.prompt }}</p>
            <p v-if="currentSprite.name"><strong>Name:</strong> {{ currentSprite.name }}</p>
            <p><strong>Size:</strong> {{ currentSprite.size }}x{{ currentSprite.size }}px</p>
            <p><strong>Layers:</strong> {{ currentSprite.layers.length }}</p>
          </div>
          <div class="flex gap-2">
            <button @click="saveSprite"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"> Save </button>
            <!-- <button @click="editSprite"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"> Edit </button> -->
          </div>
          <p v-if="justSaved" class="text-green-400 text-sm">✓ Sprite saved successfully!</p>
        </div>
      </div>
      <!-- JSON Viewer -->
      <div class="mt-4 pt-4 border-t border-gray-700">
        <button @click="jsonCollapsed = !jsonCollapsed"
          class="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors w-full">
          <svg class="w-4 h-4 transition-transform duration-200" :class="{ '-rotate-90': jsonCollapsed }"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg> JSON Data </button>
        <div v-show="!jsonCollapsed" class="mt-2 bg-gray-900 rounded-md overflow-hidden text-xs">
          <JsonViewer :data="jsonDisplayData || {}" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { v4 } from 'uuid'
import { JsonViewer } from '@parsehex/vuepak'
import GeneratorForm from '@/components/GeneratorForm.vue'
import { GenerateSpriteMessages } from '@/data/prompt'
import { useAIStore } from '@/stores/ai'
import { useTexturesStore } from '@/stores/textures'
import { TextureGenerator } from '@/utils/TextureGenerator'
import GameContainer from '@/components/GameContainer.vue'

const Form = ref<typeof GeneratorForm>()

const aiStore = useAIStore()
const texturesStore = useTexturesStore()
const textureGenerator = new TextureGenerator()

const selectedTexture = ref<TextureDescription | null>(null)
const generatedSprite = ref<TextureDescription | null>(null)
const spritePreview = ref<string | null>(null)
const justSaved = ref(false)
const formCollapsed = useLocalStorage('formCollapsed', true)
const jsonCollapsed = useLocalStorage('jsonCollapsed', true)

// Computed property to get the current sprite (either newly generated or selected)
const currentSprite = computed(() => generatedSprite.value || selectedTexture.value)

// Computed property to check if it's a newly generated sprite
const isNewlyGenerated = computed(() => !!generatedSprite.value)

// Computed property for the preview image
const currentPreview = computed(() => {
  if (spritePreview.value) return spritePreview.value
  if (selectedTexture.value?.thumbnail) return selectedTexture.value.thumbnail
  return null
})

const jsonDisplayData = computed(() => {
  if (!currentSprite.value) return null
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { thumbnail, ...rest } = currentSprite.value
  return rest
})

const canSend = computed(() => {
  if (aiStore.isLoading) return false;
  const form = Form.value
  if (!form) return false
  if (!form.prompt) return false;
  return true;
})

async function generateSprite() {
  const form = Form.value
  if (!form) return

  const p = form.prompt
  if (!p.trim() || !aiStore.selectedModel) return

  try {
    const content = await aiStore.generate(
      aiStore.selectedModel,
      GenerateSpriteMessages(p),
      { temperature: 0.01 }
    )

    const newTexture = JSON.parse(content) as TextureDescription
    newTexture.prompt = p
    newTexture.id = v4()

    // Store the generated sprite and create preview
    generatedSprite.value = newTexture
    spritePreview.value = await textureGenerator.generateImage(newTexture)
    justSaved.value = false

    // Also dispatch event for GameContainer
    window.dispatchEvent(new CustomEvent('newTexture', { detail: newTexture }))
    window.dispatchEvent(new CustomEvent('spriteSelected', { detail: newTexture }))

    form.prompt = ''
  } catch (error) {
    console.error('Error generating sprite:', error)
  }
}

function editSprite() {
  // ???
}

function saveSprite() {
  if (!currentSprite.value) return

  // Add thumbnail to the sprite data
  const spriteToSave = {
    ...currentSprite.value,
    thumbnail: currentPreview.value || undefined,
    id: currentSprite.value.id || v4() // Ensure it has an ID
  }

  texturesStore.addGeneratedTexture(spriteToSave)
  justSaved.value = true

  // Clear the "just saved" message after 3 seconds
  setTimeout(() => {
    justSaved.value = false
  }, 3000)
}

function clearCurrent() {
  generatedSprite.value = null
  spritePreview.value = null
  selectedTexture.value = null
  justSaved.value = false
}

onMounted(() => {
  window.addEventListener('spriteSelected', async (event: Event) => {
    const customEvent = event as CustomEvent<TextureDescription>
    selectedTexture.value = customEvent.detail

    // Generate preview if it doesn't have a thumbnail
    if (!selectedTexture.value.thumbnail) {
      selectedTexture.value.thumbnail = await textureGenerator.generateImage(selectedTexture.value)
    }

    if (!selectedTexture.value.prompt || !Form.value) return
    Form.value.prompt = selectedTexture.value.prompt
  })
  window.addEventListener('spriteCleared', () => {
    selectedTexture.value = null
  })
})
</script>
<style scoped>
.pixelated {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>
