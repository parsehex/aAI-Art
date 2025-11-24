<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-300">Path Data</label>
      <textarea :value="layer.path" class="w-full p-2 bg-gray-700 text-white rounded" rows="3"
        placeholder="e.g., M10 10 L50 10 L30 50 Z" @input="updatePath($event)"></textarea>
    </div>
    <div class="flex items-center">
      <input :checked="layer.fill" type="checkbox" class="mr-2" @change="updateFill($event)" />
      <label class="text-sm font-medium text-gray-300">Fill</label>
    </div>
    <DraggableNumberInput v-model="layer.lineWidth!" label="Line Width" :step="1" :min="0" :max="20"
      @update:modelValue="$emit('update:layer', layer)" />
  </div>
</template>
<script setup lang="ts">
import type { TextureLayer } from '@/types/Textures';
import DraggableNumberInput from '../DraggableNumberInput.vue'

interface Props {
  layer: TextureLayer
  spriteSize: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:layer': [layer: TextureLayer]
}>()

function updatePath(event: Event) {
  const target = event.target as HTMLTextAreaElement
  const updatedLayer = { ...props.layer, path: target.value }
  emit('update:layer', updatedLayer)
}

function updateFill(event: Event) {
  const target = event.target as HTMLInputElement
  const updatedLayer = { ...props.layer, fill: target.checked }
  emit('update:layer', updatedLayer)
}
</script>
