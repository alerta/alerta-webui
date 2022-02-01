import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

const opts: any = {
  theme: {
    primary: '#3f51b5',
    secondary: '#2196f3',
    accent: '#ffa726'
  },
  iconfont: 'md'
}

Vue.use(Vuetify, opts)

// export default new Vuetify(opts)
