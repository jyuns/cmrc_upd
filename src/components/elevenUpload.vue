<template>
<div @click='test()'>
  
      <v-alert dense text type="success" style="margin: 12px;" v-if='loadingPie>0'> {{loading}}/{{loadingPie}} </v-alert>    

  <div class='drop-wrapper' @dragover.prevent @drop.stop.prevent="dropFile">
    <div class='drop-zone' v-if='!Object.keys(files).length'>
      <img :src='require("../assets/upload.svg")' style='width:42px; margin-bottom:8px;' />
      폴더나 파일을 드랍해주세요
    </div>

    <div style='overflow: auto;height: 300px;' v-else>
      
      <div class='drop-header'>
        <span>폴더 {{Object.keys(files).length}}개</span>
        <div>
          <v-btn depressed small color="primary" @click='upload()' style='margin-right:12px;' :disabled="disabledUploadBtn">업로드</v-btn>
          <v-btn depressed small color="error" @click='reset()' :disabled="disabledUploadBtn" >취소</v-btn>
        </div>
      </div>

      <v-divider style='margin:18px 0px;' />
      
      <div v-for='(value, index) in Object.keys(files)' :key='"filelist"+value+index' style='font-size: 12px;'>
        {{value}}
      </div>
    </div>
  </div>
<!--
  <form id='uploadErrorExcel'>
    <input type='hidden' name='title' value>
    <input type='hidden' name='data' value>
  </form>
-->
</div>
</template>
<script>

import { mapState, mapActions } from 'vuex'

export default {
  name : 'elevenUpload',

  props : {
      elevenAccountID : String,
  },

  data: () => ({
      files : {},
      disabledUploadBtn : false,
  }),

  mounted() {
    setInterval(() => {
      this.$forceUpdate()
    }, 1500)
  },

  computed : {
    ...mapState([
      'loading','loadingPie'
    ])
  },

  methods : {
    ...mapActions([
      'UPLOAD', 'CHECK_TMP_CODE'
    ]),

    test() {
      console.log(this.files)
    },

    async upload() {
        console.log('업로드 요청 시작')
        this.disabledUploadBtn = true

        let result = await this.UPLOAD({
          files : this.files,
          type : 'eleven',
        })

        if(!result) {this.disabledUploadBtn = false}
    },

    reset() {
      this.files = {}
    },
      
    async dropFile(e) {
      e.preventDefault()
      e.stopPropagation()

      let items = e.dataTransfer.items;
      
      for (let i=0; i<items.length; i++) {
        
          let item = items[i].webkitGetAsEntry();
          
          if (item) {
            await this.readFolder(item);
          }
      }
    },

    readFolder(item) {
      
      let self = this

      if(item.isFile) {
        item.file( async (file) => {
          let tempFilePath = file.path.split('\\')
          tempFilePath.pop()
          tempFilePath = tempFilePath.join('\\') + '\\'

          let tempFileType = file.path.split('.').pop()
          tempFileType = tempFileType.toLowerCase()

          if(tempFileType == 'xls') {
            if(!self.files[tempFilePath]) self.files[tempFilePath] = []
            let modifiedFilePath = await this.CHECK_TMP_CODE({path : file.path})
            if(self.files[tempFilePath].indexOf(file.path) == -1) return await self.files[tempFilePath].push(modifiedFilePath)
          }
        }) 
      }

      if (item.isDirectory) {

        let dirReader = item.createReader()
        
        let fnReadEntries = (function() {
          return function (entries) {
            entries.forEach( function (entry) {
              self.readFolder(entry)
            })
            if(entries.length > 0) {
              dirReader.readEntries(fnReadEntries)
            }
          }
        })()

        dirReader.readEntries(fnReadEntries)
      }
    },
    }
}
</script>

<style>

</style>