<template>
  <div class="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 space-y-4 w-80">
    <input
      v-model="prompt"
      placeholder="Describe your sprite..."
      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <input
      v-model="apiKey"
      placeholder="OpenRouter API Key"
      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
      @click="generateSprite"
      class="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
    >
      Generate Sprite
    </button>

    <div v-if="selectedSprite" class="mt-4 text-center">
      <h3 class="text-gray-700 font-bold">Selected Sprite: {{ selectedSprite.name }}</h3>
      <canvas ref="spriteCanvas" class="mx-auto mt-2"></canvas>
    </div>
  </div>
</template>


<script setup lang="ts">
import { GenerateSpriteMessages } from '@/data/prompt';
import { ref, onMounted, watch, nextTick } from 'vue';
import { useLocalStorage } from '@vueuse/core'

const prompt = useLocalStorage('sprite-prompt', '');
const apiKey = useLocalStorage('openrouter-api-key', '');
const selectedSprite = ref<TextureDescription | null>(null);
const spriteCanvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  window.addEventListener('spriteSelected', async (event: Event) => {
    const customEvent = event as CustomEvent<TextureDescription>;
    selectedSprite.value = customEvent.detail;

    // Ensure the DOM updates before drawing
    await nextTick();
    drawSprite(customEvent.detail);
  });
});

watch(selectedSprite, async (newSprite) => {
  if (newSprite && spriteCanvas.value) {
    spriteCanvas.value.width = newSprite.size * 2;
    spriteCanvas.value.height = newSprite.size * 2;

    await nextTick();
    drawSprite(newSprite);
  }
});

function drawSprite(texture: TextureDescription) {
  if (!spriteCanvas.value) return;
  const ctx = spriteCanvas.value.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, spriteCanvas.value.width, spriteCanvas.value.height);

  texture.layers.forEach(layer => {
    ctx.fillStyle = layer.color;
    ctx.strokeStyle = layer.color;
    ctx.lineWidth = layer.lineWidth || 1;

    if (layer.type === 'rect' && layer.x !== undefined && layer.y !== undefined) {
      ctx.fillRect(layer.x * 2, layer.y * 2, layer.width! * 2, layer.height! * 2);
    } else if (layer.type === 'circle' && layer.x !== undefined && layer.y !== undefined) {
      ctx.beginPath();
      ctx.arc(layer.x * 2, layer.y * 2, layer.radius! * 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (layer.type === 'line' && layer.x !== undefined && layer.y !== undefined && layer.x2 !== undefined && layer.y2 !== undefined) {
      ctx.beginPath();
      ctx.moveTo(layer.x * 2, layer.y * 2);
      ctx.lineTo(layer.x2 * 2, layer.y2 * 2);
      ctx.stroke();
    }
  });
}

async function generateSprite() {
  if (!prompt.value.trim()) return;
  if (!apiKey.value.trim()) return;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Uncomment and set your API key if required:
        'Authorization': `Bearer ${apiKey.value}`,
      },
      body: JSON.stringify({ messages: GenerateSpriteMessages(prompt.value), model: 'cohere/command-r', temperature: 0.01 }),
    });

    if (!response.ok) {
      console.error('API error', response.statusText);
      return;
    }

    const data = await response.json();
    let msg: string = data.choices[0].message.content.trim();
    let lines = msg.split('\n');
    if (lines[0].startsWith('```')) {
      msg = lines.slice(1).join('\n');
      lines = msg.split('\n');
    }
    if (lines[lines.length - 1].startsWith('```')) {
      msg = lines.slice(0, lines.length - 1).join('\n');
    }
    console.log('Received sprite data:', msg);

    const newTexture = JSON.parse(msg) as TextureDescription;

    window.dispatchEvent(new CustomEvent('newTexture', { detail: newTexture }));

    prompt.value = '';
  } catch (error) {
    console.error('Error generating sprite:', error);
  }
}
</script>

<style scoped>
.sprite-generator {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 4px;
}
.sprite-generator h3 {
  color: gray;
}
.sprite-generator input {
  padding: 5px;
  margin-right: 5px;
}
</style>
