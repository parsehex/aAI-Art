<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-300">Pattern Type</label>
      <select :value="layer.patternType" class="w-full p-2 bg-gray-700 text-white rounded"
        @change="updatePatternType($event)">
        <option value="checkerboard">Checkerboard</option>
        <option value="stripes">Stripes</option>
        <option value="dots">Dots</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-300">Color 1</label>
      <input :value="layer.color1" type="color" class="w-full p-2 bg-gray-700 text-white rounded"
        @input="updateColor1($event)" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-300">Color 2</label>
      <input :value="layer.color2" type="color" class="w-full p-2 bg-gray-700 text-white rounded"
        @input="updateColor2($event)" />
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

function updatePatternType(event: Event) {
  const target = event.target as HTMLSelectElement
  const updatedLayer = { ...props.layer, patternType: target.value as 'checkerboard' | 'stripes' | 'dots' }
  emit('update:layer', updatedLayer)
}

function updateColor1(event: Event) {
  const target = event.target as HTMLInputElement
  const updatedLayer = { ...props.layer, color1: target.value }
  emit('update:layer', updatedLayer)
}

function updateColor2(event: Event) {
  const target = event.target as HTMLInputElement
  const updatedLayer = { ...props.layer, color2: target.value }
  emit('update:layer', updatedLayer)
}
</script>
