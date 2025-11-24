<template>
	<div class="flex flex-row gap-4 h-[calc(100vh-150px)]">
		<SpriteList mode="edit" />
		<div class="flex-1 h-full">
			<SpriteEditor :spriteData="selectedSpriteForEditing" @spriteUpdated="handleSpriteUpdate" />
		</div>
	</div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import SpriteList from '@/components/SpriteList.vue'
import SpriteEditor from '@/components/SpriteEditor.vue'
import { useTexturesStore } from '@/stores/textures'
import { presetTextures } from '@/data/preset-textures/registry'

const route = useRoute()
const selectedSpriteForEditing = ref<TextureDescription | null>(null)
const store = useTexturesStore()

function handleSpriteUpdate(updatedSprite: TextureDescription) {
	// Check if it exists in generated textures
	const exists = store.generatedTextures.some(t => t.id === updatedSprite.id)

	if (exists) {
		store.updateGeneratedTexture(updatedSprite.id, updatedSprite)
	} else {
		// It's a new edit (possibly of a preset), add it to generated
		store.addGeneratedTexture(updatedSprite)
	}

	// Also update the local ref to ensure reactivity in SpriteEditor
	selectedSpriteForEditing.value = updatedSprite
}

// Listen for editSprite event from SpriteList
function handleEditSprite(event: Event) {
	const customEvent = event as CustomEvent<TextureDescription>
	selectedSpriteForEditing.value = customEvent.detail
}

// Load sprite from URL if ID is provided
onMounted(() => {
	window.addEventListener('editSprite', handleEditSprite)
	loadSpriteFromRoute()
})

onUnmounted(() => {
	window.removeEventListener('editSprite', handleEditSprite)
})

// Watch for route changes
watch(() => route.params.id, () => {
	loadSpriteFromRoute()
})

function loadSpriteFromRoute() {
	const spriteId = route.params.id as string | undefined
	if (spriteId) {
		// Find sprite in generated textures or presets
		const sprite = store.generatedTextures.find(t => t.id === spriteId)
			|| presetTextures.find(t => t.id === spriteId)

		if (sprite) {
			selectedSpriteForEditing.value = sprite
		}
	}
}
</script>
