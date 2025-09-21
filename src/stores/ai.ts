import { defineStore } from 'pinia'
import { ref, computed, watch, onMounted, nextTick, reactive } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { Ollama } from 'ollama/browser'
import { delay } from '@/utils'

type Provider = 'openrouter' | 'ollama'
type Model = { id: string; name: string }

export const useAIStore = defineStore('ai', () => {
  const provider = useLocalStorage<Provider>('ai-provider', 'ollama')
  const apiKey = useLocalStorage('openrouter-api-key', '')
  const ollamaHost = useLocalStorage('ollama-host', 'http://localhost:11434')
  const selectedModel = useLocalStorage('selected-model', 'cohere/command-r')
  const models = ref<Model[]>([])
  const isLoading = ref(false)

  const FAVORITE_MODELS = ['cohere/command-r' /* add more */]
  const favoriteModelIds = useLocalStorage<string[]>('favorite-models', FAVORITE_MODELS)
  const favoriteModels = ref<Model[]>([])
  const isFavorite = (id: string) => {
    return FAVORITE_MODELS.includes(id) || favoriteModelIds.value.includes(id)
  }

  const fetchModels = async () => {
    models.value = []
    let modelsArr: any
    if (provider.value === 'openrouter') {
      if (!apiKey.value.trim()) {
        console.error('API key required for OpenRouter')
        return
      }
      try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            Authorization: `Bearer ${apiKey.value}`,
          },
        })
        if (!response.ok) throw new Error(`Failed to fetch models: ${response.statusText}`)
        const data = await response.json()
        modelsArr = data.data.map((m: any) => ({
          id: m.id,
          name: m.name,
        }))
      } catch (error) {
        console.error('Error fetching OpenRouter models:', error)
      }
    } else if (provider.value === 'ollama') {
      try {
        const ollama = new Ollama({ host: ollamaHost.value })
        const { models: ollamaModels } = await ollama.list()
        const m = ollamaModels.map((m: any) => ({
          id: m.name,
          name: m.name,
        }))
        modelsArr = [...m]
      } catch (error) {
        console.error('Error fetching Ollama models:', error)
      }
    }

    if (modelsArr) {
      models.value.length = 0
      models.value.push(...modelsArr)
      models.value.sort((a, b) => {
        const aFav = isFavorite(a.id)
        const bFav = isFavorite(b.id)
        return aFav === bFav ? 0 : aFav ? -1 : 1
      })

      favoriteModels.value.length = 0
      favoriteModels.value.push(...models.value.filter((m) => isFavorite(m.id)))
    }
  }

  const generate = async (
    modelId: string,
    messages: any[],
    options: { temperature?: number } = { temperature: 0.01 },
  ): Promise<string> => {
    isLoading.value = true
    try {
      let content: string
      if (provider.value === 'openrouter') {
        // there's an issue here where the request finishes before isLoading is toggled / the button is active again
        // this only seems to happen with openrouter, even when ollama takes only a few seconds before ui is instantly responsive again
        if (!apiKey.value.trim()) throw new Error('API key required for OpenRouter')
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey.value}`,
            },
            body: JSON.stringify({
              model: modelId,
              messages,
              ...options,
            }),
          })
          if (!response.ok) throw new Error(`API error: ${response.statusText}`)
          const data = await response.json()
          content = data.choices[0]?.message?.content?.trim() || ''
        } catch (error) {
          console.error('Error generating with OpenRouter:', error)
          throw error
        }
      } else if (provider.value === 'ollama') {
        try {
          const ollama = new Ollama({ host: ollamaHost.value })
          const { message } = await ollama.chat({
            model: modelId,
            messages,
            ...options,
          })
          content = message.content.trim()
        } catch (error) {
          console.error('Error generating with Ollama:', error)
          throw error
        }
      } else {
        throw new Error('Unknown provider')
      }

      // Strip markdown code blocks
      const lines = content.split('\n')
      if (lines[0]?.startsWith('```')) lines.shift()
      if (lines[lines.length - 1]?.startsWith('```')) lines.pop()
      return lines.join('\n')
    } finally {
      isLoading.value = false
    }
  }

  // Refetch on provider change
  onMounted(() => nextTick(fetchModels))
  watch(provider, () => nextTick(fetchModels))
  watch(ollamaHost, () => {
    if (provider.value === 'ollama') nextTick(fetchModels)
  })

  return {
    provider,
    apiKey,
    ollamaHost,
    selectedModel,
    models,
    isLoading,
    fetchModels,
    generate,
    favoriteModels,
    favoriteModelIds,
    isFavorite,
  }
})
