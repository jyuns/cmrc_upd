import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const wemep = require('../components/wemep')
const eleven = require('../components/eleven')

const router = new VueRouter({
    mode : 'history',

    routes : [
        { path : '*', component : wemep.default},
        { path : '/11st', component : eleven.default}, 
    ]
})

export default router