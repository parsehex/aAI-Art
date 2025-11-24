<template>
  <div class="space-y-4">
    <DraggableNumberInput v-model="layer.width!" label="Width" :step="1" :min="1" :max="spriteSize"
      @update:modelValue="$emit('update:layer', layer)" />
    <DraggableNumberInput v-model="layer.height!" label="Height" :step="1" :min="1" :max="spriteSize"
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
</script>
