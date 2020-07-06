import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const home = require('../components/home')
const wemepUpload = require('../components/wemepUpload')
const elevenUpload = require('../components/elevenUpload')
const notFound = require('../components/notFound')


const router = new VueRouter({
    
    mode : 'history',

    routes : [
        { path : '/', component : home.default},
        { path : '/wemep', component : wemepUpload.default},
        { path : '/11st', component : elevenUpload.default},
        { path : '*', component : notFound.default},
    ]

})

export default router