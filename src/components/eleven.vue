<template>
<div class='home-container'>
  <div>

    <div class='login-container'>
      <login-form v-for='(value, index) in elevenAccount' :accountNumber='index' :accountType='"eleven"' :key='index+"eleven"'
       :accountID='value.id' :accountPW='value.pw'/>
      <div class='add-account-btn'>
        <v-btn class="mx-2" fab dark @click='addAccount("eleven")'>
          <v-icon dark>mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>

    <eleven-upload/>

  </div>
</div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'

export default {
    name : 'eleven',

    components : {
      loginForm : require('./loginForm.vue').default,
      elevenUpload : require('./elevenUpload.vue').default
    },

    computed : {
      ...mapState([
        'elevenAccount'
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