import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 } from 'uuid'

export const useTexturesStore = defineStore('textures', () => {
  const generatedTextures = ref<TextureDescription[]>([])

  function addGeneratedTexture(texture: TextureDescription) {
    generatedTextures.value.push({ ...texture, id: v4(), generated: true })
    save()
  }

  function removeGeneratedTexture(id: string) {
    const index = generatedTextures.value.findIndex((t) => t.id === id)
    if (index > -1) {
      generatedTextures.value.splice(index, 1)
      save()
    }
  }

  function updateGeneratedTextureName(id: string, newName: string) {
    const index = generatedTextures.value.findIndex((t) => t.id === id)
    if (generatedTextures.value[index]) {
      generatedTextures.value[index].name = newName
      save()
    }
  }

  function updateGeneratedTexture(id: string, updated: TextureDescription) {
    const index = generatedTextures.value.findIndex((t) => t.id === id)
    if (index > -1) {
      updated.generated = true
      generatedTextures.value[index] = updated
      save()
    }
  }

  function load() {
    const savedTextures = localStorage.getItem('generatedTextures')
    if (savedTextures) {
      const data = JSON.parse(savedTextures)
      generatedTextures.value = Array.isArray(data)
        ? data.map((t: any) => ({ ...t, generated: true }))
        : []
    }
  }

  function save() {
    localStorage.setItem('generatedTextures', JSON.stringify(generatedTextures.value))
  }

  return {
    generatedTextures,
    addGeneratedTexture,
    removeGeneratedTexture,
    updateGeneratedTextureName,
    updateGeneratedTexture,
    load,
    save,
  }
})
