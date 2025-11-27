import { defineStore } from 'pinia'
import { ref, computed, watch, onMounted, nextTick, reactive } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { Ollama } from 'ollama/browser'
import { delay } from '@/utils'
import { useSettingsStore } from './settings'

type Provider = 'openrouter' | 'ollama'
type Model = { id: string; name: string }

type ReasoningEffort = 'high' | 'medium' | 'low' | 'minimal' | 'none'

export const useAIStore = defineStore('ai', () => {
  const provider = useLocalStorage<Provider>('ai-provider', 'ollama')
  const ollamaHost = useLocalStorage('ollama-host', 'http://localhost:11434')
  const selectedModel = useLocalStorage('selected-model', 'cohere/command-r')
  const reasoningEffort = useLocalStorage<ReasoningEffort>('reasoning-effort', 'low')
  const models = ref<Model[]>([])
  const isLoading = ref(false)
  const isThinking = ref(false)

  const FAVORITE_MODELS = ['cohere/command-r' /* add more */]
  const favoriteModelIds = useLocalStorage<string[]>('favorite-models', FAVORITE_MODELS)
  const favoriteModels = ref<Model[]>([])
  const isFavorite = (id: string) => {
    return FAVORITE_MODELS.includes(id) || favoriteModelIds.value.includes(id)
  }

  const settingsStore = useSettingsStore()

  const fetchModels = async () => {
    models.value = []
    let modelsArr: any
    if (provider.value === 'openrouter') {
      if (!settingsStore.apiKey.trim()) {
        console.error('API key required for OpenRouter')
        return
      }
      try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            Authorization: `Bearer ${settingsStore.apiKey}`,
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

  const abortController = ref<AbortController | null>(null)

  const cancel = () => {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
      isLoading.value = false
      isThinking.value = false
    }
  }

  const generate = async (
    modelId: string,
    messages: any[],
    options: { temperature?: number; onProgress?: (partial: string) => void } = {
      temperature: 0.01,
    },
  ): Promise<string> => {
    isLoading.value = true
    isThinking.value = false
    abortController.value = new AbortController()

    try {
      let content = ''
      if (provider.value === 'openrouter') {
        if (!settingsStore.apiKey.trim()) throw new Error('API key required for OpenRouter')
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${settingsStore.apiKey}`,
            },
            body: JSON.stringify({
              model: modelId,
              messages,
              stream: true,
              reasoning: {
                effort: reasoningEffort.value,
                exclude: true,
              },
              ...options,
            }),
            signal: abortController.value.signal,
          })

          if (!response.ok) throw new Error(`API error: ${response.statusText}`)
          if (!response.body) throw new Error('No response body')

          const reader = response.body.getReader()
          const decoder = new TextDecoder()

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n').filter((line) => line.trim() !== '')

            for (const line of lines) {
              if (line === 'data: [DONE]') continue
              if (line.startsWith(': OPENROUTER PROCESSING')) {
                isThinking.value = true
                continue
              }
              if (line.startsWith('data: ')) {
                isThinking.value = false // Stop thinking when data arrives
                try {
                  const data = JSON.parse(line.slice(6))
                  let delta = data.choices[0]?.delta?.content || ''
                  content += delta
                  if (options.onProgress) options.onProgress(content)
                } catch (e) {
                  console.warn('Error parsing stream chunk', e, line)
                }
              }
            }
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            console.log('Generation cancelled')
            return content // Return what we have so far
          }
          console.error('Error generating with OpenRouter:', error)
          throw error
        }
      } else if (provider.value === 'ollama') {
        try {
          const ollama = new Ollama({ host: ollamaHost.value })
          // Ollama-js doesn't seem to support signal in chat options directly in types,
          // but we can break the loop if aborted.
          // Actually, we can check abortController.signal.aborted in the loop.

          const response = await ollama.chat({
            model: modelId,
            messages,
            format: 'json',
            stream: true,
            ...options,
          })

          for await (const part of response) {
            if (abortController.value?.signal.aborted) {
              // Ollama request might still continue in background unless we can abort it,
              // but at least we stop processing.
              // TODO: Check if ollama-js supports aborting.
              break
            }
            content += part.message.content
            if (options.onProgress) options.onProgress(content)
          }
        } catch (error) {
          console.error('Error generating with Ollama:', error)
          throw error
        }
      } else {
        throw new Error('Unknown provider')
      }

      // Extract content from within markdown code blocks
      const lines = content.split('\n')
      const startIdx = lines.findIndex((line: string) => line.startsWith('```'))

      // Find last occurrence of code fence
      let endIdx = -1
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].startsWith('```')) {
          endIdx = i
          break
        }
      }

      // If we found code fences, extract only the content between them
      if (startIdx !== -1 && endIdx !== -1 && startIdx !== endIdx) {
        return lines.slice(startIdx + 1, endIdx).join('\n')
      }

      // Otherwise return the full content
      return content
    } finally {
      isLoading.value = false
      abortController.value = null
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
    ollamaHost,
    selectedModel,
    reasoningEffort,
    models,
    isLoading,
    isThinking,
    fetchModels,
    generate,
    cancel,
    favoriteModels,
    favoriteModelIds,
    isFavorite,
  }
})
