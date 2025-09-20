import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTexturesStore = defineStore('textures', () => {
  const generatedTextures = ref<TextureDescription[]>([])

  function addGeneratedTexture(texture: TextureDescription) {
    generatedTextures.value.push({ ...texture, generated: true })
    save()
  }

  function removeGeneratedTextureByIndex(index: number) {
    generatedTextures.value.splice(index, 1)
    save()
  }

  function updateGeneratedTextureName(index: number, newName: string) {
    if (generatedTextures.value[index]) {
      generatedTextures.value[index].name = newName
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
    removeGeneratedTextureByIndex,
    updateGeneratedTextureName,
    load,
    save,
  }
})
