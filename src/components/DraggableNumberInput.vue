<template>
  <div class="draggable-number-input w-full flex flex-col gap-1 my-2">
    <label v-if="label" class="cursor-ew-resize select-none" @mousedown="startDrag">{{ label }}</label>
    <input :value="modelValue" type="number" :class="inputClass" @input="handleInput" @mousedown="startDrag"
      @wheel.prevent="handleWheel" />
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

  isDragging.value = true
  startValue.value = props.modelValue
  startMouseX.value = event.clientX

  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  event.preventDefault()
}

function handleDrag(event: MouseEvent) {
  if (!isDragging.value) return

  const deltaX = event.clientX - startMouseX.value
  const deltaValue = deltaX * props.sensitivity * props.step
  let newValue = startValue.value + deltaValue

  if (props.min !== undefined) newValue = Math.max(props.min, newValue)
  if (props.max !== undefined) newValue = Math.min(props.max, newValue)

  emit('update:modelValue', Math.round(newValue / props.step) * props.step)
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

function handleWheel(event: WheelEvent) {
  const delta = event.deltaY > 0 ? -props.step : props.step
  let newValue = props.modelValue + delta

  if (props.min !== undefined) newValue = Math.max(props.min, newValue)
  if (props.max !== undefined) newValue = Math.min(props.max, newValue)

  emit('update:modelValue', newValue)
}
</script>
