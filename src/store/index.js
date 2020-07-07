import Vue from 'vue'
import Vuex from 'vuex'

import axios from 'axios'

Vue.use(Vuex)

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
      if(payload.type == '위메프')
        return state.wemepAccount.push('')
      else if(payload.type == '11번가')
        return state.elevenAccount.push('')
    },

    DEL({state}, payload) {
      if(payload.type == '위메프') {
        state.wemepAccount.splice(payload.num, 1)
        localStorage.setItem('wemepAccount', JSON.stringify(state.wemepAccount))
      }
      else if(payload.type == '11번가') {
        state.elevenAccount.splice(payload.num, 1)
        localStorage.setItem('elevenAccount', JSON.stringify(state.elevenAccount))
      }
    },

    async LOGIN({state}, payload) {
      console.log(payload)
      let id = payload.loginId
      let pwd = payload.loginPassword
      let num = payload.loginNum

      if(payload.type == '위메프') {

        let result = await axios.post('http://localhost:8082/wemep/login', {id : id, pwd : pwd})
        state.wemepAccount[num] = { id : id, pwd : pwd, cookie : result.data}

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

        if(result.data != false) return false
        
      } else if(payload.type == '11번가') {
        axios.post('http://localhost:8082/11st/login', )
      }
    },
  },
})
