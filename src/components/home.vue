<template>
<div class='home-container'>
  <div>
    <div class='login-container'>
      <login-form v-for='(value, index) in wemepAccount' :accountNumber='index' :accountType='"wemep"' :key='index+"wemep"'
       :accountID='value.id' :accountPW='value.pw'/>
      <div class='add-account-btn'>
        <v-btn class="mx-2" fab dark @click='addAccount("wemep")'>
          <v-icon dark>mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>

    <div class='login-container'>
      <login-form v-for='(value, index) in elevenAccount' :accountNumber='index' :accountType='"eleven"' :key='index+"eleven"'
       :accountID='value.id' :accountPW='value.pw'/>
      <div class='add-account-btn'>
        <v-btn class="mx-2" fab dark @click='addAccount("eleven")'>
          <v-icon dark>mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>

  </div>
</div>
</template>

<script>

import { mapState, mapMutations, mapActions } from 'vuex'

export default {
    name : 'home',

    components : {
      loginForm : require('./loginForm.vue').default
    },

    computed : {
      ...mapState([
        'wemepAccount', 'elevenAccount'
      ])
    },

    methods : {
        ...mapMutations([
          'INIT'
        ]),

        ...mapActions([
            'ADD',
        ]),

        addAccount(val) {
          this.ADD({type : val})
        },
    }
}
</script>

<style>

</style>