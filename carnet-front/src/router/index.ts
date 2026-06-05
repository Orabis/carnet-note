import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth.ts'
const { logout, isValid, token} = useAuth()
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('@/views/HomeView.vue') },
    { path: '/login', component: () => import('@/views/AuthView.vue'), name: 'Login' },
    { path: '/profil', component: () => import('@/views/ProfilView.vue'), name: 'Profil'},
    { path: '/:pathMatch(.*)*', component: () => import('@/views/404View.vue') },
  ],
})
router.beforeEach(async (to) => {
  if (to.name !== 'Login' && !isValid(token.value)) {
    logout()
    return { name: 'Login' }
  }
})
export default router
