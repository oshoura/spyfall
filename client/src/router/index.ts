import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import LandingPage from '../views/LandingPage.vue'
import PartyLobby from '../views/PartyLobby.vue'
import GameRoom from '../views/GameRoom.vue'
import HowToPlay from '../views/HowToPlay.vue'
// import TestPage from '../views/TestPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
      meta: {
        title: 'Spyfall Online | Free Social Deduction Party Game',
        description: 'Play Spyfall online for free. Create a room, invite friends, and find the spy before the spy finds you.',
        keywords: ['spyfall', 'spyfall game', 'play spyfall', 'online spyfall', 'party game', 'social deduction'],
      }
    },
    {
      path: '/play',
      name: 'play',
      component: LandingPage,
      meta: {
        title: 'Play Spyfall Online | Create or Join a Game',
        description: 'Start a Spyfall game in seconds. Create a party or join with a code to play with friends.',
        keywords: ['play spyfall', 'join spyfall game', 'create spyfall room', 'online spyfall', 'spyfall with friends'],
      }
    },
    {
      path: '/lobby',
      name: 'lobby',
      component: PartyLobby,
      meta: {
        title: 'Spyfall Lobby | Invite Friends and Get Ready',
        description: 'Invite friends, pick location packs, and get ready to play Spyfall.',
        robots: 'noindex, nofollow'
      }
    },
    {
      path: '/game',
      name: 'game',
      component: GameRoom,
      meta: {
        title: 'Spyfall Game Room',
        description: 'Live Spyfall round in progress. Join your friends to play the spy game online.',
        robots: 'noindex, nofollow'
      }
    },
    {
      path: '/how-to-play',
      name: 'how-to-play',
      component: HowToPlay,
      meta: {
        title: 'How to Play Spyfall | Rules, Roles, and Strategy',
        description: 'Learn how to play Spyfall: roles, rules, and strategies for winning as spy or regular player.',
        keywords: ['how to play spyfall', 'spyfall rules', 'spyfall strategy', 'spyfall guide']
      }
    },
    // {
    //   path: '/hidden',
    //   name: 'test-page',
    //   component: TestPage
    // }
  ]
})

export default router 