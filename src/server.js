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

    } catch {
        res.end('false')
    }
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
        let loginSession = loginReq.headers['set-cookie'].join(';')

        res.send(loginSession)
    } catch {
        res.send('false')
    }
})

nodeApp.listen(8082, () => {
    console.log('node listen 8082 port')
})