const express = require('express')
const nodeApp = express()

const cors = require('cors')
const bodyParser = require('body-parser')

nodeApp.use(cors())
nodeApp.use(bodyParser.json({limit:'100mb'}))
nodeApp.use(bodyParser.urlencoded({limit:'100mb', extended:true}))

const axios = require('axios')
axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0'

const FormData = require('form-data')

const getDurationInMilliseconds = (start) => {
    const NS_PER_SEC = 1e9
    const NS_TO_MS = 1e6
    const diff = process.hrtime(start)
  
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
  }

nodeApp.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl} [STARTED]`)
    const start = process.hrtime()
  
    res.on('finish', () => {            
        const durationInMilliseconds = getDurationInMilliseconds (start)
        console.log(`${req.method} ${req.originalUrl} [FINISHED] ${durationInMilliseconds .toLocaleString()} ms`)
    })
  
    res.on('close', () => {
        const durationInMilliseconds = getDurationInMilliseconds (start)
        console.log(`${req.method} ${req.originalUrl} [CLOSED] ${durationInMilliseconds .toLocaleString()} ms`)
    })
  
    next()
})

// 위메프 로그인 암호화
const sha1 = require('js-sha1')

nodeApp.post('/wemep/login', async (req, res) => {
    
    let id = req.body.id
    let pw = req.body.pw

    let date = new Date();
    let millis = date.getMilliseconds();

    let result = await axios.get('https://wpartner.wemakeprice.com/salt.json?_=' + millis)
    let salt = String(result.data.data.salt)

    let substrSalt = salt[1] + salt[4] + salt[8] + salt[12]

    let passwordHash = sha1(substrSalt + sha1(pw)) + substrSalt


    const params = new URLSearchParams()
    
    params.append('userId', id)
    params.append('userPassword', passwordHash)

    try {
        let loginReq = await axios.post('https://wpartner.wemakeprice.com/login.json', params) 
        let loginSession = loginReq.headers['set-cookie'].join(';')
        res.end(loginSession)

    } catch(err) {
        console.log(err)
        res.end('false')
    }
})

const fs = require('fs')
const path = require('path');

nodeApp.post('/wemep/upload', async(req, res) => {

    let folder = req.body.folder
    
    let id = req.body.id
    let cookie = req.body.cookie

    axios.defaults.headers.Cookie = cookie

/**
 *     for(let i = 0; i < folder.length; i++) {

        let directoryPath = path.join(__dirname, folder[i])

        fs.readdir(directoryPath, (err, files) => {
            if(err) {
                return console.log('error', err)
            }

            console.log('-------------', directoryPath,'-------------')

            files.forEach((file) => {
                console.log(file)
            })
        })
    }
 */


/**    for(let i = 0; i < filesKey.length; i++) {
        for(let j = 0; j < files[filesKey].length; j++) {

            let type = files[filesKey][j] // Type Check

            if(type == 'image') {
                const image = fs.createReadStream(files[filesKey][j])

                const imageFormData = new FormData()

                imageFormData.append('fileFieldName', 'fileArr')
                imageFormData.append('fileName', 'test.jpg') // req.body
                imageFormData.append('imgKey', 'MultipleTemp')
                imageFormData.append('baseKeyCd', 'kokorea24n') // req.body
                imageFormData.append('mode', 'upload')
                imageFormData.append('fileArr', image)

                let uploadImageReq = await axios.post('https://wpartner.wemakeprice.com/common/uploadImageAsync.json',
                                                imageFormData,
                                                {
                                                    headers : {
                                                        ...imageFormData.getHeaders()
                                                    },
                                                },
                                            )
                console.log(uploadImageReq)

            } else if(type = 'excel') {
                const excel = fs.createReadStream(files[filesKey][j])

                uploadExcel.append('imgKey', 'ProductExcelFile')
                uploadExcel.append('mode', 'upload')
                uploadExcel.append('baseKeyCd', 'kokorea24n') // req.body
                uploadExcel.append('fileName', 'uploadNaverFile')
                uploadExcel.append('uploadNaverFile', excel)

                const excelFormData = new FormData()

            }

            
            
            axios.post('')
        }
    } */


    // 쿠키 초기화
    axios.defaults.headers.Cookie = ''

    res.send('')


})

nodeApp.post('/11st/login', async (req, res) => {
    let encryptedID = req.body.encryptedID
    let encryptedPW = req.body.encryptedPW

    const params = new URLSearchParams()
    
    params.append('encryptedLoginName', encryptedID)
    params.append('encryptedPassWord', encryptedPW)
    params.append('priority', 92)
    params.append('authMethod', 'login')
    params.append('returnURL', 'http://soffice.11st.co.kr')
    params.append('autoId', 'Y')
    

    try {
        let loginReq = await axios.post('https://login.11st.co.kr/auth/front/selleroffice/logincheck.tmall', params)
        let loginHeader = loginReq.headers['set-cookie']

        if(loginHeader.length < 10) return res.send('false')

        let loginSession = loginHeader.join(';')
        res.send(loginSession)

    } catch(err) {
        console.log(err)
        res.send('false')
    }
})

nodeApp.listen(8082, () => {
    console.log('node listen 8082 port')
})