
(async() => {
    const axios = require('axios')

let getKey = await axios.get('https://www.11st.co.kr/js/common/rsa.js')

let key = await getKey.data.split("getKeys('")[1].split(",")[1].split("'")[1]


console.log(pro)

})()