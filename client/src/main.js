import App from './App.vue'
import { createApp } from 'vue'

// Font Awesome is used for displaying icons
/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
/* import specific icons */
import { faFileArrowUp } from '@fortawesome/free-solid-svg-icons'

// Import the components for each route (or "page")
import HomePage from './routes/HomePage.vue'
import UploadPage from './routes/UploadPage.vue'
import ConnectPage from './routes/ConnectPage.vue'
import ModelPage from './routes/ModelPage.vue'
import AboutPage from './routes/AboutPage.vue'

// Import vue router for having multiple routes (or "pages")
const VueRouter = require('vue-router')

// Each route should map to a component
const routes = [
    { 
        path: '/',
        component: HomePage
    },
    {
        path: '/upload',
        component: UploadPage,
    },
    {
        path: '/connect',
        component: ConnectPage,
    },
    {
        path: '/model',
        component: ModelPage
    },
    {
        path: '/about',
        component: AboutPage
    }
]

// Create the router instance and pass the `routes` option
const router = VueRouter.createRouter({
    // Provide the history implementation to use. We are using the hash history for simplicity here.
    history: VueRouter.createWebHashHistory(),
    routes, // short for `routes: routes`
})

const app = createApp(App)

// Add icons to the library
library.add(faFileArrowUp)

// Add font awesome icon component
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(router)
app.mount('#app')