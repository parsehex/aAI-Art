<template>
  <div class="space-y-4">
    <DraggableNumberInput v-model="layer.radius!" label="Radius" :step="1" :min="1" :max="spriteSize / 2"
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

// Reactive layer is passed via props, no need for ref
</script>
