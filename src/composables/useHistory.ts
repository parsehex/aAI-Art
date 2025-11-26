import { ref, computed } from 'vue'

export function useHistory<T>(initialState?: T) {
  const history = ref<T[]>([])
  const index = ref(-1)

  if (initialState !== undefined) {
    history.value.push(JSON.parse(JSON.stringify(initialState)))
    index.value = 0
  }

  const canUndo = computed(() => index.value > 0)
  const canRedo = computed(() => index.value < history.value.length - 1)

  function record(state: T) {
    // If we are not at the end of history, truncate future
    if (index.value < history.value.length - 1) {
      history.value = history.value.slice(0, index.value + 1)
    }

    // Deep copy state to avoid reference issues
    const stateCopy = JSON.parse(JSON.stringify(state))
    history.value.push(stateCopy)
    index.value++
  }

  function undo(): T | null {
    if (canUndo.value) {
      index.value--
      return JSON.parse(JSON.stringify(history.value[index.value]))
    }
    return null
  }

  function redo(): T | null {
    if (canRedo.value) {
      index.value++
      return JSON.parse(JSON.stringify(history.value[index.value]))
    }
    return null
  }

  function reset(state: T) {
    const stateCopy = JSON.parse(JSON.stringify(state))
    history.value = [stateCopy]
    index.value = 0
  }

  return {
    history,
    index,
    canUndo,
    canRedo,
    record,
    undo,
    redo,
    reset,
  }
}
