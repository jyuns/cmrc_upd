<template>
<div class='home-container'>
  <div>
    <div class='login-container'>
      <login-form v-for='(value, index) in wemepAccount' :accountNumber='index' :accountType='"위메프"' :key='index'
       :accountID='value.id' :accountPW='value.pwd'/>
      <div class='add-account-btn'>
        <v-btn class="mx-2" fab dark @click='addAccount("위메프")'>
          <v-icon dark>mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>

    <div class='login-container'>
      <login-form v-for='i in elevenAccount.length' :accountNumber='i' :accountType='"11번가"' :key='i' />
      
      <div class='add-account-btn'>
        <v-btn class="mx-2" fab dark @click='addAccount("11번가")'>
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