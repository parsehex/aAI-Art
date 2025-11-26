<template>
  <button @click.stop="copy" class="text-purple-400 hover:text-purple-600 transition-colors"
    title="Copy JSON to Clipboard">
    <Clipboard class="w-4 h-4" />
  </button>
</template>
<script setup lang="ts">
import { Clipboard } from 'lucide-vue-next'

const props = defineProps<{
  data: any
}>()

async function copy() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { thumbnail, generated, ...rest } = props.data
    await navigator.clipboard.writeText(JSON.stringify(rest, null, 2))
    console.log('Texture JSON copied to clipboard')
  } catch (err) {
    console.error('Failed to copy JSON:', err)
  }
}
</script>
