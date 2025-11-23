<template>
  <div class="draggable-number-input w-full flex flex-col gap-1 my-2">
    <label v-if="label" class="cursor-ew-resize select-none" @mousedown="startDrag">{{ label }}</label>
    <input ref="inputRef" :value="modelValue" type="number" :class="inputClass + ' cursor-ew-resize'"
      @input="handleInput" @mousedown="startDrag" @wheel="handleWheel" />
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue: number
  label?: string
  step?: number
  min?: number
  max?: number
  sensitivity?: number
  inputClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  step: 1,
  sensitivity: 0.5,
  inputClass: 'w-full p-2 bg-gray-700 text-white rounded'
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const startValue = ref(0)
const startMouseX = ref(0)

const id = computed(() => props.label?.toLowerCase().replace(/ /g, '-'));

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = parseFloat(target.value) || 0
  emit('update:modelValue', value)
}

function startDrag(event: MouseEvent) {
  if (event.button !== 0) return // Only left mouse button

  isDragging.value = false
  startValue.value = props.modelValue
  startMouseX.value = event.clientX

  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)

  // Prevent default to avoid text selection during drag
  // We will manually focus if it's a click
  event.preventDefault()
}

function handleDrag(event: MouseEvent) {
  const deltaX = event.clientX - startMouseX.value

  if (!isDragging.value && Math.abs(deltaX) > 5) {
    isDragging.value = true
  }

  if (!isDragging.value) return

  const deltaValue = deltaX * props.sensitivity * props.step
  let newValue = startValue.value + deltaValue

  if (props.min !== undefined) newValue = Math.max(props.min, newValue)
  if (props.max !== undefined) newValue = Math.min(props.max, newValue)

  emit('update:modelValue', Math.round(newValue / props.step) * props.step)
}

function stopDrag() {
  if (!isDragging.value && inputRef.value) {
    inputRef.value.focus()
  }

  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

function handleWheel(event: WheelEvent) {
  return;
}
</script>
