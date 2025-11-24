import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 } from 'uuid'
import type { TextureDescription } from '@/types/Textures'

export const useTexturesStore = defineStore('textures', () => {
  const generatedTextures = ref<TextureDescription[]>([])
  const presetThumbnails = ref<Record<string, string>>({})

  function save() {
    localStorage.setItem('generatedTextures', JSON.stringify(generatedTextures.value))
  }

  function addGeneratedTexture(texture: TextureDescription) {
    generatedTextures.value.push({ ...texture, id: texture.id || v4(), generated: true })
    save()
  }

  function updateGeneratedTexture(id: string, updated: TextureDescription) {
    const index = generatedTextures.value.findIndex((t) => t.id === id)
    if (index > -1) {
      updated.generated = true
      generatedTextures.value[index] = updated
      save()
    } else {
      // If not found, maybe it was a preset being edited for the first time?
      // But usually we should use addGeneratedTexture for that.
      // If we want to support "update or add", we can check here.
      addGeneratedTexture(updated)
    }
  }

  function removeGeneratedTexture(id: string) {
    const index = generatedTextures.value.findIndex((t) => t.id === id)
    if (index > -1) {
      generatedTextures.value.splice(index, 1)
      save()
    }
  }

  function updateTextureName(id: string, name: string) {
    const texture = generatedTextures.value.find((t: TextureDescription) => t.id === id)
    if (texture) {
      texture.name = name
      save()
    }
  }

  function savePresetThumbnail(id: string, url: string) {
    presetThumbnails.value[id] = url
    localStorage.setItem('presetThumbnails', JSON.stringify(presetThumbnails.value))
  }

  function load() {
    const savedTextures = localStorage.getItem('generatedTextures')
    if (savedTextures) {
      const data = JSON.parse(savedTextures)
      generatedTextures.value = Array.isArray(data)
        ? data.map((t: any) => ({ ...t, generated: true }))
        : []
    }

    const savedThumbnails = localStorage.getItem('presetThumbnails')
    if (savedThumbnails) {
      presetThumbnails.value = JSON.parse(savedThumbnails)
    }
  }

  return {
    generatedTextures,
    presetThumbnails,
    addGeneratedTexture,
    updateGeneratedTexture,
    removeGeneratedTexture,
    updateTextureName,
    savePresetThumbnail,
    load,
  }
})
