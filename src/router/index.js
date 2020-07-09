import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const wemep = require('../components/wemep')
const eleven = require('../components/eleven')
const notFound = require('../components/notFound')


const router = new VueRouter({
    mode : 'history',

    routes : [
        { path : '', component : wemep.default},
        { path : '/11st', component : eleven.default}, 
        { path : '*', component : notFound.default},
    ]
})

export default router