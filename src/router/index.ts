import { createRouter, createWebHashHistory } from 'vue-router'
import SpriteGenerationView from '@/views/SpriteGenerationView.vue'
import SpriteEditView from '@/views/SpriteEditView.vue'
import SvgGenerationView from '@/views/SvgGenerationView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/view',
    },
    {
      path: '/view/:id?',
      name: 'sprite-generation',
      component: SpriteGenerationView,
    },
    {
      path: '/edit/:id?',
      name: 'sprite-edit',
      component: SpriteEditView,
    },
    {
      path: '/svg',
      name: 'svg-generation',
      component: SvgGenerationView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
    },
  ],
})

export default router
