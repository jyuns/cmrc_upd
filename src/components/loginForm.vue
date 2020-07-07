<template>
<v-card class="elevation-2">
    <v-toolbar
    dark
    flat
    >
    <v-toolbar-title>{{accountNumber + 1}}. {{accountType}}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn icon large @click="delAccount()">X</v-btn>
    </v-toolbar>
    <v-card-text>
    <v-form>
        <v-text-field
        v-model='tempLoginId'
        label="아이디"
        name="login"
        prepend-icon="mdi-account"
        type="text"
        :disabled="isDisable"
        :value='tempLoginId'
        ></v-text-field>

        <v-text-field
        v-model='tempLoginPW'
        id="password"
        label="비밀번호"
        name="password"
        prepend-icon="mdi-lock"
        type="password"
        :disabled="isDisable"
        :value='tempLoginPW'
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
        accountID : String,
        accountPW : String,
    },

    data: () => ({
        tempLoginId : '',
        tempLoginPW : '',

        isDisable : false,
    }),

    mounted() {
        this.tempLoginId = this.accountID
        this.tempLoginPW = this.accountPW
    },

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
                loginId : this.tempLoginId,
                loginPassword : this.tempLoginPW,
                loginNum : this. accountNumber,
            })

            if(result == false) this.isDisable = true
            
            this.$forceUpdate()

        }
    }
}
</script>