import Vue from 'vue'
import Vuex from 'vuex'

import axios from 'axios'

Vue.use(Vuex)

// 11번가 로그인 암호화
const JSEncrypt = require('../encrypt')
JSEncrypt.default.prototype.setPublic('a650c97fe917f8cc0312541fd682ca221bc19d3e345cd07c241c266aca5d117d14d3f7f322de2282ef67c0aeb7a6eaae3bdff24c3ff661700a7906503cb8b8823c42a07fa5eb46aca7edfe52cabe1f2aa393f55cf52fd5be4316bb6aab39d1d51abfd7bd3d28700e7c1ff8bbeb549632b0b76b5be86a23b39fc8d3e703889189', '10001')

export default new Vuex.Store({
  state: {
    wemepAccount : [''],
    elevenAccount : [''],
  },

  mutations: {
    INIT(state) {
      let tempWemep = localStorage.getItem('wemepAccount')
      let tempEleven = localStorage.getItem('elevenAccount')

      // localStorage init setting
      if(tempWemep == null) localStorage.setItem('wemepAccount', '[]')
      if(tempEleven == null) localStorage.setItem('elevenAccount', '[]')

      tempWemep = localStorage.getItem('wemepAccount')
      tempEleven = localStorage.getItem('elevenAccount')

      // localStorage to JSON Type
      let tempWemepJSON = JSON.parse(tempWemep)
      let tempElevenJSON = JSON.parse(tempEleven)

      state.wemepAccount = tempWemepJSON
      state.elevenAccount = tempElevenJSON
    },
  },
  actions: {
    ADD({state}, payload) {
      if(payload.type == 'wemep')
        return state.wemepAccount.push('')
      else if(payload.type == 'eleven')
        return state.elevenAccount.push('')
    },

    DEL({state}, payload) {
      if(payload.type == 'wemep') {
        state.wemepAccount.splice(payload.num, 1)
        localStorage.setItem('wemepAccount', JSON.stringify(state.wemepAccount))
      }
      else if(payload.type == 'eleven') {
        state.elevenAccount.splice(payload.num, 1)
        localStorage.setItem('elevenAccount', JSON.stringify(state.elevenAccount))
      }
    },

    async LOGIN({state}, payload) {

      let id = payload.loginId
      let pw = payload.loginPassword
      let num = payload.loginNum

      if(payload.type == 'wemep') {

        let result = await axios.post('http://localhost:8082/wemep/login', {id : id, pw : pw})

        if(result.data == false) return alert("ID/PW가 틀렸습니다");

        state.wemepAccount[num] = { id : id, pw : pw, cookie : result.data}

        let storage = localStorage.getItem('wemepAccount')
        let storageJSON = storage == null? [] : JSON.parse(storage)

        let check = 0

        for(let i = 0; i < storageJSON.length; i++) {
          if(storageJSON[i].id == id) check++;
        }

        if(check == 0) {
          storageJSON.push(state.wemepAccount[num])
          localStorage.setItem('wemepAccount', JSON.stringify(storageJSON))
        }

        if(result.data != false) { alert("로그인 성공하였습니다"); return false }
        
      } else if(payload.type == 'eleven') {
        let encryptedID = JSEncrypt.default.prototype.encrypt(id)
        let encryptedPW = JSEncrypt.default.prototype.encrypt(pw)

        let result = await axios.post('http://localhost:8082/11st/login', {encryptedID : encryptedID, encryptedPW : encryptedPW})
        console.log(result.data)
        if(result.data == false) return alert("ID/PW가 틀렸습니다");

        state.elevenAccount[num] = { id : id, pw : pw, cookie : result.data}

        let storage = localStorage.getItem('elevenAccount')
        let storageJSON = storage == null? [] : JSON.parse(storage)

        let check = 0

        for(let i = 0; i < storageJSON.length; i++) {
          if(storageJSON[i].id == id) check++;
        }

        if(check == 0) {
          storageJSON.push(state.elevenAccount[num])
          localStorage.setItem('elevenAccount', JSON.stringify(storageJSON))
        }

        if(result.data != false) { alert("로그인 성공하였습니다"); return false }

      }
    },
    
    async UPLOAD({state}, payload) {
      console.log(payload)
      let id = payload.id
      let files = payload.files

      let tempAccount = state.wemepAccount

      let cookie = ''
      
      tempAccount.forEach( (val) => {
        if(val.id == id) return cookie=val.cookie
      })

      console.log(cookie)
      if(cookie.length == 0) alert('로그인을 다시 진행해 주세요')

      let result = await axios.post('http://localhost:8082/wemep/upload', {id:id, cookie:cookie, files:files})
      console.log(result)
    } 
  },
})
