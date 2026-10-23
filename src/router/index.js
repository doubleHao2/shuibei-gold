import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import GoldPosterCalculator from '../GoldPosterCalculator.vue';
import LoanNote from '../views/LoanNote.vue';

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: Dashboard },
    { path: '/calculator', name: 'calculator', component: GoldPosterCalculator },
    { path: '/loan-note', name: 'loan-note', component: LoanNote },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});
