<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-300">Points</label>
      <textarea :value="pointsString" class="w-full p-2 bg-gray-700 text-white rounded" rows="3"
        placeholder="e.g., [10,10],[50,10],[30,50]" @input="updatePoints($event)"></textarea>
    </div>
    <DraggableNumberInput v-model="layer.lineWidth!" label="Line Width" :step="1" :min="0" :max="20"
      @update:modelValue="$emit('update:layer', layer)" />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import DraggableNumberInput from '../DraggableNumberInput.vue'

interface Props {
  layer: TextureLayer
  spriteSize: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:layer': [layer: TextureLayer]
}>()

const pointsString = computed(() => {
  return props.layer.points?.map(point => `[${point[0]},${point[1]}]`).join(',') || ''
})

function updatePoints(event: Event) {
  const target = event.target as HTMLTextAreaElement
  const value = target.value
  let points: [number, number][] = []
  try {
    const parsed = value.split(',').map(s => {
      const match = s.trim().match(/\[(\d+),(\d+)\]/)
      return match ? [parseInt(match[1]), parseInt(match[2])] : null
    }).filter(p => p) as [number, number][]
    points = parsed
  } catch (e) {
    // Invalid input, keep current points
    points = props.layer.points || []
  }
  const updatedLayer = { ...props.layer, points }
  emit('update:layer', updatedLayer)
}
</script>
