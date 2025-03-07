import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'
import PartyLobby from '../views/PartyLobby.vue'
import GameRoom from '../views/GameRoom.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
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
      component: GameRoom
    }
  ]
})

export default router 