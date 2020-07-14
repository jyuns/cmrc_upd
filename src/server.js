const express = require('express')
const nodeApp = express()

const cors = require('cors')
const bodyParser = require('body-parser')

nodeApp.use(cors())
nodeApp.use(bodyParser.json({limit:'100mb'}))
nodeApp.use(bodyParser.urlencoded({limit:'100mb', extended:true}))

const axios = require('axios')
const http = require('http')
const https = require('https')

//const iconv = require('iconv-lite')
//const jsdom = require('jsdom')

const axiosInstance = axios.create({
    headers:{
        'User-Agent': 'Mozilla/5.0'},
    maxContentLength: 100000000,
    maxBodyLength: 1000000000,
    httpAgent : new http.Agent({keepAlive:true}),
    httpsAgent : new https.Agent({keepAlive:true}),
})


const fs = require('fs')

const logger = require('./logger')

function startUpload(val) {
    let date = new Date().toLocaleString()
    logger.info(date + ' / ' + val + ' 자동 업로드 시작 -----------------------------------------------------------------')   
}

function endUpload(val) {
    logger.info(val + ' 자동 업로드 종료 -----------------------------------------------------------------\n')   
}

function noSuchFileError(val) {
    logger.error(val + ' / [해당 파일을 찾을 수 없습니다]')
}

function noLoginError(val) {
    logger.error( val + ' / [로그인 실패하였습니다]')
}

function uploadError(val) {
    logger.error( val + ' / [업로드 실패하였습니다]')
}

function uploadSuccess(val) {
    logger.info( val + ' / [업로드 성공하였습니다]')
}

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

    let result = await axiosInstance.get('https://wpartner.wemakeprice.com/salt.json?_=' + millis)
    let salt = String(result.data.data.salt)

    let substrSalt = salt[1] + salt[4] + salt[8] + salt[12]

    let passwordHash = sha1(substrSalt + sha1(pw)) + substrSalt


    const params = new URLSearchParams()
    
    params.append('userId', id)
    params.append('userPassword', passwordHash)

    try {
        let loginReq = await axiosInstance.post('https://wpartner.wemakeprice.com/login.json', params) 
        let loginSession = loginReq.headers['set-cookie'].join(';')
        res.end(loginSession)

    } catch(err) {
        console.log(err)
        res.end('false')
    }
})


nodeApp.post('/wemep/upload', async(req, res) => {
    
    // 성공/실패 건수 출력 변수
    let imageSuccess = 0
    let imageError = 0

    let excelSuccess = 0
    let excelError = 0

    startUpload('위메프')
    
    let files = req.body.files
    let id = req.body.id
    let cookie = req.body.cookie

    axiosInstance.defaults.headers.Cookie = cookie

    let filesKey = Object.keys(files)    

    for(let i = 0; i < filesKey.length; i++) {
        if(files[filesKey[i]]['image']) {
            for(let j = 0; j < files[filesKey[i]]['image'].length; j++) {

                let tempImagePath = files[filesKey[i]]['image'][j]

                let fsError = false

                const image = fs.createReadStream(tempImagePath)

                image.on('error', () => {
                    noSuchFileError(tempImagePath)
                    fsError = true
                    return fsError
                })

                if(fsError) { imageError++; continue }

                const imageFormData = new FormData()

                imageFormData.append('fileFieldName', 'fileArr')
                imageFormData.append('imgKey', 'MultipleTemp')
                imageFormData.append('baseKeyCd', id)
                imageFormData.append('mode', 'upload')

                imageFormData.append('fileName', tempImagePath.split('\\').pop())
                imageFormData.append('fileArr', image)

               try {
                    axiosInstance.post('https://wpartner.wemakeprice.com/common/uploadImageAsync.json',
                                    imageFormData,
                                    {
                                        headers : {
                                            ...imageFormData.getHeaders()
                                        },
                                    },
                                )

                    uploadSuccess(tempImagePath); imageSuccess++;
                } catch(err) {
                    console.log(err)
                    uploadError(tempImagePath); imageError++;
                }
            }
        }


        if(files[filesKey[i]]['excel']) {
            for(let j = 0; j < files[filesKey[i]]['excel'].length; j++) {
                
                let tempExcelPath = files[filesKey[i]]['excel'][j]

                let fsError = false

                const excel = fs.createReadStream(tempExcelPath)

                excel.on('error', () => {
                    noSuchFileError(tempExcelPath)
                    fsError = true
                    return fsError
                })

                if(fsError) { excelError++; continue }
                
                const excelFormData = new FormData()

                excelFormData.append('imgKey', 'ProductExcelFile')
                excelFormData.append('mode', 'upload')
                excelFormData.append('baseKeyCd', id)
                excelFormData.append('fileName', 'uploadNaverFile')
                excelFormData.append('uploadNaverFile', excel)
                

                try {
                    // create excel url
                    let uploadExcelReq = await axiosInstance.post('https://wpartner.wemakeprice.com/common/uploadFile.json',
                                                    excelFormData,
                                                    {
                                                        headers : {
                                                            ...excelFormData.getHeaders()
                                                        },
                                                    },
                                                )
                    

                    // upload excel url
                    let excelInfo = uploadExcelReq.data
                    let excelNm = excelInfo.uploadNaverFile[0].original_file
                    let excelUrl = excelInfo.uploadNaverFile[0].upload_file.url

                    const registerFormData = new FormData()
                    registerFormData.append('excelNm', excelNm)
                    registerFormData.append('excelUrl', excelUrl)

                    let registExcelReq = await axiosInstance.post('https://wpartner.wemakeprice.com/product/excel/naver/addProdExcelFile.json',
                                    registerFormData,
                                    {
                                        headers : {
                                            ...registerFormData.getHeaders()
                                        },
                                    }
                                )

                    uploadSuccess(tempExcelPath); excelSuccess++;

                } catch (err) {
                    //let detail = err.response.data.errors[0].detail
                    //console.log(err)
                    uploadError(tempExcelPath); excelError++;
                }
            }
        }
    }

    endUpload('위메프')

    res.json({
        imageSuccess : imageSuccess,
        imageError : imageError,
        excelSuccess : excelSuccess,
        excelError : excelError,
    })
})

