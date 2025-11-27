import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useSettingsStore = defineStore('settings', () => {
  const apiKey = useLocalStorage('openrouter-api-key', '')
  const redrawSpeed = useLocalStorage('redraw-speed', 1000)
  const canvasBackgroundColor = useLocalStorage('canvas-bg-color', '#1f2937')

  return {
    apiKey,
    redrawSpeed,
    canvasBackgroundColor,
  }
})
