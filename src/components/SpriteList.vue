<template>
  <div class="sprite-list overflow-y-auto h-full border-r border-gray-700 pr-2">
    <button @click="togglePresets" class="w-full bg-gray-700 text-white p-2 rounded-md hover:bg-gray-600 mb-2"> {{
      showPresets ? 'Hide Presets' : 'Show Presets' }} </button>
    <div v-for="(texture, allIndex) in visibleTextures" :key="`texture-${allIndex}`"
      class="sprite-item flex items-center space-x-2 p-2 hover:bg-gray-800 cursor-pointer" @click="() => {
        if (texture.generated && allIndex === editingIndex) return;
        selectSprite(texture)
      }">
      <!-- For now we display a placeholder box with the sprite name.
           In the future you might generate a thumbnail at export time -->
      <div class="w-16 h-16 bg-gray-600 flex items-center justify-center rounded">
        <span class="text-xs text-center px-1">{{ texture.name }}</span>
      </div>
      <div class="flex-1 ml-2 text-sm">
        <span v-if="texture.generated && allIndex === editingIndex">
          <input v-model="editingName" @blur="finishEdit(allIndex)" @keyup.enter="finishEdit(allIndex)"
            class="bg-transparent text-white border-none focus:outline-none w-full" autofocus />
        </span>
        <span v-else>{{ texture.name }}</span>
      </div>
      <button v-if="texture.generated && allIndex === editingIndex" @click.stop="finishEdit(allIndex)"
        class="ml-2 text-yellow-400 hover:text-yellow-600 text-lg">
        <Check class="w-4 h-4" />
      </button>
      <button v-if="texture.generated && allIndex !== editingIndex" @click.stop="startEdit(allIndex, texture.name)"
        class="ml-2 text-blue-400 hover:text-blue-600 text-lg">
        <Pencil class="w-4 h-4" />
      </button>
      <button v-if="texture.generated" @click.stop="deleteSprite(allIndex)"
        class="ml-2 text-red-400 hover:text-red-600 text-xl font-bold">
        <!-- X icon is a little small -->
        <X class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
// Import preset textures directly from our registry.
import { presetTextures } from '@/data/preset-textures/registry'
import { useTexturesStore } from '@/stores/textures'
import { Check, Pencil, X } from 'lucide-vue-next'

// Combine the preset and generated textures.
const store = useTexturesStore()
const showPresets = ref(true)
const editingIndex = ref<number | null>(null)
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

function startEdit(allIndex: number, name: string) {
  editingIndex.value = allIndex
  editingName.value = name
}

function finishEdit(allIndex: number) {
  if (editingIndex.value === allIndex && editingName.value.trim()) {
    const genIndex = showPresets.value ? allIndex - presetTextures.length : allIndex
    store.updateGeneratedTextureName(genIndex, editingName.value)
    editingIndex.value = null
  }
}

function deleteSprite(allIndex: number) {
  const genIndex = showPresets.value ? allIndex - presetTextures.length : allIndex
  store.removeGeneratedTextureByIndex(genIndex)
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