nodeApp.post('/11st/login', async (req, res) => {

    axiosInstance.defaults.headers.Cookie = ''

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
        let loginReq = await axiosInstance.post('https://login.11st.co.kr/auth/front/selleroffice/logincheck.tmall', params)
        let loginHeader = loginReq.headers['set-cookie']

        if(loginHeader.length < 10) return res.end('false')

        let loginSession = loginHeader.join(';')
        axiosInstance.defaults.headers.Cookie = loginSession

        let result = await axiosInstance.get('http://soffice.11st.co.kr/product/ProductRegAjax.tmall?method=getSendCloseTemplateList')
        
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
const { json } = require('body-parser')

nodeApp.post('/11st/uploadCheck', async (req, res) => {

    let path = req.body.path

    let wb = XLSX.readFile(path)
    let wsName = wb.SheetNames[0]
    let ws = wb.Sheets[wsName]
    let excelTempCode = ws['BJ3'].v

    res.end(path + '?' + excelTempCode)
})

nodeApp.post('/11st/upload', async (req, res) => {

    // 성공/실패 건수 출력 변수
    let success = 0
    let error = 0

    let id = req.body.id
    let files = req.body.files
    let filesKey = Object.keys(files)

    startUpload('11번가')

    for(let i = 0; i < filesKey.length; i++) {
        for(let j = 0; j < files[filesKey[i]].length; j++) {

            let tempFilePath = files[filesKey[i]][j]
            let tmpCode = tempFilePath.split('?').pop()

            let cookie = ''

            for(let k = 0; k < id.length; k ++) {
                if(id[k].tmpCode == tmpCode) {
                    cookie = await id[k].cookie
                    break
                }
            }
            
            // 먼저 로그인 검사 이후 값 넘기는 메소드 짜기
            if(cookie.length == 0) {
                noLoginError(files[filesKey[i]][j])
                continue;
            }

            axiosInstance.defaults.headers.Cookie = cookie

            // zip 파일 경로 찾기
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
            // upload method 진행하기

                let fsError = false

                const zip = fs.createReadStream(tempZipFilePath.join('\\') + '\\' + tempZipFileName)
                const excel = fs.createReadStream(tempFilePath)

                zip.on('error', () => {
                    noSuchFileError(tempZipFilePath.join('\\') + '\\' + tempZipFileName)
                    fsError = true
                    return fsError
                })

                excel.on('error', () => {
                    noSuchFileError(tempFilePath)
                    fsError = true
                    return fsError
                })

                if(fsError) { error++; continue }

                const uploadForm = new FormData()
                
                uploadForm.append('imageFile', zip)
                uploadForm.append('excelFile', excel)
                
                let result = await axiosInstance.post('http://soffice.11st.co.kr/product/BulkProductReg.tmall?method=uploadBulkProduct',
                            uploadForm,
                                {
                                    headers : {
                                        'Content-Type' : uploadForm.getHeaders()['content-type'] + '; charset=euc-kr'
                                    },
                                    responseType: 'arraybuffer',
                                    responseEncoding: 'binary'
                                },
                            )

/**                
 * let utf8Text = iconv.decode(result.data, 'euc-kr')
 * let dom = new jsdom.JSDOM(utf8Text)
 * dom.window['myData'] */

                uploadSuccess(tempFilePath); success++
                        
            } catch(err) {
                console.log(err)
                uploadError(tempFilePath); error++
            }    
        }
    }

    endUpload('11번가')

    res.json({
        success : success,
        error : error,
    })
})

nodeApp.listen(8083, () => {
    console.log('node listen 8083 port')
})