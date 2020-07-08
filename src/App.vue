
<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-model="drawer"
      app
    >
      <v-list dense>

        <v-list-item link to='/'>
          <v-list-item-action>
            <v-img class='cmrc-icon' :src="require('./assets/wemep.png')" />
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>위메프</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link to='/11st'>
          <v-list-item-action>
            <v-img class='cmrc-icon' :src="require('./assets/11st.png')" />
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>11번가</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      app
      dark
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>오픈커머스 자동 업로드</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
    <v-footer
      app
      color='black'
    >
      <span class="white--text">&copy; 2020 Jyuns</span>
    </v-footer>
  </v-app>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  data: () => ({
    drawer: null,
  }),

    created() {
      this.INIT()
      this.$forceUpdate()
    },

    methods : {
        ...mapMutations([
          'INIT'
        ]),
    }
}
</script>

<style scoped>



</style>