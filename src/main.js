import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import vuetify from './plugins/vuetify';

import './assets/style.css'
import store from './store'
import router from './router'

Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App),
  store,
  router
}).$mount('#app')
