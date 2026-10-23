import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import GoldPosterCalculator from '../GoldPosterCalculator.vue';
import LoanNote from '../views/LoanNote.vue';
import Copywriter from '../views/Copywriter.vue';
import BatchShare from '../views/BatchShare.vue';
import Catalog from '../views/Catalog.vue';

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: Dashboard },
    { path: '/calculator', name: 'calculator', component: GoldPosterCalculator },
    { path: '/loan-note', name: 'loan-note', component: LoanNote },
    { path: '/copywriter', name: 'copywriter', component: Copywriter },
    { path: '/batch-share', name: 'batch-share', component: BatchShare },
    { path: '/catalog', name: 'catalog', component: Catalog },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});
