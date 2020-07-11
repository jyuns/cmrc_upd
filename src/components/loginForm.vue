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
        v-model='tempLoginID'
        label="아이디"
        name="login"
        prepend-icon="mdi-account"
        type="text"
        :disabled="isDisable"
        :value='tempLoginID'
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
    <div>
        <wemep-upload v-if='accountType=="wemep"' :wemepAccountID='tempLoginID' />
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

    components : {
        wemepUpload : require('./wemepUpload').default,
    },

    data: () => ({
        tempLoginID : '',
        tempLoginPW : '',

        isDisable : false,
    }),

    created() {
        // 저장된 계정 초기 선언
        this.tempLoginID = this.accountID
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

            if(!this.tempLoginID) return alert("ID/PW를 입력해주세요");
            if(!this.tempLoginPW) return alert("ID/PW를 입력해주세요");

            let result = await this.LOGIN({
                type : this.accountType,
                loginId : this.tempLoginID,
                loginPassword : this.tempLoginPW,
                loginNum : this. accountNumber,
            })

            if(result == false) this.isDisable = true 
            this.$forceUpdate()

        }
    }
}
</script>