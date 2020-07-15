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
    loading : 0,
    loadingPie : 0,
  },

  mutations: {
    INIT(state) {

      state.loading = 0;
      state.loadingPie = 0;

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

    LOADING(state) {
      state.loading++;
    },

    SET_LOADING(state, payload) {
      state.loadingPie = payload
    },

    INIT_LODING(state) {
      state.loading = 0;
      state.loadingPie = 0;
    }

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

        let result = await axios.post('http://localhost:8083/wemep/login', {id : id, pw : pw})

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

        let result = await axios.post('http://localhost:8083/11st/login', {encryptedID : encryptedID, encryptedPW : encryptedPW})
        
        if(result.data == false) return alert("ID/PW가 틀렸습니다");

        state.elevenAccount[num] = { id : id, pw : pw, cookie : result.data.cookie, tmpCode : result.data.tmpCode}
        
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
    
    async UPLOAD({state, commit}, payload) {

      let files = payload.files
      let type = payload.type

      if(type == 'wemep') {
        let id = payload.id
        let tempAccount = state.wemepAccount

        let cookie = ''
        
        tempAccount.forEach( (val) => {
          if(val.id == id) return cookie=val.cookie
        })
  
        if(cookie.length == 0) return alert('로그인을 다시 진행해 주세요')
  
        try {
          
          let result = await axios.post('http://localhost:8083/wemep/upload', {id:id, cookie:cookie, files:files})

          return alert('성공적으로 업로드 되었습니다\n'
           + '이미지 성공 : ' + result.data.imageSuccess + ' / 이미지 실패 : ' + result.data.imageError
           + '\n 엑셀 성공 : ' + result.data.excelSuccess + ' / 엑셀 실패 : ' + result.data.excelError)
          
        } catch (err) {
          
          return alert(err)

        }} else if (type == 'eleven') {
            
            let tempAccount = state.elevenAccount
            let filesKey = Object.keys(files)

            let loadingPie = 0

            for(let i = 0; i < filesKey.length; i++) {
              for(let j = 0; j < files[filesKey[i]].length; j++) {
                await loadingPie++;
              }
            }
            console.log(loadingPie)
            commit('SET_LOADING', loadingPie)

            let success = 0;
            let failed = 0;

            for(let i = 0; i < filesKey.length; i++) {
              for(let j = 0; j < files[filesKey[i]].length; j++) {
                let tempFilePath = files[filesKey[i]][j]
                let tmpCode = tempFilePath.split('?').pop()

                let cookie = ''

                for(let k = 0; k < tempAccount.length; k++) {
                  if(tempAccount[k].tmpCode == tmpCode) {
                    cookie = await tempAccount[k].cookie
                    break
                  }
                }

                tempFilePath = tempFilePath.replace('?'+tmpCode, '')

                let tempMethodVal = tempFilePath.split('.')
                tempMethodVal.pop()

                let tempFilePathNumber = tempMethodVal.join('')
                tempFilePathNumber = tempFilePathNumber.split('-').pop()

                let tempZipFile = ['1-500', '501-1000', '1001-1500', '1501-2000', '2001-2500', '2501-3000']

                let tempZipFileName = tempZipFile[Math.ceil((Number(tempFilePathNumber)/500) - 1)] + '.zip'
                
                let tempZipFilePath =  tempFilePath.split('\\')
    
                tempZipFilePath.pop()

                try {
                  let zipPath = tempZipFilePath.join('\\') + '\\' + tempZipFileName
                  let excelPath = tempFilePath

                  let result = await axios.post('http://localhost:8083/11st/upload', {zipPath : zipPath, excelPath : excelPath, cookie : cookie})
                  console.log(result.data)
                  if(result.data) success ++
                  else if(!result.data) failed ++

                } catch (err) {
                  console.log(err)
                  alert(err)
                }

                commit('LOADING')

              }
            }

            setTimeout( () => {
              commit('INIT_LODING')
            }, 3000)

            return alert('성공 : ' + success + ' / 실패 : ' + failed)
/**
 *
 *             try {           
 *                for(let i = 0; i < uploadErrorExcel.length; i++) {
                new DOMParser().parseFromString(uploadErrorExcel[i], 'text/html')
                let titleJsonData =  window['myTitleData']
                let jsonData =  window['myData']

                let frm = document.getElementById('uploadErrorExcel')
                document.cookie = state.elevenAccount[0]
                frm.title.value = titleJsonData
                frm.data.value = jsonData

                frm.action = 'http://soffice.11st.co.kr/inventory/InventoryAjaxAction.tmall?method=uploadErrorListToExcel'
                frm.target = '_blank'
                
                frm.submit()
              }

              return alert('성공적으로 업로드 되었습니다\n' + '성공 : ' + result.data.success + ' / 실패 : ' + result.data.error)

            } catch (err) {
              return alert(err)
            }
              */

        }
      },

    async CHECK_TMP_CODE({state}, payload) {
      console.log(state)
      
      let path = payload.path
      let result = await axios.post('http://localhost:8083/11st/uploadCheck', {path : path})
      
      return result.data
    }
  },
})
