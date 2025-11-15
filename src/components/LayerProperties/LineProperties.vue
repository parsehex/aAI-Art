<template>
  <div class="gap-4 flex items-stretch">
    <DraggableNumberInput v-model="layer.x2!" label="X2" :step="1" :min="0" :max="spriteSize"
      @update:modelValue="$emit('update:layer', layer)" />
    <DraggableNumberInput v-model="layer.y2!" label="Y2" :step="1" :min="0" :max="spriteSize"
      @update:modelValue="$emit('update:layer', layer)" />
  </div>
  <DraggableNumberInput v-model="layer.lineWidth!" label="Line Width" :step="1" :min="1" :max="20"
    @update:modelValue="$emit('update:layer', layer)" />
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
</script>
