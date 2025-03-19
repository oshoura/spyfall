import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import LandingPage from '../views/LandingPage.vue'
import PartyLobby from '../views/PartyLobby.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/play',
      name: 'play',
      component: LandingPage
    },
    {
      path: '/lobby',
      name: 'lobby',
      component: PartyLobby
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('../views/GameRoom.vue')
    }
  ]
})

export default router 