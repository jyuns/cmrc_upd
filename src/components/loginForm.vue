<template>
<v-card class="elevation-2">
    <v-toolbar
    dark
    flat
    >
    <v-toolbar-title>{{accountNumber}}. {{accountType}}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn icon large @click="delAccount()">X</v-btn>
    </v-toolbar>
    <v-card-text>
    <v-form>
        <v-text-field
        v-model='loginId'
        label="아이디"
        name="login"
        prepend-icon="mdi-account"
        type="text"
        :disabled="isDisable"
        ></v-text-field>

        <v-text-field
        v-model='loginPassword'
        id="password"
        label="비밀번호"
        name="password"
        prepend-icon="mdi-lock"
        type="password"
        :disabled="isDisable"
        ></v-text-field>
    </v-form>
    </v-card-text>
    <div class='login-wrapper'>
        <v-btn class='login-btn' color='primary' @click="loginAccount()">로그인</v-btn>
    </div>
</v-card>
</template>

<script>

import { mapActions } from 'vuex'

export default {
    props : {
        accountType : String,
        accountNumber : Number,
    },

    data: () => ({
        loginId : '',
        loginPassword : '',
        isDisable : false,
    }),

    methods : {

        ...mapActions([
          'DEL', 'LOGIN'
        ]),

        delAccount() {

            this.DEL({type : this.accountType, num : this.accountNumber})

        },

        async loginAccount() {

            let result = await this.LOGIN({
                type : this.accountType,
                loginId : this.loginId,
                loginPassword : this.loginPassword,
                loginNum : this. accountNumber,
            })

            if(result == false) this.isDisable = true
            
            this.$forceUpdate()

        }
    }
}
</script>