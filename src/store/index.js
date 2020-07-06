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

      console.log('start init localstorage')
      console.log(typeof localStorage.getItem('wemepAccount'))
      console.log(localStorage.getItem('elevenAccount'))

      let tempWemep = localStorage.getItem('wemepAccount')
      let tempEleven = localStorage.getItem('elevenAccount')

      if(temp)


      if(tempWemep == null) tempWemep = ['']
      if(tempEleven == null) tempEleven = ['']

      let tempWemepJSON = JSON.parse(tempWemep)

      if(temp)

      let tempWemep = JSON.parse(localStorage.getItem('wemepAccount'))
      let tempEleven = JSON.parse(localStorage.getItem('elevenAccount'))

      if(tempWemep != null) {
        if(tempWemep.length != 0) {
          state.wemepAccount = JSON.parse(tempWemep)
        } else {
          state.wemepAccount = ['']
        }
      }

      if(tempEleven != null) {
        if(tempEleven.length != 0) {
          state.elevenAccount = JSON.parse(tempEleven)
        } else {
          state.elevenAccount = ['']
        }
      }

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
        state.wemepAccount.splice(payload.num-1, 1)
        localStorage.setItem('wemepAccount', JSON.stringify(state.wemepAccount))
      }
      else if(payload.type == '11번가') {
        state.elevenAccount.splice(payload.num-1, 1)
        localStorage.setItem('elevenAccount', JSON.stringify(state.elevenAccount))
      }
    },

    async LOGIN({state}, payload) {
      
      let id = payload.loginId
      let pwd = payload.loginPassword
      let num = payload.loginNum

      if(payload.type == '위메프') {
        let result = await axios.post('http://localhost:8082/wemep/login', {id : id, pwd : pwd})
        
        state.wemepAccount[num-1] = { id : id, pwd : pwd, cookie : result.data}
        
        let local = localStorage.getItem('wemepAccount') == null? [] : JSON.parse(localStorage.getItem('wemepAccount'))
        local.push(state.wemepAccount[num-1])

        localStorage.setItem('wemepAccount', JSON.stringify(local))

        if(result.data != false) return false
        
      } else if(payload.type == '11번가') {
        axios.post('http://localhost:8082/11st/login', )

      }
    }

  },
})
