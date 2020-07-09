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

nodeApp.post('/wemep/upload', async(req, res) => {
    
    let files = req.body.files
    let id = req.body.id
    let cookie = req.body.cookie

    axios.defaults.headers.Cookie = cookie

    let filesKey = Object.keys(files)
    
    for(let i = 0; i < filesKey.length; i++) {
        for(let j = 0; j < files[filesKey[i]].length; j++) {

            let tempFileType = files[filesKey[i]][j].split('.').pop()
            let checkImage = 0
            let checkExcel = 0
            
            if(tempFileType == 'jpg') checkImage++
            if(tempFileType == 'png') checkImage++
            if(tempFileType == 'jpeg') checkImage++
            if(tempFileType == 'gif') checkImage++
            if(tempFileType == 'bmp') checkImage++

            if(tempFileType == 'xlsx') checkExcel++
            if(tempFileType == 'xls') checkExcel++

            if(checkImage > 0) {
                
                try {
                    const image = fs.createReadStream(files[filesKey[i]][j])
            
                    const imageFormData = new FormData()
    
                    imageFormData.append('fileFieldName', 'fileArr')
                    imageFormData.append('fileName', files[filesKey[i]][j].split('/').pop())
                    imageFormData.append('imgKey', 'MultipleTemp')
                    imageFormData.append('baseKeyCd', id)
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
                    
                    
                    console.log(uploadImageReq.data, j)

                } catch(err) {
                    console.log('image', err)
                    res.status(400).end('업로드 실패')
                }

            } else if(checkExcel > 0) {

                try {
                    const excel = fs.createReadStream(files[filesKey[i]][j])

                    const excelFormData = new FormData()
    
                    excelFormData.append('imgKey', 'ProductExcelFile')
                    excelFormData.append('mode', 'upload')
                    excelFormData.append('baseKeyCd', id)
                    excelFormData.append('fileName', 'uploadNaverFile')
                    excelFormData.append('uploadNaverFile', excel)
    
                    let uploadExcelReq = await axios.post('https://wpartner.wemakeprice.com/common/uploadFile.json',
                                                    excelFormData,
                                                    {
                                                        headers : {
                                                            ...excelFormData.getHeaders()
                                                        },
                                                    },
                                                )
                    
                    let excelInfo = uploadExcelReq.data


                    let excelNm = excelInfo.uploadNaverFile[0].original_file
                    let excelUrl = excelInfo.uploadNaverFile[0].upload_file.url                          
                    
                    const registerFormData = new FormData()
    
                    registerFormData.append('excelNm', excelNm)
                    registerFormData.append('excelUrl', excelUrl)
    
                    let registerExcelReq = await axios.post('https://wpartner.wemakeprice.com/product/excel/naver/addProdExcelFile.json',
                                                        registerFormData,
                                                        {
                                                            headers : {
                                                                ...registerFormData.getHeaders()
                                                            }
                                                        }
                                                    )
                    

                } catch(err) {
                    console.log('excel', err.response.data.errors)
                    res.status(400).end('업로드 실패')
                }
            }
        }
    }

    res.status(200).end('업로드 성공')

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

        if(loginHeader.length < 10) return res.end('false')

        let loginSession = loginHeader.join(';')
        axios.defaults.headers.Cookie = loginSession

        let result = await axios.get('http://soffice.11st.co.kr/product/ProductRegAjax.tmall?method=getSendCloseTemplateList')
        
        let templateCode = result.data.split('')

        templateCode.shift()
        templateCode.pop()
        
        let templateCodeJSON = JSON.parse(templateCode.join(''))
        let getTemplateCode = templateCodeJSON['PRODUCT_TEMPLATE']['TMPLT_INFO']['prdInfoTmpltNo']

        res.json({cookie : loginSession, tmpCode : getTemplateCode})

    } catch(err) {
        console.log(err)
        res.end('false')
    }
})

const XLSX = require('xlsx')

nodeApp.post('/11st/uploadCheck', async (req, res) => {

    let path = req.body.path

    console.log(XLSX.readFile(path))

    res.json({
        path : '',
        tempCode : ''
    })
})

nodeApp.post('/11st/upload', async (req, res) => {
    //let files = req.body.files
    let cookie = req.body.cookie

    axios.defaults.headers.Cookie = cookie
    
    try {
        const uploadForm = new FormData()

        uploadForm.append('imageFile', )
        uploadForm.append('excelFile', )
    
        let uploadReq = await axios.post('https://wpartner.wemakeprice.com/common/uploadFile.json',
                                            uploadForm,
                                                {
                                                    headers : {
                                                        ...uploadForm.getHeaders()
                                                    },
                                                },
                                              )    
    
        console.log(uploadReq)
    } catch {
        res.status(400).end('업로드 실패')
    }

    res.end('')
})

nodeApp.listen(8082, () => {
    console.log('node listen 8082 port')
})