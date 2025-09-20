<template>
  <div class="sprite-list overflow-y-auto h-full border-r border-gray-700 pr-2">
    <button @click="togglePresets" class="w-full bg-gray-700 text-white p-2 rounded-md hover:bg-gray-600 mb-2"> {{
      showPresets ? 'Hide Presets' : 'Show Presets' }} </button>
    <div v-for="texture in visibleTextures" :key="`texture-${texture.id}`"
      class="sprite-item flex items-center space-x-2 p-2 hover:bg-gray-800 cursor-pointer" @click="() => {
        if (texture.generated && texture.id === editingId) return;
        selectSprite(texture)
      }">
      <div v-if="(texture as any).thumbnail" class="w-16 h-16 rounded flex-shrink-0">
        <img :src="(texture as any).thumbnail" :alt="texture.name"
          class="w-16 h-16 object-contain rounded bg-gray-800" />
      </div>
      <div v-else class="w-16 h-16 bg-gray-600 flex items-center justify-center rounded flex-shrink-0">
        <span class="text-xs text-center px-1">{{ texture.name }}</span>
      </div>
      <div class="flex-1 ml-2 text-sm">
        <span v-if="texture.generated && texture.id === editingId">
          <input v-model="editingName" @blur="finishEdit(texture.id)" @keyup.enter="finishEdit(texture.id)"
            class="bg-transparent text-white border-none focus:outline-none w-full" autofocus />
        </span>
        <span v-else>{{ texture.name }}</span>
      </div>
      <button v-if="texture.generated && texture.id === editingId" @click.stop="finishEdit(texture.id)"
        class="ml-2 text-yellow-400 hover:text-yellow-600 text-lg">
        <Check class="w-4 h-4" />
      </button>
      <button v-if="texture.generated && texture.prompt" @click.stop="regenerateSprite(texture)"
        :disabled="aiStore.isLoading" class="ml-2 text-green-400 hover:text-green-600 text-lg disabled:opacity-50"
        title="Regenerate">
        <RefreshCw class="w-4 h-4" />
      </button>
      <button v-if="texture.generated && texture.id !== editingId" @click.stop="startEdit(texture.id, texture.name)"
        class="ml-2 text-blue-400 hover:text-blue-600 text-lg">
        <Pencil class="w-4 h-4" />
      </button>
      <button v-if="texture.generated" @click.stop="store.removeGeneratedTexture(texture.id)"
        class="ml-2 text-red-400 hover:text-red-600 text-xl font-bold">
        <!-- X icon is a little small -->
        <X class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { presetTextures } from '@/data/preset-textures/registry'
import { useTexturesStore } from '@/stores/textures'
import { useAIStore } from '@/stores/ai'
import { Check, Pencil, X, RefreshCw } from 'lucide-vue-next'
import { GenerateSpriteMessages } from '@/data/prompt'

const store = useTexturesStore()
const aiStore = useAIStore()
const showPresets = ref(true)
const editingId = ref<string | null>(null)
const editingName = ref('')

onMounted(() => {
  const saved = localStorage.getItem('showPresets')
  if (saved !== null) {
    showPresets.value = saved === 'true'
  }
})

function togglePresets() {
  showPresets.value = !showPresets.value
  localStorage.setItem('showPresets', showPresets.value.toString())
}

const visibleTextures = computed(() => {
  return showPresets.value ? [...presetTextures, ...store.generatedTextures] : store.generatedTextures
})

function selectSprite(texture: TextureDescription) {
  // Dispatch the event to notify our Phaser scene to render the sprite.
  window.dispatchEvent(new CustomEvent('spriteSelected', { detail: texture }))
}

function regenerateSprite(texture: TextureDescription) {
  if (!texture.prompt) return
  window.dispatchEvent(new CustomEvent('regenerateTexture', { detail: { id: texture.id, prompt: texture.prompt } }))
}

function startEdit(id: string, name: string) {
  editingId.value = id
  editingName.value = name
}

function finishEdit(id: string) {
  if (editingId.value === id && editingName.value.trim()) {
    store.updateGeneratedTextureName(id, editingName.value)
    editingId.value = null
  }
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
