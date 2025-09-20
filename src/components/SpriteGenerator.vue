<template>
  <div>
    <GeneratorForm ref="Form" placeholder="Describe your sprite...">
      <template #button>
        <button :disabled="!canSend" @click="generateSprite"
          class="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50">
          <span v-if="!isLoading">Generate Sprite</span>
          <span v-else class="flex items-center justify-center">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Generating...
          </span>
        </button>
      </template>
    </GeneratorForm>
    <!-- <div :class="[selectedTexture ? '' : 'invisible', 'bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 space-y-4 w-80 mx-auto']">
      <div class="bg-gray-700 p-2 rounded-md">
        <h3 class="text-lg font-bold mb-2">Selected Sprite Data</h3>
        <JsonViewer
          :data="selectedTexture || {}"
          class="text-sm bg-gray-800 p-2 rounded-md max-h-[40vh] w-[20vw] overflow-auto"
        />
      </div>
    </div> -->
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import JsonViewer from '@/components/JsonViewer/Viewer.vue'
import GeneratorForm from '@/components/GeneratorForm.vue'
import { GenerateSpriteMessages } from '@/data/prompt'
import { useAIStore } from '@/stores/ai'

const Form = ref<typeof GeneratorForm>()

const store = useAIStore()

const selectedTexture = ref<TextureDescription | null>(null)
const isLoading = ref(false)

const canSend = computed(() => {
  if (isLoading.value) return false;
  const form = Form.value
  if (!form) return false
  if (!form.prompt) return false;
  return true;
})

async function generateSprite() {
  const form = Form.value
  if (!form) return

  const p = form.prompt
  if (!p.trim() || !store.selectedModel) return

  isLoading.value = true
  try {
    const content = await store.generate(
      store.selectedModel,
      GenerateSpriteMessages(p),
      { temperature: 0.01 }
    )

    const newTexture = JSON.parse(content) as TextureDescription
    window.dispatchEvent(new CustomEvent('newTexture', { detail: newTexture }))
    form.prompt = ''
  } catch (error) {
    console.error('Error generating sprite:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  window.addEventListener('spriteSelected', (event: Event) => {
    const customEvent = event as CustomEvent<TextureDescription>
    selectedTexture.value = customEvent.detail
  })
  window.addEventListener('spriteCleared', () => {
    selectedTexture.value = null
  })
})
</script>
