<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button variant="outline" role="combobox" :aria-expanded="open" class="w-full justify-between"> {{selectedItem ?
        items.find((m) => m.id === selectedItem)?.name || 'Select Model...' : 'Select Model...'}}
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-full p-0 bg-gray-900 border border-gray-700 rounded-md">
      <Command class="text-gray-300">
        <CommandInput placeholder="Search model..." />
        <CommandEmpty>No model found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <CommandItem v-for="item in sortedItems" :key="item.id" @select="selectModel(item.id)" :value="item"
              class="flex justify-between cursor-pointer">
              <div class="flex items-center">
                <Check :class="cn('mr-2 h-4 w-4', selectedItem === item.id ? 'opacity-100' : 'opacity-0')
                  " /> {{ item.name }}
              </div>
              <button class="ml-2 text-yellow-400 hover:text-yellow-300" @click.stop="toggleFavorite(item.id)"> {{
                ai.isFavorite(item.id) ? '★' : '☆' }} </button>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-vue-next'
import { useLocalStorage } from '@vueuse/core'
import FAVORITE_MODELS from '@/data/model-favorites'
import { useAIStore } from '@/stores/ai'

const props = defineProps<{
  items: { id: string; name: string }[]
  selectedItem: string
}>()

const emit = defineEmits(['update:selectedItem'])

const open = ref(false)
const ai = useAIStore();

const toggleFavorite = (id: string) => {
  if (ai.isFavorite(id)) {
    ai.favoriteModelIds = ai.favoriteModelIds.filter((fav) => fav !== id)
  } else {
    ai.favoriteModelIds.push(id)
  }
  ai.fetchModels();
}

const selectModel = (id: string) => {
  emit('update:selectedItem', id)
  open.value = false
}

const sortedItems = computed(() =>
  [...props.items].sort((a, b) => {
    const aFav = ai.isFavorite(a.id) ? 1 : 0
    const bFav = ai.isFavorite(b.id) ? 1 : 0

    // First, sort by favorite status (favorites first)
    if (aFav !== bFav) return bFav - aFav

    // Then, sort alphabetically
    return a.name.localeCompare(b.name)
  }),
)
</script>
