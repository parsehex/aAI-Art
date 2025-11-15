<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-300">Color Start</label>
      <input :value="layer.colorStart" type="color" class="w-full p-2 bg-gray-700 text-white rounded"
        @input="updateColorStart($event)" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-300">Color End</label>
      <input :value="layer.colorEnd" type="color" class="w-full p-2 bg-gray-700 text-white rounded"
        @input="updateColorEnd($event)" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-300">Direction</label>
      <select :value="layer.direction" class="w-full p-2 bg-gray-700 text-white rounded"
        @change="updateDirection($event)">
        <option value="horizontal">Horizontal</option>
        <option value="vertical">Vertical</option>
      </select>
    </div>
    <DraggableNumberInput v-model="layer.width!" label="Width" :step="1" :min="1" :max="spriteSize"
      @update:modelValue="$emit('update:layer', layer)" />
    <DraggableNumberInput v-model="layer.height!" label="Height" :step="1" :min="1" :max="spriteSize"
      @update:modelValue="$emit('update:layer', layer)" />
  </div>
</template>
<script setup lang="ts">
import DraggableNumberInput from '../DraggableNumberInput.vue'

interface Props {
  layer: TextureLayer
  spriteSize: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:layer': [layer: TextureLayer]
}>()

function updateColorStart(event: Event) {
  const target = event.target as HTMLInputElement
  const updatedLayer = { ...props.layer, colorStart: target.value }
  emit('update:layer', updatedLayer)
}

function updateColorEnd(event: Event) {
  const target = event.target as HTMLInputElement
  const updatedLayer = { ...props.layer, colorEnd: target.value }
  emit('update:layer', updatedLayer)
}

function updateDirection(event: Event) {
  const target = event.target as HTMLSelectElement
  const updatedLayer = { ...props.layer, direction: target.value as 'horizontal' | 'vertical' }
  emit('update:layer', updatedLayer)
}
</script>
