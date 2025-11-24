<template>
  <div class="flex flex-col items-center min-h-screen min-w-screen text-white px-2">
    <p class="my-2"> An app to generate graphics using AI language models. All sprites and SVGs shown were created by
      prompting an LLM (bigger models are better). <a href="https://parsehex.github.io/aAI-Art/docs/">Docs</a> </p>
    <div class="w-full max-w-6xl">
      <!-- Navigation -->
      <nav class="flex space-x-4 mb-4">
        <router-link to="/view" :class="[
          'px-4 py-2 rounded-md transition',
          route.path.startsWith('/view')
            ? 'bg-blue-500 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        ]"> Generate Sprites </router-link>
        <router-link to="/edit" :class="[
          'px-4 py-2 rounded-md transition',
          route.path.startsWith('/edit')
            ? 'bg-blue-500 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        ]"> Edit Sprite </router-link>
        <router-link to="/svg" :class="[
          'px-4 py-2 rounded-md transition',
          route.path === '/svg'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        ]"> Generate SVGs </router-link>
      </nav>
      <!-- Router View -->
      <div class="w-full">
        <router-view />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTexturesStore } from '@/stores/textures'

const route = useRoute()
const store = useTexturesStore()

onMounted(() => {
  store.load()
})
</script>
<style>
.app {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 0;
  background-color: #242424;
}
</style>
